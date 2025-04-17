import * as fs from 'fs/promises';
import * as path from 'path';

import { parse, process } from '../../../packages/corebak';

/**
 * 检查处理后文档结构
 */
async function inspectDocument(): Promise<void> {
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

    // 3. 检查文档结构
    console.log('\n=== 处理后的文档结构 ===\n');
    console.log('文档类型:', processedDoc.type);
    console.log('子节点数量:', processedDoc.children?.length || 0);

    if (processedDoc.children && processedDoc.children.length > 0) {
      console.log('\n=== 根节点信息 ===\n');
      const rootNode = processedDoc.children[0];

      console.log('根节点类型:', rootNode.type);
      console.log('根节点标签名:', (rootNode as any).tagName || '无');
      console.log('根节点子节点数量:', (rootNode as any).children?.length || 0);

      // 打印根节点的属性
      if ((rootNode as any).attributes) {
        console.log('\n根节点属性:');
        Object.entries((rootNode as any).attributes).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      }

      // 打印根节点的直接子节点
      if ((rootNode as any).children && (rootNode as any).children.length > 0) {
        console.log('\n根节点子元素:');
        (rootNode as any).children.forEach((child: any, index: number) => {
          if (child.type === 'element') {
            console.log(`- [${index}] ${child.tagName} (type: ${child.type})`);
          } else if (child.type === 'content') {
            console.log(
              `- [${index}] content: "${child.value.substring(0, 30)}${child.value.length > 30 ? '...' : ''}"`
            );
          } else {
            console.log(`- [${index}] ${child.type}`);
          }
        });
      }
    }
  } catch (error: any) {
    console.error('检查错误:', error.message);
  }
}

// 运行检查
inspectDocument().catch(error => {
  console.error('程序执行错误:', error);
  process.exit(1);
});
