import { describe, it, expect, beforeEach } from 'vitest';
import { OutputAdapter } from '../../../src/transformer/interfaces/outputAdapter';
import { OutputAdapterFactory } from '../../../src/transformer/interfaces/outputAdapterFactory';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { DefaultOutputAdapterFactory } from '../../../src/transformer/adapters/defaultOutputAdapterFactory';
import { GenericAdapter } from '../../../src/transformer/adapters/genericAdapter';
import { JSONAdapter } from '../../../src/transformer/adapters/jsonAdapter';
import { XMLAdapter } from '../../../src/transformer/adapters/xmlAdapter';
import { MarkdownAdapter } from '../../../src/transformer/adapters/markdownAdapter';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { NodeType } from '../../../src/types/node';

describe('OutputAdapterFactory', () => {
  // 创建一个测试上下文
  const createContext = (): TransformContext => {
    // 创建一个最小化的文档
    const document: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };

    // 创建上下文管理器
    const contextManager = new ContextManager();
    
    // 返回根上下文
    return contextManager.createRootContext(document, {});
  };

  // 自定义测试适配器
  class TestAdapter implements OutputAdapter {
    adapt(result: any, context: TransformContext): any {
      return { type: 'test', data: result };
    }
  }

  let factory: OutputAdapterFactory;

  beforeEach(() => {
    // 创建一个新的适配器工厂实例用于每个测试
    factory = new DefaultOutputAdapterFactory();
  });

  it('应该能够注册和获取适配器', () => {
    // 准备
    const adapter = new TestAdapter();
    
    // 执行
    factory.register('test', adapter);
    const retrieved = factory.getAdapter('test');
    
    // 验证
    expect(retrieved).toBe(adapter);
  });

  it('应该能够注册适配器工厂函数', () => {
    // 准备
    let count = 0;
    const adapterFactory = () => {
      count++;
      return new TestAdapter();
    };
    
    // 执行
    factory.register('test', adapterFactory);
    const adapter1 = factory.getAdapter('test');
    const adapter2 = factory.getAdapter('test');
    
    // 验证
    expect(adapter1).toBeInstanceOf(TestAdapter);
    expect(adapter2).toBeInstanceOf(TestAdapter);
    expect(adapter1).not.toBe(adapter2); // 应该是不同的实例
    expect(count).toBe(2); // 工厂函数应该被调用两次
  });

  it('应该返回所有已注册的格式', () => {
    // 准备
    factory.register('json', new JSONAdapter());
    factory.register('xml', new XMLAdapter());
    factory.register('md', new MarkdownAdapter());
    
    // 执行
    const formats = factory.getRegisteredFormats();
    
    // 验证
    expect(formats).toContain('json');
    expect(formats).toContain('xml');
    expect(formats).toContain('md');
    expect(formats.length).toBe(3);
  });

  it('应该正确检测格式支持情况', () => {
    // 准备
    factory.register('json', new JSONAdapter());
    
    // 执行 & 验证
    expect(factory.supportsFormat('json')).toBe(true);
    expect(factory.supportsFormat('xml')).toBe(false);
  });

  it('应该使用默认适配器当请求的格式不存在', () => {
    // 准备
    const defaultAdapter = new GenericAdapter();
    factory.register('generic', defaultAdapter);
    factory.setDefaultAdapter('generic');
    
    // 执行
    const adapter = factory.getAdapter('unknown');
    
    // 验证
    expect(adapter).toBe(defaultAdapter);
  });

  it('在严格模式下应该返回null当请求的格式不存在', () => {
    // 准备
    factory = new DefaultOutputAdapterFactory({ strictMatching: true });
    factory.register('generic', new GenericAdapter());
    factory.setDefaultAdapter('generic');
    
    // 执行
    const adapter = factory.getAdapter('unknown');
    
    // 验证
    expect(adapter).toBeNull();
  });

  it('应该支持不区分大小写的格式匹配', () => {
    // 准备
    const adapter = new JSONAdapter();
    factory.register('JSON', adapter);
    
    // 执行 & 验证
    expect(factory.getAdapter('json')).toBe(adapter);
    expect(factory.getAdapter('Json')).toBe(adapter);
    expect(factory.getAdapter('JSON')).toBe(adapter);
  });

  it('应该支持格式别名', () => {
    // 准备
    const factory = new DefaultOutputAdapterFactory();
    const mdAdapter = new MarkdownAdapter();
    
    // 注册带有别名的适配器
    factory.register('md', mdAdapter);
    factory.register('markdown', mdAdapter);
    
    // 执行 & 验证
    expect(factory.getAdapter('md')).toBe(mdAdapter);
    expect(factory.getAdapter('markdown')).toBe(mdAdapter);
  });

  it('应该能够覆盖已注册的适配器', () => {
    // 准备
    const adapter1 = new TestAdapter();
    const adapter2 = new TestAdapter();
    
    // 执行
    factory.register('test', adapter1);
    const first = factory.getAdapter('test');
    
    factory.register('test', adapter2);
    const second = factory.getAdapter('test');
    
    // 验证
    expect(first).toBe(adapter1);
    expect(second).toBe(adapter2);
    expect(first).not.toBe(second);
  });
  
  it('应该能适配各种格式的结果', () => {
    // 准备
    const result = { key: 'value' };
    const context = createContext();
    
    // 注册不同的适配器
    factory.register('json', new JSONAdapter());
    factory.register('xml', new XMLAdapter());
    factory.register('md', new MarkdownAdapter());
    factory.register('generic', new GenericAdapter());
    
    // 执行
    const jsonAdapter = factory.getAdapter('json');
    const xmlAdapter = factory.getAdapter('xml');
    const mdAdapter = factory.getAdapter('md');
    const genericAdapter = factory.getAdapter('generic');
    
    // 验证
    expect(jsonAdapter).not.toBeNull();
    expect(xmlAdapter).not.toBeNull();
    expect(mdAdapter).not.toBeNull();
    expect(genericAdapter).not.toBeNull();
    
    if (jsonAdapter && xmlAdapter && mdAdapter && genericAdapter) {
      const jsonResult = jsonAdapter.adapt(result, context);
      const xmlResult = xmlAdapter.adapt(result, context);
      const mdResult = mdAdapter.adapt(result, context);
      const genericResult = genericAdapter.adapt(result, context);
      
      expect(typeof jsonResult).toBe('string');
      expect(jsonResult).toContain('"key":"value"');
      
      expect(typeof xmlResult).toBe('string');
      expect(xmlResult).toContain('key="value"');  // XML适配器将简单对象的键值作为属性处理
      
      expect(typeof mdResult).toBe('string');
      
      expect(genericResult).toEqual(result); // 通用适配器应保持输入不变
    }
  });
}); 