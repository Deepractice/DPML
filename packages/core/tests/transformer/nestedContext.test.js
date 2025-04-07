import { describe, it, expect } from 'vitest';
import { ContextManager } from '../../src/transformer/context/contextManager';
import { NodeType } from '../../src/types/node';
describe('嵌套上下文结构支持', () => {
    // 创建一个模拟文档用于测试
    const mockDocument = {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
        }
    };
    // 创建模拟选项用于测试
    const mockOptions = {
        format: 'json',
        mode: 'strict',
        variables: {
            title: '测试文档',
            version: 1
        }
    };
    describe('嵌套上下文的创建与访问', () => {
        it('应该能创建嵌套上下文结构', () => {
            const contextManager = new ContextManager();
            // 创建根上下文
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            // 创建第一级嵌套上下文
            const level1Context = contextManager.createNestedContext(rootContext, 'section', { sectionTitle: '第一章' });
            // 验证嵌套上下文属性
            expect(level1Context.document).toBe(mockDocument);
            expect(level1Context.options).toBe(mockOptions);
            expect(level1Context.path).toEqual(['section']);
            expect(level1Context.variables).toEqual({
                ...mockOptions.variables,
                sectionTitle: '第一章'
            });
            expect(level1Context.nested).toBeDefined();
            expect(level1Context.parent).toBe(rootContext);
        });
        it('应该能在嵌套上下文中创建多级嵌套', () => {
            const contextManager = new ContextManager();
            // 创建根上下文
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            // 创建第一级嵌套上下文
            const level1Context = contextManager.createNestedContext(rootContext, 'section', { sectionTitle: '第一章' });
            // 创建第二级嵌套上下文
            const level2Context = contextManager.createNestedContext(level1Context, 'paragraph', { paragraphStyle: 'normal' });
            // 创建第三级嵌套上下文
            const level3Context = contextManager.createNestedContext(level2Context, 'sentence', { sentenceType: 'statement' });
            // 验证嵌套层级
            expect(level3Context.path).toEqual(['section', 'paragraph', 'sentence']);
            expect(level3Context.variables).toEqual({
                ...mockOptions.variables,
                sectionTitle: '第一章',
                paragraphStyle: 'normal',
                sentenceType: 'statement'
            });
            // 验证父子关系
            expect(level3Context.parent).toBe(level2Context);
            expect(level2Context.parent).toBe(level1Context);
            expect(level1Context.parent).toBe(rootContext);
            expect(rootContext.parent).toBeUndefined();
        });
        it('应该能从嵌套上下文访问祖先上下文', () => {
            const contextManager = new ContextManager();
            // 创建多级嵌套上下文
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            const level1Context = contextManager.createNestedContext(rootContext, 'section');
            const level2Context = contextManager.createNestedContext(level1Context, 'paragraph');
            const level3Context = contextManager.createNestedContext(level2Context, 'sentence');
            // 通过嵌套结构获取祖先上下文
            expect(contextManager.getAncestorContext(level3Context, 0)).toBe(level3Context);
            expect(contextManager.getAncestorContext(level3Context, 1)).toBe(level2Context);
            expect(contextManager.getAncestorContext(level3Context, 2)).toBe(level1Context);
            expect(contextManager.getAncestorContext(level3Context, 3)).toBe(rootContext);
            expect(contextManager.getAncestorContext(level3Context, 4)).toBeUndefined();
            // 通过类型获取祖先上下文
            expect(contextManager.getAncestorContextByPathElement(level3Context, 'paragraph')).toBe(level2Context);
            expect(contextManager.getAncestorContextByPathElement(level3Context, 'section')).toBe(level1Context);
            expect(contextManager.getAncestorContextByPathElement(level3Context, 'document')).toBeUndefined();
        });
    });
    describe('嵌套上下文的状态传递', () => {
        it('应该能在嵌套上下文之间传递状态', () => {
            const contextManager = new ContextManager();
            // 创建嵌套上下文结构并设置状态
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            let updatedRoot = contextManager.setVariable(rootContext, 'rootVar', 'rootValue');
            const level1Context = contextManager.createNestedContext(updatedRoot, 'section');
            let updatedLevel1 = contextManager.setVariable(level1Context, 'level1Var', 'level1Value');
            const level2Context = contextManager.createNestedContext(updatedLevel1, 'paragraph');
            let updatedLevel2 = contextManager.setVariable(level2Context, 'level2Var', 'level2Value');
            // 状态应该在各自上下文中可用
            expect(contextManager.getVariable(updatedRoot, 'rootVar')).toBe('rootValue');
            expect(contextManager.getVariable(updatedLevel1, 'level1Var')).toBe('level1Value');
            expect(contextManager.getVariable(updatedLevel2, 'level2Var')).toBe('level2Value');
            // 子上下文应该能访问父上下文的状态
            expect(contextManager.getVariable(updatedLevel2, 'rootVar')).toBe('rootValue');
            expect(contextManager.getVariable(updatedLevel2, 'level1Var')).toBe('level1Value');
            // 父上下文不应该访问到子上下文的状态
            expect(contextManager.getVariable(updatedRoot, 'level1Var')).toBeUndefined();
            expect(contextManager.getVariable(updatedLevel1, 'level2Var')).toBeUndefined();
        });
        it('应该能设置嵌套上下文的新变量', () => {
            const contextManager = new ContextManager();
            // 创建根上下文和子上下文
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            const level1Context = contextManager.createNestedContext(rootContext, 'section');
            // 变量传递测试：在父上下文设置变量，然后再创建子上下文
            const updatedRoot = contextManager.setVariable(rootContext, 'parentVar', 'parentValue');
            const newLevel1Context = contextManager.createNestedContext(updatedRoot, 'section2');
            expect(contextManager.getVariable(newLevel1Context, 'parentVar')).toBe('parentValue');
            // 变量覆盖测试：在子上下文设置同名变量，子上下文应该看到覆盖后的值
            const updatedLevel1 = contextManager.setVariable(newLevel1Context, 'parentVar', 'overrideValue');
            expect(contextManager.getVariable(updatedLevel1, 'parentVar')).toBe('overrideValue');
            // 父上下文的变量不受影响
            expect(contextManager.getVariable(updatedRoot, 'parentVar')).toBe('parentValue');
        });
        it('应该能创建共享父上下文变量的子上下文', () => {
            const contextManager = new ContextManager();
            // 创建具有变量的根上下文
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            const updatedRoot = contextManager.setVariable(rootContext, 'sharedVar', 'rootValue');
            // 创建子上下文后应该能访问父变量
            const childContext = contextManager.createNestedContext(updatedRoot, 'child');
            expect(contextManager.getVariable(childContext, 'sharedVar')).toBe('rootValue');
            // 更新父上下文变量
            const newRootContext = contextManager.setVariable(updatedRoot, 'sharedVar', 'newValue');
            // 现有子上下文不应受影响（保持旧值）
            expect(contextManager.getVariable(childContext, 'sharedVar')).toBe('rootValue');
            // 基于更新后的父上下文创建新的子上下文应该有新值
            const newChildContext = contextManager.createNestedContext(newRootContext, 'newChild');
            expect(contextManager.getVariable(newChildContext, 'sharedVar')).toBe('newValue');
        });
    });
    describe('嵌套上下文的结果处理', () => {
        it('应该能在嵌套上下文中组合父结果', () => {
            const contextManager = new ContextManager();
            // 创建嵌套上下文结构
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            const level1Context = contextManager.createNestedContext(rootContext, 'section');
            // 添加结果到根上下文
            const rootResult = { type: 'document', id: 'doc1' };
            const updatedRoot = contextManager.addResult(rootContext, rootResult);
            // 基于更新后的根上下文创建新的子上下文
            const newLevel1 = contextManager.createNestedContext(updatedRoot, 'section');
            // 添加结果到子上下文
            const level1Result = { type: 'section', id: 'sec1' };
            const updatedLevel1 = contextManager.addResult(newLevel1, level1Result);
            // 验证结果链
            expect(updatedLevel1.parentResults).toEqual([rootResult, level1Result]);
            // 使用新方法获取组合结果
            const combinedResults = contextManager.getCombinedResults(updatedLevel1);
            expect(combinedResults).toHaveLength(2);
            expect(combinedResults[0]).toEqual(rootResult);
            expect(combinedResults[1]).toEqual(level1Result);
        });
        it('应该能在嵌套上下文中通过路径获取结果', () => {
            const contextManager = new ContextManager();
            // 创建嵌套上下文链
            const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
            // 添加结果并创建嵌套上下文
            const rootResult = { type: 'document', id: 'doc1' };
            let context = contextManager.addResult(rootContext, rootResult);
            context = contextManager.createNestedContext(context, 'section');
            const sectionResult = { type: 'section', id: 'sec1' };
            context = contextManager.addResult(context, sectionResult);
            context = contextManager.createNestedContext(context, 'paragraph');
            const paragraphResult = { type: 'paragraph', id: 'para1' };
            context = contextManager.addResult(context, paragraphResult);
            context = contextManager.createNestedContext(context, 'sentence');
            const sentenceResult = { type: 'sentence', id: 'sent1' };
            context = contextManager.addResult(context, sentenceResult);
            // 通过路径获取结果映射
            const resultsByPath = contextManager.getResultsByPath(context);
            // 验证结果
            expect(Object.keys(resultsByPath).length).toBe(4); // document, section, paragraph, sentence
            expect(resultsByPath['document']).toEqual(rootResult);
            expect(resultsByPath['section']).toEqual(sectionResult);
            expect(resultsByPath['paragraph']).toEqual(paragraphResult);
            expect(resultsByPath['sentence']).toEqual(sentenceResult);
        });
    });
});
//# sourceMappingURL=nestedContext.test.js.map