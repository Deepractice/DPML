/**
 * @dpml/prompt 基本使用示例
 * 
 * 本示例演示了@dpml/prompt包的基本用法，包括：
 * 1. 基本的生成提示功能
 * 2. 使用自定义格式选项
 * 3. 处理错误
 */

const { generatePrompt } = require('@dpml/prompt');

// 基本DPML示例
const basicDpml = `
<prompt>
  <role>JavaScript专家</role>
  <context>
    帮助用户解决JavaScript和Node.js相关问题
    提供最佳实践建议
  </context>
  <thinking>
    理解用户问题的本质
    考虑代码效率和可读性
    考虑最新的JavaScript标准和最佳实践
  </thinking>
</prompt>
`;

// 示例1: 基本使用
async function basicExample() {
  try {
    console.log('示例1: 基本使用');
    console.log('----------------');
    
    const promptText = await generatePrompt(basicDpml);
    console.log(promptText);
    
    console.log('\n');
  } catch (err) {
    console.error('生成失败:', err.message);
  }
}

// 示例2: 使用自定义格式
async function customFormatExample() {
  try {
    console.log('示例2: 使用自定义格式');
    console.log('--------------------');
    
    const promptText = await generatePrompt(basicDpml, {
      formatTemplates: {
        role: {
          title: '👨‍💻 角色',
          wrapper: (content) => `**${content}**`
        },
        context: {
          title: '📝 上下文',
          prefix: '• '
        },
        thinking: {
          title: '🧠 思考框架',
          prefix: '- '
        }
      }
    });
    
    console.log(promptText);
    
    console.log('\n');
  } catch (err) {
    console.error('生成失败:', err.message);
  }
}

// 示例3: 错误处理
async function errorHandlingExample() {
  try {
    console.log('示例3: 错误处理');
    console.log('---------------');
    
    // 包含错误的DPML
    const invalidDpml = `
    <prompt>
      <role>错误示例</role>
      <invalid_tag>这是无效标签</invalid_tag>
    </prompt>
    `;
    
    const promptText = await generatePrompt(invalidDpml, { strictMode: true });
    console.log(promptText);
  } catch (err) {
    console.error('预期的错误:', err.message);
    console.log('错误代码:', err.code);
    console.log('\n');
  }
}

// 示例4: 多语言支持
async function multiLanguageExample() {
  try {
    console.log('示例4: 多语言支持');
    console.log('----------------');
    
    const chineseDpml = `
    <prompt lang="zh-CN">
      <role>中文助手</role>
      <context>帮助用户解决问题并用中文回答</context>
    </prompt>
    `;
    
    const promptText = await generatePrompt(chineseDpml, {
      addLanguageDirective: true // 添加语言指令
    });
    
    console.log(promptText);
    
    console.log('\n');
  } catch (err) {
    console.error('生成失败:', err.message);
  }
}

// 运行所有示例
async function runAllExamples() {
  await basicExample();
  await customFormatExample();
  await errorHandlingExample();
  await multiLanguageExample();
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(err => {
    console.error('示例运行失败:', err);
  });
}

module.exports = {
  basicExample,
  customFormatExample,
  errorHandlingExample,
  multiLanguageExample,
  runAllExamples
}; 