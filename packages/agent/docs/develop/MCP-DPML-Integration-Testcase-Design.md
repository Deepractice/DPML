# MCP-DPML集成测试用例设计

## 1. 测试范围分析

基于对MCP-Requirements.md文档的分析，本测试用例设计文档针对MCP-DPML集成模块定义全面的测试策略和具体测试用例。MCP-DPML集成作为Agent模块的扩展组件，主要职责是实现Model Context Protocol (MCP)与DPML声明式语法的无缝集成，让用户能够通过XML配置文件定义MCP服务器并与Agent连接，创建具备工具调用能力的AI助手。

### 1.1 模块架构概览

MCP-DPML集成模块遵循项目的分层架构，并在以下层次添加了新组件：

- **配置层**：扩展Schema定义，实现MCP服务器配置的解析
- **转换层**：将DPML中的MCP配置转换为McpConfig对象
- **集成层**：在AgentRunner中自动加载和注册MCP服务器
- **运行时层**：通过MCPEnhancer增强LLM客户端

### 1.2 核心功能组件

测试需覆盖以下核心功能组件：

- **Schema扩展**：扩展Agent配置Schema，支持MCP服务器配置
- **XML解析**：解析DPML中的MCP服务器配置
- **传输类型推断**：根据配置属性自动推断传输类型
- **服务器连接**：在Agent初始化时连接MCP服务器
- **工具调用**：通过MCP增强的LLM客户端进行工具调用

## 2. 测试类型规划

根据DPML测试策略规则，为MCP-DPML集成模块设计以下类型的测试：

| 测试类型 | 目录 | 测试重点 | 文件命名模式 |
|--------|------|---------|------------|
| 契约测试 | `/packages/agent/src/__tests__/contract/` | Schema和MCP接口 | `*.contract.test.ts` |
| 集成测试 | `/packages/agent/src/__tests__/integration/` | 组件间协作 | `*.integration.test.ts` |
| 端到端测试 | `/packages/agent/src/__tests__/e2e/` | 完整功能流程 | `*.e2e.test.ts` |

## 3. 测试用例设计

### 3.1 契约测试用例

契约测试确保Schema扩展和MCP接口的稳定性和一致性。

#### 3.1.1 Schema契约测试

**文件路径**: `/packages/agent/src/__tests__/contract/mcp/schema.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-MCP-Schema-01 | Schema应定义mcp-servers元素 | 验证MCP服务器容器元素 | 无 | types包含'mcp-servers'元素定义 | 无需模拟 |
| CT-MCP-Schema-02 | Schema应定义mcp-server元素 | 验证单个MCP服务器元素 | 无 | types包含'mcp-server'元素定义 | 无需模拟 |
| CT-MCP-Schema-03 | mcp-server应有name必填属性 | 验证必填属性 | 无 | 'mcp-server'类型有name必填属性 | 无需模拟 |
| CT-MCP-Schema-04 | mcp-server应有type可选属性 | 验证可选属性 | 无 | 'mcp-server'类型有type可选属性 | 无需模拟 |
| CT-MCP-Schema-05 | mcp-server应支持url属性 | 验证HTTP传输属性 | 无 | 'mcp-server'类型有url属性 | 无需模拟 |
| CT-MCP-Schema-06 | mcp-server应支持command属性 | 验证stdio传输属性 | 无 | 'mcp-server'类型有command属性 | 无需模拟 |
| CT-MCP-Schema-07 | mcp-server应支持args属性 | 验证args属性 | 无 | 'mcp-server'类型有args属性 | 无需模拟 |
| CT-MCP-Schema-08 | mcp-server应支持enabled属性 | 验证enabled属性 | 无 | 'mcp-server'类型有enabled属性 | 无需模拟 |

#### 3.1.2 MCP转换器契约测试

**文件路径**: `/packages/agent/src/__tests__/contract/mcp/transformers.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-MCP-Trans-01 | mcpTransformer应实现Transformer接口 | 验证转换器接口 | 无 | 转换器符合Transformer接口 | 无需模拟 |
| CT-MCP-Trans-02 | mcpTransformer应定义正确的名称 | 验证转换器名称 | 无 | name为'mcpTransformer' | 无需模拟 |
| CT-MCP-Trans-03 | mcpTransformer应定义正确的选择器 | 验证转换规则 | 无 | 包含'agent > mcp-servers > mcp-server'选择器 | 无需模拟 |
| CT-MCP-Trans-04 | transformers导出应包含MCP转换器 | 验证导出内容 | 无 | 数组包含mcpTransformer | 无需模拟 |

