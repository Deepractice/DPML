import { describe, test, expect, vi, beforeEach } from 'vitest';
import { parserFactory } from '../../../../core/parsing/parserFactory';
import { DPMLAdapter } from '../../../../core/parsing/DPMLAdapter';
import { XMLAdapter } from '../../../../core/parsing/XMLAdapter';
import { ParseOptions } from '../../../../types/ParseOptions';

// 模拟依赖模块
vi.mock('../../../../core/parsing/DPMLAdapter');
vi.mock('../../../../core/parsing/XMLAdapter');

describe('parserFactory', () => {
  // 每个测试前重置模拟
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  test('UT-ParserFactory-01: createDPMLAdapter应创建正确配置的适配器', () => {
    // 准备
    const options: ParseOptions = { 
      throwOnError: true,
      fileName: 'test.dpml'
    };
    
    // 执行
    const adapter = parserFactory.createDPMLAdapter(options);
    
    // 断言
    // 验证XMLAdapter构造函数被调用
    expect(XMLAdapter).toHaveBeenCalledWith(options, expect.anything());
    
    // 验证DPMLAdapter构造函数被调用并传入正确的参数
    expect(DPMLAdapter).toHaveBeenCalledWith(options, expect.any(XMLAdapter));
    
    // 验证返回的是DPMLAdapter实例
    expect(adapter).toBeInstanceOf(DPMLAdapter);
  });
  
  test('UT-ParserFactory-02: createDPMLAdapter应使用默认选项', () => {
    // 执行
    const adapter = parserFactory.createDPMLAdapter();
    
    // 断言
    // 验证XMLAdapter构造函数被调用并传入空对象
    expect(XMLAdapter).toHaveBeenCalledWith({}, expect.anything());
    
    // 验证DPMLAdapter构造函数被调用
    expect(DPMLAdapter).toHaveBeenCalled();
    
    // 验证返回的是DPMLAdapter实例
    expect(adapter).toBeInstanceOf(DPMLAdapter);
  });
  
  test('UT-ParserFactory-03: createXMLAdapter应创建XML适配器', () => {
    // 准备
    const options: ParseOptions = { 
      throwOnError: true,
      xmlParserOptions: {
        preserveWhitespace: false
      }
    };
    
    // 这里使用内部方法，可能需要类型断言或使用其他方法来测试
    // @ts-ignore - 访问内部方法
    const adapter = parserFactory.createXMLAdapter(options);
    
    // 断言
    // 验证XMLAdapter构造函数被调用并传入正确的选项
    expect(XMLAdapter).toHaveBeenCalledWith(options, expect.anything());
    
    // 验证返回的是XMLAdapter实例
    expect(adapter).toBeInstanceOf(XMLAdapter);
  });
  
  test('UT-ParserFactory-04: createXMLAdapter应注入XML解析器', () => {
    // 准备 - 模拟默认XML解析器
    const mockXMLParser = { 
      parse: vi.fn(),
      parseAsync: vi.fn(),
      configure: vi.fn()
    };
    
    // 替换factory内部使用的解析器
    // @ts-ignore - 修改内部属性进行测试
    parserFactory._xmlParser = mockXMLParser;
    
    // 执行 - 使用内部方法
    // @ts-ignore - 访问内部方法
    const adapter = parserFactory.createXMLAdapter({});
    
    // 断言
    // 验证XMLAdapter构造函数被调用并传入正确的解析器
    expect(XMLAdapter).toHaveBeenCalledWith({}, mockXMLParser);
    
    // 验证返回的是XMLAdapter实例
    expect(adapter).toBeInstanceOf(XMLAdapter);
    
    // 恢复原始状态
    // @ts-ignore - 清理测试数据
    parserFactory._xmlParser = undefined;
  });
}); 