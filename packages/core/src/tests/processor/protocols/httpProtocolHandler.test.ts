/**
 * HttpProtocolHandler测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reference, NodeType } from '../../../types/node';
import { HttpProtocolHandler } from '../../../processor/protocols/httpProtocolHandler';

// 模拟fetch API
vi.stubGlobal('fetch', vi.fn());
vi.stubGlobal('AbortController', vi.fn(() => ({
  abort: vi.fn(),
  signal: 'mock-signal'
})));

// 创建清除超时的模拟
vi.stubGlobal('clearTimeout', vi.fn());
vi.stubGlobal('setTimeout', vi.fn().mockReturnValue('timeout-id'));

describe('HttpProtocolHandler', () => {
  let handler: HttpProtocolHandler;
  
  // 创建测试引用对象的辅助函数
  const createReference = (path: string, protocol = 'http'): Reference => ({
    type: NodeType.REFERENCE,
    protocol,
    path,
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    handler = new HttpProtocolHandler();
  });
  
  it('应该正确识别支持的协议', () => {
    expect(handler.canHandle('http')).toBe(true);
    expect(handler.canHandle('https')).toBe(true);
    expect(handler.canHandle('file')).toBe(false);
    expect(handler.canHandle('id')).toBe(false);
    expect(handler.canHandle('')).toBe(false);
  });
  
  it('应该使用正确的默认选项', () => {
    // 通过访问私有属性测试（这不是最佳实践，但在这里为了测试目的使用）
    expect((handler as any).timeout).toBe(30000);
    expect((handler as any).allowInsecure).toBe(false);
    
    // 创建自定义选项的处理器
    const customHandler = new HttpProtocolHandler({
      timeout: 5000,
      allowInsecure: true
    });
    
    expect((customHandler as any).timeout).toBe(5000);
    expect((customHandler as any).allowInsecure).toBe(true);
  });
  
  it('应该处理HTTP引用并获取文本响应', async () => {
    const reference = createReference('example.com/text');
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: vi.fn().mockReturnValue('text/plain')
      },
      text: vi.fn().mockResolvedValue('这是文本内容'),
      json: vi.fn()
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    
    const result = await handler.handle(reference);
    
    expect(fetch).toHaveBeenCalledWith('http://example.com/text', {
      signal: 'mock-signal',
      rejectUnauthorized: true
    });
    expect(result).toBe('这是文本内容');
    expect(mockResponse.text).toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 30000);
    expect(clearTimeout).toHaveBeenCalledWith('timeout-id');
  });
  
  it('应该处理HTTPS引用', async () => {
    const reference = createReference('secure.example.com', 'https');
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('text/plain')
      },
      text: vi.fn().mockResolvedValue('安全内容'),
      json: vi.fn()
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    
    const result = await handler.handle(reference);
    
    expect(fetch).toHaveBeenCalledWith('https://secure.example.com', expect.any(Object));
    expect(result).toBe('安全内容');
  });
  
  it('应该处理JSON响应', async () => {
    const reference = createReference('api.example.com/data');
    const mockJsonData = { key: '值', items: [1, 2, 3] };
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json')
      },
      json: vi.fn().mockResolvedValue(mockJsonData),
      text: vi.fn()
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    
    const result = await handler.handle(reference);
    
    expect(result).toEqual(mockJsonData);
    expect(mockResponse.json).toHaveBeenCalled();
    expect(mockResponse.text).not.toHaveBeenCalled();
  });
  
  it('应该处理HTTP错误', async () => {
    const reference = createReference('example.com/not-found');
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: vi.fn()
      }
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    
    await expect(handler.handle(reference)).rejects.toThrow('HTTP 错误: 404 Not Found');
  });
  
  it('应该处理请求超时', async () => {
    const reference = createReference('slow.example.com');
    
    // 模拟AbortError
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    (fetch as any).mockRejectedValue(abortError);
    
    await expect(handler.handle(reference)).rejects.toThrow('请求超时: http://slow.example.com');
  });
  
  it('应该处理网络错误', async () => {
    const reference = createReference('error.example.com');
    
    (fetch as any).mockRejectedValue(new Error('网络连接失败'));
    
    await expect(handler.handle(reference)).rejects.toThrow('网络连接失败');
  });
  
  it('应该使用配置的超时时间', async () => {
    const customHandler = new HttpProtocolHandler({ timeout: 5000 });
    const reference = createReference('example.com');
    const mockResponse = {
      ok: true,
      headers: { get: vi.fn().mockReturnValue('text/plain') },
      text: vi.fn().mockResolvedValue('内容')
    };
    
    (fetch as any).mockResolvedValue(mockResponse);
    
    await customHandler.handle(reference);
    
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
}); 