/**
 * 测试不同模式下的错误处理行为
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '../../../src/processor/errors/errorHandler';
import { ProcessingError, ErrorSeverity } from '../../../src/processor/errors/processingError';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { Element, NodeType, Document, Node } from '../../../src/types/node';
import { DefaultProcessor } from '../../../src/processor/defaultProcessor';
import { NodeVisitor, ProcessorOptions } from '../../../src/processor/interfaces';

describe('不同模式下的错误处理', () => {
  let onError: any;
  let onWarning: any;
  let errorHandler: ErrorHandler;
  let context: ProcessingContext;
  let mockDocument: Document;

  beforeEach(() => {
    onError = vi.fn();
    onWarning = vi.fn();
    errorHandler = new ErrorHandler({
      strictMode: false,
      errorRecovery: false,
      onError,
      onWarning
    });
    
    mockDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
    
    context = new ProcessingContext(mockDocument, 'test.xml');
  });

  it('严格模式下所有错误都应中断处理', () => {
    errorHandler.setStrictMode(true);
    
    // 非致命错误在严格模式下也应该抛出
    expect(() => {
      // 使用undefined代替null作为node参数
      errorHandler.handleError('非致命错误', undefined, undefined, ErrorSeverity.ERROR);
    }).toThrow(ProcessingError);
    
    // 警告在严格模式下应该仍然是警告，不抛出
    expect(() => {
      errorHandler.handleWarning('警告信息');
    }).not.toThrow();
  });

  it('宽松模式下只有致命错误才中断处理', () => {
    errorHandler.setStrictMode(false);
    
    // 非致命错误在宽松模式下不应抛出
    expect(() => {
      errorHandler.handleError('非致命错误');
    }).toThrow(ProcessingError);
    
    // 启用错误恢复后，非致命错误不应抛出
    errorHandler.setErrorRecovery(true);
    expect(() => {
      errorHandler.handleError('非致命错误');
    }).not.toThrow();
    
    // 致命错误总是抛出，即使在宽松模式下
    expect(() => {
      errorHandler.handleFatalError('致命错误');
    }).toThrow(ProcessingError);
  });

  it('根元素的mode属性应决定整个文档的处理模式', () => {
    // 创建一个带有严格模式的根元素
    const rootElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'root',
      attributes: { mode: 'strict' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    mockDocument.children = [rootElement];
    context = new ProcessingContext(mockDocument, 'test.xml');
    
    // 上下文应该标记为严格模式
    expect(context.documentMode).toBe('strict');
    
    // 错误处理应该按照严格模式行为
    const isStrict = errorHandler.getModeFromContext(context);
    expect(isStrict).toBe(true);
  });

  it('子元素的mode属性应覆盖父元素的mode属性', () => {
    // 创建一个带有宽松模式的父元素
    const parentElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'parent',
      attributes: { mode: 'loose' },
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    // 创建一个带有严格模式的子元素
    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: { mode: 'strict' },
      children: [],
      position: {
        start: { line: 2, column: 1, offset: 20 },
        end: { line: 2, column: 20, offset: 39 }
      }
    };
    
    // 在处理子元素时，应该使用子元素的mode属性
    const isStrict = errorHandler.getModeFromContext(context, childElement);
    expect(isStrict).toBe(true);
  });
});

// 集成测试：测试在处理过程中的错误处理
describe('处理过程中的错误处理', () => {
  it('应该根据元素上的mode属性决定错误处理行为', async () => {
    // 记录警告和错误
    const warnings: ProcessingError[] = [];
    const errors: ProcessingError[] = [];
    
    // 先处理宽松模式下的错误
    const looseErrorHandler = new ErrorHandler({
      strictMode: false,
      errorRecovery: true,
      onWarning: (warning) => { warnings.push(warning); },
      onError: (error) => { errors.push(error); }
    });
    
    // 创建一个会抛出错误的访问者
    const errorVisitor: NodeVisitor = {
      priority: 100,
      visitElement: async (element: Element, context: ProcessingContext) => {
        if (element.tagName === 'error-element') {
          throw new Error('访问者处理错误');
        }
        return element;
      }
    };
    
    // 创建宽松模式处理器
    const looseProcessor = new DefaultProcessor({ errorHandler: looseErrorHandler });
    looseProcessor.registerVisitor(errorVisitor);
    
    // 创建测试文档，包含宽松模式的元素
    const looseDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: { mode: 'loose' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'error-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 2, column: 1, offset: 20 },
                end: { line: 2, column: 20, offset: 39 }
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 3, column: 1, offset: 40 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 1, offset: 40 }
      }
    };
    
    // 处理宽松模式文档
    await looseProcessor.process(looseDocument, 'loose-document.xml');
    
    // 宽松模式下的错误应该被作为警告处理
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.message.includes('访问者处理错误'))).toBe(true);
    
    // 然后处理严格模式下的错误
    const strictErrorHandler = new ErrorHandler({
      strictMode: true, // 设置为严格模式
      errorRecovery: false, // 不启用错误恢复
      onWarning: (warning) => { /* 忽略警告 */ },
      onError: (error) => { errors.push(error); }
    });
    
    const strictProcessor = new DefaultProcessor({ errorHandler: strictErrorHandler });
    strictProcessor.registerVisitor(errorVisitor);
    
    // 创建测试文档，包含严格模式的元素
    const strictDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: { mode: 'strict' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'error-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 2, column: 1, offset: 20 },
                end: { line: 2, column: 20, offset: 39 }
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 3, column: 1, offset: 40 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 1, offset: 40 }
      }
    };
    
    // 处理严格模式文档，应该失败
    let processingFailed = false;
    try {
      await strictProcessor.process(strictDocument, 'strict-document.xml');
    } catch (error) {
      processingFailed = true;
      expect(error).toBeInstanceOf(ProcessingError);
      // 验证是否包含预期错误信息
      if (error instanceof ProcessingError) {
        expect(error.message).toContain('访问者处理错误');
      }
    }
    
    // 验证处理是否失败
    expect(processingFailed).toBe(true);
    
    // 严格模式下的错误应该被作为错误处理
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.message.includes('访问者处理错误'))).toBe(true);
  });
}); 