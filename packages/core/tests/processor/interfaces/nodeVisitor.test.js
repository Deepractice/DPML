/**
 * NodeVisitor接口测试
 */
import { describe, it, expect } from 'vitest';
describe('NodeVisitor接口', () => {
    it('应该能够定义具有正确结构的访问者', () => {
        // 创建符合NodeVisitor接口的对象
        const visitor = {
            priority: 100,
            visitDocument: async (document, context) => {
                // 简单实现，返回原始文档
                return document;
            },
            visitElement: async (element, context) => {
                // 简单实现，返回原始元素
                return element;
            },
            visitContent: async (content, context) => {
                // 简单实现，返回原始内容
                return content;
            },
            visitReference: async (reference, context) => {
                // 简单实现，返回原始引用
                return reference;
            }
        };
        // 验证访问者接口的结构
        expect(visitor).toHaveProperty('priority');
        expect(visitor).toHaveProperty('visitDocument');
        expect(visitor).toHaveProperty('visitElement');
        expect(visitor).toHaveProperty('visitContent');
        expect(visitor).toHaveProperty('visitReference');
        // 验证方法是函数
        expect(typeof visitor.visitDocument).toBe('function');
        expect(typeof visitor.visitElement).toBe('function');
        expect(typeof visitor.visitContent).toBe('function');
        expect(typeof visitor.visitReference).toBe('function');
    });
    it('应该允许只实现部分方法的访问者', () => {
        // 创建只实现部分方法的访问者
        const partialVisitor = {
            priority: 50,
            // 只实现元素访问方法
            visitElement: async (element, context) => {
                return element;
            }
        };
        // 验证访问者接口的结构
        expect(partialVisitor).toHaveProperty('priority');
        expect(partialVisitor).toHaveProperty('visitElement');
        expect(partialVisitor.visitDocument).toBeUndefined();
        expect(partialVisitor.visitContent).toBeUndefined();
        expect(partialVisitor.visitReference).toBeUndefined();
        // 验证方法是函数
        expect(typeof partialVisitor.visitElement).toBe('function');
    });
});
//# sourceMappingURL=nodeVisitor.test.js.map