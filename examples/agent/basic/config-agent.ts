/**
 * 配置对象代理示例
 *
 * 这个示例展示了如何使用配置对象直接创建代理
 */

// @ts-ignore - 忽略类型定义错误
import { createAgent } from '../../../packages/agent';

async function main() {
  try {
    console.log('创建配置对象代理...');

    // 使用配置对象创建代理
    const agent = await createAgent({
      id: 'config-assistant',
      version: '1.0.0',
      stateManagerType: 'memory', // 使用内存状态管理器
      memoryType: 'simple', // 使用简单记忆系统
      executionConfig: {
        defaultModel: 'gpt-3.5-turbo', // 使用更经济的模型
        apiType: 'openai',
        systemPrompt: `你是一个编程助手，专注于帮助用户解决编程问题。
在回答问题时，你应该提供简洁清晰的代码示例和解释。
尽量使用中文回答问题，除非特别要求使用其他语言。`,
        maxResponseTokens: 800, // 限制响应长度
        temperature: 0.7, // 设置温度参数
        defaultTimeout: 30000, // 设置超时时间
      },
    });

    console.log(`创建成功: ${agent.getId()} v${agent.getVersion()}`);

    // 创建一个会话ID
    const sessionId = `session-${Date.now()}`;

    // 发送一个编程问题
    console.log('\n发送编程问题给代理...');
    const result = await agent.execute({
      text: '请用TypeScript编写一个简单的Express服务器，包含GET和POST路由',
      sessionId,
    });

    // 输出代理响应
    console.log('\n代理响应:');
    if (result.success) {
      console.log(result.response?.text);
    } else {
      console.log(`错误: ${result.error}`);

      // 尝试重置会话
      try {
        console.log('\n重置会话状态...');
        await agent.reset(sessionId);
      } catch (resetError) {
        console.error(`重置会话失败: ${resetError}`);
      }
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

// 运行示例
main().catch(console.error);
