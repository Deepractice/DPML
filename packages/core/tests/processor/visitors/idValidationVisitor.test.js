import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType } from '../../../src/types/node';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { IdValidationVisitor } from '../../../src/processor/visitors/idValidationVisitor';
import { ValidationError } from '../../../src/errors/types';
describe('IdValidationVisitor', () => {
    let visitor;
    let context;
    let document;
    const mockPosition = {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
    };
    beforeEach(() => {
        // 创建基础文档
        document = {
            type: NodeType.DOCUMENT,
            children: [],
            position: mockPosition
        };
        // 创建处理上下文
        context = new ProcessingContext(document, '/test/path');
        // 创建访问者
        visitor = new IdValidationVisitor();
    });
    it('应该初始化idMap', async () => {
        // 执行visitDocument
        await visitor.visitDocument(document, context);
        // 验证idMap被初始化
        expect(context.idMap).toBeDefined();
        expect(context.idMap instanceof Map).toBe(true);
        expect(context.idMap?.size).toBe(0);
    });
    it('应该收集元素ID', async () => {
        // 执行visitDocument初始化idMap
        await visitor.visitDocument(document, context);
        // 创建带ID的元素
        const element1 = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { id: 'test1' },
            children: [],
            position: mockPosition
        };
        const element2 = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { id: 'test2' },
            children: [],
            position: mockPosition
        };
        // 访问元素
        await visitor.visitElement(element1, context);
        await visitor.visitElement(element2, context);
        // 验证ID被收集
        expect(context.idMap?.size).toBe(2);
        expect(context.idMap?.has('test1')).toBe(true);
        expect(context.idMap?.has('test2')).toBe(true);
        expect(context.idMap?.get('test1')).toBe(element1);
        expect(context.idMap?.get('test2')).toBe(element2);
    });
    it('在严格模式下应该抛出重复ID错误', async () => {
        // 创建严格模式访问者
        const strictVisitor = new IdValidationVisitor({ strictMode: true });
        // 执行visitDocument初始化idMap
        await strictVisitor.visitDocument(document, context);
        // 创建带重复ID的元素
        const element1 = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { id: 'duplicate' },
            children: [],
            position: mockPosition
        };
        const element2 = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { id: 'duplicate' },
            children: [],
            position: mockPosition
        };
        // 访问第一个元素应该成功
        await strictVisitor.visitElement(element1, context);
        // 访问第二个元素应该抛出错误
        await expect(strictVisitor.visitElement(element2, context)).rejects.toThrow();
        await expect(strictVisitor.visitElement(element2, context)).rejects.toBeInstanceOf(ValidationError);
    });
    it('在非严格模式下应该只发出重复ID警告', async () => {
        // 模拟console.warn
        const originalWarn = console.warn;
        const mockWarn = vi.fn();
        console.warn = mockWarn;
        try {
            // 执行visitDocument初始化idMap
            await visitor.visitDocument(document, context);
            // 创建带重复ID的元素
            const element1 = {
                type: NodeType.ELEMENT,
                tagName: 'test',
                attributes: { id: 'duplicate' },
                children: [],
                position: mockPosition
            };
            const element2 = {
                type: NodeType.ELEMENT,
                tagName: 'test',
                attributes: { id: 'duplicate' },
                children: [],
                position: mockPosition
            };
            // 访问元素
            await visitor.visitElement(element1, context);
            await visitor.visitElement(element2, context);
            // 验证警告被发出
            expect(mockWarn).toHaveBeenCalled();
            expect(mockWarn.mock.calls[0][0]).toContain('重复的ID: duplicate');
            // 验证两个元素的ID都被收集
            expect(context.idMap?.size).toBe(1);
            expect(context.idMap?.has('duplicate')).toBe(true);
        }
        finally {
            // 恢复console.warn
            console.warn = originalWarn;
        }
    });
    it('应该忽略没有ID的元素', async () => {
        // 执行visitDocument初始化idMap
        await visitor.visitDocument(document, context);
        // A. 创建没有ID的元素
        const element = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { class: 'test' },
            children: [],
            position: mockPosition
        };
        // B. 调用visitElement
        await visitor.visitElement(element, context);
        // C. 验证idMap为空
        expect(context.idMap?.size).toBe(0);
    });
    it('应该正确处理嵌套元素的ID', async () => {
        // 创建嵌套元素
        const childElement = {
            type: NodeType.ELEMENT,
            tagName: 'child',
            attributes: { id: 'child-id' },
            children: [],
            position: mockPosition
        };
        const parentElement = {
            type: NodeType.ELEMENT,
            tagName: 'parent',
            attributes: { id: 'parent-id' },
            children: [childElement],
            position: mockPosition
        };
        // 添加到文档
        document.children = [parentElement];
        // 执行visitDocument初始化idMap
        await visitor.visitDocument(document, context);
        // 访问父元素和子元素
        await visitor.visitElement(parentElement, context);
        await visitor.visitElement(childElement, context);
        // 验证ID被收集
        expect(context.idMap?.size).toBe(2);
        expect(context.idMap?.has('parent-id')).toBe(true);
        expect(context.idMap?.has('child-id')).toBe(true);
    });
});
//# sourceMappingURL=idValidationVisitor.test.js.map