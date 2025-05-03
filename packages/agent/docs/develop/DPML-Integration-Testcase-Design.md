# DPML Integration模块测试用例设计

## 1. 测试范围分析

基于对DPML-Integration-Design.md文档的分析，本测试用例设计文档针对DPML Integration模块定义全面的测试策略和具体测试用例。DPML Integration模块作为Agent模块的扩展组件，主要职责是实现DPML声明式语法与Agent模块的无缝集成，让用户能够通过XML配置文件定义和创建Agent实例。

### 1.1 模块架构概览

DPML Integration模块遵循项目的分层架构，并在以下层次添加了新组件：

- **配置层**：schema、transformers和cli配置
- **入口层**：主入口和CLI入口
- **复用层**：复用现有的API层和Core层功能

### 1.2 核心功能组件

测试需覆盖以下核心功能组件：

- **Schema定义**：定义Agent配置的DPML结构
- **转换器**：将DPML文档转换为AgentConfig对象
- **CLI命令**：提供命令行交互界面
- **环境变量处理**：支持在配置中引用环境变量
- **统一入口点**：提供从DPML创建Agent的集成流程

## 2. 测试类型规划

根据DPML测试策略规则，为DPML Integration模块设计以下类型的测试：

| 测试类型 | 目录 | 测试重点 | 文件命名模式 |
|--------|------|---------|------------|
| 契约测试 | `/packages/agent/src/__tests__/contract/` | Schema和转换器接口 | `*.contract.test.ts` |
| 集成测试 | `/packages/agent/src/__tests__/integration/` | 组件间协作 | `*.integration.test.ts` |
| 端到端测试 | `/packages/agent/src/__tests__/e2e/` | 完整功能流程 | `*.e2e.test.ts` |

## 3. 测试用例设计

### 3.1 契约测试用例

契约测试确保Schema和转换器接口的稳定性和一致性。

#### 3.1.1 Schema契约测试

**文件路径**: `/packages/agent/src/__tests__/contract/dpml/schema.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-Schema-01 | Schema应符合DocumentSchema接口 | 验证Schema定义符合DPML Core规范 | 无 | Schema结构符合文档Schema接口 | 无需模拟 |
| CT-Schema-02 | Schema应定义'agent'作为根元素 | 验证根元素定义 | 无 | root.element为'agent' | 无需模拟 |
| CT-Schema-03 | Schema应支持'llm'子元素 | 验证子元素定义 | 无 | types包含'llm'元素定义 | 无需模拟 |
| CT-Schema-04 | Schema应支持'prompt'子元素 | 验证子元素定义 | 无 | types包含'prompt'元素定义 | 无需模拟 |
| CT-Schema-05 | Schema应支持'experimental'子元素 | 验证子元素定义 | 无 | types包含'experimental'元素定义 | 无需模拟 |

#### 3.1.2 转换器契约测试

**文件路径**: `/packages/agent/src/__tests__/contract/dpml/transformers.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-Trans-01 | agentTransformer应实现Transformer接口 | 验证转换器接口 | 无 | 转换器符合Transformer接口 | 无需模拟 |
| CT-Trans-02 | agentTransformer应定义正确的名称 | 验证转换器名称 | 无 | name为'agentTransformer' | 无需模拟 |
| CT-Trans-03 | agentTransformer应定义正确的选择器 | 验证转换规则 | 无 | 包含'agent > llm'和'agent > prompt'选择器 | 无需模拟 |
| CT-Trans-04 | transformers导出应包含所有转换器 | 验证导出内容 | 无 | 数组包含agentTransformer | 无需模拟 |

#### 3.1.3 CLI命令契约测试

