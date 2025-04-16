/**
 * 流式响应代理示例
 *
 * 这个示例展示了如何创建一个支持流式输出的对话代理
 */

// @ts-ignore - 忽略类型定义错误
import * as readline from 'readline';

import { createAgent } from '../../../packages/agent';
// @ts-ignore - 忽略类型定义错误
import { EventType } from '../../../packages/agent/src/events/EventTypes';

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 提示用户输入
function prompt(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('创建流式响应代理...');

    // 使用配置对象创建代理
    const agent = await createAgent({
      id: 'stream-assistant',
      version: '1.0.0',
      stateManagerType: 'memory', // 使用内存状态管理器
      memoryType: 'simple', // 使用简单记忆系统
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo', // 使用更经济的模型
        apiType: 'openai',
        systemPrompt: `你是一个专业的编程助手，擅长用中文解答编程问题。
在回答问题时，你应该提供清晰的解释和代码示例。
如果需要编写代码，请确保代码正确且易于理解。`,
        maxResponseTokens: 1000, // 增加响应长度限制以支持代码示例
        temperature: 0.5, // 降低温度以获得更确定性的回答
        defaultTimeout: 45000, // 增加超时时间
      },
    });

    console.log(`创建成功: ${agent.getId()} v${agent.getVersion()}`);

    // 创建一个会话ID
    const sessionId = `stream-session-${Date.now()}`;

    console.log(`会话ID: ${sessionId}`);

    // 监听流式事件
    agent.on(EventType.LLM_RESPONSE_CHUNK, (data: any) => {
      process.stdout.write(data.text || '');
    });

    agent.on(EventType.LLM_ERROR, (error: any) => {
      console.error('\n\n流式输出错误:', error);
    });

    agent.on(EventType.LLM_REQUEST_COMPLETED, () => {
      console.log('\n\n--- 响应结束 ---');
    });

    console.log('\n开始流式对话 (输入"退出"结束对话):');

    let userInput = '';

    do {
      // 获取用户输入
      userInput = await prompt('\n你: ');

      // 检查是否退出
      if (userInput.toLowerCase() === '退出') {
        break;
      }

      try {
        // 发送用户输入给代理，使用流式模式
        console.log('\n代理: ');
        const result = await agent.executeStream({
          text: userInput,
          sessionId,
        });

        // 检查结果
        if (!result.success) {
          console.log(`\n错误: ${result.error}`);

          // 如果出现状态转换错误，尝试重置会话
          if (result.error?.includes('Invalid state transition')) {
            console.log('\n检测到状态转换错误，正在重置会话...');
            await agent.reset(sessionId);
            console.log('会话已重置，请重试');
          }
        }
      } catch (error) {
        console.error('执行错误:', error);

        // 尝试重置会话
        try {
          console.log('\n尝试重置会话状态...');
          await agent.reset(sessionId);
          console.log('会话已重置，请重试');
        } catch (resetError) {
          console.error(`重置会话失败: ${resetError}`);
        }
      }
    } while (userInput.toLowerCase() !== '退出');

    // 关闭命令行界面
    rl.close();
    console.log('\n对话已结束');
  } catch (error) {
    console.error('错误:', error);
    rl.close();
  }
}

// 运行示例
main().catch(console.error);
