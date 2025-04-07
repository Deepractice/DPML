/**
 * AttributeValidationVisitor
 *
 * 用于验证元素属性
 */
import { ValidationError, ErrorCode, ErrorLevel } from '../../errors/types';
import { DocumentMode } from './documentMetadataVisitor';
/**
 * 属性验证访问者
 * 验证元素属性的有效性
 */
export class AttributeValidationVisitor {
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options) {
        /**
         * 访问者优先级
         * 在元数据处理后执行
         */
        this.priority = 80;
        this.tagRegistry = options.tagRegistry;
        this.strictMode = options.strictMode ?? false;
        this.validateUnknownTags = options.validateUnknownTags ?? false;
    }
    /**
     * 处理元素节点
     * 验证属性
     * @param element 元素节点
     * @param context 处理上下文
     * @returns 处理后的元素节点
     */
    async visitElement(element, context) {
        // 获取标签定义
        const tagDefinition = this.tagRegistry.getTagDefinition(element.tagName);
        // 如果标签未定义且不验证未知标签，则跳过验证
        if (!tagDefinition && !this.validateUnknownTags) {
            return element;
        }
        // 如果标签未定义但需要验证未知标签
        if (!tagDefinition && this.validateUnknownTags) {
            const error = new ValidationError({
                code: ErrorCode.INVALID_NESTING,
                message: `未知标签: ${element.tagName}`,
                level: ErrorLevel.ERROR,
                position: this.getPosition(element)
            });
            return this.handleValidationError(error, context, element);
        }
        // 确保标签定义存在
        if (tagDefinition) {
            // 验证必需属性
            if (tagDefinition.requiredAttributes) {
                for (const requiredAttr of tagDefinition.requiredAttributes) {
                    if (!(requiredAttr in element.attributes)) {
                        const error = new ValidationError({
                            code: ErrorCode.MISSING_REQUIRED_ATTRIBUTE,
                            message: `缺少必需的属性: ${requiredAttr}`,
                            level: this.isStrictMode(context) ? ErrorLevel.ERROR : ErrorLevel.WARNING,
                            position: this.getPosition(element)
                        });
                        return this.handleValidationError(error, context, element);
                    }
                }
            }
            // 验证未知属性
            if (tagDefinition.attributes) {
                for (const attr in element.attributes) {
                    if (!tagDefinition.attributes.includes(attr) && !attr.startsWith('x-')) {
                        const warning = new ValidationError({
                            code: ErrorCode.INVALID_ATTRIBUTE,
                            message: `未知属性: ${attr}`,
                            level: ErrorLevel.WARNING,
                            position: this.getPosition(element)
                        });
                        console.warn(warning.toString());
                    }
                }
            }
            // 执行自定义验证
            if (tagDefinition.validate) {
                try {
                    const validationResult = tagDefinition.validate(element, {});
                    if (!validationResult.valid && validationResult.errors) {
                        // 处理验证错误
                        for (const error of validationResult.errors) {
                            const validationError = new ValidationError({
                                code: error.code || ErrorCode.INVALID_ATTRIBUTE,
                                message: error.message,
                                level: this.isStrictMode(context) ? ErrorLevel.ERROR : ErrorLevel.WARNING,
                                position: this.getPosition(element)
                            });
                            return this.handleValidationError(validationError, context, element);
                        }
                    }
                    // 处理验证警告
                    if (validationResult.warnings) {
                        for (const warning of validationResult.warnings) {
                            const validationWarning = new ValidationError({
                                code: warning.code || 'warning',
                                message: warning.message,
                                level: ErrorLevel.WARNING,
                                position: this.getPosition(element)
                            });
                            console.warn(validationWarning.toString());
                        }
                    }
                }
                catch (error) {
                    const validationError = new ValidationError({
                        code: ErrorCode.UNKNOWN_ERROR,
                        message: `自定义验证器错误: ${error.message}`,
                        level: this.isStrictMode(context) ? ErrorLevel.ERROR : ErrorLevel.WARNING,
                        position: this.getPosition(element)
                    });
                    return this.handleValidationError(validationError, context, element);
                }
            }
        }
        return element;
    }
    /**
     * 确定是否在严格模式下运行
     * @param context 处理上下文
     * @returns 是否严格模式
     */
    isStrictMode(context) {
        // 如果访问者设置了严格模式，则使用访问者的设置
        if (this.strictMode) {
            return true;
        }
        // 否则使用文档的模式设置
        const metadata = context.variables.metadata;
        return metadata && metadata.mode === DocumentMode.STRICT;
    }
    /**
     * 获取元素位置信息
     * @param element 元素节点
     * @returns 位置信息
     */
    getPosition(element) {
        if (!element.position) {
            return undefined;
        }
        return {
            line: element.position.start.line,
            column: element.position.start.column,
            offset: element.position.start.offset
        };
    }
    /**
     * 处理验证错误
     * @param error 验证错误
     * @param context 处理上下文
     * @param element 元素节点（可选）
     * @returns 处理后的元素节点
     */
    handleValidationError(error, context, element) {
        // 在严格模式下抛出错误
        if (error.level === ErrorLevel.ERROR && this.isStrictMode(context)) {
            throw error;
        }
        // 在非严格模式下只发出警告
        console.warn(error.toString());
        // 返回原始元素
        return element || {};
    }
}
//# sourceMappingURL=attributeValidationVisitor.js.map