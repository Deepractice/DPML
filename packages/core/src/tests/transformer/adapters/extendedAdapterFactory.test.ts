import { describe, it, expect, beforeEach } from 'vitest';
import { OutputAdapter } from '../../../transformer/interfaces/outputAdapter';
import { TransformContext } from '../../../transformer/interfaces/transformContext';
import { ExtendedOutputAdapterFactory } from '../../../transformer/adapters/extendedOutputAdapterFactory';
import { AdapterChainBuilder } from '../../../transformer/adapters/adapterChainBuilder';
import { JSONAdapter } from '../../../transformer/adapters/jsonAdapter';
import { XMLAdapter } from '../../../transformer/adapters/xmlAdapter';
import { GenericAdapter } from '../../../transformer/adapters/genericAdapter';
import { ContextManager } from '../../../transformer/context/contextManager';
import { ProcessedDocument } from '../../../processor/interfaces/processor';
import { NodeType } from '../../../types/node';

describe('扩展适配器工厂和链构建器', () => {
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
  
  // 自定义测试适配器
  class UppercaseAdapter implements OutputAdapter {
    adapt(result: any, context: TransformContext): any {
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    }
  }
  
  class PrettyAdapter implements OutputAdapter {
    adapt(result: any, context: TransformContext): any {
      if (typeof result === 'string') {
        try {
          // 尝试美化JSON
          const obj = JSON.parse(result);
          return JSON.stringify(obj, null, 2);
        } catch (e) {
          // 不是有效的JSON，返回原始结果
          return result;
        }
      }
      return result;
    }
  }
  
  class MinifyAdapter implements OutputAdapter {
    adapt(result: any, context: TransformContext): any {
      if (typeof result === 'string') {
        // 移除所有空白
        return result.replace(/\s+/g, '');
      }
      return result;
    }
  }
  
  let factory: ExtendedOutputAdapterFactory;
  let context: TransformContext;
  
  beforeEach(() => {
    factory = new ExtendedOutputAdapterFactory();
    context = createContext();
    
    // 注册基本适配器
    factory.register('json', new JSONAdapter());
    factory.register('xml', new XMLAdapter());
    factory.register('pretty', new PrettyAdapter());
    factory.register('minify', new MinifyAdapter());
    factory.register('uppercase', new UppercaseAdapter());
  });
  
  describe('扩展适配器工厂', () => {
    it('应该支持格式别名', () => {
      // 准备
      factory.addAlias('js', 'json');
      factory.addAlias('markup', 'xml');
      
      // 执行 & 验证
      expect(factory.getAdapter('js')).toBeInstanceOf(JSONAdapter);
      expect(factory.getAdapter('markup')).toBeInstanceOf(XMLAdapter);
      expect(factory.supportsFormat('js')).toBe(true);
      expect(factory.supportsFormat('markup')).toBe(true);
    });
    
    it('应该支持获取和移除别名', () => {
      // 准备
      factory.addAlias('js', 'json');
      factory.addAlias('markup', 'xml');
      
      // 执行
      const aliases = factory.getAliases();
      factory.removeAlias('js');
      
      // 验证
      expect(aliases).toHaveProperty('js', 'json');
      expect(aliases).toHaveProperty('markup', 'xml');
      
      expect(factory.supportsFormat('js')).toBe(false);
      expect(factory.supportsFormat('markup')).toBe(true);
    });
    
    it('应该支持动态适配器映射', () => {
      // 准备
      const mapper = (format: string) => {
        if (format.endsWith('-uppercase')) {
          return new UppercaseAdapter();
        }
        return null;
      };
      
      factory.setFormatMapper(mapper);
      
      // 执行 & 验证
      expect(factory.getAdapter('any-uppercase')).toBeInstanceOf(UppercaseAdapter);
      expect(factory.supportsFormat('any-uppercase')).toBe(true);
      expect(factory.supportsFormat('unknown')).toBe(false);
    });
    
    it('应该能构建和使用适配器链', () => {
      // 准备
      const data = { name: 'test', value: 123 };
      
      // 执行
      const chain = factory.buildChain(['json', 'pretty']);
      const result = chain?.adapt(data, context);
      
      // 验证
      expect(chain).not.toBeNull();
      expect(result).toContain('  "name": "test"');
      expect(result).toContain('  "value": 123');
    });
  });
  
  describe('适配器链构建器', () => {
    it('应该支持链式API构建适配器链', () => {
      // 准备
      const data = { name: 'test', value: 123 };
      
      // 执行
      const chain = AdapterChainBuilder.create()
        .withFactory(factory)
        .add('json')
        .add('pretty')
        .build();
      
      const result = chain.adapt(data, context);
      
      // 验证
      expect(result).toContain('  "name": "test"');
      expect(result).toContain('  "value": 123');
    });
    
    it('应该支持添加多个适配器', () => {
      // 准备
      const data = { name: 'test', value: 123 };
      
      // 执行
      const chain = AdapterChainBuilder.create()
        .withFactory(factory)
        .addAll(['json', 'pretty', 'uppercase'])
        .build();
      
      const result = chain.adapt(data, context);
      
      // 验证 - 先转JSON，再美化，最后转大写
      expect(result).toContain('  "NAME": "TEST"');
      expect(result).toContain('  "VALUE": 123');
    });
    
    it('应该支持复合格式构建', () => {
      // 准备
      factory.register('json-pretty', factory.buildChain(['json', 'pretty'])!);
      const data = { name: 'test', value: 123 };
      
      // 执行
      const chain = AdapterChainBuilder.create()
        .withFactory(factory)
        .forFormat('json-pretty')
        .add('uppercase')
        .build();
      
      const result = chain.adapt(data, context);
      
      // 验证
      expect(result).toContain('  "NAME": "TEST"');
      expect(result).toContain('  "VALUE": 123');
    });
    
    it('应该能动态分析复合格式', () => {
      // 准备
      const data = { name: 'test', value: 123 };
      
      // 执行
      const chain = AdapterChainBuilder.create()
        .withFactory(factory)
        .forFormat('json-pretty-uppercase')
        .build();
      
      const result = chain.adapt(data, context);
      
      // 验证
      expect(result).toContain('  "NAME": "TEST"');
      expect(result).toContain('  "VALUE": 123');
    });
  });
}); 