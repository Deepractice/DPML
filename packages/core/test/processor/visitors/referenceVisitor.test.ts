import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeType, Element, Document, Reference, Content, SourcePosition } from '../../../src/types/node';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { DPMLError, ErrorCode } from '../../../src/errors';
import { ReferenceResolver, ResolvedReference } from '../../../src/processor/interfaces';
import { ReferenceVisitor, ReferenceVisitorOptions } from '../../../src/processor/visitors/referenceVisitor';

describe('ReferenceVisitor', () => {
  let visitor: ReferenceVisitor;
  let context: ProcessingContext;
  let mockReferenceResolver: ReferenceResolver;
  const mockPosition: SourcePosition = {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 }
  };

  beforeEach(() => {
    // 创建模拟引用解析器
    mockReferenceResolver = {
      resolve: vi.fn(),
      getProtocolHandler: vi.fn()
    };
    
    // 创建带有引用解析器的访问者
    const options: ReferenceVisitorOptions = {
      referenceResolver: mockReferenceResolver,
      resolveInContent: true
    };
    visitor = new ReferenceVisitor(options);
    
    // 创建基础文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: mockPosition
    };
    
    // 创建处理上下文
    context = new ProcessingContext(document, '/test/path');
  });

  it('应该处理独立的引用节点', async () => {
    // 准备引用节点
    const reference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'id',
      path: 'testId',
      position: mockPosition
    };

    // 模拟引用解析结果
    const resolvedValue = { test: 'value' };
    (mockReferenceResolver.resolve as any).mockResolvedValue({
      reference,
      value: resolvedValue
    });

    // 执行访问方法
    const result = await visitor.visitReference(reference, context);

    // 验证引用已被处理
    expect(result).toEqual({
      ...reference,
      resolved: resolvedValue
    });

    // 验证引用解析器被调用
    expect(mockReferenceResolver.resolve).toHaveBeenCalledWith(reference, context);
  });

  it('应该在内容中识别和解析引用', async () => {
    // 准备带引用的内容节点
    const content: Content = {
      type: NodeType.CONTENT,
      value: '这是一个引用 @id:testId 和另一个引用 @file:test.dpml',
      position: mockPosition
    };

    // 模拟第一个引用解析结果
    const resolvedValue1 = "解析后的值1";
    (mockReferenceResolver.resolve as any).mockImplementationOnce((ref: Reference) => {
      if (ref.protocol === 'id' && ref.path === 'testId') {
        return Promise.resolve({
          reference: ref,
          value: resolvedValue1
        });
      }
    });

    // 模拟第二个引用解析结果
    const resolvedValue2 = "解析后的值2";
    (mockReferenceResolver.resolve as any).mockImplementationOnce((ref: Reference) => {
      if (ref.protocol === 'file' && ref.path === 'test.dpml') {
        return Promise.resolve({
          reference: ref,
          value: resolvedValue2
        });
      }
    });

    // 执行访问方法
    const result = await visitor.visitContent(content, context);

    // 验证内容中的引用已被替换
    expect(result.value).toBe('这是一个引用 解析后的值1 和另一个引用 解析后的值2');
    
    // 验证引用解析器被调用了两次
    expect(mockReferenceResolver.resolve).toHaveBeenCalledTimes(2);
  });

  it('应该处理复杂对象类型的引用解析结果', async () => {
    // 准备带引用的内容节点
    const content: Content = {
      type: NodeType.CONTENT,
      value: '对象引用: @id:objectId',
      position: mockPosition
    };

    // 模拟引用解析结果为复杂对象
    const resolvedObject = { 
      name: 'test',
      properties: { key: 'value' }
    };
    (mockReferenceResolver.resolve as any).mockResolvedValue({
      reference: {
        type: NodeType.REFERENCE,
        protocol: 'id',
        path: 'objectId',
        position: mockPosition
      },
      value: resolvedObject
    });

    // 执行访问方法
    const result = await visitor.visitContent(content, context);

    // 验证内容中的引用已被替换为JSON字符串
    expect(result.value).toBe(`对象引用: ${JSON.stringify(resolvedObject)}`);
  });

  it('当resolveInContent为false时不应处理内容中的引用', async () => {
    // 创建不处理内容中引用的访问者
    const noContentVisitor = new ReferenceVisitor({
      referenceResolver: mockReferenceResolver,
      resolveInContent: false
    });
    
    // 准备带引用的内容节点
    const content: Content = {
      type: NodeType.CONTENT,
      value: '这是一个引用 @id:testId',
      position: mockPosition
    };

    // 执行访问方法
    const result = await noContentVisitor.visitContent(content, context);

    // 验证内容保持不变
    expect(result.value).toBe(content.value);
    
    // 验证引用解析器没有被调用
    expect(mockReferenceResolver.resolve).not.toHaveBeenCalled();
  });

  it('应该处理引用解析失败的情况', async () => {
    // 准备带引用的内容节点
    const content: Content = {
      type: NodeType.CONTENT,
      value: '这是一个失败的引用 @id:nonExistent',
      position: mockPosition
    };

    // 模拟引用解析失败
    (mockReferenceResolver.resolve as any).mockRejectedValue(
      new DPMLError({
        code: ErrorCode.REFERENCE_NOT_FOUND,
        message: '引用未找到: id:nonExistent'
      })
    );

    // 添加console.warn的mock以测试警告消息
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // 执行访问方法（不应抛出错误）
    const result = await visitor.visitContent(content, context);

    // 验证内容保持不变
    expect(result.value).toBe(content.value);
    
    // 验证有警告消息
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('无法解析引用 @id:nonExistent'));
    
    // 恢复console.warn
    warnSpy.mockRestore();
  });

  it('应该正确匹配内容中复杂的引用格式', async () => {
    // 准备带有复杂引用的内容节点
    const content: Content = {
      type: NodeType.CONTENT,
      value: '复杂引用: @http://example.com/path/to/resource.dpml 和 @file:./relative/path.dpml 以及 @id:element-123',
      position: mockPosition
    };

    // 模拟所有引用解析
    (mockReferenceResolver.resolve as any).mockImplementation((ref: Reference) => {
      return Promise.resolve({
        reference: ref,
        value: `${ref.protocol}:${ref.path}-resolved`
      });
    });

    // 执行访问方法
    const result = await visitor.visitContent(content, context);

    // 验证引用解析器被调用了正确次数
    expect(mockReferenceResolver.resolve).toHaveBeenCalledTimes(3);
    
    // 验证内容中的所有引用都被正确替换
    expect(result.value).toBe(
      '复杂引用: http:http://example.com/path/to/resource.dpml-resolved 和 ' +
      'file:./relative/path.dpml-resolved 以及 ' +
      'id:element-123-resolved'
    );
  });
}); 