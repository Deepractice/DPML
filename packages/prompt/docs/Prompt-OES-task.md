# DPML Prompt 开发任务 OES 框架

本文档使用OES框架（目标-环境-成功标准）组织`@dpml/prompt`包的开发任务。每个任务章节包含明确目标、执行环境和成功标准。

## 1. 项目准备与测试环境搭建 ✅

### 目标(O)
- 建立基础项目结构，配置测试环境，为后续TDD开发做好准备
- 确保与core包一致的开发模式，保持项目一致性

### 环境(E)
- **信息资源**
  - Core包README.md (`/packages/core/README.md`)
  - 项目技术栈文档 (`/docs/technical-stack.md`)
  - 架构设计文档 (`/docs/architecture-domain-based.md`)
  - DPML元规范 (`/docs/DPML-Reference.md`)
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **技术栈**
  - TypeScript 5.x
  - Vitest/Jest测试框架
  - tsup构建工具
  - pnpm包管理器
- **约束条件**
  - 测试必须支持Node.js 18+环境
  - 需兼容Core包的工具链和开发模式

### 成功标准(S)
- 目录结构创建完成，符合领域架构设计规范
- 测试环境配置完成并能正常运行基础测试
- 创建基础测试框架文件并运行成功

## 2. 标签定义与注册测试  ✅

### 目标(O)
- 实现八个核心标签的定义和注册功能
- 建立标签验证机制、嵌套规则和ID唯一性检查

### 环境(E)
- **信息资源**
  - Prompt设计文档 (`/packages/prompt/docs/Prompt-Design.md`) 
  - Core包标签注册API参考 (`/packages/core/README.md`)
  - 测试用例文档 (`/packages/prompt/docs/Prompt-UserCase.md`)
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的TagRegistry实现
  - Core包中的TagDefinition接口
- **约束条件**
  - 必须使用Core包提供的TagRegistry机制
  - 标签必须实现必要的验证规则
  - 每个标签需提供清晰的属性定义和嵌套规则

### 成功标准(S)
- 通过UT-P-001至UT-P-005测试用例
- 八个核心标签可正确注册且验证机制有效
- 嵌套规则正确验证，拒绝非法嵌套结构
- 标签ID唯一性检查正常工作

## 3. PromptTagProcessor 实现 ✅

### 目标(O)
- 实现PromptTagProcessor类，处理根标签`<prompt>`的语义和属性

### 环境(E)
- **信息资源**
  - Core包TagProcessor接口文档
  - Prompt设计文档中<prompt>标签定义部分
  - 测试用例UT-PP-001至UT-PP-003
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的TagProcessor实现示例
  - 已完成的标签定义和注册代码
- **约束条件**
  - 必须正确实现TagProcessor接口
  - 需要处理语言属性和子标签收集验证

### 成功标准(S)
- 通过UT-PP-001至UT-PP-003测试用例
- 正确提取和处理prompt标签的基本属性
- 正确处理语言属性并影响后续处理
- 子标签收集与验证功能正常工作

## 4. RoleTagProcessor 实现 ✅

### 目标(O)
- 实现RoleTagProcessor类，处理`<role>`标签的角色定义和描述提取

### 环境(E)
- **信息资源**
  - Prompt设计文档中<role>标签定义部分
  - Core包处理器API参考
  - 测试用例UT-RP-001至UT-RP-002
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的PromptTagProcessor代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须正确提取角色描述文本
  - 需支持角色属性处理

### 成功标准(S)
- 通过UT-RP-001和UT-RP-002测试用例
- 角色属性和内容被正确提取到元数据
- 角色描述文本处理正确

## 5. ContextTagProcessor 实现  ✅

### 目标(O)
- 实现ContextTagProcessor类，处理`<context>`标签的上下文信息提取

### 环境(E)
- **信息资源**
  - Prompt设计文档中<context>标签定义部分
  - Core包处理器API参考
  - 测试用例UT-CP-001至UT-CP-002
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须正确提取上下文文本内容
  - 需支持上下文属性处理

