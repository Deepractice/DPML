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

## Agent MCP核心组件实现

**目标(O)**:
- **功能目标**:
  - 基于Model Context Protocol官方SDK实现Agent MCP模块的核心组件功能
  - 实现工具调用处理器链和工具执行流程
  - 确保工具调用能够成功提取、执行和处理结果
  - 实现流式处理的分叉和处理机制

- **执行任务**:
  - 添加依赖并集成官方SDK:
    - 安装官方SDK `@modelcontextprotocol/sdk`
    - 导入并使用SDK提供的类型和组件
    - 基于SDK实现MCP客户端实例创建和连接
  - 创建文件:
    - `/packages/agent/src/core/mcp/pipeline/processors/ToolPreparationProcessor.ts` - 工具准备处理器
    - `/packages/agent/src/core/mcp/pipeline/processors/ConversationEntryProcessor.ts` - 对话入口处理器
    - `/packages/agent/src/core/mcp/pipeline/processors/StartSideBandProcessor.ts` - 流分叉处理器
    - `/packages/agent/src/core/mcp/pipeline/processors/ToolCallExtractorProcessor.ts` - 工具调用提取器
    - `/packages/agent/src/core/mcp/pipeline/processors/ToolExecutionProcessor.ts` - 工具执行处理器
    - `/packages/agent/src/core/mcp/pipeline/processors/ResultFormattingProcessor.ts` - 结果格式化处理器
    - `/packages/agent/src/core/mcp/pipeline/processors/RecursiveProcessor.ts` - 递归处理器
    - `/packages/agent/src/__tests__/unit/core/mcp/pipeline/processors/` - 处理器单元测试
    - `/packages/agent/src/__tests__/fixtures/mcp.fixture.ts` - MCP测试夹具

  - 修改文件:
    - `/packages/agent/src/core/mcpService.ts` - 实现具体功能逻辑
    - `/packages/agent/src/core/mcp/McpRegistry.ts` - 完成注册表实现
    - `/packages/agent/src/core/mcp/McpEnhancer.ts` - 完成增强器实现
    - `/packages/agent/src/core/mcp/pipeline/ToolCallPipeline.ts` - 完成管道实现
    - `/packages/agent/src/types/McpConfig.ts` - 更新为使用官方SDK类型
    - `/packages/agent/src/types/McpError.ts` - 更新为使用官方SDK类型
    - `/packages/agent/src/core/mcp/pipeline/ToolCallContext.ts` - 更新为使用官方SDK类型
  
  - 实现功能:
    - 使用SDK创建和管理MCP客户端
    - 实现七个核心处理器的完整功能
    - 实现工具调用管道的处理流程
    - 实现流式分叉处理和旁观者模式
    - 实现工具调用的提取、执行和结果处理
    - 实现递归处理多轮工具调用

- **任务边界**:
  - 使用官方MCP SDK `@modelcontextprotocol/sdk`提供的类型和接口
  - 不自定义重复的类型，而是统一使用官方SDK类型
  - 专注于Core层组件与SDK的集成实现
  - 不涉及端到端测试，主要实现单元测试
  - 以通过处理器单元测试为主要目标

**环境(E)**:
- **参考资源**:
  - `/packages/agent/docs/develop/Agent-MCP-design.md` - MCP模块详细设计文档
  - `/packages/agent/docs/develop/Agent-MCP-develop-design.md` - MCP模块开发设计文档
  - `/packages/agent/docs/develop/Agent-MCP-Testcase-Design.md` - MCP模块测试用例设计
  - 任务一的成果：已实现的骨架代码和契约测试
  - 官方MCP SDK文档：https://www.npmjs.com/package/@modelcontextprotocol/sdk
  - 官方MCP GitHub仓库：https://github.com/modelcontextprotocol/typescript-sdk
  - 官方MCP网站：https://modelcontextprotocol.io
  - 官方MCP入门教程：https://modelcontextprotocol.io/introduction
  - 官方TypeScript SDK文档：https://github.com/modelcontextprotocol/typescript-sdk
  - 官方Python SDK文档：https://github.com/modelcontextprotocol/python-sdk
  - 官方MCP规范与文档：https://github.com/modelcontextprotocol/modelcontextprotocol
  
