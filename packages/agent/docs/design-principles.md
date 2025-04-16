# DPML Agent 设计原则

## 概述

DPML Agent 包作为DPML生态系统的关键组件，提供了基于LLM的智能代理定义、运行和管理框架。本文档阐述了@dpml/agent包的核心设计原则，为开发和使用提供指导。

## 1. 领域边界清晰

Agent包专注于代理定义和运行时环境，与其他领域保持明确边界。

### 1.1 职责范围

- **专注于代理生命周期**：定义、初始化、执行、暂停和终止
- **不涉及提示词生成细节**：依赖@dpml/prompt处理提示词
- **不处理多代理协作**：留给@dpml/workflow包实现

### 1.2 自包含设计

```typescript
// 完整的代理运行示例
import { createAgent } from '@dpml/agent';

// 独立运行，不依赖外部协调
const agent = await createAgent('./agent-definition.dpml');
const result = await agent.run({ input: userQuery });
```

### 1.3 接口清晰

- 提供明确的公共API和类型定义
- 设计可组合的接口而非单体系统
- 保持扩展性但不暴露内部实现细节

## 2. 声明式定义

采用DPML标记语言进行代理定义，实现配置与实现分离。

### 2.1 基于DPML的代理定义

```xml
<agent id="research-assistant">
  <llm
    api-type="openai"
    api-url="https://api.openai.com/v1"
    model="gpt-4-turbo"
    key-env="OPENAI_API_KEY"
  />

  <prompt>
    你是一位专业的研究助手，擅长查找和分析信息。
  </prompt>
  <capabilities>
    <tool name="web-search" />
    <tool name="file-reader" />
  </capabilities>
  <memory>
    <short-term capacity="10" />
    <long-term storage="vector-db" />
  </memory>
</agent>
```

### 2.2 结构与内容分离

- 结构通过XML标签和属性定义
- 内容使用Markdown格式
- 属性设置配置参数，内容描述行为和语义

### 2.3 标签语义

每个标签有明确的语义和处理逻辑：

- `<agent>` - 代理定义的根标签
- `<llm>` - 语言模型配置，定义与LLM的连接方式
- `<prompt>` - 系统提示词，定义代理的角色和行为指南
- `<capabilities>` - 声明代理可用工具和能力
- `<memory>` - 定义记忆系统配置

## 3. 状态与行为分离

采用清晰的状态管理模式，实现状态和行为逻辑解耦。

### 3.1 显式状态模型

```typescript
interface AgentState {
  // 基础状态
  id: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'done';

  // 运行时状态
  currentTask?: Task;
  memory: MemoryState;

  // 上下文状态
  conversation: Message[];
  metadata: Record<string, any>;
}
```

### 3.2 状态转换与副作用分离

```typescript
// 状态转换函数 - 纯函数，无副作用
function reduceState(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'TASK_STARTED':
      return { ...state, status: 'executing', currentTask: action.payload };
    // 其他状态转换...
  }
}

// 副作用处理 - 单独的副作用系统
const effects = {
  TASK_STARTED: async (action, state, dispatch) => {
    // 处理副作用，如日志记录、外部API调用等
  },
};
```

### 3.3 事件驱动设计

- 关键状态变更发出事件
- 组件通过事件通信而非直接调用
- 支持异步和非阻塞处理

```typescript
agent.on('thinking:start', context => {
  console.log('Agent开始思考');
});

agent.on('tool:called', (tool, params) => {
  console.log(`使用工具: ${tool}`, params);
});
```

## 4. 模块化能力系统

代理能力以插件形式提供，支持灵活组装和扩展。

### 4.1 能力即插件

```typescript
// 定义搜索工具
const searchTool = createTool({
  name: 'web-search',
  description: '搜索互联网获取信息',
  parameters: {
    query: { type: 'string', description: '搜索查询' },
  },
  execute: async params => {
    // 实现搜索逻辑
    return searchResults;
  },
});

// 注册工具
agent.registerCapability(searchTool);
```

