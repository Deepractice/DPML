/**
 * MarkdownContentVisitor
 *
 * 用于处理内容节点中的Markdown格式
 */
import { Content, Node } from '../../types';
import { NodeVisitor } from '../interfaces';
import { ProcessingContext } from '../processingContext';
/**
 * MarkdownContentVisitor配置选项
 */
export interface MarkdownContentVisitorOptions {
    /**
     * 是否清除HTML标签
     */
    sanitize?: boolean;
    /**
     * 是否将换行转换为<br>
     */
    breaks?: boolean;
    /**
     * 是否启用GFM（GitHub Flavored Markdown）
     */
    gfm?: boolean;
}
/**
 * 带有Markdown内容的Content节点
 */
export interface ContentWithMarkdown extends Content {
    /** 原始Markdown内容 */
    markdown?: string;
}
/**
 * Markdown内容访问者
 * 处理节点中的Markdown内容，将其转换为HTML
 */
export declare class MarkdownContentVisitor implements NodeVisitor {
    /**
     * 访问者优先级
     */
    priority: number;
    /**
     * Markdown选项
     */
    private options;
    /**
     * 需要完全移除的危险标签列表
     */
    private readonly dangerousTags;
    /**
     * 构造函数
     * @param options Markdown选项
     */
    constructor(options?: MarkdownContentVisitorOptions);
    /**
     * 处理节点
     * @param node 要处理的节点
     */
    visit(node: Node): void;
    /**
     * 处理内容节点
     * @param content 内容节点
     * @param context 处理上下文
     * @returns 处理后的内容节点
     */
    visitContent(content: Content, context: ProcessingContext): Promise<ContentWithMarkdown>;
    /**
     * 检查节点是否包含Markdown内容
     * @param node Content节点
     * @returns 是否有Markdown内容
     */
    private hasMarkdown;
    /**
     * 处理Markdown内容
     * @param node Content节点
     */
    private processMarkdown;
    /**
     * 清理内容中的HTML标签
     * @param content 要清理的内容
     * @returns 清理后的内容
     */
    private sanitizeContent;
}
//# sourceMappingURL=markdownContentVisitor.d.ts.map