# DPML Agent模块测试用例设计

## 1. 测试范围分析

基于对Agent-Design.md文档的分析，本测试用例设计文档针对Agent模块定义全面的测试策略和具体测试用例。Agent模块作为DPML的扩展包，主要职责是创建和管理AI对话代理，提供与大语言模型服务交互的能力。

### 1.1 模块架构概览

Agent模块严格遵循DPML项目的分层架构：
- **API层**：提供`createAgent`函数作为统一入口点
- **Types层**：定义`Agent`接口、`AgentConfig`和相关类型
- **Core层**：实现`agentService`、`AgentRunner`、会话管理和各种LLM客户端

### 1.2 核心功能组件

测试需覆盖以下核心功能组件：
- **Agent创建流程**：通过配置创建Agent实例
- **消息处理流程**：处理用户输入并获取LLM响应
- **会话管理**：维护对话历史记录
- **LLM适配器**：支持不同LLM服务提供商
- **多模态内容处理**：支持文本和其他类型内容
- **错误处理机制**：统一错误处理和报告

## 2. 测试类型规划

根据DPML测试策略规则，为Agent模块设计以下类型的测试：

| 测试类型 | 目录 | 测试重点 | 文件命名模式 |
|--------|------|---------|------------|
| 契约测试 | `__tests__/contract/` | API和类型稳定性 | `*.contract.test.ts` |
| 单元测试 | `__tests__/unit/` | 组件内部逻辑 | `*.test.ts` |
| 集成测试 | `__tests__/integration/` | 组件间协作 | `*.integration.test.ts` |
| 端到端测试 | `__tests__/e2e/` | 完整功能流程 | `*.e2e.test.ts` |

## 3. 测试用例设计

### 3.1 契约测试用例

契约测试确保API层和Types层的稳定性和一致性，是项目测试策略的第一优先级。

#### 3.1.1 API契约测试

**文件路径**: `__tests__/contract/api/agent.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-API-Agent-01 | createAgent函数应符合公开契约 | 验证createAgent函数存在并遵循类型签名 | 无 | 函数存在且类型为function | 无需模拟 |
| CT-API-Agent-02 | createAgent函数应接受AgentConfig并返回Agent | 验证函数参数和返回类型符合契约 | 完整的AgentConfig对象 | 返回符合Agent接口的对象 | 模拟Core层 |
| CT-API-Agent-03 | Agent.chat方法应符合公开契约 | 验证chat方法的签名和行为 | Agent实例, 文本输入 | 返回Promise<string> | 模拟Core层 |
| CT-API-Agent-04 | Agent.chatStream方法应符合公开契约 | 验证chatStream方法的签名和行为 | Agent实例, 文本输入 | 返回符合AsyncIterable接口的对象 | 模拟Core层 |
| CT-API-Agent-05 | createAgent应正确处理配置错误 | 验证函数对错误配置的处理方式 | 无效的AgentConfig | 抛出预期的AgentError | 无需模拟 |

#### 3.1.2 Types契约测试

**文件路径**: `__tests__/contract/types/Agent.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-Type-Agent-01 | Agent接口应符合公开契约 | 验证Agent接口的结构稳定性 | 符合Agent接口的对象 | 通过类型检查，无编译错误 | 无需模拟 |
| CT-Type-Agent-02 | AgentConfig类型应符合公开契约 | 验证AgentConfig类型的结构稳定性 | 符合AgentConfig类型的对象 | 通过类型检查，无编译错误 | 无需模拟 |
| CT-Type-Agent-03 | ChatInput类型应符合公开契约 | 验证ChatInput类型的结构稳定性 | 文本内容和多模态内容 | 通过类型检查，无编译错误 | 无需模拟 |
| CT-Type-Agent-04 | Content类型应支持多种内容类型 | 验证Content类型对多模态内容的支持 | 各种类型的ContentItem | 通过类型检查，无编译错误 | 无需模拟 |
| CT-Type-Agent-05 | AgentError类型应符合公开契约 | 验证AgentError类型的结构稳定性 | 各种错误类型和消息 | 通过类型检查，正确包含错误属性 | 无需模拟 |

