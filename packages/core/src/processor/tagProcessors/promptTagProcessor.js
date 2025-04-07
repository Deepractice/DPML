/**
 * PromptTagProcessor
 *
 * Prompt领域的标签处理器示例
 */
import { NodeType } from '../../types/node';
/**
 * Prompt标签处理器
 *
 * 处理prompt标签，提取其语义信息，生成prompt元数据
 * 这是一个领域标签处理器的示例实现
 */
export class PromptTagProcessor {
    constructor() {
        /**
         * 处理器优先级
         */
        this.priority = 10;
    }
    /**
     * 判断是否可以处理该元素
     * @param element 元素
     * @returns 如果是prompt标签返回true
     */
    canProcess(element) {
        return element.tagName === 'prompt';
    }
    /**
     * 处理prompt标签
     * @param element prompt元素
     * @param context 处理上下文
     * @returns 处理后的元素
     */
    async process(element, context) {
        // 确保元素有metadata对象
        if (!element.metadata) {
            element.metadata = {};
        }
        // 提取prompt属性
        const { model = 'default', temperature = 0.7, maxTokens, topP, frequencyPenalty, presencePenalty, ...otherAttrs } = element.attributes;
        // 创建prompt元数据
        element.metadata.semantic = {
            type: 'prompt',
            model,
            parameters: {
                temperature: parseFloat(temperature),
                maxTokens: maxTokens ? parseInt(maxTokens, 10) : undefined,
                topP: topP ? parseFloat(topP) : undefined,
                frequencyPenalty: frequencyPenalty ? parseFloat(frequencyPenalty) : undefined,
                presencePenalty: presencePenalty ? parseFloat(presencePenalty) : undefined
            },
            attributes: otherAttrs // 保存其他属性
        };
        // 处理子元素
        const messages = [];
        const systemPrompts = [];
        for (const child of element.children) {
            if (child.type === NodeType.ELEMENT) {
                const childElement = child;
                if (childElement.tagName === 'message') {
                    // 处理message标签
                    const message = {
                        role: childElement.attributes.role || 'user',
                        content: this.extractContent(childElement)
                    };
                    messages.push(message);
                }
                else if (childElement.tagName === 'system') {
                    // 处理system标签
                    systemPrompts.push(this.extractContent(childElement));
                }
            }
        }
        // 添加消息和系统提示到元数据
        if (messages.length > 0) {
            element.metadata.semantic.messages = messages;
        }
        if (systemPrompts.length > 0) {
            element.metadata.semantic.systemPrompts = systemPrompts;
        }
        // 在元数据中标记已被处理
        element.metadata.processed = true;
        element.metadata.processorName = 'PromptTagProcessor';
        return element;
    }
    /**
     * 提取元素内容
     * @param element 元素
     * @returns 内容文本
     */
    extractContent(element) {
        let content = '';
        for (const child of element.children) {
            if (child.type === NodeType.CONTENT) {
                const contentNode = child;
                content += contentNode.value;
            }
        }
        return content.trim();
    }
}
//# sourceMappingURL=promptTagProcessor.js.map