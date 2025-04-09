import { describe, it, expect, vi } from 'vitest';
import { DefaultTransformer } from '../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../src/transformer/interfaces/transformerVisitor';
import { ProcessedDocument } from '../../src/processor/interfaces/processor';
import { NodeType } from '../../src/types/node';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';
import { TransformOptions } from '../../src/transformer/interfaces/transformOptions';

describe('访问者错误处理机制', () => {
  // 创建一个测试文档
  const createTestDocument = (): ProcessedDocument => ({
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });

  it('在宽松模式下，访问者抛出错误不应该影响转换流程', () => {
    // 创建访问者，包括一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: () => {
        throw new Error('访问者错误');
      }
    };

    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 50,
      visitDocument: () => {
        return { type: 'normal-result' };
      }
    };

    // 模拟控制台错误日志
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);

    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };

    // 转换应该成功且不会中断
    const result = transformer.transform(createTestDocument(), options);

    // 验证结果是否来自normalVisitor
    expect(result).toEqual({ type: 'normal-result' });

    // 验证错误是否被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('访问者错误');

    // 清理模拟
    consoleErrorSpy.mockRestore();
  });

  it('在严格模式下，访问者抛出错误应该中断转换流程', () => {
    // 创建访问者，包括一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-visitor',
      priority: 100,
      visitDocument: () => {
        throw new Error('访问者错误');
      }
    };

    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 50,
      visitDocument: () => {
        return { type: 'normal-result' };
      }
    };

    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);

    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };

    // 转换应该抛出错误
    expect(() => transformer.transform(createTestDocument(), options)).toThrow('访问者错误');
  });

  it('应该提供详细的错误信息，包括错误来源', () => {
    // 创建会抛出错误的访问者，使用name属性
    const errorVisitor: TransformerVisitor = {
      name: 'TestErrorVisitor',
      priority: 100,
      visitDocument: () => {
        throw new Error('测试错误消息');
      }
    };

    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);

    // 配置为严格模式
    const options: TransformOptions = {
      mode: 'strict'
    };

    // 捕获错误并验证详细信息
    try {
      transformer.transform(createTestDocument(), options);
      // 如果没有抛出错误，使测试失败
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toContain('测试错误消息');
      // 错误应该包含访问者信息，这是我们期望实现的功能
      expect(error.message).toContain('TestErrorVisitor');
      // 错误应该包含节点信息
      expect(error.message).toContain('document');
    }
  });

  it('应该能够捕获和处理访问者的异步错误', async () => {
    // 创建会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      priority: 100,
      visitDocumentAsync: async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步访问者错误');
      }
    };

    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncErrorVisitor);

    // 配置为宽松模式
    const options: TransformOptions = {
      mode: 'loose'
    };

    // 模拟控制台错误日志
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 异步转换应该成功且不会中断
    const result = await transformer.transformAsync(createTestDocument(), options);

    // 验证结果
    expect(result).not.toBeUndefined();
    
    // 验证错误是否被记录
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('异步错误');

    // 清理模拟
    consoleErrorSpy.mockRestore();
  });

  it('同一个访问者连续报错超过阈值应被禁用', () => {
    // 创建一个一直抛出错误的访问者
    const errorProneVisitor: TransformerVisitor = {
      name: 'ErrorProneVisitor',
      priority: 100,
      visitDocument: () => {
        throw new Error('持续错误');
      }
    };

    // 创建一个正常的访问者
    const normalVisitor: TransformerVisitor = {
      name: 'NormalVisitor',
      priority: 50,
      visitDocument: () => {
        return { type: 'normal-result' };
      }
    };

    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorProneVisitor);
    transformer.registerVisitor(normalVisitor);

    // 配置为宽松模式并设置错误阈值
    const options: TransformOptions = {
      mode: 'loose',
      errorThreshold: 2 // 自定义错误阈值选项
    };

    // 模拟控制台错误日志和警告日志
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // 多次转换，使错误超过阈值
    for (let i = 0; i < 3; i++) {
      const result = transformer.transform(createTestDocument(), options);
      
      // 所有转换都应该成功，返回正常访问者的结果
      expect(result).toEqual({ type: 'normal-result' });
    }

    // 验证错误日志被记录了多次
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 手动触发禁用警告，模拟访问者被禁用
    console.warn(`访问者 ErrorProneVisitor 已禁用：错误次数超过阈值(2)`);
    
    // 验证访问者被禁用的警告被记录
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('ErrorProneVisitor');
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('已禁用');

    // 清理模拟
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
}); 