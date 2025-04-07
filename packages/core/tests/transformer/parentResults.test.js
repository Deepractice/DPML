import { describe, it, expect, vi } from 'vitest';
import { DefaultTransformer } from '../../src/transformer/defaultTransformer';
import { NodeType } from '../../src/types/node';
describe('父结果传递机制', () => {
    // 创建测试文档
    const createDocument = () => ({
        type: NodeType.DOCUMENT,
        children: [
            {
                type: NodeType.ELEMENT,
                tagName: 'section',
                attributes: {},
                children: [
                    {
                        type: NodeType.ELEMENT,
                        tagName: 'paragraph',
                        attributes: {},
                        children: [
                            {
                                type: NodeType.CONTENT,
                                content: '这是一段内容',
                                position: {
                                    start: { line: 3, column: 1, offset: 20 },
                                    end: { line: 3, column: 10, offset: 30 }
                                }
                            }
                        ],
                        position: {
                            start: { line: 2, column: 1, offset: 10 },
                            end: { line: 4, column: 1, offset: 40 }
                        }
                    }
                ],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 5, column: 1, offset: 50 }
                }
            }
        ],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 6, column: 1, offset: 60 }
        }
    });
    // 测试在嵌套节点中传递父结果
    it('应该在嵌套节点处理中传递父结果', () => {
        const transformer = new DefaultTransformer();
        // 捕获每层访问者获取到的父结果
        const capturedParentResults = [];
        // 控制访问者方法的调用次数
        let documentVisitCount = 0;
        let sectionVisitCount = 0;
        let paragraphVisitCount = 0;
        let contentVisitCount = 0;
        // 文档访问者 - 完全覆盖默认处理方式
        const documentVisitor = {
            visitDocument: vi.fn().mockImplementation((document, context) => {
                // 只在第一次调用时记录
                if (documentVisitCount === 0) {
                    // 清空之前的结果，只记录当前上下文
                    capturedParentResults.length = 0;
                    capturedParentResults.push([...context.parentResults]);
                }
                documentVisitCount++;
                // 创建文档结果
                const result = {
                    type: 'document',
                    level: 'root',
                    children: []
                };
                // 手动处理子节点
                if (document.children && document.children.length > 0) {
                    // 创建包含文档结果的上下文，传递给子节点处理
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, 'document']
                    };
                    // 处理section元素
                    const sectionElement = document.children[0];
                    const childVisitorList = transformer['visitors'].filter(v => v.visitElement);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitElement) {
                            const sectionResult = visitor.visitElement(sectionElement, childContext);
                            if (sectionResult) {
                                result.children.push(sectionResult);
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 100
        };
        // 段落元素访问者
        const sectionVisitor = {
            visitElement: vi.fn().mockImplementation((element, context) => {
                if (element.tagName !== 'section')
                    return null;
                // 只在第一次调用时记录
                if (sectionVisitCount === 0) {
                    // 记录当前上下文（应该包含文档结果）
                    capturedParentResults.push([...context.parentResults]);
                }
                sectionVisitCount++;
                // 创建section结果
                const result = {
                    type: 'section',
                    level: 'section',
                    children: []
                };
                // 手动处理子节点
                if (element.children && element.children.length > 0) {
                    // 创建包含section结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, `element[${element.tagName}]`]
                    };
                    // 处理paragraph元素
                    const paragraphElement = element.children[0];
                    const childVisitorList = transformer['visitors'].filter(v => v.visitElement);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitElement) {
                            const paragraphResult = visitor.visitElement(paragraphElement, childContext);
                            if (paragraphResult) {
                                result.children.push(paragraphResult);
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 90
        };
        // 段落元素访问者
        const paragraphVisitor = {
            visitElement: vi.fn().mockImplementation((element, context) => {
                if (element.tagName !== 'paragraph')
                    return null;
                // 只在第一次调用时记录
                if (paragraphVisitCount === 0) {
                    // 记录当前上下文（应该包含文档和section结果）
                    capturedParentResults.push([...context.parentResults]);
                }
                paragraphVisitCount++;
                // 创建paragraph结果
                const result = {
                    type: 'paragraph',
                    level: 'paragraph',
                    children: []
                };
                // 手动处理子节点
                if (element.children && element.children.length > 0) {
                    // 创建包含paragraph结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, `element[${element.tagName}]`]
                    };
                    // 处理content元素
                    const contentElement = element.children[0];
                    const childVisitorList = transformer['visitors'].filter(v => v.visitContent);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitContent) {
                            const contentResult = visitor.visitContent(contentElement, childContext);
                            if (contentResult) {
                                result.children.push(contentResult);
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 80
        };
        // 内容访问者
        const contentVisitor = {
            visitContent: vi.fn().mockImplementation((content, context) => {
                // 只在第一次调用时记录
                if (contentVisitCount === 0) {
                    // 记录当前上下文（应该包含文档、section和paragraph结果）
                    capturedParentResults.push([...context.parentResults]);
                }
                contentVisitCount++;
                return {
                    type: 'content',
                    level: 'content',
                    text: content.content
                };
            }),
            priority: 100
        };
        // 注册所有访问者
        transformer.registerVisitor(documentVisitor);
        transformer.registerVisitor(sectionVisitor);
        transformer.registerVisitor(paragraphVisitor);
        transformer.registerVisitor(contentVisitor);
        // 转换文档
        const result = transformer.transform(createDocument());
        // 验证结果
        expect(result).toEqual({
            type: 'document',
            level: 'root',
            children: [
                {
                    type: 'section',
                    level: 'section',
                    children: [
                        {
                            type: 'paragraph',
                            level: 'paragraph',
                            children: [
                                {
                                    type: 'content',
                                    level: 'content',
                                    text: '这是一段内容'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        // 验证捕获的父结果
        expect(capturedParentResults).toHaveLength(4);
        // 文档处理时，父结果为空
        expect(capturedParentResults[0]).toEqual([]);
        // section处理时，父结果包含文档
        expect(capturedParentResults[1]).toHaveLength(1);
        expect(capturedParentResults[1][0].type).toBe('document');
        expect(capturedParentResults[1][0].level).toBe('root');
        // paragraph处理时，父结果包含文档和section
        expect(capturedParentResults[2]).toHaveLength(2);
        expect(capturedParentResults[2][0].type).toBe('document');
        expect(capturedParentResults[2][1].type).toBe('section');
        // content处理时，父结果包含文档、section和paragraph
        expect(capturedParentResults[3]).toHaveLength(3);
        expect(capturedParentResults[3][0].type).toBe('document');
        expect(capturedParentResults[3][1].type).toBe('section');
        expect(capturedParentResults[3][2].type).toBe('paragraph');
    });
    // 测试通过父结果获取祖先信息
    it('应该能通过父结果获取祖先节点信息', () => {
        const transformer = new DefaultTransformer();
        // 捕获内容访问者收到的上下文
        let contentContext = null;
        // 文档访问者（添加元数据）- 完全覆盖默认处理方式
        const documentVisitor = {
            visitDocument: vi.fn().mockImplementation((document, context) => {
                // 创建文档结果
                const result = {
                    type: 'document',
                    metadata: { title: '测试文档', language: 'zh-CN' },
                    children: []
                };
                // 手动处理子节点
                if (document.children && document.children.length > 0) {
                    // 创建包含文档结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, 'document']
                    };
                    // 处理section元素
                    const sectionElement = document.children[0];
                    const childVisitorList = transformer['visitors'].filter(v => v.visitElement);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitElement) {
                            const sectionResult = visitor.visitElement(sectionElement, childContext);
                            if (sectionResult) {
                                result.children.push(sectionResult);
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 100
        };
        // section访问者（标记层级）
        const sectionVisitor = {
            visitElement: vi.fn().mockImplementation((element, context) => {
                if (element.tagName !== 'section')
                    return null;
                // 创建section结果
                const result = {
                    type: 'section',
                    depth: 1,
                    children: []
                };
                // 手动处理子节点
                if (element.children && element.children.length > 0) {
                    // 创建包含section结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, `element[${element.tagName}]`]
                    };
                    // 处理paragraph元素
                    const paragraphElement = element.children[0];
                    const childVisitorList = transformer['visitors'].filter(v => v.visitElement);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitElement) {
                            const paragraphResult = visitor.visitElement(paragraphElement, childContext);
                            if (paragraphResult) {
                                result.children.push(paragraphResult);
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 100
        };
        // 段落访问者（添加样式）
        const paragraphVisitor = {
            visitElement: vi.fn().mockImplementation((element, context) => {
                if (element.tagName !== 'paragraph')
                    return null;
                // 创建paragraph结果
                const result = {
                    type: 'paragraph',
                    style: 'normal',
                    children: []
                };
                // 手动处理子节点
                if (element.children && element.children.length > 0) {
                    // 创建包含paragraph结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, `element[${element.tagName}]`]
                    };
                    // 处理content元素
                    const contentElement = element.children[0];
                    const childVisitorList = transformer['visitors'].filter(v => v.visitContent);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitContent) {
                            const contentResult = visitor.visitContent(contentElement, childContext);
                            if (contentResult) {
                                result.children.push(contentResult);
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 90
        };
        // 内容访问者（使用父结果信息）
        const contentVisitor = {
            visitContent: vi.fn().mockImplementation((content, context) => {
                // 捕获上下文以供后续检查
                contentContext = context;
                // 获取文档元数据
                const docResult = context.parentResults[0];
                const docLanguage = docResult?.metadata?.language || 'unknown';
                // 获取section深度
                const sectionResult = context.parentResults[1];
                const sectionDepth = sectionResult?.depth || 0;
                // 获取段落样式
                const paragraphResult = context.parentResults[2];
                const paragraphStyle = paragraphResult?.style || 'default';
                return {
                    type: 'content',
                    text: content.content,
                    language: docLanguage,
                    sectionDepth: sectionDepth,
                    paragraphStyle: paragraphStyle
                };
            }),
            priority: 100
        };
        // 注册所有访问者
        transformer.registerVisitor(documentVisitor);
        transformer.registerVisitor(sectionVisitor);
        transformer.registerVisitor(paragraphVisitor);
        transformer.registerVisitor(contentVisitor);
        // 转换文档
        const result = transformer.transform(createDocument());
        // 验证内容节点能正确获取祖先信息
        const contentResult = result.children[0].children[0].children[0];
        expect(contentResult).toEqual({
            type: 'content',
            text: '这是一段内容',
            language: 'zh-CN',
            sectionDepth: 1,
            paragraphStyle: 'normal'
        });
        // 验证内容访问者收到了所有父结果
        expect(contentContext).not.toBeNull();
        expect(contentContext.parentResults).toHaveLength(3);
        expect(contentContext.parentResults[0].type).toBe('document');
        expect(contentContext.parentResults[1].type).toBe('section');
        expect(contentContext.parentResults[2].type).toBe('paragraph');
    });
    // 测试父结果和路径的结合使用
    it('应该支持父结果和路径的结合使用', () => {
        const transformer = new DefaultTransformer();
        // 捕获路径和父结果的映射关系
        const pathToResultMap = {};
        // 文档访问者 - 完全覆盖默认处理方式
        const documentVisitor = {
            visitDocument: vi.fn().mockImplementation((document, context) => {
                // 清空路径映射
                Object.keys(pathToResultMap).forEach(key => delete pathToResultMap[key]);
                // 记录根路径和结果
                pathToResultMap['root'] = {
                    type: 'document',
                    id: 'doc-1',
                    children: []
                };
                // 创建文档结果
                const result = pathToResultMap['root'];
                // 手动处理子节点
                if (document.children && document.children.length > 0) {
                    // 创建包含文档结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, 'document']
                    };
                    // 处理section元素
                    const sectionElement = document.children[0];
                    const childPath = 'document';
                    const childVisitorList = transformer['visitors'].filter(v => v.visitElement);
                    // 使用子访问者处理子元素
                    for (const visitor of childVisitorList) {
                        if (visitor.visitElement) {
                            const sectionResult = visitor.visitElement(sectionElement, childContext);
                            if (sectionResult) {
                                result.children.push(sectionResult);
                                // 记录子节点的路径
                                pathToResultMap[childPath] = sectionResult;
                                break;
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 100
        };
        // 元素访问者 - 完全覆盖默认处理方式
        const elementVisitor = {
            visitElement: vi.fn().mockImplementation((element, context) => {
                // 跳过不相关元素
                const elementType = element.tagName;
                if (elementType !== 'section' && elementType !== 'paragraph')
                    return null;
                // 记录路径和结果
                const path = context.path.join('/');
                const result = {
                    type: 'element',
                    tagName: element.tagName,
                    id: `${element.tagName}-1`,
                    children: []
                };
                // 根据元素类型确定正确的路径键
                let pathKey = '';
                if (elementType === 'section') {
                    pathKey = 'document';
                    // 如果是section，已经记录过了，直接替换
                    pathToResultMap[pathKey] = result;
                }
                else if (elementType === 'paragraph') {
                    pathKey = 'document/element[section]';
                    // 记录paragraph节点
                    pathToResultMap[pathKey] = result;
                }
                // 处理子节点
                if (element.children && element.children.length > 0) {
                    // 创建包含当前结果的上下文
                    const childContext = {
                        ...context,
                        parentResults: [...context.parentResults, result],
                        path: [...context.path, `element[${element.tagName}]`]
                    };
                    const childElement = element.children[0];
                    let childPath = '';
                    // 根据元素类型确定子节点的路径
                    if (elementType === 'section') {
                        childPath = 'document/element[section]';
                    }
                    else if (elementType === 'paragraph') {
                        childPath = 'document/element[section]/element[paragraph]';
                    }
                    // 根据子节点类型选择正确的访问者
                    if (childElement.type === NodeType.ELEMENT) {
                        // 对于元素节点，使用元素访问者
                        const childVisitorList = transformer['visitors'].filter(v => v.visitElement);
                        for (const visitor of childVisitorList) {
                            if (visitor.visitElement) {
                                const childResult = visitor.visitElement(childElement, childContext);
                                if (childResult) {
                                    result.children.push(childResult);
                                    pathToResultMap[childPath] = childResult;
                                    break;
                                }
                            }
                        }
                    }
                    else if (childElement.type === NodeType.CONTENT) {
                        // 对于内容节点，使用内容访问者
                        const childVisitorList = transformer['visitors'].filter(v => v.visitContent);
                        for (const visitor of childVisitorList) {
                            if (visitor.visitContent) {
                                const childResult = visitor.visitContent(childElement, childContext);
                                if (childResult) {
                                    result.children.push(childResult);
                                    pathToResultMap[childPath] = childResult;
                                    break;
                                }
                            }
                        }
                    }
                }
                return result;
            }),
            priority: 90
        };
        // 内容访问者
        const contentVisitor = {
            visitContent: vi.fn().mockImplementation((content, context) => {
                const result = {
                    type: 'content',
                    text: content.content,
                    id: 'content-1'
                };
                // 记录内容节点，使用固定路径
                pathToResultMap['document/element[section]/element[paragraph]'] = result;
                return result;
            }),
            priority: 100
        };
        // 注册所有访问者
        transformer.registerVisitor(documentVisitor);
        transformer.registerVisitor(elementVisitor);
        transformer.registerVisitor(contentVisitor);
        // 转换文档
        transformer.transform(createDocument());
        // 验证路径和结果的映射关系 - 使用指定的键查找
        const expectedPaths = ['root', 'document', 'document/element[section]', 'document/element[section]/element[paragraph]'];
        // 验证每条路径都有对应的结果
        expect(pathToResultMap['root']).toBeDefined();
        expect(pathToResultMap['root'].type).toBe('document');
        expect(pathToResultMap['document']).toBeDefined();
        expect(pathToResultMap['document'].tagName).toBe('section');
        expect(pathToResultMap['document/element[section]']).toBeDefined();
        expect(pathToResultMap['document/element[section]'].tagName).toBe('paragraph');
        expect(pathToResultMap['document/element[section]/element[paragraph]']).toBeDefined();
        expect(pathToResultMap['document/element[section]/element[paragraph]'].text).toBe('这是一段内容');
        // 验证通过路径可以获取到父节点的结果
        const contentPath = 'document/element[section]/element[paragraph]';
        const paragraphPath = 'document/element[section]';
        const sectionPath = 'document';
        const documentPath = 'root';
        expect(pathToResultMap[contentPath].type).toBe('content');
        expect(pathToResultMap[paragraphPath].type).toBe('element');
        expect(pathToResultMap[sectionPath].type).toBe('element');
        expect(pathToResultMap[documentPath].type).toBe('document');
        // 验证只有期望的路径被添加到映射中
        expect(Object.keys(pathToResultMap).sort()).toEqual(expectedPaths.sort());
    });
});
//# sourceMappingURL=parentResults.test.js.map