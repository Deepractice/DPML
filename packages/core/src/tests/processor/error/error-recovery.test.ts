/**
 * 错误恢复机制测试
 */
import { describe, expect, it, vi } from 'vitest';
import { ErrorHandler } from '../../../processor/errors/errorHandler';
import { ProcessingError, ErrorSeverity } from '../../../processor/errors/processingError';
import { Document, NodeType, Element, Node } from '../../../types/node';
import { DefaultProcessor } from '../../../processor/defaultProcessor';
import { NodeVisitor } from '../../../processor/interfaces';

describe('错误恢复机制', () => {
  it('启用错误恢复时应继续处理其他节点', async () => {
    // 创建一个会对特定元素抛出错误的访问者
    const errorVisitor: NodeVisitor = {
      priority: 100,
      visitElement: async (element: Element, context: any) => {
        if (element.tagName === 'error-element') {
          throw new ProcessingError({
            message: '这个元素处理失败',
            severity: ErrorSeverity.ERROR
          });
        }
        return element;
      }
    };
    
    // 创建一个记录处理元素数量的访问者
    let processedElements = 0;
    const countingVisitor: NodeVisitor = {
      priority: 50,
      visitElement: async (element: Element, context: any) => {
        processedElements++;
        return element;
      }
    };
    
    // 创建处理器并启用错误恢复
    const errors: ProcessingError[] = [];
    const errorHandler = new ErrorHandler({
      errorRecovery: true,
      onError: (error) => { errors.push(error); }
    });
    
    const processor = new DefaultProcessor({ errorHandler });
    processor.registerVisitor(errorVisitor);
    processor.registerVisitor(countingVisitor);
    
    // 创建测试文档，包含一个会触发错误的元素
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {},
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'normal-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 2, column: 1, offset: 20 },
                end: { line: 2, column: 20, offset: 39 }
              }
            },
            {
              type: NodeType.ELEMENT,
              tagName: 'error-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 3, column: 1, offset: 40 },
                end: { line: 3, column: 20, offset: 59 }
              }
            },
            {
              type: NodeType.ELEMENT,
              tagName: 'another-normal-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 4, column: 1, offset: 60 },
                end: { line: 4, column: 20, offset: 79 }
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 5, column: 1, offset: 80 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 80 }
      }
    };
    
    // 处理文档
    const result = await processor.process(document, 'test-document.xml');
    
    // 验证错误是否被记录
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('这个元素处理失败');
    
    // 验证其他元素是否都被处理
    expect(processedElements).toBe(4); // root + 2 normal elements + error element (会尝试处理但失败)
    
    // 验证结果文档结构是否正确
    expect(result.children.length).toBe(1);
    const rootElement = result.children[0] as Element;
    expect(rootElement.children.length).toBe(3); // 所有元素都应该保留
  });
  
  it('不启用错误恢复时应中断处理', async () => {
    // 创建一个会对特定元素抛出错误的访问者
    const errorVisitor: NodeVisitor = {
      priority: 100,
      visitElement: async (element: Element, context: any) => {
        if (element.tagName === 'error-element') {
          throw new ProcessingError({
            message: '这个元素处理失败',
            severity: ErrorSeverity.ERROR
          });
        }
        return element;
      }
    };
    
    // 创建一个记录处理元素数量的访问者
    let processedElements = 0;
    const countingVisitor: NodeVisitor = {
      priority: 50,
      visitElement: async (element: Element, context: any) => {
        processedElements++;
        return element;
      }
    };
    
    // 创建处理器，不启用错误恢复
    const errorHandler = new ErrorHandler({
      errorRecovery: false
    });
    
    const processor = new DefaultProcessor({ errorHandler });
    processor.registerVisitor(errorVisitor);
    processor.registerVisitor(countingVisitor);
    
    // 创建测试文档，包含一个会触发错误的元素，放在前面以便快速失败
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {},
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
            },
            {
              type: NodeType.ELEMENT,
              tagName: 'normal-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 3, column: 1, offset: 40 },
                end: { line: 3, column: 20, offset: 59 }
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 4, column: 1, offset: 60 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 4, column: 1, offset: 60 }
      }
    };
    
    // 处理文档，应该抛出错误
    let processingFailed = false;
    try {
      await processor.process(document, 'test-document.xml');
    } catch (error) {
      processingFailed = true;
      expect(error).toBeInstanceOf(ProcessingError);
    }
    
    // 验证处理是否失败
    expect(processingFailed).toBe(true);
    
    // 验证处理中断后的元素计数
    // 由于深度优先遍历，应该只处理了根元素和错误元素，不包括后面的正常元素
    expect(processedElements).toBeLessThan(3);
  });
  
  it('不同严重级别的错误应有不同的恢复行为', async () => {
    // 创建一个会抛出不同级别错误的访问者
    const errorVisitor: NodeVisitor = {
      visitElement: async (element: Element, context: any) => {
        if (element.tagName === 'warning-element') {
          throw new ProcessingError({
            message: '警告级别错误',
            severity: ErrorSeverity.WARNING
          });
        } else if (element.tagName === 'error-element') {
          throw new ProcessingError({
            message: '一般错误',
            severity: ErrorSeverity.ERROR
          });
        } else if (element.tagName === 'fatal-element') {
          throw new ProcessingError({
            message: '致命错误',
            severity: ErrorSeverity.FATAL,
            position: {
              start: { line: 2, column: 1, offset: 20 },
              end: { line: 2, column: 20, offset: 39 }
            }
          });
        }
        return element;
      }
    };
    
    // 记录错误和警告
    const warnings: ProcessingError[] = [];
    const errors: ProcessingError[] = [];
    
    // 创建处理器并启用错误恢复
    const errorHandler = new ErrorHandler({
      errorRecovery: true,
      onWarning: (warning) => { warnings.push(warning); },
      onError: (error) => { errors.push(error); }
    });
    
    const processor = new DefaultProcessor({ errorHandler });
    processor.registerVisitor(errorVisitor);
    
    // 创建一个只包含致命错误元素的文档，用于测试致命错误总是抛出异常
    const documentWithFatalError: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {},
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'fatal-element',
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
    
    // 处理文档，应该在处理到致命错误时中断
    let processingFailed = false;
    try {
      await processor.process(documentWithFatalError, 'test-document.xml');
    } catch (error) {
      processingFailed = true;
      expect(error).toBeInstanceOf(ProcessingError);
      if (error instanceof ProcessingError) {
        expect(error.severity).toBe(ErrorSeverity.FATAL);
        expect(error.message).toBe('致命错误');
      }
    }
    
    // 验证处理是否失败
    expect(processingFailed).toBe(true);
    
    // 创建一个包含警告和一般错误元素的文档，用于验证错误和警告记录
    const documentWithWarningAndError: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'root',
          attributes: {},
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'warning-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 2, column: 1, offset: 20 },
                end: { line: 2, column: 20, offset: 39 }
              }
            },
            {
              type: NodeType.ELEMENT,
              tagName: 'error-element',
              attributes: {},
              children: [],
              position: {
                start: { line: 3, column: 1, offset: 40 },
                end: { line: 3, column: 20, offset: 59 }
              }
            }
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 4, column: 1, offset: 60 }
          }
        }
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 4, column: 1, offset: 60 }
      }
    };
    
    // 处理包含警告和一般错误的文档，这次不应该抛出异常
    warnings.length = 0;
    errors.length = 0;
    
    await processor.process(documentWithWarningAndError, 'test-document2.xml');
    
    // 验证警告和错误记录
    expect(warnings.length).toBe(1);
    expect(warnings[0].message).toBe('警告级别错误');
    
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('一般错误');
  });
}); 