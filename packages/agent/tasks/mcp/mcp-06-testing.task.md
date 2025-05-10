// IMPORTANT: 强制执行指令 //
// AI执行者必须先阅读并宣誓接受下面的执行誓词，才能开始任务分析。
// 必须明确声明："我已阅读并接受AI执行誓词，现在开始按规范执行任务"
// 未经宣誓直接开始任务分析将视为违反规范，任务执行无效。
// 严格遵循"先环境分析，后目标分析"的顺序。
// ===================== //

# AI执行誓词

作为DPML项目的AI开发者，我庄严宣誓：

## 思考准则
我将以专业类库开发者的思维模式思考，遵循TDD原则，确保代码的可测试性、可维护性和架构一致性。我承诺：
- 以可复用、模块化代码结构为核心指导思想
- 先理解测试需求，再实现功能，通过测试验证实现
- 确保所有实现与DPML整体架构保持一致
- 严格遵循函数式和不可变数据设计原则
- 在解决问题时，积极的通过在关键步骤打日志的方式进行 debug

## 执行承诺
我将遵循严格的执行流程，不偏离既定规范。我承诺：

**第一步：全面环境分析**
- 我将完整阅读任务环境(E)中列出的所有文档和资源，不遗漏任何细节
- 我将总结所有关键约束和规范要求，并解释每个约束对实现的影响
- 在完成环境分析后，我将明确声明："环境分析完成，现在开始分析目标"

**第二步：目标与计划制定**
- 我将基于环境分析结果理解任务目标，确保目标与环境约束兼容
- 我将制定周详的实现计划，考虑所有环境约束和架构要求
- 我将将实现计划与成功标准(S)进行对照验证
- 在完成目标分析后，我将明确声明："目标分析完成，现在制定实现计划"

**第三步：测试驱动实现**
- 我将严格按照测试优先级实现功能
- 每完成一个功能点，我将立即运行相关测试验证
- 遇到测试失败时，我将使用日志和系统性调试方法而非依赖猜测
- 我将确保实现满足所有测试要求，不妥协代码质量
- 我将确保代码实现符合业务逻辑，而非仅为通过测试

**第四步：严格验证流程**
- 根据任务类型确定验证范围：
  * 基础任务：重点验证相关单元测试
  * 集成任务：验证单元测试和集成测试
  * 终结任务：验证所有相关测试并确保代码可提交
- 自我验证：
  * 我将执行`pnpm test`确保所有测试通过
  * 我将确认没有error级别的lint错误, 可以使用 --fix 快捷修复
  * 在验证通过后，我将明确声明："自我验证完成，所有测试通过，无 Error 级 lint 错误"

## 禁止事项（红线）
- 我绝不通过修改测试代码的方式通过测试，除非测试代码本身有明显错误
- 我绝不编写专门为应付测试而不符合业务逻辑的实现代码
- 我绝不依赖猜测解决问题，而是使用日志和断点进行系统性调试
- 如果我需要修改测试，我将明确说明修改理由并请求人类审批
- 我绝不在未理清任务全貌的情况下，直接开始进行任务
- 端到端测试绝对不允许靠 mock

## 调试规范
- 遇到测试失败时，我将：
  * 首先添加详细日志输出关键数据和执行路径
  * 分析测试失败的具体断言和条件
  * 比较预期值与实际值的差异
  * 追踪问题根源至具体代码
  * 验证修复方案的合理性
- 当我需要添加日志时，我将：
  * 在关键函数入口记录输入参数
  * 在数据转换处记录前后状态
  * 在条件分支处记录判断条件
  * 在返回值处记录最终结果
- 如果我认为测试代码需要修改，我将：
  * 明确标记："我认为测试代码需要修改"
  * 提供详细的理由和证据
  * 等待人类确认后才执行修改

## 项目结构
我们的项目是 monorepo，基于 pnpm workspace 管理。

## 权利
- 我有权利在设计本身就无法达成目标时停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## MCP测试夹具与大模型调用开关实现

**目标(O)**:
- **功能目标**:
  - 实现符合MCP协议的测试服务器夹具，支持HTTP和stdio两种传输方式
  - 实现大模型调用开关机制，允许测试在模拟模式和真实模式之间切换
  - 开发测试辅助工具函数，便于不同测试场景下的MCP服务使用
  - 确保测试环境的一致性和可控性，提高测试稳定性

