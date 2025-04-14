/**
 * 基础代理示例
 * 
 * 这个示例展示了如何从DPML文件创建代理和使用代理
 */

import path from 'path';
import { AgentFactory } from '@dpml/agent';

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
    const result = await agent.execute({
      text: '你能告诉我关于DPML的信息吗？',
      sessionId
    });
    
    // 输出代理响应
    console.log('\n代理响应:');
    console.log(result.response?.text);
    
    // 发送第二个问题，测试上下文保持
    console.log('\n发送后续问题...');
    const followUpResult = await agent.execute({
      text: '它有哪些主要组件？',
      sessionId
    });
    
    // 输出后续响应
    console.log('\n代理响应:');
    console.log(followUpResult.response?.text);
    
  } catch (error) {
    console.error('错误:', error);
  }
}

// 运行示例
main().catch(console.error); 