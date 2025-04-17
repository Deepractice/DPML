# DPML Parser 开发任务 OES 框架

> 注意：本文档中，`$dpml`表示项目根目录（即整个DPML项目的根目录），例如：`$dpml/docs/monorepo-coding-standards.md`指向项目根目录下的docs文件夹中的monorepo-coding-standards.md文件。

本文档使用OES框架（目标-环境-成功标准）组织`@dpml/parser`包的开发任务。每个任务章节包含明确目标、执行环境和成功标准。

## 1. XML解析适配器实现

### 目标(O)

- 使用适配器模式构建DPML和XML之间的转换层
- 基于fast-xml-parser库实现高效的XML解析
- 确保适配器隔离底层XML实现细节与上层DPML处理逻辑
- 提供统一、稳定的解析接口，屏蔽底层实现变化可能性

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **技术栈**
  - TypeScript 5.x
  - fast-xml-parser库（用于XML解析）
  - Node.js 18+
  - pnpm包管理器
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 适配器必须完全隔离底层实现细节
  - 解析接口必须考虑未来扩展性
  - 提供类型安全的API
  - XML配置选项需可自定义（空白处理、错误处理等）

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及相关单元测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过UT-Parser-BasicParse、UT-Parser-FileIO等基础解析测试
- 成功使用fast-xml-parser解析DPML文本
- 适配器正确转换XML对象到DPML文档模型
- 解析器能处理各种格式的DPML内容（空标签、嵌套标签、文本内容等）
- 适配层提供良好的错误处理和报告
- 所有公共API有完整类型定义

## 2. 标签注册表实现

### 目标(O)

- 实现全局和独立的标签注册表系统
- 开发标签定义和验证机制
- 实现标签属性和内容模型验证
- 支持自定义验证规则和嵌套规则

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - XML解析适配器实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 注册表必须支持全局单例和独立实例
  - 标签定义必须包含必要属性、内容模型和嵌套规则
  - 提供高效的标签查找机制
  - 验证逻辑必须可扩展和自定义

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及相关单元测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过UT-Parser-TagReg、UT-Parser-TagDef、UT-Parser-TagAttr等标签测试
- 成功实现标签注册、查找和验证功能
- 支持不同内容模型（空、文本、混合）的验证
- 标签属性正确验证（必需属性、属性类型）
- 嵌套规则验证正确工作
- 支持全局注册表和独立注册表实例
- 提供类型安全的API

## 3. 文档对象模型实现

### 目标(O)

- 实现DPML文档对象模型，表示解析后的文档结构
- 开发节点、属性和文本内容的表示和操作API
- 实现节点查询和遍历功能
- 开发文档序列化和字符串转换功能

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - XML解析适配器实现
  - 标签注册表实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 文档模型必须提供清晰的层次结构
  - 节点API必须类型安全且直观
  - 查询API必须高效且功能完整
  - 文档序列化必须保持结构完整性

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及相关单元测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过UT-Parser-DocRoot、UT-Parser-NodeProps等文档结构测试
- 节点属性和内容访问API完整且易用
- 节点层级关系（父子、兄弟）正确构建
- ID索引和查询功能正确工作
- 选择器查询功能按预期工作
- 文档序列化生成正确的DPML字符串
- 节点位置信息正确记录

## 4. 验证器实现

### 目标(O)

- 实现DPML文档验证系统，支持语法和结构验证
- 开发基于标签定义的验证机制
- 实现错误收集和报告功能
- 支持自定义验证规则和验证级别

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - 标签注册表实现
  - 文档对象模型实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 验证必须提供清晰的错误位置和描述
  - 支持不同级别的验证严格性
  - 验证机制必须可扩展
  - 提供同步和异步验证选项

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及相关单元测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过UT-Parser-ValidationErr、UT-Parser-MissingAttr等错误处理测试
- 标签语法验证正确识别错误
- 标签属性验证正确检查必需属性和类型
- 嵌套关系验证正确检查无效嵌套
- 错误报告包含准确的位置信息和清晰描述
- 支持跳过非严重错误继续验证
- 自定义验证规则正确注册和执行