### 3.2 单元测试用例

单元测试验证各个组件的独立功能，确保其内部逻辑正确。

#### 3.2.1 agentService单元测试

**文件路径**: `__tests__/unit/core/agent/agentService.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-AgentSvc-01 | createAgent应创建有效的Agent实例 | 验证创建功能正确工作 | 有效的AgentConfig | 返回实现Agent接口的对象 | 模拟llmFactory, AgentRunner |
| UT-AgentSvc-02 | createAgent应当传递正确配置给LLM客户端 | 验证配置正确传递 | AgentConfig对象 | 配置被正确传递给llmFactory | 模拟llmFactory, AgentRunner |
| UT-AgentSvc-03 | handleChat应正确处理文本输入 | 验证文本输入处理逻辑 | 文本字符串 | 返回期望的响应字符串 | 模拟AgentRunner |
| UT-AgentSvc-04 | handleChat应正确处理ChatInput对象 | 验证ChatInput处理逻辑 | ChatInput对象 | 返回期望的响应字符串 | 模拟AgentRunner |
| UT-AgentSvc-05 | handleChatStream应返回有效的AsyncIterable | 验证流式处理逻辑 | 文本字符串 | 返回AsyncIterable对象 | 模拟AgentRunner |
| UT-AgentSvc-06 | handleChat应处理底层错误并转换为AgentError | 验证错误处理逻辑 | 触发错误的输入 | 抛出AgentError类型错误 | 模拟AgentRunner抛出错误 |
| UT-AgentSvc-07 | normalizeChatInput应将字符串转换为ChatInput | 验证输入标准化逻辑 | 文本字符串 | 返回ChatInput对象 | 无需模拟 |
| UT-AgentSvc-08 | extractTextFromContent应从内容中提取文本 | 验证文本提取逻辑 | 各种Content类型 | 返回正确的文本字符串 | 无需模拟 |

#### 3.2.2 AgentRunner单元测试

**文件路径**: `__tests__/unit/core/agent/AgentRunner.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-Runner-01 | sendMessage应处理同步消息 | 验证消息处理逻辑 | ChatInput, stream=false | 返回ChatOutput | 模拟LLMClient, AgentSession |
| UT-Runner-02 | sendMessage应处理流式消息 | 验证流式处理逻辑 | ChatInput, stream=true | 返回AsyncIterable<ChatOutput> | 模拟LLMClient, AgentSession |
| UT-Runner-03 | sendMessage应将用户消息添加到会话 | 验证会话更新逻辑 | ChatInput | 确认调用addMessage | 模拟LLMClient, AgentSession |
| UT-Runner-04 | prepareMessages应添加系统提示词 | 验证消息准备逻辑 | 配置中包含prompt | 生成的消息列表包含系统消息 | 模拟AgentSession |
| UT-Runner-05 | prepareMessages应包含历史消息 | 验证历史消息整合 | 会话中有历史消息 | 生成的消息列表包含历史消息 | 模拟AgentSession |
| UT-Runner-06 | sendMessage应处理LLMClient错误 | 验证错误处理逻辑 | LLMClient抛出错误 | 抛出AgentError | 模拟LLMClient抛出错误 |

#### 3.2.3 InMemoryAgentSession单元测试