### 4.2 统一能力接口

所有能力类型遵循相同的基础接口：

```typescript
interface Capability {
  type: string; // 能力类型标识
  name: string; // 能力名称
  description: string; // 能力描述
  metadata?: any; // 能力元数据

  // 能力调用方法
  invoke(params: any, context: CapabilityContext): Promise<any>;
}
```

### 4.3 能力分类

- **工具(Tools)** - 执行特定任务的功能，如搜索、计算
- **知识源(Knowledge)** - 提供信息的来源，如文档库、API
- **技能(Skills)** - 复杂行为模式，如推理、规划
- **感知器(Sensors)** - 环境感知能力，如时间、位置

## 5. 记忆管理原则

分层记忆模型，支持语义检索和记忆压缩。

### 5.1 分层记忆架构

```typescript
interface MemorySystem {
  // 短期记忆 - 最近交互和上下文
  shortTerm: {
    add(item: MemoryItem): void;
    getRecent(count: number): MemoryItem[];
  };

  // 工作记忆 - 当前任务相关
  working: {
    set(key: string, value: any): void;
    get(key: string): any;
  };

  // 长期记忆 - 持久化存储
  longTerm: {
    add(item: MemoryItem): void;
    search(query: string, limit?: number): Promise<MemoryItem[]>;
  };
}
```

### 5.2 记忆项标准化

```typescript
interface MemoryItem {
  id: string; // 唯一标识
  type: MemoryItemType; // 类型，如'message', 'fact', 'reflection'
  content: string; // 内容
  metadata: {
    timestamp: number; // 创建时间
    source: string; // 来源
    importance?: number; // 重要性评分
    tags?: string[]; // 标签
  };
}
```

### 5.3 记忆检索与压缩

- 语义相似度搜索优先于时间顺序
- 自动记忆总结和抽象
- 重要性评分机制，过滤非关键信息

```typescript
// 基于查询检索相关记忆
const relevantMemories = await agent.memory.longTerm.search(
  '关于用户偏好的信息',
  5 // 返回最相关的5条
);

// 记忆压缩
await agent.memory.compress({
  strategy: 'summarize',
  target: 'conversation',
  threshold: 10, // 当超过10条对话时压缩
});
```

## 6. LLM交互抽象

提供统一的LLM交互接口，支持不同模型和提供商。

### 6.1 模型无关设计

```typescript
// 创建代理时指定模型
const agent = await createAgent('./definition.dpml', {
  llm: {
    apiType: 'openai',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    keyEnv: 'OPENAI_API_KEY',
    temperature: 0.7,
  },
});

// 动态切换模型
await agent.setModel({
  apiType: 'anthropic',
  apiUrl: 'https://api.anthropic.com',
  model: 'claude-3',
  keyEnv: 'ANTHROPIC_API_KEY',
});
```

### 6.2 统一调用接口

```typescript
interface LLMConnector {
  // 核心方法
  complete(options: CompletionOptions): Promise<CompletionResult>;
  completeStream(options: CompletionOptions): AsyncIterable<CompletionChunk>;

  // 辅助方法
  tokenize(text: string): Promise<number>; // 计算token
  embed(text: string): Promise<number[]>; // 生成嵌入
}
```

### 6.3 流式处理支持

```typescript
// 流式输出处理
for await (const chunk of agent.runStream({ input })) {
  if (chunk.type === 'thinking') {
    console.log('思考中:', chunk.content);
  } else if (chunk.type === 'output') {
    console.log('输出:', chunk.content);
  }
}
```

## 7. 可观察性设计

全面的事件系统和日志机制，便于监控和调试。

### 7.1 标准化事件

