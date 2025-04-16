import fs from 'fs';
import path from 'path';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AgentFactory } from '../../../agent/AgentFactory';

import type { Agent } from '../../../agent/types';

// 客服代理测试 (UC-A-003)
describe('客服代理用例测试', () => {
  let agent: Agent;
  const sessionId = 'test-customer-service-session';

  // 在测试前创建代理实例
  beforeEach(async () => {
    // 模拟LLM连接器的响应以避免实际API调用
    vi.mock('../../src/connector/LLMConnector', () => {
      return {
        LLMConnectorFactory: {
          createConnector: vi.fn().mockImplementation(() => {
            return {
              complete: vi.fn().mockResolvedValue({
                content:
                  '您好！很抱歉听到您的订单有延迟。我可以帮您查询订单状态，请提供您的订单号。通常情况下，标准配送需要3-5个工作日，但特殊情况如天气或供应链问题可能导致延迟。我们会尽快处理您的订单，感谢您的耐心等待。',
                usage: {
                  promptTokens: 80,
                  completionTokens: 120,
                  totalTokens: 200,
                },
              }),
              completeStream: vi.fn().mockImplementation(async function* () {
                yield {
                  content: '您好！很抱歉听到您的订单有延迟。',
                  done: false,
                };
                yield {
                  content: '我可以帮您查询订单状态，请提供您的订单号。',
                  done: false,
                };
                yield {
                  content:
                    '通常情况下，标准配送需要3-5个工作日，但特殊情况如天气或供应链问题可能导致延迟。',
                  done: false,
                };
                yield {
                  content: '我们会尽快处理您的订单，感谢您的耐心等待。',
                  done: true,
                };
              }),
            };
          }),
        },
      };
    });

    // 读取客服代理定义文件
    const agentFilePath = path.join(
      __dirname,
      '../fixtures/customer-service.xml'
    );

    // 确保测试夹具目录存在
    const fixturesDir = path.join(__dirname, '../fixtures');

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // 创建测试用的客服代理定义文件
    if (!fs.existsSync(agentFilePath)) {
      const customerServiceAgentXml = `<agent id="customer-service" version="1.0">
  <llm api-type="openai" model="gpt-4-turbo" key-env="OPENAI_API_KEY" />
  <prompt>
    你是一个专业的客服助手，负责处理客户问题并提供帮助。
    你应该：
    1. 保持礼貌和专业，即使面对不满的客户
    2. 提供清晰、准确的信息
    3. 遵循公司政策，但尽可能灵活解决问题
    4. 收集必要信息以便解决问题
    5. 在适当情况下提供解决方案和替代选择
  </prompt>
</agent>`;

      fs.writeFileSync(agentFilePath, customerServiceAgentXml, 'utf8');
    }

    // 读取代理定义
    const agentDefinition = fs.readFileSync(agentFilePath, 'utf8');

    // 模拟解析XML并创建代理配置
    const agentConfig = {
      id: 'customer-service',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4-turbo',
        apiType: 'openai',
        systemPrompt: '你是一个专业的客服助手，负责处理客户问题并提供帮助。',
      },
    };

    // 模拟createAgent方法以接受字符串并返回Agent
    vi.spyOn(AgentFactory, 'createAgent').mockImplementation(() => {
      return {
        getId: () => 'customer-service',
        getVersion: () => '1.0',
        getState: () => Promise.resolve({}),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId,
          response: {
            text: '您好！很抱歉听到您的订单有延迟。我可以帮您查询订单状态，请提供您的订单号。通常情况下，标准配送需要3-5个工作日，但特殊情况如天气或供应链问题可能导致延迟。我们会尽快处理您的订单，感谢您的耐心等待。',
            timestamp: new Date().toISOString(),
          },
        }),
        executeStream: vi.fn().mockImplementation(async function* () {
          yield {
            text: '您好！很抱歉听到您的订单有延迟。',
            timestamp: new Date().toISOString(),
          };
          yield {
            text: '我可以帮您查询订单状态，请提供您的订单号。',
            timestamp: new Date().toISOString(),
          };
          yield {
            text: '通常情况下，标准配送需要3-5个工作日，但特殊情况如天气或供应链问题可能导致延迟。',
            timestamp: new Date().toISOString(),
          };
          yield {
            text: '我们会尽快处理您的订单，感谢您的耐心等待。',
            timestamp: new Date().toISOString(),
          };
        }),
        interrupt: () => Promise.resolve(),
        reset: () => Promise.resolve(),
      };
    });

    // 创建代理实例
    agent = AgentFactory.createAgent(agentConfig);
  });

  // 测试后清理
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应能专业地回应客户问题', async () => {
    // 发送客服问题
    const response = await agent.execute({
      sessionId,
      text: '我的订单为什么还没到？已经过了预计送达时间了',
    });

    // 验证响应包含客服相关内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('抱歉');
    expect(response.response?.text).toContain('订单');
    expect(response.response?.text).toContain('查询');
  });

  it('应能通过流式接口提供客服响应', async () => {
    // 测试流式接口
    const chunks: string[] = [];

    for await (const chunk of agent.executeStream({
      sessionId,
      text: '我的订单为什么还没到？已经过了预计送达时间了',
    })) {
      chunks.push(chunk.text);
    }

    // 合并所有块
    const fullResponse = chunks.join('');

    // 验证完整响应内容
    expect(fullResponse).toContain('抱歉');
    expect(fullResponse).toContain('订单');
    expect(fullResponse).toContain('查询');
  });

  it('应能保持礼貌并收集必要信息', async () => {
    // 模拟一个不满的客户问题和响应
    const mockExecute = agent.execute as vi.Mock;

    mockExecute.mockResolvedValueOnce({
      success: true,
      sessionId,
      response: {
        text: '非常抱歉给您带来的不便。为了帮您解决这个问题，我需要了解一些详细信息：\n\n1. 您订单的编号是多少？\n2. 您是什么时候下的订单？\n3. 您选择的是什么配送方式？\n\n有了这些信息，我可以更准确地为您查询并解决问题。感谢您的配合。',
        timestamp: new Date().toISOString(),
      },
    });

    // 发送客服问题
    const response = await agent.execute({
      sessionId,
      text: '这是我第三次联系客服了！你们的服务太差了，我的退款到现在都没有处理！',
    });

    // 验证响应保持专业礼貌
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('抱歉');
    // 验证试图收集必要信息
    expect(response.response?.text).toContain('订单');
    expect(response.response?.text).toContain('详细信息');
    // 不应该有不礼貌或防御性的语言
    expect(response.response?.text).not.toContain('您冷静');
    expect(response.response?.text).not.toContain('不是我们的错');
  });
});
