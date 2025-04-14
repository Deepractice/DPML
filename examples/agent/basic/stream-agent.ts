/**
 * 流式代理示例
 * 
 * 这个示例展示了如何使用代理的流式执行功能
 */

import path from 'path';
import { AgentFactory } from '@dpml/agent';

async function main() {
  try {
    console.log('创建流式助手代理...');
    
    // 从DPML文件创建代理
    const dpmlFilePath = path.join(__dirname, 'assistant.dpml');
    const agent = await AgentFactory.createAgentFromFile(dpmlFilePath);
    
    console.log(`创建成功: ${agent.getId()} v${agent.getVersion()}`);
    
    // 创建一个会话ID
    const sessionId = `session-${Date.now()}`;
    
    // 使用流式API
    console.log('\n发送问题给代理（流式响应）...');
    console.log('\n代理响应:');
    
    // 获取流式响应生成器
    const stream = agent.executeStream({
      text: '请逐步解释如何使用DPML创建一个复杂的代理？',
      sessionId
    });
    
    // 处理流式响应
    let fullResponse = '';
    for await (const chunk of stream) {
      // 打印每个响应块
      process.stdout.write(chunk.text);
      fullResponse += chunk.text;
    }
    
    console.log('\n\n流式响应完成，共接收到以下内容:');
    console.log(`总字符数: ${fullResponse.length}`);
    
  } catch (error) {
    console.error('错误:', error);
  }
}

// 运行示例
main().catch(console.error); 