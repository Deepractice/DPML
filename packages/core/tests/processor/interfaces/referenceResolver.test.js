/**
 * ReferenceResolver接口测试
 */
import { describe, it, expect, vi } from 'vitest';
import { NodeType } from '../../../src/types/node';
describe('ReferenceResolver接口', () => {
    it('应该能够定义具有正确结构的引用解析器', () => {
        // 模拟方法
        const resolve = vi.fn();
        const getProtocolHandler = vi.fn();
        // 创建符合ReferenceResolver接口的对象
        const referenceResolver = {
            resolve,
            getProtocolHandler
        };
        // 验证引用解析器接口的结构
        expect(referenceResolver).toHaveProperty('resolve');
        expect(referenceResolver).toHaveProperty('getProtocolHandler');
        // 验证方法是函数
        expect(typeof referenceResolver.resolve).toBe('function');
        expect(typeof referenceResolver.getProtocolHandler).toBe('function');
    });
    it('应该能够解析引用并返回结果', async () => {
        // 创建模拟引用
        const mockReference = {
            type: NodeType.REFERENCE,
            protocol: 'test',
            path: 'sample/path',
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 1, offset: 0 }
            }
        };
        // 创建模拟处理上下文
        const mockContext = {
            document: {
                type: NodeType.DOCUMENT,
                children: [],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 1, offset: 0 }
                }
            },
            currentPath: '',
            resolvedReferences: new Map(),
            parentElements: [],
            variables: {}
        };
        // 模拟解析结果
        const mockResolvedValue = { content: 'resolved content' };
        const mockResolvedReference = {
            reference: mockReference,
            value: mockResolvedValue
        };
        // 创建引用解析器
        const referenceResolver = {
            resolve: vi.fn().mockResolvedValue(mockResolvedReference),
            getProtocolHandler: vi.fn()
        };
        // 测试resolve方法
        const resolveResult = await referenceResolver.resolve(mockReference, mockContext);
        expect(resolveResult).toEqual(mockResolvedReference);
        expect(referenceResolver.resolve).toHaveBeenCalledWith(mockReference, mockContext);
    });
    it('应该能够获取协议处理器', () => {
        // 创建模拟协议处理器
        const mockProtocolHandler = {
            canHandle: vi.fn(),
            handle: vi.fn()
        };
        // 创建引用解析器
        const getProtocolHandler = vi.fn().mockReturnValue(mockProtocolHandler);
        const referenceResolver = {
            resolve: vi.fn(),
            getProtocolHandler
        };
        // 测试getProtocolHandler方法
        const handler = referenceResolver.getProtocolHandler('test');
        expect(handler).toBe(mockProtocolHandler);
        expect(getProtocolHandler).toHaveBeenCalledWith('test');
    });
    it('应该能够返回undefined表示不支持的协议', () => {
        // 创建引用解析器
        const referenceResolver = {
            resolve: vi.fn(),
            getProtocolHandler: vi.fn().mockReturnValue(undefined)
        };
        // 测试不支持的协议
        const handler = referenceResolver.getProtocolHandler('unsupported');
        expect(handler).toBeUndefined();
    });
});
//# sourceMappingURL=referenceResolver.test.js.map