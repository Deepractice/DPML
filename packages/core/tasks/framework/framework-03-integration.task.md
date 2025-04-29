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

## Framework模块API层实现与集成测试

**目标(O)**:
- 创建并实现API层入口点：
  - `packages/core/src/api/framework.ts`
- 创建并实现对应的测试文件：
  - `packages/core/src/__tests__/contract/api/framework.contract.test.ts`
  - `packages/core/src/__tests__/integration/framework/compileWorkflow.integration.test.ts`
  - `packages/core/src/__tests__/integration/framework/closureState.integration.test.ts`
- 实现createDomainDPML<T>函数，采用闭包设计模式
- 确保API层与Core层正确集成

**环境(E)**:
- **项目进度**:
  - **framework-01-contract.task.md**: 已完成Types层的Domain接口定义，创建相应契约测试
  - **framework-02-base.task.md**: 已完成Core层的Framework内部状态和服务
  - **【当前任务】framework-03-integration.task.md**: 实现API层的Framework入口点和集成测试
  - **framework-04-final.task.md**: 完成Framework模块端到端测试与优化
  
- **代码相关**:
  - Core层服务：`packages/core/src/core/framework/domainService.ts`
  - Types层接口：`packages/core/src/types/DomainCompiler.ts`
  - 设计文档：`packages/core/docs/product/Framework-Design.md`（4.1节和6节流程图）
  - 序列图：`packages/core/docs/develop/Framework-Develop-Design.md`
  
- **架构规范**:
  - `rules/architecture/api-layer.md` - API层设计规则
  - `rules/architecture/testing-strategy.md` - 测试策略规则
  - `rules/architecture/test-case-design.md` - 测试用例设计规则
  
- **测试相关**:
  - 测试用例ID：`CT-API-FRMW-01`至`CT-API-FRMW-03`，`IT-FRMW-01`至`IT-FRMW-05`，`IT-CLSR-01`至`IT-CLSR-04`
  - 测试用例设计：`packages/core/docs/develop/Framework-Testcase-Design.md`（3.1节和3.3节）
  
- **实现要点**:
  - 实现createDomainDPML<T>函数，委托Core层domainService
  - 确保闭包设计符合要求，维护隔离的状态
  - 正确实现泛型参数传递
  - 实现契约和集成测试，验证API功能和闭包状态管理
  
- **注意事项**:
  - API层应极简，仅委托Core层功能
  - 确保闭包状态隔离和方法共享状态
  - 正确处理泛型传递
  - 集成测试应验证不同组件间的协作

**成功标准(S)**:
- **基础达标**:
  - API契约测试通过（`CT-API-FRMW-01`至`CT-API-FRMW-03`）
  - 闭包状态管理测试通过（`IT-CLSR-01`至`IT-CLSR-04`）
  - API实现符合API层设计规则
  
- **预期品质**:
  - 泛型参数正确传递和处理
  - API实现简洁，符合薄层原则
  - 闭包状态管理符合设计预期
  - 测试覆盖核心API功能和闭包特性
  
- **卓越表现**:
  - 编译工作流集成测试通过（`IT-FRMW-01`至`IT-FRMW-05`）
  - 提供详细的API使用示例
  - 实现高级闭包状态管理特性 