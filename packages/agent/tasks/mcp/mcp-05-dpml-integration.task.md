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

## MCP-DPML集成实现

**目标(O)**:
- **功能目标**:
  - 实现MCP与DPML声明式语法的无缝集成
  - 使Agent能够通过XML配置定义MCP服务器配置
  - 为Agent添加工具调用能力，连接大语言模型与外部工具
  - 支持HTTP和stdio两种传输类型的MCP服务器配置

- **执行任务**:
  - 创建文件:
    - `packages/agent/src/config/schema.ts` - 扩展DPML Schema以支持MCP配置
    - `packages/agent/src/config/transformers.ts` - 添加MCP配置的转换逻辑
    - `packages/agent/src/__tests__/contract/mcp/schema.contract.test.ts` - Schema契约测试
    - `packages/agent/src/__tests__/contract/mcp/transformers.contract.test.ts` - 转换器契约测试
    - `packages/agent/src/__tests__/integration/mcp/schema-transformer.integration.test.ts` - Schema和转换器集成测试
    - `packages/agent/src/__tests__/fixtures/mcp.ts` - 测试夹具
    
  - 修改文件:
    - `packages/agent/src/types/AgentConfig.ts` - 扩展以支持MCP配置
    - `packages/agent/src/core/AgentRunner.ts` - 增强AgentRunner以集成MCP功能
    - `packages/agent/src/__tests__/integration/mcp/agentRunner.integration.test.ts` - AgentRunner集成测试
    
  - 实现功能:
    - 扩展Agent配置Schema，支持MCP服务器配置
    - 实现XML到McpConfig的转换逻辑
    - 开发传输类型推断机制
    - 在AgentRunner中添加MCP集成代码
    - 实现测试夹具用于模拟MCP服务和测试集成

- **任务边界**:
  - 只实现XML配置解析和AgentRunner集成，不包括MCP服务本身的功能
  - 不涉及实际的工具调用执行逻辑，仅实现配置和连接部分
  - 不包括修改LLM客户端本身，仅添加与现有MCP模块的集成
  - 测试重点在于配置解析和集成流程，不测试实际工具调用功能

**环境(E)**:
- **参考资源**:
  - `packages/agent/docs/MCP-Requirements.md` - MCP集成需求规范
  - `packages/agent/docs/develop/MCP-DPML-Integration-Design.md` - MCP-DPML集成设计文档
  - `packages/agent/docs/develop/MCP-DPML-Integration-Testcase-Design.md` - 测试用例设计文档
  - `packages/agent/src/types/McpConfig.ts` - 现有MCP配置类型定义
  - `packages/agent/src/core/mcpService.ts` - 现有MCP服务模块
  
- **上下文信息**:
  - 此任务是在完成基础MCP功能后的集成工作，使MCP能够通过DPML配置使用
  - 需要遵循分层架构，保持API层稳定
  - 传输类型推断功能是核心需求
  - 此实现需要向后兼容，不影响现有Agent功能
  
- **规范索引**:
  - `rules/develop/architecture-overview.md` - 架构概述
  - `rules/develop/coding-standards.md` - 编码标准
  - `rules/develop/public-interfaces.md` - 公共接口设计规范
  - `rules/develop/testing-strategy.md` - 测试策略
  - `rules/develop/error-handling.md` - 错误处理规范

- **注意事项**:
  - Schema和转换器必须遵循DPML的声明式设计原则
  - 需要保持与现有Agent创建流程的兼容性
  - 传输类型推断必须符合需求文档中的规则
  - 错误处理需要提供有意义的错误信息和日志
  - 测试夹具实现需要符合真实MCP协议规范

