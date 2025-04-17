import * as fs from 'fs/promises';
import * as path from 'path';

import { parse, process } from '../../../packages/corebak';

import type { Element, Content, Warning, Node } from '../../../packages/corebak';

// 解析文件
async function parseFile(): Promise<void> {
  try {
    // 读取simple-dpml.xml文件
    const filePath = path.resolve(__dirname, 'simple-dpml.xml');
    const dpmlContent = await fs.readFile(filePath, 'utf-8');

    console.log('已加载DPML文件:', filePath);

    // 解析DPML内容
    console.log('\n=== 基本解析 ===');
    const result = await parse(dpmlContent);

    console.log('解析成功！');

    // 输出AST结构摘要
    const ast = result.ast;

    console.log('\nAST结构摘要:');
    console.log(`- 文档类型: ${ast.type}`);
    console.log(`- 根元素标签: ${(ast.children[0] as Element).tagName}`);
    console.log(`- 根元素ID: ${(ast.children[0] as Element).attributes.id}`);
    console.log(
      `- 子元素数量: ${(ast.children[0] as Element).children.length}`
    );

    // 检查警告
    if (result.warnings.length > 0) {
      console.log('\n解析警告:');
      result.warnings.forEach((warning: Warning) => {
        console.log(`- ${warning.message}`);
      });
    }

    // 使用选项进行处理
    console.log('\n=== 处理AST ===');
    const processedDoc = await process(ast);

    console.log('处理成功！');

    // 输出完整AST (注释掉以避免过多输出)
    // console.log('\n完整AST结构:');
    // console.log(JSON.stringify(ast, null, 2));

    // 输出详细信息
    console.log('\n详细内容:');
    const promptElement = ast.children[0] as Element;

    // 显示role信息
    const roleElement = promptElement.children.find(
      (child: Node) =>
        child.type === 'element' && (child as Element).tagName === 'role'
    ) as Element | undefined;

    if (roleElement) {
      console.log(`\n角色: ${roleElement.attributes.name}`);
      const roleContent = roleElement.children
        .filter((child: Node) => child.type === 'content')
        .map((child: Node) => (child as Content).value.trim())
        .join(' ');

      console.log(`描述: ${roleContent}`);
    }

    // 显示context信息
    const contextElement = promptElement.children.find(
      (child: Node) =>
        child.type === 'element' && (child as Element).tagName === 'context'
    ) as Element | undefined;

    if (contextElement) {
      console.log('\n上下文:');
      const contextContent = contextElement.children
        .filter((child: Node) => child.type === 'content')
        .map((child: Node) => (child as Content).value.trim())
        .join(' ');

      console.log(contextContent);
    }

    // 显示代码信息
    const thinkingElement = promptElement.children.find(
      (child: Node) =>
        child.type === 'element' && (child as Element).tagName === 'thinking'
    ) as Element | undefined;

    if (thinkingElement) {
      console.log('\n思考过程:');
      const thinkingContent = thinkingElement.children
        .filter((child: Node) => child.type === 'content')
        .map((child: Node) => (child as Content).value.trim())
        .join(' ');

      console.log(thinkingContent);

      // 提取代码
      const codeElement = thinkingElement.children.find(
        (child: Node) =>
          child.type === 'element' && (child as Element).tagName === 'code'
      ) as Element | undefined;

      if (codeElement) {
        console.log(`\n代码 (${codeElement.attributes.language}):`);
        const codeContent = codeElement.children
          .filter((child: Node) => child.type === 'content')
          .map((child: Node) => (child as Content).value)
          .join('');

        console.log(codeContent);
      }
    }
  } catch (error) {
    console.error('解析错误:', error);
  }
}

// 运行解析
parseFile();
