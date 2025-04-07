/**
 * IdValidationVisitor
 *
 * 用于验证元素ID的唯一性
 */
import { ValidationError, ErrorCode, ErrorLevel } from '../../errors/types';
/**
 * ID验证访问者
 * 验证文档中所有元素ID的唯一性
 */
export class IdValidationVisitor {
    /**
     * 构造函数
     * @param options 选项
     */
    constructor(options) {
        /**
         * 访问者优先级
         * 在继承处理后但在引用处理前执行
         */
        this.priority = 90;
        this.strictMode = options?.strictMode ?? false;
    }
    /**
     * 处理文档节点
     * 初始化ID映射
     * @param document 文档节点
     * @param context 处理上下文
     * @returns 处理后的文档节点
     */
    async visitDocument(document, context) {
        // 初始化ID映射
        context.idMap = new Map();
        return document;
    }
    /**
     * 处理元素节点
     * 收集并验证ID
     * @param element 元素节点
     * @param context 处理上下文
     * @returns 处理后的元素节点
     */
    async visitElement(element, context) {
        if (element.attributes.id) {
            const id = element.attributes.id;
            // 检查ID是否已存在
            if (context.idMap?.has(id)) {
                // 创建错误
                const error = new ValidationError({
                    code: ErrorCode.INVALID_ATTRIBUTE,
                    message: `重复的ID: ${id}`,
                    level: this.strictMode ? ErrorLevel.ERROR : ErrorLevel.WARNING,
                    position: element.position ? {
                        line: element.position.start.line,
                        column: element.position.start.column,
                        offset: element.position.start.offset
                    } : undefined
                });
                // 在严格模式下抛出错误，否则只发出警告
                if (this.strictMode) {
                    throw error;
                }
                else {
                    console.warn(error.toString());
                }
            }
            // 存储ID与元素的映射
            context.idMap?.set(id, element);
        }
        return element;
    }
}
//# sourceMappingURL=idValidationVisitor.js.map