**实现指导(I)**:
- **算法与流程**:
  - Schema扩展流程:
    1. 添加mcp-servers元素到Agent Schema中
    2. 定义mcp-server元素及其属性
    3. 更新Schema元素引用关系
  
  - 传输类型推断算法:
    ```typescript
    function inferTransportType(
      explicitType?: string, 
      command?: string, 
      url?: string
    ): 'http' | 'stdio' {
      // 如果明确指定了类型，则使用指定的类型
      if (explicitType === 'http' || explicitType === 'stdio') {
        return explicitType;
      }
      
      // 否则根据提供的属性推断
      if (command) {
        return 'stdio';
      } else if (url) {
        return 'http';
      }
      
      // 默认为stdio
      return 'stdio';
    }
    ```
  
  - AgentRunner集成流程:
    1. 检查AgentConfig中的mcpServers配置
    2. 对每个启用的MCP服务器调用registerMcp
    3. 使用enhanceLLMClient增强LLM客户端
    4. 优雅处理MCP连接错误，防止影响核心功能
  
- **技术选型**:
  - 使用现有的DPML Schema和Transformer框架
  - 复用现有的mcpService模块
  - 采用闭包设计模式增强LLM客户端
  
- **代码模式**:
  - Schema扩展示例:
    ```typescript
    const mcpServerSchema = {
      element: 'mcp-server',
      attributes: [
        {
          name: 'name',
          required: true
        },
        {
          name: 'enabled',
          type: 'boolean',
          default: true
        },
        // 其他属性...
      ]
    };
    ```
  
  - 转换器实现示例:
    ```typescript
    const mcpTransformer = definer.defineStructuralMapper<unknown, AgentConfig>(
      'mcpTransformer',
      [
        {
          selector: "agent > mcp-servers > mcp-server",
          targetPath: "mcpServers",
          transform: (node, context) => {
            // 转换逻辑...
          }
        }
      ]
    );
    ```
  
  - AgentRunner集成示例:
    ```typescript
    private applyMcpEnhancement(baseClient: LLMClient, mcpConfigs?: McpConfig[]): LLMClient {
      if (!mcpConfigs || mcpConfigs.length === 0) {
        return baseClient;
      }
      
      let enhancedClient = baseClient;
      for (const mcpConfig of mcpConfigs) {
        if (mcpConfig.enabled === false) {
          continue;
        }
        
        try {
          registerMcp(mcpConfig);
          enhancedClient = enhanceLLMClient(enhancedClient, mcpConfig.name);
        } catch (error) {
          console.error(`MCP服务 ${mcpConfig.name} 加载失败:`, error);
        }
      }
      
      return enhancedClient;
    }
    ```
  
- **实现策略**:
  1. 先实现Schema扩展并通过契约测试
  2. 实现转换器并通过契约测试
  3. 编写Schema和转换器集成测试
  4. 实现AgentRunner集成代码
  5. 实现测试夹具
  6. 编写并通过AgentRunner集成测试

- **调试指南**:
  - Schema调试:
    * 在转换过程中添加日志输出节点结构
    * 记录属性解析和类型推断过程
    * 检查最终生成的配置对象
  
  - AgentRunner集成调试:
    * 记录配置处理和MCP增强流程
    * 捕获并记录MCP连接错误
    * 验证LLM客户端是否正确增强

**成功标准(S)**:
- **基础达标**:
  - 所有契约测试通过:
    * `schema.contract.test.ts`
    * `transformers.contract.test.ts`
  - 所有集成测试通过:
    * `schema-transformer.integration.test.ts`
    * `agentRunner.integration.test.ts`
  - 成功解析HTTP和stdio类型的MCP配置
  - 传输类型推断功能按规则工作
  
- **预期品质**:
  - 代码遵循DPML编码规范
  - 错误处理健壮，提供有意义的错误信息
  - 文档注释完整，明确描述API和功能
  - 保持与现有Agent功能的兼容性
  - 测试覆盖率达到90%以上
  
- **卓越表现**:
  - 支持更丰富的配置选项
  - 提供更全面的日志和诊断信息
  - 实现更多单元测试覆盖边界情况
  - 优化错误处理和容错机制
  - 编写详细的使用文档和示例