/**
 * @dpml/prompt 实用案例示例
 *
 * 本示例演示了@dpml/prompt包在实际应用场景中的使用方法，包括：
 * 1. 创建可重用的提示模板
 * 2. 在Web应用中使用DPML
 * 3. 批量处理多个DPML文件
 * 4. 实现基于用户输入的动态提示生成
 */

const {
  generatePrompt,
  processPrompt,
  transformPrompt,
} = require('@dpml/prompt');

const fs = require('fs').promises;
const path = require('path');

// 示例1: 创建可重用的提示模板
async function reusableTemplateExample() {
  try {
    console.log('示例1: 创建可重用的提示模板');
    console.log('---------------------------');

    // 基础模板
    const baseTemplate = `
    <prompt>
      <role>专业${'{role}'}</role>
      <context>${'{context}'}</context>
      <thinking>
        理解用户的需求和问题
        应用${'{domain}'}专业知识
        ${'{additional_thinking}'}
      </thinking>
      <protocol>${'{protocol}'}</protocol>
    </prompt>
    `;

    // 创建具体的提示词函数
    async function createPromptFromTemplate(params) {
      // 替换模板中的变量
      let filledTemplate = baseTemplate;

      for (const [key, value] of Object.entries(params)) {
        filledTemplate = filledTemplate.replace(
          new RegExp(`\\{${key}\\}`, 'g'),
          value
        );
      }

      // 生成最终提示
      return await generatePrompt(filledTemplate);
    }

    // 创建编程助手提示
    const programmerPrompt = await createPromptFromTemplate({
      role: '编程助手',
      context: '帮助用户解决编程问题和代码错误',
      domain: '编程',
      additional_thinking: '考虑代码效率和最佳实践\n确保解决方案易于理解和维护',
      protocol: '提供详细的代码示例\n解释代码的工作原理',
    });

    console.log('编程助手提示:');
    console.log(programmerPrompt);
    console.log('\n');

    // 创建营销文案提示
    const copywriterPrompt = await createPromptFromTemplate({
      role: '营销文案撰写者',
      context: '帮助用户创建有吸引力的营销内容',
      domain: '营销和心理学',
      additional_thinking: '考虑目标受众和市场定位\n关注情感连接和品牌一致性',
      protocol: '提供多种文案变体\n重点突出独特卖点',
    });

    console.log('营销文案提示:');
    console.log(copywriterPrompt);
    console.log('\n');
  } catch (err) {
    console.error('模板处理失败:', err.message);
  }
}