### 成功标准(S)
- 通过UT-CP-001和UT-CP-002测试用例
- 上下文属性和内容被正确提取
- 上下文文本正确提取到元数据

## 6. ThinkingTagProcessor 实现

### 目标(O)
- 实现ThinkingTagProcessor类，处理`<thinking>`标签的思维框架提取

### 环境(E)
- **信息资源**
  - Prompt设计文档中<thinking>标签定义部分
  - 测试用例UT-TP-001至UT-TP-002
  - Prompt设计原则文档 (`/packages/prompt/docs/Prompt_Design_Principles.md`)
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须正确提取思维框架内容
  - 需支持思维框架属性处理

### 成功标准(S)
- 通过UT-TP-001和UT-TP-002测试用例
- 思维框架属性和内容被正确提取
- 思维框架文本正确提取到元数据

## 7. ExecutingTagProcessor 实现

### 目标(O)
- 实现ExecutingTagProcessor类，处理`<executing>`标签的执行步骤提取

### 环境(E)
- **信息资源**
  - Prompt设计文档中<executing>标签定义部分
  - 测试用例UT-EP-001至UT-EP-002
  - Prompt设计原则文档中执行流程模式部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须正确提取执行步骤内容
  - 需支持执行步骤属性处理

### 成功标准(S)
- 通过UT-EP-001和UT-EP-002测试用例
- 执行步骤属性和内容被正确提取
- 执行步骤文本正确提取到元数据

## 8. TestingTagProcessor 实现

### 目标(O)
- 实现TestingTagProcessor类，处理`<testing>`标签的质量检查提取

### 环境(E)
- **信息资源**
  - Prompt设计文档中<testing>标签定义部分
  - 测试用例UT-TTP-001至UT-TTP-002
  - Prompt设计原则文档中自验证模式部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须正确提取质量检查内容
  - 需支持质量检查属性处理

### 成功标准(S)
- 通过UT-TTP-001和UT-TTP-002测试用例
- 质量检查属性和内容被正确提取
- 质量检查文本正确提取到元数据

## 9. ProtocolTagProcessor 实现

### 目标(O)
- 实现ProtocolTagProcessor类，处理`<protocol>`标签的交互协议提取

### 环境(E)
- **信息资源**
  - Prompt设计文档中<protocol>标签定义部分
  - 测试用例UT-PRP-001至UT-PRP-002
  - Prompt设计原则文档中交互协议模式部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须正确提取交互协议内容
  - 需支持交互协议属性处理

### 成功标准(S)
- 通过UT-PRP-001和UT-PRP-002测试用例
- 交互协议属性和内容被正确提取
- 交互协议文本正确提取到元数据

## 10. CustomTagProcessor 实现

### 目标(O)
- 实现CustomTagProcessor类，处理`<custom>`标签的自定义内容提取，实现最小干预原则

### 环境(E)
- **信息资源**
  - Prompt设计文档中<custom>标签定义部分
  - 测试用例UT-CTP-001至UT-CTP-002
  - DPML元规范文档中自定义扩展部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的标签处理器代码
  - Core包中的内容处理相关实现
- **约束条件**
  - 必须遵循最小干预原则处理自定义内容
  - 需支持自定义标签属性处理

### 成功标准(S)
- 通过UT-CTP-001和UT-CTP-002测试用例
- 自定义内容属性被正确处理
- 自定义内容遵循最小干预原则被保留

## 11. 继承机制测试与实现

### 目标(O)
- 实现完整的标签继承机制，支持属性合并、内容继承和跨文件引用

### 环境(E)
- **信息资源**
  - DPML元规范文档中标签继承机制部分
  - 测试用例UT-I-001至UT-I-009
  - Core包中ReferenceResolver接口文档
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的继承相关实现示例
  - 已实现的标签处理器代码
- **约束条件**
  - 必须处理循环继承情况
  - 需支持本地和远程文件引用
  - 需实现明确的属性合并和内容继承规则

