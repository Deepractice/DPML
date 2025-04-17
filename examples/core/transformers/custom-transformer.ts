import * as fs from 'fs/promises';
import * as path from 'path';

import { parse, process, NodeType } from '../../../packages/corebak';

import type { Element, Content, Node } from '../../../packages/corebak';

/**
 * HTML转换器 - 将DPML文档转换为HTML格式
 */
class HTMLTransformer {
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
    // 添加HTML属性
    const attrs = Object.entries(element.attributes || {})
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    // 处理不同类型的标签
    switch (element.tagName) {
      case 'prompt':
        return `<div class="prompt" ${attrs ? attrs : ''}>${this.processChildren(element)}</div>`;

      case 'metadata':
        return `<div class="metadata" ${attrs ? attrs : ''}>${this.processChildren(element)}</div>`;

      case 'title':
        return `<h2 class="title" ${attrs ? attrs : ''}>${this.processChildren(element)}</h2>`;

      case 'author':
        return `<div class="author" ${attrs ? attrs : ''}>作者: ${this.processChildren(element)}</div>`;

      case 'created':
        return `<div class="created" ${attrs ? attrs : ''}>创建日期: ${this.processChildren(element)}</div>`;

      case 'role':
        const name = element.attributes.name || '未命名';
        const expertise = element.attributes.expertise
          ? `<span class="expertise">(专长: ${element.attributes.expertise})</span>`
          : '';

        return `<div class="role" ${attrs ? attrs : ''}>
          <h3>角色: ${name} ${expertise}</h3>
          <div class="role-content">${this.processChildren(element)}</div>
        </div>`;

      case 'context':
        return `<div class="context" ${attrs ? attrs : ''}>
          <h3>上下文</h3>
          <div class="context-content">${this.processChildren(element)}</div>
        </div>`;

      case 'thinking':
        return `<div class="thinking" ${attrs ? attrs : ''}>
          <h3>思考过程</h3>
          <div class="thinking-content">${this.processChildren(element)}</div>
        </div>`;

      case 'executing':
        return `<div class="executing" ${attrs ? attrs : ''}>
          <h3>执行步骤</h3>
          <div class="executing-content">${this.processChildren(element)}</div>
        </div>`;

      case 'step':
        const stepId = element.attributes.id
          ? `<span class="step-id">[${element.attributes.id}]</span>`
          : '';

        return `<div class="step" ${attrs ? attrs : ''}>
          ${stepId} ${this.processChildren(element)}
        </div>`;

      case 'code':
        const language = element.attributes.language || '';

        return `<pre class="code" data-language="${language}"><code>${this.escapeHTML(this.processChildren(element))}</code></pre>`;

      case 'references':
        return `<div class="references" ${attrs ? attrs : ''}>
          <h3>参考资料</h3>
          <div class="references-content">${this.processChildren(element)}</div>
        </div>`;

      case 'reference':
        const refId = element.attributes.id || '未命名';
        const url = element.attributes.url || '#';

        return `<div class="reference" ${attrs ? attrs : ''}>
          <a href="${url}" target="_blank">${refId}</a>
        </div>`;

      // 处理其他元素 - 创建通用div
      default:
        return `<div class="${element.tagName}" ${attrs ? attrs : ''}>${this.processChildren(element)}</div>`;
    }
  }

  /**
   * 处理文本内容
   */
  visitContent(content: Content): string {
    // 对普通文本内容进行HTML转义
    return this.escapeHTML(content.value);
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
   * 辅助方法：HTML转义
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 转换方法
   */
  transform(doc: any): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DPML转HTML</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .prompt { 
      max-width: 800px; 
      margin: 0 auto;
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .metadata {
      border-bottom: 1px solid #ddd;
      margin-bottom: 20px;
      padding-bottom: 10px;
    }
    h2.title {
      margin-top: 0;
      color: #2c3e50;
    }
    .author, .created {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .role {
      background-color: #eef8ff;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .role h3 {
      margin-top: 0;
      color: #2980b9;
    }
    .expertise {
      font-size: 0.9em;
      color: #7f8c8d;
      font-style: italic;
    }
    .context {
      background-color: #f5f5f5;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .context h3 {
      margin-top: 0;
      color: #27ae60;
    }
    .thinking {
      background-color: #fffbea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .thinking h3 {
      margin-top: 0;
      color: #f39c12;
    }
    .executing {
      background-color: #f0f0f0;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .executing h3 {
      margin-top: 0;
      color: #8e44ad;
    }
    .step {
      margin: 10px 0;
      padding-left: 15px;
      border-left: 3px solid #ddd;
    }
    .step-id {
      font-weight: bold;
      color: #7f8c8d;
    }
    .code {
      background-color: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
    }
    .references {
      border-top: 1px solid #ddd;
      margin-top: 20px;
      padding-top: 15px;
    }
    .references h3 {
      margin-top: 0;
      color: #c0392b;
    }
    .reference {
      margin: 5px 0;
    }
    .reference a {
      color: #3498db;
      text-decoration: none;
    }
    .reference a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${this.visit(doc)}
</body>
</html>`;
  }
}

/**
 * 使用HTML转换器示例
 */
async function useHTMLTransformer(): Promise<void> {
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
    console.log('转换为HTML格式...');
    const transformer = new HTMLTransformer();
    const html = transformer.transform(processedDoc);

    // 保存到文件
    const outputPath = path.resolve(__dirname, 'output.html');

    await fs.writeFile(outputPath, html);
    console.log(`\nHTML已保存到: ${outputPath}`);
    console.log('请在浏览器中打开此文件查看效果');
  } catch (error: any) {
    console.error('转换错误:', error.message);
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  useHTMLTransformer().catch(error => {
    console.error('程序执行错误:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
export { HTMLTransformer, useHTMLTransformer };