**文件路径**: `__tests__/unit/core/agent/InMemoryAgentSession.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-Session-01 | addMessage应将消息添加到历史 | 验证消息添加功能 | Message对象 | 消息被添加到历史中 | 无需模拟 |
| UT-Session-02 | getMessages应返回历史消息副本 | 验证消息检索功能 | 无 | 返回消息数组副本 | 无需模拟 |
| UT-Session-03 | addMessage当超出容量应移除最早消息 | 验证容量管理功能 | 超出容量的消息数量 | 最早的消息被移除 | 无需模拟 |
| UT-Session-04 | 构造函数应使用默认容量 | 验证默认值处理 | 无参数构造 | 容量设为默认值100 | 无需模拟 |
| UT-Session-05 | 构造函数应接受自定义容量 | 验证自定义配置 | 自定义容量值 | 容量设为自定义值 | 无需模拟 |

#### 3.2.4 LLM客户端单元测试

**文件路径**: `__tests__/unit/core/llm/OpenAIClient.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-OpenAI-01 | 构造函数应正确设置配置参数 | 验证配置处理 | LLMConfig对象 | 客户端实例配置正确 | 无需模拟 |
| UT-OpenAI-02 | sendMessages同步模式应调用OpenAI API | 验证API调用 | 消息数组, stream=false | 调用正确的API端点和方法 | 模拟fetch或axios |
| UT-OpenAI-03 | sendMessages流式模式应调用OpenAI流式API | 验证流式API调用 | 消息数组, stream=true | 调用正确的流式API端点 | 模拟fetch或axios |
| UT-OpenAI-04 | convertToOpenAIMessages应转换消息格式 | 验证格式转换 | 内部Message数组 | 转换为OpenAI格式消息 | 无需模拟 |
| UT-OpenAI-05 | convertContent应正确处理文本内容 | 验证文本内容转换 | 文本类型Content | 转换为OpenAI文本格式 | 无需模拟 |
| UT-OpenAI-06 | convertContent应正确处理图像内容 | 验证图像内容转换 | 图像类型Content | 转换为OpenAI图像URL格式 | 无需模拟 |
| UT-OpenAI-07 | sendMessages应处理API错误 | 验证错误处理 | API返回错误 | 抛出AgentError | 模拟fetch或axios返回错误 |

#### 3.2.5 llmFactory单元测试

**文件路径**: `__tests__/unit/core/llm/llmFactory.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-LLMFact-01 | createClient应为OpenAI配置创建OpenAIClient | 验证工厂逻辑 | apiType='openai'的配置 | 返回OpenAIClient实例 | 模拟OpenAIClient构造函数 |
| UT-LLMFact-02 | createClient应为Anthropic配置创建AnthropicClient | 验证工厂逻辑 | apiType='anthropic'的配置 | 返回AnthropicClient实例 | 模拟AnthropicClient构造函数 |
| UT-LLMFact-03 | createClient应对不支持的API类型抛出错误 | 验证错误处理 | 未知apiType | 抛出错误 | 无需模拟 |

#### 3.2.6 错误处理单元测试

**文件路径**: `__tests__/unit/types/errors.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-Error-01 | AgentError构造函数应设置所有属性 | 验证错误类构造 | 错误参数 | 属性值正确设置 | 无需模拟 |
| UT-Error-02 | AgentError应支持原始错误作为cause | 验证错误链处理 | 原始错误作为cause | cause属性正确设置 | 无需模拟 |
| UT-Error-03 | AgentError应使用默认错误类型 | 验证默认值 | 仅提供消息 | 使用UNKNOWN类型 | 无需模拟 |
| UT-Error-04 | AgentError应使用默认错误码 | 验证默认值 | 仅提供消息和类型 | 使用'AGENT_ERROR'码 | 无需模拟 |

### 3.3 集成测试用例

集成测试验证各组件之间的协作和数据流。

#### 3.3.1 Agent创建流程集成测试

**文件路径**: `__tests__/integration/agent-creation.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-Agent-01 | API层应委托Core层创建Agent | 验证API到Core的委托 | AgentConfig | 调用agentService.createAgent | 模拟底层组件 |
| IT-Agent-02 | Agent创建应包含正确的LLM客户端创建 | 验证协作流程 | AgentConfig | 调用llmFactory.createClient | 模拟LLM客户端 |
| IT-Agent-03 | Agent创建应初始化会话管理器 | 验证协作流程 | AgentConfig | 创建会话实例 | 模拟会话组件 |
| IT-Agent-04 | Agent创建应组装所有组件生成Agent实例 | 验证组件集成 | AgentConfig | 返回完整Agent对象 | 模拟底层组件 |

#### 3.3.2 消息处理流程集成测试

**文件路径**: `__tests__/integration/message-processing.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-Msg-01 | 消息流程应从Agent到Runner再到LLM | 验证消息流 | 文本消息 | 消息正确流经各组件 | 模拟LLM客户端 |
| IT-Msg-02 | 文本消息应被标准化为ChatInput | 验证输入处理 | 文本字符串 | 转换为标准ChatInput | 模拟LLM客户端 |
| IT-Msg-03 | 消息应被添加到会话历史 | 验证会话集成 | 文本消息 | 消息添加到会话中 | 模拟LLM客户端 |
| IT-Msg-04 | 返回的LLM响应应提取文本内容 | 验证输出处理 | LLM返回多模态内容 | 提取并返回文本内容 | 模拟LLM客户端 |
| IT-Msg-05 | 流式消息应正确处理 | 验证流式处理 | 文本消息, 流式模式 | 返回AsyncIterable | 模拟LLM客户端 |
| IT-Msg-06 | 错误应在各层之间正确传播 | 验证错误处理 | LLM客户端抛出错误 | Agent方法抛出AgentError | 模拟LLM客户端抛出错误 |

