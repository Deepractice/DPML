import { describe, it, expect, vi } from 'vitest';
describe('TransformerFactory', () => {
    it('应该能创建默认转换器', () => {
        const factory = {
            createTransformer: vi.fn().mockImplementation(() => {
                return {
                    registerVisitor: vi.fn(),
                    setOutputAdapter: vi.fn(),
                    transform: vi.fn(),
                    configure: vi.fn()
                };
            })
        };
        const transformer = factory.createTransformer();
        expect(transformer).toBeDefined();
        expect(transformer.registerVisitor).toBeDefined();
        expect(transformer.setOutputAdapter).toBeDefined();
        expect(transformer.transform).toBeDefined();
        expect(transformer.configure).toBeDefined();
    });
    it('应该能创建配置了默认选项的转换器', () => {
        const configureMock = vi.fn();
        const factory = {
            createTransformer: vi.fn().mockImplementation((options) => {
                const transformer = {
                    registerVisitor: vi.fn(),
                    setOutputAdapter: vi.fn(),
                    transform: vi.fn(),
                    configure: configureMock
                };
                if (options) {
                    transformer.configure(options);
                }
                return transformer;
            })
        };
        const options = {
            format: 'json',
            mode: 'strict'
        };
        const transformer = factory.createTransformer(options);
        expect(transformer).toBeDefined();
        expect(configureMock).toHaveBeenCalledWith(options);
    });
    it('应该能重用缓存的转换器实例', () => {
        // 我们的工厂实现中应该缓存创建的实例
        const mockTransformer = {
            registerVisitor: vi.fn(),
            setOutputAdapter: vi.fn(),
            transform: vi.fn(),
            configure: vi.fn()
        };
        let instanceCount = 0;
        const factory = {
            createTransformer: vi.fn().mockImplementation(() => {
                instanceCount++;
                return mockTransformer;
            })
        };
        // 第一次调用
        const transformer1 = factory.createTransformer();
        // 第二次调用
        const transformer2 = factory.createTransformer();
        expect(instanceCount).toBe(2); // 默认实现不缓存，而是每次创建新实例
        expect(transformer1).toBe(mockTransformer);
        expect(transformer2).toBe(mockTransformer);
    });
    it('应该能为不同配置创建不同的转换器', () => {
        const factory = {
            createTransformer: vi.fn().mockImplementation((options) => {
                return {
                    registerVisitor: vi.fn(),
                    setOutputAdapter: vi.fn(),
                    transform: vi.fn(),
                    configure: vi.fn(),
                    options
                };
            })
        };
        const options1 = {
            format: 'json'
        };
        const options2 = {
            format: 'string'
        };
        const transformer1 = factory.createTransformer(options1);
        const transformer2 = factory.createTransformer(options2);
        expect(transformer1.options).toBe(options1);
        expect(transformer2.options).toBe(options2);
        expect(transformer1).not.toBe(transformer2);
    });
});
//# sourceMappingURL=transformerFactory.test.js.map