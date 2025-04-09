import { useMarkdownTransformer } from './markdown-transformer';
import { useJSONTransformer } from './json-transformer';
import { useHTMLTransformer } from './custom-transformer';

/**
 * 运行所有转换器示例
 */
async function runAllTransformers(): Promise<void> {
  console.log('=== DPML转换器示例 ===\n');
  
  console.log('1. 运行Markdown转换器示例');
  await useMarkdownTransformer();
  
  console.log('\n2. 运行JSON转换器示例');
  await useJSONTransformer();
  
  console.log('\n3. 运行HTML转换器示例');
  await useHTMLTransformer();
  
  console.log('\n所有转换器示例已运行完成！');
  console.log('输出文件位于:');
  console.log('- output.md (Markdown格式)');
  console.log('- output.json (JSON格式)');
  console.log('- output.html (HTML格式)');
}

// 运行所有示例
runAllTransformers().catch(error => {
  console.error('程序执行错误:', error);
  process.exit(1);
}); 