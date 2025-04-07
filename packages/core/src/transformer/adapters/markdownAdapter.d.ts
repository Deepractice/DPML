import { OutputAdapter } from '../interfaces/outputAdapter';
import { TransformContext } from '../interfaces/transformContext';
/**
 * Markdown适配器选项
 */
export interface MarkdownAdapterOptions {
    /**
     * 是否包含前言（元数据），默认为true
     */
    includeFrontmatter?: boolean;
    /**
     * 缩进字符，默认为两个空格
     */
    indent?: string;
    /**
     * 自定义列表项前缀，默认为"- "
     */
    listItemPrefix?: string;
    /**
     * 自定义强调标记，默认为"*"
     */
    emphasisMark?: string;
    /**
     * 自定义加粗标记，默认为"**"
     */
    strongMark?: string;
}
/**
 * Markdown输出适配器
 *
 * 将结果转换为Markdown字符串
 */
export declare class MarkdownAdapter implements OutputAdapter {
    /**
     * 适配器选项
     * @private
     */
    private options;
    /**
     * 构造函数
     * @param options 适配器选项
     */
    constructor(options?: MarkdownAdapterOptions);
    /**
     * 适配方法
     *
     * 将结果转换为Markdown字符串
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果，Markdown字符串
     */
    adapt(result: any, context: TransformContext): string;
    /**
     * 将节点转换为Markdown
     * @param node 要转换的节点
     * @returns Markdown字符串
     * @private
     */
    private nodeToMarkdown;
    /**
     * 将元素节点转换为Markdown
     * @param element 元素节点
     * @returns Markdown字符串
     * @private
     */
    private elementToMarkdown;
    /**
     * 生成前言（元数据）
     * @param meta 元数据对象
     * @returns 前言Markdown字符串
     * @private
     */
    private generateFrontmatter;
    /**
     * 标题转Markdown
     * @param heading 标题元素
     * @returns Markdown字符串
     * @private
     */
    private headingToMarkdown;
    /**
     * 段落转Markdown
     * @param paragraph 段落元素
     * @returns Markdown字符串
     * @private
     */
    private paragraphToMarkdown;
    /**
     * 列表转Markdown
     * @param list 列表元素
     * @returns Markdown字符串
     * @private
     */
    private listToMarkdown;
    /**
     * 列表项转Markdown
     * @param item 列表项元素
     * @returns Markdown字符串
     * @private
     */
    private listItemToMarkdown;
    /**
     * 表格转Markdown
     * @param table 表格元素
     * @returns Markdown字符串
     * @private
     */
    private tableToMarkdown;
    /**
     * 提取表格单元格内容
     * @param row 表格行元素
     * @returns 单元格内容数组
     * @private
     */
    private extractTableCells;
    /**
     * 表格行转Markdown
     * @param row 表格行元素
     * @returns Markdown字符串
     * @private
     */
    private tableRowToMarkdown;
    /**
     * 表格单元格转Markdown
     * @param cell 表格单元格元素
     * @returns Markdown字符串
     * @private
     */
    private tableCellToMarkdown;
    /**
     * 代码块转Markdown
     * @param codeBlock 代码块元素
     * @returns Markdown字符串
     * @private
     */
    private codeBlockToMarkdown;
    /**
     * 内联代码转Markdown
     * @param inlineCode 内联代码元素
     * @returns Markdown字符串
     * @private
     */
    private inlineCodeToMarkdown;
    /**
     * 粗体转Markdown
     * @param strong 粗体元素
     * @returns Markdown字符串
     * @private
     */
    private strongToMarkdown;
    /**
     * 斜体转Markdown
     * @param emphasis 斜体元素
     * @returns Markdown字符串
     * @private
     */
    private emphasisToMarkdown;
    /**
     * 链接转Markdown
     * @param link 链接元素
     * @returns Markdown字符串
     * @private
     */
    private linkToMarkdown;
    /**
     * 图片转Markdown
     * @param image 图片元素
     * @returns Markdown字符串
     * @private
     */
    private imageToMarkdown;
    /**
     * 引用块转Markdown
     * @param blockquote 引用块元素
     * @returns Markdown字符串
     * @private
     */
    private blockquoteToMarkdown;
}
//# sourceMappingURL=markdownAdapter.d.ts.map