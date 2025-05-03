import { describe, expect, test, beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'path';
import { runCLICommand, createTestConfigFile, cleanupTestFile } from '../../helpers/cli-process-runner';

/**
 * 真实CLI环境测试套件
 * 
 * 这些测试在实际CLI环境中运行命令，能够检测出仅在真实环境中出现的集成问题
 * 注意：当"领域编译器尚未初始化"的bug被修复后，这些测试才会通过
 */
describe('真实CLI环境测试', () => {
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
    simpleAgentConfig = await createTestConfigFile(simpleAgentContent, 'simple-agent.dpml');
  });

  // 恢复原始环境变量并清理测试配置文件
  afterAll(async () => {
    process.env = originalEnv;
    await cleanupTestFile(simpleAgentConfig);
  });

  test('agent chat命令不应出现"领域编译器尚未初始化"错误', async () => {
    const { stdout, stderr, exitCode } = await runCLICommand('agent chat', [
      simpleAgentConfig, 
      '--env', 'API_TYPE=test-api-type',
      '--env', 'API_URL=https://test-api-url.example.com',
      '--env', 'API_KEY=test-api-key-for-e2e-tests',
      '--env', 'MODEL=test-model'
    ]);
    
    // 明确检查"领域编译器尚未初始化"错误
    // 注意：当问题修复前，这个测试会失败
    expect(stderr).not.toContain('领域编译器尚未初始化');
    
    // 如果没有编译器初始化问题，命令应该能成功执行
    if (!stderr.includes('领域编译器尚未初始化')) {
      expect(exitCode).toBe(0);
    }
  });

  test('validate命令不应出现"领域编译器尚未初始化"错误', async () => {
    const { stdout, stderr, exitCode } = await runCLICommand('validate', [
      simpleAgentConfig, 
      '--env', 'API_TYPE=test-api-type',
      '--env', 'API_URL=https://test-api-url.example.com',
      '--env', 'API_KEY=test-api-key-for-e2e-tests',
      '--env', 'MODEL=test-model'
    ]);
    
    // 明确检查"领域编译器尚未初始化"错误
    // 注意：当问题修复前，这个测试会失败
    expect(stderr).not.toContain('领域编译器尚未初始化');
    
    // 如果没有编译器初始化问题，命令应该能成功执行
    if (!stderr.includes('领域编译器尚未初始化')) {
      expect(exitCode).toBe(0);
    }
  });

  test('检查并验证是否能正确捕获"领域编译器尚未初始化"错误', async () => {
    // 这个测试专门用来确认我们的测试框架能够正确捕获stderr中的错误信息
    // 当已知bug存在时，这个测试应该失败；当bug修复后，会被上面的测试覆盖
    
    // 使用debug模式运行，增加更多输出
    const { stdout, stderr, exitCode } = await runCLICommand('agent chat', [
      simpleAgentConfig, 
      '--env', 'API_TYPE=test-api-type',
      '--env', 'API_URL=https://test-api-url.example.com',
      '--env', 'API_KEY=test-api-key-for-e2e-tests',
      '--env', 'MODEL=test-model',
      '--debug'
    ]);
    
    // 输出调试信息，帮助排查是否正确捕获了错误
    console.log('DEBUG - stderr output:', stderr);
    
    // 如果存在领域编译器初始化问题，这个测试会直接失败
    if (stderr.includes('领域编译器尚未初始化')) {
      throw new Error('存在已知问题："领域编译器尚未初始化"错误');
    }
  });

  test('检查环境变量替换是否正常工作', async () => {
    const envTestConfig = await createTestConfigFile(`<?xml version="1.0" encoding="UTF-8"?>
<agent>
  <llm 
    api-type="@agentenv:TEST_API_TYPE" 
    api-url="@agentenv:TEST_API_URL" 
    api-key="@agentenv:TEST_API_KEY" 
    model="@agentenv:TEST_MODEL">
  </llm>
  <prompt>测试提示词</prompt>
</agent>`, 'env-test.dpml');

    try {
      const { stderr, exitCode } = await runCLICommand('validate', [
        envTestConfig,
        '--env', 'TEST_API_TYPE=test-type',
        '--env', 'TEST_API_URL=https://test.example.com',
        '--env', 'TEST_API_KEY=test-key',
        '--env', 'TEST_MODEL=test-model'
      ]);

      // 检查是否有环境变量处理错误
      expect(stderr).not.toContain('环境变量');
      expect(stderr).not.toContain('未定义');
      
      // 检查是否有编译器初始化问题
      expect(stderr).not.toContain('领域编译器尚未初始化');
    } finally {
      await cleanupTestFile(envTestConfig);
    }
  });

  test('不存在的命令应返回错误', async () => {
    const { stderr, exitCode } = await runCLICommand('nonexistent-command');
    
    // 验证命令应失败执行（非零退出码）
    expect(exitCode).not.toBe(0);
  });

  test('缺少必要参数应返回错误', async () => {
    const { stderr, exitCode } = await runCLICommand('validate');
    
    // 验证命令应失败执行
    expect(exitCode).not.toBe(0);
  });

  test('无效的配置文件应返回特定错误', async () => {
    // 创建一个无效的配置文件
    const invalidConfig = await createTestConfigFile('<invalid>xml</invalid>', 'invalid-config.dpml');
    
    try {
      const { stderr, exitCode } = await runCLICommand('validate', [invalidConfig]);
      
      // 验证命令应失败执行
      expect(exitCode).not.toBe(0);
    } finally {
      // 清理测试文件
      await cleanupTestFile(invalidConfig);
    }
  });
}); 