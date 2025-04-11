/**
 * @dpml/prompt 高级处理示例
 * 
 * 本示例演示了@dpml/prompt包的高级处理功能，包括：
 * 1. 使用processPrompt和transformPrompt分步处理
 * 2. 在处理流程中修改中间结构
 * 3. 实现自定义处理和转换逻辑
 */

const { processPrompt, transformPrompt } = require('@dpml/prompt');

// 基本DPML示例
const advancedDpml = `
<prompt>
  <role>数据分析师</role>
  <context>
    帮助用户分析和可视化数据
    提供数据洞察和建议
  </context>
  <thinking>
    理解数据的特征和结构
    分析数据中的模式和趋势
    提取有价值的洞察
  </thinking>
  <protocol>
    提供清晰的解释
    始终包含代码示例
    确保回答易于理解
  </protocol>
</prompt>
`;

// 示例1: 分步处理和转换
async function stepByStepProcessingExample() {
  try {
    console.log('示例1: 分步处理和转换');
    console.log('-----------------------');
    
    // 第一步：处理DPML
    const processed = await processPrompt(advancedDpml);
    
    // 查看处理后的结构
    console.log('处理后的结构:');
    console.log(JSON.stringify(processed, null, 2));
    console.log('\n');
    
    // 第二步：转换为文本
    const promptText = transformPrompt(processed);
    console.log('转换后的文本:');
    console.log(promptText);
    console.log('\n');
  } catch (err) {
    console.error('处理失败:', err.message);
  }
}

// 示例2: 中间修改处理结果
async function modifiedProcessingExample() {
  try {
    console.log('示例2: 修改处理结果');
    console.log('-------------------');
    
    // 处理DPML
    const processed = await processPrompt(advancedDpml);
    
    // 修改处理结果
    console.log('原始角色内容:', processed.tags.role.content);
    
    // 修改角色内容
    processed.tags.role.content = '高级数据分析师';
    
    // 添加新的元数据
    processed.metadata.generatedAt = new Date().toISOString();
    processed.metadata.version = '1.0.0';
    
    // 添加新的标签
    processed.tags.custom = {
      content: '这是动态添加的自定义内容',
      attributes: { id: 'dynamic-content' }
    };
    
    console.log('修改后的结构:', JSON.stringify({
      metadata: processed.metadata,
      tags: Object.keys(processed.tags)
    }, null, 2));
    
    // 转换修改后的结构
    const promptText = transformPrompt(processed);
    console.log('修改后的文本:');
    console.log(promptText);
    console.log('\n');
  } catch (err) {
    console.error('处理失败:', err.message);
  }
}

// 示例3: 自定义转换逻辑
async function customTransformExample() {
  try {
    console.log('示例3: 自定义转换逻辑');
    console.log('---------------------');
    
    // 处理DPML
    const processed = await processPrompt(advancedDpml);
    
    // 自定义转换逻辑
    function customTransform(processed) {
      let result = '';
      
      // 自定义角色格式
      if (processed.tags.role) {
        result += `🧑‍💼 扮演角色: ${processed.tags.role.content}\n\n`;
      }
      
      // 自定义上下文格式
      if (processed.tags.context) {
        result += `📋 工作内容:\n`;
        const lines = processed.tags.context.content.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            result += `  • ${line.trim()}\n`;
          }
        });
        result += '\n';
      }
      
      // 自定义思考框架格式
      if (processed.tags.thinking) {
        result += `💭 分析方法:\n`;
        const lines = processed.tags.thinking.content.split('\n');
        lines.forEach((line, index) => {
          if (line.trim()) {
            result += `  ${index + 1}. ${line.trim()}\n`;
          }
        });
        result += '\n';
      }
      
      // 自定义协议格式
      if (processed.tags.protocol) {
        result += `📝 回复要求:\n${processed.tags.protocol.content}\n\n`;
      }
      
      // 添加时间戳
      result += `---\n生成时间: ${new Date().toLocaleString()}`;
      
      return result;
    }
    
    // 使用自定义转换
    const customPromptText = customTransform(processed);
    console.log(customPromptText);
    
    // 对比使用标准转换
    console.log('\n标准转换输出:');
    const standardPromptText = transformPrompt(processed);
    console.log(standardPromptText);
    console.log('\n');
  } catch (err) {
    console.error('处理失败:', err.message);
  }
}

// 示例4: 处理选项配置
async function processingOptionsExample() {
  try {
    console.log('示例4: 处理选项配置');
    console.log('-------------------');
    
    // 处理DPML，使用严格模式
    const processed = await processPrompt(advancedDpml, {
      mode: 'strict',
      lang: 'zh-CN'
    });
    
    console.log('使用严格模式和中文设置处理:');
    console.log('语言设置:', processed.metadata.lang);
    console.log('处理模式: strict');
    
    // 使用自定义转换选项
    const promptText = transformPrompt(processed, {
      format: {
        role: {
          title: '⭐ 专业角色',
          wrapper: (content) => `『${content}』`
        }
      },
      addLanguageDirective: true,
      tagOrder: ['context', 'role', 'thinking', 'protocol'] // 自定义标签顺序
    });
    
    console.log('\n自定义转换后的文本:');
    console.log(promptText);
    console.log('\n');
  } catch (err) {
    console.error('处理失败:', err.message);
  }
}

// 运行所有示例
async function runAllExamples() {
  await stepByStepProcessingExample();
  await modifiedProcessingExample();
  await customTransformExample();
  await processingOptionsExample();
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(err => {
    console.error('示例运行失败:', err);
  });
}

module.exports = {
  stepByStepProcessingExample,
  modifiedProcessingExample,
  customTransformExample,
  processingOptionsExample,
  runAllExamples
}; 