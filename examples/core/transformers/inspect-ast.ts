import { parse } from '../../../packages/core';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 检查AST结构
 */
async function inspectAST(): Promise<void> {
  try {
    // 读取示例DPML文件
    const filePath = path.resolve(__dirname, 'sample-dpml.xml');
    const dpmlContent = await fs.readFile(filePath, 'utf-8');
    console.log('已加载DPML文件:', filePath);
    console.log('文件内容长度:', dpmlContent.length, '字节');
    
    // 解析DPML文本
    console.log('\n解析DPML文档...');
    const parseResult = await parse(dpmlContent);
    
    // 检查解析结果
    console.log('\n=== 解析结果 ===\n');
    console.log('解析成功:', !!parseResult.ast);
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.log('\n警告/错误数量:', parseResult.errors.length);
      parseResult.errors.forEach((error: any, index: number) => {
        console.log(`[${index + 1}] ${error.message}`);
      });
    } else {
      console.log('无解析警告或错误');
    }
    
    if (!parseResult.ast) {
      console.log('无AST，解析失败');
      return;
    }
    
    // 检查AST结构
    console.log('\n=== AST结构 ===\n');
    console.log('文档类型:', parseResult.ast.type);
    console.log('子节点数量:', parseResult.ast.children?.length || 0);
    
    if (parseResult.ast.children && parseResult.ast.children.length > 0) {
      console.log('\n=== 根节点信息 ===\n');
      const rootNode = parseResult.ast.children[0];
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
            const content = child.value.trim();
            const preview = content.length > 0 
              ? `"${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
              : '(空白内容)';
            console.log(`- [${index}] content: ${preview}`);
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
inspectAST().catch(error => {
  console.error('程序执行错误:', error);
  process.exit(1);
}); 