## 5. 解析器核心实现

### 目标(O)

- 整合适配器、注册表和验证器，实现完整解析流程
- 开发解析选项和配置系统
- 实现同步和异步解析API
- 开发文件和流解析功能

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - XML解析适配器实现
  - 标签注册表实现
  - 文档对象模型实现
  - 验证器实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 解析接口必须简单直观
  - 提供合理默认配置和完整配置选项
  - 解析性能必须达到目标水平
  - 确保安全的错误处理和恢复

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及相关单元测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过UT-Parser-BasicParse、UT-Parser-Options、UT-Parser-AsyncParse等解析测试
- 同步解析方法正确处理字符串输入
- 异步解析方法正确处理文件和流输入
- 解析选项正确应用（空白处理、验证等）
- 错误处理提供有用的诊断信息
- 解析性能在目标范围内
- 公共API接口清晰明确

## 6. 错误处理系统实现

### 目标(O)

- 实现结构化的错误类型和处理系统
- 开发详细的错误位置和上下文信息
- 实现错误恢复和部分解析功能
- 创建友好的错误消息和建议

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - XML解析适配器实现
  - 验证器实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 错误类型必须结构化且类型安全
  - 错误消息必须清晰且有帮助
  - 提供准确的错误位置和上下文
  - 支持错误恢复策略配置

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及相关单元测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过UT-Parser-SyntaxErr、UT-Parser-ErrLocation、UT-Parser-ErrRecovery等错误处理测试
- 错误包含准确的行列位置信息
- 错误消息清晰描述问题和可能原因
- 特定错误类型正确继承基本错误类
- 错误恢复策略允许部分解析
- 错误处理不导致内存泄漏或状态不一致
- 严重错误和非严重错误有不同处理路径

## 7. 集成测试实现

### 目标(O)

- 实现完整的集成测试套件
- 验证Parser包的全面功能和边缘情况
- 测试各组件间的交互和协作
- 确保不同环境下的一致行为

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - 完整的Parser包实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 测试覆盖率必须达到目标水平
  - 测试必须考虑各种输入场景
  - 确保测试可重复且稳定
  - 适当模拟外部依赖

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及所有集成测试
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过IT-Parser-CoreIntegration、IT-Parser-FullFlow等集成测试
- 所有关键功能路径有测试覆盖
- 边缘情况和错误场景有测试覆盖
- 组件间交互正确且稳定
- 测试可以稳定重复运行
- 测试覆盖率达到目标水平

## 8. 性能优化

### 目标(O)

- 优化解析和验证性能
- 实现内存高效的文档对象模型
- 开发大文档和流处理的性能优化策略
- 创建性能测试和基准测试套件

### 环境(E)

- **信息资源**
  - Parser API设计文档 (`$dpml/packages/core/docs/product/parser-api-design.md`)
  - Parser测试用例文档 (`$dpml/packages/core/docs/develop/parser-testcases.md`)
  - 项目编码规范 (`$dpml/docs/monorepo-coding-standards.md`)
  - 测试标准文档 (`$dpml/rules/testing-rules.md`)
- **相关代码**
  - 完整的Parser包实现
- **约束条件**
  - **必须严格遵守`$dpml/rules`目录下的所有规则，包括目录结构、导入导出、API设计等规范**
  - 性能优化不得降低功能完整性
  - 内存使用必须在目标范围内
  - 大文档处理必须有可接受性能
  - 保持API稳定性和兼容性

### 成功标准(S)

- 通过 pnpm build 无编译错误
- 通过 pnpm test 及性能测试用例
- **代码完全符合项目规范，遵守`$dpml/rules`目录下的所有规则**
- 通过PT-Parser-Basic、PT-Parser-LargeDoc、PT-Parser-Memory等性能测试
- 小型文档解析时间达到目标水平
- 大型文档解析性能可接受
- 内存使用在目标范围内
- 连续解析和重复解析性能稳定
- 流处理能够处理超大文档
- 性能优化不影响API稳定性和功能完整性 