**文件路径**: `/packages/agent/src/__tests__/contract/dpml/cli.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-CLI-01 | commandsConfig应符合DomainCommandsConfig接口 | 验证命令配置 | 无 | 配置符合DomainCommandsConfig接口 | 无需模拟 |
| CT-CLI-02 | commandsConfig应包含标准命令 | 验证标准命令 | 无 | includeStandard为true | 无需模拟 |
| CT-CLI-03 | commandsConfig应包含chat命令 | 验证chat命令 | 无 | actions包含name为'chat'的命令 | 无需模拟 |
| CT-CLI-04 | chat命令应有正确的参数定义 | 验证命令参数 | 无 | 包含filePath参数和env选项 | 无需模拟 |

### 3.2 集成测试用例

集成测试验证各组件之间的协作和数据流。

#### 3.2.1 Schema和转换器集成测试

**文件路径**: `/packages/agent/src/__tests__/integration/dpml/schema-transformer.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-ST-01 | 基于Schema解析的文档应能被成功转换 | 验证Schema和转换器协作 | 有效的XML文档 | 解析并转换为AgentConfig | 模拟DPMLCore |
| IT-ST-02 | 转换器应提取llm元素的所有属性 | 验证llm元素转换 | 包含llm元素的XML | 正确提取apiType、model等属性 | 模拟DPMLCore |
| IT-ST-03 | 转换器应提取prompt元素的内容 | 验证prompt元素转换 | 包含prompt元素的XML | 正确提取prompt文本 | 模拟DPMLCore |
| IT-ST-04 | 转换应处理缺失的可选属性 | 验证可选属性处理 | 缺少可选属性的XML | 使用默认值或undefined | 模拟DPMLCore |
| IT-ST-05 | Schema验证应拒绝无效的XML文档 | 验证验证功能 | 不符合Schema的XML | 抛出验证错误 | 模拟DPMLCore |

#### 3.2.2 DPML编译器集成测试

**文件路径**: `/packages/agent/src/__tests__/integration/dpml/compiler.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-Comp-01 | agentDPML.compiler应能编译有效的DPML文档 | 验证编译功能 | 有效的XML文档 | 返回AgentConfig对象 | 模拟DPMLCore |
| IT-Comp-02 | agentDPML应使用正确的domain标识符 | 验证domain配置 | 无 | domain为'agent' | 模拟DPMLCore |
| IT-Comp-03 | agentDPML应配置正确的schema | 验证schema配置 | 无 | 使用导入的schema | 模拟DPMLCore |
| IT-Comp-04 | agentDPML应配置正确的transformers | 验证transformers配置 | 无 | 使用导入的transformers | 模拟DPMLCore |
| IT-Comp-05 | agentDPML应配置正确的commands | 验证commands配置 | 无 | 使用导入的commandsConfig | 模拟DPMLCore |

#### 3.2.3 环境变量处理集成测试

**文件路径**: `/packages/agent/src/__tests__/integration/dpml/agentenv.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-Env-01 | CLI环境变量设置应被agentenv正确读取 | 验证环境变量流程 | 通过CLI设置的环境变量 | agentenv能读取到相同值 | 模拟process.env |
| IT-Env-02 | CLI应支持从命令行参数设置环境变量 | 验证CLI参数处理 | --env参数 | 环境变量被正确设置 | 模拟process.env |
| IT-Env-03 | CLI应支持从.env文件加载环境变量 | 验证.env文件处理 | --env-file参数 | 环境变量被正确加载 | 模拟dotenv和process.env |
| IT-Env-04 | DPML中的@agentenv引用应被替换 | 验证环境变量替换 | 包含@agentenv引用的配置 | 引用被替换为实际值 | 模拟process.env |
| IT-Env-05 | 缺失的环境变量应保留原始引用 | 验证错误处理 | 引用不存在的环境变量 | 保留原始@agentenv引用 | 模拟process.env |

### 3.3 端到端测试用例

端到端测试验证从配置文件到Agent实例的完整工作流程。

#### 3.3.1 DPML配置端到端测试

**文件路径**: `/packages/agent/src/__tests__/e2e/dpml-configuration.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-DPML-01 | 从DPML创建的Agent应使用配置的LLM | 验证LLM配置转换 | 包含LLM配置的DPML | Agent使用指定的LLM | 模拟或真实LLM API |
| E2E-DPML-02 | 从DPML创建的Agent应使用配置的提示词 | 验证提示词配置转换 | 包含提示词的DPML | Agent使用指定的提示词 | 模拟或真实LLM API |
| E2E-DPML-03 | 从DPML创建的Agent应响应聊天请求 | 验证完整功能 | DPML配置和聊天请求 | Agent返回有效响应 | 模拟或真实LLM API |
| E2E-DPML-04 | 无效DPML应产生适当的错误 | 验证错误处理 | 无效的DPML内容 | 抛出带详细信息的错误 | 无需模拟 |
| E2E-DPML-05 | 环境变量应在DPML中被正确处理 | 验证环境变量处理 | 引用环境变量的DPML | 环境变量被正确替换 | 模拟process.env |

#### 3.3.2 CLI命令端到端测试

**文件路径**: `/packages/agent/src/__tests__/e2e/dpml-cli.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-CLI-01 | validate命令应验证DPML文件 | 验证validate命令 | 有效/无效的DPML文件 | 正确的验证结果 | 无需模拟 |
| E2E-CLI-02 | chat命令应启动交互式聊天 | 验证chat命令 | DPML文件和聊天输入 | 接收输入并返回响应 | 模拟readline和LLM API |
| E2E-CLI-03 | chat命令应支持环境变量参数 | 验证环境变量处理 | --env参数 | 环境变量被正确设置和使用 | 模拟process.env和LLM API |
| E2E-CLI-04 | chat命令应支持环境变量文件 | 验证环境变量文件处理 | --env-file参数 | 环境变量被正确加载和使用 | 模拟dotenv、process.env和LLM API |
| E2E-CLI-05 | CLI应正确处理错误情况 | 验证错误处理 | 触发各种错误的输入 | 友好的错误消息和退出代码 | 视情况模拟 |

