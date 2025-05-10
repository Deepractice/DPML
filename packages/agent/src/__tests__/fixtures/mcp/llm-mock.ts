/**
 * 模拟LLM响应的测试夹具
 * 提供用于测试的模拟LLM响应生成功能
 */

/**
 * 模拟LLM响应配置
 */
export interface MockLLMConfig {
  /** 模拟响应内容 */
  response?: string;
  /** 模拟响应的延迟时间(毫秒) */
  delay?: number;
  /** 是否模拟错误 */
  shouldFail?: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 模拟的模型名称 */
  modelName?: string;
}

/**
 * 默认的模拟配置
 */
const DEFAULT_MOCK_CONFIG: MockLLMConfig = {
  response: '这是一个来自模拟LLM的响应',
  delay: 100,
  shouldFail: false,
  errorMessage: '模拟LLM调用失败',
  modelName: 'mock-llm-model',
};

/**
 * 模拟LLM调用的响应
 * @param prompt 提示词
 * @param config 模拟配置
 * @returns 模拟的响应结果
 */
export async function mockLLMResponse(
  prompt: string,
  config: MockLLMConfig = {}
): Promise<{ text: string; model: string }> {
  const mergedConfig = { ...DEFAULT_MOCK_CONFIG, ...config };

  console.info(`[MockLLM] 收到提示词: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

  // 模拟处理延迟
  if (mergedConfig.delay && mergedConfig.delay > 0) {
    await new Promise(resolve => setTimeout(resolve, mergedConfig.delay));
  }

  // 模拟错误
  if (mergedConfig.shouldFail) {
    console.error(`[MockLLM] 模拟错误: ${mergedConfig.errorMessage}`);
    throw new Error(mergedConfig.errorMessage || '未知错误');
  }

  // 处理特殊指令
  const response = mergedConfig.response || DEFAULT_MOCK_CONFIG.response || '';

  // 可以在这里添加根据提示词内容的特殊处理逻辑

  console.info(`[MockLLM] 返回响应: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);

  return {
    text: response,
    model: mergedConfig.modelName || DEFAULT_MOCK_CONFIG.modelName || 'unknown-model',
  };
}

/**
 * 工具调用描述接口
 */
export interface ToolCallRequest {
  name: string;
  arguments: Record<string, any>;
}

/**
 * 工具调用响应接口
 */
export interface ToolCallResponse {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * 模拟工具调用检测的LLM响应
 * @param prompt 提示词
 * @param toolCalls 要模拟的工具调用
 * @param config 模拟配置
 * @returns 带有工具调用的模拟响应
 */
export async function mockLLMWithToolCalls(
  prompt: string,
  toolCalls: ToolCallRequest[],
  config: MockLLMConfig = {}
): Promise<{ text: string; model: string; toolCalls: ToolCallResponse[] }> {
  // 获取基本响应
  const baseResponse = await mockLLMResponse(prompt, config);

  // 添加工具调用
  console.info(`[MockLLM] 模拟工具调用: ${JSON.stringify(toolCalls)}`);

  return {
    ...baseResponse,
    toolCalls: toolCalls.map((call, index) => ({
      id: `mock-tool-call-${index}`,
      type: 'function',
      function: {
        name: call.name,
        arguments: JSON.stringify(call.arguments),
      }
    })),
  };
}
