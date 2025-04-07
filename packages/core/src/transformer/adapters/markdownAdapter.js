/**
 * Markdown输出适配器
 *
 * 将结果转换为Markdown字符串
 */
export class MarkdownAdapter {
    /**
     * 构造函数
     * @param options 适配器选项
     */
    constructor(options = {}) {
        // 设置默认选项
        this.options = {
            includeFrontmatter: true,
            indent: '  ',
            listItemPrefix: '- ',
            emphasisMark: '*',
            strongMark: '**',
            ...options
        };
    }
    /**
     * 适配方法
     *
     * 将结果转换为Markdown字符串
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果，Markdown字符串
     */
    adapt(result, context) {
        try {
            // 处理null和undefined
            if (result === null || result === undefined) {
                return '';
            }
            // 生成Markdown
            return this.nodeToMarkdown(result);
        }
        catch (error) {
            // 处理转换错误
            if (error instanceof Error) {
                return `> 错误: ${error.message}\n\n`;
            }
            // 未知错误
            return '> 未知转换错误\n\n';
        }
    }
    /**
     * 将节点转换为Markdown
     * @param node 要转换的节点
     * @returns Markdown字符串
     * @private
     */
    nodeToMarkdown(node) {
        if (!node)
            return '';
        // 处理基本类型
        if (typeof node !== 'object') {
            return String(node);
        }
        // 处理文档节点
        if (node.type === 'document') {
            let markdown = '';
            // 添加前言
            if (this.options.includeFrontmatter && node.meta && typeof node.meta === 'object') {
                markdown += this.generateFrontmatter(node.meta);
            }
            // 处理子节点
            if (node.children && Array.isArray(node.children)) {
                for (const child of node.children) {
                    markdown += this.nodeToMarkdown(child);
                }
            }
            return markdown;
        }
        // 处理元素节点
        if (node.type === 'element') {
            return this.elementToMarkdown(node);
        }
        // 处理内容节点
        if (node.type === 'content') {
            return node.text || node.value || '';
        }
        // 处理其他节点类型
        // 尝试处理子节点
        if (node.children && Array.isArray(node.children)) {
            let markdown = '';
            for (const child of node.children) {
                markdown += this.nodeToMarkdown(child);
            }
            return markdown;
        }
        // 如果无法识别节点类型，返回节点的文本内容
        return node.text || node.value || '';
    }
    /**
     * 将元素节点转换为Markdown
     * @param element 元素节点
     * @returns Markdown字符串
     * @private
     */
    elementToMarkdown(element) {
        const name = element.name || '';
        // 处理不同类型的元素
        switch (name) {
            case 'heading':
                return this.headingToMarkdown(element);
            case 'paragraph':
                return this.paragraphToMarkdown(element);
            case 'list':
                return this.listToMarkdown(element);
            case 'listItem':
                return this.listItemToMarkdown(element);
            case 'table':
                return this.tableToMarkdown(element);
            case 'tableRow':
                return this.tableRowToMarkdown(element);
            case 'tableCell':
                return this.tableCellToMarkdown(element);
            case 'codeBlock':
                return this.codeBlockToMarkdown(element);
            case 'inlineCode':
                return this.inlineCodeToMarkdown(element);
            case 'strong':
                return this.strongToMarkdown(element);
            case 'emphasis':
                return this.emphasisToMarkdown(element);
            case 'link':
                return this.linkToMarkdown(element);
            case 'image':
                return this.imageToMarkdown(element);
            case 'blockquote':
                return this.blockquoteToMarkdown(element);
            case 'thematicBreak':
                return '---\n\n';
            default:
                // 处理未知元素，递归处理子节点
                if (element.children && Array.isArray(element.children)) {
                    let markdown = '';
                    for (const child of element.children) {
                        markdown += this.nodeToMarkdown(child);
                    }
                    return markdown;
                }
                // 如果没有子节点，返回元素的文本内容
                return element.text || element.value || '';
        }
    }
    /**
     * 生成前言（元数据）
     * @param meta 元数据对象
     * @returns 前言Markdown字符串
     * @private
     */
    generateFrontmatter(meta) {
        let frontmatter = '---\n';
        // 添加元数据属性
        for (const [key, value] of Object.entries(meta)) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                frontmatter += `${key}: ${value}\n`;
            }
            else if (Array.isArray(value)) {
                frontmatter += `${key}:\n`;
                for (const item of value) {
                    frontmatter += `  - ${item}\n`;
                }
            }
            else if (value && typeof value === 'object') {
                frontmatter += `${key}:\n`;
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    frontmatter += `  ${nestedKey}: ${nestedValue}\n`;
                }
            }
        }
        frontmatter += '---\n\n';
        return frontmatter;
    }
    /**
     * 标题转Markdown
     * @param heading 标题元素
     * @returns Markdown字符串
     * @private
     */
    headingToMarkdown(heading) {
        const level = Math.min(Math.max(heading.level || 1, 1), 6);
        const hashes = '#'.repeat(level);
        // 递归处理子节点
        let content = '';
        if (heading.children && Array.isArray(heading.children)) {
            for (const child of heading.children) {
                content += this.nodeToMarkdown(child);
            }
        }
        else {
            content = heading.text || heading.value || '';
        }
        return `${hashes} ${content}\n\n`;
    }
    /**
     * 段落转Markdown
     * @param paragraph 段落元素
     * @returns Markdown字符串
     * @private
     */
    paragraphToMarkdown(paragraph) {
        // 递归处理子节点
        let content = '';
        if (paragraph.children && Array.isArray(paragraph.children)) {
            for (const child of paragraph.children) {
                content += this.nodeToMarkdown(child);
            }
        }
        else {
            content = paragraph.text || paragraph.value || '';
        }
        return `${content}\n\n`;
    }
    /**
     * 列表转Markdown
     * @param list 列表元素
     * @returns Markdown字符串
     * @private
     */
    listToMarkdown(list) {
        if (!list.children || !Array.isArray(list.children) || list.children.length === 0) {
            return '';
        }
        let markdown = '';
        const isOrdered = list.ordered === true;
        // 处理列表项
        list.children.forEach((item, index) => {
            if (isOrdered) {
                // 有序列表使用数字+点
                markdown += `${index + 1}. `;
            }
            else {
                // 无序列表使用配置的前缀
                markdown += this.options.listItemPrefix;
            }
            // 获取列表项内容
            let content = '';
            if (item.children && Array.isArray(item.children)) {
                for (const child of item.children) {
                    content += this.nodeToMarkdown(child);
                }
            }
            else if (typeof item === 'object') {
                content = item.text || item.value || '';
            }
            else {
                content = String(item);
            }
            // 删除结尾的额外换行符
            content = content.trimEnd();
            markdown += `${content}\n`;
        });
        return markdown + '\n';
    }
    /**
     * 列表项转Markdown
     * @param item 列表项元素
     * @returns Markdown字符串
     * @private
     */
    listItemToMarkdown(item) {
        // 递归处理子节点
        let content = '';
        if (item.children && Array.isArray(item.children)) {
            for (const child of item.children) {
                content += this.nodeToMarkdown(child);
            }
        }
        else {
            content = item.text || item.value || '';
        }
        // 注意：列表项的前缀由listToMarkdown处理，这里只返回内容
        return content.trimEnd();
    }
    /**
     * 表格转Markdown
     * @param table 表格元素
     * @returns Markdown字符串
     * @private
     */
    tableToMarkdown(table) {
        if (!table.children || !Array.isArray(table.children) || table.children.length === 0) {
            return '';
        }
        let markdown = '';
        let headerRow = null;
        let bodyRows = [];
        // 提取表头和表体
        for (const child of table.children) {
            if (child.name === 'tableHead' && child.children && Array.isArray(child.children)) {
                headerRow = child.children[0]; // 假设表头只有一行
            }
            else if (child.name === 'tableBody' && child.children && Array.isArray(child.children)) {
                bodyRows = child.children;
            }
            else if (child.name === 'tableRow') {
                if (!headerRow) {
                    headerRow = child;
                }
                else {
                    bodyRows.push(child);
                }
            }
        }
        // 如果没有找到表头，使用第一行作为表头
        if (!headerRow && bodyRows.length > 0) {
            headerRow = bodyRows.shift();
        }
        // 如果没有表格数据，返回空字符串
        if (!headerRow) {
            return '';
        }
        // 处理表头
        const headerCells = this.extractTableCells(headerRow);
        if (headerCells.length === 0) {
            return '';
        }
        // 创建表头行
        markdown += `| ${headerCells.join(' | ')} |\n`;
        // 创建分隔行
        markdown += `| ${headerCells.map(() => '---').join(' | ')} |\n`;
        // 处理表体
        for (const row of bodyRows) {
            const cells = this.extractTableCells(row);
            if (cells.length === 0)
                continue;
            // 如果单元格数量少于表头，用空字符串填充
            while (cells.length < headerCells.length) {
                cells.push('');
            }
            // 创建表体行
            markdown += `| ${cells.join(' | ')} |\n`;
        }
        return markdown + '\n';
    }
    /**
     * 提取表格单元格内容
     * @param row 表格行元素
     * @returns 单元格内容数组
     * @private
     */
    extractTableCells(row) {
        if (!row || !row.children || !Array.isArray(row.children)) {
            return [];
        }
        return row.children.map((cell) => {
            let content = '';
            if (cell.children && Array.isArray(cell.children)) {
                for (const child of cell.children) {
                    content += this.nodeToMarkdown(child);
                }
            }
            else {
                content = cell.text || cell.value || '';
            }
            // 移除内容中的换行符，以防破坏表格结构
            return content.replace(/\n/g, ' ').trim();
        });
    }
    /**
     * 表格行转Markdown
     * @param row 表格行元素
     * @returns Markdown字符串
     * @private
     */
    tableRowToMarkdown(row) {
        // 由tableToMarkdown处理，这里返回空字符串
        return '';
    }
    /**
     * 表格单元格转Markdown
     * @param cell 表格单元格元素
     * @returns Markdown字符串
     * @private
     */
    tableCellToMarkdown(cell) {
        // 由tableToMarkdown处理，这里返回空字符串
        return '';
    }
    /**
     * 代码块转Markdown
     * @param codeBlock 代码块元素
     * @returns Markdown字符串
     * @private
     */
    codeBlockToMarkdown(codeBlock) {
        const language = codeBlock.language || '';
        // 获取代码内容
        let code = '';
        if (codeBlock.children && Array.isArray(codeBlock.children)) {
            for (const child of codeBlock.children) {
                code += this.nodeToMarkdown(child);
            }
        }
        else {
            code = codeBlock.text || codeBlock.value || codeBlock.content || '';
        }
        return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
    /**
     * 内联代码转Markdown
     * @param inlineCode 内联代码元素
     * @returns Markdown字符串
     * @private
     */
    inlineCodeToMarkdown(inlineCode) {
        // 获取代码内容
        let code = '';
        if (inlineCode.children && Array.isArray(inlineCode.children)) {
            for (const child of inlineCode.children) {
                code += this.nodeToMarkdown(child);
            }
        }
        else {
            code = inlineCode.text || inlineCode.value || inlineCode.content || '';
        }
        return `\`${code}\``;
    }
    /**
     * 粗体转Markdown
     * @param strong 粗体元素
     * @returns Markdown字符串
     * @private
     */
    strongToMarkdown(strong) {
        // 获取内容
        let content = '';
        if (strong.children && Array.isArray(strong.children)) {
            for (const child of strong.children) {
                content += this.nodeToMarkdown(child);
            }
        }
        else {
            content = strong.text || strong.value || '';
        }
        return `${this.options.strongMark}${content}${this.options.strongMark}`;
    }
    /**
     * 斜体转Markdown
     * @param emphasis 斜体元素
     * @returns Markdown字符串
     * @private
     */
    emphasisToMarkdown(emphasis) {
        // 获取内容
        let content = '';
        if (emphasis.children && Array.isArray(emphasis.children)) {
            for (const child of emphasis.children) {
                content += this.nodeToMarkdown(child);
            }
        }
        else {
            content = emphasis.text || emphasis.value || '';
        }
        return `${this.options.emphasisMark}${content}${this.options.emphasisMark}`;
    }
    /**
     * 链接转Markdown
     * @param link 链接元素
     * @returns Markdown字符串
     * @private
     */
    linkToMarkdown(link) {
        // 获取链接文本
        let text = '';
        if (link.children && Array.isArray(link.children)) {
            for (const child of link.children) {
                text += this.nodeToMarkdown(child);
            }
        }
        else {
            text = link.text || link.value || link.title || link.url || '';
        }
        const url = link.url || link.href || '#';
        const title = link.title ? ` "${link.title}"` : '';
        return `[${text}](${url}${title})`;
    }
    /**
     * 图片转Markdown
     * @param image 图片元素
     * @returns Markdown字符串
     * @private
     */
    imageToMarkdown(image) {
        const alt = image.alt || image.text || '';
        const url = image.url || image.src || '';
        const title = image.title ? ` "${image.title}"` : '';
        return `![${alt}](${url}${title})`;
    }
    /**
     * 引用块转Markdown
     * @param blockquote 引用块元素
     * @returns Markdown字符串
     * @private
     */
    blockquoteToMarkdown(blockquote) {
        // 获取内容
        let content = '';
        if (blockquote.children && Array.isArray(blockquote.children)) {
            for (const child of blockquote.children) {
                content += this.nodeToMarkdown(child);
            }
        }
        else {
            content = blockquote.text || blockquote.value || '';
        }
        // 添加引用前缀
        const lines = content.split('\n');
        const quoted = lines.map(line => line.trim() ? `> ${line}` : '>').join('\n');
        return quoted + '\n\n';
    }
}
//# sourceMappingURL=markdownAdapter.js.map