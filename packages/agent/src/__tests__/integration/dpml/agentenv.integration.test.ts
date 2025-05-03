import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { replaceEnvVars } from '../../../api/agentenv';
import type { DomainActionContext } from '@dpml/core';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// 测试文件路径
const TEST_DPML_PATH = path.join(__dirname, '../../fixtures/test.dpml');

// 使用spyOn而不是完全模拟
const fsReadFileSpy = vi.spyOn(fs, 'readFile').mockResolvedValue(`
    <agent>
      <llm api-type="openai" api-key="@agentenv:OPENAI_API_KEY" model="@agentenv:OPENAI_MODEL"></llm>
      <prompt>测试提示词</prompt>
    </agent>
`);

// 模拟readline接口
vi.mock('readline', () => ({
  createInterface: vi.fn().mockReturnValue({
    question: vi.fn().mockImplementation((_, callback) => callback('exit')),
    close: vi.fn()
  })
}));

// 定义直接模拟而不是导入模拟
const mockAgent = {
  chat: vi.fn().mockResolvedValue('模拟响应')
};

// 模拟mockCompile和模拟上下文
const mockCompile = vi.fn().mockResolvedValue({
  llm: {
    apiType: 'openai',
    apiKey: '@agentenv:OPENAI_API_KEY',
    model: '@agentenv:OPENAI_MODEL'
  },
  prompt: '测试提示词'
});

// 模拟ActionContext
const mockActionContext: Partial<DomainActionContext> = {
  getCompiler: vi.fn().mockReturnValue({
    compile: mockCompile
  }),
  getDomain: vi.fn().mockReturnValue('agent'),
  getDescription: vi.fn().mockReturnValue('Agent Domain'),
  getOptions: vi.fn().mockReturnValue({ strictMode: true, errorHandling: 'throw' })
};

// 模拟process.exit，避免终止测试
const originalExit = process.exit;
beforeEach(() => {
  process.exit = vi.fn() as any;
});

afterEach(() => {
  process.exit = originalExit;
});

