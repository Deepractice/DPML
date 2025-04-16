/**
 * Processor接口测试
 */
import { describe, it, expect, vi } from 'vitest';
import { NodeType, Document } from '../../../types/node';
import { 
  Processor, 
  NodeVisitor, 
  ProcessorOptions, 
  ProtocolHandler,
  ReferenceResolver
} from '../../../processor/interfaces';

describe('Processor接口', () => {
  it('应该能够定义具有正确结构的处理器', () => {
    // 模拟方法
    const registerVisitor = vi.fn();
    const registerProtocolHandler = vi.fn();
    const setReferenceResolver = vi.fn();
    const process = vi.fn();
    const configure = vi.fn();
    
    // 创建符合Processor接口的对象
    const processor: Processor = {
      registerVisitor,
      registerProtocolHandler,
      setReferenceResolver,
      process,
      configure
    };
    
    // 验证处理器接口的结构
    expect(processor).toHaveProperty('registerVisitor');
    expect(processor).toHaveProperty('registerProtocolHandler');
    expect(processor).toHaveProperty('setReferenceResolver');
    expect(processor).toHaveProperty('process');
    expect(processor).toHaveProperty('configure');
    
    // 验证方法是函数
    expect(typeof processor.registerVisitor).toBe('function');
    expect(typeof processor.registerProtocolHandler).toBe('function');
    expect(typeof processor.setReferenceResolver).toBe('function');
    expect(typeof processor.process).toBe('function');
    expect(typeof processor.configure).toBe('function');
  });
  
  it('应该能够调用各种方法', () => {
    // 模拟对象
    const mockVisitor: NodeVisitor = { priority: 100 };
    const mockOptions: ProcessorOptions = {};
    const mockProtocolHandler: ProtocolHandler = {
      canHandle: vi.fn(),
      handle: vi.fn()
    };
    const mockReferenceResolver: ReferenceResolver = {
      resolve: vi.fn(),
      getProtocolHandler: vi.fn()
    };
    const mockDocument: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { 
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };
    
    // 创建处理器
    const registerVisitor = vi.fn();
    const registerProtocolHandler = vi.fn();
    const setReferenceResolver = vi.fn();
    const process = vi.fn().mockResolvedValue(mockDocument);
    const configure = vi.fn();
    
    const processor: Processor = {
      registerVisitor,
      registerProtocolHandler,
      setReferenceResolver,
      process,
      configure
    };
    
    // 调用方法
    processor.registerVisitor(mockVisitor);
    processor.registerProtocolHandler(mockProtocolHandler);
    processor.setReferenceResolver(mockReferenceResolver);
    processor.configure(mockOptions);
    processor.process(mockDocument);
    
    // 验证方法被调用
    expect(registerVisitor).toHaveBeenCalledWith(mockVisitor);
    expect(registerProtocolHandler).toHaveBeenCalledWith(mockProtocolHandler);
    expect(setReferenceResolver).toHaveBeenCalledWith(mockReferenceResolver);
    expect(configure).toHaveBeenCalledWith(mockOptions);
    expect(process).toHaveBeenCalledWith(mockDocument);
  });
}); 