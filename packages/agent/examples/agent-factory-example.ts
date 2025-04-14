/**
 * AgentFactory 使用示例
 * 
 * 本示例展示了如何使用 AgentFactory 创建和管理 Agent 实例
 */
import { AgentFactory } from '../src/agent/AgentFactory';
import { AgentFactoryConfig } from '../src/agent/types';
import path from 'path';

/**
 * 从配置对象创建 Agent
 */
async function createAgentFromConfig() {
  console.log('从配置对象创建 Agent...');
  
  const config: AgentFactoryConfig = {
    id: 'config-agent',
    version: '1.0',
    executionConfig: {
      defaultModel: 'gpt-4',
      apiType: 'openai',
      systemPrompt: '你是一个有帮助的助手，专注于回答用户问题。'
    }
  };
  
  const agent = await AgentFactory.createAgentFromConfig(config);
  console.log(`创建成功: ${agent.getId()} (${agent.getVersion()})`);
  
  return agent;
}

/**
 * 从 DPML 字符串创建 Agent
 */
async function createAgentFromString() {
  console.log('从 DPML 字符串创建 Agent...');
  
  const dpmlString = `
    <agent id="string-agent" version="1.0">
      <llm model="gpt-4" api-type="openai" />
      <prompt>
        你是一个专注于代码分析的助手，擅长解释复杂的代码结构。
      </prompt>
    </agent>
  `;
  
  const agent = await AgentFactory.createAgentFromString(dpmlString);
  console.log(`创建成功: ${agent.getId()} (${agent.getVersion()})`);
  
  return agent;
}

/**
 * 从 DPML 文件创建 Agent
 */
async function createAgentFromFile() {
  console.log('从 DPML 文件创建 Agent...');
  
  // 注意：这里假设存在这个文件，实际使用时需要确保文件存在
  const filePath = path.join(__dirname, 'examples', 'agent-definition.dpml');
  
  try {
    const agent = await AgentFactory.createAgentFromFile(filePath);
    console.log(`创建成功: ${agent.getId()} (${agent.getVersion()})`);
    return agent;
  } catch (error) {
    console.error('文件不存在或格式错误，使用默认 Agent 代替');
    return createDefaultAgent();
  }
}

/**
 * 创建默认 Agent
 */
async function createDefaultAgent() {
  console.log('创建默认 Agent...');
  
  const agent = await AgentFactory.createDefaultAgent({
    id: 'custom-default-agent',
    executionConfig: {
      temperature: 0.8,
      systemPrompt: '你是一个友好的助手，擅长用简单的语言解释复杂的概念。'
    }
  });
  
  console.log(`创建成功: ${agent.getId()} (${agent.getVersion()})`);
  
  return agent;
}

/**
 * 管理 Agent 实例
 */
async function manageAgents() {
  console.log('\n管理 Agent 实例...');
  
  // 列出所有 Agent
  const agents = AgentFactory.listAgents();
  console.log(`当前有 ${agents.length} 个 Agent 实例:`);
  
  agents.forEach(agent => {
    console.log(`- ${agent.getId()} (${agent.getVersion()})`);
  });
  
  // 检查特定 Agent 是否存在
  const hasConfigAgent = AgentFactory.hasAgent('config-agent');
  console.log(`'config-agent' ${hasConfigAgent ? '存在' : '不存在'}`);
  
  // 获取特定 Agent
  const stringAgent = AgentFactory.getAgent('string-agent');
  if (stringAgent) {
    console.log(`获取到 'string-agent': ${stringAgent.getId()}`);
  }
  
  // 移除特定 Agent
  if (agents.length > 0) {
    const firstAgent = agents[0];
    const removed = AgentFactory.removeAgent(firstAgent.getId());
    console.log(`移除 '${firstAgent.getId()}': ${removed ? '成功' : '失败'}`);
    
    // 再次列出所有 Agent
    const remainingAgents = AgentFactory.listAgents();
    console.log(`现在有 ${remainingAgents.length} 个 Agent 实例`);
  }
  
  // 清除所有 Agent
  AgentFactory.clearCache();
  console.log('已清除所有 Agent 缓存');
  console.log(`现在有 ${AgentFactory.listAgents().length} 个 Agent 实例`);
}

/**
 * 使用 Agent 执行任务
 */
async function executeWithAgent(agent: any) {
  console.log('\n使用 Agent 执行任务...');
  
  try {
    const result = await agent.execute({
      text: '什么是人工智能？',
      sessionId: 'example-session'
    });
    
    if (result.success) {
      console.log('Agent 响应:');
      console.log(result.response.text);
    } else {
      console.error('执行失败:', result.error);
    }
  } catch (error) {
    console.error('执行出错:', error);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 创建不同类型的 Agent
    const configAgent = await createAgentFromConfig();
    const stringAgent = await createAgentFromString();
    const defaultAgent = await createDefaultAgent();
    
    // 管理 Agent 实例
    await manageAgents();
    
    // 使用 Agent 执行任务
    // 注意：这需要正确配置环境变量和网络连接
    // 如果只是演示，可以注释掉这一行
    // await executeWithAgent(defaultAgent);
    
    console.log('\n示例完成');
  } catch (error) {
    console.error('示例运行出错:', error);
  }
}

// 运行示例
if (require.main === module) {
  main().catch(console.error);
}
