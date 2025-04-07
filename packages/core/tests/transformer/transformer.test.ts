import { describe, it, expect, vi } from 'vitest';
import { Transformer } from '../../src/transformer/interfaces/transformer';
import { TransformerVisitor } from '../../src/transformer/interfaces/transformerVisitor';
import { OutputAdapter } from '../../src/transformer/interfaces/outputAdapter';
import { ProcessedDocument } from '../../src/processor/interfaces/processor';
import { NodeType } from '../../src/types/node';
import { TransformOptions } from '../../src/transformer/interfaces/transformOptions';

describe('Transformer', () => {
  // 创建模拟数据
  const mockDocument: ProcessedDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    },
    metadata: {
      version: '1.0'
    }
  };

  // 创建模拟访问者
  const mockVisitor: TransformerVisitor = {
    visitDocument: vi.fn().mockReturnValue({ type: 'processed-document' }),
    priority: 100
  };

  // 创建模拟适配器
  const mockAdapter: OutputAdapter = {
    adapt: vi.fn().mockImplementation(result => result)
  };

  // 创建模拟转换选项
  const mockOptions: TransformOptions = {
    format: 'json',
    mode: 'strict'
  };

  it('应该能注册访问者', () => {
    const registerVisitorMock = vi.fn();
    
    const transformer: Transformer = {
      registerVisitor: registerVisitorMock,
      setOutputAdapter: vi.fn(),
      transform: vi.fn(),
      configure: vi.fn()
    };
    
    transformer.registerVisitor(mockVisitor);
    
    expect(registerVisitorMock).toHaveBeenCalledWith(mockVisitor);
  });

  it('应该能设置输出适配器', () => {
    const setOutputAdapterMock = vi.fn();
    
    const transformer: Transformer = {
      registerVisitor: vi.fn(),
      setOutputAdapter: setOutputAdapterMock,
      transform: vi.fn(),
      configure: vi.fn()
    };
    
    transformer.setOutputAdapter(mockAdapter);
    
    expect(setOutputAdapterMock).toHaveBeenCalledWith(mockAdapter);
  });

  it('应该能转换文档', () => {
    const transformMock = vi.fn().mockReturnValue({ type: 'processed-document' });
    
    const transformer: Transformer = {
      registerVisitor: vi.fn(),
      setOutputAdapter: vi.fn(),
      transform: transformMock,
      configure: vi.fn()
    };
    
    const result = transformer.transform(mockDocument, mockOptions);
    
    expect(transformMock).toHaveBeenCalledWith(mockDocument, mockOptions);
    expect(result).toEqual({ type: 'processed-document' });
  });

  it('应该能配置转换器', () => {
    const configureMock = vi.fn();
    
    const transformer: Transformer = {
      registerVisitor: vi.fn(),
      setOutputAdapter: vi.fn(),
      transform: vi.fn(),
      configure: configureMock
    };
    
    transformer.configure(mockOptions);
    
    expect(configureMock).toHaveBeenCalledWith(mockOptions);
  });

  it('应该支持默认选项', () => {
    const transformMock = vi.fn().mockReturnValue({ type: 'processed-document' });
    
    const transformer: Transformer = {
      registerVisitor: vi.fn(),
      setOutputAdapter: vi.fn(),
      transform: transformMock,
      configure: vi.fn()
    };
    
    // 不传入选项
    transformer.transform(mockDocument);
    
    // 检查是否被调用，但不检查undefined参数
    expect(transformMock).toHaveBeenCalled();
    expect(transformMock.mock.calls[0][0]).toBe(mockDocument);
  });
}); 