#### 3.3.3 LLM适配器集成测试

**文件路径**: `__tests__/integration/llm-adapters.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-LLM-01 | 工厂应根据配置创建正确的LLM客户端 | 验证客户端创建 | 不同apiType配置 | 创建对应类型的客户端 | 模拟客户端构造函数 |
| IT-LLM-02 | LLM客户端应正确转换消息格式 | 验证格式转换 | 内部消息格式 | 转换为特定LLM格式 | 模拟API调用 |
| IT-LLM-03 | LLM客户端应处理API响应并转换回内部格式 | 验证响应处理 | API响应 | 转换为ChatOutput | 模拟API调用 |

### 3.4 端到端测试用例

端到端测试验证从API到实际功能的完整工作流程。

#### 3.4.1 Agent对话端到端测试

**文件路径**: `__tests__/e2e/agent-conversation.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-Conv-01 | Agent应支持基本文本对话 | 验证文本对话流程 | 文本消息 | 返回有效文本响应 | 模拟LLM API |
| E2E-Conv-02 | Agent应支持多轮对话 | 验证会话连贯性 | 多个连续消息 | 响应考虑历史上下文 | 模拟LLM API |
| E2E-Conv-03 | Agent应支持多模态输入处理 | 验证多模态处理 | 文本和图像混合输入 | 处理复合输入并返回响应 | 模拟LLM API |
| E2E-Conv-04 | Agent应支持流式响应 | 验证流式功能 | 文本消息, chatStream方法 | 返回流式响应块 | 模拟LLM API |
| E2E-Conv-05 | Agent应处理LLM服务错误 | 验证错误处理 | 触发LLM服务错误 | 返回适当的错误信息 | 模拟LLM API错误 |

#### 3.4.2 Agent配置端到端测试

**文件路径**: `__tests__/e2e/agent-configuration.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-Config-01 | Agent应使用配置的系统提示词 | 验证提示词影响 | 不同系统提示词 | 响应符合提示词定义的行为 | 模拟LLM API |
| E2E-Config-02 | Agent应连接配置的LLM服务 | 验证LLM配置 | 不同LLM配置 | 连接正确的LLM服务 | 模拟LLM API |
| E2E-Config-03 | Agent应使用配置的模型名称 | 验证模型配置 | 不同模型配置 | 使用指定的模型 | 模拟LLM API |

## 4. 模拟策略

### 4.1 单元测试模拟策略

- **直接依赖模拟**：模拟测试单元直接依赖的外部组件
- **输入/输出模拟**：模拟预期的输入和输出，而非实现细节
- **错误模拟**：模拟各种错误情况，测试错误处理逻辑

### 4.2 LLM服务模拟策略

- **API响应模拟**：模拟LLM服务API的响应，避免实际API调用
- **流式响应模拟**：使用AsyncIterable模拟流式响应
- **错误情况模拟**：模拟API错误、超时和限流等情况

## 5. 测试覆盖率目标

依据DPML测试策略规则，设定如下覆盖率目标：

| 测试类型 | 行覆盖率目标 | 分支覆盖率目标 | 重点覆盖领域 |
|---------|------------|-------------|------------|
| 单元测试 | >90% | 100% | 核心业务逻辑、输入处理、错误处理 |
| 集成测试 | >80% | >90% | 组件协作、数据流、模块接口 |
| 端到端测试 | 核心流程100% | N/A | 用户交互场景、配置处理 |

## 6. 测试实现示例

### 6.1 契约测试实现示例

```typescript
// __tests__/contract/api/agent.contract.test.ts
import { describe, test, expect } from 'vitest';
import { createAgent } from '../../../api/agent';
import { Agent, AgentConfig } from '../../../types';

