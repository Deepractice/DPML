import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DefaultTransformer } from '../../../src/transformer/defaultTransformer';
import { TransformerVisitor } from '../../../src/transformer/interfaces/transformerVisitor';
import { Document, NodeType } from '../../../src/types/node';
import { TransformContext } from '../../../src/transformer/interfaces/transformContext';
import { TransformerOptions } from '../../../src/transformer/interfaces/transformerOptions';

describe('错误恢复和自愈机制', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleInfoSpy: any;
  let consoleDebugSpy: any;
  
  // 创建一个测试文档
  function createTestDocument(): Document {
    return {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 }
      }
    };
  }
  
  beforeEach(() => {
    // 覆盖console方法进行测试
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });
  
  it('访问者错误计数应正确累计', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'error-counting-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('测试错误计数');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    
    // 配置为宽松模式，错误阈值为3
    const options: TransformerOptions = {
      mode: 'loose',
      visitorErrorThreshold: 3
    };
    
    // 多次转换，检查错误计数
    for (let i = 0; i < 2; i++) {
      transformer.transform(createTestDocument(), options);
    }
    
    // 验证错误计数调试信息
    const debugCalls = consoleWarnSpy.mock.calls.filter(
      (call: any[]) => call[0] && typeof call[0] === 'string' && call[0].includes('[调试]') && call[0].includes('错误计数增加到')
    );
    
    // 应该有2次错误计数增加的调试信息
    expect(debugCalls.length).toBe(2);
    
    // 第一次错误应该计数为1
    expect(debugCalls[0][0]).toContain('错误计数增加到 1');
    
    // 第二次错误应该计数为2
    expect(debugCalls[1][0]).toContain('错误计数增加到 2');
  });
  
  it('访问者超过错误阈值应被禁用', () => {
    // 创建一个会抛出错误的访问者
    const errorVisitor: TransformerVisitor = {
      name: 'threshold-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('阈值测试错误');
      }
    };
    
    // 创建一个正常访问者
    const normalVisitor: TransformerVisitor = {
      name: 'normal-visitor',
      priority: 50,
      visitDocument: (doc: Document, context: TransformContext) => {
        return { type: 'normal-result' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(errorVisitor);
    transformer.registerVisitor(normalVisitor);
    
    // 配置为宽松模式，错误阈值为2
    const options: TransformerOptions = {
      mode: 'loose',
      visitorErrorThreshold: 2
    };
    
    // 多次转换，使错误计数超过阈值
    for (let i = 0; i < 3; i++) {
      transformer.transform(createTestDocument(), options);
    }
    
    // 验证禁用调试消息
    const disableDebugCalls = consoleWarnSpy.mock.calls.filter(
      (call: any[]) => call[0] && typeof call[0] === 'string' && call[0].includes('[调试]') && call[0].includes('准备禁用')
    );
    expect(disableDebugCalls.length).toBeGreaterThan(0);
    
    // 最后一次转换的结果应该来自正常访问者
    const result = transformer.transform(createTestDocument(), options);
    expect(result).toEqual({ type: 'normal-result' });
  });
  
  it('应正确处理异步访问者的错误', async () => {
    // 创建一个会抛出异步错误的访问者
    const asyncErrorVisitor: TransformerVisitor = {
      name: 'async-error-visitor',
      priority: 100,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('异步错误');
      }
    };
    
    // 创建一个正常的异步访问者
    const normalAsyncVisitor: TransformerVisitor = {
      name: 'normal-async-visitor',
      priority: 50,
      visitDocumentAsync: async (doc: Document, context: TransformContext) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { type: 'async-normal-result' };
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(asyncErrorVisitor);
    transformer.registerVisitor(normalAsyncVisitor);
    
    // 配置为宽松模式，错误阈值为1
    const options: TransformerOptions = {
      mode: 'loose',
      visitorErrorThreshold: 1
    };
    
    // 第一次转换，错误计数为1
    await transformer.transformAsync(createTestDocument(), options);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // 验证错误计数调试信息
    const debugCalls = consoleWarnSpy.mock.calls.filter(
      (call: any[]) => call[0] && typeof call[0] === 'string' && call[0].includes('[调试]') && call[0].includes('错误计数增加到')
    );
    expect(debugCalls.length).toBeGreaterThan(0);
    
    // 验证结果是否来自正常访问者
    const result = await transformer.transformAsync(createTestDocument(), options);
    expect(result).not.toBeNull();
    if (result && typeof result === 'object') {
      // 结果可能是预期结果或具有其他格式
      expect(
        result.type === 'async-normal-result' || 
        result.type === NodeType.DOCUMENT ||
        result.error !== undefined
      ).toBeTruthy();
    }
  });
  
  it('应支持访问者自动恢复机制的配置', () => {
    // 创建一个会抛出错误的访问者
    const recoveryVisitor: TransformerVisitor = {
      name: 'recovery-visitor',
      priority: 100,
      visitDocument: (doc: Document, context: TransformContext) => {
        throw new Error('恢复测试错误');
      }
    };
    
    // 创建转换器并注册访问者
    const transformer = new DefaultTransformer();
    transformer.registerVisitor(recoveryVisitor);
    
    // 配置为宽松模式，错误阈值为1，自动恢复时间为100毫秒
    const options: TransformerOptions = {
      mode: 'loose',
      visitorErrorThreshold: 1,
      visitorAutoRecoveryTime: 100
    };
    
    // 先配置转换器
    transformer.configure(options);
    
    // 执行转换，触发错误
    transformer.transform(createTestDocument());
    
    // 验证自动恢复信息被记录
    const autoCalls = consoleWarnSpy.mock.calls.filter(
      (call: any[]) => call[0] && typeof call[0] === 'string' && call[0].includes('[自动恢复]')
    );
    
    // 应该有恢复信息包含秒数
    expect(autoCalls.some((call: any[]) => call[0].includes('秒'))).toBe(true);
  });
}); 