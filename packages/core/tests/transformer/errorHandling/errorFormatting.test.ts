import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../../src/transformer/interfaces/transformOptions';
import { NodeType, Element, Document, Content } from '../../../src/types/node';
import { formatError, formatErrorLogMessage } from '../../../src/transformer/utils/errorFormatter';
import { DEFAULT_LOOSE_MODE } from '../../../src/transformer/utils/modeConfig';

describe('错误消息格式化和处理', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  
  // 在每个测试前初始化控制台间谍
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  // 在每个测试后恢复控制台间谍
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
  
  // 创建一个测试文档
  const createTestDocument = (): Document => ({
    type: NodeType.DOCUMENT,
    children: [
      {
        type: NodeType.ELEMENT,
        tagName: 'root',
        attributes: {},
        children: [
          {
            type: NodeType.CONTENT,
            value: 'Hello, world!',
            position: { start: { line: 2, column: 1, offset: 0 }, end: { line: 2, column: 14, offset: 13 } }
          } as Content
        ],
        position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
      } as Element
    ],
    position: { start: { line: 1, column: 1, offset: 0 }, end: { line: 3, column: 1, offset: 0 } }
  });
  
  it('应该统一错误消息格式', () => {
    // 创建原始错误
    const originalError = new Error('原始错误消息');
    
    // 格式化错误
    const formattedError = formatError(originalError, {
      visitor: 'TestVisitor',
      nodeType: 'document',
      operation: '测试操作',
      mode: 'loose'
    });
    
    // 检查错误消息是否包含所有上下文信息
    expect(formattedError.message).toContain('[访问者:TestVisitor]');
    expect(formattedError.message).toContain('[节点:document]');
    expect(formattedError.message).toContain('[操作:测试操作]');
    expect(formattedError.message).toContain('[模式:loose]');
    expect(formattedError.message).toContain('原始错误消息');
    
    // 检查错误上下文是否已保存
    expect((formattedError as any).context).toBeDefined();
    expect((formattedError as any).context.visitor).toBe('TestVisitor');
    expect((formattedError as any).context.nodeType).toBe('document');
    expect((formattedError as any).context.timestamp).toBeDefined();
  });
  
  it('应该根据详细程度生成不同格式的日志消息', () => {
    // 创建一个带上下文的错误
    const error = formatError(new Error('测试错误'), {
      operation: '测试操作',
      position: { start: { line: 10, column: 5 } }
    });
    
    // 测试最小详细程度
    const minimalConfig = { ...DEFAULT_LOOSE_MODE, errorVerbosity: 'minimal' as const };
    const minimalMessage = formatErrorLogMessage(error, minimalConfig);
    
    // 最小详细程度应该只包含基本信息
    expect(minimalMessage).toContain('测试操作错误');
    expect(minimalMessage).toContain('测试错误');
    expect(minimalMessage).not.toContain('位置');
    expect(minimalMessage).not.toContain('时间');
    
    // 测试详细详细程度
    const detailedConfig = { ...DEFAULT_LOOSE_MODE, errorVerbosity: 'detailed' as const };
    const detailedMessage = formatErrorLogMessage(error, detailedConfig);
    
    // 详细详细程度应该包含位置和时间
    expect(detailedMessage).toContain('测试操作错误');
    expect(detailedMessage).toContain('测试错误');
    expect(detailedMessage).toContain('位置');
    expect(detailedMessage).toContain('行:10,列:5');
    expect(detailedMessage).toContain('时间');
  });
  
  it('应该在正确的时机调用console.error', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('测试错误消息');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    
    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    // 清空控制台调用
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
    
    // 执行转换
    transformer.transform(createTestDocument(), options);
    
    // 在宽松模式下，应该调用console.error但不抛出错误
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 检查错误消息格式
    const errorCall = consoleErrorSpy.mock.calls[0][0];
    expect(errorCall).toContain('测试错误消息');
  });
  
  it('应该记录访问者错误', () => {
    // 清空控制台调用
    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();
    
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'threshold-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('访问者错误');
      }
    };
    
    // 创建转换器并注册访问者，直接在构造函数中设置错误阈值
    const transformer = new DefaultTransformer({
      mode: 'loose',
      errorThreshold: 3
    });
    transformer.registerVisitor(errorVisitor);
    
    // 执行转换一次
    transformer.transform(createTestDocument());
    
    // 检查是否有错误消息被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 确认至少有一条错误消息
    expect(consoleErrorSpy.mock.calls.length).toBeGreaterThan(0);
  });
  
  it('应该在异步转换中提供更丰富的错误信息', async () => {
    // 清空控制台调用
    consoleErrorSpy.mockClear();
    
    // 创建一个会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      priority: 100,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步错误消息');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer({
      mode: 'loose'
    });
    transformer.registerVisitor(asyncErrorVisitor);
    
    // 执行异步转换
    const result = await transformer.transformAsync(createTestDocument());
    
    // 检查是否记录了错误
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 确认错误消息包含异步错误
    const errorMessages = consoleErrorSpy.mock.calls.map((call: any[]) => call[0]);
    const asyncErrors = errorMessages.filter((msg: string) => 
      typeof msg === 'string' && msg.includes('异步错误消息')
    );
    expect(asyncErrors.length).toBeGreaterThan(0);
    
    // 检查返回结果是否包含错误信息
    if (result && typeof result === 'object' && 'error' in result) {
      expect(result.error).toBe(true);
      if ('errorMessage' in result) {
        expect(result.errorMessage).toContain('异步错误消息');
      }
    }
  });
}); 