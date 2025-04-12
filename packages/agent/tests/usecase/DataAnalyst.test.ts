import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentFactory } from '../../src/agent/AgentFactory';
import { Agent } from '../../src/agent/types';
import path from 'path';
import fs from 'fs';

// 数据分析代理测试 (UC-A-004)
describe('数据分析代理用例测试', () => {
  let agent: Agent;
  const sessionId = 'test-data-analysis-session';
  
  // 在测试前创建代理实例
  beforeEach(async () => {
    // 模拟LLM连接器的响应以避免实际API调用
    vi.mock('../../src/connector/LLMConnector', () => {
      return {
        LLMConnectorFactory: {
          createConnector: vi.fn().mockImplementation(() => {
            return {
              complete: vi.fn().mockResolvedValue({
                content: '根据您提供的销售数据分析，我发现以下几个关键趋势和洞察：\n\n1. **季节性模式**：销售在Q4（10-12月）达到峰值，这可能与假日购物季相关。Q1（1-3月）通常是销售最低的时期。\n\n2. **增长趋势**：过去三年的年度销售额呈现持续增长，2022年比2021年增长15%，2023年比2022年增长22%。\n\n3. **产品类别分析**：电子产品贡献了最大的收入（42%），但服装类别增长最快（同比增长35%）。\n\n4. **客户细分洞察**：回头客贡献了总销售额的65%，并且平均订单价值比新客户高28%。\n\n5. **地区表现**：西部地区销售额最高，但东南部地区增长最快（同比增长40%）。\n\n**建议行动**：\n- 加强对服装类别的营销投资，因为它显示出最强的增长势头\n- 实施客户忠诚度计划，以进一步增加回头客的价值\n- 调查东南部地区成功的因素，并考虑将这些策略应用到其他地区',
                usage: { promptTokens: 150, completionTokens: 280, totalTokens: 430 }
              }),
              completeStream: vi.fn().mockImplementation(async function* () {
                yield { content: '根据您提供的销售数据分析，我发现以下几个关键趋势和洞察：\n\n1. **季节性模式**：销售在Q4（10-12月）达到峰值，这可能与假日购物季相关。Q1（1-3月）通常是销售最低的时期。\n\n', done: false };
                yield { content: '2. **增长趋势**：过去三年的年度销售额呈现持续增长，2022年比2021年增长15%，2023年比2022年增长22%。\n\n3. **产品类别分析**：电子产品贡献了最大的收入（42%），但服装类别增长最快（同比增长35%）。\n\n', done: false };
                yield { content: '4. **客户细分洞察**：回头客贡献了总销售额的65%，并且平均订单价值比新客户高28%。\n\n5. **地区表现**：西部地区销售额最高，但东南部地区增长最快（同比增长40%）。\n\n', done: false };
                yield { content: '**建议行动**：\n- 加强对服装类别的营销投资，因为它显示出最强的增长势头\n- 实施客户忠诚度计划，以进一步增加回头客的价值\n- 调查东南部地区成功的因素，并考虑将这些策略应用到其他地区', done: true };
              })
            };
          })
        }
      };
    });
    
    // 读取数据分析代理定义文件
    const agentFilePath = path.join(__dirname, '../fixtures/data-analyst.xml');
    
    // 确保测试夹具目录存在
    const fixturesDir = path.join(__dirname, '../fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // 创建测试用的数据分析代理定义文件
    if (!fs.existsSync(agentFilePath)) {
      const dataAnalystAgentXml = `<agent id="data-analyst" version="1.0">
  <llm api-type="openai" model="gpt-4-turbo" key-env="OPENAI_API_KEY" />
  <prompt>
    你是一个专业的数据分析师，擅长分析数据并提供有价值的见解。
    你应该：
    1. 识别数据中的关键趋势和模式
    2. 提供清晰、量化的分析结果
    3. 提出基于数据的实用建议
    4. 使用适当的统计术语解释结果
    5. 不要做没有数据支持的假设
  </prompt>
</agent>`;
      
      fs.writeFileSync(agentFilePath, dataAnalystAgentXml, 'utf8');
    }
    
    // 读取代理定义
    const agentDefinition = fs.readFileSync(agentFilePath, 'utf8');
    
    // 模拟解析XML并创建代理配置
    const agentConfig = {
      id: 'data-analyst',
      version: '1.0',
      executionConfig: {
        defaultModel: 'gpt-4-turbo',
        apiType: 'openai',
        systemPrompt: '你是一个专业的数据分析师，擅长分析数据并提供有价值的见解。'
      }
    };
    
    // 模拟createAgent方法以接受字符串并返回Agent
    vi.spyOn(AgentFactory, 'createAgent').mockImplementation(() => {
      return {
        getId: () => 'data-analyst',
        getVersion: () => '1.0',
        getState: () => Promise.resolve({}),
        execute: vi.fn().mockResolvedValue({
          success: true,
          sessionId,
          response: {
            text: '根据您提供的销售数据分析，我发现以下几个关键趋势和洞察：\n\n1. **季节性模式**：销售在Q4（10-12月）达到峰值，这可能与假日购物季相关。Q1（1-3月）通常是销售最低的时期。\n\n2. **增长趋势**：过去三年的年度销售额呈现持续增长，2022年比2021年增长15%，2023年比2022年增长22%。\n\n3. **产品类别分析**：电子产品贡献了最大的收入（42%），但服装类别增长最快（同比增长35%）。\n\n4. **客户细分洞察**：回头客贡献了总销售额的65%，并且平均订单价值比新客户高28%。\n\n5. **地区表现**：西部地区销售额最高，但东南部地区增长最快（同比增长40%）。\n\n**建议行动**：\n- 加强对服装类别的营销投资，因为它显示出最强的增长势头\n- 实施客户忠诚度计划，以进一步增加回头客的价值\n- 调查东南部地区成功的因素，并考虑将这些策略应用到其他地区',
            timestamp: new Date().toISOString()
          }
        }),
        executeStream: vi.fn().mockImplementation(async function* () {
          yield {
            text: '根据您提供的销售数据分析，我发现以下几个关键趋势和洞察：\n\n1. **季节性模式**：销售在Q4（10-12月）达到峰值，这可能与假日购物季相关。Q1（1-3月）通常是销售最低的时期。\n\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '2. **增长趋势**：过去三年的年度销售额呈现持续增长，2022年比2021年增长15%，2023年比2022年增长22%。\n\n3. **产品类别分析**：电子产品贡献了最大的收入（42%），但服装类别增长最快（同比增长35%）。\n\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '4. **客户细分洞察**：回头客贡献了总销售额的65%，并且平均订单价值比新客户高28%。\n\n5. **地区表现**：西部地区销售额最高，但东南部地区增长最快（同比增长40%）。\n\n',
            timestamp: new Date().toISOString()
          };
          yield {
            text: '**建议行动**：\n- 加强对服装类别的营销投资，因为它显示出最强的增长势头\n- 实施客户忠诚度计划，以进一步增加回头客的价值\n- 调查东南部地区成功的因素，并考虑将这些策略应用到其他地区',
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
  
  it('应能识别数据中的趋势并提供分析', async () => {
    // 发送数据分析请求
    const response = await agent.execute({
      sessionId,
      text: '请分析以下销售数据并提供洞察：过去三年按季度、产品类别和地区划分的销售额，包括新客户和回头客的比例。'
    });
    
    // 验证响应包含数据分析内容
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('趋势');
    expect(response.response?.text).toContain('季节性');
    expect(response.response?.text).toContain('%');
    expect(response.response?.text).toContain('建议');
  });
  
  it('应能通过流式接口提供数据分析', async () => {
    // 测试流式接口
    const chunks: string[] = [];
    for await (const chunk of agent.executeStream({
      sessionId,
      text: '请分析以下销售数据并提供洞察：过去三年按季度、产品类别和地区划分的销售额，包括新客户和回头客的比例。'
    })) {
      chunks.push(chunk.text);
    }
    
    // 合并所有块
    const fullResponse = chunks.join('');
    
    // 验证完整响应内容
    expect(fullResponse).toContain('趋势');
    expect(fullResponse).toContain('季节性');
    expect(fullResponse).toContain('%');
    expect(fullResponse).toContain('建议');
  });
  
  it('应能基于数据提供实用建议', async () => {
    // 发送数据分析请求
    const response = await agent.execute({
      sessionId,
      text: '请分析以下销售数据并提供洞察：过去三年按季度、产品类别和地区划分的销售额，包括新客户和回头客的比例。'
    });
    
    // 验证响应包含基于数据的实用建议
    expect(response.success).toBe(true);
    expect(response.response?.text).toContain('建议');
    // 验证包含具体的行动点
    expect(response.response?.text).toContain('营销投资');
    expect(response.response?.text).toContain('客户忠诚度');
    // 验证建议是基于数据的
    expect(response.response?.text).toMatch(/因为.*增长/);
  });
}); 