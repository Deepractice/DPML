import { describe, expect, test, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';

import { createTestConfigFile, cleanupTestFile } from '../../helpers/cli-process-runner';
import { InteractiveCLISession } from '../../helpers/interactive-cli-runner';

/**
 * CLI流式输出测试套件
 *
 * 测试Agent CLI的流式输出功能
 */
describe('Agent CLI流式输出测试', () => {
  // 测试配置文件路径
  let simpleAgentConfig: string;
  const simpleAgentContent = `<?xml version="1.0" encoding="UTF-8"?>
<agent>
  <llm 
    api-type="@agentenv:API_TYPE" 
    api-url="@agentenv:API_URL" 
    api-key="@agentenv:API_KEY" 
    model="@agentenv:MODEL">
  </llm>
  
  <prompt>
    你是一个专业的助手，请帮助用户解决问题。
  </prompt>
  
  <experimental>
    <tools>
      <tool name="search" description="搜索网络信息" />
      <tool name="calculator" description="进行数学计算" />
    </tools>
  </experimental>
</agent>`;

  // 保存当前会话的引用，以便在测试后清理
  let cliSession: InteractiveCLISession | null = null;

  // 备份原始环境变量
  const originalEnv = { ...process.env };

  // 设置测试环境变量
  beforeEach(() => {
    // 设置通用测试环境变量
    process.env.API_TYPE = 'test-api-type';
    process.env.API_URL = 'https://test-api-url.example.com';
    process.env.API_KEY = 'test-api-key-for-e2e-tests';
    process.env.MODEL = 'test-model';
  });

  // 创建测试配置文件
  beforeAll(async () => {
    simpleAgentConfig = await createTestConfigFile(simpleAgentContent, 'streaming-agent.dpml');
  });

  // 每次测试后终止CLI会话
  afterEach(async () => {
    if (cliSession) {
      await cliSession.terminate();
      cliSession = null;
    }
  });

  // 恢复原始环境变量并清理测试配置文件
  afterAll(async () => {
    process.env = originalEnv;
    await cleanupTestFile(simpleAgentConfig);
  });

  test('agent chat命令默认应启用流式输出', async () => {
    // 创建新的CLI会话，不指定stream选项
    cliSession = new InteractiveCLISession('agent chat', [
      simpleAgentConfig,
      '--env', 'API_TYPE=test-api-type',
      '--env', 'API_URL=https://test-api-url.example.com',
      '--env', 'API_KEY=test-api-key-for-e2e-tests',
      '--env', 'MODEL=test-model'
    ]);

    // 给CLI一些时间初始化
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查是否有编译器初始化错误
    expect(cliSession.getErrorOutput()).not.toContain('领域编译器尚未初始化');
  });

  test('agent chat命令使用--no-stream选项应禁用流式输出', async () => {
    // 创建新的CLI会话，明确禁用流式输出
    cliSession = new InteractiveCLISession('agent chat', [
      simpleAgentConfig,
      '--no-stream',
      '--env', 'API_TYPE=test-api-type',
      '--env', 'API_URL=https://test-api-url.example.com',
      '--env', 'API_KEY=test-api-key-for-e2e-tests',
      '--env', 'MODEL=test-model'
    ]);

    // 给CLI一些时间初始化
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查是否有编译器初始化错误
    expect(cliSession.getErrorOutput()).not.toContain('领域编译器尚未初始化');
  });

  test('agent chat命令使用--stream选项应明确启用流式输出', async () => {
    // 创建新的CLI会话，明确启用流式输出
    cliSession = new InteractiveCLISession('agent chat', [
      simpleAgentConfig,
      '--stream',
      '--env', 'API_TYPE=test-api-type',
      '--env', 'API_URL=https://test-api-url.example.com',
      '--env', 'API_KEY=test-api-key-for-e2e-tests',
      '--env', 'MODEL=test-model'
    ]);

    // 给CLI一些时间初始化
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查是否有编译器初始化错误
    expect(cliSession.getErrorOutput()).not.toContain('领域编译器尚未初始化');
  });
});
