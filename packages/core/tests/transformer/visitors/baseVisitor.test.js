import { describe, it, expect } from 'vitest';
import { BaseVisitor } from '../../../src/transformer/visitors/baseVisitor';
import { NodeType } from '../../../src/types/node';
// 创建一个BaseVisitor的具体实现类进行测试
class TestVisitor extends BaseVisitor {
    constructor() {
        super(...arguments);
        this.name = 'test-visitor';
        // 记录每种类型的访问次数，便于测试
        this.visitCounts = {
            document: 0,
            element: 0,
            content: 0,
            reference: 0
        };
    }
    // 添加一些测试方法
    visitDocument(node, context) {
        this.visitCounts.document++;
        return super.visitDocument(node, context);
    }
    visitElement(node, context) {
        this.visitCounts.element++;
        return super.visitElement(node, context);
    }
    visitContent(node, context) {
        this.visitCounts.content++;
        return super.visitContent(node, context);
    }
    visitReference(node, context) {
        this.visitCounts.reference++;
        return super.visitReference(node, context);
    }
    // 模拟上下文
    createMockContext() {
        return {
            output: null,
            document: { type: NodeType.DOCUMENT, children: [] },
            options: { visitors: [] },
            variables: {},
            path: [],
            parentResults: []
        };
    }
}
describe('BaseVisitor', () => {
    it('应该实现TransformerVisitor接口', () => {
        // 创建一个BaseVisitor的具体实现
        const visitor = new TestVisitor();
        // 验证
        expect(visitor).toBeInstanceOf(BaseVisitor);
        expect(visitor).toHaveProperty('visit');
        expect(visitor).toHaveProperty('visitDocument');
        expect(visitor).toHaveProperty('visitElement');
        expect(visitor).toHaveProperty('visitContent');
        expect(visitor).toHaveProperty('visitReference');
        // 验证实现了TransformerVisitor接口
        const transformerVisitor = visitor;
        expect(transformerVisitor).not.toBeNull();
    });
    it('应该有默认的访问方法实现', () => {
        // 创建一个BaseVisitor的具体实现
        const visitor = new TestVisitor();
        const context = visitor.createMockContext();
        // 测试各种节点类型的默认访问方法
        const documentNode = { type: NodeType.DOCUMENT, children: [] };
        const elementNode = { type: NodeType.ELEMENT, tagName: 'test', attributes: {}, children: [] };
        const contentNode = { type: NodeType.CONTENT, value: 'test' };
        const referenceNode = { type: NodeType.REFERENCE, protocol: 'test', path: 'target' };
        // 执行访问方法
        const docResult = visitor.visitDocument(documentNode, context);
        const elemResult = visitor.visitElement(elementNode, context);
        const contentResult = visitor.visitContent(contentNode, context);
        const refResult = visitor.visitReference(referenceNode, context);
        // 验证默认实现返回null或节点本身
        expect(docResult).toBeNull();
        expect(elemResult).toBeNull();
        expect(contentResult).toBeNull();
        expect(refResult).toBeNull();
        // 验证访问次数
        expect(visitor.visitCounts.document).toBe(1);
        expect(visitor.visitCounts.element).toBe(1);
        expect(visitor.visitCounts.content).toBe(1);
        expect(visitor.visitCounts.reference).toBe(1);
    });
    it('visit方法应该根据节点类型调用相应的访问方法', () => {
        // 创建一个BaseVisitor的具体实现
        const visitor = new TestVisitor();
        const context = visitor.createMockContext();
        // 测试各种节点类型
        const documentNode = { type: NodeType.DOCUMENT, children: [] };
        const elementNode = { type: NodeType.ELEMENT, tagName: 'test', attributes: {}, children: [] };
        const contentNode = { type: NodeType.CONTENT, value: 'test' };
        const referenceNode = { type: NodeType.REFERENCE, protocol: 'test', path: 'target' };
        // 执行visit方法
        visitor.visit(documentNode, context);
        visitor.visit(elementNode, context);
        visitor.visit(contentNode, context);
        visitor.visit(referenceNode, context);
        // 验证各类型方法被调用的次数
        expect(visitor.visitCounts.document).toBe(1);
        expect(visitor.visitCounts.element).toBe(1);
        expect(visitor.visitCounts.content).toBe(1);
        expect(visitor.visitCounts.reference).toBe(1);
    });
    it('应该具有可配置的优先级', () => {
        // 创建BaseVisitor实例，测试默认优先级
        const defaultVisitor = new TestVisitor();
        expect(defaultVisitor.getPriority()).toBe(0);
        // 创建具有自定义优先级的BaseVisitor实例
        const highPriorityVisitor = new TestVisitor(100);
        expect(highPriorityVisitor.getPriority()).toBe(100);
        // 创建具有负优先级的BaseVisitor实例
        const lowPriorityVisitor = new TestVisitor(-100);
        expect(lowPriorityVisitor.getPriority()).toBe(-100);
    });
    it('应该支持异步访问', async () => {
        // 创建一个支持异步访问的BaseVisitor子类
        class AsyncTestVisitor extends BaseVisitor {
            constructor() {
                super(...arguments);
                this.name = 'async-test-visitor';
            }
            async visitDocument(node, context) {
                // 模拟异步操作
                await new Promise(resolve => setTimeout(resolve, 10));
                return { type: 'processed', original: node };
            }
        }
        const visitor = new AsyncTestVisitor();
        const context = new TestVisitor().createMockContext();
        const documentNode = { type: NodeType.DOCUMENT, children: [] };
        // 执行异步visit方法
        const result = await visitor.visitAsync(documentNode, context);
        // 验证结果
        expect(result).toEqual({ type: 'processed', original: documentNode });
    });
});
//# sourceMappingURL=baseVisitor.test.js.map