```typescript
// 代理生命周期事件
agent.on('init', () => {}); // 初始化
agent.on('start', () => {}); // 开始执行
agent.on('pause', () => {}); // 暂停
agent.on('resume', () => {}); // 恢复
agent.on('stop', () => {}); // 停止
agent.on('error', err => {}); // 错误

// 处理阶段事件
agent.on('thinking:start', () => {}); // 开始思考
agent.on('thinking:complete', () => {}); // 思考完成
agent.on('tool:calling', tool => {}); // 调用工具前
agent.on('tool:result', result => {}); // 工具调用结果
```

### 7.2 结构化日志

```typescript
// 内部使用统一的日志接口
interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
}

// 可配置的日志级别和目标
const agent = await createAgent('./definition.dpml', {
  logger: {
    level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
    targets: ['console', 'file:./agent.log'],
  },
});
```

### 7.3 性能指标

自动收集关键性能指标：

- 响应时间
- 令牌使用量
- 工具调用频率和耗时
- 记忆检索效率

## 8. 错误处理策略

健壮的错误处理机制，支持优雅降级和自恢复。

### 8.1 错误分类

```typescript
// 错误类型
enum AgentErrorType {
  // 致命错误
  INITIALIZATION_ERROR, // 初始化失败
  INVALID_DEFINITION, // 定义无效

  // 非致命错误
  TOOL_EXECUTION_ERROR, // 工具执行失败
  LLM_UNAVAILABLE, // LLM服务不可用
  MEMORY_RETRIEVAL_ERROR, // 记忆检索失败
}
```

### 8.2 优雅降级

```typescript
// 能力降级策略
const agent = await createAgent('./definition.dpml', {
  fallbacks: {
    // 工具失败时的降级策略
    tools: {
      'web-search': {
        fallbackTool: 'local-search',
        maxRetries: 3,
      },
    },
    // LLM失败时的降级策略
    llm: [
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'openai', model: 'gpt-3.5-turbo' },
      { provider: 'anthropic', model: 'claude-3' },
    ],
  },
});
```

### 8.3 自恢复机制

- 自动重试逻辑（带指数退避）
- 状态回滚能力
- 断点恢复支持

```typescript
// 配置重试策略
const agent = await createAgent('./definition.dpml', {
  retry: {
    maxAttempts: 3,
    backoff: 'exponential', // 'fixed' | 'linear' | 'exponential'
    initialDelay: 1000, // ms
  },
});

// 保存和恢复状态
const snapshot = await agent.saveState();
await agent.loadState(snapshot);
```

## 9. 安全设计原则

强调安全性，保护系统和用户。

### 9.1 能力沙箱

- 限制工具的执行环境和权限
- 资源使用限制（如API调用频率、计算资源）
- 禁止危险操作（如直接执行代码）

```typescript
// 工具安全配置
const fileTool = createTool({
  name: 'file-reader',
  // 安全配置
  security: {
    allowedPaths: ['./data'], // 允许访问的路径
    disallowedOperations: ['write', 'delete'], // 禁止的操作
    maxFileSize: 5 * 1024 * 1024, // 最大文件大小
  },
  execute: async params => {
    // 实现逻辑
  },
});
```

### 9.2 输入验证和净化

- 所有外部输入强制验证
- 敏感信息过滤
- 防注入措施

```typescript
// 输入验证中间件
agent.use(
  inputValidator({
    sanitize: true, // 净化输入
    maxLength: 4000, // 最大输入长度
    blockPatterns: [/exec\(/, /eval\(/], // 阻止的模式
  })
);
```

### 9.3 审计日志

- 记录所有关键操作
- 保存决策依据
- 支持事后分析

```typescript
// 启用审计日志
const agent = await createAgent('./definition.dpml', {
  audit: {
    enabled: true,
    storageType: 'file', // 'file' | 'database'
    path: './audit-logs/',
    includeSensitive: false, // 是否包含敏感信息
  },
});

// 查询审计日志
const logs = await agent.getAuditLogs({
  from: new Date('2023-01-01'),
  to: new Date(),
  types: ['tool:execution', 'llm:completion'],
});
```

## 10. 开发友好性

优先考虑开发者体验，降低使用门槛。

