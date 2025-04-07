import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultAdapterChain } from '../../../src/transformer/adapters/defaultAdapterChain';
import { JSONAdapter } from '../../../src/transformer/adapters/jsonAdapter';
import { XMLAdapter } from '../../../src/transformer/adapters/xmlAdapter';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { NodeType } from '../../../src/types/node';
describe('AdapterChain', () => {
    // 创建测试上下文
    const createContext = () => {
        // 创建一个最小化的文档
        const document = {
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
    // 创建自定义测试适配器
    class CounterAdapter {
        constructor() {
            this.count = 0;
        }
        adapt(result, context) {
            this.count++;
            return result;
        }
    }
    class UppercaseAdapter {
        adapt(result, context) {
            if (typeof result === 'string') {
                return result.toUpperCase();
            }
            return result;
        }
    }
    class PrefixAdapter {
        constructor(prefix) {
            this.prefix = prefix;
        }
        adapt(result, context) {
            if (typeof result === 'string') {
                return this.prefix + result;
            }
            return result;
        }
    }
    class ThrowingAdapter {
        adapt(result, context) {
            throw new Error('测试错误');
        }
    }
    class NullAdapter {
        adapt(result, context) {
            return null;
        }
    }
    let chain;
    let context;
    beforeEach(() => {
        chain = new DefaultAdapterChain();
        context = createContext();
    });
    it('应该能添加和获取适配器', () => {
        // 准备
        const adapter1 = new CounterAdapter();
        const adapter2 = new UppercaseAdapter();
        // 执行
        chain.add(adapter1);
        chain.add(adapter2);
        // 验证
        expect(chain.getSize()).toBe(2);
        expect(chain.getAdapters()[0]).toBe(adapter1);
        expect(chain.getAdapters()[1]).toBe(adapter2);
    });
    it('应该能在指定位置插入适配器', () => {
        // 准备
        const adapter1 = new CounterAdapter();
        const adapter2 = new UppercaseAdapter();
        const adapter3 = new PrefixAdapter('测试: ');
        // 执行
        chain.add(adapter1);
        chain.add(adapter2);
        chain.insert(1, adapter3);
        // 验证
        expect(chain.getSize()).toBe(3);
        expect(chain.getAdapters()[0]).toBe(adapter1);
        expect(chain.getAdapters()[1]).toBe(adapter3);
        expect(chain.getAdapters()[2]).toBe(adapter2);
    });
    it('应该能移除适配器', () => {
        // 准备
        const adapter1 = new CounterAdapter();
        const adapter2 = new UppercaseAdapter();
        chain.add(adapter1);
        chain.add(adapter2);
        // 执行
        const removed = chain.remove(0);
        // 验证
        expect(chain.getSize()).toBe(1);
        expect(removed).toBe(adapter1);
        expect(chain.getAdapters()[0]).toBe(adapter2);
    });
    it('应该能清空适配器链', () => {
        // 准备
        chain.add(new CounterAdapter());
        chain.add(new UppercaseAdapter());
        expect(chain.getSize()).toBe(2);
        // 执行
        chain.clear();
        // 验证
        expect(chain.getSize()).toBe(0);
        expect(chain.getAdapters()).toEqual([]);
    });
    it('在默认模式下应该链式处理结果', () => {
        // 准备
        const input = 'test';
        chain.add(new PrefixAdapter('前缀: '));
        chain.add(new UppercaseAdapter());
        // 执行
        const result = chain.adapt(input, context);
        // 验证 - 期望先添加前缀，然后转大写
        expect(result).toBe('前缀: TEST');
    });
    it('当禁用链式结果时应该并行处理', () => {
        // 准备
        const input = 'test';
        const noChainChain = new DefaultAdapterChain({ chainResults: false });
        noChainChain.add(new PrefixAdapter('前缀: '));
        noChainChain.add(new UppercaseAdapter());
        // 执行
        const results = noChainChain.execute(input, context);
        // 验证 - 期望两个适配器都处理原始输入
        expect(results[0]).toBe('前缀: test');
        expect(results[1]).toBe('TEST');
        // adapt应该返回最后一个结果
        expect(noChainChain.adapt(input, context)).toBe('TEST');
    });
    it('当stopOnEmpty为true时，应该在遇到null结果时停止', () => {
        // 准备
        const input = 'test';
        const stopChain = new DefaultAdapterChain({ stopOnEmpty: true });
        const adapter1 = new PrefixAdapter('前缀: ');
        const adapter2 = new NullAdapter();
        const adapter3 = new CounterAdapter();
        stopChain.add(adapter1);
        stopChain.add(adapter2);
        stopChain.add(adapter3);
        // 执行
        const results = stopChain.execute(input, context);
        // 验证
        expect(results.length).toBe(2); // 只有前两个适配器执行了
        expect(results[0]).toBe('前缀: test');
        expect(results[1]).toBeNull();
        expect(adapter3.count).toBe(0); // 第三个适配器没有执行
    });
    it('当stopOnError为true时，应该在遇到错误时停止', () => {
        // 准备
        const input = 'test';
        const stopChain = new DefaultAdapterChain({ stopOnError: true });
        const adapter1 = new PrefixAdapter('前缀: ');
        const adapter2 = new ThrowingAdapter();
        const adapter3 = new CounterAdapter();
        stopChain.add(adapter1);
        stopChain.add(adapter2);
        stopChain.add(adapter3);
        // 执行 & 验证
        expect(() => stopChain.execute(input, context)).toThrow('测试错误');
        expect(adapter3.count).toBe(0); // 第三个适配器没有执行
    });
    it('当stopOnError为false时，应该继续执行后续适配器', () => {
        // 准备
        const input = 'test';
        const continueChain = new DefaultAdapterChain({ stopOnError: false });
        const adapter1 = new PrefixAdapter('前缀: ');
        const adapter2 = new ThrowingAdapter();
        const adapter3 = new CounterAdapter();
        continueChain.add(adapter1);
        continueChain.add(adapter2);
        continueChain.add(adapter3);
        // 执行
        try {
            continueChain.execute(input, context);
        }
        catch (error) {
            // 忽略错误
        }
        // 验证
        expect(adapter3.count).toBe(1); // 第三个适配器应该执行
    });
    it('应该支持实际的适配器组合', () => {
        // 准备
        const input = { name: 'dpml', version: '1.0.0' };
        // 创建适配器链：先转JSON，然后转XML
        chain.add(new JSONAdapter());
        chain.add(new XMLAdapter());
        // 执行
        const result = chain.adapt(input, context);
        // 验证 - 结果应该是将JSON字符串转换为XML
        expect(typeof result).toBe('string');
        expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(result).toContain('<string>'); // XML适配器将JSON字符串作为<string>元素处理
    });
});
//# sourceMappingURL=adapterChain.test.js.map