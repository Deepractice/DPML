/**
 * 处理上下文类
 *
 * 提供处理过程中所需的状态和上下文信息
 */
export class ProcessingContext {
    /**
     * 创建新的处理上下文
     *
     * @param document 要处理的文档
     * @param currentPath 文档的路径
     */
    constructor(document, currentPath) {
        this.document = document;
        this.currentPath = currentPath;
        this.filePath = currentPath;
        this.resolvedReferences = new Map();
        this.parentElements = [];
        this.variables = {};
        this.idMap = new Map();
        // 尝试从文档的根元素获取mode属性
        if (document.children && document.children.length > 0) {
            const rootElement = document.children[0];
            if (rootElement && rootElement.attributes && rootElement.attributes.mode) {
                this.documentMode = rootElement.attributes.mode === 'strict' ? 'strict' : 'loose';
            }
        }
    }
}
//# sourceMappingURL=processingContext.js.map