#### 3.1.3 McpConfig契约测试

**文件路径**: `/packages/agent/src/__tests__/contract/mcp/mcpConfig.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-MCP-Config-01 | McpConfig接口应定义所有必要属性 | 验证接口完整性 | 无 | 接口包含name、type、enabled等属性 | 无需模拟 |
| CT-MCP-Config-02 | McpServerType应定义HTTP和stdio类型 | 验证类型定义 | 无 | 枚举包含'http'和'stdio'值 | 无需模拟 |
| CT-MCP-Config-03 | inferMcpServerType函数应正确推断类型 | 验证类型推断逻辑 | 有url无command的配置 | 返回'http'类型 | 无需模拟 |
| CT-MCP-Config-04 | inferMcpServerType函数应优先处理命令 | 验证推断优先级 | 同时有url和command的配置 | 返回'stdio'类型 | 无需模拟 |

### 3.2 集成测试用例

集成测试验证各组件之间的协作和数据流。

#### 3.2.1 Schema和转换器集成测试

**文件路径**: `/packages/agent/src/__tests__/integration/mcp/schema-transformer.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-MCP-ST-01 | 应能解析HTTP类型的MCP配置 | 验证HTTP配置解析 | 包含HTTP MCP配置的XML | 正确创建HTTP McpConfig | 模拟DPMLCore |
| IT-MCP-ST-02 | 应能解析stdio类型的MCP配置 | 验证stdio配置解析 | 包含stdio MCP配置的XML | 正确创建stdio McpConfig | 模拟DPMLCore |
| IT-MCP-ST-03 | 应能从args属性解析命令参数 | 验证args解析 | 包含args的MCP配置XML | 正确解析为字符串数组 | 模拟DPMLCore |
| IT-MCP-ST-04 | 应能自动推断缺少type的配置 | 验证类型推断 | 无type属性的MCP配置 | 根据其他属性推断类型 | 模拟DPMLCore |
| IT-MCP-ST-05 | enabled属性应默认为true | 验证默认值 | 无enabled属性的配置 | enabled为true | 模拟DPMLCore |
| IT-MCP-ST-06 | 应正确处理多个MCP服务器配置 | 验证多服务器支持 | 多个mcp-server元素 | 创建多个McpConfig对象 | 模拟DPMLCore |

#### 3.2.2 AgentRunner集成测试

**文件路径**: `/packages/agent/src/__tests__/integration/mcp/agentRunner.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-MCP-AR-01 | AgentRunner应在初始化时连接MCP服务器 | 验证连接流程 | 包含MCP配置的AgentConfig | 调用MCPService.connect方法 | 模拟MCPService |
| IT-MCP-AR-02 | AgentRunner应正确注册MCP增强器 | 验证增强器注册 | 包含MCP配置的AgentConfig | 调用MCPService.registerEnhancer方法 | 模拟MCPService |
| IT-MCP-AR-03 | 只有enabled为true的MCP服务器应被连接 | 验证启用/禁用逻辑 | enabled为false的配置 | 不调用相应的连接方法 | 模拟MCPService |
| IT-MCP-AR-04 | AgentRunner应能处理MCP连接错误 | 验证错误处理 | 导致连接失败的配置 | 记录错误但不中断流程 | 模拟MCPService抛出错误 |
| IT-MCP-AR-05 | 应能正确连接多个MCP服务器 | 验证多服务器支持 | 多个MCP配置 | 为每个配置调用连接方法 | 模拟MCPService |

#### 3.2.3 MCPService集成测试

**文件路径**: `/packages/agent/src/__tests__/integration/mcp/mcpService.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-MCP-SVC-01 | MCPService应能连接HTTP类型服务器 | 验证HTTP连接 | HTTP类型McpConfig | 创建HTTP传输实例 | 模拟HTTP传输 |
| IT-MCP-SVC-02 | MCPService应能连接stdio类型服务器 | 验证stdio连接 | stdio类型McpConfig | 创建stdio传输实例 | 模拟stdio传输 |
| IT-MCP-SVC-03 | MCPService应正确解析命令行参数 | 验证参数处理 | 带args的stdio配置 | 正确传递参数给传输构造器 | 模拟stdio传输 |
| IT-MCP-SVC-04 | MCPService应能增强LLMClient | 验证客户端增强 | LLMClient实例 | 返回增强的客户端 | 模拟LLMClient和MCP |
| IT-MCP-SVC-05 | 应能正确捕获和处理连接错误 | 验证错误处理 | 无效配置 | 抛出有意义的错误 | 模拟传输构造器抛出错误 |

