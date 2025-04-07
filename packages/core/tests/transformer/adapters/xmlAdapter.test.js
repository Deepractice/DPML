import { describe, it, expect } from 'vitest';
import { ContextManager } from '../../../src/transformer/context/contextManager';
import { NodeType } from '../../../src/types/node';
import { XMLAdapter } from '../../../src/transformer/adapters/xmlAdapter';
describe('XMLAdapter', () => {
    // 创建一个简单的文档结果用于测试
    const createSimpleResult = () => {
        return {
            type: 'document',
            meta: {
                title: '测试文档',
                author: '测试作者'
            },
            children: [
                {
                    type: 'element',
                    name: 'section',
                    attributes: {
                        id: 'section1',
                        class: 'main'
                    },
                    children: [
                        {
                            type: 'element',
                            name: 'heading',
                            level: 1,
                            children: [
                                {
                                    type: 'content',
                                    text: '标题内容'
                                }
                            ]
                        },
                        {
                            type: 'element',
                            name: 'paragraph',
                            children: [
                                {
                                    type: 'content',
                                    text: '这是一段测试内容。'
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    };
    // 创建上下文
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
    it('应该将对象转换为XML字符串', () => {
        // 准备
        const adapter = new XMLAdapter();
        const result = createSimpleResult();
        const context = createContext();
        // 执行
        const adapted = adapter.adapt(result, context);
        // 验证
        expect(typeof adapted).toBe('string');
        // 验证基本XML结构
        expect(adapted).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(adapted).toContain('<document>');
        expect(adapted).toContain('</document>');
        expect(adapted).toContain('<meta>');
        expect(adapted).toContain('<title>测试文档</title>');
        expect(adapted).toContain('<author>测试作者</author>');
        expect(adapted).toContain('<section id="section1" class="main">');
        expect(adapted).toContain('<heading level="1">');
        expect(adapted).toContain('标题内容');
        expect(adapted).toContain('<paragraph>');
        expect(adapted).toContain('这是一段测试内容。');
    });
    it('应该处理空结果', () => {
        // 准备
        const adapter = new XMLAdapter();
        const context = createContext();
        // 执行 - 传递null
        const adapted1 = adapter.adapt(null, context);
        // 验证
        expect(adapted1).toBe('<?xml version="1.0" encoding="UTF-8"?><null/>');
        // 执行 - 传递undefined
        const adapted2 = adapter.adapt(undefined, context);
        // 验证
        expect(adapted2).toBe('<?xml version="1.0" encoding="UTF-8"?><null/>');
    });
    it('应该处理原始值', () => {
        // 准备
        const adapter = new XMLAdapter();
        const context = createContext();
        // 执行 - 传递字符串
        const adapted1 = adapter.adapt('测试字符串', context);
        // 验证
        expect(adapted1).toBe('<?xml version="1.0" encoding="UTF-8"?><string>测试字符串</string>');
        // 执行 - 传递数字
        const adapted2 = adapter.adapt(123, context);
        // 验证
        expect(adapted2).toBe('<?xml version="1.0" encoding="UTF-8"?><number>123</number>');
        // 执行 - 传递布尔值
        const adapted3 = adapter.adapt(true, context);
        // 验证
        expect(adapted3).toBe('<?xml version="1.0" encoding="UTF-8"?><boolean>true</boolean>');
    });
    it('应该处理数组', () => {
        // 准备
        const adapter = new XMLAdapter();
        const context = createContext();
        const arrayResult = ['测试1', '测试2', '测试3'];
        // 执行
        const adapted = adapter.adapt(arrayResult, context);
        // 验证
        expect(typeof adapted).toBe('string');
        expect(adapted).toContain('<array>');
        expect(adapted).toContain('<item>测试1</item>');
        expect(adapted).toContain('<item>测试2</item>');
        expect(adapted).toContain('<item>测试3</item>');
        expect(adapted).toContain('</array>');
    });
    it('应该正确处理XML特殊字符', () => {
        // 准备
        const adapter = new XMLAdapter();
        const context = createContext();
        const specialCharsResult = {
            type: 'content',
            text: '特殊字符: < > & " \''
        };
        // 执行
        const adapted = adapter.adapt(specialCharsResult, context);
        // 验证
        expect(typeof adapted).toBe('string');
        // 特殊字符应该被转义
        expect(adapted).toContain('&lt;');
        expect(adapted).toContain('&gt;');
        expect(adapted).toContain('&amp;');
        expect(adapted).toContain('&quot;');
        expect(adapted).toContain('&apos;');
        // 不应包含未转义的特殊字符
        expect(adapted).not.toContain('特殊字符: < >');
    });
    it('应该支持自定义XML配置', () => {
        // 准备 - 使用自定义配置
        const adapter = new XMLAdapter({
            rootName: 'root',
            xmlDeclaration: false,
            pretty: true
        });
        const result = { key: 'value' };
        const context = createContext();
        // 执行
        const adapted = adapter.adapt(result, context);
        // 验证
        expect(typeof adapted).toBe('string');
        expect(adapted).not.toContain('<?xml'); // 无XML声明
        expect(adapted).toContain('<root>'); // 自定义根元素名
        expect(adapted).toContain('<key>value</key>');
        expect(adapted).toContain('</root>');
        // 美化输出应包含换行符和缩进
        expect(adapted).toContain('\n');
        expect(adapted).toContain('  '); // 缩进
    });
});
//# sourceMappingURL=xmlAdapter.test.js.map