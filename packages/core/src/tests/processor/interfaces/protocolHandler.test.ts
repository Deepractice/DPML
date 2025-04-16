/**
 * ProtocolHandler接口测试
 */
import { describe, it, expect, vi } from 'vitest';
import { Reference, NodeType } from '../../../types/node';
import { ProtocolHandler } from '../../../processor/interfaces';

describe('ProtocolHandler接口', () => {
  it('应该能够定义具有正确结构的协议处理器', () => {
    // 模拟方法
    const canHandle = vi.fn();
    const handle = vi.fn();
    
    // 创建符合ProtocolHandler接口的对象
    const protocolHandler: ProtocolHandler = {
      canHandle,
      handle
    };
    
    // 验证协议处理器接口的结构
    expect(protocolHandler).toHaveProperty('canHandle');
    expect(protocolHandler).toHaveProperty('handle');
    
    // 验证方法是函数
    expect(typeof protocolHandler.canHandle).toBe('function');
    expect(typeof protocolHandler.handle).toBe('function');
  });
  
  it('应该能够处理引用', async () => {
    // 创建模拟引用
    const mockReference: Reference = {
      type: NodeType.REFERENCE,
      protocol: 'test',
      path: 'sample/path',
      position: { 
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };
    
    // 模拟返回值
    const mockResult = { value: 'test result' };
    
    // 创建协议处理器
    const protocolHandler: ProtocolHandler = {
      canHandle: vi.fn().mockReturnValue(true),
      handle: vi.fn().mockResolvedValue(mockResult)
    };
    
    // 测试canHandle方法
    const canHandleResult = protocolHandler.canHandle('test');
    expect(canHandleResult).toBe(true);
    expect(protocolHandler.canHandle).toHaveBeenCalledWith('test');
    
    // 测试handle方法
    const handleResult = await protocolHandler.handle(mockReference);
    expect(handleResult).toEqual(mockResult);
    expect(protocolHandler.handle).toHaveBeenCalledWith(mockReference);
  });
  
  it('协议处理器应该能够拒绝不支持的协议', () => {
    // 创建协议处理器
    const protocolHandler: ProtocolHandler = {
      canHandle: (protocol) => protocol === 'supported',
      handle: vi.fn()
    };
    
    // 测试支持的协议
    expect(protocolHandler.canHandle('supported')).toBe(true);
    
    // 测试不支持的协议
    expect(protocolHandler.canHandle('unsupported')).toBe(false);
  });
}); 