### 3.3 端到端测试用例

端到端测试验证从配置文件到工具调用的完整工作流程。

#### 3.3.1 MCP配置端到端测试

**文件路径**: `/packages/agent/src/__tests__/e2e/mcp/mcp-configuration.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-MCP-CONF-01 | Agent应能从DPML加载HTTP MCP配置 | 验证HTTP配置加载 | 包含HTTP MCP配置的DPML | 成功创建Agent | 模拟HTTP MCP服务器 |
| E2E-MCP-CONF-02 | Agent应能从DPML加载stdio MCP配置 | 验证stdio配置加载 | 包含stdio MCP配置的DPML | 成功创建Agent | 模拟stdio MCP服务器 |
| E2E-MCP-CONF-03 | Agent应能从DPML加载多个MCP配置 | 验证多服务器支持 | 包含多个MCP配置的DPML | 成功连接所有服务器 | 模拟多个MCP服务器 |
| E2E-MCP-CONF-04 | 无效MCP配置应产生适当的错误 | 验证错误处理 | 包含无效MCP配置的DPML | 抛出有详细信息的错误 | 无需模拟 |
| E2E-MCP-CONF-05 | 环境变量应在MCP配置中被正确处理 | 验证环境变量处理 | 引用环境变量的MCP配置 | 环境变量被正确替换 | 模拟process.env |

#### 3.3.2 工具调用端到端测试

**文件路径**: `/packages/agent/src/__tests__/e2e/mcp/tool-calling.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-MCP-TOOL-01 | Agent应能通过MCP调用基本工具 | 验证基本工具调用 | 请求使用基本工具的提示 | 工具被正确调用并处理结果 | 模拟LLM和测试MCP服务器 |
| E2E-MCP-TOOL-02 | Agent应能处理多次工具调用 | 验证多次调用支持 | 需要多次工具调用的对话 | 所有工具被正确调用 | 模拟LLM和测试MCP服务器 |
| E2E-MCP-TOOL-03 | Agent应能处理工具调用错误 | 验证错误处理 | 触发工具错误的提示 | 错误被优雅处理并返回给LLM | 模拟LLM和测试MCP服务器 |
| E2E-MCP-TOOL-04 | Agent应能使用来自多个MCP服务器的工具 | 验证多服务器工具调用 | 需要多服务器工具的任务 | 正确路由工具调用到相应服务器 | 模拟LLM和多个测试MCP服务器 |
| E2E-MCP-TOOL-05 | Agent在真实LLM模式下应能调用工具 | 验证真实LLM工具调用 | 使用真实LLM的对话 | 工具被正确调用并处理结果 | 真实LLM和测试MCP服务器 |

## 4. 模拟策略

### 4.1 MCP服务器模拟策略

为了便于测试，我们将使用官方的ModelContextProtocol SDK来创建测试MCP服务器，这样可以确保我们的测试夹具符合协议规范：

```typescript
/**
 * 基于官方SDK创建测试MCP服务器
 */
export async function createTestMcpServer() {
  // 使用官方SDK创建服务器实例
  const server = new McpServer({
    name: "test-mcp-server",
    version: "1.0.0"
  });

  // 添加测试工具
  server.tool(
    "web_search",
    "搜索网络信息",
    {
      query: z.string().describe("搜索查询词")
    },
    async ({ query }) => ({
      content: [{ 
        type: "text", 
        text: `搜索结果: ${query}的相关信息...` 
      }]
    })
  );

  server.tool(
    "calculator",
    "计算数学表达式",
    {
      expression: z.string().describe("要计算的表达式")
    },
    async ({ expression }) => {
      try {
        // 安全地计算表达式
        const result = Function('"use strict";return (' + expression + ')')();
        return {
          content: [{ 
            type: "text", 
            text: `计算结果: ${result}` 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `计算错误: ${error.message}` 
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "error_tool",
    "总是失败的工具",
    {},
    async () => ({
      content: [{ 
        type: "text", 
        text: "工具执行失败" 
      }],
      isError: true
    })
  );

  return server;
}
```

