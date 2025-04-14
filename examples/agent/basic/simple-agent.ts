/**
 * 基础代理示例
 * 
 * 这个示例展示了如何从DPML文件创建代理和使用代理
 */

import path from 'path';
// @ts-ignore - 忽略类型定义错误
import { AgentFactory } from '../../../packages/agent';

async function main() {
  try {
    console.log('创建简单助手代理...');
    
    // 从DPML文件创建代理
    const dpmlFilePath = path.join(__dirname, 'assistant.dpml');
    const agent = await AgentFactory.createAgentFromFile(dpmlFilePath);
    
    console.log(`创建成功: ${agent.getId()} v${agent.getVersion()}`);
    
    // 创建一个会话ID
    const sessionId = `session-${Date.now()}`;
    
    // 发送一个问题给代理
    console.log('\n发送问题给代理...');
    try {
      const result = await agent.execute({
        text: '你是谁？今天长沙的天气怎么样？',
        sessionId
      });
      
      // 输出代理响应
      console.log('\n代理响应:');
      if (result.success) {
        console.log(result.response?.text);
      } else {
        console.log(`错误: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`\n执行错误: ${error.message}`);
    }
    
    // 无论第一个请求是否成功，都确保重置会话状态
    console.log('\n重置会话状态...');
    await agent.reset(sessionId);
    
    // 等待一小段时间确保状态完全重置
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 发送第二个问题，测试上下文保持
    console.log('\n发送后续问题...');
    try {
      const followUpResult = await agent.execute({
        text: '你能介绍一下你自己吗？',
        sessionId
      });
      
      // 输出后续响应
      console.log('\n代理响应:');
      if (followUpResult.success) {
        console.log(followUpResult.response?.text);
      } else {
        console.log(`错误: ${followUpResult.error}`);
      }
    } catch (error: any) {
      console.log(`\n执行错误: ${error.message}`);
    }
    
  } catch (error: any) {
    console.error('错误:', error);
  }
}

// 运行示例
main().catch(console.error); 