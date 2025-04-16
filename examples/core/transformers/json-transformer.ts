import * as fs from 'fs/promises';
import * as path from 'path';

import { parse, process, NodeType } from '../../../packages/core';

import type { Element, Content, Node } from '../../../packages/core';

/**
 * JSON转换器 - 将DPML文档转换为JSON格式
 */
class JSONTransformer {
  /**
   * 处理document节点
   */
  visitDocument(document: any): any {
    // 文档节点通常只包含一个根元素，我们可以直接处理其子节点
    if (document.children && document.children.length > 0) {
      return this.visit(document.children[0]);
    }

    return null;
  }

  /**
   * 处理元素节点
   */
  visitElement(element: Element): any {
    // 创建结果对象
    const result: any = {
      type: element.tagName,
      attributes: { ...element.attributes },
    };

    // 处理子元素
    const children = element.children
      .map(child => this.visit(child))
      .filter(Boolean);

    // 如果只有文本内容，则直接设置为content字段
    if (children.length === 1 && typeof children[0] === 'string') {
      result.content = children[0];
    }
    // 否则，将子元素添加到children字段
    else if (children.length > 0) {
      result.children = children;
    }

    // 添加元数据（如果有）
    if (element.metadata) {
      result.metadata = { ...element.metadata };
    }

    return result;
  }

  /**
   * 处理文本内容
   */
  visitContent(content: Content): string {
    return content.value.trim();
  }

  /**
   * 处理节点
   */
  visit(node: Node): any {
    if (!node) return null;

    switch (node.type) {
      case NodeType.DOCUMENT:
        return this.visitDocument(node);
      case NodeType.ELEMENT:
        return this.visitElement(node as Element);
      case NodeType.CONTENT:
        return this.visitContent(node as Content);
      default:
        return null;
    }
  }

  /**
   * 转换方法
   */
  transform(doc: any): any {
    return this.visit(doc);
  }
}

/**
 * 使用JSON转换器示例
 */
async function useJSONTransformer(): Promise<void> {
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
    console.log('转换为JSON格式...');
    const transformer = new JSONTransformer();
    const json = transformer.transform(processedDoc);

    console.log('\n=== 转换后的JSON ===\n');
    console.log(JSON.stringify(json, null, 2));

    // 保存到文件
    const outputPath = path.resolve(__dirname, 'output.json');

    await fs.writeFile(outputPath, JSON.stringify(json, null, 2));
    console.log(`\nJSON已保存到: ${outputPath}`);
  } catch (error: any) {
    console.error('转换错误:', error.message);
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  useJSONTransformer().catch(error => {
    console.error('程序执行错误:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
export { JSONTransformer, useJSONTransformer };