- **执行任务**:
  - 创建文件:
    - `packages/agent/src/__tests__/fixtures/mcp/index.ts` - 测试夹具入口
    - `packages/agent/src/__tests__/fixtures/mcp/server.ts` - MCP测试服务器实现
    - `packages/agent/src/__tests__/fixtures/mcp/tools.ts` - 标准测试工具定义
    - `packages/agent/src/__tests__/fixtures/mcp/transport-http.ts` - HTTP传输测试夹具
    - `packages/agent/src/__tests__/fixtures/mcp/transport-stdio.ts` - stdio传输测试夹具
    - `packages/agent/src/__tests__/fixtures/mcp/llm-mock.ts` - LLM模拟夹具
    - `packages/agent/src/__tests__/env-helper.ts` - 环境变量辅助函数
    
  - 实现功能:
    - 基于官方ModelContextProtocol SDK实现测试服务器
    - 实现标准化的测试工具集（搜索、计算器、错误工具等）
    - 开发HTTP和stdio两种传输类型的测试服务器
    - 实现服务器调用追踪和计数机制
    - 创建环境变量控制的大模型调用开关
    - 开发适用于不同测试类型的辅助函数

- **任务边界**:
  - 只实现测试相关的夹具和辅助工具，不涉及实际功能代码
  - 不包括端到端测试的编写，只提供测试所需的夹具
  - 不修改现有测试用例，只添加新的辅助工具

**环境(E)**:
- **参考资源**:
  - `packages/agent/docs/develop/MCP-DPML-Integration-Testcase-Design.md` - 测试用例设计
  - `packages/agent/src/__tests__/fixtures/` - 现有测试夹具示例
  - `packages/agent/src/__tests__/e2e/agent-conversation.e2e.test.ts` - 现有对话测试
  - `packages/agent/src/__tests__/e2e/agent-configuration.e2e.test.ts` - 现有配置测试
  - `packages/agent/src/__tests__/e2e/env-helper.ts` - 现有环境辅助函数
  - `@modelcontextprotocol/sdk` - ModelContextProtocol官方SDK
  
- **上下文信息**:
  - 测试需要模拟真实的MCP服务器行为，确保协议兼容性
  - 测试环境需要支持CI/CD和本地开发两种场景
  - 不同测试类型（单元、集成、端到端）需要不同级别的模拟
  - 项目已有用于控制LLM测试模式的环境变量和辅助函数
  - 需要保持与现有测试框架的一致性
  
- **规范索引**:
  - `rules/develop/testing-strategy.md` - 测试策略
  - `rules/develop/coding-standards.md` - 编码标准
  - MCP官方规范：https://github.com/modelcontextprotocol/protocol

- **注意事项**:
  - MCP服务器必须严格遵循官方协议规范
  - 环境变量处理需要与现有测试保持一致，使用 `TEST_USE_REAL_API` 
  - 测试夹具需要支持并行测试执行
  - 端到端测试不允许使用mock，需要真实的服务器交互

**实现指导(I)**:
- **算法与流程**:
  - MCP测试服务器创建流程:
    1. 创建基于官方SDK的服务器实例
    2. 注册标准测试工具
    3. 连接到指定传输（HTTP或stdio）
    4. 提供调用跟踪和计数机制
  
  - 大模型调用开关流程:
    1. 检查环境变量是否允许真实LLM
    2. 验证API密钥是否有效
    3. 根据测试类型和环境确定使用模式
    4. 提供适当的断言策略
  
- **技术选型**:
  - 使用`@modelcontextprotocol/sdk`实现标准兼容的测试服务器
  - 使用`express`创建HTTP测试服务器
  - 使用`child_process`实现stdio传输测试
  - 使用环境变量控制测试模式切换
  
