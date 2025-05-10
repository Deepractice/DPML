/**
 * 测试环境辅助工具
 * 提供对测试环境变量和配置的控制功能
 */

/**
 * 检查是否允许使用真实API
 * @param provider 可选的服务提供商名称
 * @returns 是否允许并配置了真实API
 */
export function isLLMConfigValid(provider?: string): boolean {
  // 首先检查环境变量是否允许使用真实API
  if (process.env.TEST_USE_REAL_API !== 'true') {
    return false;
  }
  
  // 如果指定了提供商，检查对应配置
  if (provider) {
    switch (provider) {
      case 'openai':
        return Boolean(process.env.OPENAI_API_KEY);
      case 'anthropic':
        return Boolean(process.env.ANTHROPIC_API_KEY);
      default:
        return false;
    }
  }
  
  // 默认检查是否有任一提供商配置
  return Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/**
 * LLM服务提供商类型
 */
export type LLMProvider = 'openai' | 'anthropic';

/**
 * LLM配置接口
 */
export interface LLMConfig {
  apiKey: string;
  apiUrl?: string;
  model: string;
}

/**
 * 获取LLM配置
 * @param provider 服务提供商
 * @returns LLM配置对象
 */
export function getLLMConfig(provider: LLMProvider): LLMConfig {
  if (provider === 'openai') {
    return {
      apiKey: process.env.OPENAI_API_KEY || '',
      apiUrl: process.env.OPENAI_API_URL,
      model: process.env.OPENAI_MODEL || 'gpt-4',
    };
  } else if (provider === 'anthropic') {
    return {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    };
  }
  
  throw new Error(`不支持的LLM提供商: ${provider}`);
}

/**
 * 获取MCP测试模式配置
 * @returns 测试模式配置
 */
export function getMcpTestMode() {
  return {
    useRealApi: process.env.TEST_USE_REAL_API === 'true',
    testTimeout: parseInt(process.env.TEST_TIMEOUT || '10000', 10),
    debug: process.env.TEST_DEBUG === 'true',
  };
}

/**
 * 临时设置环境变量
 * @param vars 要设置的环境变量键值对
 * @returns 清理函数，用于恢复原始环境变量
 */
export function withEnvVars(vars: Record<string, string | undefined>): () => void {
  const originalVars: Record<string, string | undefined> = {};
  
  // 保存原始值并设置新值
  Object.entries(vars).forEach(([key, value]) => {
    originalVars[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
  
  // 返回清理函数
  return () => {
    Object.entries(originalVars).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  };
}

/**
 * 获取当前测试环境中可用的测试跳过函数
 * @returns 可选的测试跳过函数
 */
function getTestSkipFunction(): ((message: string) => void) | undefined {
  // 尝试访问全局test或it对象
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalObj = globalThis as any;
    
    // 检查Jest/Vitest中的test对象
    if (globalObj.test && typeof globalObj.test.skip === 'function') {
      return (message: string) => globalObj.test.skip(message);
    }
    
    // 检查Jest/Vitest中的it对象
    if (globalObj.it && typeof globalObj.it.skip === 'function') {
      return (message: string) => globalObj.it.skip(message);
    }
  } catch (e) {
    // 访问全局对象出错，返回undefined
    console.warn('无法访问测试框架全局对象', e);
  }
  
  return undefined;
}

/**
 * 使用真实API的辅助函数
 * 如果环境不允许使用真实API，将跳过测试
 * @param message 可选的跳过消息
 */
export function requireRealApi(message?: string): void {
  if (!isLLMConfigValid()) {
    const skipMessage = message || '此测试需要配置真实API（设置TEST_USE_REAL_API=true和API密钥）';
    
    // 尝试使用测试框架的跳过功能
    const skipFn = getTestSkipFunction();
    if (skipFn) {
      skipFn(skipMessage);
      return; // 成功跳过测试
    }
    
    // 后备方案：抛出错误
    throw new Error(`测试被跳过: ${skipMessage}`);
  }
}

/**
 * 打印当前测试环境配置信息
 * 用于调试测试环境问题
 */
export function logTestEnvironment(): void {
  const { useRealApi, testTimeout, debug } = getMcpTestMode();
  
  console.info('===== MCP测试配置信息 =====');
  console.info(`使用API模式: ${useRealApi ? '真实API' : '模拟API'}`);
  console.info(`测试超时设置: ${testTimeout}ms`);
  console.info(`调试模式: ${debug ? '开启' : '关闭'}`);
  
  if (useRealApi) {
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
    
    console.info('已配置的API提供商:');
    if (hasOpenAI) {
      console.info(`- OpenAI (${getLLMConfig('openai').model})`);
    }
    if (hasAnthropic) {
      console.info(`- Anthropic (${getLLMConfig('anthropic').model})`);
    }
    if (!hasOpenAI && !hasAnthropic) {
      console.warn('警告: 启用了真实API模式但未配置任何API密钥');
    }
  }
  
  console.info('===========================');
} 