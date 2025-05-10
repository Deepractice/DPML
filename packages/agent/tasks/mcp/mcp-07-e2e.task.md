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

## MCP-DPML集成端到端测试实现（终结任务）

**目标(O)**:
- **功能目标**:
  - 实现MCP-DPML集成的端到端测试，验证从XML配置到工具调用的完整流程
  - 验证HTTP和stdio传输类型的MCP服务器配置和工具调用功能
  - 确保MCP服务器的正确连接、工具调用处理和结果返回
  - 实现覆盖不同配置场景和边界条件的全面测试用例

- **执行任务**:
  - 创建文件:
    - `packages/agent/src/__tests__/e2e/mcp/mcp-configuration.e2e.test.ts` - MCP配置端到端测试
    - `packages/agent/src/__tests__/e2e/mcp/tool-calling.e2e.test.ts` - 工具调用端到端测试
    - `packages/agent/src/__tests__/e2e/mcp/transport-types.e2e.test.ts` - 传输类型端到端测试
    - `packages/agent/src/__tests__/e2e/mcp/error-handling.e2e.test.ts` - 错误处理端到端测试
    
  - 实现功能:
    - 测试XML配置到McpConfig的转换和验证
    - 测试不同传输类型（HTTP、stdio）的工具调用功能
    - 测试多服务器配置和工具调用路由
    - 测试错误处理和容错机制
    - 结合模拟和真实LLM模式的测试覆盖

- **任务边界**:
  - 本任务是MCP-DPML集成的最终验证，需确保所有相关组件正常工作
  - 测试必须使用先前任务中实现的测试夹具和辅助工具
  - 包括所有端到端测试的实现，不仅限于基本功能测试
  - 作为终结任务，必须确保所有测试通过并能成功提交代码

**环境(E)**:
- **参考资源**:
  - `packages/agent/docs/MCP-Requirements.md` - MCP集成需求规范
  - `packages/agent/docs/develop/MCP-DPML-Integration-Design.md` - MCP-DPML集成设计文档
  - `packages/agent/docs/develop/MCP-DPML-Integration-Testcase-Design.md` - 测试用例设计文档
  - `packages/agent/src/__tests__/e2e/agent-conversation.e2e.test.ts` - 现有对话测试
  - `packages/agent/src/__tests__/e2e/agent-configuration.e2e.test.ts` - 现有配置测试
  - `packages/agent/src/__tests__/fixtures/mcp/` - 测试夹具
  - `packages/agent/src/__tests__/e2e/env-helper.ts` - 环境辅助函数
  
- **上下文信息**:
  - 前置任务包括MCP基础实现、DPML集成和测试夹具实现
  - 所有基础组件和集成功能已实现完成
  - 端到端测试是确认整个功能正常工作的最终验证
  - 端到端测试需要真实的服务器交互，不允许使用mock
  - 需要保持与现有测试框架的一致性
  
- **规范索引**:
  - `rules/develop/testing-strategy.md` - 测试策略
  - `rules/develop/error-handling.md` - 错误处理规范
  - `rules/task/oes-task-design.md` - OES任务设计规则
  - MCP官方规范：https://github.com/modelcontextprotocol/protocol

- **注意事项**:
  - 端到端测试不允许使用mock，需要使用真实的MCP服务器
  - 测试配置与现有测试保持一致，使用 `TEST_USE_REAL_API`
  - 端到端测试可能需要较长的执行时间，需要合理设置超时
  - 测试必须处理资源清理，避免资源泄漏

**实现指导(I)**:
- **算法与流程**:
  - MCP配置端到端测试流程:
    1. 创建包含MCP配置的DPML文档
    2. 使用compiler编译DPML文档
    3. 使用createAgent创建Agent实例
    4. 验证MCP服务器是否正确连接
    5. 检查配置项是否正确解析
  
  - 工具调用端到端测试流程:
    1. 启动MCP测试服务器
    2. 创建连接到测试服务器的Agent
    3. 发送触发工具调用的消息
    4. 验证工具被正确调用并获取结果
    5. 关闭测试服务器并清理资源
  
- **技术选型**:
  - 使用Vitest作为测试框架
  - 使用之前任务实现的测试夹具
  - 使用环境变量控制测试模式（模拟/真实LLM）
  
