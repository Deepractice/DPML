# DPML Agent 开发任务 OES 框架

> 注意：本文档中，`$dpml`表示项目根目录（即整个DPML项目的根目录），例如：`$dpml/docs/monorepo-coding-standards.md`指向项目根目录下的docs文件夹中的monorepo-coding-standards.md文件。

本文档使用OES框架（目标-环境-成功标准）组织`@dpml/agent`包的开发任务。每个任务章节包含明确目标、执行环境和成功标准。

## 1. 项目准备与测试环境搭建 ✅

### 目标(O)
- 建立基础项目结构，配置测试环境，为后续TDD开发做好准备
- 确保与core包和prompt包一致的开发模式，保持项目一致性
- 设置基础标签系统和测试框架

### 环境(E)
- **信息资源**
  - Core包README.md (`$dpml/packages/core/README.md`)
  - Prompt包README.md (`$dpml/packages/prompt/README.md`)
  - 项目技术栈文档 (`$dpml/docs/technical-stack.md`)
  - 架构设计文档 (`$dpml/docs/architecture-domain-based.md`) 
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - DPML元规范 (`$dpml/docs/DPML-Reference.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - DPML设计博客 (`https://www.deepracticex.com/blog/dpml-design.html`)
- **技术栈**
  - TypeScript 5.x
  - Vitest/Jest测试框架
  - tsup构建工具
  - pnpm包管理器
- **约束条件**
  - 测试必须支持Node.js 18+环境
  - 需兼容Core包和Prompt包的工具链和开发模式
  - 项目结构必须符合Monorepo编码规范

### 成功标准(S)
- 目录结构创建完成，符合领域架构设计规范
- 测试环境配置完成并能正常运行基础测试
- 创建基础测试框架文件并运行成功
- 通过`pnpm test`命令验证基础环境正常

## 2. 标签定义与注册实现 ✅

### 目标(O)
- 实现三个核心标签（agent、llm、prompt）的定义和注册功能
- 构建标签验证机制、嵌套规则和ID唯一性检查
- 保持与Core包标签系统的一致性

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - Agent标签设计文档 (`$dpml/packages/agent/docs/agent-tag-design.md`)
  - LLM标签设计文档 (`$dpml/packages/agent/docs/llm-tag-design.md`)
  - Prompt标签设计文档 (`$dpml/packages/agent/docs/prompt-tag-design.md`)
  - Core包标签注册API参考 (`$dpml/packages/core/README.md`)
  - 测试用例文档 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的TagRegistry实现
  - Core包中的TagDefinition接口
  - Prompt包中的标签注册代码
- **约束条件**
  - 必须使用Core包提供的TagRegistry机制
  - 标签必须实现必要的验证规则
  - 每个标签需提供清晰的属性定义和嵌套规则
  - 必须考虑安全最佳实践，特别是LLM标签的API密钥处理

### 成功标准(S)
- 通过UT-A-001至UT-A-005测试用例
- 三个核心标签可正确注册且验证机制有效
- 嵌套规则正确验证，拒绝非法嵌套结构
- 标签ID唯一性检查正常工作
- 标签定义符合各自设计文档中的规范

## 3. AgentTagProcessor 实现 ✅

### 目标(O)
- 实现AgentTagProcessor类，处理根标签`<agent>`的语义和属性
- 实现ID验证、版本处理和子标签收集功能
- 支持extends属性处理继承关系

### 环境(E)
- **信息资源**
  - Core包TagProcessor接口文档
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - Agent标签设计文档 (`$dpml/packages/agent/docs/agent-tag-design.md`)
  - 测试用例UT-AP-001至UT-AP-003 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的TagProcessor实现示例
  - 已完成的标签定义和注册代码
  - Core包中的继承处理相关代码
- **约束条件**
  - 必须正确实现TagProcessor接口
  - 需要处理agent标签的基本属性
  - 必须支持extends继承机制
  - 必须验证必需子标签的存在性

### 成功标准(S)
- 通过UT-AP-001至UT-AP-003测试用例
- 正确提取和处理agent标签的基本属性(id, version)
- 子标签收集与验证功能正常工作，特别是llm和prompt子标签
- 正确记录extends属性值（继承逻辑由Core包处理）

## 4. LLMTagProcessor 实现 ✅

### 目标(O)
- 实现LLMTagProcessor类，处理`<llm>`标签的LLM配置和API设置
- 实现API密钥环境变量安全处理机制
- 支持模型验证和API类型验证

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - LLM标签设计文档 (`$dpml/packages/agent/docs/llm-tag-design.md`)
  - Core包处理器API参考
  - 测试用例UT-LP-001至UT-LP-006 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的AgentTagProcessor代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须对api-type、api-url等属性进行有效性验证
  - 必须安全处理key-env属性，不保存或记录实际密钥值
  - 必须支持extends继承机制
  - 需考虑多种LLM提供商支持

### 成功标准(S)
- 通过UT-LP-001至UT-LP-006测试用例
- 正确提取和验证LLM配置属性
- API密钥环境变量名被安全处理，不记录或暴露实际密钥值
- API类型和模型名称验证正常工作
- 正确记录extends属性值（继承逻辑由Core包处理）

## 5. PromptTagProcessor 实现 ✅

### 目标(O)
- 实现PromptTagProcessor类，处理`<prompt>`标签
- 实现与@dpml/prompt包的集成和委托处理
- 支持extends继承机制

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - Prompt标签设计文档 (`$dpml/packages/agent/docs/prompt-tag-design.md`)
  - Prompt包API文档 (`$dpml/packages/prompt/README.md`)
  - 测试用例UT-APP-001至UT-APP-003 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Prompt包中的提示词处理相关代码
  - Core包中的继承处理相关代码
- **约束条件**
  - 必须实现对@dpml/prompt包的委托，不重新实现提示词处理
  - 必须支持extends继承机制
  - 遵循"不重复造轮子"原则

### 成功标准(S)
- 通过UT-APP-001至UT-APP-003测试用例
- 成功委托@dpml/prompt包处理提示词内容
- 提示词内容被正确提取和处理
- 正确记录extends属性值（继承逻辑由Core包处理）

## 6. API密钥管理实现 ✅

### 目标(O)
- 实现安全的API密钥管理系统
- 支持从环境变量获取和验证密钥
- 实现密钥轮换和更新机制
- 确保密钥值不被记录到日志或错误消息中

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - LLM标签设计文档 (`$dpml/packages/agent/docs/llm-tag-design.md`)
  - 测试用例UT-KEY-001至UT-KEY-007 (`$dpml/docs/Agent-UserCase.md`)
  - 安全最佳实践文档
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的LLMTagProcessor代码
  - Node.js环境变量处理相关代码
- **约束条件**
  - 绝不记录或暴露实际API密钥值
  - 提供明确但安全的错误信息，不透露敏感信息
  - 支持多个环境变量作为密钥源（主密钥和备用密钥）
  - 实现恰当的密钥格式验证，但不保存验证后的密钥

### 成功标准(S)
- 通过UT-KEY-001至UT-KEY-007测试用例
- 成功从环境变量获取API密钥
- 恰当验证API密钥格式
- 环境变量缺失时提供明确错误信息
- 密钥值不被记录到日志或错误信息中
- 支持运行时密钥更新
- 在主密钥失效时自动尝试备用密钥
- 正确实现密钥加载优先级机制

## 7. LLM连接器实现 ✅

### 目标(O)
- 实现LLMConnector接口和具体实现类（OpenAI, Anthropic等）
- 开发请求重试机制和错误处理
- 实现流式响应处理和token统计
- 支持多种LLM提供商的API访问

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - LLM标签设计文档 (`$dpml/packages/agent/docs/llm-tag-design.md`)
  - OpenAI API文档
  - Anthropic API文档
  - 测试用例UT-LC-001至UT-LC-010 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的API密钥管理代码
  - Fetch API或Axios等HTTP客户端库
- **约束条件**
  - 提供统一接口适配不同的LLM提供商
  - 必须实现错误处理和重试逻辑
  - 支持流式响应处理
  - 实现token使用统计
  - 处理速率限制和其他API限制
  - 确保不记录或暴露API密钥

### 成功标准(S)
- 通过UT-LC-001至UT-LC-010测试用例
- 成功连接并调用OpenAI和Anthropic API
- 支持本地模型连接
- 连接超时和错误被正确处理
- 临时错误时自动按策略重试
- API错误能被解析为友好的错误信息
- 检测到速率限制时自动等待或降级
- 成功处理流式响应并正确分块
- 准确计算token使用量

## 8. 代理状态管理实现 ✅

### 目标(O)
- 实现代理状态模型和转换机制
- 开发状态事件系统
- 实现状态序列化和持久化功能
- 支持状态恢复和并发访问

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UT-ST-001至UT-ST-008 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 状态管理模式文档
- **相关代码**
  - 已实现的Agent基础代码
  - 事件处理相关代码
- **约束条件**
  - 状态模型必须清晰定义所有可能的状态
  - 实现事件驱动的状态变更机制
  - 提供状态序列化和反序列化功能
  - 支持并发状态访问的安全处理

### 成功标准(S)
- 通过UT-ST-001至UT-ST-008测试用例
- 状态被正确初始化为默认值
- 状态按预期在各状态间转换
- 无效状态转换被检测和拒绝
- 状态变更时正确触发对应事件
- 状态能被正确序列化和反序列化
- 成功从持久化数据恢复状态
- 状态超时被检测和正确处理
- 并发访问时保持状态一致性

## 9. 记忆系统实现 ✅

### 目标(O)
- 实现代理记忆系统接口和基础实现
- 开发内存存储和文件系统存储实现
- 支持会话记忆管理和记忆检索
- 实现记忆压缩和容量管理功能

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UT-MEM-001至UT-MEM-010 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的代理状态管理代码
  - Node.js文件系统API
- **约束条件**
  - 提供简洁的记忆接口抽象
  - 实现可替换的存储后端
  - 支持会话隔离和记忆检索
  - 允许记忆清除和压缩

### 成功标准(S)
- 通过UT-MEM-001至UT-MEM-010测试用例
- 记忆项被正确存储和检索
- 会话记忆被正确关联到对应会话
- 成功检索指定会话的记忆
- 成功清除指定会话的记忆
- 内存存储和文件系统存储实现正常工作
- 成功基于查询检索相关记忆
- 成功压缩冗长对话历史
- 重要记忆被优先保留
- 到达容量限制时正确处理

## 10. 事件系统实现 ✅

### 目标(O)
- 实现代理事件系统
- 支持生命周期和处理阶段事件
- 开发事件注册、触发和错误处理机制
- 实现事件参数传递和异步处理

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UT-EV-001至UT-EV-007 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 事件模式最佳实践
- **相关代码**
  - 已实现的状态管理代码
  - Node.js EventEmitter或类似库
- **约束条件**
  - 提供简洁但功能完备的事件API
  - 支持异步事件处理
  - 实现事件错误处理和恢复
  - 提供事件监听器管理功能

### 成功标准(S)
- 通过UT-EV-001至UT-EV-007测试用例
- 事件被正确注册和触发
- 生命周期事件按预期触发
- 处理阶段事件按预期触发
- 异步事件处理符合预期
- 事件处理器错误被正确捕获
- 参数被正确传递给事件处理器
- 监听器被正确移除

## 11. 代理执行实现 ✅

### 目标(O)
- 实现代理执行流程
- 开发输入处理和上下文构建功能
- 实现LLM调用和响应处理
- 支持流式执行模式
- 开发多会话管理和执行控制

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UT-EX-001至UT-EX-010 (`$dpml/docs/Agent-UserCase.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的LLM连接器代码
  - 已实现的记忆系统代码
  - 已实现的状态管理代码
  - 已实现的事件系统代码
- **约束条件**
  - 整合各个子系统形成完整执行流程
  - 实现同步和流式执行模式
  - 支持多会话并发管理
  - 提供执行控制（中断和恢复）
  - 处理超时情况

### 成功标准(S)
- 通过UT-EX-001至UT-EX-010测试用例
- 执行流程按预期进行
- 输入被正确处理和验证
- 上下文正确包含系统提示和历史
- LLM被正确调用并获取响应
- 响应被正确解析和处理
- 流式执行正确传递部分响应
- 多个会话被正确隔离和处理
- 执行可以被正确中断和恢复
- 超时被检测并正确处理

## 12. 错误处理实现 ✅

### 目标(O)
- 实现全面的错误处理系统
- 开发特定类型错误和错误码
- 实现友好错误消息和位置信息
- 支持重试策略和降级机制

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UT-ERR-001至UT-ERR-009 (`$dpml/docs/Agent-UserCase.md`)
  - Core包错误处理文档
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的DPMLError实现
  - 已实现的各个子系统代码
- **约束条件**
  - 提供统一的错误处理接口
  - 定义清晰的错误类型和错误码
  - 实现友好且有用的错误消息
  - 支持错误重试和降级策略
  - 确保错误信息不暴露敏感数据

### 成功标准(S)
- 通过UT-ERR-001至UT-ERR-009测试用例
- 解析错误提供友好信息和位置
- 标签验证错误有明确的错误信息
- LLM连接错误有明确的错误信息
- API认证错误提供清晰信息而不暴露密钥
- 速率限制错误提供信息和建议
- 记忆系统错误有明确信息
- 临时错误按策略重试
- 主要服务不可用时尝试备用选项
- 非致命错误后能继续执行

## 13. 安全功能实现

### 目标(O)
- 实现API密钥保护机制
- 开发环境变量验证系统
- 实现输入验证和净化功能
- 开发日志和错误信息安全控制
- 实现路径遍历防护

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UT-SEC-001至UT-SEC-007 (`$dpml/docs/Agent-UserCase.md`)
  - 安全最佳实践文档
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的API密钥管理代码
  - 已实现的错误处理代码
  - 日志系统代码
- **约束条件**
  - 实现多层次的安全防护
  - 确保敏感信息不被记录或暴露
  - 实现输入验证和过滤
  - 日志和错误信息不包含敏感数据
  - 防止路径遍历和其他安全漏洞

### 成功标准(S)
- 通过UT-SEC-001至UT-SEC-007测试用例
- API密钥不被记录或暴露
- 环境变量缺失被及时检测
- 潜在危险输入被正确验证和过滤
- 敏感信息被正确保护
- 日志不包含敏感信息
- 错误信息不暴露敏感实现细节
- 防止引用路径造成安全问题

## 14. 集成实现与测试

### 目标(O)
- 集成所有组件形成完整代理系统
- 实现与Core包和Prompt包的集成
- 开发端到端处理流程
- 实现复杂代理定义处理和多文件继承

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例IT-A-001至IT-A-008 (`$dpml/docs/Agent-UserCase.md`)
  - Core包和Prompt包文档
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 所有已实现的组件
  - Core包和Prompt包API
- **约束条件**
  - 实现完整的集成功能
  - 确保各组件无缝协作
  - 支持复杂的代理定义和继承
  - 实现外部API集成
  - 提供CLI工具集成

### 成功标准(S)
- 通过IT-A-001至IT-A-008测试用例
- 从定义到执行的流程正常工作
- 正确使用Core包功能并扩展
- 成功集成Prompt包功能处理提示词
- 成功处理包含各种配置的复杂代理
- 成功解析和处理跨文件继承
- 成功集成并调用外部API
- 成功使用持久化存储保存状态和记忆
- 成功通过CLI运行代理

## 15. 性能优化

### 目标(O)
- 优化代理处理性能
- 改进内存使用效率
- 确保长时间运行稳定性
- 优化API调用和token使用

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例PT-A-001至PT-A-007 (`$dpml/docs/Agent-UserCase.md`)
  - 性能优化最佳实践
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 完整的代理实现
  - 性能测试工具
- **约束条件**
  - 不牺牲功能和可靠性换取性能
  - 内存使用保持在合理范围
  - 长时间运行不出现内存泄漏
  - 优化API调用和token使用

### 成功标准(S)
- 通过PT-A-001至PT-A-007测试用例
- 处理时间在可接受范围内
- 内存占用在合理范围内，无泄漏
- 长时间运行不出现内存泄漏或性能下降
- 大量记忆项处理性能在可接受范围内
- 并发处理正常工作，性能提升明显
- API调用次数和参数优化合理
- token使用量在合理范围内，没有不必要的浪费

## 16. 实际用例测试

### 目标(O)
- 使用真实场景测试代理功能
- 验证不同类型代理的实际表现
- 测试多轮对话和模型切换能力

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例UC-A-001至UC-A-006 (`$dpml/docs/Agent-UserCase.md`)
  - DPML设计博客 (`https://www.deepracticex.com/blog/dpml-design.html`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 完整的代理实现
  - 示例代理定义
- **约束条件**
  - 测试多种类型的代理用例
  - 验证复杂多轮对话能力
  - 测试不同模型切换功能
  - 使用真实LLM API（需要有效的API密钥）

### 成功标准(S)
- 通过UC-A-001至UC-A-006测试用例
- 研究助手代理能正确执行研究助手功能
- 编程助手代理能正确执行编程助手功能
- 客服代理能正确执行客服功能
- 数据分析代理能正确执行数据分析功能
- 代理能维持上下文并进行多轮对话
- 代理能根据需要切换不同模型

## 17. 兼容性测试

### 目标(O)
- 验证代理在不同环境中的兼容性
- 测试与不同版本依赖包的兼容性
- 确保与不同LLM提供商和API版本的兼容性

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 测试用例CT-A-001至CT-A-007 (`$dpml/docs/Agent-UserCase.md`)
  - Node.js文档
  - 浏览器环境文档
  - Core包和Prompt包文档
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 完整的代理实现
  - 兼容性测试脚本
- **约束条件**
  - 测试多种环境的兼容性
  - 验证不同依赖版本的兼容性
  - 测试不同模块系统支持
  - 确保跨LLM提供商兼容性

### 成功标准(S)
- 通过CT-A-001至CT-A-007测试用例
- 在支持的Node.js版本上正常工作
- 在浏览器环境中正常工作
- 与指定范围的Core包版本兼容
- 与指定范围的Prompt包版本兼容
- 在CommonJS和ESM模块系统中正常工作
- 与主要LLM提供商API兼容
- 适应不同API版本的变化

## 18. 文档和示例

### 目标(O)
- 编写全面的API文档
- 创建各种使用示例
- 开发最佳实践指南
- 完善错误处理文档

### 环境(E)
- **信息资源**
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - LLM标签设计文档 (`$dpml/packages/agent/docs/llm-tag-design.md`)
  - Agent标签设计文档 (`$dpml/packages/agent/docs/agent-tag-design.md`)
  - Prompt标签设计文档 (`$dpml/packages/agent/docs/prompt-tag-design.md`)
  - Core包和Prompt包文档
  - DPML设计博客 (`https://www.deepracticex.com/blog/dpml-design.html`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 完整的代理实现
  - 使用示例代码
- **约束条件**
  - 文档必须全面且准确
  - 示例必须涵盖常见使用场景
  - 最佳实践应包含安全和性能建议
  - 错误处理文档应提供明确的解决方案

### 成功标准(S)
- README.md包含清晰的入门指南
- API文档涵盖所有公共接口和类型
- 示例代码演示常见使用场景
- 提供错误处理和问题排查指南
- 包含安全和性能最佳实践
- 文档风格与Core包和Prompt包一致

## 19. 标签继承机制职责说明

### 目标(O)
- 明确标签继承机制的职责分工
- 确保各领域包正确理解并遵循继承机制设计
- 统一标签处理器实现方式，确保代码一致性

### 环境(E)
- **信息资源**
  - Core包标签继承设计文档 (`$dpml/packages/core/docs/inheritance-mechanism.md`)
  - Core包处理器设计文档 (`$dpml/packages/core/docs/processor/Core-Processor-Design.md`)
  - Core包的AbstractTagProcessor实现 (`$dpml/packages/core/src/processor/tagProcessors/abstractTagProcessor.ts`)
  - Agent设计文档 (`$dpml/packages/agent/docs/agent-design.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的InheritanceVisitor实现
  - Core包中的DomainTagVisitor实现
  - Core包中的AbstractTagProcessor实现
  - 各领域包的TagProcessor实现
- **约束条件**
  - 确保职责边界清晰
  - 避免重复实现继承逻辑
  - 遵循DRY原则
  - 使用统一的元数据存储方式

### 成功标准(S)
- 明确说明Core包和领域包在标签继承中的职责分工：
  - Core包（InheritanceVisitor）：完全负责标签继承的核心逻辑，包括属性合并、内容覆盖等
  - 领域包TagProcessor：
    - 不负责实现或处理继承逻辑
    - 不需要记录或处理extends属性
    - 专注于处理领域特定属性和语义
- 提供正确的TagProcessor实现模式：
  - 所有TagProcessor应继承自AbstractTagProcessor基类
  - 子类应实现必要的抽象方法和属性
  - 元数据应使用`element.metadata[this.tagName]`存储，而非`element.metadata.semantic`
- 提供明确的实现示例，包括：
  - AbstractTagProcessor的继承方式
  - 正确的元数据存储方式
  - 处理特定属性的最佳实践
- 开发人员理解并正确实现各自职责
- 避免重复实现继承逻辑
- 所有文档和代码保持一致的职责描述和实现方式

### 实现指南

#### 正确的TagProcessor实现方式

1. 继承AbstractTagProcessor基类：

```typescript
import { Element, ProcessingContext } from '@dpml/core';
import { AbstractTagProcessor } from '@dpml/core';

export class AgentTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'AgentTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'agent';
  
  /**
   * 处理器优先级
   */
  priority = 10;
  
  /**
   * 处理特定属性
   * @param attributes 除id和extends外的属性
   * @param element 原始元素
   * @param context 处理上下文
   * @returns 特定的元数据对象
   */
  protected processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Record<string, any> {
    // 提取agent特定属性
    const version = attributes.version;
    const type = attributes.type;
    
    // 收集子标签信息（如工具、内存配置等）
    const tools = this.extractTools(element);
    const memory = this.extractMemoryConfig(element);
    
    // 返回agent特定的元数据
    return {
      version,
      type,
      tools,
      memory,
      attributes  // 保存其他属性
    };
  }
  
  /**
   * 提取工具配置（示例方法）
   */
  private extractTools(element: Element): any[] {
    const toolElements = this.findChildrenByTagName(element, 'tool');
    return toolElements.map(tool => ({
      name: tool.attributes.name,
      type: tool.attributes.type
    }));
  }
  
  /**
   * 提取内存配置（示例方法）
   */
  private extractMemoryConfig(element: Element): any {
    const memoryElement = this.findFirstChildByTagName(element, 'memory');
    if (!memoryElement) return null;
    
    return {
      type: memoryElement.attributes.type,
      capacity: memoryElement.attributes.capacity
    };
  }
}
```

2. 元数据存储方式：
   - AbstractTagProcessor基类会自动使用`element.metadata[this.tagName]`存储元数据
   - 不要使用`element.metadata.semantic`
   - 返回的元数据会按照正确格式存储

3. 注意事项：
   - 不需要手动处理extends属性，它已被InheritanceVisitor处理
   - 不需要手动处理id属性，AbstractTagProcessor已处理
   - 专注于处理特定领域的属性和语义
   - 使用基类提供的辅助方法（如findChildrenByTagName）处理子元素

4. 标准处理流程：
   - InheritanceVisitor首先处理标签继承（高优先级）
   - 处理完成后，标签的属性已包含父标签合并后的属性
   - 然后DomainTagVisitor调用各TagProcessor处理特定语义
   - TagProcessor只需处理已合并后的属性，无需关心继承关系

通过遵循以上指南，可以确保标签处理器实现的一致性和正确性，同时避免重复实现继承逻辑，提高代码质量和可维护性。 