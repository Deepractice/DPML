import { ContextManager } from './context/contextManager';
/**
 * 默认转换器实现
 */
export class DefaultTransformer {
    /**
     * 默认构造函数
     * @param options 转换器选项
     */
    constructor(options = {}) {
        /**
         * 访问者数组
         * @private
         */
        this.visitors = [];
        /**
         * 转换选项
         * @private
         */
        this.options = {};
        /**
         * 缓存映射
         * @private
         */
        this.cache = new Map();
        /**
         * 上下文管理器
         * @private
         */
        this.contextManager = new ContextManager();
        /**
         * 访问者错误计数映射
         * @private
         */
        this.visitorErrorCounts = new Map();
        /**
         * 被禁用的访问者集合
         * @private
         */
        this.disabledVisitors = new Set();
        this.visitors = [];
        this.options = options;
        this.contextManager = new ContextManager();
        // 初始化访问者错误计数器
        this.visitorErrorCounts = new Map();
        // 初始化被禁用的访问者集合
        this.disabledVisitors = new Set();
    }
    /**
     * 注册访问者
     * @param visitor 访问者
     */
    registerVisitor(visitor) {
        this.visitors.push(visitor);
        // 注册后重新排序
        this.sortVisitors();
    }
    /**
     * 设置输出适配器
     * @param adapter 适配器
     */
    setOutputAdapter(adapter) {
        this.outputAdapter = adapter;
    }
    /**
     * 转换文档
     * @param document 文档
     * @param options 转换选项
     * @returns 转换结果
     */
    transform(document, options = {}) {
        // 合并选项
        const mergedOptions = {
            ...this.options,
            ...options
        };
        // 创建转换上下文
        const context = this.contextManager.createRootContext(document, {
            mode: mergedOptions.mode || 'loose',
            enableCache: mergedOptions.enableCache !== false,
            mergeReturnValues: mergedOptions.mergeReturnValues || false,
            deepMerge: mergedOptions.deepMerge !== false,
            mergeArrays: mergedOptions.mergeArrays || false,
            conflictStrategy: mergedOptions.conflictStrategy || 'last-wins',
            customMergeFn: mergedOptions.customMergeFn,
            errorThreshold: mergedOptions.errorThreshold || 3,
            ...mergedOptions
        });
        // 如果没有访问者，直接返回null
        if (!this.visitors || this.visitors.length === 0) {
            return null;
        }
        // 调用内部转换方法
        return this.transformNode(document, context);
    }
    /**
     * 配置转换器
     * @param options 转换选项
     */
    configure(options) {
        this.options = {
            ...this.options,
            ...options
        };
    }
    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * 排序访问者
     * 按优先级从高到低排序，优先级相同的保持注册顺序
     * @private
     */
    sortVisitors() {
        // 使用稳定排序，保证同优先级的访问者保持注册顺序
        this.visitors.sort((a, b) => {
            const priorityA = a.priority ?? DefaultTransformer.DEFAULT_PRIORITY;
            const priorityB = b.priority ?? DefaultTransformer.DEFAULT_PRIORITY;
            return priorityB - priorityA; // 从高到低排序
        });
    }
    /**
     * 转换节点
     * @param node 节点
     * @param context 上下文
     * @returns 转换结果
     */
    transformNode(node, context) {
        if (!node)
            return null;
        let transformResult;
        // 根据节点类型调用不同的转换方法
        switch (node.type) {
            case 'document':
                transformResult = this.transformDocument(node, context);
                break;
            case 'element':
                transformResult = this.transformElement(node, context);
                break;
            case 'content':
                transformResult = this.transformContent(node, context);
                break;
            case 'reference':
                transformResult = this.transformReference(node, context);
                break;
            default:
                transformResult = null;
        }
        return transformResult;
    }
    /**
     * 获取节点的缓存键
     * @param node 节点
     * @returns 缓存键
     * @private
     */
    getCacheKey(node) {
        // 如果节点有ID，直接使用
        if (node.id) {
            return `id:${node.id}`;
        }
        // 生成内容哈希作为键
        // 简单实现，实际中可能需要更复杂的哈希算法
        return this.generateContentHash(node);
    }
    /**
     * 生成节点内容哈希
     * @param node 节点
     * @returns 内容哈希
     * @private
     */
    generateContentHash(node) {
        if (!node)
            return undefined;
        // 根据节点类型和内容生成简单哈希
        let hashParts = [];
        // 添加节点类型
        hashParts.push(`type:${node.type}`);
        // 添加标签名（如果是元素）
        if (node.tagName) {
            hashParts.push(`tag:${node.tagName}`);
        }
        // 添加内容（如果有）
        if (node.content) {
            hashParts.push(`content:${node.content}`);
        }
        // 添加引用协议（如果是引用）
        if (node.protocol) {
            hashParts.push(`protocol:${node.protocol}`);
        }
        // 添加位置信息
        if (node.position) {
            hashParts.push(`pos:${node.position.start.line}-${node.position.end.line}`);
        }
        // 添加元数据的版本信息（如果有）
        if (node.meta && node.meta.version) {
            hashParts.push(`ver:${node.meta.version}`);
        }
        // 合并所有部分
        return hashParts.join('|');
    }
    /**
     * 从缓存获取结果
     * @param node 节点
     * @returns 缓存的结果或undefined（未命中）
     * @private
     */
    getCachedResult(node) {
        const cacheKey = this.getCacheKey(node);
        if (!cacheKey)
            return undefined;
        const cachedItem = this.cache.get(cacheKey);
        if (!cachedItem)
            return undefined;
        // 检查内容哈希是否匹配（确保节点内容未变）
        const currentContentHash = this.generateContentHash(node);
        if (cachedItem.contentHash && cachedItem.contentHash !== currentContentHash) {
            // 内容已变更，缓存无效
            this.cache.delete(cacheKey);
            return undefined;
        }
        return cachedItem.result;
    }
    /**
     * 缓存转换结果
     * @param node 节点
     * @param result 转换结果
     * @private
     */
    cacheResult(node, result) {
        const cacheKey = this.getCacheKey(node);
        if (!cacheKey)
            return;
        const contentHash = this.generateContentHash(node);
        // 存储缓存项
        this.cache.set(cacheKey, {
            nodeId: cacheKey,
            contentHash,
            result
        });
    }
    /**
     * 转换文档节点
     * @param document 文档节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    transformDocument(document, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, 'document');
        // 应用所有具有visitDocument方法的访问者
        let result = null;
        const results = []; // 存储所有访问者的返回值
        for (const visitor of this.visitors) {
            if (visitor.visitDocument) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    const visitorResult = visitor.visitDocument(document, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        if (context.options.mergeReturnValues) {
                            // 收集所有返回值
                            results.push(visitorResult);
                        }
                        else {
                            // 不合并，使用第一个非空结果
                            result = visitorResult;
                            break;
                        }
                    }
                }
                catch (error) {
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, 'document', document);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        // 如果启用了返回值合并且有多个结果，就合并它们
        if (context.options.mergeReturnValues && results.length > 0) {
            result = this.mergeResults(results, context.options);
        }
        else if (result === null && results.length === 1) {
            // 只有一个结果则直接使用
            result = results[0];
        }
        // 如果有结果，则处理子节点
        if (result !== null && document.children && Array.isArray(document.children) && document.children.length > 0) {
            // 创建包含当前节点结果的上下文
            const childContext = this.contextManager.addResult(newContext, result);
            // 处理子节点，存储结果
            const childResults = document.children.map((child) => this.transformNode(child, childContext)).filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果有子节点结果，并且结果对象有children属性，则添加子节点结果
            if (childResults.length > 0 && typeof result === 'object') {
                result.children = childResults;
            }
        }
        // 如果没有访问者处理文档节点，但有子节点
        else if (result === null && document.children && Array.isArray(document.children) && document.children.length > 0) {
            // 处理子节点
            const childResults = document.children.map((child) => this.transformNode(child, newContext)).filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果子节点有结果，创建默认文档结果
            if (childResults.length > 0) {
                result = {
                    type: 'document',
                    children: childResults
                };
            }
        }
        return result;
    }
    /**
     * 合并多个访问者的返回值
     * @param results 所有返回结果数组
     * @param options 转换选项
     * @returns 合并后的结果
     * @private
     */
    mergeResults(results, options) {
        if (!results || results.length === 0) {
            return null;
        }
        if (results.length === 1) {
            return results[0];
        }
        // 使用第一个结果作为初始值
        let mergedResult = { ...results[0] };
        // 依次合并后续结果
        for (let i = 1; i < results.length; i++) {
            mergedResult = this.mergeObjects(mergedResult, results[i], options);
        }
        return mergedResult;
    }
    /**
     * 合并两个对象
     * @param obj1 第一个对象
     * @param obj2 第二个对象
     * @param options 转换选项
     * @returns 合并后的对象
     * @private
     */
    mergeObjects(obj1, obj2, options) {
        if (!obj1 || typeof obj1 !== 'object')
            return obj2;
        if (!obj2 || typeof obj2 !== 'object')
            return obj1;
        const result = { ...obj1 };
        // 遍历第二个对象的所有属性
        for (const key in obj2) {
            if (Object.prototype.hasOwnProperty.call(obj2, key)) {
                // 如果有自定义合并函数，使用自定义合并函数
                if (options.customMergeFn && key in obj1) {
                    result[key] = options.customMergeFn(key, obj1[key], obj2[key]);
                    continue;
                }
                // 如果两个对象都有这个属性
                if (key in obj1) {
                    const value1 = obj1[key];
                    const value2 = obj2[key];
                    // 处理数组合并
                    if (Array.isArray(value1) && Array.isArray(value2) && options.mergeArrays) {
                        result[key] = [...value1, ...value2];
                    }
                    // 处理对象深度合并
                    else if (value1 && typeof value1 === 'object' &&
                        value2 && typeof value2 === 'object' &&
                        !Array.isArray(value1) && !Array.isArray(value2) &&
                        options.deepMerge) {
                        result[key] = this.mergeObjects(value1, value2, options);
                    }
                    // 处理冲突
                    else {
                        if (options.conflictStrategy === 'first-wins') {
                            // 保留第一个值，不做任何事
                        }
                        else {
                            // 默认使用'last-wins'策略
                            result[key] = value2;
                        }
                    }
                }
                else {
                    // 如果只有第二个对象有这个属性，直接添加
                    result[key] = obj2[key];
                }
            }
        }
        return result;
    }
    /**
     * 转换元素节点
     * @param element 元素节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    transformElement(element, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, element.tagName || 'element');
        // 应用所有具有visitElement方法的访问者
        let result = null;
        const results = []; // 存储所有访问者的返回值
        // 按优先级降序对访问者排序
        const prioritizedVisitors = this.getPrioritizedVisitors(element.tagName);
        for (const visitor of prioritizedVisitors) {
            if (visitor.visitElement) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    const visitorResult = visitor.visitElement(element, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        if (context.options.mergeReturnValues) {
                            // 收集所有返回值
                            results.push(visitorResult);
                        }
                        else {
                            // 不合并，使用第一个非空结果
                            result = visitorResult;
                            break;
                        }
                    }
                }
                catch (error) {
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, 'element', element);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        // 如果启用了返回值合并且有多个结果，就合并它们
        if (context.options.mergeReturnValues && results.length > 0) {
            result = this.mergeResults(results, context.options);
        }
        else if (result === null && results.length === 1) {
            // 只有一个结果则直接使用
            result = results[0];
        }
        // 如果有结果，则处理子节点
        if (result !== null && element.children && Array.isArray(element.children) && element.children.length > 0) {
            // 创建包含当前节点结果的上下文
            const childContext = this.contextManager.addResult(newContext, result);
            // 处理子节点，存储结果
            const childResults = element.children.map((child) => this.transformNode(child, childContext)).filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果有子节点结果，并且结果对象有children属性，则添加子节点结果
            if (childResults.length > 0 && typeof result === 'object') {
                result.children = childResults;
            }
        }
        // 如果没有访问者处理元素节点，但有子节点
        else if (result === null && element.children && Array.isArray(element.children) && element.children.length > 0) {
            // 处理子节点
            const childResults = element.children.map((child) => this.transformNode(child, newContext)).filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果子节点有结果，创建默认元素结果
            if (childResults.length > 0) {
                result = {
                    type: 'element',
                    tagName: element.tagName,
                    children: childResults
                };
            }
        }
        return result;
    }
    /**
     * 转换内容节点
     * @param content 内容节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    transformContent(content, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, 'content');
        // 应用所有具有visitContent方法的访问者
        let result = null;
        const results = []; // 存储所有访问者的返回值
        for (const visitor of this.visitors) {
            if (visitor.visitContent) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    const visitorResult = visitor.visitContent(content, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        if (context.options.mergeReturnValues) {
                            // 收集所有返回值
                            results.push(visitorResult);
                        }
                        else {
                            // 不合并，使用第一个非空结果
                            result = visitorResult;
                            break;
                        }
                    }
                }
                catch (error) {
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, 'content', content);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        // 如果启用了返回值合并且有多个结果，就合并它们
        if (context.options.mergeReturnValues && results.length > 0) {
            result = this.mergeResults(results, context.options);
        }
        else if (result === null && results.length === 1) {
            // 只有一个结果则直接使用
            result = results[0];
        }
        return result;
    }
    /**
     * 转换引用节点
     * @param reference 引用节点
     * @param context 上下文
     * @returns 转换结果
     * @private
     */
    transformReference(reference, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, 'reference');
        // 应用所有具有visitReference方法的访问者
        let result = null;
        const results = []; // 存储所有访问者的返回值
        for (const visitor of this.visitors) {
            if (visitor.visitReference) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    const visitorResult = visitor.visitReference(reference, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        if (context.options.mergeReturnValues) {
                            // 收集所有返回值
                            results.push(visitorResult);
                        }
                        else {
                            // 不合并，使用第一个非空结果
                            result = visitorResult;
                            break;
                        }
                    }
                }
                catch (error) {
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, 'reference', reference);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        // 如果启用了返回值合并且有多个结果，就合并它们
        if (context.options.mergeReturnValues && results.length > 0) {
            result = this.mergeResults(results, context.options);
        }
        else if (result === null && results.length === 1) {
            // 只有一个结果则直接使用
            result = results[0];
        }
        return result;
    }
    /**
     * 处理节点的子节点
     * 将子节点的转换结果作为数组返回
     * @param node 包含子节点的节点
     * @param context 上下文
     * @returns 子节点转换结果数组
     * @private
     */
    processChildren(node, context) {
        if (!node.children || node.children.length === 0) {
            return [];
        }
        return node.children.map((child) => this.transformNode(child, context)).filter((result) => result !== null && result !== undefined);
    }
    /**
     * 增加访问者错误计数
     * @param visitor 访问者
     * @private
     */
    incrementVisitorErrorCount(visitor) {
        const currentCount = this.visitorErrorCounts.get(visitor) || 0;
        const newCount = currentCount + 1;
        this.visitorErrorCounts.set(visitor, newCount);
        // 检查是否超过阈值
        const threshold = this.options.errorThreshold || DefaultTransformer.DEFAULT_ERROR_THRESHOLD;
        // 打印当前错误计数，帮助调试
        console.log(`访问者 ${this.getVisitorName(visitor)} 错误计数: ${newCount}/${threshold}`);
        if (newCount >= threshold) {
            this.disableVisitor(visitor);
        }
    }
    /**
     * 重置访问者错误计数
     * @param visitor 访问者
     * @private
     */
    resetVisitorErrorCount(visitor) {
        // 只在访问者没有出错的情况下才重置计数
        if (this.visitorErrorCounts.has(visitor)) {
            this.visitorErrorCounts.set(visitor, 0);
        }
    }
    /**
     * 禁用访问者
     * @param visitor 访问者
     * @private
     */
    disableVisitor(visitor) {
        if (!this.disabledVisitors.has(visitor)) {
            this.disabledVisitors.add(visitor);
            // 获取访问者名称（如果有）
            const visitorName = this.getVisitorName(visitor);
            console.warn(`访问者 ${visitorName} 已禁用，因为它连续产生了太多错误。`);
        }
    }
    /**
     * 检查访问者是否被禁用
     * @param visitor 访问者
     * @returns 是否被禁用
     * @private
     */
    isVisitorDisabled(visitor) {
        return this.disabledVisitors.has(visitor);
    }
    /**
     * 增强错误信息，添加更多上下文
     * @param error 原始错误
     * @param visitor 访问者
     * @param nodeType 节点类型
     * @param node 节点
     * @returns 增强后的错误
     * @private
     */
    enhanceError(error, visitor, nodeType, node) {
        const originalMessage = error.message || '未知错误';
        const visitorName = this.getVisitorName(visitor);
        // 创建包含更多上下文的详细错误消息
        const enhancedMessage = `访问者 ${visitorName} 处理 ${nodeType} 节点时出错: ${originalMessage}`;
        // 创建新错误对象
        const enhancedError = new Error(enhancedMessage);
        // 保留原始错误的堆栈信息
        if (error.stack) {
            enhancedError.stack = error.stack;
        }
        // 添加额外的上下文
        enhancedError.visitorInfo = {
            name: visitorName,
            nodeType,
            nodePosition: node.position
        };
        return enhancedError;
    }
    /**
     * 获取访问者名称
     * @param visitor 访问者
     * @returns 访问者名称
     * @private
     */
    getVisitorName(visitor) {
        // 尝试从访问者对象获取名称
        const anyVisitor = visitor;
        if (anyVisitor.name) {
            return anyVisitor.name;
        }
        if (anyVisitor.visitorName) {
            return anyVisitor.visitorName;
        }
        // 如果没有名称，返回默认名称
        return '未命名访问者';
    }
    /**
     * 异步转换文档
     * @param document 文档
     * @param options 转换选项
     * @returns 转换结果的Promise
     */
    async transformAsync(document, options = {}) {
        // 合并选项
        const mergedOptions = {
            ...this.options,
            ...options
        };
        // 创建转换上下文
        const context = this.contextManager.createRootContext(document, {
            mode: mergedOptions.mode || 'loose',
            enableCache: mergedOptions.enableCache !== false,
            mergeReturnValues: mergedOptions.mergeReturnValues || false,
            deepMerge: mergedOptions.deepMerge !== false,
            mergeArrays: mergedOptions.mergeArrays || false,
            conflictStrategy: mergedOptions.conflictStrategy || 'last-wins',
            customMergeFn: mergedOptions.customMergeFn,
            errorThreshold: mergedOptions.errorThreshold || 3,
            ...mergedOptions
        });
        // 如果没有访问者，直接返回null
        if (!this.visitors || this.visitors.length === 0) {
            return null;
        }
        try {
            // 调用内部转换方法
            return await this.transformNodeAsync(document, context);
        }
        catch (error) {
            // 如果是严格模式，抛出错误
            if (context.options.mode === 'strict') {
                throw error;
            }
            // 在宽松模式下，记录错误并返回null
            console.error(`异步转换错误: ${error.message}`, error);
            return null;
        }
    }
    /**
     * 异步转换节点
     * @param node 节点
     * @param context 上下文
     * @returns 转换结果的Promise
     * @private
     */
    async transformNodeAsync(node, context) {
        if (!node)
            return null;
        let transformResult;
        // 根据节点类型调用不同的转换方法
        switch (node.type) {
            case 'document':
                transformResult = await this.transformDocumentAsync(node, context);
                break;
            case 'element':
                transformResult = await this.transformElementAsync(node, context);
                break;
            case 'content':
                transformResult = await this.transformContentAsync(node, context);
                break;
            case 'reference':
                transformResult = await this.transformReferenceAsync(node, context);
                break;
            default:
                transformResult = null;
        }
        return transformResult;
    }
    /**
     * 异步转换文档节点
     * @param document 文档节点
     * @param context 上下文
     * @returns 转换结果的Promise
     * @private
     */
    async transformDocumentAsync(document, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, 'document');
        // 应用所有具有visitDocument方法的访问者
        let result = null;
        const results = []; // 存储所有访问者的返回值
        for (const visitor of this.visitors) {
            if (visitor.visitDocumentAsync || visitor.visitDocument) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    // 尝试使用异步方法，如果不存在则使用同步方法
                    let visitorResult;
                    if (visitor.visitDocumentAsync) {
                        visitorResult = await visitor.visitDocumentAsync(document, visitorContext);
                    }
                    else if (visitor.visitDocument) {
                        visitorResult = visitor.visitDocument(document, visitorContext);
                    }
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        if (context.options.mergeReturnValues) {
                            // 收集所有返回值
                            results.push(visitorResult);
                        }
                        else {
                            // 不合并，使用第一个非空结果
                            result = visitorResult;
                            break;
                        }
                    }
                }
                catch (error) {
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, 'document', document);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`异步转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        // 如果启用了返回值合并且有多个结果，就合并它们
        if (context.options.mergeReturnValues && results.length > 0) {
            result = this.mergeResults(results, context.options);
        }
        else if (result === null && results.length === 1) {
            // 只有一个结果则直接使用
            result = results[0];
        }
        // 如果有结果，则处理子节点
        if (result !== null && document.children && Array.isArray(document.children) && document.children.length > 0) {
            // 创建包含当前节点结果的上下文
            const childContext = this.contextManager.addResult(newContext, result);
            // 异步处理子节点，存储结果
            const childPromises = document.children.map((child) => this.transformNodeAsync(child, childContext));
            // 等待所有子节点处理完成
            const childResults = (await Promise.all(childPromises))
                .filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果有子节点结果，并且结果对象有children属性，则添加子节点结果
            if (childResults.length > 0 && typeof result === 'object') {
                result.children = childResults;
            }
        }
        // 如果没有访问者处理文档节点，但有子节点
        else if (result === null && document.children && Array.isArray(document.children) && document.children.length > 0) {
            // 异步处理子节点
            const childPromises = document.children.map((child) => this.transformNodeAsync(child, newContext));
            // 等待所有子节点处理完成
            const childResults = (await Promise.all(childPromises))
                .filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果子节点有结果，创建默认文档结果
            if (childResults.length > 0) {
                result = {
                    type: 'document',
                    children: childResults
                };
            }
        }
        return result;
    }
    /**
     * 异步转换元素节点
     * @param element 元素节点
     * @param context 上下文
     * @returns 转换结果的Promise
     * @private
     */
    async transformElementAsync(element, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, `element[${element.tagName}]`);
        // 应用所有具有visitElement方法的访问者
        let result = null;
        for (const visitor of this.visitors) {
            if (visitor.visitElement) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    let visitorResult = visitor.visitElement(element, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        result = visitorResult;
                        break; // 第一个返回非空结果的访问者将决定结果
                    }
                }
                catch (error) {
                    // 重置错误计数器（如果访问者成功执行）
                    this.resetVisitorErrorCount(visitor);
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, `element[${element.tagName}]`, element);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`异步转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        // 如果有结果，则处理子节点
        if (result !== null && element.children && element.children.length > 0) {
            // 创建包含当前节点结果的上下文
            const childContext = this.contextManager.addResult(newContext, result);
            // 处理子节点，存储结果
            const childResults = await Promise.all(element.children.map((child) => this.transformNodeAsync(child, childContext)));
            // 过滤掉null和undefined结果
            const filteredResults = childResults.filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果有子节点结果，并且结果对象有children属性，则添加子节点结果
            if (filteredResults.length > 0 && typeof result === 'object') {
                result.children = filteredResults;
            }
        }
        // 如果没有访问者处理元素节点，但有子节点
        else if (result === null && element.children && element.children.length > 0) {
            // 处理子节点
            const childResults = await Promise.all(element.children.map((child) => this.transformNodeAsync(child, newContext)));
            // 过滤掉null和undefined结果
            const filteredResults = childResults.filter((childResult) => childResult !== null && childResult !== undefined);
            // 如果子节点有结果，创建默认元素结果
            if (filteredResults.length > 0) {
                result = {
                    type: 'element',
                    tagName: element.tagName,
                    children: filteredResults
                };
            }
        }
        return result;
    }
    /**
     * 异步转换内容节点
     * @param content 内容节点
     * @param context 上下文
     * @returns Promise<转换结果>
     * @private
     */
    async transformContentAsync(content, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, 'content');
        // 应用所有具有visitContent方法的访问者
        let result = null;
        for (const visitor of this.visitors) {
            if (visitor.visitContent) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    let visitorResult = visitor.visitContent(content, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        result = visitorResult;
                        // 注意：内容节点没有子节点，不需要更新父结果链
                        break; // 第一个返回非空结果的访问者将决定结果
                    }
                }
                catch (error) {
                    // 重置错误计数器（如果访问者成功执行）
                    this.resetVisitorErrorCount(visitor);
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, 'content', content);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`异步转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        return result;
    }
    /**
     * 异步转换引用节点
     * @param reference 引用节点
     * @param context 上下文
     * @returns Promise<转换结果>
     * @private
     */
    async transformReferenceAsync(reference, context) {
        // 更新上下文路径
        const newContext = this.contextManager.createChildContext(context, `reference[${reference.protocol}]`);
        // 应用所有具有visitReference方法的访问者
        let result = null;
        for (const visitor of this.visitors) {
            if (visitor.visitReference) {
                try {
                    // 检查访问者是否被禁用
                    if (this.isVisitorDisabled(visitor)) {
                        continue;
                    }
                    // 复制上下文，避免干扰其他访问者
                    const visitorContext = this.contextManager.cloneContext(newContext);
                    let visitorResult = visitor.visitReference(reference, visitorContext);
                    // 访问者成功执行，重置错误计数
                    this.resetVisitorErrorCount(visitor);
                    if (visitorResult !== null && visitorResult !== undefined) {
                        result = visitorResult;
                        // 注意：引用节点没有子节点，不需要更新父结果链
                        break; // 第一个返回非空结果的访问者将决定结果
                    }
                }
                catch (error) {
                    // 重置错误计数器（如果访问者成功执行）
                    this.resetVisitorErrorCount(visitor);
                    // 错误处理
                    const enhancedError = this.enhanceError(error, visitor, `reference[${reference.protocol}]`, reference);
                    // 如果模式是严格的，则抛出错误
                    if (context.options.mode === 'strict') {
                        throw enhancedError;
                    }
                    // 在宽松模式下，记录错误并继续
                    console.error(`异步转换错误: ${enhancedError.message}`, enhancedError);
                    // 增加访问者错误计数
                    this.incrementVisitorErrorCount(visitor);
                    // 继续下一个访问者
                    continue;
                }
            }
        }
        return result;
    }
    /**
     * 获取按优先级排序的访问者列表
     * @param tagName 元素标签名
     * @returns 按优先级排序的访问者列表
     * @private
     */
    getPrioritizedVisitors(tagName) {
        // 深拷贝访问者列表以避免修改原始列表
        const visitors = [...this.visitors];
        // 根据优先级排序，高优先级的访问者排在前面
        return visitors.sort((a, b) => {
            // 获取针对特定标签的优先级
            const aPriority = this.getVisitorPriority(a, tagName) || 0;
            const bPriority = this.getVisitorPriority(b, tagName) || 0;
            // 优先级高的排在前面（降序排列）
            return bPriority - aPriority;
        });
    }
    /**
     * 获取访问者针对特定标签的优先级
     * @param visitor 访问者
     * @param tagName 标签名
     * @returns 优先级值
     * @private
     */
    getVisitorPriority(visitor, tagName) {
        // 默认优先级为0
        let priority = 0;
        // 如果访问者有优先级属性
        if (visitor.priority !== undefined) {
            // 如果优先级是数字，直接使用
            if (typeof visitor.priority === 'number') {
                priority = visitor.priority;
            }
            // 如果优先级是对象，查找针对特定标签的优先级
            else if (typeof visitor.priority === 'object' && tagName && tagName in visitor.priority) {
                priority = visitor.priority[tagName];
            }
            // 如果优先级是对象，查找默认优先级
            else if (typeof visitor.priority === 'object' && 'default' in visitor.priority) {
                priority = visitor.priority.default;
            }
        }
        return priority;
    }
}
/**
 * 默认错误阈值
 * @private
 */
DefaultTransformer.DEFAULT_ERROR_THRESHOLD = 3;
/**
 * 默认优先级
 * @private
 */
DefaultTransformer.DEFAULT_PRIORITY = 0;
//# sourceMappingURL=defaultTransformer.js.map