- **代码模式**:
  - MCP配置测试示例:
    ```typescript
    /**
     * MCP配置端到端测试
     */
    import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
    import { compiler } from '../../../api/dpml';
    import { createAgent } from '../../../api/agent';
    import * as llmFactory from '../../../core/llm/llmFactory';
    import { OpenAIClient } from '../../../core/llm/OpenAIClient';
    import { TestHttpMcpServer } from '../../fixtures/mcp';
    import { isLLMConfigValid, getLLMConfig } from '../env-helper';
    
    // 检查是否使用真实API
    const useRealAPI = isLLMConfigValid('openai');
    
    // 提供模拟功能
    if (!useRealAPI) {
      console.info('ℹ️ MCP配置测试使用模拟模式');
      
      // 模拟OpenAI客户端
      vi.spyOn(OpenAIClient.prototype, 'sendMessages').mockImplementation((messages) => {
        return Promise.resolve({
          content: {
            type: 'text',
            value: '模拟回复'
          }
        });
      });
    } else {
      console.info('ℹ️ MCP配置测试使用真实API');
    }
    
    // 显示配置信息
    beforeAll(() => {
      console.info('===== MCP配置测试信息 =====');
      console.info(`使用API模式: ${useRealAPI ? '真实API' : '模拟API'}`);
      if (useRealAPI) {
        console.info(`OpenAI模型: ${getLLMConfig('openai').model}`);
        console.info(`OpenAI API URL: ${getLLMConfig('openai').apiUrl}`);
      }
      console.info('===========================');
    });
    
    describe('E2E-MCP-Config', () => {
      let mcpServer: TestHttpMcpServer;
      
      beforeAll(async () => {
        mcpServer = new TestHttpMcpServer();
        await mcpServer.start();
      });
      
      afterAll(async () => {
        await mcpServer.stop();
      });
      
      beforeEach(() => {
        // 清理测试状态
        mcpServer.resetCallCount();
      });
      
      test('E2E-MCP-Config-01: 应正确解析HTTP类型的MCP配置', async () => {
        // 准备包含HTTP MCP配置的DPML
        const dpmlContent = `
          <agent>
            <llm api-type="openai" model="${useRealAPI ? getLLMConfig('openai').model : 'gpt-4'}" 
                 api-key="${useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test'}"/>
            <prompt>Test prompt</prompt>
            <mcp-servers>
              <mcp-server name="test-server" url="${mcpServer.url}" />
            </mcp-servers>
          </agent>
        `;
        
        // 编译DPML并创建Agent
        const config = await compiler.compile(dpmlContent);
        const agent = createAgent(config);
        
        // 验证配置正确解析
        expect(config.mcpServers).toBeDefined();
        expect(config.mcpServers?.length).toBe(1);
        expect(config.mcpServers?.[0].name).toBe('test-server');
        expect(config.mcpServers?.[0].type).toBe('http');
        
        // 验证Agent成功创建
        expect(agent).toBeDefined();
      });
    });
    ```
  
  - 工具调用测试示例:
    ```typescript
    /**
     * MCP工具调用端到端测试
     */
    import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
    import { compiler } from '../../../api/dpml';
    import { createAgent } from '../../../api/agent';
    import * as llmFactory from '../../../core/llm/llmFactory';
    import { OpenAIClient } from '../../../core/llm/OpenAIClient';
    import { TestHttpMcpServer } from '../../fixtures/mcp';
    import { isLLMConfigValid, getLLMConfig } from '../env-helper';
    
    // 检查是否使用真实API
    const useRealAPI = isLLMConfigValid('openai');
    
    // 提供模拟功能 - 工具调用需要特殊模拟
    const mockSendMessages = vi.fn().mockImplementation((messages) => {
      // 查找用户消息
      const userMessage = messages.findLast(msg => msg.role === 'user');
      const userInput = userMessage?.content?.type === 'text'
        ? userMessage.content.value.toString()
        : '';
        
      // 基于用户输入决定是否调用工具
      if (userInput.includes('search') || userInput.includes('查询') || userInput.includes('搜索')) {
        return Promise.resolve({
          content: null,
          toolCalls: [
            {
              id: 'call_1',
              type: 'function',
              function: {
                name: 'web_search',
                arguments: JSON.stringify({ query: userInput })
              }
            }
          ]
        });
      }
      
      return Promise.resolve({
        content: {
          type: 'text',
          value: '模拟回复: ' + userInput
        }
      });
    });
    
    // 根据环境配置模拟
    if (!useRealAPI) {
      console.info('ℹ️ MCP工具调用测试使用模拟模式');
      
      // 模拟OpenAI客户端
      vi.spyOn(OpenAIClient.prototype, 'sendMessages').mockImplementation(mockSendMessages);
      
      // 模拟llmFactory
      vi.spyOn(llmFactory, 'createClient').mockImplementation(() => {
        return {
          sendMessages: mockSendMessages
        };
      });
    } else {
      console.info('ℹ️ MCP工具调用测试使用真实API');
    }
    
    describe('E2E-MCP-Tool', () => {
      let mcpServer: TestHttpMcpServer;
      
      beforeAll(async () => {
        mcpServer = new TestHttpMcpServer();
        await mcpServer.start();
        
        console.info('===== MCP工具调用测试信息 =====');
        console.info(`使用API模式: ${useRealAPI ? '真实API' : '模拟API'}`);
        console.info(`MCP服务器URL: ${mcpServer.url}`);
        console.info('================================');
      });
      
      afterAll(async () => {
        await mcpServer.stop();
      });
      
      beforeEach(() => {
        // 清理测试状态
        vi.clearAllMocks();
        mcpServer.resetCallCount();
      });
      
      test('E2E-MCP-Tool-01: Agent应能通过MCP调用搜索工具', async () => {
        // 准备包含MCP配置的DPML
        const dpmlContent = `
          <agent>
            <llm api-type="openai" model="${useRealAPI ? getLLMConfig('openai').model : 'gpt-4'}" 
                 api-key="${useRealAPI ? getLLMConfig('openai').apiKey : 'sk-test'}"/>
            <prompt>You are a helpful assistant who can use tools to search for information.</prompt>
            <mcp-servers>
              <mcp-server name="search-tools" url="${mcpServer.url}" />
            </mcp-servers>
          </agent>
        `;
        
        // 编译DPML并创建Agent
        const config = await compiler.compile(dpmlContent);
        const agent = createAgent(config);
        
        // 发送需要使用搜索工具的消息
        console.info('发送消息: 搜索关于气候变化的信息');
        const response = await agent.chat('搜索关于气候变化的信息');
        
        // 验证工具调用
        expect(mcpServer.callCount).toBeGreaterThan(0);
        console.info(`MCP服务器被调用次数: ${mcpServer.callCount}`);
        
        // 验证响应
        if (useRealAPI) {
          expect(response).toBeTruthy();
          console.info('真实API响应:', response);
        } else {
          expect(response).toContain('气候变化');
        }
      });
    });
    ```
  
