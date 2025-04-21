import { describe, test, expect, vi, beforeEach } from 'vitest';
import { XMLAdapter } from '../../../../core/parsing/XMLAdapter';
import { createBasicDPMLFixture, createEmptyDPMLFixture, createInvalidDPMLFixture } from '../../../fixtures/parsing/dpmlFixtures';
import { IXMLParser, XMLNode } from '../../../../core/parsing/types';

describe('XMLAdapter', () => {
  // 创建模拟对象并使用类型断言
  const mockXMLParser = {
    parse: vi.fn(),
    parseAsync: vi.fn(),
    configure: vi.fn()
  } as unknown as IXMLParser;
  
  let adapter: XMLAdapter;
  
  beforeEach(() => {
    // 重置模拟
    vi.resetAllMocks();
    // 创建适配器实例
    adapter = new XMLAdapter({ throwOnError: true }, mockXMLParser);
  });
  
  test('UT-XMLAdapter-01: parse方法应正确解析基本XML', () => {
    // 准备
    const mockResult: XMLNode = { 
      type: 'element',
      name: 'root', 
      attributes: {},
      children: [{ 
        type: 'element',
        name: 'child', 
        attributes: { id: 'child1' }, 
        children: [],
        text: '内容'
      }] 
    };
    (mockXMLParser.parse as any).mockReturnValue(mockResult);
    
    // 执行
    const result = adapter.parse(createBasicDPMLFixture());
    
    // 断言
    expect(result).toEqual(mockResult);
    expect(mockXMLParser.parse).toHaveBeenCalledWith(createBasicDPMLFixture());
  });
  
  test('UT-XMLAdapter-02: parse方法应处理空XML', () => {
    // 准备
    const mockResult: XMLNode = { 
      type: 'element',
      name: '', 
      attributes: {},
      children: [] 
    };
    (mockXMLParser.parse as any).mockReturnValue(mockResult);
    
    // 执行
    const result = adapter.parse(createEmptyDPMLFixture());
    
    // 断言
    expect(result).toEqual(mockResult);
    expect(mockXMLParser.parse).toHaveBeenCalledWith(createEmptyDPMLFixture());
  });
  
  test('UT-XMLAdapter-03: parse方法应传递XML解析错误', () => {
    // 准备
    const parseError = new Error('XML解析错误');
    (mockXMLParser.parse as any).mockImplementation(() => {
      throw parseError;
    });
    
    // 执行 & 断言
    expect(() => {
      adapter.parse(createInvalidDPMLFixture());
    }).toThrow(parseError);
    expect(mockXMLParser.parse).toHaveBeenCalledWith(createInvalidDPMLFixture());
  });
  
  test('UT-XMLAdapter-04: parseAsync方法应异步解析XML', async () => {
    // 准备
    const mockResult: XMLNode = { 
      type: 'element',
      name: 'root', 
      attributes: {},
      children: [{ 
        type: 'element',
        name: 'child', 
        attributes: { id: 'child1' }, 
        children: [],
        text: '' 
      }] 
    };
    (mockXMLParser.parseAsync as any).mockResolvedValue(mockResult);
    
    // 执行
    const result = await adapter.parseAsync(createBasicDPMLFixture());
    
    // 断言
    expect(result).toEqual(mockResult);
    expect(mockXMLParser.parseAsync).toHaveBeenCalledWith(createBasicDPMLFixture());
  });
  
  test('parseAsync方法应传递XML解析错误', async () => {
    // 准备
    const parseError = new Error('异步XML解析错误');
    (mockXMLParser.parseAsync as any).mockRejectedValue(parseError);
    
    // 执行 & 断言
    await expect(adapter.parseAsync(createInvalidDPMLFixture())).rejects.toThrow(parseError);
    expect(mockXMLParser.parseAsync).toHaveBeenCalledWith(createInvalidDPMLFixture());
  });
}); 