### 成功标准(S)
- 通过UT-I-001至UT-I-009所有测试用例
- 正确处理extends属性并合并属性和内容
- 本地和远程文件引用继承功能正常
- 多级继承链和循环继承检测正常工作

## 12. 基础转换功能

### 目标(O)
- 实现将DPML结构转换为纯文本提示的基本功能

### 环境(E)
- **信息资源**
  - Core包中Transformer相关API文档
  - 测试用例UT-PT-001至UT-PT-005
  - Prompt设计文档中转换规则部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的DefaultTransformer实现
  - 已实现的标签处理器代码
- **约束条件**
  - 必须继承Core包的Transformer框架
  - 需支持转换选项配置
  - 需正确处理Markdown内容

### 成功标准(S)
- 通过UT-PT-001至UT-PT-005测试用例
- 各标签能正确序列化为预期文本格式
- 转换选项能正确影响输出结果
- Markdown内容被正确转换

## 13. 格式配置功能

### 目标(O)
- 实现灵活的格式配置机制，支持自定义格式模板和部分格式覆盖

### 环境(E)
- **信息资源**
  - 测试用例UT-FC-001至UT-FC-006
  - Prompt设计文档中格式配置部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的基础转换功能
  - Core包中的配置处理相关实现
- **约束条件**
  - 必须支持默认格式和自定义格式覆盖
  - 需支持标题、前缀、后缀应用
  - 需支持标签顺序定制

### 成功标准(S)
- 通过UT-FC-001至UT-FC-006测试用例
- 默认格式和自定义格式覆盖功能正常
- 标题、前缀、后缀应用正确
- 标签顺序定制功能有效

## 14. 多语言支持功能

### 目标(O)
- 实现多语言支持功能，特别是中文处理的特殊规则

### 环境(E)
- **信息资源**
  - 测试用例UT-ML-001至UT-ML-006
  - Prompt设计文档中多语言支持部分
  - 各语言特定格式规范文档
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的格式配置功能
  - Core包中的语言处理相关功能
- **约束条件**
  - 必须支持lang属性影响输出
  - 需支持语言特定格式模板
  - 中文格式需特殊处理

### 成功标准(S)
- 通过UT-ML-001至UT-ML-006测试用例
- lang属性正确影响输出格式和内容
- 语言特定格式被正确应用
- 中文格式规则被正确应用

## 15. API功能实现

### 目标(O)
- 实现核心API函数generatePrompt，提供简单易用的接口

### 环境(E)
- **信息资源**
  - 测试用例UT-API-001至UT-API-005
  - Prompt设计文档中API部分
  - Core包中的API设计模式参考
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的所有底层功能
  - Core包中的API实现示例
- **约束条件**
  - 必须提供简洁直观的接口
  - 需处理各种错误情况
  - 需支持配置选项传递

### 成功标准(S)
- 通过UT-API-001至UT-API-005测试用例
- 基本功能正常工作，生成预期的提示文本
- 配置选项正确影响生成结果
- 错误处理机制工作正常

## 16. processPrompt 和 transformPrompt 实现

### 目标(O)
- 实现processPrompt和transformPrompt函数，提供更细粒度的API控制

### 环境(E)
- **信息资源**
  - 测试用例UT-PRP-001至UT-PRP-004和UT-TRP-001至UT-TRP-004
  - Prompt设计文档中API部分
  - Core包中的处理和转换API参考
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 已实现的generatePrompt功能
  - Core包中的处理器和转换器实现
- **约束条件**
  - 必须提供明确的处理和转换选项
  - 需支持严格模式切换
  - 需支持基础路径设置

### 成功标准(S)
- 通过所有相关测试用例
- 处理函数正确解析DPML文档
- 转换函数正确生成文本输出
- 各种选项配置工作正常

## 17. 错误处理实现

### 目标(O)
- 实现全面的错误处理机制，提供友好的错误信息和精确的位置提示

