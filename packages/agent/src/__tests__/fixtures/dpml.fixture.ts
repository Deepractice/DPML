import type { AgentConfig } from '../../types';

/**
 * 创建测试用DPML内容
 */
export function createTestDPML(options: {
  apiType?: string;
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  prompt?: string;
  includeExperimental?: boolean;
} = {}): string {
  // 应用默认值
  const {
    apiType = 'openai',
    apiKey = '@agentenv:API_KEY',
    apiUrl,
    model = 'gpt-4',
    prompt = 'You are a helpful assistant',
    includeExperimental = false
  } = options;

  // 构建llm元素
  let llmElement = `<llm api-type="${apiType}" model="${model}"`;

  if (apiKey) llmElement += ` api-key="${apiKey}"`;
  if (apiUrl) llmElement += ` api-url="${apiUrl}"`;
  llmElement += '></llm>';

  // 构建实验性功能元素
  const experimentalElement = includeExperimental ? `
    <experimental>
      <tools>
        <tool name="search" description="Search the web for information" />
      </tools>
    </experimental>` : '';

  // 返回完整DPML
  return `
    <agent>
      ${llmElement}
      <prompt>${prompt}</prompt>
      ${experimentalElement}
    </agent>
  `;
}

/**
 * 创建测试用AgentConfig
 * 与createTestDPML参数保持一致，方便对比预期输出
 */
export function createExpectedConfig(options: {
  apiType?: string;
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  prompt?: string;
} = {}): AgentConfig {
  // 应用默认值
  const {
    apiType = 'openai',
    apiKey = '@agentenv:API_KEY',
    apiUrl,
    model = 'gpt-4',
    prompt = 'You are a helpful assistant'
  } = options;

  // 返回预期的配置对象
  return {
    llm: {
      apiType,
      apiKey,
      apiUrl,
      model
    },
    prompt
  };
}

/**
 * 创建无效的测试DPML内容
 */
export function createInvalidDPML(type: 'missing-llm' | 'missing-required-attr' | 'unknown-element'): string {
  switch (type) {
    case 'missing-llm':
      return `
        <agent>
          <prompt>Test prompt</prompt>
        </agent>
      `;
    case 'missing-required-attr':
      return `
        <agent>
          <llm model="gpt-4"></llm>
          <prompt>Test prompt</prompt>
        </agent>
      `;
    case 'unknown-element':
      return `
        <agent>
          <llm api-type="openai" model="gpt-4"></llm>
          <prompt>Test prompt</prompt>
          <unknown-element>Invalid element</unknown-element>
        </agent>
      `;
  }
}
