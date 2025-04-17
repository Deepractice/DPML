import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ContextManager } from '../../../transformer/context/contextManager';
import { SemanticTagVisitor } from '../../../transformer/visitors/semanticTagVisitor';
import { NodeType } from '../../../types/node';

import type { ProcessedDocument } from '../../../processor/interfaces/processor';
import type { TagProcessorRegistry } from '../../../transformer/interfaces/tagProcessor';
import type { TransformContext } from '../../../transformer/interfaces/transformContext';

describe('SemanticTagVisitor', () => {
  let visitor: SemanticTagVisitor;
  let contextManager: ContextManager;
  let mockRegistry: TagProcessorRegistry;

  // 创建测试上下文
  const createContext = (document: ProcessedDocument): TransformContext => {
    return contextManager.createRootContext(document, {
      visitors: [],
    });
  };

  beforeEach(() => {
    // 创建模拟的标签处理器注册表
    mockRegistry = {
      getProcessors: vi.fn(),
      registerProcessor: vi.fn(),
      hasProcessors: vi.fn(),
    };

    visitor = new SemanticTagVisitor(mockRegistry);
    contextManager = new ContextManager();
  });

  it('应该具有正确的名称和默认优先级', () => {
    expect(visitor.name).toBe('semantic-tag');
    expect(visitor.getPriority()).toBe(40); // 假设优先级为40
  });

  it('应该处理有标签处理器的元素', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: { id: 'test1' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 30 },
      },
    };

    const context = createContext(document);

    // 模拟处理器
    const mockProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        // 模拟处理过程，添加语义标记
        return {
          ...el,
          meta: {
            ...el.meta,
            semantic: {
              type: 'special',
              role: 'example',
            },
          },
        };
      }),
      priority: 10,
    };

    // 设置模拟注册表返回模拟处理器
    mockRegistry.getProcessors.mockReturnValue([mockProcessor]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element as any, context);

    // 验证
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('test-tag');
    expect(mockProcessor.canProcess).toHaveBeenCalled();
    expect(mockProcessor.process).toHaveBeenCalled();
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('semantic');
    expect(result.meta.semantic).toHaveProperty('type', 'special');
    expect(result.meta.semantic).toHaveProperty('role', 'example');
  });

  it('应该按优先级顺序应用多个处理器', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'multi-processor',
      attributes: {},
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 30 },
      },
    };

    const context = createContext(document);

    // 创建两个优先级不同的处理器
    const highPriorityProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            processed: ['high'],
          },
        };
      }),
      priority: 10,
    };

    const lowPriorityProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            ...el.meta,
            processed: [...(el.meta?.processed || []), 'low'],
          },
        };
      }),
      priority: 5,
    };

    // 设置模拟注册表返回处理器（先返回低优先级，再返回高优先级，测试排序）
    mockRegistry.getProcessors.mockReturnValue([
      lowPriorityProcessor,
      highPriorityProcessor,
    ]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element as any, context);

    // 验证
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('processed');
    // 应先执行高优先级处理器，后执行低优先级处理器
    expect(result.meta.processed).toEqual(['high', 'low']);
  });

  it('应该跳过没有处理器的元素', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'no-processor',
      attributes: {},
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 30 },
      },
    };

    const context = createContext(document);

    // 设置模拟注册表不返回处理器
    mockRegistry.getProcessors.mockReturnValue([]);
    mockRegistry.hasProcessors.mockReturnValue(false);

    // 执行
    const result = await visitor.visitElement(element as any, context);

    // 验证 - 应该返回原始元素
    expect(result).toBe(element);
    expect(mockRegistry.getProcessors).toHaveBeenCalledWith('no-processor');
  });

  it('应该递归处理子元素', async () => {
    // 准备
    const childElement = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: {},
      children: [],
      position: {
        start: { line: 2, column: 2, offset: 10 },
        end: { line: 2, column: 10, offset: 18 },
      },
    };

    const parentElement = {
      type: NodeType.ELEMENT,
      tagName: 'parent',
      attributes: {},
      children: [childElement],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 1, offset: 30 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [parentElement],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 4, column: 0, offset: 40 },
      },
    };

    const context = createContext(document);

    // 为parent和child标签创建不同的处理器
    const parentProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            role: 'parent',
          },
        };
      }),
      priority: 10,
    };

    const childProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(el => {
        return {
          ...el,
          meta: {
            role: 'child',
          },
        };
      }),
      priority: 10,
    };

    // 设置模拟注册表返回不同的处理器
    mockRegistry.getProcessors.mockImplementation(tagName => {
      if (tagName === 'parent') return [parentProcessor];
      if (tagName === 'child') return [childProcessor];

      return [];
    });

    mockRegistry.hasProcessors.mockImplementation(tagName => {
      return tagName === 'parent' || tagName === 'child';
    });

    // 执行 - 先处理元素本身，再递归处理子元素
    const result = await visitor.visitElement(parentElement as any, context);

    // 验证
    expect(parentProcessor.process).toHaveBeenCalled();
    expect(childProcessor.process).toHaveBeenCalled();

    // 验证元素的meta数据
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('role', 'parent');

    // 验证子元素的meta数据
    expect(result.children[0]).toHaveProperty('meta');
    expect(result.children[0].meta).toHaveProperty('role', 'child');
  });

  it('应该在处理器出错时优雅降级', async () => {
    // 准备
    const element = {
      type: NodeType.ELEMENT,
      tagName: 'error-tag',
      attributes: {},
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 },
      },
    };

    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [element],
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 2, column: 0, offset: 30 },
      },
    };

    const context = createContext(document);

    // 创建会抛出错误的处理器
    const errorProcessor = {
      canProcess: vi.fn().mockReturnValue(true),
      process: vi.fn().mockImplementation(() => {
        throw new Error('处理器错误测试');
      }),
      priority: 10,
    };

    // 设置模拟注册表返回错误处理器
    mockRegistry.getProcessors.mockReturnValue([errorProcessor]);
    mockRegistry.hasProcessors.mockReturnValue(true);

    // 执行
    const result = await visitor.visitElement(element as any, context);

    // 验证 - 应该返回原始元素，不应崩溃
    expect(result).toBe(element);
    expect(errorProcessor.process).toHaveBeenCalled();

    // 应该添加错误信息到元素的meta中
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('errors');
    expect(Array.isArray(result.meta.errors)).toBe(true);
    expect(result.meta.errors[0]).toMatch(/处理器错误测试/);
  });
});