我们的服务器包括以下功能：
- 多种预定义的测试工具（搜索、计算器、错误测试）
- 符合协议规范的响应格式
- 错误处理测试支持
- 通过官方SDK确保协议兼容性

我们将支持两种传输类型：HTTP和stdio，便于全面测试MCP集成。

### 4.2 LLM响应模拟策略

我们将采用与Agent现有测试相同的LLM响应模拟策略：
- **双模式测试**：支持模拟模式和真实模式
- **模拟响应**：提供包含工具调用指令的预定义响应
- **环境变量控制**：复用现有的环境变量控制机制

这种方法允许我们在CI环境中使用模拟模式，同时在需要时也能进行真实LLM的集成测试。

### 4.3 MCPService模拟策略

- **传输模拟**：模拟HTTP和stdio传输
- **连接流程模拟**：跟踪连接调用和参数
- **错误情况模拟**：模拟各种连接错误场景

## 5. 测试覆盖率目标

依据DPML测试策略规则，设定如下覆盖率目标：

| 测试类型 | 行覆盖率目标 | 分支覆盖率目标 | 重点覆盖领域 |
|---------|------------|-------------|------------|
| 契约测试 | >95% | 100% | Schema定义、类型接口 |
| 集成测试 | >90% | >90% | 组件协作、数据流 |
| 端到端测试 | 核心流程100% | N/A | 从DPML到工具调用的完整流程 |

## 6. 测试实现示例

### 6.1 Schema契约测试实现示例

```typescript
// /packages/agent/src/__tests__/contract/mcp/schema.contract.test.ts
import { describe, test, expect } from 'vitest';
import { schema } from '../../../config/schema';

describe('MCP Schema契约测试', () => {
  test('CT-MCP-Schema-01: Schema应定义mcp-servers元素', () => {
    // 从schema.types中找到mcp-servers定义
    const mcpServersType = schema.types?.find(type => type.element === 'mcp-servers');
    
    expect(mcpServersType).toBeDefined();
    expect(mcpServersType).toHaveProperty('element', 'mcp-servers');
    expect(mcpServersType).toHaveProperty('children');
    expect(mcpServersType?.children).toHaveProperty('elements');
    
    // 验证mcp-servers可以包含mcp-server子元素
    const childElements = mcpServersType?.children?.elements || [];
    expect(childElements).toContain('mcp-server');
  });
  
  test('CT-MCP-Schema-02: Schema应定义mcp-server元素', () => {
    // 从schema.types中找到mcp-server定义
    const mcpServerType = schema.types?.find(type => type.element === 'mcp-server');
    
    expect(mcpServerType).toBeDefined();
    expect(mcpServerType).toHaveProperty('element', 'mcp-server');
    expect(mcpServerType).toHaveProperty('attributes');
  });
  
  test('CT-MCP-Schema-03: mcp-server应有name必填属性', () => {
    const mcpServerType = schema.types?.find(type => type.element === 'mcp-server');
    const attributes = mcpServerType?.attributes || [];
    
    // 查找name属性并验证它是必填的
    const nameAttr = attributes.find(attr => attr.name === 'name');
    expect(nameAttr).toBeDefined();
    expect(nameAttr).toHaveProperty('required', true);
  });
  
  test('CT-MCP-Schema-04: mcp-server应有type可选属性', () => {
    const mcpServerType = schema.types?.find(type => type.element === 'mcp-server');
    const attributes = mcpServerType?.attributes || [];
    
    // 查找type属性并验证它是可选的
    const typeAttr = attributes.find(attr => attr.name === 'type');
    expect(typeAttr).toBeDefined();
    expect(typeAttr).toHaveProperty('required', false);
    
    // 验证枚举值
    expect(typeAttr).toHaveProperty('enum');
    expect(typeAttr?.enum).toContain('http');
    expect(typeAttr?.enum).toContain('stdio');
  });
});
```

### 6.2 AgentRunner集成测试实现示例