### 10.1 渐进式API

```typescript
// 简单用例 - 一行代码启动
const result = await runAgent('./simple-agent.dpml', { input });

// 中等复杂度 - 基本配置
const agent = await createAgent('./agent.dpml', {
  llm: { provider: 'openai', model: 'gpt-4' },
  tools: [searchTool, calculatorTool],
});
const result = await agent.run({ input });

// 高级用例 - 完全控制
const agent = new Agent('./complex-agent.dpml');
await agent.initialize();
agent.use(customMiddleware);
agent.on('thinking', handleThinking);
// ... 更多自定义配置
const session = agent.createSession();
const result = await session.execute({ input });
```

### 10.2 自文档化

- 完善的TypeScript类型定义
- 丰富的JSDoc注释
- 智能IDE提示

````typescript
/**
 * 创建代理实例
 *
 * @param definition - 代理定义文件路径或定义内容
 * @param options - 代理选项
 * @returns 初始化的代理实例
 * @throws {AgentInitError} 初始化失败时抛出
 *
 * @example
 * ```
 * const agent = await createAgent('./assistant.dpml', {
 *   llm: { provider: 'openai', model: 'gpt-4' }
 * });
 * ```
 */
export async function createAgent(
  definition: string,
  options?: AgentOptions
): Promise<Agent> {
  // 实现...
}
````

### 10.3 调试支持

- 详细的开发模式日志
- 内置调试视图
- 状态检查工具

```typescript
// 启用调试模式
const agent = await createAgent('./definition.dpml', {
  debug: true,
});

// 检查当前状态
const state = agent.getDebugInfo();
console.log(state.memory.stats);
console.log(state.lastProcessedSteps);

// 使用内置的调试UI（在浏览器环境）
agent.openDebugUI(); // 打开调试界面
```

## 11. 扩展性机制

提供多种扩展点，支持自定义和第三方扩展。

### 11.1 中间件系统

```typescript
// 中间件接口
interface Middleware {
  (context: Context, next: () => Promise<void>): Promise<void>;
}

// 使用中间件
agent.use(async (ctx, next) => {
  console.log('处理前:', ctx.input);
  await next(); // 调用下一个中间件
  console.log('处理后:', ctx.output);
});
```

### 11.2 生命周期钩子

```typescript
// 钩子系统
agent.hook('beforeThinking', async context => {
  // 在思考前执行
  context.addContext('当前时间是: ' + new Date().toLocaleString());
});

agent.hook('afterToolExecution', async (context, result) => {
  // 工具执行后处理
  if (result.error) {
    context.addNote('工具执行失败，需要替代方案');
  }
});
```

### 11.3 插件系统

```typescript
// 插件接口
interface AgentPlugin {
  name: string;
  version: string;
  init(agent: Agent): void;
  // 其他方法...
}

// 注册插件
const vectorMemoryPlugin: AgentPlugin = {
  name: 'vector-memory',
  version: '1.0.0',
  init(agent) {
    // 注册自定义记忆系统
    agent.memory.registerStoreType('vector', createVectorStore);
  },
};

agent.registerPlugin(vectorMemoryPlugin);
```

## 12. 标签与属性极简主义

遵循"少即是多"的设计哲学，确保标签和属性的定义保持最小必要集。

### 12.1 属性精简原则

- 只定义必要的核心属性，避免过度设计
- 优先使用@dpml/core提供的通用属性（如id, version, extends）
- 除非有强烈语义需求，否则不添加额外特有属性
- 命名追求简洁明了（如`key-env`而非`auth-key-env`）

### 12.2 属性与子标签选择

在表达复杂配置时，优先选择子标签而非增加属性：

```xml
<!-- 不推荐：使用多个特定属性 -->
<llm auth-type="oauth" client-id-env="CLIENT_ID" token-url="..." />

<!-- 推荐：使用子标签结构化复杂配置 -->
<llm>
  <auth type="oauth">
    <client-id-env>CLIENT_ID</client-id-env>
    <token-url>...</token-url>
  </auth>
</llm>
```

