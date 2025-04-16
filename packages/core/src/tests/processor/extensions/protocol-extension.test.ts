/**
 * 协议处理器扩展能力测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType, Element, Content, Document, Reference } from '../../../types/node';
import { DefaultReferenceResolver } from '../../../processor/defaultReferenceResolver';
import { ProtocolHandler } from '../../../processor/interfaces/protocolHandler';
import { DefaultProcessor } from '../../../processor/defaultProcessor';
import { ReferenceVisitor } from '../../../processor/visitors/referenceVisitor';
import { ProcessingContext } from '../../../processor/processingContext';

// 自定义协议处理器 - 处理"custom:"协议
class CustomProtocolHandler implements ProtocolHandler {
  public protocol = 'custom';
  
  constructor() {}
  
  canHandle(protocol: string): boolean {
    return protocol === 'custom';
  }
  
  async handle(reference: Reference): Promise<any> {
    // 解析自定义协议引用
    const id = reference.path;
    
    // 返回一个模拟的解析结果
    return {
      type: 'custom',
      id,
      content: `这是来自自定义协议的内容: ${id}`,
      metadata: {
        source: 'custom-protocol',
        timestamp: 123456789 // 使用固定时间戳避免测试不稳定
      }
    };
  }
}

// 在现有协议处理器上扩展的处理器 - 添加版本支持
class VersionedFileProtocolHandler implements ProtocolHandler {
  public protocol = 'vfile';
  
  constructor() {}
  
  canHandle(protocol: string): boolean {
    return protocol === 'vfile';
  }
  
  async handle(reference: Reference): Promise<any> {
    // 解析引用，格式: vfile:path/to/file.xml@v1.0
    const parts = reference.path.split('@');
    const path = parts[0];
    const version = parts.length > 1 ? parts[1] : 'latest';
    
    // 返回模拟的文件内容，带版本信息
    return {
      type: 'file',
      path,
      version,
      content: `这是文件 ${path} 的版本 ${version} 内容`,
      metadata: {
        source: 'versioned-file-protocol',
        timestamp: 123456789 // 使用固定时间戳避免测试不稳定
      }
    };
  }
}

describe('协议处理器扩展能力测试', () => {
  let referenceResolver: DefaultReferenceResolver;
  let processor: DefaultProcessor;
  let customHandler: CustomProtocolHandler;
  let versionedFileHandler: VersionedFileProtocolHandler;
  
  beforeEach(() => {
    // 创建引用解析器
    referenceResolver = new DefaultReferenceResolver();
    
    // 创建自定义协议处理器
    customHandler = new CustomProtocolHandler();
    versionedFileHandler = new VersionedFileProtocolHandler();
    
    // 注册协议处理器
    referenceResolver.registerProtocolHandler(customHandler);
    referenceResolver.registerProtocolHandler(versionedFileHandler);
    
    // 创建处理器
    processor = new DefaultProcessor();
    
    // 注册ReferenceVisitor并设置引用解析器
    processor.registerVisitor(new ReferenceVisitor({
      referenceResolver,
      resolveInContent: true
    }));
    processor.setReferenceResolver(referenceResolver);
  });
  
  it('应该能注册和使用自定义协议处理器', async () => {
    // 创建包含自定义协议引用的文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'test-document' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'custom-section' },
              children: [
                {
                  type: NodeType.ELEMENT,
                  tagName: 'Reference',
                  attributes: { 
                    href: 'custom:test-item',
                    id: 'custom-reference'
                  },
                  children: [],
                  position: {
                    start: { line: 3, column: 1, offset: 50 },
                    end: { line: 3, column: 20, offset: 70 }
                  }
                } as Element
              ],
              position: {
                start: { line: 2, column: 1, offset: 30 },
                end: { line: 4, column: 1, offset: 80 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 5, column: 1, offset: 90 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 90 }
      }
    };
    
    // 直接测试协议处理
    const testReference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'custom',
      path: 'test-item',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    // 检查canHandle方法
    expect(customHandler.canHandle('custom')).toBe(true);
    
    // 检查handle方法
    const result = await customHandler.handle(testReference);
    expect(result).toBeDefined();
    expect(result.content).toContain('这是来自自定义协议的内容: test-item');
    expect(result.type).toBe('custom');
    expect(result.id).toBe('test-item');
    expect(result.metadata.source).toBe('custom-protocol');
    
    // 通过引用解析器测试
    const context = new ProcessingContext(document, '/test/document.xml');
    const resolvedRef = await referenceResolver.resolve(testReference, context);
    
    // 只比较内容和类型，忽略时间戳
    expect(resolvedRef.value.content).toEqual(result.content);
    expect(resolvedRef.value.type).toEqual(result.type);
    expect(resolvedRef.value.id).toEqual(result.id);
    expect(resolvedRef.value.metadata.source).toEqual(result.metadata.source);
  });
  
  it('应该能扩展现有协议的功能', async () => {
    // 创建包含版本化文件协议引用的文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'test-document' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'versioned-section' },
              children: [
                {
                  type: NodeType.ELEMENT,
                  tagName: 'Reference',
                  attributes: { 
                    href: 'vfile:components/button.xml@v2.0',
                    id: 'versioned-reference'
                  },
                  children: [],
                  position: {
                    start: { line: 3, column: 1, offset: 50 },
                    end: { line: 3, column: 20, offset: 70 }
                  }
                } as Element
              ],
              position: {
                start: { line: 2, column: 1, offset: 30 },
                end: { line: 4, column: 1, offset: 80 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 5, column: 1, offset: 90 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 5, column: 1, offset: 90 }
      }
    };
    
    // 直接测试协议处理
    const versionedReference1: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'vfile',
      path: 'components/button.xml@v2.0',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    const versionedReference2: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'vfile',
      path: 'components/input.xml',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 20, offset: 19 }
      }
    };
    
    // 检查canHandle方法
    expect(versionedFileHandler.canHandle('vfile')).toBe(true);
    
    // 测试带版本号的引用
    const result1 = await versionedFileHandler.handle(versionedReference1);
    expect(result1).toBeDefined();
    expect(result1.path).toBe('components/button.xml');
    expect(result1.version).toBe('v2.0');
    expect(result1.content).toContain('这是文件 components/button.xml 的版本 v2.0 内容');
    
    // 测试不带版本号的引用
    const result2 = await versionedFileHandler.handle(versionedReference2);
    expect(result2).toBeDefined();
    expect(result2.path).toBe('components/input.xml');
    expect(result2.version).toBe('latest');
    expect(result2.content).toContain('这是文件 components/input.xml 的版本 latest 内容');
    
    // 通过引用解析器测试
    const context = new ProcessingContext(document, '/test/document.xml');
    const resolvedRef1 = await referenceResolver.resolve(versionedReference1, context);
    
    // 只比较关键字段，忽略时间戳
    expect(resolvedRef1.value.path).toEqual(result1.path);
    expect(resolvedRef1.value.version).toEqual(result1.version);
    expect(resolvedRef1.value.content).toEqual(result1.content);
    expect(resolvedRef1.value.metadata.source).toEqual(result1.metadata.source);
  });
  
  it('应该在整个处理流程中正确使用自定义协议处理器', async () => {
    // 使用spy监控方法调用
    const canHandleSpy1 = vi.spyOn(customHandler, 'canHandle');
    const handleSpy1 = vi.spyOn(customHandler, 'handle');
    const canHandleSpy2 = vi.spyOn(versionedFileHandler, 'canHandle');
    const handleSpy2 = vi.spyOn(versionedFileHandler, 'handle');
    
    // 创建包含引用节点的文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'document',
          attributes: { id: 'integrated-test' },
          children: [
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section1' },
              children: [
                {
                  type: NodeType.REFERENCE, // 直接使用Reference节点
                  protocol: 'custom',
                  path: 'special-content',
                  position: {
                    start: { line: 3, column: 1, offset: 50 },
                    end: { line: 3, column: 20, offset: 70 }
                  }
                } as Reference
              ],
              position: {
                start: { line: 2, column: 1, offset: 30 },
                end: { line: 4, column: 1, offset: 80 }
              }
            } as Element,
            {
              type: NodeType.ELEMENT,
              tagName: 'section',
              attributes: { id: 'section2' },
              children: [
                {
                  type: NodeType.REFERENCE, // 直接使用Reference节点
                  protocol: 'vfile',
                  path: 'data/config.xml@v1.5',
                  position: {
                    start: { line: 6, column: 1, offset: 100 },
                    end: { line: 6, column: 20, offset: 120 }
                  }
                } as Reference
              ],
              position: {
                start: { line: 5, column: 1, offset: 90 },
                end: { line: 7, column: 1, offset: 130 }
              }
            } as Element
          ],
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 8, column: 1, offset: 140 }
          }
        } as Element
      ],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 8, column: 1, offset: 140 }
      }
    };
    
    // 清除之前的调用记录
    canHandleSpy1.mockClear();
    handleSpy1.mockClear();
    canHandleSpy2.mockClear();
    handleSpy2.mockClear();
    
    // 处理文档
    await processor.process(document, '/test/integrated-test.xml');
    
    // 验证处理器方法被调用
    expect(canHandleSpy1).toHaveBeenCalled();
    expect(handleSpy1).toHaveBeenCalled();
    expect(canHandleSpy2).toHaveBeenCalled();
    expect(handleSpy2).toHaveBeenCalled();
  });
}); 