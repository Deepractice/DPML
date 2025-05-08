# DPML Agent MCP使用指南

## 1. 概述

DPML Agent MCP (Model-Client-Provider) 模块为DPML Agent提供了工具调用能力。通过MCP，大语言模型可以调用外部工具来执行特定操作，例如搜索信息、查询数据库、执行计算等。

MCP模块的主要特点：

- **无缝集成**：与现有Agent系统无缝集成，不影响核心功能
- **低侵入性**：对现有代码最小修改，通过增强现有LLMClient实现功能扩展
- **用户体验优先**：保持流式输出体验，同时支持工具调用
- **解耦设计**：工具调用逻辑与Agent核心逻辑分离
- **可扩展性**：支持多种工具类型和调用方式
- **类型安全**：提供完全类型化的API和结果

## 2. 安装和配置

### 2.1 安装

MCP模块已包含在DPML Agent包中，无需单独安装。如果你已经安装了DPML Agent，你可以直接使用MCP功能。

```bash
npm install @dpml/agent
```

或者使用pnpm：

```bash
pnpm add @dpml/agent
```

### 2.2 配置

要启用MCP功能，你需要注册MCP增强器并在Agent配置中启用它。

```typescript
import { createAgent } from '@dpml/agent';
import { registerMcp } from '@dpml/agent/api/mcp';
import type { AgentConfig, McpConfig } from '@dpml/agent';

// 注册MCP增强器
const mcpConfig: McpConfig = {
  name: 'default-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  }
};

// 注册MCP增强器
registerMcp(mcpConfig);

// 创建Agent配置，启用MCP
const agentConfig: AgentConfig = {
  llm: {
    apiType: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo'
  },
  prompt: '你是一个专业的AI助手，能够帮助用户查询信息和回答问题。',
  mcp: {
    enabled: true,
    name: 'default-mcp'  // 使用已注册的MCP增强器
  }
};

// 创建Agent实例
const agent = createAgent(agentConfig);
```

### 2.3 MCP服务器

MCP模块需要连接到MCP服务器才能工作。你可以选择使用标准HTTP服务器或者STDIO接口。

#### HTTP服务器配置

```typescript
const mcpConfig: McpConfig = {
  name: 'http-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'  // MCP服务器URL
  }
};
```

#### STDIO配置

```typescript
const mcpConfig: McpConfig = {
  name: 'stdio-mcp',
  enabled: true,
  type: 'stdio',
  stdio: {
    command: 'node',
    args: ['mcp-server.js']
  }
};
```

## 3. 基本使用

### 3.1 创建支持工具调用的Agent

```typescript
import { createAgent } from '@dpml/agent';
import { registerMcp } from '@dpml/agent/api/mcp';

// 注册MCP增强器
registerMcp({
  name: 'default-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  }
});

// 创建启用MCP的Agent
const agent = createAgent({
  llm: {
    apiType: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo'
  },
  mcp: {
    enabled: true,
    name: 'default-mcp'
  }
});

// 使用Agent回答问题（可能会调用工具）
const response = await agent.chat('北京今天的天气如何？');
console.log(response);
```

### 3.2 流式输出与工具调用

MCP模块支持在流式输出的同时进行工具调用，保持良好的用户体验：

```typescript
// 使用流式输出
console.log('AI助手正在回答：');
const stream = await agent.chatStream('上海和北京的距离是多少？');

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### 3.3 多轮对话和工具调用

```typescript
// 创建多轮对话
const conversation = agent.createConversation();

// 第一轮对话
await conversation.userSays('北京今天的天气如何？');
const response1 = await conversation.aiResponds();
console.log('AI:', response1);

// 第二轮对话，可能基于前面的工具调用结果
await conversation.userSays('那明天呢？');
const response2 = await conversation.aiResponds();
console.log('AI:', response2);
```

## 4. 高级功能

### 4.1 自定义工具调用格式

MCP模块默认支持标准的XML格式工具调用，例如：

```
<function_calls>
  <invoke name="weather">
    <parameter name="city">北京</parameter>
  </invoke>
