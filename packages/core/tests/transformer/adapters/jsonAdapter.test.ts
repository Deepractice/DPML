import { describe, it, expect } from 'vitest';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { ProcessedDocument } from '../../../src/processor/interfaces/processor';
import { NodeType } from '../../../src/types/node';
import { JSONAdapter } from '../../../src/transformer/adapters/jsonAdapter';

describe('JSONAdapter', () => {
  // 创建一个简单的文档结果用于测试
  const createSimpleResult = () => {
    return {
      type: 'document',
      meta: {
        title: '测试文档',
        author: '测试作者'
      },
      children: [
        {
          type: 'element',
          name: 'section',
          attributes: {
            id: 'section1',
            class: 'main'
          },
          children: [
            {
              type: 'element',
              name: 'heading',
              level: 1,
              children: [
                {
                  type: 'content',
                  text: '标题内容'
                }
              ]
            }
          ]
        }
      ]
    };
  };

  // 创建包含循环引用的结果
  const createCircularResult = () => {
    const result: any = {
      type: 'document',
      meta: {
        title: '测试文档'
      }
    };
    
    // 创建循环引用
    result.self = result;
    
    return result;
  };

  // 创建上下文
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

  it('应该将对象转换为JSON字符串', () => {
    // 准备
    const adapter = new JSONAdapter();
    const result = createSimpleResult();
    const context = createContext();
    
    // 执行
    const adapted = adapter.adapt(result, context);
    
    // 验证
    expect(typeof adapted).toBe('string');
    
    // 解析JSON字符串
    const parsed = JSON.parse(adapted as string);
    
    // 验证结构完整保留
    expect(parsed).toEqual(result);
  });

  it('应该使用指定的缩进格式化JSON', () => {
    // 准备
    const adapter = new JSONAdapter({ indent: 2 });
    const result = { key: 'value' };
    const context = createContext();
    
    // 执行
    const adapted = adapter.adapt(result, context);
    
    // 验证 - 缩进为2个空格
    const expected = '{\n  "key": "value"\n}';
    expect(adapted).toBe(expected);
  });

  it('应该处理空结果', () => {
    // 准备
    const adapter = new JSONAdapter();
    const context = createContext();
    
    // 执行 - 传递null
    const adapted1 = adapter.adapt(null, context);
    
    // 验证
    expect(adapted1).toBe('null');
    
    // 执行 - 传递undefined
    const adapted2 = adapter.adapt(undefined, context);
    
    // 验证 - undefined应该转换为null
    expect(adapted2).toBe('null');
  });

  it('应该处理原始值', () => {
    // 准备
    const adapter = new JSONAdapter();
    const context = createContext();
    
    // 执行 - 传递字符串
    const adapted1 = adapter.adapt('测试字符串', context);
    
    // 验证
    expect(adapted1).toBe('"测试字符串"');
    
    // 执行 - 传递数字
    const adapted2 = adapter.adapt(123, context);
    
    // 验证
    expect(adapted2).toBe('123');
    
    // 执行 - 传递布尔值
    const adapted3 = adapter.adapt(true, context);
    
    // 验证
    expect(adapted3).toBe('true');
  });

  it('应该处理循环引用', () => {
    // 准备
    const adapter = new JSONAdapter();
    const result = createCircularResult();
    const context = createContext();
    
    // 执行 - 应该捕获循环引用错误并优雅处理
    let adapted;
    expect(() => {
      adapted = adapter.adapt(result, context);
    }).not.toThrow();
    
    // 验证 - 应该返回一个包含错误信息的字符串
    expect(typeof adapted).toBe('string');
    expect(adapted as string).toContain('错误');
    expect(adapted as string).toContain('循环');
  });

  it('应该支持通过选项控制JSON序列化行为', () => {
    // 准备 - 创建一个只包含特定属性的适配器
    const adapter = new JSONAdapter({
      replacer: ['type', 'meta', 'title']
    });
    const result = createSimpleResult();
    const context = createContext();
    
    // 执行
    const adapted = adapter.adapt(result, context);
    
    // 验证 - 解析后的对象应只包含指定的属性
    const parsed = JSON.parse(adapted as string);
    expect(parsed).toHaveProperty('type');
    expect(parsed).toHaveProperty('meta');
    expect(parsed.meta).toHaveProperty('title');
    expect(parsed).not.toHaveProperty('children');
  });
}); 