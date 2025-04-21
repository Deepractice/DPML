import { describe, test, expect, vi, beforeEach } from 'vitest';
import { parse, parseAsync } from '../../../api/parser';
import * as parsingService from '../../../core/parsing/parsingService';
import { DPMLDocument } from '../../../types/DPMLDocument';
import { ParseOptions } from '../../../types/ParseOptions';

// 模拟parsingService模块
vi.mock('../../../core/parsing/parsingService');

describe('parser API契约测试', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  test('CT-API-Parser-01: parse函数应保持API契约稳定', () => {
    // 验证函数类型和签名
    expect(typeof parse).toBe('function');
    
    // 验证调用时不会出错 (参数和类型检查)
    expect(() => {
      // 编译时会对这些调用形式进行类型检查
      const options: ParseOptions = { throwOnError: true };
      
      // 只传内容参数
      parse('content');
      
      // 带选项参数
      parse('content', options);
      
      // 泛型参数
      parse<DPMLDocument>('content');
      parse<DPMLDocument>('content', options);
    }).not.toThrow();
  });
  
  test('CT-API-Parser-02: parse函数应返回符合DPMLDocument类型的结果', () => {
    // 准备 - 模拟parsingService返回标准文档对象
    const mockDocument: DPMLDocument = {
      rootNode: {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null
      },
      nodesById: new Map(),
      metadata: {}
    };
    
    (parsingService.parse as any).mockReturnValue(mockDocument);
    
    // 执行
    const result = parse<DPMLDocument>('content');
    
    // 断言 - 验证返回对象符合类型契约
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.tagName).toBe('root');
    expect(result.metadata).toBeDefined();
    expect(result.nodesById instanceof Map).toBe(true);
  });
  
  test('CT-API-Parser-03: parseAsync函数应返回Promise<DPMLDocument>', async () => {
    // 准备 - 模拟parsingService返回Promise
    const mockDocument: DPMLDocument = {
      rootNode: {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null
      },
      nodesById: new Map(),
      metadata: {}
    };
    
    (parsingService.parseAsync as any).mockResolvedValue(mockDocument);
    
    // 执行
    const resultPromise = parseAsync<DPMLDocument>('content');
    
    // 断言 - 验证返回Promise
    expect(resultPromise instanceof Promise).toBe(true);
    
    // 验证Promise解析为正确结果
    const result = await resultPromise;
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.tagName).toBe('root');
  });
  
  test('CT-API-Parser-04: 错误处理应符合API契约', () => {
    // 准备 - 模拟parsingService抛出错误
    const parseError = new Error('解析错误');
    (parsingService.parse as any).mockImplementation(() => {
      throw parseError;
    });
    
    // 执行 & 断言 - 验证错误传递符合契约
    expect(() => {
      parse('invalid content');
    }).toThrow(parseError);
  });
  
  test('CT-API-Parser-05: parse函数应正确委托到parsingService', () => {
    // 准备
    const content = 'test content';
    const options: ParseOptions = { throwOnError: true };
    
    // 执行
    parse(content, options);
    
    // 断言 - 验证委托行为
    expect(parsingService.parse).toHaveBeenCalledWith(content, options);
  });
  
  test('CT-API-Parser-06: parseAsync函数应正确委托到parsingService', async () => {
    // 准备
    const content = 'test content';
    const options: ParseOptions = { throwOnError: true };
    (parsingService.parseAsync as any).mockResolvedValue({});
    
    // 执行
    await parseAsync(content, options);
    
    // 断言 - 验证委托行为
    expect(parsingService.parseAsync).toHaveBeenCalledWith(content, options);
  });
}); 