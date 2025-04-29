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
- 我将确保实现满足所有测试要求，不妥协代码质量

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
- 我绝不通过修改测试代码的方式通过测试，除非测试代码本身是错误的
- 我绝不在未理清任务全貌的情况下，直接开始进行任务
- 端到端测试绝对不允许靠 mock

## 权利
- 我有权利在设计本身就无法达成目标是停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## Framework模块Types层接口定义与契约测试

**目标(O)**:
- 创建并实现Types层的接口定义文件：
  - `packages/core/src/types/DomainCompiler.ts`
  - `packages/core/src/types/DomainConfig.ts`
  - `packages/core/src/types/CompileOptions.ts`
- 创建并实现对应的契约测试文件：
  - `packages/core/src/__tests__/contract/types/DomainCompiler.contract.test.ts`
  - `packages/core/src/__tests__/contract/types/DomainConfig.contract.test.ts`
  - `packages/core/src/__tests__/contract/types/CompileOptions.contract.test.ts`
- 确保接口设计符合架构规范并支持泛型和类型安全

**环境(E)**:
- **项目进度**:
  - **【当前任务】framework-01-contract.task.md**: 实现Types层的Domain接口定义，创建相应契约测试
  - **framework-02-base.task.md**: 实现Core层的Framework内部状态和服务
  - **framework-03-integration.task.md**: 实现API层的Framework入口点和集成测试
  - **framework-04-final.task.md**: 完成Framework模块端到端测试与优化
  
- **代码相关**:
  - 设计文档：`packages/core/docs/product/Framework-Design.md`（4.2节类型定义）
  - 开发设计文档：`packages/core/docs/develop/Framework-Develop-Design.md`
  
- **架构规范**:
  - `rules/architecture/types-layer.md` - Types层设计规则
  - `rules/architecture/architecture-overview.md` - 架构概览规则
  - `rules/architecture/test-case-design.md` - 测试用例设计规则
  
- **测试相关**:
  - 测试用例ID：`CT-TYPE-DCOMP-01`、`CT-TYPE-DCOMP-02`、`CT-TYPE-DCONF-01`、`CT-TYPE-DCONF-02`、`CT-TYPE-COPTS-01`、`CT-TYPE-COPTS-02`
  - 测试用例设计：`packages/core/docs/develop/Framework-Testcase-Design.md`（3.1节）
  
- **实现要点**:
  - DomainCompiler接口需包含四个方法：compile, extend, getSchema, getTransformers
  - DomainConfig接口需定义领域配置结构
  - CompileOptions接口需定义编译选项
  - 所有类型定义必须支持泛型参数
  
- **注意事项**:
  - 遵循Types层设计规则，只声明类型不实现逻辑
  - 确保类型间的正确依赖关系
  - 为所有接口和字段添加JSDoc注释
  - 注意类型安全和泛型参数正确传递

**成功标准(S)**:
- **基础达标**:
  - 所有契约测试通过（`CT-TYPE-DCOMP-01`至`CT-TYPE-COPTS-02`）
  - 类型结构符合设计文档
  - 接口定义遵循Types层设计规则
  
- **预期品质**:
  - 接口和属性有完整的JSDoc注释
  - 类型名称和属性名称符合项目命名规范
  - 测试用例结构清晰，验证所有关键类型特性
  
- **卓越表现**:
  - 提供更丰富的类型示例
  - 增加类型约束以提高类型安全
  - 为复杂类型提供使用示例注释 