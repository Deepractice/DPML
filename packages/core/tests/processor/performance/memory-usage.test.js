/**
 * 处理器内存使用测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeType } from '../../../src/types/node';
import { DefaultProcessor } from '../../../src/processor/defaultProcessor';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { DefaultReferenceResolver } from '../../../src/processor/defaultReferenceResolver';
import { FileProtocolHandler } from '../../../src/processor/protocols/fileProtocolHandler';
import { HttpProtocolHandler } from '../../../src/processor/protocols/httpProtocolHandler';
import { IdProtocolHandler } from '../../../src/processor/protocols/idProtocolHandler';
import { ReferenceVisitor } from '../../../src/processor/visitors/referenceVisitor';
import { MarkdownContentVisitor } from '../../../src/processor/visitors/markdownContentVisitor';
import { IdValidationVisitor } from '../../../src/processor/visitors/idValidationVisitor';
import { DocumentMetadataVisitor } from '../../../src/processor/visitors/documentMetadataVisitor';
import { AttributeValidationVisitor } from '../../../src/processor/visitors/attributeValidationVisitor';
import { InheritanceVisitor } from '../../../src/processor/visitors/inheritanceVisitor';
import process from 'process';
// 创建mock标签注册表
const mockTagRegistry = {
    getTagDefinition: () => null,
    tags: new Map(),
    registerTagDefinition: vi.fn(),
    isTagRegistered: vi.fn(() => false),
    getAllTagNames: vi.fn(() => []),
    getTagDefinitions: vi.fn(() => []),
    validateTag: vi.fn(() => ({ valid: true }))
};
// 生成超大型文档的工具函数
function generateHugeDocument(sectionsCount, elementsPerSection, contentSize) {
    const document = {
        type: NodeType.DOCUMENT,
        children: [],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
        }
    };
    // 创建一个大字符串用于内容填充
    const largeContent = '这是一段用于填充内容的文本，用于测试内存使用情况。'.repeat(contentSize);
    // 添加根元素
    const root = {
        type: NodeType.ELEMENT,
        tagName: 'document',
        attributes: { id: 'huge-doc', title: '超大文档测试' },
        children: [],
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
        }
    };
    document.children.push(root);
    // 添加章节和元素
    for (let i = 0; i < sectionsCount; i++) {
        const section = {
            type: NodeType.ELEMENT,
            tagName: 'section',
            attributes: { id: `section-${i}`, title: `章节 ${i}` },
            children: [],
            position: {
                start: { line: i * elementsPerSection + 2, column: 1, offset: i * 10000 },
                end: { line: i * elementsPerSection + 2 + elementsPerSection, column: 1, offset: i * 10000 + 9999 }
            }
        };
        // 添加内容元素
        for (let j = 0; j < elementsPerSection; j++) {
            // 每10个元素添加一个引用元素
            if (j % 10 === 0) {
                section.children.push({
                    type: NodeType.ELEMENT,
                    tagName: 'Reference',
                    attributes: { href: `id:ref-${i}-${j}` },
                    children: [],
                    position: {
                        start: { line: i * elementsPerSection + j + 3, column: 1, offset: i * 10000 + j * 100 },
                        end: { line: i * elementsPerSection + j + 3, column: 50, offset: i * 10000 + j * 100 + 49 }
                    }
                });
            }
            else {
                // 普通内容元素
                section.children.push({
                    type: NodeType.ELEMENT,
                    tagName: 'paragraph',
                    attributes: { id: `para-${i}-${j}` },
                    children: [
                        {
                            type: NodeType.CONTENT,
                            value: largeContent, // 使用大型内容填充
                            position: {
                                start: { line: i * elementsPerSection + j + 3, column: 1, offset: i * 10000 + j * 100 },
                                end: { line: i * elementsPerSection + j + 3, column: 100, offset: i * 10000 + j * 100 + 99 }
                            }
                        }
                    ],
                    position: {
                        start: { line: i * elementsPerSection + j + 3, column: 1, offset: i * 10000 + j * 100 },
                        end: { line: i * elementsPerSection + j + 3, column: 100, offset: i * 10000 + j * 100 + 99 }
                    }
                });
            }
        }
        root.children.push(section);
    }
    return document;
}
/**
 * 获取当前内存使用情况的辅助函数
 */
function getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
        const { heapUsed, heapTotal } = process.memoryUsage();
        return { heapUsed, heapTotal };
    }
    // 浏览器环境中，返回模拟数据
    return { heapUsed: 0, heapTotal: 0 };
}
/**
 * 获取预设的内存测试配置
 */
function getMemoryTestConfig() {
    // 默认配置
    const config = {
        enable: true,
        maxHeapGrowth: 200 * 1024 * 1024, // 200MB
        maxHeapUsed: 1024 * 1024 * 1024, // 1GB
    };
    // 如果在CI环境中，可以调整配置
    if (typeof process !== 'undefined' && process.env && process.env.CI === 'true') {
        config.enable = false; // 在CI环境中禁用内存测试
    }
    return config;
}
describe('处理器内存使用测试', () => {
    let processor;
    let referenceResolver;
    beforeEach(() => {
        // 创建引用解析器
        referenceResolver = new DefaultReferenceResolver();
        // 注册协议处理器
        referenceResolver.registerProtocolHandler(new FileProtocolHandler());
        referenceResolver.registerProtocolHandler(new HttpProtocolHandler());
        referenceResolver.registerProtocolHandler(new IdProtocolHandler());
        // 创建处理器
        processor = new DefaultProcessor();
        // 初始化ProcessingContext
        if (!ProcessingContext.prototype.idMap) {
            ProcessingContext.prototype.idMap = new Map();
        }
        // 注册所有访问者
        processor.registerVisitor(new DocumentMetadataVisitor());
        processor.registerVisitor(new AttributeValidationVisitor({
            tagRegistry: mockTagRegistry
        }));
        processor.registerVisitor(new IdValidationVisitor());
        processor.registerVisitor(new InheritanceVisitor(referenceResolver));
        processor.registerVisitor(new ReferenceVisitor({
            referenceResolver,
            resolveInContent: true
        }));
        processor.registerVisitor(new MarkdownContentVisitor());
        // 设置引用解析器
        processor.setReferenceResolver(referenceResolver);
        // 模拟控制台输出
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
    });
    it('应该限制内存增长在合理范围内', async () => {
        // 获取内存测试配置
        const memoryConfig = getMemoryTestConfig();
        // 如果禁用了内存测试，跳过测试
        if (!memoryConfig.enable) {
            console.log('内存测试已被禁用');
            return;
        }
        // 强制执行垃圾回收（如果可用）
        if (global.gc) {
            global.gc();
        }
        else {
            console.warn('未启用垃圾回收，需要使用 --expose-gc 标志启动 Node.js');
        }
        // 记录初始内存使用
        const initialMemory = getMemoryUsage();
        console.log(`初始内存使用: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 创建一个中等大小的文档测试内存使用 (20个章节，每章节50个元素，内容重复10次)
        const mediumDocument = generateHugeDocument(20, 50, 10);
        // 处理文档
        await processor.process(mediumDocument, '/test/memory-test-medium.xml');
        // 记录中等文档处理后的内存使用
        const mediumMemory = getMemoryUsage();
        console.log(`中等文档处理后内存: ${(mediumMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`内存增长: ${((mediumMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
        // 手动触发垃圾回收
        if (global.gc) {
            global.gc();
        }
        // 记录GC后的内存使用
        const afterGcMemory = getMemoryUsage();
        console.log(`GC后内存使用: ${(afterGcMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 创建一个大型文档测试内存峰值 (50个章节，每章节100个元素，内容重复20次)
        const largeDocument = generateHugeDocument(50, 100, 20);
        // 处理大型文档
        await processor.process(largeDocument, '/test/memory-test-large.xml');
        // 记录大型文档处理后的内存使用
        const largeMemory = getMemoryUsage();
        console.log(`大型文档处理后内存: ${(largeMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`内存增长: ${((largeMemory.heapUsed - afterGcMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
        // 验证内存使用在合理范围内
        const memoryGrowth = largeMemory.heapUsed - initialMemory.heapUsed;
        expect(memoryGrowth).toBeLessThan(memoryConfig.maxHeapGrowth);
        expect(largeMemory.heapUsed).toBeLessThan(memoryConfig.maxHeapUsed);
        // 释放大型文档引用
        mediumDocument = null;
        largeDocument = null;
        // 手动触发垃圾回收
        if (global.gc) {
            global.gc();
        }
        // 记录最终内存使用
        const finalMemory = getMemoryUsage();
        console.log(`最终内存使用: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 验证内存清理有效
        const memoryReclaimed = largeMemory.heapUsed - finalMemory.heapUsed;
        console.log(`回收内存: ${(memoryReclaimed / 1024 / 1024).toFixed(2)} MB`);
        // 期望至少回收50%的内存
        expect(memoryReclaimed).toBeGreaterThan(memoryGrowth * 0.5);
    });
    it('应该优化深层次嵌套结构的内存使用', async () => {
        // 获取内存测试配置
        const memoryConfig = getMemoryTestConfig();
        // 如果禁用了内存测试，跳过测试
        if (!memoryConfig.enable) {
            console.log('内存测试已被禁用');
            return;
        }
        // 强制执行垃圾回收
        if (global.gc) {
            global.gc();
        }
        // 记录初始内存使用
        const initialMemory = getMemoryUsage();
        // 创建一个深度嵌套的文档结构
        function createDeepNestedDocument(depth) {
            const document = {
                type: NodeType.DOCUMENT,
                children: [],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 1, offset: 0 }
                }
            };
            // 创建第一层元素
            const rootElement = {
                type: NodeType.ELEMENT,
                tagName: 'document',
                attributes: { id: 'root' },
                children: [],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 1, offset: 0 }
                }
            };
            document.children.push(rootElement);
            // 递归创建嵌套结构
            let currentElement = rootElement;
            for (let i = 0; i < depth; i++) {
                const childElement = {
                    type: NodeType.ELEMENT,
                    tagName: 'nested',
                    attributes: { id: `level-${i}` },
                    children: [
                        {
                            type: NodeType.CONTENT,
                            value: `这是第 ${i} 层嵌套内容 `.repeat(10),
                            position: {
                                start: { line: i + 2, column: 1, offset: i * 100 },
                                end: { line: i + 2, column: 50, offset: i * 100 + 49 }
                            }
                        }
                    ],
                    position: {
                        start: { line: i + 2, column: 1, offset: i * 100 },
                        end: { line: i + 2, column: 100, offset: i * 100 + 99 }
                    }
                };
                currentElement.children.push(childElement);
                currentElement = childElement;
            }
            return document;
        }
        // 创建一个深度为500的嵌套文档
        const deepDocument = createDeepNestedDocument(500);
        // 处理文档前的内存使用
        const beforeProcessMemory = getMemoryUsage();
        console.log(`处理前内存使用: ${(beforeProcessMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 处理深度嵌套文档
        await processor.process(deepDocument, '/test/deep-nested-document.xml');
        // 处理后的内存使用
        const afterProcessMemory = getMemoryUsage();
        console.log(`处理后内存使用: ${(afterProcessMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`内存增长: ${((afterProcessMemory.heapUsed - beforeProcessMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
        // 验证内存增长在合理范围内
        const memoryGrowth = afterProcessMemory.heapUsed - initialMemory.heapUsed;
        expect(memoryGrowth).toBeLessThan(memoryConfig.maxHeapGrowth);
        // 释放文档引用
        deepDocument = null;
        // 手动触发垃圾回收
        if (global.gc) {
            global.gc();
        }
        // 最终内存使用
        const finalMemory = getMemoryUsage();
        console.log(`最终内存使用: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 验证内存清理有效
        const memoryReclaimed = afterProcessMemory.heapUsed - finalMemory.heapUsed;
        console.log(`回收内存: ${(memoryReclaimed / 1024 / 1024).toFixed(2)} MB`);
        // 期望内存回收有效
        expect(finalMemory.heapUsed).toBeLessThanOrEqual(initialMemory.heapUsed * 1.2); // 允许20%的内存增长
    });
    it('应该高效处理引用解析的内存使用', async () => {
        // 获取内存测试配置
        const memoryConfig = getMemoryTestConfig();
        // 如果禁用了内存测试，跳过测试
        if (!memoryConfig.enable) {
            console.log('内存测试已被禁用');
            return;
        }
        // 强制执行垃圾回收
        if (global.gc) {
            global.gc();
        }
        // 记录初始内存
        const initialMemory = getMemoryUsage();
        // 创建一个包含大量引用的文档
        function createDocumentWithManyReferences(refCount) {
            const document = {
                type: NodeType.DOCUMENT,
                children: [],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 1, offset: 0 }
                }
            };
            // 创建根元素
            const rootElement = {
                type: NodeType.ELEMENT,
                tagName: 'document',
                attributes: { id: 'root' },
                children: [],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 1, offset: 0 }
                }
            };
            document.children.push(rootElement);
            // 创建引用目标元素
            for (let i = 0; i < 100; i++) {
                rootElement.children.push({
                    type: NodeType.ELEMENT,
                    tagName: 'target',
                    attributes: { id: `target-${i}` },
                    children: [
                        {
                            type: NodeType.CONTENT,
                            value: `这是引用目标 ${i} 的内容 `.repeat(5),
                            position: {
                                start: { line: i + 2, column: 1, offset: i * 100 },
                                end: { line: i + 2, column: 50, offset: i * 100 + 49 }
                            }
                        }
                    ],
                    position: {
                        start: { line: i + 2, column: 1, offset: i * 100 },
                        end: { line: i + 2, column: 100, offset: i * 100 + 99 }
                    }
                });
            }
            // 创建引用元素
            const referencesSection = {
                type: NodeType.ELEMENT,
                tagName: 'references',
                attributes: { id: 'refs-section' },
                children: [],
                position: {
                    start: { line: 102, column: 1, offset: 10100 },
                    end: { line: 102 + refCount, column: 1, offset: 10100 + refCount * 100 }
                }
            };
            rootElement.children.push(referencesSection);
            // 添加大量引用元素
            for (let i = 0; i < refCount; i++) {
                referencesSection.children.push({
                    type: NodeType.ELEMENT,
                    tagName: 'Reference',
                    attributes: { href: `id:target-${i % 100}` }, // 循环引用100个目标
                    children: [],
                    position: {
                        start: { line: 102 + i, column: 1, offset: 10100 + i * 100 },
                        end: { line: 102 + i, column: 50, offset: 10100 + i * 100 + 49 }
                    }
                });
            }
            return document;
        }
        // 创建一个包含1000个引用的文档
        const docWithManyRefs = createDocumentWithManyReferences(1000);
        // 设置上下文
        const context = new ProcessingContext(docWithManyRefs, '/test/many-references.xml');
        context.idMap = new Map();
        context.resolvedReferences = new Map();
        // 提前填充ID映射
        const rootElement = docWithManyRefs.children[0];
        for (let i = 0; i < 100; i++) {
            const target = rootElement.children[i];
            context.idMap.set(`target-${i}`, target);
        }
        // 处理前的内存使用
        const beforeProcessMemory = getMemoryUsage();
        console.log(`处理前内存使用: ${(beforeProcessMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 处理文档
        processor.setReferenceResolver(new DefaultReferenceResolver({ useCache: true }));
        await processor.process(docWithManyRefs, '/test/many-references.xml');
        // 处理后的内存使用
        const afterProcessMemory = getMemoryUsage();
        console.log(`处理后内存使用: ${(afterProcessMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`内存增长: ${((afterProcessMemory.heapUsed - beforeProcessMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
        // 验证内存增长在合理范围内
        const memoryGrowth = afterProcessMemory.heapUsed - initialMemory.heapUsed;
        expect(memoryGrowth).toBeLessThan(memoryConfig.maxHeapGrowth);
        // 释放文档引用
        docWithManyRefs = null;
        // 手动触发垃圾回收
        if (global.gc) {
            global.gc();
        }
        // 最终内存使用
        const finalMemory = getMemoryUsage();
        console.log(`最终内存使用: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        // 验证内存得到有效回收
        const memoryReclaimed = afterProcessMemory.heapUsed - finalMemory.heapUsed;
        console.log(`回收内存: ${(memoryReclaimed / 1024 / 1024).toFixed(2)} MB`);
        // 期望回收了大部分内存
        expect(memoryReclaimed).toBeGreaterThan(memoryGrowth * 0.7); // 期望至少回收70%的内存
    });
});
//# sourceMappingURL=memory-usage.test.js.map