## 13. 组件化与集成模式

### 13.1 Agent作为组件

Agent设计为可以独立使用，也可以作为更大系统的组件：

- 作为独立系统时，直接处理用户请求和生成响应
- 作为工作流组件时，负责特定任务，与其他组件协作

```typescript
// 在workflow中使用agent
const workflow = createWorkflow('./research-workflow.dpml');
// workflow中包含多个agent定义，各自负责不同环节
await workflow.execute({ query: 'research topic' });
```

### 13.2 顶层与嵌套使用

Agent可以在不同上下文中使用：

```xml
<!-- 顶层使用 -->
<agent id="standalone">...</agent>

<!-- 作为workflow的组件 -->
<workflow id="research-process">
  <step id="initial-research">
    <agent id="researcher">...</agent>
  </step>
  <step id="analysis">
    <agent id="analyst">...</agent>
  </step>
</workflow>
```

## 14. 统一基础设施原则

优先使用@dpml/core提供的基础设施，确保跨包统一性：

### 14.1 继承机制统一

所有标签使用统一的继承机制：

```xml
<!-- 使用core提供的统一extends属性 -->
<agent id="specialized" extends="./base-agent.dpml">
  <!-- 覆盖或增强基础定义 -->
</agent>

<prompt extends="./templates/base-prompt.dpml#assistant">
  <!-- 继承并定制提示词 -->
</prompt>
```

### 14.2 避免重复发明

- 不为各包创建平行机制（如自定义的引用系统）
- 复用核心验证、解析和处理逻辑
- 确保用户学习成本最小化，操作一致性最大化

## 15. 渐进式复杂度设计

每个组件既是一个默认实现，又是更复杂系统的入口点，实现"低地板，高天花板"的设计理念。

### 15.1 框架+默认实现+扩展入口

为每个核心功能提供三个层次的实现路径：

1. **默认简单实现**：开箱即用的基础功能
2. **配置扩展**：通过配置调整行为
3. **系统集成点**：作为与复杂外部系统集成的接口

```xml
<!-- 三种使用层次示例 -->

<!-- 1. 简单默认实现 -->
<llm model="gpt-4" key-env="OPENAI_KEY" />

<!-- 2. 配置扩展 -->
<llm model="gpt-4" key-env="OPENAI_KEY">
  <parameters temperature="0.7" top-p="0.95" />
</llm>

<!-- 3. 系统集成点 -->
<llm type="router" endpoint="http://llm-router.internal:8080">
  <auth type="service-token" token-env="ROUTER_TOKEN" />
  <fallback model="gpt-3.5-turbo" />
</llm>
```

### 15.2 占位符与集成设计

每个核心标签设计为功能领域的占位符，可以平滑过渡到更复杂实现：

- **`<llm>`**：从简单API调用到完整的模型路由、负载均衡系统
- **`<memory>`**：从基础会话存储到复杂的向量数据库和语义检索系统
- **`<tools>`**：从内置工具到企业API网关或工具编排系统

### 15.3 面向终端用户优先

在开发初期阶段：

- 专注于提供良好的直接用户体验，而非开发者API
- 简单场景优先实现，避免过早构建完整插件系统
- 预留扩展点但不急于实现完整的插件注册和管理机制

这种设计使系统能够随着用户需求的增长而平滑扩展，而不是一开始就强加复杂性。

## 总结

@dpml/agent包的设计原则体现了清晰的职责边界、声明式定义、状态管理、模块化能力、记忆管理、LLM抽象、可观察性、错误处理、安全设计和开发友好性等核心理念。新增的极简主义、组件化集成、统一基础设施原则以及渐进式复杂度设计进一步强化了这一设计。这些原则共同确保了代理系统的可靠性、可扩展性和易用性，为构建智能代理应用提供了坚实基础。

## 16. 以标签语言为中心的生态扩展

