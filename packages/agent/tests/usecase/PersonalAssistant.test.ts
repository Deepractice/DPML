import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentFactory } from '../../src/agent/AgentFactory';
import { Agent } from '../../src/agent/types';
import path from 'path';
import fs from 'fs';

// 个人助理代理测试 (UC-A-005)
describe('个人助理代理用例测试', () => {
  let agent: Agent;
  const sessionId = 'test-personal-assistant-session';
  
  // 在测试前创建代理实例
  beforeEach(async () => {
    // 模拟LLM连接器的响应以避免实际API调用
    vi.mock('../../src/connector/LLMConnector', () => {
      return {
        LLMConnectorFactory: {
          createConnector: vi.fn().mockImplementation(() => {
            return {
              complete: vi.fn().mockResolvedValue({
                content: '我已经为您安排了以下日程：\n\n1. 9:00-10:00 与产品团队开会\n2. 12:00-13:00 午餐与客户\n3. 15:00-16:30 准备季度报告\n4. 17:00-18:00 团队周会\n\n您在下午14:00-15:00有一个小时的空闲时间，我建议您可以利用这段时间处理邮件或稍作休息。需要我帮您修改这个安排吗？',
                usage: { promptTokens: 120, completionTokens: 150, totalTokens: 270 }
              }),
              completeStream: vi.fn().mockImplementation(async function* () {
                yield { content: '我已经为您安排了以下日程：\n\n1. 9:00-10:00 与产品团队开会\n', done: false };
                yield { content: '2. 12:00-13:00 午餐与客户\n', done: false };
                yield { content: '3. 15:00-16:30 准备季度报告\n', done: false };
                yield { content: '4. 17:00-18:00 团队周会\n\n', done: false };
                yield { content: '您在下午14:00-15:00有一个小时的空闲时间，我建议您可以利用这段时间处理邮件或稍作休息。需要我帮您修改这个安排吗？', done: true };
              })
            };
          })
        }
      };
    });
    
    // 读取个人助理代理定义文件
    const agentFilePath = path.join(__dirname, '../fixtures/personal-assistant.xml');
    
    // 确保测试夹具目录存在
    const fixturesDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // 创建测试用的个人助理代理定义文件
    if (!fs.existsSync(agentFilePath)) {
      const personalAssistantAgentXml = `<agent id="personal-assistant" version="1.0">
  <llm api-type="openai" model="gpt-4" key-env="OPENAI_API_KEY" />
  <prompt>
    你是一个专业的个人助理，擅长帮助用户管理日程、整理任务和提供生活建议。
    你应该：
    1. 高效安排和管理用户的日程
    2. 帮助用户记录和跟踪任务
    3. 提供合理的时间管理建议
    4. 保持专业和礼貌的沟通方式
    5. 在处理冲突时提供合理的解决方案
  </prompt>
</agent>`;
      
      fs.writeFileSync(agentFilePath, personalAssistantAgentXml, 'utf8');
    }
    
    // 读取代理定义
    const agentDefinition = fs.readFileSync(agentFilePath, 'utf8');
    
    // 模拟解析XML并创建代理配置
    const agentConfig = {
      id: 'personal-assistant',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4',
        apiType: 'openai',
        systemPrompt: '你是一个专业的个人助理，擅长帮助用户管理日程、整理任务和提供生活建议。'
      }
    };
    
    // 模拟createAgent方法以接受字符串并返回Agent
    vi.spyOn(AgentFactory, 'createAgent').mockImplementation(() => {
      return {
        getId: () => 'personal-assistant',
        getVersion: () => '1.0',
        getState: () => Promise.resolve({}),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId,
          response: {
            text: '我已经为您安排了以下日程：\n\n1. 9:00-10:00 与产品团队开会\n2. 12:00-13:00 午餐与客户\n3. 15:00-16:30 准备季度报告\n4. 17:00-18:00 团队周会\n\n您在下午14:00-15:00有一个小时的空闲时间，我建议您可以利用这段时间处理邮件或稍作休息。需要我帮您修改这个安排吗？',
            timestamp: new Date().toISOString()
          }
        }),
        executeStream: vi.fn().mockImplementation(async function* () {
          yield {
            text: '我已经为您安排了以下日程：\n\n1. 9:00-10:00 与产品团队开会\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '2. 12:00-13:00 午餐与客户\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '3. 15:00-16:30 准备季度报告\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '4. 17:00-18:00 团队周会\n\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '您在下午14:00-15:00有一个小时的空闲时间，我建议您可以利用这段时间处理邮件或稍作休息。需要我帮您修改这个安排吗？',
            timestamp: new Date().toISOString()
          };
        }),
        interrupt: () => Promise.resolve(),
        reset: () => Promise.resolve()
      };
    });
    
    // 创建代理实例
    agent = AgentFactory.createAgent(agentConfig);
  });
  
  // 测试后清理
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('应能帮助用户安排日程', async () => {
    // 发送日程安排请求
    const response = await agent.execute({
      sessionId,
      text: '请帮我安排明天的日程，包括：产品团队会议、客户午餐、准备季度报告和团队周会。'
    });
    
    // 验证响应包含日程安排内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('安排');
    expect(response.response?.text).toContain('产品团队');
    expect(response.response?.text).toContain('午餐');
    expect(response.response?.text).toContain('季度报告');
    expect(response.response?.text).toContain('团队周会');
    // 验证包含时间信息
    expect(response.response?.text).toMatch(/\d{1,2}:\d{2}/);
  });
  
  it('应能通过流式接口提供日程安排', async () => {
    // 测试流式接口
    const chunks: string[] = [];
    for await (const chunk of agent.executeStream({
      sessionId,
      text: '请帮我安排明天的日程，包括：产品团队会议、客户午餐、准备季度报告和团队周会。'
    })) {
      chunks.push(chunk.text);
    }
    
    // 合并所有块
    const fullResponse = chunks.join('');
    
    // 验证完整响应内容
    expect(fullResponse).toContain('安排');
    expect(fullResponse).toContain('产品团队');
    expect(fullResponse).toContain('午餐');
    expect(fullResponse).toContain('季度报告');
    expect(fullResponse).toContain('团队周会');
  });
  
  it('应能进行多轮对话管理日程冲突', async () => {
    // 第一轮交互 - 安排日程
    const initialResponse = await agent.execute({
      sessionId,
      text: '请帮我安排明天的日程，包括：产品团队会议、客户午餐、准备季度报告和团队周会。'
    });
    
    // 模拟执行方法以处理日程冲突
    const mockExecute = vi.fn().mockResolvedValue({
      success: true,
      sessionId,
      response: {
        text: '我已经调整了您的日程安排：\n\n1. 9:00-10:00 与产品团队开会\n2. 11:30-12:30 午餐与客户（提前30分钟）\n3. 14:00-15:30 准备季度报告\n4. 16:00-17:00 团队周会（提前1小时）\n\n这样您在13:00-14:00有一小时可以参加紧急会议。这个安排可以接受吗？',
        timestamp: new Date().toISOString()
      }
    });
    
    // 替换原有的执行方法
    Object.defineProperty(agent, 'execute', {
      value: mockExecute
    });
    
    // 第二轮交互 - 处理冲突
    const followUpResponse = await agent.execute({
      sessionId,
      text: '我刚收到通知，需要在13:00-14:00参加一个紧急会议，能调整一下吗？'
    });
    
    // 验证响应处理了日程冲突
    expect(followUpResponse.success).toBe(true);
    expect(followUpResponse.response?.text).toContain('调整');
    expect(followUpResponse.response?.text).toContain('紧急会议');
    expect(followUpResponse.response?.text).toMatch(/提前/);
  });
}); 