### 环境(E)
- **信息资源**
  - 测试用例UT-ERR-001至UT-ERR-007
  - Core包中的错误处理机制文档
  - DPML元规范中的错误处理部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - Core包中的DPMLError实现
  - 已实现的各功能模块
- **约束条件**
  - 必须提供友好且明确的错误信息
  - 需包含准确的错误位置信息
  - 需分类处理不同类型的错误

### 成功标准(S)
- 通过UT-ERR-001至UT-ERR-007测试用例
- 各类错误被正确捕获并提供清晰消息
- 错误位置信息准确指向问题源
- 不同类型错误有明确区分

## 18. 集成测试

### 目标(O)
- 编写并实现全面的集成测试，验证系统整体功能正常

### 环境(E)
- **信息资源**
  - 测试用例IT-P-001至IT-P-007
  - Core包集成测试示例
  - 项目技术栈文档中的测试部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 所有已实现的功能模块
  - Core包中的测试工具
- **约束条件**
  - 必须覆盖端到端完整流程
  - 需测试与Core包的集成
  - 需测试复杂提示和多文件继承

### 成功标准(S)
- 通过IT-P-001至IT-P-007所有集成测试
- 端到端基本流程正常工作
- 与Core包集成工作正常
- 复杂提示和多文件继承测试通过

## 19. 性能测试

### 目标(O)
- 实现性能测试，验证系统在各种条件下的性能表现符合预期

### 环境(E)
- **信息资源**
  - 测试用例PT-P-001至PT-P-005
  - 项目技术栈文档中的性能目标部分
  - 性能测试工具文档
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 所有已实现的功能模块
  - 性能测试基准示例
- **约束条件**
  - 处理1MB文档内存使用<200MB
  - 100KB文档解析<500ms
  - 需测试并发处理性能

### 成功标准(S)
- 通过PT-P-001至PT-P-005性能测试
- 基本性能指标符合要求
- 大型文档处理不超时，内存占用合理
- 并发处理性能在可接受范围内

## 20. 实际用例测试

### 目标(O)
- 使用真实场景用例测试系统，验证实际应用效果

### 环境(E)
- **信息资源**
  - 测试用例UC-P-001至UC-P-006
  - Prompt-UserCase.md中的用例描述
  - Prompt设计原则文档中的用例部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 所有已实现的功能模块
  - 示例提示模板
- **约束条件**
  - 必须覆盖多种角色场景
  - 需测试多语言提示
  - 需验证继承复用场景

### 成功标准(S)
- 通过UC-P-001至UC-P-006所有用例测试
- 各类角色提示生成符合预期
- 多语言提示表现正常
- 继承复用功能在实际场景中有效

## 21. 兼容性测试

### 目标(O)
- 验证系统在不同环境和配置下的兼容性表现

### 环境(E)
- **信息资源**
  - 测试用例CT-P-001至CT-P-005
  - 项目技术栈文档中的兼容性目标部分
  - 各环境配置文档
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 所有已实现的功能模块
  - 兼容性测试辅助工具
- **约束条件**
  - 必须支持Node.js 16+
  - 需兼容ESM和CommonJS
  - 需兼容不同TypeScript版本

### 成功标准(S)
- 通过CT-P-001至CT-P-005所有兼容性测试
- 在支持的Node.js版本上正常工作
- 在CommonJS和ESM环境中正常工作
- TypeScript类型在不同版本中正确工作

## 22. 文档和示例

### 目标(O)
- 完善API文档、使用示例和最佳实践指南

### 环境(E)
- **信息资源**
  - Prompt设计文档
  - Core包文档示例
  - 项目技术栈文档中的文档工具部分
  - 项目编码规范 (`/docs/monorepo-coding-standards.md`)
- **相关代码**
  - 所有已实现的功能模块
  - 示例代码
- **约束条件**
  - API文档必须清晰完整
  - 需提供多种使用示例
  - 需包含错误处理指南

### 成功标准(S)
- API文档完整覆盖所有公开接口
- 使用示例涵盖常见场景
- 最佳实践指南内容丰富实用
- 错误处理文档清晰明确 