DPML的核心价值在于其声明式标签语言，它是连接终端用户和底层技术的桥梁。未来扩展应优先考虑标签语言层面的增强，而技术实现则遵循分层职责。

### 16.1 多维度扩展策略

DPML生态系统按不同维度设计扩展策略：

1. **面向终端用户**：通过标签语言扩展

   - 新增标签和属性扩展功能
   - 保持声明式语法的一致性和直观性
   - 降低使用门槛，无需理解底层实现

2. **面向开发者的插件化**：利用接口与实现分离

   - 依赖@dpml/core提供的扩展基础设施
   - 遵循标准接口，替换默认实现
   - 基于接口开发特定领域功能

3. **面向集成的钩子系统**：提供观察和干预点
   - 在代理生命周期关键点提供钩子
   - 允许在不修改核心代码的情况下注入逻辑
   - 支持监控、日志、安全等横切关注点

### 16.2 生态系统分工模式

```
+----------------+    +----------------+    +----------------+
|   @dpml/core   |    |  @dpml/agent   |    | 社区扩展/实现   |
+----------------+    +----------------+    +----------------+
| • 基础标签系统   |    | • 通用代理实现   |    | • 领域特定实现  |
| • 文档模型      |    | • 基础功能集成   |    | • 专业化标签     |
| • 解析处理框架   |    | • 最常用场景     |    | • 复杂系统集成   |
| • 转换器基础设施 |    | • 参考实现       |    | • 垂直领域解决方案|
+----------------+    +----------------+    +----------------+
         ↑                   ↑                     ↑
         |                   |                     |
         +-------------------+---------------------+
                           建立在
                 +------------------------+
                 |     DPML标签语言       |
                 +------------------------+
```

### 16.3 标签语言为王

面向终端用户的扩展应始终保持标签语言的简洁性和一致性：

```xml
<!-- 未来可能的扩展示例 -->
<agent id="advanced-assistant">
  <!-- 记忆系统扩展 -->
  <memory type="vector-store" connection="...">
    <index dimensions="1536" metric="cosine" />
    <retrieval strategy="semantic" top-k="5" />
  </memory>

  <!-- 工具系统扩展 -->
  <tools>
    <tool name="web-search" api-key-env="SEARCH_API_KEY" />
    <tool name="code-interpreter" sandbox="isolated" />
  </tools>

  <!-- 安全扩展 -->
  <security>
    <content-filter level="strict" />
    <rate-limiting max-tokens-per-hour="100000" />
  </security>

  <prompt>...</prompt>
</agent>
```

### 16.4 社区驱动的专业化

@dpml/agent提供普适的基础实现，而专业化功能由社区开发：

- **Core提供框架**：标签系统、解析、处理和转换基础设施
- **Agent提供通用实现**：覆盖80%的常见使用场景
- **社区提供专业实现**：特定领域、高级功能、企业级集成

这种模式符合成功开源项目的模式：简单核心，丰富生态。用户可以从简单使用开始，随着需求增长逐步采用更专业的社区扩展。

### 16.5 设计局限性的平衡

理解架构设计中的不可能三角，做出明智的取舍：

- **简单性 vs 灵活性 vs 性能**：优先简单性和灵活性
- **一致性 vs 自主性 vs 开发速度**：保持标签语言一致性
- **通用性 vs 专用性 vs 易用性**：核心包保持通用，专用功能交由社区

这些取舍不是设计缺陷，而是有意识的架构选择，明确了DPML Agent的定位和适用场景。

### 16.6 未来发展路线

1. **核心标签扩展**：逐步添加新标签支持更多功能
2. **插件注册机制**：为社区扩展提供标准化接入点
3. **标签库生态**：鼓励开发可共享的标签库和模板
4. **垂直领域解决方案**：支持特定领域（医疗、法律、教育等）的专业扩展

以标签语言为中心的扩展策略确保了DPML生态系统的长期健康发展，既保持了对终端用户的友好性，又为开发者提供了充分的扩展空间。