```typescript
// /packages/agent/src/__tests__/integration/mcp/agentRunner.integration.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AgentRunner } from '../../../core/AgentRunner';
import * as mcpService from '../../../core/mcpService';
import { McpConfig, McpServerType } from '../../../types/McpConfig';

// 模拟MCPService模块
vi.mock('../../../core/mcpService', () => ({
  connect: vi.fn(),
  registerEnhancer: vi.fn(),
  enhanceLLMClient: vi.fn(client => client)
}));

describe('AgentRunner MCP集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('IT-MCP-AR-01: AgentRunner应在初始化时连接MCP服务器', () => {
    // 准备测试配置
    const mcpConfigs: McpConfig[] = [
      {
        name: 'test-server',
        type: McpServerType.HTTP,
        enabled: true,
        url: 'http://localhost:3000/mcp'
      }
    ];
    
    // 创建AgentRunner实例
    new AgentRunner({
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: 'Test prompt',
      mcpServers: mcpConfigs
    });
    
    // 验证MCPService.connect被调用
    expect(mcpService.connect).toHaveBeenCalledTimes(1);
    expect(mcpService.connect).toHaveBeenCalledWith(mcpConfigs[0]);
    
    // 验证registerEnhancer被调用
    expect(mcpService.registerEnhancer).toHaveBeenCalledTimes(1);
  });
  
  test('IT-MCP-AR-03: 只有enabled为true的MCP服务器应被连接', () => {
    // 准备测试配置，包含启用和禁用的服务器
    const mcpConfigs: McpConfig[] = [
      {
        name: 'enabled-server',
        type: McpServerType.HTTP,
        enabled: true,
        url: 'http://localhost:3000/mcp'
      },
      {
        name: 'disabled-server',
        type: McpServerType.HTTP,
        enabled: false,
        url: 'http://localhost:3001/mcp'
      }
    ];
    
    // 创建AgentRunner实例
    new AgentRunner({
      llm: { apiType: 'openai', model: 'gpt-4' },
      prompt: 'Test prompt',
      mcpServers: mcpConfigs
    });
    
    // 验证只有启用的服务器被连接
    expect(mcpService.connect).toHaveBeenCalledTimes(1);
    expect(mcpService.connect).toHaveBeenCalledWith(mcpConfigs[0]);
    expect(mcpService.connect).not.toHaveBeenCalledWith(mcpConfigs[1]);
  });
});
```

### 6.3 端到端测试实现示例

