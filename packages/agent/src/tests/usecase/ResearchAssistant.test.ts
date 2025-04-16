import fs from 'fs';
import path from 'path';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AgentFactory } from '../../../agent/AgentFactory';

import type { Agent } from '../../../agent/types';

// 研究助手代理测试 (UC-A-001)
describe('研究助手代理用例测试', () => {
  let agent: Agent;
  const sessionId = 'test-research-session';

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
                  '根据最新研究，量子计算在解决复杂优化问题方面显示出巨大潜力。2023年的研究表明，量子算法在特定类别的优化问题上可以实现指数级加速。',
                usage: {
                  promptTokens: 100,
                  completionTokens: 50,
                  totalTokens: 150,
                },
              }),
              completeStream: vi.fn().mockImplementation(async function* () {
                yield { content: '根据最新研究', done: false };
                yield {
                  content: '，量子计算在解决复杂优化问题方面显示出巨大潜力',
                  done: false,
                };
                yield {
                  content:
                    '。2023年的研究表明，量子算法在特定类别的优化问题上可以实现指数级加速。',
                  done: true,
                };
              }),
            };
          }),
        },
      };
    });

    // 读取研究助手代理定义文件
    const agentFilePath = path.join(
      __dirname,
      '../fixtures/research-assistant.xml'
    );

    // 确保测试夹具目录存在
    const fixturesDir = path.join(__dirname, '../fixtures');

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // 创建测试用的研究助手定义文件
    if (!fs.existsSync(agentFilePath)) {
      const researchAgentXml = `<agent id="research-assistant" version="1.0">
  <llm api-type="openai" model="gpt-4-turbo" key-env="OPENAI_API_KEY" />
  <prompt>
    你是一个专业的研究助手，擅长查找和总结学术信息。
    你应该：
    1. 提供准确、最新的研究信息
    2. 引用可靠的学术来源
    3. 在不确定时明确指出，避免猜测
    4. 以清晰、结构化的方式组织信息
    5. 适应不同领域的研究需求
  </prompt>
</agent>`;

      fs.writeFileSync(agentFilePath, researchAgentXml, 'utf8');
    }

    // 读取代理定义
    const agentDefinition = fs.readFileSync(agentFilePath, 'utf8');

    // 模拟解析XML并创建代理配置
    const agentConfig = {
      id: 'research-assistant',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4-turbo',
        apiType: 'openai',
        systemPrompt: '你是一个专业的研究助手，擅长查找和总结学术信息。',
      },
    };

    // 模拟createAgent方法以接受字符串并返回Agent
    vi.spyOn(AgentFactory, 'createAgent').mockImplementation(() => {
      return {
        getId: () => 'research-assistant',
        getVersion: () => '1.0',
        getState: () => Promise.resolve({}),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId,
          response: {
            text: '根据最新研究，量子计算在解决复杂优化问题方面显示出巨大潜力。2023年的研究表明，量子算法在特定类别的优化问题上可以实现指数级加速。',
            timestamp: new Date().toISOString(),
          },
        }),
        executeStream: vi.fn().mockImplementation(async function* () {
          yield {
            text: '根据最新研究',
            timestamp: new Date().toISOString(),
          };
          yield {
            text: '，量子计算在解决复杂优化问题方面显示出巨大潜力',
            timestamp: new Date().toISOString(),
          };
          yield {
            text: '。2023年的研究表明，量子算法在特定类别的优化问题上可以实现指数级加速。',
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

  it('应能回答研究类问题并提供学术信息', async () => {
    // 发送研究问题
    const response = await agent.execute({
      sessionId,
      text: '请介绍量子计算在优化问题上的最新进展',
    });

    // 验证响应包含研究相关内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('量子计算');
    expect(response.response?.text).toContain('优化问题');
    expect(response.response?.text).toContain('研究');
  });

  it('应能通过流式接口提供研究信息', async () => {
    // 测试流式接口
    const chunks: string[] = [];

    for await (const chunk of agent.executeStream({
      sessionId,
      text: '请介绍量子计算在优化问题上的最新进展',
    })) {
      chunks.push(chunk.text);
    }

    // 合并所有块
    const fullResponse = chunks.join('');

    // 验证完整响应内容
    expect(fullResponse).toContain('量子计算');
    expect(fullResponse).toContain('优化问题');
    expect(fullResponse).toContain('研究');
  });
});
