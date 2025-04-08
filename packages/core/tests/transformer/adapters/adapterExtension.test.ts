import { describe, it, expect, beforeEach } from 'vitest';
import { OutputAdapter } from '../../../src/transformer/interfaces/outputAdapter';
import { OutputAdapterFactory } from '../../../src/transformer/interfaces/outputAdapterFactory';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { DefaultOutputAdapterFactory } from '../../../src/transformer/adapters/defaultOutputAdapterFactory';
import { GenericAdapter } from '../../../src/transformer/adapters/genericAdapter';
import { JSONAdapter } from '../../../src/transformer/adapters/jsonAdapter';
import { XMLAdapter } from '../../../src/transformer/adapters/xmlAdapter';
import { AdapterChain } from '../../../src/transformer/interfaces/adapterChain';
import { DefaultAdapterChain } from '../../../src/transformer/adapters/defaultAdapterChain';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { NodeType } from '../../../src/types/node';

describe('适配器扩展机制', () => {
  // 创建测试上下文
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

  // 自定义CSS适配器用于测试
  class CSSAdapter implements OutputAdapter {
    adapt(result: any, context: TransformContext): any {
      if (typeof result === 'object' && result !== null) {
        let css = '';
        for (const [key, value] of Object.entries(result)) {
          css += `${key}: ${value};\n`;
        }
        return css;
      }
      return result;
    }
  }
  
  // 自定义YAML适配器用于测试
  class YAMLAdapter implements OutputAdapter {
    adapt(result: any, context: TransformContext): any {
      if (typeof result === 'object' && result !== null) {
        let yaml = '';
        for (const [key, value] of Object.entries(result)) {
          yaml += `${key}: ${value}\n`;
        }
        return yaml;
      }
      return result;
    }
  }
  
  let factory: OutputAdapterFactory;
  let context: TransformContext;

  beforeEach(() => {
    factory = new DefaultOutputAdapterFactory();
    context = createContext();
  });

  describe('自定义适配器注册', () => {
    it('应该能注册和使用自定义适配器', () => {
      // 准备
      const cssAdapter = new CSSAdapter();
      const data = { color: 'red', fontSize: '14px' };
      
      // 执行
      factory.register('css', cssAdapter);
      const retrievedAdapter = factory.getAdapter('css');
      
      // 验证
      expect(retrievedAdapter).toBe(cssAdapter);
      expect(retrievedAdapter?.adapt(data, context)).toContain('color: red;');
      expect(retrievedAdapter?.adapt(data, context)).toContain('fontSize: 14px;');
    });
    
    it('应该能为同一格式注册多个别名', () => {
      // 准备
      const yamlAdapter = new YAMLAdapter();
      
      // 执行
      factory.register('yaml', yamlAdapter);
      factory.register('yml', yamlAdapter);
      
      // 验证
      expect(factory.getAdapter('yaml')).toBe(yamlAdapter);
      expect(factory.getAdapter('yml')).toBe(yamlAdapter);
    });
  });
  
  describe('适配器链构建', () => {
    it('应该能构建和注册适配器链', () => {
      // 准备
      const data = { name: 'test', value: 123 };
      
      // 创建一个适配器链: JSON -> 大写转换
      const chain = new DefaultAdapterChain();
      chain.add(new JSONAdapter());
      chain.add(new UppercaseAdapter());
      
      // 执行
      factory.register('json-uppercase', chain);
      const retrievedChain = factory.getAdapter('json-uppercase');
      const result = retrievedChain?.adapt(data, context);
      
      // 验证
      expect(retrievedChain).toBe(chain);
      expect(result).toBe(JSON.stringify(data).toUpperCase());
    });
    
    it('应该能动态构建适配器链', () => {
      // 准备
      const data = { name: 'test', value: 123 };
      
      // 注册基础适配器
      factory.register('json', new JSONAdapter());
      factory.register('uppercase', new UppercaseAdapter());
      factory.register('prefix', new PrefixAdapter('RESULT: '));
      
      // 创建动态链构建函数
      const chainFactory = () => {
        const chain = new DefaultAdapterChain();
        chain.add(factory.getAdapter('json') as OutputAdapter);
        chain.add(factory.getAdapter('uppercase') as OutputAdapter);
        return chain;
      };
      
      // 执行
      factory.register('dynamic-chain', chainFactory);
      const result = factory.getAdapter('dynamic-chain')?.adapt(data, context);
      
      // 验证
      expect(result).toBe(JSON.stringify(data).toUpperCase());
    });
  });
  
  describe('适配器工厂扩展', () => {
    it('应该支持格式检测和适配器映射', () => {
      // 准备
      const formats = ['json', 'xml', 'yaml', 'css', 'md'];
      const data = { name: 'test', value: 123 };
      
      // 注册所有测试适配器
      factory.register('json', new JSONAdapter());
      factory.register('xml', new XMLAdapter());
      factory.register('yaml', new YAMLAdapter());
      factory.register('css', new CSSAdapter());
      
      // 执行 & 验证
      // 检查所有已注册格式
      const registered = factory.getRegisteredFormats();
      for (const format of formats) {
        if (format !== 'md') { // md不在注册列表中
          expect(registered).toContain(format);
          expect(factory.supportsFormat(format)).toBe(true);
        }
      }
      
      // 验证未注册格式
      expect(factory.supportsFormat('md')).toBe(false);
      
      // 设置默认适配器
      factory.setDefaultAdapter('json');
      expect(factory.getAdapter('unknown')).not.toBeNull();
      
      // 尝试获取每种格式的适配器并使用
      for (const format of formats) {
        if (format !== 'md') {
          const adapter = factory.getAdapter(format);
          expect(adapter).not.toBeNull();
          const result = adapter?.adapt(data, context);
          expect(result).not.toBeNull();
        }
      }
    });
  });
});

// 辅助测试适配器
class UppercaseAdapter implements OutputAdapter {
  adapt(result: any, context: TransformContext): any {
    if (typeof result === 'string') {
      return result.toUpperCase();
    }
    return result;
  }
}

class PrefixAdapter implements OutputAdapter {
  private prefix: string;
  
  constructor(prefix: string) {
    this.prefix = prefix;
  }
  
  adapt(result: any, context: TransformContext): any {
    if (typeof result === 'string') {
      return this.prefix + result;
    }
    return result;
  }
} 