/**
 * DefaultProcessor实现
 *
 * 提供处理器的默认实现
 */
import { NodeType } from '../types/node';
import { ProcessingContext as ProcessingContextImpl } from './processingContext';
import { ErrorHandler } from './errors/errorHandler';
import { ProcessingError, ErrorSeverity } from './errors/processingError';
/**
 * 默认标签处理器注册表实现
 */
class DefaultTagProcessorRegistry {
    constructor() {
        this.processors = new Map();
    }
    /**
     * 注册标签处理器
     * @param tagName 标签名
     * @param processor 处理器
     */
    registerProcessor(tagName, processor) {
        const existingProcessors = this.processors.get(tagName) || [];
        existingProcessors.push(processor);
        this.processors.set(tagName, existingProcessors);
    }
    /**
     * 获取标签处理器
     * @param tagName 标签名
     * @returns 处理器数组
     */
    getProcessors(tagName) {
        return this.processors.get(tagName) || [];
    }
}
/**
 * 默认处理器实现
 *
 * 负责协调所有访问者的执行，以及文档处理流程
 */
export class DefaultProcessor {
    /**
     * 构造函数
     * @param options 处理器选项
     */
    constructor(options) {
        /**
         * 注册的访问者列表
         */
        this.visitors = [];
        /**
         * 注册的协议处理器列表
         */
        this.protocolHandlers = [];
        /**
         * 引用解析器
         */
        this.referenceResolver = null;
        /**
         * 处理上下文
         */
        this.context = null;
        /**
         * 处理选项
         */
        this.options = {};
        // 初始化标签处理器注册表
        this.tagProcessorRegistry = new DefaultTagProcessorRegistry();
        // 初始化错误处理器
        this.errorHandler = new ErrorHandler({
            strictMode: options?.strictMode,
            errorRecovery: options?.errorRecovery,
            onError: options?.onError,
            onWarning: (warning) => {
                if (options?.onWarning) {
                    options.onWarning(warning.message);
                }
            }
        });
        if (options) {
            this.configure(options);
        }
    }
    /**
     * 注册节点访问者
     * @param visitor 节点访问者
     */
    registerVisitor(visitor) {
        this.visitors.push(visitor);
    }
    /**
     * 注册协议处理器
     * @param handler 协议处理器
     */
    registerProtocolHandler(handler) {
        this.protocolHandlers.push(handler);
        if (this.referenceResolver) {
            this.referenceResolver.registerProtocolHandler(handler);
        }
    }
    /**
     * 注册标签处理器
     * @param tagName 标签名
     * @param processor 标签处理器
     */
    registerTagProcessor(tagName, processor) {
        this.tagProcessorRegistry.registerProcessor(tagName, processor);
    }
    /**
     * 获取标签处理器注册表
     * @returns 标签处理器注册表
     */
    getTagProcessorRegistry() {
        return this.tagProcessorRegistry;
    }
    /**
     * 设置引用解析器
     * @param resolver 引用解析器
     */
    setReferenceResolver(resolver) {
        this.referenceResolver = resolver;
    }
    /**
     * 配置处理器
     * @param options 配置选项
     */
    configure(options) {
        this.options = { ...this.options, ...options };
        if (options.tagProcessorRegistry) {
            this.tagProcessorRegistry = options.tagProcessorRegistry;
        }
        if (options.errorHandler) {
            this.errorHandler = options.errorHandler;
        }
        // 更新错误处理器配置
        if (options.strictMode !== undefined) {
            this.errorHandler.setStrictMode(options.strictMode);
        }
        if (options.errorRecovery !== undefined) {
            this.errorHandler.setErrorRecovery(options.errorRecovery);
        }
    }
    /**
     * 处理文档
     * @param document 待处理的文档
     * @param path 文档路径
     * @returns 处理后的文档
     */
    async process(document, path) {
        try {
            // 设置当前处理文件路径
            this.errorHandler.setCurrentFilePath(path);
            // 初始化处理上下文
            this.context = new ProcessingContextImpl(document, path);
            // 按优先级排序访问者（从高到低）
            this.sortVisitors();
            // 处理文档
            const processedDocument = await this.visitDocument(document, this.context);
            return processedDocument;
        }
        catch (error) {
            // 处理错误
            if (error instanceof ProcessingError) {
                // 已经是ProcessingError，直接抛出
                throw error;
            }
            else {
                // 将原始错误包装为ProcessingError
                throw new ProcessingError({
                    message: error.message || '处理过程中发生未知错误',
                    filePath: path,
                    severity: ErrorSeverity.FATAL,
                    cause: error
                });
            }
        }
    }
    /**
     * 对访问者进行排序（按优先级从高到低）
     */
    sortVisitors() {
        this.visitors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
    /**
     * 使用所有访问者访问文档
     * @param document 要处理的文档
     * @param context 处理上下文
     * @returns 处理后的文档
     */
    async visitDocument(document, context) {
        try {
            // 使用所有访问者依次处理文档
            let result = document;
            for (const visitor of this.visitors) {
                if (visitor.visitDocument) {
                    try {
                        result = await visitor.visitDocument(result, context);
                    }
                    catch (error) {
                        // 处理访问者错误
                        this.errorHandler.handleError(error, document, context, ErrorSeverity.ERROR, `VISITOR_ERROR_${visitor.constructor.name || 'Unknown'}`);
                        // 如果错误处理没有抛出异常，说明我们处于恢复模式，继续处理
                    }
                }
            }
            // 处理文档的子节点
            if (result.children && result.children.length > 0) {
                const newChildren = [];
                for (const child of result.children) {
                    try {
                        const processedChild = await this.visitNode(child, context);
                        if (processedChild) {
                            newChildren.push(processedChild);
                        }
                    }
                    catch (error) {
                        // 处理子节点错误
                        this.errorHandler.handleError(error, child, context, ErrorSeverity.ERROR, 'NODE_PROCESSING_ERROR');
                        // 如果错误处理没有抛出异常，说明我们处于恢复模式，跳过这个子节点
                    }
                }
                result = {
                    ...result,
                    children: newChildren
                };
            }
            return result;
        }
        catch (error) {
            // 文档处理过程中发生的错误
            this.errorHandler.handleError(error, document, context, ErrorSeverity.FATAL, 'DOCUMENT_PROCESSING_ERROR');
            // 如果handleError没有抛出异常（不应该发生），则手动抛出
            throw error;
        }
    }
    /**
     * 处理元素
     * @param element 要处理的元素
     * @param context 处理上下文
     * @returns 处理后的元素
     */
    async visitElement(element, context) {
        try {
            // 将当前元素添加到父元素栈
            context.parentElements.push(element);
            // 检查并处理mode属性
            if (element.attributes && element.attributes.mode) {
                const isStrict = element.attributes.mode === 'strict';
                // 创建一个临时上下文分支，仅在这个元素的处理过程中使用特定的模式
                const previousMode = this.errorHandler.isStrictMode();
                this.errorHandler.setStrictMode(isStrict);
                // 确保在函数结束时恢复之前的模式
                try {
                    // 继续处理元素
                    // 使用所有访问者依次处理元素
                    let result = element;
                    for (const visitor of this.visitors) {
                        if (visitor.visitElement) {
                            try {
                                result = await visitor.visitElement(result, context);
                            }
                            catch (error) {
                                // 基于context和元素的mode属性处理错误
                                this.errorHandler.handleErrorWithContext(error, element, context, `ELEMENT_VISITOR_ERROR_${visitor.constructor.name || 'Unknown'}`);
                                // 如果没有抛出异常，说明是警告或处于恢复模式
                            }
                        }
                    }
                    // 处理元素的子节点
                    if (result.children && result.children.length > 0) {
                        const newChildren = [];
                        for (const child of result.children) {
                            try {
                                const processedChild = await this.visitNode(child, context);
                                if (processedChild) {
                                    newChildren.push(processedChild);
                                }
                            }
                            catch (error) {
                                // 处理子节点错误
                                this.errorHandler.handleErrorWithContext(error, child, context, 'CHILD_PROCESSING_ERROR');
                                // 如果没有抛出异常，跳过这个子节点
                            }
                        }
                        result = {
                            ...result,
                            children: newChildren
                        };
                    }
                    // 从父元素栈中移除当前元素
                    context.parentElements.pop();
                    return result;
                }
                finally {
                    // 恢复之前的模式
                    this.errorHandler.setStrictMode(previousMode);
                }
            }
            // 使用所有访问者依次处理元素
            let result = element;
            for (const visitor of this.visitors) {
                if (visitor.visitElement) {
                    try {
                        result = await visitor.visitElement(result, context);
                    }
                    catch (error) {
                        // 基于context和元素的mode属性处理错误
                        this.errorHandler.handleErrorWithContext(error, element, context, `ELEMENT_VISITOR_ERROR_${visitor.constructor.name || 'Unknown'}`);
                        // 如果没有抛出异常，说明是警告或处于恢复模式
                    }
                }
            }
            // 处理元素的子节点
            if (result.children && result.children.length > 0) {
                const newChildren = [];
                for (const child of result.children) {
                    try {
                        const processedChild = await this.visitNode(child, context);
                        if (processedChild) {
                            newChildren.push(processedChild);
                        }
                    }
                    catch (error) {
                        // 处理子节点错误
                        this.errorHandler.handleErrorWithContext(error, child, context, 'CHILD_PROCESSING_ERROR');
                        // 如果没有抛出异常，跳过这个子节点
                    }
                }
                result = {
                    ...result,
                    children: newChildren
                };
            }
            // 从父元素栈中移除当前元素
            context.parentElements.pop();
            return result;
        }
        catch (error) {
            // 元素处理过程中发生的错误
            this.errorHandler.handleErrorWithContext(error, element, context, 'ELEMENT_PROCESSING_ERROR');
            // 如果handleError没有抛出异常，返回原始元素（保留处理功能）
            context.parentElements.pop(); // 确保从栈中移除
            return element;
        }
    }
    /**
     * 处理内容节点
     * @param content 要处理的内容节点
     * @param context 处理上下文
     * @returns 处理后的内容节点
     */
    async visitContent(content, context) {
        // 使用所有访问者依次处理内容节点
        let result = content;
        for (const visitor of this.visitors) {
            if (visitor.visitContent) {
                result = await visitor.visitContent(result, context);
            }
        }
        return result;
    }
    /**
     * 处理引用节点
     * @param reference 要处理的引用节点
     * @param context 处理上下文
     * @returns 处理后的引用节点
     */
    async visitReference(reference, context) {
        // 使用所有访问者依次处理引用节点
        let result = reference;
        for (const visitor of this.visitors) {
            if (visitor.visitReference) {
                result = await visitor.visitReference(result, context);
            }
        }
        return result;
    }
    /**
     * 根据节点类型分发到对应的访问方法
     * @param node 要处理的节点
     * @param context 处理上下文
     * @returns 处理后的节点
     */
    async visitNode(node, context) {
        switch (node.type) {
            case NodeType.ELEMENT:
                return this.visitElement(node, context);
            case NodeType.CONTENT:
                return this.visitContent(node, context);
            case NodeType.REFERENCE:
                return this.visitReference(node, context);
            default:
                return node;
        }
    }
}
//# sourceMappingURL=defaultProcessor.js.map