</function_calls>
```

你可以根据需要自定义工具调用的格式：

```typescript
registerMcp({
  name: 'custom-format-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  },
  format: {
    startTag: '<tool>',
    endTag: '</tool>',
    toolNameTag: 'name',
    paramStartTag: 'params',
    paramEndTag: '/params'
  }
});
```

### 4.2 工具调用超时控制

为避免工具调用时间过长影响用户体验，你可以设置工具调用超时：

```typescript
registerMcp({
  name: 'timeout-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  },
  timeout: 5000  // 工具调用超时时间（毫秒）
});
```

### 4.3 并发工具调用

MCP模块支持并发执行多个工具调用，提高性能：

```typescript
registerMcp({
  name: 'concurrent-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  },
  concurrency: {
    enabled: true,
    maxConcurrent: 5  // 最大并发数
  }
});
```

### 4.4 递归深度控制

为防止无限递归，MCP模块限制了工具调用的递归深度：

```typescript
registerMcp({
  name: 'depth-controlled-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  },
  maxRecursionDepth: 6  // 最大递归深度
});
```

## 5. 错误处理

### 5.1 常见错误类型

MCP模块定义了一系列错误类型，帮助你识别和处理不同的错误：

```typescript
import { McpError, McpErrorType } from '@dpml/agent';

try {
  // 使用MCP功能
} catch (error) {
  if (error instanceof McpError) {
    switch (error.type) {
      case McpErrorType.TOOL_NOT_FOUND:
        console.error('工具未找到:', error.message);
        break;
      case McpErrorType.TOOL_EXECUTION_FAILED:
        console.error('工具执行失败:', error.message);
        break;
      case McpErrorType.CONNECTION_ERROR:
        console.error('连接错误:', error.message);
        break;
      case McpErrorType.TOOL_CALL_ERROR:
        console.error('工具调用错误:', error.message);
        break;
      default:
        console.error('未知MCP错误:', error.message);
    }
  } else {
    console.error('非MCP错误:', error);
  }
}
```

### 5.2 故障排除

当MCP功能不工作时，你可以检查以下几点：

1. **MCP增强器是否正确注册**：确保在使用Agent前已注册MCP增强器。
2. **MCP服务器是否可访问**：检查配置的URL是否正确，服务器是否在运行。
3. **LLM模型是否支持工具调用**：确保使用的LLM模型支持工具调用功能。
4. **工具调用格式是否正确**：检查MCP服务器端的工具调用格式是否与客户端匹配。
5. **超时设置是否合理**：工具执行时间是否超过了超时设置。

### 5.3 调试工具调用

要调试工具调用，你可以启用详细日志：

```typescript
registerMcp({
  name: 'debug-mcp',
  enabled: true,
  type: 'http',
  http: {
    url: 'http://localhost:3000/mcp'
  },
  debug: true  // 启用详细日志
});
```

## 6. 性能调优

### 6.1 优化工具执行性能

为了提高工具调用的性能，可以考虑以下几点：

1. **使用并发工具调用**：启用并发执行多个工具调用。
2. **优化工具实现**：确保工具实现高效，避免不必要的计算或IO操作。
3. **设置合理的超时时间**：避免某个工具执行时间过长影响整体体验。
4. **使用缓存**：对频繁使用的工具结果进行缓存，避免重复计算。

### 6.2 流式输出优化

对于流式输出，可以考虑以下优化：

1. **减少块大小**：较小的输出块可以提供更流畅的用户体验。
2. **优先输出重要信息**：确保重要信息优先输出，提高用户体验。
3. **工具调用与流式输出并行**：在后台执行工具调用，不阻塞流式输出。

### 6.3 内存使用优化

对于长时间运行的应用，需要注意内存使用：

1. **控制递归深度**：避免过深的递归导致内存占用过高。
2. **清理不再需要的数据**：及时释放不再需要的资源。
3. **避免保留大量历史数据**：仅保留必要的对话历史。

## 7. 最佳实践

### 7.1 工具设计原则

设计高效的工具时，请考虑以下原则：

1. **单一职责**：每个工具应只做一件事，并做好这件事。
2. **明确参数**：工具参数应该明确、类型安全，并有清晰的文档。
3. **有意义的结果**：工具返回的结果应该有意义，便于LLM理解和使用。
4. **错误处理**：工具应能优雅地处理错误，并返回有用的错误信息。

### 7.2 安全考虑

使用MCP功能时，需要注意安全性：

1. **输入验证**：对工具参数进行严格验证，防止注入攻击。
2. **权限控制**：限制工具的访问权限，只授予必要的权限。
3. **敏感数据处理**：避免在工具调用中传输敏感数据。
4. **请求限制**：实施请求限制，防止过多请求导致服务不稳定。

### 7.3 用户体验设计

为提供良好的用户体验，请考虑：

1. **状态指示**：明确告知用户当前状态，例如"正在查询数据"。
2. **等待时反馈**：在等待工具执行时提供适当的反馈。
3. **错误友好性**：对用户友好地展示错误，避免技术术语。
4. **平滑过渡**：在流式输出和工具调用之间实现平滑过渡。

## 8. 示例和用例

### 8.1 搜索工具示例

```typescript
// MCP服务器端工具实现
const searchTool = {
  name: 'search',
  description: '搜索互联网获取信息',
  parameters: {
    query: { type: 'string', description: '搜索查询' }
  },
  execute: async (params) => {
    const { query } = params;
    // 实现搜索逻辑
    const results = await searchEngine.search(query);
    return { results };
  }
};
```

### 8.2 数据库查询工具

```typescript
// MCP服务器端工具实现
const databaseTool = {
  name: 'database',
  description: '查询数据库',
  parameters: {
    sql: { type: 'string', description: 'SQL查询' }
  },
  execute: async (params) => {
    const { sql } = params;
    // 实现数据库查询逻辑
    const results = await database.query(sql);
    return { results };
  }
};
```

### 8.3 复杂工作流示例

```typescript
// 创建支持工具调用的Agent
const agent = createAgent({
  llm: {
    apiType: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo'
  },
  mcp: {
    enabled: true,
    name: 'default-mcp'
  }
});

