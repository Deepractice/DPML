import { createDomainDPML, createTransformerDefiner } from '@dpml/core';
import { of, firstValueFrom } from 'rxjs';
import { describe, test, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

import { createAgent } from '../../api/agent';
import { replaceEnvVars } from '../../api/agentenv';
import { schema } from '../../config/schema';
import * as llmFactory from '../../core/llm/llmFactory';
import { OpenAIClient } from '../../core/llm/OpenAIClient';
import type { AgentConfig, LLMConfig } from '../../types';
import { extractTextContent } from '../../utils/contentHelpers';
import { createTestDPML } from '../fixtures/dpml.fixture';

import { isLLMConfigValid, getLLMConfig, showMockWarning } from './env-helper';

// 检查是否使用真实API
const useOpenAIRealAPI = isLLMConfigValid('openai');
const useAnthropicRealAPI = isLLMConfigValid('anthropic');

// 创建测试专用的转换器，避免冲突
function createUniqueTransformers(prefix: string) {
  const definer = createTransformerDefiner();

  const testTransformer = definer.defineStructuralMapper<unknown, AgentConfig>(
    `${prefix}AgentTransformer`,
    [
      {
        selector: "agent > llm",
        targetPath: "llm",
        transform: (value: unknown) => {
          const node = value as any;
          const llmConfig: LLMConfig = {
            apiType: node.attributes.get('api-type') || '',
            apiUrl: node.attributes.get('api-url'),
            apiKey: node.attributes.get('api-key'),
            model: node.attributes.get('model') || ''
          };

          return llmConfig;
        }
      },
      {
        selector: "agent > prompt",
        targetPath: "prompt",
        transform: (value: unknown) => {
          const node = value as any;

          return node.content || '';
        }
      }
    ]
  );

  return [testTransformer];
}

// 创建一个独立的DPML测试实例，避免转换器名称冲突
function createTestDPMLCompiler(testId: string) {
  const testDPML = createDomainDPML<AgentConfig>({
    domain: `agent-test-${testId}`,
    description: 'Agent配置领域(测试)',
    schema,
    transformers: createUniqueTransformers(`test${testId}`),
    options: {
      strictMode: true,
      errorHandling: 'throw'
    }
  });

  return testDPML.compiler;
}

// 只有在不使用真实API时才进行模拟
if (!useOpenAIRealAPI && !useAnthropicRealAPI) {
  showMockWarning('LLM');

  // 模拟LLM客户端
  vi.mock('../../core/llm/llmFactory', () => ({
    createLLMClient: vi.fn().mockImplementation((config) => {
      return {
        sendRequest: vi.fn().mockImplementation((request) => {
          // 查找系统提示
          const systemMessage = request.messages.find(msg => msg.role === 'system');
          const systemPrompt = systemMessage?.content && !Array.isArray(systemMessage.content)
            ? systemMessage.content.type === 'text' ? systemMessage.content.value : ''
            : '';

          // 返回Observable而非Promise
          return of({
            content: {
              type: 'text' as const,
              value: `使用API类型: ${config.apiType}, 模型: ${config.model}, 提示词: ${systemPrompt}`
            }
          });
        })
      };
    }),
    // 导出createClient作为别名
    createClient: vi.fn().mockImplementation((config) => {
      return {
        sendRequest: vi.fn().mockImplementation((request) => {
          // 查找系统提示
          const systemMessage = request.messages.find(msg => msg.role === 'system');
          const systemPrompt = systemMessage?.content && !Array.isArray(systemMessage.content)
            ? systemMessage.content.type === 'text' ? systemMessage.content.value : ''
            : '';

          // 返回Observable而非Promise
          return of({
            content: {
              type: 'text' as const,
              value: `使用API类型: ${config.apiType}, 模型: ${config.model}, 提示词: ${systemPrompt}`
            }
          });
        })
      };
    })
  }));
} else {
  // 不完全模拟工厂，而是根据API类型选择真实或模拟客户端
  vi.spyOn(llmFactory, 'createClient').mockImplementation((config) => {
    if (config.apiType === 'openai' && useOpenAIRealAPI) {
      console.info('使用真实OpenAI客户端');

      // 使用真实OpenAI客户端
      return new OpenAIClient({
        ...config,
        apiKey: getLLMConfig('openai').apiKey,
        apiUrl: getLLMConfig('openai').apiUrl || config.apiUrl,
        model: getLLMConfig('openai').model || config.model
      });
    } else if (config.apiType === 'anthropic' && useAnthropicRealAPI) {
      console.info('使用真实Anthropic客户端');
      // 这里可以实现Anthropic客户端的真实调用
      // 目前示例中暂时使用模拟
    }

    // 其他情况使用模拟
    console.info(`使用模拟${config.apiType}客户端`);

    return {
      sendRequest: vi.fn().mockImplementation((request) => {
        // 查找系统提示
        const systemMessage = request.messages.find(msg => msg.role === 'system');
        const systemPrompt = systemMessage?.content && !Array.isArray(systemMessage.content)
          ? systemMessage.content.type === 'text' ? systemMessage.content.value : ''
          : '';

        // 返回Observable而非Promise
        return of({
          content: {
            type: 'text' as const,
            value: `使用API类型: ${config.apiType}, 模型: ${config.model}, 提示词: ${systemPrompt}`
          }
        });
      })
    };
  });
}

// 显示测试模式
beforeAll(() => {
  console.info('===== DPML配置测试模式 =====');
  if (useOpenAIRealAPI) {
    console.info('ℹ️ OpenAI测试使用真实API');
    console.info(`OpenAI模型: ${getLLMConfig('openai').model}`);
    console.info(`OpenAI API URL: ${getLLMConfig('openai').apiUrl || '默认URL'}`);
  } else {
    console.info('ℹ️ OpenAI测试使用模拟模式');
  }

  if (useAnthropicRealAPI) {
    console.info('ℹ️ Anthropic测试使用真实API');
    console.info(`Anthropic模型: ${getLLMConfig('anthropic').model}`);
  } else {
    console.info('ℹ️ Anthropic测试使用模拟模式');
  }

  console.info('=========================');
});

describe('E2E-DPML', () => {
  // 备份和恢复环境变量
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('E2E-DPML-01: 从DPML创建的Agent应使用配置的LLM', async () => {
    // 准备
    const compiler = createTestDPMLCompiler('01');
    const apiType = 'openai';
    const model = useOpenAIRealAPI ? getLLMConfig('openai').model : 'gpt-4-turbo';
    const dpmlContent = createTestDPML({
      apiType,
      model,
      apiKey: useOpenAIRealAPI ? getLLMConfig('openai').apiKey : 'sk-test123'
    });

    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);
    const agent = createAgent(processedConfig);
    const sessionId = agent.createSession();
    const response = await firstValueFrom(agent.chat(sessionId, '测试消息'));

    // 根据运行模式验证
    if (useOpenAIRealAPI) {
      // 真实API只能验证响应存在
      expect(response).toBeTruthy();
      console.info('使用真实API的响应:', extractTextContent(response.content));
    } else {
      // 模拟环境中验证响应内容
      const responseText = extractTextContent(response.content);

      expect(responseText).toContain(`API类型: ${apiType}`);
      expect(responseText).toContain(`模型: ${model}`);
    }
  });

  test('E2E-DPML-02: 从DPML创建的Agent应使用配置的提示词', async () => {
    // 准备
    const compiler = createTestDPMLCompiler('02');
    const customPrompt = '你是一个高级AI助手，专门解答技术问题';
    const dpmlContent = createTestDPML({
      apiType: 'openai',
      model: useOpenAIRealAPI ? getLLMConfig('openai').model : 'gpt-4',
      apiKey: useOpenAIRealAPI ? getLLMConfig('openai').apiKey : 'sk-test123',
      prompt: customPrompt
    });

    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);
    const agent = createAgent(processedConfig);
    const sessionId = agent.createSession();
    const response = await firstValueFrom(agent.chat(sessionId, '测试提示词'));

    // 根据运行模式验证
    if (useOpenAIRealAPI) {
      // 真实API只能验证响应存在
      expect(response).toBeTruthy();
      console.info('使用真实API的响应:', extractTextContent(response.content));
    } else {
      // 模拟环境中验证提示词
      expect(extractTextContent(response.content)).toContain(customPrompt);
    }
  });

  test('E2E-DPML-03: 从DPML创建的Agent应响应聊天请求', async () => {
    // 准备
    const compiler = createTestDPMLCompiler('03');
    const dpmlContent = createTestDPML({
      apiType: 'openai',
      model: useOpenAIRealAPI ? getLLMConfig('openai').model : 'gpt-4',
      apiKey: useOpenAIRealAPI ? getLLMConfig('openai').apiKey : 'sk-test123'
    });

    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);
    const agent = createAgent(processedConfig);
    const sessionId = agent.createSession();
    const response = await firstValueFrom(agent.chat(sessionId, '你好'));

    // 验证
    expect(response).toBeTruthy();
    if (!useOpenAIRealAPI) {
      expect(extractTextContent(response.content)).toContain('API类型: openai');
    }
  });

  test('E2E-DPML-04: 无效DPML应产生适当的错误', async () => {
    // 准备
    const compiler = createTestDPMLCompiler('04');
    const invalidDpml = `
      <invalid>
        <not-agent></not-agent>
      </invalid>
    `;

    // 执行和验证
    await expect(compiler.compile(invalidDpml)).rejects.toThrow();
  });

  test('E2E-DPML-05: 环境变量应在DPML中被正确处理', async () => {
    // 设置环境变量
    process.env.TEST_API_KEY = 'sk-test123';
    process.env.TEST_MODEL = 'gpt-4';

    // 准备
    const compiler = createTestDPMLCompiler('05');
    const dpmlContent = createTestDPML({
      apiKey: '@agentenv:TEST_API_KEY',
      model: '@agentenv:TEST_MODEL'
    });

    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);

    // 验证
    expect(processedConfig.llm.apiKey).toBe('sk-test123');
    expect(processedConfig.llm.model).toBe('gpt-4');
  });
});
