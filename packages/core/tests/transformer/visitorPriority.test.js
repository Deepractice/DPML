import { describe, it, expect } from 'vitest';
import { DefaultTransformer } from '../../src/transformer/defaultTransformer';
import { NodeType } from '../../src/types/node';
describe('访问者优先级机制', () => {
    // 创建一个测试文档
    const createTestDocument = () => ({
        type: NodeType.DOCUMENT,
        children: [],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
        }
    });
    it('应该按照优先级从高到低执行访问者', () => {
        // 创建多个具有不同优先级的访问者
        const callOrder = [];
        const lowPriorityVisitor = {
            priority: 10,
            visitDocument: (document, context) => {
                callOrder.push('低优先级访问者');
                return null; // 返回null让后续访问者有机会处理
            }
        };
        const mediumPriorityVisitor = {
            priority: 50,
            visitDocument: (document, context) => {
                callOrder.push('中优先级访问者');
                return null; // 返回null让后续访问者有机会处理
            }
        };
        const highPriorityVisitor = {
            priority: 100,
            visitDocument: (document, context) => {
                callOrder.push('高优先级访问者');
                return null; // 返回null让后续访问者有机会处理
            }
        };
        // 创建转换器并注册访问者，顺序不按优先级
        const transformer = new DefaultTransformer();
        transformer.registerVisitor(lowPriorityVisitor);
        transformer.registerVisitor(highPriorityVisitor);
        transformer.registerVisitor(mediumPriorityVisitor);
        // 转换文档
        transformer.transform(createTestDocument());
        // 验证调用顺序符合优先级顺序
        expect(callOrder).toEqual([
            '高优先级访问者',
            '中优先级访问者',
            '低优先级访问者'
        ]);
    });
    it('优先级相同的访问者应该按照注册顺序执行', () => {
        // 创建多个具有相同优先级的访问者
        const callOrder = [];
        const visitor1 = {
            priority: 50,
            visitDocument: (document, context) => {
                callOrder.push('访问者1');
                return null;
            }
        };
        const visitor2 = {
            priority: 50,
            visitDocument: (document, context) => {
                callOrder.push('访问者2');
                return null;
            }
        };
        const visitor3 = {
            priority: 50,
            visitDocument: (document, context) => {
                callOrder.push('访问者3');
                return null;
            }
        };
        // 创建转换器并按顺序注册访问者
        const transformer = new DefaultTransformer();
        transformer.registerVisitor(visitor1);
        transformer.registerVisitor(visitor2);
        transformer.registerVisitor(visitor3);
        // 转换文档
        transformer.transform(createTestDocument());
        // 验证调用顺序与注册顺序一致
        expect(callOrder).toEqual(['访问者1', '访问者2', '访问者3']);
    });
    it('应该在第一个返回非空结果的访问者后停止执行', () => {
        // 创建多个访问者，其中一个返回非空结果
        const callOrder = [];
        const visitor1 = {
            priority: 100,
            visitDocument: (document, context) => {
                callOrder.push('访问者1');
                return null; // 继续执行后续访问者
            }
        };
        const visitor2 = {
            priority: 80,
            visitDocument: (document, context) => {
                callOrder.push('访问者2');
                return { result: 'visitor2-result' }; // 返回非空结果
            }
        };
        const visitor3 = {
            priority: 60,
            visitDocument: (document, context) => {
                callOrder.push('访问者3');
                return { result: 'visitor3-result' };
            }
        };
        // 创建转换器并注册访问者
        const transformer = new DefaultTransformer();
        transformer.registerVisitor(visitor1);
        transformer.registerVisitor(visitor2);
        transformer.registerVisitor(visitor3);
        // 转换文档并获取结果
        const result = transformer.transform(createTestDocument());
        // 验证调用顺序和结果
        expect(callOrder).toEqual(['访问者1', '访问者2']); // 访问者3不应该被调用
        expect(result).toEqual({ result: 'visitor2-result' }); // 结果应该是访问者2的结果
    });
    it('应该为没有指定优先级的访问者使用默认优先级', () => {
        // 创建一些访问者，部分没有指定优先级
        const callOrder = [];
        const visitorWithPriority = {
            priority: 100,
            visitDocument: (document, context) => {
                callOrder.push('有优先级');
                return null;
            }
        };
        const visitorWithoutPriority1 = {
            visitDocument: (document, context) => {
                callOrder.push('无优先级1');
                return null;
            }
        };
        const visitorWithoutPriority2 = {
            visitDocument: (document, context) => {
                callOrder.push('无优先级2');
                return null;
            }
        };
        // 创建转换器并注册访问者
        const transformer = new DefaultTransformer();
        transformer.registerVisitor(visitorWithoutPriority1);
        transformer.registerVisitor(visitorWithPriority);
        transformer.registerVisitor(visitorWithoutPriority2);
        // 转换文档
        transformer.transform(createTestDocument());
        // 验证调用顺序：有优先级的访问者先执行，无优先级的按注册顺序
        expect(callOrder).toEqual(['有优先级', '无优先级1', '无优先级2']);
    });
    it('应该支持对不同类型节点设置不同的访问者优先级', () => {
        // 创建一个包含多种节点类型的文档
        const document = {
            type: NodeType.DOCUMENT,
            children: [
                {
                    type: NodeType.ELEMENT,
                    tagName: 'test',
                    attributes: {},
                    children: [],
                    position: {
                        start: { line: 2, column: 1, offset: 10 },
                        end: { line: 2, column: 10, offset: 19 }
                    }
                }
            ],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 20 }
            }
        };
        // 创建多个访问者，针对不同节点类型设置不同优先级
        const nodeTypeOrder = [];
        const documentVisitor = {
            priority: 50,
            visitDocument: (doc, context) => {
                nodeTypeOrder.push('document');
                // 返回一个包装对象，以允许继续处理子节点
                return { type: 'processed-document', children: [] };
            }
        };
        const elementVisitor = {
            priority: 100, // 元素访问者优先级高于文档访问者
            visitElement: (element, context) => {
                nodeTypeOrder.push('element');
                return { type: 'processed-element' };
            }
        };
        // 创建转换器并注册访问者
        const transformer = new DefaultTransformer();
        transformer.registerVisitor(documentVisitor);
        transformer.registerVisitor(elementVisitor);
        // 转换文档
        const result = transformer.transform(document);
        // 验证节点处理顺序
        expect(nodeTypeOrder).toEqual(['document', 'element']);
        // 验证转换结果
        expect(result).toEqual({
            type: 'processed-document',
            children: [
                { type: 'processed-element' }
            ]
        });
    });
});
//# sourceMappingURL=visitorPriority.test.js.map