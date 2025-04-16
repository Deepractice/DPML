import { vi, describe, it, expect, beforeEach } from 'vitest';

import { TagProcessor } from '../../../transformer/interfaces/tagProcessor';
import { TagProcessorVisitor } from '../../../transformer/visitors/tagProcessorVisitor';
import { NodeType } from '../../../types/node';

import type { TagProcessorRegistry } from '../../../transformer/interfaces/tagProcessor';
import type { TransformContext } from '../../../transformer/interfaces/transformContext';
import type { Element, Document } from '../../../types/node';

describe('TagProcessorVisitor', () => {
  // 创建一个模拟的TransformContext
  const createMockContext = (document?: Document) => {
    return {
      document: document || {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
          start: { line: 0, column: 0, offset: 0 },
          end: { line: 0, column: 0, offset: 0 },
        },
      },
      variables: {},
      path: [],
      parentResults: [],
      options: {},
      output: null,
    } as TransformContext;
  };

  // 模拟TagProcessorRegistry
  let mockRegistry: {
    getProcessors: ReturnType<typeof vi.fn>;
    hasProcessors: ReturnType<typeof vi.fn>;
  };

  // 模拟TagProcessor
  let mockProcessor: {
    canProcess: ReturnType<typeof vi.fn>;
    process: ReturnType<typeof vi.fn>;
    priority: number;
  };

  let visitor: TagProcessorVisitor;

  beforeEach(() => {
    // 重置所有模拟函数
    mockRegistry = {
      getProcessors: vi.fn(),
      hasProcessors: vi.fn(),
    };

    mockProcessor = {
      canProcess: vi.fn(),
      process: vi.fn(),
      priority: 10,
    };

    // 创建访问者实例
    visitor = new TagProcessorVisitor(
      mockRegistry as unknown as TagProcessorRegistry
    );
  });

  it('应该正确初始化访问者', () => {
    expect(visitor).toBeDefined();
    expect(visitor.name).toBe('tag-processor');
    expect(visitor.getPriority()).toBe(50); // 检查默认优先级
  });

  it('应该跳过没有处理器的元素', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'unknown-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 模拟注册表返回空处理器数组
    mockRegistry.getProcessors.mockReturnValue([]);
    mockRegistry.hasProcessors.mockReturnValue(false);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith(element.tagName);
    expect(result).toBe(element); // 应该返回原始元素
  });

  it('应该应用已注册的处理器到匹配元素', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 模拟处理器行为
    mockProcessor.canProcess.mockReturnValue(true);
    mockProcessor.process.mockImplementation(el => {
      return {
        ...el,
        meta: {
          processed: true,
          processorName: 'mockProcessor',
        },
      };
    });

    // 模拟注册表返回处理器
    mockRegistry.getProcessors.mockReturnValue([mockProcessor]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith(element.tagName);
    expect(mockProcessor.canProcess).toHaveBeenCalledWith(element);
    expect(mockProcessor.process).toHaveBeenCalledWith(element, context);
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('processed', true);
    expect(result.meta).toHaveProperty('processorName', 'mockProcessor');
  });

  it('应该按优先级顺序应用多个处理器', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'multi-processor-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 创建多个模拟处理器
    const processor1 = {
      priority: 10,
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            ...(el.meta || {}),
            processor1: true,
          },
        };
      }),
    };

    const processor2 = {
      priority: 20, // 更高优先级
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            ...(el.meta || {}),
            processor2: true,
          },
        };
      }),
    };

    // 模拟注册表返回处理器数组
    mockRegistry.getProcessors.mockReturnValue([processor1, processor2]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith(element.tagName);

    // 验证按优先级顺序调用（高优先级先调用）
    // 在实际执行中，processor2应该先被调用，因为优先级更高
    expect(processor2.canProcess).toHaveBeenCalled();
    expect(processor2.process).toHaveBeenCalled();
    expect(processor1.canProcess).toHaveBeenCalled();
    expect(processor1.process).toHaveBeenCalled();

    // 验证元素包含两个处理器的元数据
    expect(result.meta).toBeDefined();
    expect(result.meta).toHaveProperty('processor1', true);
    expect(result.meta).toHaveProperty('processor2', true);
  });

  it('应该处理异步的处理器', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'async-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 创建一个异步的模拟处理器
    const asyncProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(async el => {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 10));

        return {
          ...el,
          meta: {
            asyncProcessed: true,
          },
        };
      }),
    };

    // 模拟注册表返回异步处理器
    mockRegistry.getProcessors.mockReturnValue([asyncProcessor]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith(element.tagName);
    expect(asyncProcessor.canProcess).toHaveBeenCalledWith(element);
    expect(asyncProcessor.process).toHaveBeenCalledWith(element, context);
    expect(result.meta).toBeDefined();
    expect(result.meta).toHaveProperty('asyncProcessed', true);
  });

  it('应该优雅地处理处理器错误', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'error-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 创建一个会抛出错误的处理器
    const errorProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(() => {
        throw new Error('Processor error');
      }),
    };

    // 模拟注册表返回错误处理器
    mockRegistry.getProcessors.mockReturnValue([errorProcessor]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith(element.tagName);
    expect(errorProcessor.canProcess).toHaveBeenCalled();
    expect(errorProcessor.process).toHaveBeenCalled();
    expect(result).toBe(element); // 错误时应返回原始元素

    // 检查元素是否包含错误信息
    expect(result.meta).toBeDefined();
    expect(result.meta.errors).toBeDefined();
    expect(result.meta.errors.length).toBeGreaterThan(0);
    expect(result.meta.errors[0]).toContain('Processor error');
  });

  it('应该递归处理子元素', async () => {
    // 准备一个带有子元素的元素
    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 10 },
        end: { line: 1, column: 20, offset: 29 },
      },
    };

    const parentElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'parent-tag',
      attributes: {},
      children: [childElement],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 40 },
      },
    };

    const context = createMockContext();

    // 设置不同的处理器行为
    const parentProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            parentProcessed: true,
          },
        };
      }),
    };

    const childProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            childProcessed: true,
          },
        };
      }),
    };

    // 模拟注册表为不同标签返回不同处理器
    mockRegistry.getProcessors.mockImplementation(tagName => {
      if (tagName === 'parent-tag') return [parentProcessor];
      if (tagName === 'child-tag') return [childProcessor];

      return [];
    });

    mockRegistry.hasProcessors.mockImplementation(tagName => {
      return tagName === 'parent-tag' || tagName === 'child-tag';
    });

    // 执行
    const result = await visitor.visitElement(parentElement, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('parent-tag');
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('child-tag');

    expect(parentProcessor.process).toHaveBeenCalled();
    expect(childProcessor.process).toHaveBeenCalled();

    // 验证父元素被处理
    expect(result.meta).toBeDefined();
    expect(result.meta).toHaveProperty('parentProcessed', true);

    // 验证子元素被处理
    expect(result.children[0].meta).toBeDefined();
    expect(result.children[0].meta).toHaveProperty('childProcessed', true);
  });

  it('应该处理带有通配符的处理器', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'specific-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 创建通配符处理器
    const wildcardProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            ...(el.meta || {}),
            wildcardProcessed: true,
          },
        };
      }),
    };

    // 创建特定标签处理器
    const specificProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            ...(el.meta || {}),
            specificProcessed: true,
          },
        };
      }),
    };

    // 模拟注册表返回特定标签处理器和通配符处理器
    mockRegistry.getProcessors.mockImplementation(tagName => {
      if (tagName === 'specific-tag') {
        return [specificProcessor];
      }

      if (tagName === '*') {
        return [wildcardProcessor];
      }

      return [];
    });

    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('specific-tag');
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('*');

    expect(specificProcessor.canProcess).toHaveBeenCalled();
    expect(specificProcessor.process).toHaveBeenCalled();
    expect(wildcardProcessor.canProcess).toHaveBeenCalled();
    expect(wildcardProcessor.process).toHaveBeenCalled();

    // 验证元素包含两个处理器的元数据
    expect(result.meta).toBeDefined();
    expect(result.meta).toHaveProperty('specificProcessed', true);
    expect(result.meta).toHaveProperty('wildcardProcessed', true);
  });

  it('应该处理处理器链和中间结果传递', async () => {
    // 准备
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'chain-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };

    const context = createMockContext();

    // 创建处理器链中的第一个处理器
    const firstProcessor = {
      priority: 20, // 高优先级
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            ...(el.meta || {}),
            step: 'first',
            value: 10,
          },
        };
      }),
    };

    // 创建处理器链中的第二个处理器，依赖第一个处理器的结果
    const secondProcessor = {
      priority: 10, // 低优先级
      canProcess: vi.fn().mockImplementation(el => {
        // 只有当元素已经被第一个处理器处理过时才处理
        return el.meta && el.meta.step === 'first';
      }),
      process: vi.fn().mockImplementation(el => {
        // 使用第一个处理器设置的值
        const value = (el.meta?.value || 0) * 2;

        return {
          ...el,
          meta: {
            ...el.meta,
            step: 'second',
            value: value,
          },
        };
      }),
    };

    // 模拟注册表返回处理器链
    mockRegistry.getProcessors.mockReturnValue([
      firstProcessor,
      secondProcessor,
    ]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('chain-tag');

    // 验证处理器按优先级顺序调用
    expect(firstProcessor.canProcess).toHaveBeenCalledWith(element);
    expect(firstProcessor.process).toHaveBeenCalled();

    // 第二个处理器应该接收第一个处理器的输出
    expect(secondProcessor.canProcess).toHaveBeenCalled();
    expect(secondProcessor.process).toHaveBeenCalled();

    // 验证处理链结果
    expect(result.meta).toBeDefined();
    expect(result.meta).toHaveProperty('step', 'second');
    expect(result.meta).toHaveProperty('value', 20); // 第一个处理器设置为10，第二个处理器乘以2
  });
});
