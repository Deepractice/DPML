import { XMLParserAdapter } from './xml/xml-parser-adapter';
import { XMLToNodeConverter } from './xml/xml-to-node-converter';
import { NodeType } from '../types/node';
import { ParseError } from '../errors';
import { ErrorCode } from '../errors/types';
import { TagRegistry } from './tag-registry';
import { Validator } from './validator';
/**
 * DPML适配器核心类
 * 负责将DPML文本解析为DPML节点树
 */
export class DpmlAdapter {
    /**
     * 构造函数
     * @param options 解析选项
     */
    constructor(options) {
        /**
         * 验证器
         */
        this.validator = null;
        this.errors = [];
        this.warnings = [];
        // 创建XML解析适配器，启用位置跟踪
        this.xmlParser = new XMLParserAdapter({
            trackPosition: true,
            preserveOrder: true
        });
        // 创建XML到DPML节点转换器
        this.nodeConverter = new XMLToNodeConverter();
        // 创建标签注册表
        this.tagRegistry = new TagRegistry();
        // 如果提供了验证选项且启用了验证，创建验证器
        if (options?.validate) {
            this.validator = new Validator(this.tagRegistry);
        }
    }
    /**
     * 获取标签注册表
     * @returns 标签注册表
     */
    getTagRegistry() {
        return this.tagRegistry;
    }
    /**
     * 解析DPML文本
     * @param input DPML文本
     * @param options 解析选项
     * @returns 解析结果
     */
    async parse(input, options) {
        try {
            // 重置状态
            this.errors = [];
            this.warnings = [];
            // 步骤1: 使用XML解析适配器解析文本
            const xmlNode = this.xmlParser.parse(input);
            // 步骤2: 将XML节点转换为DPML节点
            const dpmlNode = this.nodeConverter.convert(xmlNode);
            // 步骤3: 创建Document节点作为根节点
            const document = {
                type: NodeType.DOCUMENT,
                position: dpmlNode.position,
                children: [dpmlNode]
            };
            // 步骤4: 处理元素节点，执行额外的DPML特定处理
            if (document.children.length > 0) {
                this.processElements(document);
            }
            // 步骤5: 如果启用了验证，执行验证
            if ((options?.validate || this.validator) && document.children.length > 0) {
                // 如果未创建验证器，但启用了验证，创建验证器
                if (!this.validator) {
                    this.validator = new Validator(this.tagRegistry);
                }
                // 执行验证
                const validationResult = this.validator.validateDocument(document);
                // 处理验证错误
                if (!validationResult.valid && validationResult.errors) {
                    for (const error of validationResult.errors) {
                        this.errors.push(new ParseError({
                            code: error.code,
                            message: error.message,
                            position: error.position
                        }));
                    }
                }
                // 处理验证警告
                if (validationResult.warnings) {
                    for (const warning of validationResult.warnings) {
                        this.warnings.push({
                            code: warning.code,
                            message: warning.message,
                            position: warning.position
                        });
                    }
                }
            }
            // 返回解析结果
            return {
                ast: document,
                errors: this.errors,
                warnings: this.warnings
            };
        }
        catch (error) {
            // 处理解析错误
            if (error instanceof ParseError) {
                return {
                    ast: this.createEmptyDocument(),
                    errors: [error],
                    warnings: []
                };
            }
            else {
                const parseError = new ParseError({
                    code: ErrorCode.UNKNOWN_ERROR,
                    message: `DPML解析错误: ${error.message}`,
                    cause: error
                });
                return {
                    ast: this.createEmptyDocument(),
                    errors: [parseError],
                    warnings: []
                };
            }
        }
    }
    /**
     * 处理DPML元素节点
     * @param document 文档节点
     */
    processElements(document) {
        // 遍历所有节点，执行DPML特定处理
        // 这里暂时不做任何处理，只是保持节点结构
    }
    /**
     * 创建空文档节点
     * @returns 空的Document节点
     */
    createEmptyDocument() {
        return {
            type: NodeType.DOCUMENT,
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 1, offset: 0 }
            },
            children: []
        };
    }
}
//# sourceMappingURL=dpml-adapter.js.map