## 4. 模拟策略

### 4.1 DPML Core模拟策略

- **编译器模拟**：模拟DPML Core的编译功能，避免复杂的XML解析过程
- **转换过程模拟**：根据不同的XML输入返回预期的AgentConfig对象
- **验证错误模拟**：模拟Schema验证错误，测试错误处理

### 4.2 环境变量模拟策略

- **process.env模拟**：控制环境变量的存在和值
- **dotenv模拟**：模拟.env文件的加载过程
- **CLI参数处理模拟**：模拟命令行参数的解析和处理

### 4.3 LLM API模拟策略

采用与Agent测试相同的模拟策略：
- **模拟/真实切换**：通过环境变量控制是否使用真实API
- **API响应模拟**：提供预定义的模拟响应
- **流式响应模拟**：使用AsyncIterable模拟流式响应
- **错误情况模拟**：模拟API错误和异常情况

## 5. 测试覆盖率目标

依据DPML测试策略规则，设定如下覆盖率目标：

| 测试类型 | 行覆盖率目标 | 分支覆盖率目标 | 重点覆盖领域 |
|---------|------------|-------------|------------|
| 契约测试 | >95% | 100% | Schema定义、转换器接口 |
| 集成测试 | >90% | >90% | 组件协作、数据流 |
| 端到端测试 | 核心流程100% | N/A | 从DPML到Agent的完整流程 |

## 6. 测试实现示例

### 6.1 Schema契约测试实现示例

```typescript
// /packages/agent/src/__tests__/contract/dpml/schema.contract.test.ts
import { describe, test, expect } from 'vitest';
import { schema } from '../../../config/schema';
import type { DocumentSchema } from '@dpml/core';

describe('CT-Schema', () => {
  test('Schema应符合DocumentSchema接口', () => {
    // 验证schema符合DocumentSchema接口的基本结构
    expect(schema).toHaveProperty('root');
    expect(schema).toHaveProperty('types');

    // 验证具体属性
    const schemaTyped = schema as DocumentSchema;
    expect(typeof schemaTyped.root).toBe('object');
    expect(Array.isArray(schemaTyped.types)).toBe(true);
  });

  test('Schema应定义agent作为根元素', () => {
    // 验证根元素为agent
    expect(schema.root.element).toBe('agent');
    
    // 验证根元素有children定义
    expect(schema.root).toHaveProperty('children');
    expect(schema.root.children).toHaveProperty('elements');
  });

  test('Schema应支持llm子元素', () => {
    // 验证types中包含llm元素定义
    const llmType = schema.types?.find(type => type.element === 'llm');
    expect(llmType).toBeDefined();
    
    // 验证llm元素有必要的属性定义
    expect(llmType).toHaveProperty('attributes');
    expect(Array.isArray(llmType?.attributes)).toBe(true);
    
    // 验证必要的属性
    const attributes = llmType?.attributes || [];
    expect(attributes.some(attr => attr.name === 'api-type' && attr.required === true)).toBe(true);
    expect(attributes.some(attr => attr.name === 'model' && attr.required === true)).toBe(true);
  });
});
```

### 6.2 环境变量处理集成测试实现示例