```typescript
// /packages/agent/src/__tests__/e2e/mcp/tool-calling.e2e.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { compiler } from '../../../api/dpml';
import { createAgent } from '../../../api/agent';
import { TestHttpMcpServer, prepareStdioMcpTest, monitorChildProcessCallCount } from '../../fixtures/mcp';
import { spawn } from 'child_process';
import { isLLMConfigValid } from '../env-helper';

// 检查是否使用真实LLM
const useRealLLM = isLLMConfigValid('openai');

describe('MCP工具调用端到端测试', () => {
  describe('HTTP传输', () => {
    let mcpServer: TestHttpMcpServer;
    
    beforeAll(async () => {
      // 启动HTTP测试MCP服务器
      mcpServer = new TestHttpMcpServer();
      await mcpServer.start();
    });
    
    afterAll(async () => {
      // 停止HTTP测试MCP服务器
      await mcpServer.stop();
    });
    
    test('E2E-MCP-TOOL-01: Agent应能通过HTTP MCP调用基本工具', async () => {
      // 准备DPML内容
      const dpmlContent = `
        <agent>
          <llm api-type="openai" model="gpt-4"></llm>
          <prompt>You are a helpful assistant who can use tools to answer questions.</prompt>
          <mcp-servers>
            <mcp-server name="test-tools" url="${mcpServer.url}" />
          </mcp-servers>
        </agent>
      `;
      
      // 编译DPML并创建Agent
      const config = await compiler.compile(dpmlContent);
      const agent = createAgent(config);
      
      // 发送需要使用工具的消息
      const response = await agent.chat('Can you search for information about climate change?');
      
      // 验证工具被调用
      expect(mcpServer.callCount).toBeGreaterThan(0);
      
      // 验证响应内容
      if (useRealLLM) {
        // 真实LLM只验证响应存在
        expect(response).toBeTruthy();
        console.info('Real LLM response:', response);
      } else {
        // 模拟LLM验证具体内容
        expect(response).toContain('climate change');
        expect(response).toContain('搜索结果');
      }
    });
  });
  
  describe('stdio传输', () => {
    let testEnv: { scriptPath: string; callCount: { value: number }; cleanup: () => Promise<void> };
    let childProcess;
    
    beforeAll(async () => {
      // 准备stdio测试环境
      testEnv = await prepareStdioMcpTest();
      
      // 启动子进程运行服务器
      childProcess = spawn('node', [testEnv.scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
      
      // 监控调用计数
      testEnv.callCount = monitorChildProcessCallCount(childProcess);
      
      // 等待服务器准备就绪
      await new Promise<void>((resolve) => {
        const onData = (data) => {
          if (data.toString().includes('MCP server ready')) {
            childProcess.stderr.off('data', onData);
            resolve();
          }
        };
        childProcess.stderr.on('data', onData);
      });
    });
    
    afterAll(async () => {
      // 停止子进程
      if (childProcess) {
        childProcess.kill();
      }
      
      // 清理测试环境
      await testEnv.cleanup();
    });
    
    test('E2E-MCP-TOOL-02: Agent应能通过stdio MCP调用基本工具', async () => {
      // 准备DPML内容
      const dpmlContent = `
        <agent>
          <llm api-type="openai" model="gpt-4"></llm>
          <prompt>You are a helpful assistant who can use tools to answer questions.</prompt>
          <mcp-servers>
            <mcp-server name="test-stdio-tools" command="node" args="${testEnv.scriptPath}" />
          </mcp-servers>
        </agent>
      `;
      
      // 编译DPML并创建Agent
      const config = await compiler.compile(dpmlContent);
      const agent = createAgent(config);
      
      // 发送需要使用工具的消息
      const response = await agent.chat('Could you calculate 24*7 for me?');
      
      // 验证工具被调用
      expect(testEnv.callCount.value).toBeGreaterThan(0);
      
      // 验证响应内容
      if (useRealLLM) {
        // 真实LLM只验证响应存在
        expect(response).toBeTruthy();
        console.info('Real LLM stdio response:', response);
      } else {
        // 模拟LLM验证具体内容
        expect(response).toContain('计算');
        expect(response).toContain('168');
      }
    });
  });
});
```

## 7. 测试夹具设计

### 7.1 MCP测试夹具

**文件路径**: `/packages/agent/src/__tests__/fixtures/mcp.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import express from "express";
import http from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

/**
 * 创建基础测试服务器，用于HTTP和stdio传输
 */
export async function createTestMcpServer() {
  // 创建服务器实例
  const server = new McpServer({
    name: "test-mcp-server",
    version: "1.0.0"
  });

  // 添加测试工具
  server.tool(
    "web_search",
    "搜索网络信息",
    {
      query: z.string().describe("搜索查询词")
    },
    async ({ query }) => ({
      content: [{ 
        type: "text", 
        text: `搜索结果: ${query}的相关信息...` 
      }]
    })
  );

  server.tool(
    "calculator",
    "计算数学表达式",
    {
      expression: z.string().describe("要计算的表达式")
    },
    async ({ expression }) => {
      try {
        // 安全地计算表达式
        const result = Function('"use strict";return (' + expression + ')')();
        return {
          content: [{ 
            type: "text", 
            text: `计算结果: ${result}` 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `计算错误: ${error.message}` 
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "error_tool",
    "总是失败的工具",
    {},
    async () => ({
      content: [{ 
        type: "text", 
        text: "工具执行失败" 
      }],
      isError: true
    })
  );

  return server;
}

/**
 * HTTP传输的MCP测试服务器
 */
export class TestHttpMcpServer {
  public url: string;
  public callCount: number = 0;
  private server: http.Server;
  private app: express.Application;
  private transport: StreamableHTTPServerTransport;
  private mcpServer: McpServer;
  
  constructor(port = 0) {
    this.app = express();
    this.app.use(express.json());
    this.server = http.createServer(this.app);
    this.url = '';
  }
  
  /**
   * 启动HTTP测试服务器
   */
  async start(): Promise<void> {
    // 创建MCP服务器
    this.mcpServer = await createTestMcpServer();
    
    // 创建HTTP传输
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => 'test-session'
    });
    
    // 传输监听请求计数
    const originalHandleRequest = this.transport.handleRequest.bind(this.transport);
    this.transport.handleRequest = async (...args) => {
      this.callCount++;
      return originalHandleRequest(...args);
    };
    
    // 连接服务器到传输
    await this.mcpServer.connect(this.transport);
    
    // 设置Express路由
    this.app.post('/mcp', async (req, res) => {
      await this.transport.handleRequest(req, res, req.body);
    });
    
    this.app.get('/mcp', async (req, res) => {
      await this.transport.handleRequest(req, res);
    });
    
    // 启动HTTP服务器
    return new Promise<void>((resolve) => {
      this.server.listen(this.port, () => {
        const address = this.server.address() as any;
        this.url = `http://localhost:${address.port}/mcp`;
        resolve();
      });
    });
  }
  
  /**
   * 停止HTTP测试服务器
   */
  async stop(): Promise<void> {
    if (this.mcpServer) {
      await this.mcpServer.close();
    }
    
    return new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
  }
}