// 示例2: 在Web应用中使用DPML
async function webApplicationExample() {
  try {
    console.log('示例2: 在Web应用中使用DPML');
    console.log('-------------------------');

    // 模拟Web应用的请求处理函数
    async function handlePromptRequest(req) {
      // 从请求中获取用户输入
      const {
        userQuestion,
        selectedRole,
        languagePreference,
        formatPreference,
      } = req;

      // 构建DPML
      const dpml = `
      <prompt lang="${languagePreference}">
        <role>${selectedRole}</role>
        <context>
          回答用户的问题: ${userQuestion}
          使用专业知识提供准确信息
        </context>
        <protocol>
          使用清晰的语言
          结构化回答以便于理解
        </protocol>
      </prompt>
      `;

      // 确定格式模板
      const formatTemplates = {
        markdown: {
          role: { title: '## 角色' },
          context: { title: '## 上下文', prefix: '> ' },
          protocol: { title: '## 回答要求', prefix: '- ' },
        },
        plain: {
          role: { title: '角色:' },
          context: { title: '上下文:' },
          protocol: { title: '回答要求:' },
        },
        formatted: {
          role: { title: '👤 我是' },
          context: { title: '📝 任务', prefix: '• ' },
          protocol: { title: '🔍 回答准则', prefix: '✓ ' },
        },
      };

      // 生成提示
      const promptText = await generatePrompt(dpml, {
        formatTemplates:
          formatTemplates[formatPreference] || formatTemplates.formatted,
        addLanguageDirective: true,
      });

      // 构建响应
      return {
        status: 'success',
        prompt: promptText,
        metadata: {
          role: selectedRole,
          language: languagePreference,
          format: formatPreference,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // 模拟请求
    const mockRequest1 = {
      userQuestion: '如何优化React应用性能?',
      selectedRole: 'React专家',
      languagePreference: 'zh-CN',
      formatPreference: 'markdown',
    };

    const mockRequest2 = {
      userQuestion: 'How to write effective marketing emails?',
      selectedRole: 'Marketing Specialist',
      languagePreference: 'en',
      formatPreference: 'formatted',
    };

    // 处理请求
    const response1 = await handlePromptRequest(mockRequest1);

    console.log('Web应用响应1:');
    console.log(JSON.stringify(response1.metadata, null, 2));
    console.log(response1.prompt);
    console.log('\n');

    const response2 = await handlePromptRequest(mockRequest2);

    console.log('Web应用响应2:');
    console.log(JSON.stringify(response2.metadata, null, 2));
    console.log(response2.prompt);
    console.log('\n');
  } catch (err) {
    console.error('Web应用示例失败:', err.message);
  }
}

// 示例3: 批量处理DPML文件
async function batchProcessingExample() {
  try {
    console.log('示例3: 批量处理DPML文件');
    console.log('----------------------');

    // 批量处理函数
    async function batchProcessDpmlFiles(directory) {
      // 读取目录中的所有文件
      const files = await fs.readdir(directory);
      const dpmlFiles = files.filter(file => file.endsWith('.dpml'));

      console.log(`找到 ${dpmlFiles.length} 个DPML文件`);

      // 处理结果
      const results = [];

      // 处理每个文件
      for (const file of dpmlFiles) {
        const filePath = path.join(directory, file);

        console.log(`处理文件: ${file}`);

        // 读取文件内容
        const content = await fs.readFile(filePath, 'utf-8');

        // 处理DPML
        const processed = await processPrompt(content);

        // 提取角色信息
        const roleName = processed.tags.role?.content || 'Unknown';

        // 转换为提示文本
        const promptText = transformPrompt(processed);

        // 添加到结果
        results.push({
          filename: file,
          role: roleName,
          promptText: promptText.substring(0, 100) + '...', // 截断以简化输出
        });
      }

      return results;
    }

    // 使用示例目录中的DPML文件
    const mockDir = path.join(__dirname, 'mock_dpml_files');
    const batchResults = await batchProcessDpmlFiles(mockDir);

    console.log('批量处理结果:');
    console.log(JSON.stringify(batchResults, null, 2));
    console.log('\n');
  } catch (err) {
    console.error('批量处理示例失败:', err.message);
  }
}

// 示例4: 动态提示生成
async function dynamicPromptExample() {
  try {
    console.log('示例4: 动态提示生成');
    console.log('------------------');

    // 模拟用户输入创建动态提示
    function createDynamicPrompt(userInput) {
      const { topic, expertise, audience, purpose, tone } = userInput;

      return `
      <prompt>
        <role>${expertise}专家</role>
        <context>
          主题: ${topic}
          目标受众: ${audience}
          目的: ${purpose}
        </context>
        <thinking>
          考虑${audience}的知识水平和需求
          确保内容相关且有价值
          保持${tone}的语气
        </thinking>
        <protocol>
          使用清晰、${tone}的语言
          提供具体的例子和建议
          回答应当简洁且有实用价值
        </protocol>
      </prompt>
      `;
    }

    // 测试用户输入
    const userInputs = [
      {
        topic: '减少塑料使用',
        expertise: '环保',
        audience: '普通家庭',
        purpose: '提供实用的减塑建议',
        tone: '友好',
      },
      {
        topic: 'JavaScript性能优化',
        expertise: '前端开发',
        audience: '初级开发者',
        purpose: '提升代码性能',
        tone: '专业',
      },
    ];

    // 处理每个用户输入
    for (const [index, input] of userInputs.entries()) {
      console.log(`动态提示 #${index + 1}:`);
      console.log(`用户输入: ${JSON.stringify(input, null, 2)}`);

      // 创建动态提示
      const dpml = createDynamicPrompt(input);

      // 生成最终提示
      const promptText = await generatePrompt(dpml);

      console.log('生成的提示:');
      console.log(promptText);
      console.log('\n');
    }
  } catch (err) {
    console.error('动态提示示例失败:', err.message);
  }
}

// 运行所有示例
async function runAllExamples() {
  await reusableTemplateExample();
  await webApplicationExample();
  await batchProcessingExample();
  await dynamicPromptExample();
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(err => {
    console.error('示例运行失败:', err);
  });
}

module.exports = {
  reusableTemplateExample,
  webApplicationExample,
  batchProcessingExample,
  dynamicPromptExample,
  runAllExamples,
};