```typescript
// /packages/agent/src/__tests__/integration/dpml/agentenv.integration.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { replaceEnvVars } from '../../../api/agentenv';
import { loadEnvironmentVariables } from '../../../config/cli';

// 备份原始环境变量
const originalEnv = { ...process.env };

// 模拟dotenv
vi.mock('dotenv', () => ({
  config: vi.fn().mockImplementation(({ path }) => {
    if (path === 'valid.env') {
      process.env.TEST_KEY = 'value-from-env-file';
      return { parsed: { TEST_KEY: 'value-from-env-file' } };
    }
    return { error: new Error('Invalid env file') };
  })
}));

describe('IT-Env', () => {
  beforeEach(() => {
    // 重置环境变量
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // 恢复环境变量
    process.env = { ...originalEnv };
  });
  
  test('CLI应支持从命令行参数设置环境变量', () => {
    // 准备
    const options = {
      env: ['TEST_KEY=test-value', 'ANOTHER_KEY=another-value']
    };
    
    // 执行
    loadEnvironmentVariables(options);
    
    // 验证
    expect(process.env.TEST_KEY).toBe('test-value');
    expect(process.env.ANOTHER_KEY).toBe('another-value');
  });
  
  test('CLI应支持从.env文件加载环境变量', () => {
    // 准备
    const options = {
      envFile: 'valid.env'
    };
    
    // 执行
    loadEnvironmentVariables(options);
    
    // 验证
    expect(process.env.TEST_KEY).toBe('value-from-env-file');
  });
  
  test('DPML中的@agentenv引用应被替换', () => {
    // 准备
    process.env.API_KEY = 'sk-test123';
    process.env.MODEL_NAME = 'gpt-4';
    
    const config = {
      llm: {
        apiType: 'openai',
        apiKey: '@agentenv:API_KEY',
        model: '@agentenv:MODEL_NAME'
      },
      prompt: 'Test prompt'
    };
    
    // 执行
    const processed = replaceEnvVars(config);
    
    // 验证
    expect(processed.llm.apiKey).toBe('sk-test123');
    expect(processed.llm.model).toBe('gpt-4');
  });
  
  test('缺失的环境变量应保留原始引用', () => {
    // 准备 - 确保环境变量不存在
    delete process.env.MISSING_KEY;
    
    const config = {
      llm: {
        apiType: 'openai',
        apiKey: '@agentenv:MISSING_KEY',
        model: 'gpt-4'
      },
      prompt: 'Test prompt'
    };
    
    // 执行
    const processed = replaceEnvVars(config);
    
    // 验证 - 应保留原始引用
    expect(processed.llm.apiKey).toBe('@agentenv:MISSING_KEY');
  });
});
```

### 6.3 端到端测试实现示例

```typescript
// /packages/agent/src/__tests__/e2e/dpml-configuration.e2e.test.ts
import { describe, test, expect, vi, beforeEach, beforeAll } from 'vitest';
import { compiler } from '../../index';
import { createAgent } from '../../api/agent';
import { replaceEnvVars } from '../../api/agentenv';
import * as llmFactory from '../../core/llm/llmFactory';
import { isLLMConfigValid, getLLMConfig } from './env-helper';

// 检查是否使用真实API
const useRealAPI = isLLMConfigValid('openai');

// 只有在需要模拟时才进行模拟
if (!useRealAPI) {
  console.info('ℹ️ DPML Configuration tests using mock mode');
  
  // 模拟LLM客户端
  vi.spyOn(llmFactory, 'createClient').mockImplementation((config) => {
    return {
      sendMessages: vi.fn().mockImplementation((messages) => {
        // 查找系统提示
        const systemMessage = messages.find(msg => msg.role === 'system');
        const systemPrompt = systemMessage?.content && !Array.isArray(systemMessage.content)
          ? systemMessage.content.type === 'text' ? systemMessage.content.value : ''
          : '';

        // 返回反映配置的响应
        return Promise.resolve({
          content: {
            type: 'text',
            value: `Using API type: ${config.apiType}, model: ${config.model}, prompt: ${systemPrompt}`
          }
        });
      })
    };
  });
}

describe('E2E-DPML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('E2E-DPML-01: 从DPML创建的Agent应使用配置的LLM', async () => {
    // 准备DPML内容
    const dpmlContent = `
      <agent>
        <llm api-type="openai" model="gpt-4-turbo"></llm>
        <prompt>Test prompt</prompt>
      </agent>
    `;
    
    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);
    const agent = createAgent(processedConfig);
    const response = await agent.chat('Test message');
    
    // 验证
    if (useRealAPI) {
      // 真实API只能验证响应存在
      expect(response).toBeTruthy();
      console.info('Real API response:', response);
    } else {
      // 模拟环境中验证配置已应用
      expect(response).toContain('api-type: openai');
      expect(response).toContain('model: gpt-4-turbo');
    }
  });
  
  test('E2E-DPML-02: 从DPML创建的Agent应使用配置的提示词', async () => {
    // 准备
    const customPrompt = 'You are a specialized assistant for testing';
    const dpmlContent = `
      <agent>
        <llm api-type="openai" model="gpt-4-turbo"></llm>
        <prompt>${customPrompt}</prompt>
      </agent>
    `;
    
    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);
    const agent = createAgent(processedConfig);
    const response = await agent.chat('Test prompt');
    
    // 验证
    if (useRealAPI) {
      // 真实API只能验证响应存在
      expect(response).toBeTruthy();
      console.info('Real API response with custom prompt:', response);
    } else {
      // 模拟环境中验证提示词包含
      expect(response).toContain(customPrompt);
    }
  });
  
  test('E2E-DPML-05: 环境变量应在DPML中被正确处理', async () => {
    // 设置环境变量
    process.env.TEST_API_KEY = 'sk-test123';
    process.env.TEST_MODEL = 'gpt-4';
    
    // 准备DPML内容
    const dpmlContent = `
      <agent>
        <llm api-type="openai" api-key="@agentenv:TEST_API_KEY" model="@agentenv:TEST_MODEL"></llm>
        <prompt>Test prompt with env vars</prompt>
      </agent>
    `;
    
    // 执行
    const config = await compiler.compile(dpmlContent);
    const processedConfig = replaceEnvVars(config);
    
    // 验证
    expect(processedConfig.llm.apiKey).toBe('sk-test123');
    expect(processedConfig.llm.model).toBe('gpt-4');
  });
});
```