- **实现策略**:
  1. 首先实现测试支持框架，包括模拟和真实模式切换
  2. 实现配置测试，验证XML解析和连接功能
  3. 实现工具调用测试，确保LLM客户端正确调用MCP服务
  4. 实现传输类型和错误处理测试
  5. 确保所有测试在CI环境和本地环境都能运行

- **调试指南**:
  - 打印详细的测试配置信息:
    ```typescript
    console.info('===== MCP测试配置信息 =====');
    console.info(`使用API模式: ${useRealAPI ? '真实API' : '模拟API'}`);
    console.info(`测试超时: ${parseInt(process.env.TEST_TIMEOUT || '10000', 10)}ms`);
    if (useRealAPI) {
      console.info(`OpenAI模型: ${getLLMConfig('openai').model}`);
      console.info(`OpenAI API URL: ${getLLMConfig('openai').apiUrl || 'default'}`);
    }
    console.info('===========================');
    ```
  
  - 记录模拟行为和实际调用:
    ```typescript
    if (!useRealAPI) {
      console.info('模拟API调用:', { 
        modelName: config.llm.model,
        messages: messages.length,
        lastMessage: messages[messages.length - 1].content
      });
    }
    
    console.info('Agent.chat调用:', { 
      inputLength: input.length,
      mcpEnabled: Boolean(config.mcpServers?.length)
    });
    ```

**成功标准(S)**:
- **基础达标**:
  - 所有端到端测试通过，包括:
    - `mcp-configuration.e2e.test.ts`
    - `tool-calling.e2e.test.ts`
    - `transport-types.e2e.test.ts`
    - `error-handling.e2e.test.ts`
  - MCP配置正确解析并连接到测试服务器
  - 通过MCP成功执行工具调用
  
- **预期品质**:
  - 测试覆盖所有关键场景和边界条件
  - 错误处理机制正常工作
  - 测试具有良好的可维护性和可读性
  - 测试在模拟和真实LLM模式下都能正常运行
  - 代码成功提交并通过CI验证
  - 相关文档已更新
  
- **卓越表现**:
  - 测试覆盖更全面的边界条件和错误场景
  - 测试性能良好，执行时间合理
  - 提供详细的测试文档和使用示例
  - 实现更高级的测试功能，如参数化测试 