- **代码模式**:
  - HTTP服务器实现示例:
    ```typescript
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
      
      async start(): Promise<void> {
        // 创建MCP服务器
        this.mcpServer = await createTestMcpServer();
        
        // 创建HTTP传输并跟踪调用
        this.transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => 'test-session'
        });
        
        const originalHandleRequest = this.transport.handleRequest.bind(this.transport);
        this.transport.handleRequest = async (...args) => {
          this.callCount++;
          return originalHandleRequest(...args);
        };
        
        // 连接到传输并启动服务器
        await this.mcpServer.connect(this.transport);
        
        this.app.post('/mcp', async (req, res) => {
          await this.transport.handleRequest(req, res, req.body);
        });
        
        return new Promise<void>((resolve) => {
          this.server.listen(this.port, () => {
            const address = this.server.address() as any;
            this.url = `http://localhost:${address.port}/mcp`;
            resolve();
          });
        });
      }
      
      async stop(): Promise<void> {
        if (this.mcpServer) {
          await this.mcpServer.close();
        }
        
        return new Promise<void>((resolve) => {
          this.server.close(() => resolve());
        });
      }
    }
    ```
  
  - 环境辅助函数实现示例:
    ```typescript
    // 复用现有的env-helper.ts并扩展MCP相关功能
    
    // 检查是否使用真实API (复用现有函数)
    export function isLLMConfigValid(provider?: string): boolean {
      // 首先检查是否允许使用真实API
      if (process.env.TEST_USE_REAL_API !== 'true') {
        return false;
      }
      
      // 如果指定了提供商，检查是否有对应配置
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
      
      // 默认检查任一提供商
      return Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
    }
    
    // 获取LLM配置 (复用现有函数)
    export function getLLMConfig(provider: 'openai' | 'anthropic') {
      if (provider === 'openai') {
        return {
          apiKey: process.env.OPENAI_API_KEY || '',
          apiUrl: process.env.OPENAI_API_URL,
          model: process.env.OPENAI_MODEL || 'gpt-4'
        };
      } else {
        return {
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          model: process.env.ANTHROPIC_MODEL || 'claude-3'
        };
      }
    }
    
    // 提供测试模式信息
    export function getMcpTestMode() {
      return {
        useRealApi: process.env.TEST_USE_REAL_API === 'true',
        testTimeout: parseInt(process.env.TEST_TIMEOUT || '10000', 10)
      };
    }
    ```
  
- **实现策略**:
  1. 先实现基础测试工具定义
  2. 开发HTTP传输测试服务器
  3. 开发stdio传输测试服务器
  4. 实现LLM模拟客户端和工具调用响应
  5. 开发环境变量控制机制
  6. 整合为统一的测试夹具API

- **调试指南**:
  - 服务器启动调试:
    ```typescript
    console.info('[TestMcpServer] 启动中...', {
      serverName: server.name,
      serverTools: server.getTools().map(t => t.name).join(', ')
    });
    
    try {
      await server.connect(transport);
      console.info('[TestMcpServer] 启动成功', {
        transportType: transport.constructor.name,
        isConnected: transport.isConnected()
      });
    } catch (error) {
      console.error('[TestMcpServer] 启动失败', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
    ```
  
  - 环境变量调试:
    ```typescript
    console.info('===== MCP测试配置信息 =====');
    console.info(`使用API模式: ${useRealAPI ? '真实API' : '模拟API'}`);
    if (useRealAPI) {
      console.info(`OpenAI模型: ${getLLMConfig('openai').model}`);
      console.info(`OpenAI API URL: ${getLLMConfig('openai').apiUrl}`);
    } else {
      console.info('使用模拟客户端和MCP服务器');
    }
    console.info('===========================');
    ```

**成功标准(S)**:
- **基础达标**:
  - 成功实现MCP测试服务器，支持HTTP和stdio传输
  - 环境变量控制机制正常工作
  - 测试工具调用能够被正确跟踪和计数
  - 现有的基础单元测试和契约测试能够使用测试夹具正常运行
  
- **预期品质**:
  - 测试夹具符合MCP官方协议规范
  - 测试服务器能够处理不同类型的工具调用请求
  - 环境变量控制机制在不同环境（CI/本地）下正常工作
  - 测试辅助函数设计合理，使用简便
  - 测试夹具代码有完整的注释和文档
  
- **卓越表现**:
  - 提供更丰富的测试工具集
  - 支持多种边界条件测试
  - 实现更详细的服务器诊断和调试功能
  - 提供测试夹具使用示例和文档
  - 测试夹具自身有高测试覆盖率 