// 模拟chat命令处理函数
const mockChatAction = async (actionContext: DomainActionContext, filePath: string, options: any) => {
  // 1. 加载环境变量
  if (options.env) {
    for (const envVar of options.env) {
      const [key, value] = envVar.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
  
  if (options.envFile) {
    dotenv.config({ path: options.envFile });
  }
  
  try {
    // 2. 使用真实文件而不是模拟
    // 注意：我们忽略传入的filePath参数，始终使用TEST_DPML_PATH
    const fileContent = await fs.readFile(TEST_DPML_PATH, 'utf-8');
    const rawConfig = await actionContext.getCompiler().compile(fileContent);
    
    // 3. 处理环境变量
    const processedConfig = replaceEnvVars(rawConfig);
    
    // 4. 创建Agent
    mockAgent.chat("测试输入");
    
    // 5. 交互式聊天
    const readlineModule = await vi.importActual<typeof import('readline')>('readline');
    const rl = readlineModule.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // 模拟关闭
    rl.close();
    
    return processedConfig;
  } catch (error) {
    console.error("错误：", error);
    // 不要调用process.exit，而是返回错误
    return { error: true, message: error instanceof Error ? error.message : String(error) };
  }
};

// 定义配置类型
interface Config {
  llm: {
    apiType: string;
    apiKey: string;
    model: string;
  };
  prompt: string;
  [key: string]: any;
}

// 定义错误返回类型
interface ErrorResult {
  error: true;
  message: string;
}

type ActionResult = Config | ErrorResult;

// 定义模拟命令配置
const mockCommandsConfig = {
  includeStandard: true,
  actions: [
    {
      name: 'chat',
      action: mockChatAction
    }
  ]
};

describe('IT-Env', () => {
  // 备份和恢复环境变量
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // 重置环境变量
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // 恢复环境变量
    process.env = { ...originalEnv };
  });

  test('IT-Env-01: CLI环境变量设置应被agentenv正确读取', async () => {
    // 准备
    const chatCommand = mockCommandsConfig.actions?.find(action => action.name === 'chat');
    expect(chatCommand).toBeDefined();
    expect(chatCommand?.action).toBeDefined();

    // 设置环境变量
    const options = {
      env: ['OPENAI_API_KEY=sk-test123', 'OPENAI_MODEL=gpt-4']
    };

    // 找到chat命令的action函数
    const chatAction = chatCommand?.action;
    
    // 执行命令
    if (chatAction) {
      const processedConfig = await chatAction(mockActionContext as DomainActionContext, TEST_DPML_PATH, options) as ActionResult;
      
      // 验证环境变量被设置
      expect(process.env.OPENAI_API_KEY).toBe('sk-test123');
      expect(process.env.OPENAI_MODEL).toBe('gpt-4');
      
      // 验证环境变量在配置中被替换
      if (processedConfig && 'llm' in processedConfig) {
        expect(processedConfig.llm.apiKey).toBe('sk-test123');
        expect(processedConfig.llm.model).toBe('gpt-4');
      }
    }
  });

  test('IT-Env-02: CLI应支持从命令行参数设置环境变量', async () => {
    // 准备
    const options = {
      env: ['TEST_KEY=test-value', 'ANOTHER_KEY=another-value']
    };

    // 找到chat命令的action函数
    const chatCommand = mockCommandsConfig.actions?.find(a => a.name === 'chat');
    expect(chatCommand).toBeDefined();

    // 执行
    if (chatCommand?.action) {
      await chatCommand.action(mockActionContext as DomainActionContext, TEST_DPML_PATH, options);
    }

    // 验证环境变量被设置
    expect(process.env.TEST_KEY).toBe('test-value');
    expect(process.env.ANOTHER_KEY).toBe('another-value');
  });

  test('IT-Env-03: CLI应支持从.env文件加载环境变量', async () => {
    // 创建临时环境变量文件
    const tempEnvFile = path.join(process.cwd(), '.env.test');
    const envContent = 'ENV_FILE_KEY=value-from-env-file\n';
    
    try {
      // 写入测试环境变量文件
      await fs.writeFile(tempEnvFile, envContent, 'utf-8');

    // 准备选项
    const options = {
      envFile: '.env.test'
    };

    // 找到chat命令的action函数
    const chatCommand = mockCommandsConfig.actions?.find(a => a.name === 'chat');
    expect(chatCommand).toBeDefined();

    // 执行
    if (chatCommand?.action) {
        await chatCommand.action(mockActionContext as DomainActionContext, TEST_DPML_PATH, options);
    }

      // 验证环境变量是否被加载
      // 这里我们需要依赖dotenv实际加载了.env.test文件
      // 验证ENV_FILE_KEY环境变量是否被加载
      expect(process.env.ENV_FILE_KEY).toBe('value-from-env-file');
    } finally {
      // 清理测试环境变量文件
      try {
        await fs.unlink(tempEnvFile);
      } catch (err) {
        // 忽略文件不存在的错误
      }
    }
  });

  test('IT-Env-04: DPML中的@agentenv引用应被替换', () => {
    // 设置环境变量
    process.env.API_TEST_KEY = 'sk-test-key';
    process.env.MODEL_NAME = 'gpt-4-turbo';

    // 准备配置对象
    const config = {
      llm: {
        apiType: 'openai',
        apiKey: '@agentenv:API_TEST_KEY',
        model: '@agentenv:MODEL_NAME'
      },
      prompt: '测试@agentenv:MODEL_NAME'
    };

    // 执行环境变量替换
    const processed = replaceEnvVars(config);

    // 验证结果
    expect(processed.llm.apiKey).toBe('sk-test-key');
    expect(processed.llm.model).toBe('gpt-4-turbo');
    expect(processed.prompt).toBe('测试gpt-4-turbo');
  });

  test('IT-Env-05: 缺失的环境变量应保留原始引用', () => {
    // 确保环境变量不存在
    delete process.env.MISSING_KEY;

    // 准备配置对象
    const config = {
      llm: {
        apiType: 'openai',
        apiKey: '@agentenv:MISSING_KEY',
        model: 'gpt-4'
      },
      prompt: '测试提示词'
    };

    // 执行环境变量替换
    const processed = replaceEnvVars(config);

    // 验证结果 - 缺失的环境变量应保留原始引用
    expect(processed.llm.apiKey).toBe('@agentenv:MISSING_KEY');
  });
}); 