/**
 * 准备stdio MCP测试环境
 */
export async function prepareStdioMcpTest(): Promise<{ 
  scriptPath: string,
  callCount: { value: number },
  cleanup: () => Promise<void>
}> {
  // 创建临时目录
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
  const scriptPath = path.join(tempDir, 'mcp-server.js');
  
  // 创建服务器脚本
  fs.writeFileSync(scriptPath, `
    import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
    import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
    import { z } from "zod";

    // 工具调用计数器
    let callCount = 0;
    
    // 将计数输出到stderr，以便测试读取
    function updateCallCount() {
      callCount++;
      console.error(\`CALL_COUNT:\${callCount}\`);
    }

    // 创建服务器实例
    const server = new McpServer({
      name: "test-mcp-server",
      version: "1.0.0"
    });

    // 添加测试工具
    server.tool(
      "web_search",
      "搜索网络信息",
      {
        query: z.string().describe("搜索查询词")
      },
      async ({ query }) => {
        updateCallCount();
        return {
          content: [{ 
            type: "text", 
            text: \`搜索结果: \${query}的相关信息...\` 
          }]
        };
      }
    );

    server.tool(
      "calculator",
      "计算数学表达式",
      {
        expression: z.string().describe("要计算的表达式")
      },
      async ({ expression }) => {
        updateCallCount();
        try {
          // 安全地计算表达式
          const result = Function('"use strict";return (' + expression + ')')();
          return {
            content: [{ 
              type: "text", 
              text: \`计算结果: \${result}\` 
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: \`计算错误: \${error.message}\` 
            }],
            isError: true
          };
        }
      }
    );

    server.tool(
      "error_tool",
      "总是失败的工具",
      {},
      async () => {
        updateCallCount();
        return {
          content: [{ 
            type: "text", 
            text: "工具执行失败" 
          }],
          isError: true
        };
      }
    );

    // 连接到stdio传输
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    // 通知就绪
    console.error('MCP server ready');
  `);
  
  // 创建计数对象，用于跟踪调用
  const callCount = { value: 0 };
  
  return {
    scriptPath,
    callCount,
    async cleanup() {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  };
}

/**
 * 创建DPML中的MCP配置
 */
export function createMcpDPML(options: {
  serverType?: 'http' | 'stdio';
  serverUrl?: string;
  command?: string;
  args?: string;
  enabled?: boolean;
  name?: string;
} = {}): string {
  const {
    serverType = 'http',
    serverUrl = 'http://localhost:3000/mcp',
    command = 'node',
    args = './mcp-server.js',
    enabled = true,
    name = 'test-mcp'
  } = options;
  
  // 构建MCP服务器配置
  let mcpServerAttrs = `name="${name}"`;
  
  if (serverType === 'http') {
    mcpServerAttrs += ` url="${serverUrl}"`;
  } else {
    mcpServerAttrs += ` command="${command}" args="${args}"`;
  }
  
  if (enabled !== true) {
    mcpServerAttrs += ` enabled="false"`;
  }
  
  // 返回完整DPML
  return `
    <agent>
      <llm api-type="openai" model="gpt-4"></llm>
      <prompt>You are a helpful assistant with tool-calling capabilities.</prompt>
      <mcp-servers>
        <mcp-server ${mcpServerAttrs} />
      </mcp-servers>
    </agent>
  `;
}
```

### 7.2 LLM模拟夹具

**文件路径**: `/packages/agent/src/__tests__/fixtures/mcp-llm.ts`

```typescript
import { LLMClient, Message, LLMResponse } from '../../../core/llm/types';

/**
 * 创建带有工具调用能力的模拟LLM客户端
 */
export function createMockLLMClientWithToolCalling(): LLMClient {
  return {
    sendMessages: async (messages: Message[]): Promise<LLMResponse> => {
      // 查找用户最后一条消息
      const userMessage = [...messages].reverse().find(m => m.role === 'user');
      const userContent = userMessage?.content && !Array.isArray(userMessage.content)
        ? userMessage.content.type === 'text' ? userMessage.content.value : ''
        : '';
      
      // 基于消息内容决定是否调用工具
      if (userContent.includes('search') || userContent.includes('查找') || userContent.includes('搜索')) {
        // 返回搜索工具调用
        return {
          content: null,
          toolCalls: [
            {
              id: 'call_1',
              type: 'function',
              function: {
                name: 'web_search',
                arguments: JSON.stringify({ query: userContent })
              }
            }
          ]
        };
      } else if (userContent.includes('calculate') || userContent.includes('计算')) {
        // 返回计算工具调用
        return {
          content: null,
          toolCalls: [
            {
              id: 'call_2',
              type: 'function',
              function: {
                name: 'calculator',
                arguments: JSON.stringify({ expression: '24*7' })
              }
            }
          ]
        };
      } else if (userContent.includes('error') || userContent.includes('错误')) {
        // 返回会导致错误的工具调用
        return {
          content: null,
          toolCalls: [
            {
              id: 'call_3',
              type: 'function',
              function: {
                name: 'error_tool',
                arguments: JSON.stringify({})
              }
            }
          ]
        };
      }
      
      // 默认返回普通文本响应
      return {
        content: {
          type: 'text',
          value: `这是对"${userContent}"的模拟响应，没有工具调用。`
        }
      };
    }
  };
}
```

### 7.3 端到端测试辅助工具

为了便于端到端测试，我们添加一个工具函数来捕获子进程的输出并监控工具调用计数：

```typescript
/**
 * 监控子进程中的工具调用计数
 */
export function monitorChildProcessCallCount(childProcess) {
  const callCount = { value: 0 };
  
  // 监听stderr以获取调用计数
  childProcess.stderr.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/CALL_COUNT:(\d+)/);
    if (match) {
      callCount.value = parseInt(match[1], 10);
    }
  });
  
  return callCount;
}
```

## 8. 优先级和实施顺序

根据DPML测试策略，测试实施应按以下优先级顺序进行：

1. **Schema和McpConfig契约测试**：确保基础定义正确
2. **转换器和传输推断集成测试**：验证XML到配置对象的转换
3. **AgentRunner与MCPService集成测试**：验证配置加载和服务连接
4. **MCP配置端到端测试**：验证完整配置流程
5. **工具调用端到端测试**：验证实际工具调用功能

## 9. 结论

本文档详细设计了MCP-DPML集成模块的测试用例，涵盖了契约测试、集成测试和端到端测试。测试设计遵循DPML测试策略规则，确保全面验证MCP-DPML集成的功能和质量。

测试设计重点关注以下几个方面：
- Schema扩展和配置接口的正确性
- XML到McpConfig的转换逻辑
- 传输类型的自动推断机制
- AgentRunner中的MCP集成流程
- 实际工具调用的功能验证

测试实现采用了与现有Agent测试框架一致的策略，并结合了官方SDK的优势：
- 使用官方ModelContextProtocol SDK创建测试MCP服务器，确保协议兼容性
- 支持HTTP和stdio两种传输类型的全面测试
- 支持模拟和真实LLM模式
- 复用现有测试环境变量控制逻辑

通过使用官方SDK实现测试夹具，我们可以避免手动实现协议细节时可能出现的错误，同时受益于SDK提供的完整功能集和错误处理机制。这种方法确保我们的测试与MCP规范保持一致，并随着协议的更新而保持兼容性。

通过实施本文档中设计的测试用例，可以确保MCP-DPML集成模块的可靠性和稳定性，为用户提供通过DPML声明式配置连接MCP服务器的能力。 