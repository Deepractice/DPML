import { NodeType } from '../../../src/types/node';
import { PromptTagProcessor } from '../../../src/processor/tagProcessors/promptTagProcessor';
import { describe, it, expect } from 'vitest';
describe('PromptTagProcessor', () => {
    // 创建一个模拟的 ProcessingContext
    const createMockContext = () => {
        return {
            document: {
                type: NodeType.DOCUMENT,
                children: [],
                position: {
                    start: { line: 0, column: 0, offset: 0 },
                    end: { line: 0, column: 0, offset: 0 }
                }
            },
            currentPath: '/test/path',
            filePath: '/test/path',
            resolvedReferences: new Map(),
            parentElements: [],
            variables: {},
            idMap: new Map()
        };
    };
    // 创建一个内容节点
    const createContentNode = (text) => {
        return {
            type: NodeType.CONTENT,
            value: text,
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: text.length, offset: text.length }
            }
        };
    };
    it('should correctly identify prompt tags', () => {
        const processor = new PromptTagProcessor();
        // 创建一个 prompt 元素
        const promptElement = {
            type: NodeType.ELEMENT,
            tagName: 'prompt',
            attributes: {},
            children: [],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        // 创建一个非 prompt 元素
        const otherElement = {
            type: NodeType.ELEMENT,
            tagName: 'other',
            attributes: {},
            children: [],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        expect(processor.canProcess(promptElement)).toBe(true);
        expect(processor.canProcess(otherElement)).toBe(false);
    });
    it('should process prompt attributes correctly', async () => {
        const processor = new PromptTagProcessor();
        const context = createMockContext();
        // 创建一个带属性的 prompt 元素
        const promptElement = {
            type: NodeType.ELEMENT,
            tagName: 'prompt',
            attributes: {
                model: 'gpt-4',
                temperature: '0.5',
                maxTokens: '2000',
                topP: '0.9',
                frequencyPenalty: '0.3',
                presencePenalty: '0.2',
                customAttr: 'value'
            },
            children: [],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        const result = await processor.process(promptElement, context);
        // 验证元数据是否正确生成
        expect(result.metadata).toBeDefined();
        expect(result.metadata.semantic.type).toBe('prompt');
        expect(result.metadata.semantic.model).toBe('gpt-4');
        expect(result.metadata.semantic.parameters.temperature).toBe(0.5);
        expect(result.metadata.semantic.parameters.maxTokens).toBe(2000);
        expect(result.metadata.semantic.parameters.topP).toBe(0.9);
        expect(result.metadata.semantic.parameters.frequencyPenalty).toBe(0.3);
        expect(result.metadata.semantic.parameters.presencePenalty).toBe(0.2);
        expect(result.metadata.semantic.attributes.customAttr).toBe('value');
        expect(result.metadata.processed).toBe(true);
        expect(result.metadata.processorName).toBe('PromptTagProcessor');
    });
    it('should process message elements correctly', async () => {
        const processor = new PromptTagProcessor();
        const context = createMockContext();
        // 创建用户消息元素
        const userMessage = {
            type: NodeType.ELEMENT,
            tagName: 'message',
            attributes: { role: 'user' },
            children: [createContentNode('Hello AI!')],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        // 创建助手消息元素
        const assistantMessage = {
            type: NodeType.ELEMENT,
            tagName: 'message',
            attributes: { role: 'assistant' },
            children: [createContentNode('Hello human!')],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        // 创建 prompt 元素，包含消息子元素
        const promptElement = {
            type: NodeType.ELEMENT,
            tagName: 'prompt',
            attributes: { model: 'gpt-4' },
            children: [userMessage, assistantMessage],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        const result = await processor.process(promptElement, context);
        // 验证消息是否正确提取
        expect(result.metadata).toBeDefined();
        expect(result.metadata.semantic.messages).toBeDefined();
        expect(result.metadata.semantic.messages.length).toBe(2);
        expect(result.metadata.semantic.messages[0].role).toBe('user');
        expect(result.metadata.semantic.messages[0].content).toBe('Hello AI!');
        expect(result.metadata.semantic.messages[1].role).toBe('assistant');
        expect(result.metadata.semantic.messages[1].content).toBe('Hello human!');
    });
    it('should process system elements correctly', async () => {
        const processor = new PromptTagProcessor();
        const context = createMockContext();
        // 创建系统提示元素
        const systemElement = {
            type: NodeType.ELEMENT,
            tagName: 'system',
            attributes: {},
            children: [createContentNode('You are a helpful assistant.')],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        // 创建 prompt 元素，包含系统提示子元素
        const promptElement = {
            type: NodeType.ELEMENT,
            tagName: 'prompt',
            attributes: { model: 'gpt-4' },
            children: [systemElement],
            position: {
                start: { line: 0, column: 0, offset: 0 },
                end: { line: 0, column: 0, offset: 0 }
            }
        };
        const result = await processor.process(promptElement, context);
        // 验证系统提示是否正确提取
        expect(result.metadata).toBeDefined();
        expect(result.metadata.semantic.systemPrompts).toBeDefined();
        expect(result.metadata.semantic.systemPrompts.length).toBe(1);
        expect(result.metadata.semantic.systemPrompts[0]).toBe('You are a helpful assistant.');
    });
});
//# sourceMappingURL=promptTagProcessor.test.js.map