// 复杂工作流示例
async function complexWorkflow() {
  const conversation = agent.createConversation();
  
  // 初始查询
  await conversation.userSays('分析近期北京和上海的天气趋势对比');
  
  // AI会使用工具获取天气数据，然后生成分析
  const analysis = await conversation.aiResponds();
  console.log('天气分析:', analysis);
  
  // 跟进问题
  await conversation.userSays('基于上述天气趋势，推荐适合的旅行计划');
  
  // AI会结合前面的天气分析，可能会使用其他工具来获取旅行建议
  const travelPlan = await conversation.aiResponds();
  console.log('旅行计划:', travelPlan);
  
  // 进一步细化
  await conversation.userSays('我想去北京，帮我查一下近期的机票价格');
  
  // AI会使用工具查询机票价格
  const tickets = await conversation.aiResponds();
  console.log('机票信息:', tickets);
}

complexWorkflow().catch(console.error);
```

## 9. 与官方SDK集成

DPML Agent MCP模块支持与官方ModelContextProtocol SDK集成：

```typescript
import { createMCPClient } from '@dp/mcp-sdk';
import { registerMcp } from '@dpml/agent/api/mcp';

// 创建并配置SDK客户端
const mcpClient = createMCPClient({
  apiKey: 'your-api-key',
  endpoint: 'https://api.example.com/mcp'
});

// 连接SDK客户端
await mcpClient.connect();

// 注册MCP增强器
registerMcp({
  name: 'sdk-mcp',
  enabled: true,
  type: 'sdk',
  sdk: {
    client: mcpClient
  }
});

// 创建Agent
const agent = createAgent({
  llm: {
    apiType: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo'
  },
  mcp: {
    enabled: true,
    name: 'sdk-mcp'
  }
});
```

## 10. 总结

DPML Agent MCP模块为Agent提供了强大的工具调用能力，使大语言模型能够与外部世界交互。通过简单的配置，你可以为你的Agent添加搜索、计算、数据查询等能力，创建更强大、更实用的AI应用。

关键优势：
- 灵活的配置选项
- 流式输出与工具调用的无缝结合
- 强大的错误处理
- 性能优化选项
- 与现有系统的低侵入性集成

无论是简单的问答应用还是复杂的工作流自动化，MCP模块都能帮助你充分发挥大语言模型的潜力。 