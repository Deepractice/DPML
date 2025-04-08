import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Element, NodeType } from '../../../src/types/node';
import { TagProcessor } from '../../../src/transformer/interfaces/tagProcessor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { DefaultTagProcessorRegistry } from '../../../src/transformer/tagProcessors/defaultTagProcessorRegistry';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { TagProcessorVisitor } from '../../../src/transformer/visitors/tagProcessorVisitor';

describe('标签处理器扩展机制', () => {
  // 创建一个TransformContext
  const createMockContext = (): TransformContext => {
    // 创建一个最小化的文档
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };

    // 创建上下文管理器
    const contextManager = new ContextManager();
    
    // 返回根上下文
    return contextManager.createRootContext(document, {});
  };

  // 创建测试元素辅助函数
  const createTestElement = (tagName: string, attributes: Record<string, string> = {}): Element => {
    return {
      type: NodeType.ELEMENT,
      tagName,
      attributes,
      children: [],
      position: { 
        start: { line: 0, column: 0, offset: 0 }, 
        end: { line: 0, column: 0, offset: 0 } 
      }
    };
  };

  let registry: DefaultTagProcessorRegistry;
  let visitor: TagProcessorVisitor;
  let context: TransformContext;

  beforeEach(() => {
    registry = new DefaultTagProcessorRegistry();
    visitor = new TagProcessorVisitor(registry);
    context = createMockContext();
  });

  describe('自定义标签处理器注册', () => {
    it('应该能动态注册自定义标签处理器', async () => {
      // 创建自定义处理器
      const customProcessor: TagProcessor = {
        canProcess: (element) => element.tagName === 'custom',
        process: (element, context) => ({
          ...element,
          meta: {
            ...element.meta,
            customProcessed: true
          }
        }),
        priority: 100
      };

      // 动态注册处理器
      registry.registerProcessor('custom', customProcessor);

      // 创建测试元素
      const element = createTestElement('custom');

      // 执行访问
      const result = await visitor.visitElement(element, context);

      // 验证
      expect(result.meta).toBeDefined();
      expect(result.meta?.customProcessed).toBe(true);
    });

    it('应该支持自定义处理器的优先级', async () => {
      // 创建多个处理器，优先级不同
      const processor1: TagProcessor = {
        canProcess: () => true,
        process: (element: Element, context: TransformContext) => {
          // 添加处理器信息，保留之前其他处理器的结果
          return {
            ...element,
            meta: {
              ...element.meta,
              processOrder: [...(element.meta?.processOrder || []), 'processor1']
            }
          };
        },
        priority: 10
      };

      const processor2: TagProcessor = {
        canProcess: () => true,
        process: (element: Element, context: TransformContext) => {
          // 添加处理器信息，保留之前其他处理器的结果
          return {
            ...element,
            meta: {
              ...element.meta,
              processOrder: [...(element.meta?.processOrder || []), 'processor2']
            }
          };
        },
        priority: 20
      };

      // 注册处理器（注意顺序）
      registry.registerProcessor('priority-test', processor1);
      registry.registerProcessor('priority-test', processor2);

      // 创建测试元素
      const element = createTestElement('priority-test');

      // 执行访问
      const result = await visitor.visitElement(element, context);

      // 验证 - 优先级高的处理器先执行
      expect(result.meta).toBeDefined();
      expect(result.meta?.processOrder).toEqual(['processor2', 'processor1']); // 高优先级的处理器先执行
    });

    it('应该能够注册通配符处理器', async () => {
      // 创建通配符处理器
      const wildcardProcessor: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            wildcardProcessed: true
          }
        }),
        priority: 5
      };

      // 注册通配符处理器
      registry.registerWildcardProcessor(wildcardProcessor);

      // 创建几个不同标签的元素
      const element1 = createTestElement('test1');
      const element2 = createTestElement('test2');
      const element3 = createTestElement('test3');

      // 执行访问
      const result1 = await visitor.visitElement(element1, context);
      const result2 = await visitor.visitElement(element2, context);
      const result3 = await visitor.visitElement(element3, context);

      // 验证所有元素都被通配符处理器处理
      expect(result1.meta?.wildcardProcessed).toBe(true);
      expect(result2.meta?.wildcardProcessed).toBe(true);
      expect(result3.meta?.wildcardProcessed).toBe(true);
    });

    it('应该支持为一组标签注册同一个处理器', async () => {
      // 创建一个处理器
      const groupProcessor: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            groupProcessed: true
          }
        })
      };

      // 为一组标签注册同一处理器
      registry.registerProcessorForTags(['group1', 'group2', 'group3'], groupProcessor);

      // 创建测试元素
      const element1 = createTestElement('group1');
      const element2 = createTestElement('group2');
      const element3 = createTestElement('group3');
      const element4 = createTestElement('other');

      // 执行访问
      const result1 = await visitor.visitElement(element1, context);
      const result2 = await visitor.visitElement(element2, context);
      const result3 = await visitor.visitElement(element3, context);
      const result4 = await visitor.visitElement(element4, context);

      // 验证
      expect(result1.meta?.groupProcessed).toBe(true);
      expect(result2.meta?.groupProcessed).toBe(true);
      expect(result3.meta?.groupProcessed).toBe(true);
      expect(result4.meta?.groupProcessed).toBeUndefined();
    });
  });

  describe('处理器条件判断机制', () => {
    it('应该根据元素属性决定是否处理', async () => {
      // 创建一个带条件判断的处理器
      const conditionalProcessor: TagProcessor = {
        canProcess: (element) => 
          element.tagName === 'conditional' && 
          element.attributes['data-process'] === 'true',
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            conditionalProcessed: true
          }
        })
      };

      // 注册处理器
      registry.registerProcessor('conditional', conditionalProcessor);

      // 创建符合条件和不符合条件的元素
      const matchElement = createTestElement('conditional', { 'data-process': 'true' });
      const nonMatchElement = createTestElement('conditional', { 'data-process': 'false' });

      // 执行访问
      const result1 = await visitor.visitElement(matchElement, context);
      const result2 = await visitor.visitElement(nonMatchElement, context);

      // 验证
      expect(result1.meta?.conditionalProcessed).toBe(true);
      expect(result2.meta?.conditionalProcessed).toBeUndefined();
    });

    it('应该基于上下文变量决定是否处理', async () => {
      // 创建一个基于上下文变量的条件处理器
      const contextAwareProcessor: TagProcessor = {
        canProcess: (element: Element) => {
          return element.tagName === 'context-aware';
        },
        process: (element: Element, context: TransformContext) => {
          // 在 process 方法内部检查上下文变量
          if (context.variables['enableProcessor'] === true) {
            return {
              ...element,
              meta: {
                ...element.meta,
                contextAwareProcessed: true
              }
            };
          }
          return element;
        }
      };

      // 注册处理器
      registry.registerProcessor('context-aware', contextAwareProcessor);

      // 创建测试元素
      const element = createTestElement('context-aware');

      // 创建两个不同的上下文
      const context1 = createMockContext();
      context1.variables['enableProcessor'] = true;

      const context2 = createMockContext();
      context2.variables['enableProcessor'] = false;

      // 执行访问
      const result1 = await visitor.visitElement(element, context1);
      const result2 = await visitor.visitElement(element, context2);

      // 验证
      expect(result1.meta?.contextAwareProcessed).toBe(true);
      expect(result2.meta?.contextAwareProcessed).toBeUndefined();
    });
  });

  describe('处理器链扩展机制', () => {
    it('应该支持处理器链的条件中断', async () => {
      // 创建处理器链
      const processor1: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            step1: true
          }
        }),
        priority: 30
      };

      const processor2: TagProcessor = {
        canProcess: (element) => {
          // 检查元素是否有特定标记，决定是否继续
          return element.meta?.continueChain === true;
        },
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            step2: true
          }
        }),
        priority: 20
      };

      const processor3: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            step3: true
          }
        }),
        priority: 10
      };

      // 注册处理器
      registry.registerProcessor('chain-test', processor1);
      registry.registerProcessor('chain-test', processor2);
      registry.registerProcessor('chain-test', processor3);

      // 创建测试元素 - 一个继续执行链，一个中断链
      const continueElement = createTestElement('chain-test');
      continueElement.meta = { continueChain: true };

      const breakElement = createTestElement('chain-test');
      breakElement.meta = { continueChain: false };

      // 执行访问
      const result1 = await visitor.visitElement(continueElement, context);
      const result2 = await visitor.visitElement(breakElement, context);

      // 验证
      expect(result1.meta?.step1).toBe(true);
      expect(result1.meta?.step2).toBe(true);
      expect(result1.meta?.step3).toBe(true);

      expect(result2.meta?.step1).toBe(true);
      expect(result2.meta?.step2).toBeUndefined();
      expect(result2.meta?.step3).toBe(true); // 第三个处理器仍然执行，因为它不检查条件
    });

    it('应该支持处理器链中的数据转换和传递', async () => {
      // 创建具有数据转换的处理器链
      const initialProcessor: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            data: 5
          }
        }),
        priority: 30
      };

      const doubleProcessor: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            data: (element.meta?.data || 0) * 2
          }
        }),
        priority: 20
      };

      const addProcessor: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            data: (element.meta?.data || 0) + 10
          }
        }),
        priority: 10
      };

      // 注册处理器
      registry.registerProcessor('transform-test', initialProcessor);
      registry.registerProcessor('transform-test', doubleProcessor);
      registry.registerProcessor('transform-test', addProcessor);

      // 创建测试元素
      const element = createTestElement('transform-test');

      // 执行访问
      const result = await visitor.visitElement(element, context);

      // 验证 (5 * 2 + 10 = 20)
      expect(result.meta?.data).toBe(20);
    });

    it('应该支持动态添加和移除处理器', async () => {
      // 创建处理器
      const processor1: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            processor1: true
          }
        })
      };

      const processor2: TagProcessor = {
        canProcess: () => true,
        process: (element) => ({
          ...element,
          meta: {
            ...element.meta,
            processor2: true
          }
        })
      };

      // 注册处理器
      registry.registerProcessor('dynamic-test', processor1);

      // 创建测试元素
      const element = createTestElement('dynamic-test');

      // 第一次执行
      const result1 = await visitor.visitElement(element, context);

      // 动态添加第二个处理器
      registry.registerProcessor('dynamic-test', processor2);

      // 第二次执行
      const result2 = await visitor.visitElement(element, context);

      // 移除所有处理器
      registry.removeProcessors('dynamic-test');

      // 第三次执行
      const result3 = await visitor.visitElement(element, context);

      // 验证
      expect(result1.meta?.processor1).toBe(true);
      expect(result1.meta?.processor2).toBeUndefined();

      expect(result2.meta?.processor1).toBe(true);
      expect(result2.meta?.processor2).toBe(true);

      expect(result3.meta?.processor1).toBeUndefined();
      expect(result3.meta?.processor2).toBeUndefined();
    });
  });
}); 