describe('CT-API-Agent', () => {
  test('createAgent函数应符合公开契约', () => {
    // 验证函数存在且为函数类型
    expect(typeof createAgent).toBe('function');
  });

  test('createAgent函数应接受AgentConfig并返回Agent', () => {
    // 准备最小化的配置对象
    const config: AgentConfig = {
      llm: {
        apiType: 'mock',
        model: 'mock-model'
      },
      prompt: 'Test prompt'
    };
    
    // 调用函数
    const agent = createAgent(config);
    
    // 验证返回对象实现了Agent接口
    expect(agent).toBeDefined();
    expect(typeof agent.chat).toBe('function');
    expect(typeof agent.chatStream).toBe('function');
  });
});
```

### 6.2 单元测试实现示例

```typescript
// __tests__/unit/core/agent/agentService.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createAgent, handleChat, normalizeChatInput } from '../../../../core/agent/agentService';
import { llmFactory } from '../../../../core/llm/llmFactory';
import { AgentRunner } from '../../../../core/agent/AgentRunner';
import { InMemoryAgentSession } from '../../../../core/agent/InMemoryAgentSession';
import { AgentError, AgentErrorType } from '../../../../types/errors';

// 模拟依赖
vi.mock('../../../../core/llm/llmFactory', () => ({
  llmFactory: {
    createClient: vi.fn().mockReturnValue({
      sendMessages: vi.fn()
    })
  }
}));

vi.mock('../../../../core/agent/AgentRunner', () => ({
  AgentRunner: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn()
  }))
}));

vi.mock('../../../../core/agent/InMemoryAgentSession', () => ({
  InMemoryAgentSession: vi.fn().mockImplementation(() => ({
    addMessage: vi.fn(),
    getMessages: vi.fn()
  }))
}));

describe('UT-AgentSvc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('createAgent应创建有效的Agent实例', () => {
    // 准备
    const config = {
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: 'Test prompt'
    };
    
    // 执行
    const agent = createAgent(config);
    
    // 验证
    expect(llmFactory.createClient).toHaveBeenCalledWith(config.llm);
    expect(InMemoryAgentSession).toHaveBeenCalled();
    expect(AgentRunner).toHaveBeenCalledWith(config, expect.anything(), expect.anything());
    expect(agent).toHaveProperty('chat');
    expect(agent).toHaveProperty('chatStream');
  });
  
  test('normalizeChatInput应将字符串转换为ChatInput', () => {
    // 执行
    const result = normalizeChatInput('test message');
    
    // 验证
    expect(result).toEqual({
      content: {
        type: 'text',
        value: 'test message'
      }
    });
  });
  
  test('normalizeChatInput应保持ChatInput不变', () => {
    // 准备
    const input = {
      content: {
        type: 'text',
        value: 'test message'
      }
    };
    
    // 执行
    const result = normalizeChatInput(input);
    
    // 验证
    expect(result).toBe(input);
  });
});
```

### 6.3 集成测试实现示例

```typescript
// __tests__/integration/message-processing.integration.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createAgent } from '../../api/agent';
import { llmFactory } from '../../core/llm/llmFactory';
import { AgentConfig } from '../../types';

// 模拟LLM客户端
const mockSendMessages = vi.fn();
vi.mock('../../core/llm/llmFactory', () => ({
  llmFactory: {
    createClient: vi.fn().mockReturnValue({
      sendMessages: mockSendMessages
    })
  }
}));

