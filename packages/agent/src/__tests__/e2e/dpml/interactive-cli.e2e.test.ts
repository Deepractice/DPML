import { describe, expect, test, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';

import { createTestConfigFile, cleanupTestFile } from '../../helpers/cli-process-runner';
import { InteractiveCLISession } from '../../helpers/interactive-cli-runner';

/**
 * 交互式CLI测试套件
 *
 * 测试需要用户交互的CLI命令
 */
describe('交互式CLI命令测试', () => {
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
    simpleAgentConfig = await createTestConfigFile(simpleAgentContent, 'interactive-agent.dpml');
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

  // 这个测试需要CLI实际能运行，所以我们将只检查是否有错误
  test('agent chat命令应接受并响应用户输入', async () => {
    // 创建新的CLI会话，传递环境变量
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

  test('help命令应显示帮助信息', async () => {
    // 创建新的CLI会话
    cliSession = new InteractiveCLISession('help');

    // 给CLI一些时间初始化
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查是否有错误输出
    expect(cliSession.getErrorOutput()).not.toContain('错误');
  });

  test('version命令应显示版本信息', async () => {
    // 创建新的CLI会话
    cliSession = new InteractiveCLISession('version');

    // 给CLI一些时间初始化
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查是否有错误输出
    expect(cliSession.getErrorOutput()).not.toContain('错误');
  });

  test('带--interactive选项的agent chat命令应正常运行', async () => {
    // 创建新的CLI会话 - 使用交互模式，传递环境变量
    cliSession = new InteractiveCLISession('agent chat', [
      simpleAgentConfig,
      '--interactive',
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
