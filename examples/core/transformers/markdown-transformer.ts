import * as fs from 'fs/promises';
import * as path from 'path';

import { parse, process, NodeType } from '../../../packages/core';

import type { Element, Content, Node } from '../../../packages/core';

/**
 * Markdown转换器 - 将DPML文档转换为Markdown格式
 */
class MarkdownTransformer {
  /**
   * 处理document节点
   */
  visitDocument(document: any): string {
    // 文档节点通常只包含一个根元素，我们可以直接处理其子节点
    if (document.children && document.children.length > 0) {
      return this.visit(document.children[0]);
    }

    return '';
  }

  /**
   * 处理元素节点
   */
  visitElement(element: Element): string {
    // 根据标签名处理不同类型的元素
    switch (element.tagName) {
      case 'prompt':
        return `# ${element.attributes.id || '提示'}\n\n${this.processChildren(element)}`;

      case 'metadata':
        const metadataContent = this.processChildren(element);

        return metadataContent ? `## 元数据\n\n${metadataContent}\n\n` : '';

      case 'title':
        return `### 标题\n\n${this.processChildren(element)}\n\n`;

      case 'author':
        return `### 作者\n\n${this.processChildren(element)}\n\n`;

      case 'created':
        return `### 创建日期\n\n${this.processChildren(element)}\n\n`;

      case 'role':
        const name = element.attributes.name || '未命名';
        const expertise = element.attributes.expertise
          ? `（专长：${element.attributes.expertise}）`
          : '';

        return `## 角色: ${name}${expertise}\n\n${this.processChildren(element)}\n\n`;

      case 'context':
        return `## 上下文\n\n${this.processChildren(element)}\n\n`;

      case 'thinking':
        return `## 思考过程\n\n${this.processChildren(element)}\n\n`;

      case 'executing':
        return `## 执行步骤\n\n${this.processChildren(element)}\n\n`;

      case 'step':
        const stepId = element.attributes.id
          ? `[${element.attributes.id}] `
          : '';

        return `- ${stepId}${this.processChildren(element)}\n`;

      case 'code':
        const language = element.attributes.language || '';

        return `\`\`\`${language}\n${this.processChildren(element)}\n\`\`\`\n\n`;

      case 'references':
        return `## 参考资料\n\n${this.processChildren(element)}\n\n`;

      case 'reference':
        const refId = element.attributes.id || '未命名';
        const url = element.attributes.url || '#';

        return `- [${refId}](${url})\n`;

      // 处理其他元素
      default:
        return this.processChildren(element);
    }
  }

  /**
   * 处理文本内容
   */
  visitContent(content: Content): string {
    // 直接返回文本内容
    return content.value;
  }

  /**
   * 处理节点
   */
  visit(node: Node): string {
    if (!node) return '';

    switch (node.type) {
      case NodeType.DOCUMENT:
        return this.visitDocument(node);
      case NodeType.ELEMENT:
        return this.visitElement(node as Element);
      case NodeType.CONTENT:
        return this.visitContent(node as Content);
      default:
        return '';
    }
  }

  /**
   * 处理子节点
   */
  processChildren(element: Element): string {
    if (!element.children) return '';

    return element.children.map(child => this.visit(child)).join('');
  }

  /**
   * 转换方法
   */
  transform(doc: any): string {
    return this.visit(doc);
  }
}

/**
 * 使用Markdown转换器示例
 */
async function useMarkdownTransformer(): Promise<void> {
  try {
    // 读取示例DPML文件
    const filePath = path.resolve(__dirname, 'sample-dpml.xml');
    const dpmlContent = await fs.readFile(filePath, 'utf-8');

    console.log('已加载DPML文件:', filePath);

    // 1. 解析DPML文本
    console.log('\n解析DPML文档...');
    const parseResult = await parse(dpmlContent);

    if (!parseResult.ast) {
      console.log('解析失败，无法继续');

      return;
    }

    // 2. 处理AST
    console.log('处理DPML文档...');
    const processedDoc = await process(parseResult.ast);

    // 3. 使用转换器
    console.log('转换为Markdown格式...');
    const transformer = new MarkdownTransformer();
    const markdown = transformer.transform(processedDoc);

    console.log('\n=== 转换后的Markdown ===\n');
    console.log(markdown);

    // 保存到文件
    const outputPath = path.resolve(__dirname, 'output.md');

    await fs.writeFile(outputPath, markdown);
    console.log(`\nMarkdown已保存到: ${outputPath}`);
  } catch (error: any) {
    console.error('转换错误:', error.message);
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  useMarkdownTransformer().catch(error => {
    console.error('程序执行错误:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
export { MarkdownTransformer, useMarkdownTransformer };