describe('IT-Msg', () => {
  let agent;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 设置模拟返回值
    mockSendMessages.mockResolvedValue({
      content: {
        type: 'text',
        value: 'Mock response'
      }
    });
    
    // 创建测试Agent
    const config: AgentConfig = {
      llm: {
        apiType: 'mock',
        model: 'mock-model'
      },
      prompt: 'Test prompt'
    };
    
    agent = createAgent(config);
  });
  
  test('文本消息应被标准化为ChatInput并正确处理', async () => {
    // 执行
    await agent.chat('Test message');
    
    // 验证
    expect(mockSendMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.objectContaining({
            type: 'text',
            value: 'Test message'
          })
        })
      ]),
      false
    );
  });
  
  test('返回的LLM响应应提取文本内容', async () => {
    // 执行
    const response = await agent.chat('Test message');
    
    // 验证
    expect(response).toBe('Mock response');
  });
});
```

## 7. 测试夹具设计

### 7.1 通用测试夹具

**文件路径**: `__tests__/fixtures/agent.fixture.ts`

```typescript
import { AgentConfig, ChatInput, ChatOutput, Content, ContentItem, Message } from '../../types';

/**
 * 创建测试用AgentConfig
 */
export function createTestAgentConfig(overrides = {}): AgentConfig {
  return {
    llm: {
      apiType: 'mock',
      model: 'mock-model'
    },
    prompt: 'You are a helpful assistant',
    ...overrides
  };
}

/**
 * 创建测试用文本内容
 */
export function createTextContent(text: string): ContentItem {
  return {
    type: 'text',
    value: text
  };
}

/**
 * 创建测试用图像内容
 */
export function createImageContent(base64Image: string): ContentItem {
  return {
    type: 'image',
    value: new Uint8Array(Buffer.from(base64Image, 'base64')),
    mimeType: 'image/jpeg'
  };
}

/**
 * 创建测试用Message
 */
export function createTestMessage(role: 'system' | 'user' | 'assistant', content: Content): Message {
  return { role, content };
}

/**
 * 创建模拟LLM响应
 */
export function createMockLLMResponse(text: string): ChatOutput {
  return {
    content: {
      type: 'text',
      value: text
    }
  };
}
```

### 7.2 LLM模拟夹具

**文件路径**: `__tests__/fixtures/llm.fixture.ts`

```typescript
import { AsyncIterableSimulator } from './utils';
import { ChatOutput } from '../../types';

/**
 * 创建模拟的LLM同步响应
 */
export function mockLLMSyncResponse(text: string) {
  return {
    content: {
      type: 'text',
      value: text
    }
  };
}

/**
 * 创建模拟的LLM流式响应
 */
export function mockLLMStreamResponse(chunks: string[]): AsyncIterable<ChatOutput> {
  const outputChunks = chunks.map(chunk => ({
    content: {
      type: 'text',
      value: chunk
    }
  }));
  
  return new AsyncIterableSimulator<ChatOutput>(outputChunks);
}

/**
 * 创建模拟的LLM错误
 */
export function mockLLMError(message: string): Error {
  const error = new Error(message);
  error.name = 'LLMAPIError';
  return error;
}
```

## 8. 优先级和实施顺序

根据DPML测试策略，测试实施应按以下优先级顺序进行：

1. **契约测试**：确保API和类型定义稳定
2. **核心单元测试**：验证关键组件功能，如agentService, AgentRunner
3. **关键集成测试**：验证组件协作，如创建流程和消息处理流程
4. **端到端测试**：验证完整功能流程
5. **辅助单元测试**：验证其他支持组件，如错误处理、内容转换等
6. **边缘场景测试**：验证异常情况和边界条件

## 9. 结论

本文档详细设计了DPML Agent模块的测试用例，涵盖了契约测试、单元测试、集成测试和端到端测试。测试用例设计遵循DPML测试策略规则，确保全面验证Agent模块的功能和质量。

测试设计重点关注以下几个方面：
- API和类型的稳定性与一致性
- 核心组件的业务逻辑正确性
- 组件之间的协作和数据流
- 错误处理和边界条件处理
- 多模态内容处理能力
- 完整的用户交互流程

通过实施本文档中设计的测试用例，可以确保Agent模块的可靠性、稳定性和良好的用户体验。 