- **上下文信息**:
  - 本任务是Agent MCP模块开发的第二步，专注于核心功能实现
  - 依赖于任务一中创建的骨架代码和类型定义
  - 需要实现设计文档中的七个处理器和工具调用管道
  - 使用Model Context Protocol官方SDK `@modelcontextprotocol/sdk`
  
- **规范索引**:
  - `/rules/architecture/core-layer.md` - Core层设计规则
  - `/rules/develop/immutable-data.md` - 不可变数据规范
  - `/rules/develop/error-handling.md` - 错误处理规范
  - `/rules/architecture/testing-strategy.md` - 测试策略规则

- **注意事项**:
  - 重点关注流式处理和分叉机制的实现
  - 递归处理需要考虑深度限制和循环调用问题
  - 工具调用提取需要处理多种格式和内嵌情况
  - 确保处理器之间的职责明确分离，不重叠
  - 使用官方SDK类型，不自定义重复的类型

**实现指导(I)**:
- **算法与流程**:
  - SDK集成步骤:
    ```
    1. 添加@modelcontextprotocol/sdk依赖
    2. 导入SDK中的所需类型和组件
    3. 使用SDK提供的Client类创建MCP客户端
    4. 配置适当的传输方式(StdioClientTransport或StreamableHTTPClientTransport)
    5. 使用SDK的工具调用和资源访问接口
    ```
  
  - 工具调用提取算法 (使用SDK内置功能):
    ```
    1. 使用SDK提供的工具调用解析功能
    2. 处理SDK返回的标准格式工具调用结果
    3. 将SDK的工具调用格式转换为内部格式(必要时)
    ```
  
  - 流分叉处理流程:
    ```
    1. 检测是否为流式响应
    2. 创建两个独立的流：用户展示流和处理流
    3. 用户展示流直接传递给用户界面
    4. 处理流用于工具调用检测和内容收集
    5. 异步监控处理流，检测工具调用意图
    ```
  
  - 递归处理流程:
    ```
    1. 检查上下文中是否有工具执行结果
    2. 验证递归深度是否超过限制
    3. 如需继续处理，创建新上下文对象
    4. 递归执行管道处理新上下文
    5. 合并结果到原始上下文
    ```
  
- **技术选型**:
  - 使用官方SDK提供的Client和Server类
  - 使用SDK提供的类型系统
  - 使用SDK的工具调用和结果处理机制
  - 使用异步迭代器处理流式内容
  - 使用Promise.all处理并行工具调用
  
- **代码模式**:
  - 每个处理器遵循单一职责原则
  - 使用不可变对象模式，避免直接修改上下文
  - 使用访问者模式处理不同类型的内容
  - 使用策略模式处理不同的工具调用格式
  - 使用SDK的标准接口进行交互
  
- **实现策略**:
  1. 先集成SDK并确认基本功能正常
  2. 实现基础处理器(工具准备、对话入口)
  3. 实现工具调用提取和执行处理器
  4. 实现流分叉处理机制
  5. 实现结果格式化处理器
  6. 实现递归处理器
  7. 编写并通过处理器单元测试

- **调试指南**:
  - SDK集成问题的调试方法：
    * 检查SDK版本兼容性
    * 确认导入路径正确
    * 检查SDK类型与内部类型的兼容性
    * 验证SDK客户端初始化参数
  - 处理流式内容时的调试方法:
    * 使用console.log记录流块内容和大小
    * 跟踪异步迭代器的迭代过程
    * 监控分叉流的处理情况
  - 工具调用提取的调试方法:
    * 记录原始内容和正则匹配结果
    * 验证提取的工具名和参数格式
  - 递归处理的调试方法:
    * 记录递归深度和执行路径
    * 监控上下文对象的变化

**成功标准(S)**:
- **基础达标**:
  - 成功集成官方MCP SDK
  - 所有处理器的单元测试通过
  - 成功实现所有七个处理器和管道
  - 工具调用能被正确提取和执行
  - 流式分叉机制能正常工作
  
- **预期品质**:
  - 代码遵循DPML编码规范
  - 实现良好的错误处理机制
  - 代码注释完整，说明关键逻辑
  - 处理器间职责明确分离，无重叠
  - 与官方SDK无缝集成
  
- **卓越表现**:
  - 更高的测试覆盖率
  - 优化性能和内存使用
  - 实现更多工具调用格式的支持
  - 增强递归处理的稳定性和可配置性
  - 贡献相关优化回官方SDK仓库