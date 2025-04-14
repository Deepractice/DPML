/**
 * 交互式对话代理示例
 * 
 * 这个示例展示了如何创建一个交互式对话代理，支持多轮对话和状态管理
 */

// @ts-ignore - 忽略类型定义错误
import { createAgent } from '../../../packages/agent';
import * as readline from 'readline';

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('创建交互式对话代理...');
    
    // 使用配置对象创建代理
    const agent = await createAgent({
      id: 'interactive-assistant',
      version: '1.0.0',
      stateManagerType: 'memory', // 使用内存状态管理器
      memoryType: 'simple', // 使用对话记忆系统
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo', // 使用更经济的模型
        apiType: 'openai',
        systemPrompt: `你是一个友好的对话助手，擅长进行多轮对话。
你应该记住用户之前说过的内容，并在回复中体现出对话的连贯性。
尽量使用中文回答问题，除非特别要求使用其他语言。`,
        maxResponseTokens: 800, // 限制响应长度
        temperature: 0.7, // 设置温度参数
        defaultTimeout: 30000 // 设置超时时间
      }
    });
    
    console.log(`创建成功: ${agent.getId()} v${agent.getVersion()}`);
    
    // 创建一个会话ID
    const sessionId = `session-${Date.now()}`;
    console.log(`会话ID: ${sessionId}`);
    
    console.log('\n开始交互式对话 (输入"退出"结束对话):');
    
    let userInput = '';
    
    do {
      // 获取用户输入
      userInput = await prompt('\n你: ');
      
      // 检查是否退出
      if (userInput.toLowerCase() === '退出') {
        break;
      }
      
      try {
        // 发送用户输入给代理
        console.log('\n代理思考中...');
        const result = await agent.execute({
          text: userInput,
          sessionId
        });
        
        // 输出代理响应
        console.log('\n代理: ');
        if (result.success) {
          console.log(result.response?.text);
        } else {
          console.log(`错误: ${result.error}`);
          
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