## 7. 测试夹具设计

### 7.1 DPML测试夹具

**文件路径**: `/packages/agent/src/__tests__/fixtures/dpml.fixture.ts`

```typescript
import { AgentConfig } from '../../types';

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
```

### 7.2 CLI命令测试夹具

**文件路径**: `/packages/agent/src/__tests__/fixtures/cli.fixture.ts`

```typescript
import { DomainActionContext } from '@dpml/core';
import type { AgentConfig } from '../../types';

/**
 * 创建模拟的DomainActionContext
 */
export function createMockActionContext(compilerResult: AgentConfig): DomainActionContext {
  return {
    getDomain: vi.fn().mockReturnValue('agent'),
    getDescription: vi.fn().mockReturnValue('Agent configuration domain'),
    getOptions: vi.fn().mockReturnValue({ strictMode: true, errorHandling: 'throw' }),
    getCompiler: vi.fn().mockReturnValue({
      compile: vi.fn().mockResolvedValue(compilerResult)
    })
  };
}

/**
 * 创建模拟的readline接口
 */
export function createMockReadline() {
  const mockQuestion = vi.fn();
  const mockClose = vi.fn();
  
  // 模拟用户输入序列
  const userInputs = [
    'Hello, AI assistant',
    'What can you do?',
    'exit'
  ];
  
  // 为每次调用提供不同的输入
  mockQuestion.mockImplementation((prompt, callback) => {
    const input = userInputs.shift() || 'exit';
    callback(input);
  });
  
  // 返回模拟对象
  return {
    createInterface: vi.fn().mockReturnValue({
      question: mockQuestion,
      close: mockClose
    }),
    mockQuestion,
    mockClose
  };
}
```

## 8. 优先级和实施顺序

根据DPML测试策略，测试实施应按以下优先级顺序进行：

1. **Schema和转换器契约测试**：确保基础定义正确
2. **编译器和环境变量集成测试**：验证核心功能组件协作
3. **DPML配置端到端测试**：验证从XML到Agent的流程
4. **CLI命令端到端测试**：验证命令行功能

## 9. 结论

本文档详细设计了DPML Integration模块的测试用例，涵盖了契约测试、集成测试和端到端测试。测试用例设计遵循DPML测试策略规则，确保全面验证DPML Integration模块的功能和质量。

测试设计重点关注以下几个方面：
- Schema和转换器接口的正确性
- DPML文档到AgentConfig的转换逻辑
- 环境变量处理机制
- CLI命令的功能和稳定性
- 完整的集成流程

通过实施本文档中设计的测试用例，可以确保DPML Integration模块的可靠性和稳定性，为用户提供声明式配置Agent的能力。 