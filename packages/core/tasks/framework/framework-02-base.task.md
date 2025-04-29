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

## Framework模块Core层内部状态和服务实现

**目标(O)**:
- 创建并实现Core层的框架文件：
  - `packages/core/src/core/framework/types.ts`
  - `packages/core/src/core/framework/domainService.ts`
- 创建并实现对应的单元测试文件：
  - `packages/core/src/__tests__/unit/core/framework/domainService.test.ts`
- 创建测试夹具文件：
  - `packages/core/src/__tests__/fixtures/framework/frameworkFixtures.ts`
- 实现DomainState内部接口和五个核心服务函数

**环境(E)**:
- **项目进度**:
  - **framework-01-contract.task.md**: 已完成Types层的Domain接口定义，创建相应契约测试
  - **【当前任务】framework-02-base.task.md**: 实现Core层的Framework内部状态和服务
  - **framework-03-integration.task.md**: 实现API层的Framework入口点和集成测试
  - **framework-04-final.task.md**: 完成Framework模块端到端测试与优化
  
- **代码相关**:
  - Types层接口：`packages/core/src/types/DomainCompiler.ts`等
  - 设计文档：`packages/core/docs/product/Framework-Design.md`（4.3和4.4节）
  - UML图：`packages/core/docs/develop/Framework-Develop-Design.md`
  
- **架构规范**:
  - `rules/architecture/core-layer.md` - Core层设计规则
  - `rules/architecture/testing-strategy.md` - 测试策略规则
  - `rules/architecture/architecture-overview.md` - 架构概览规则
  
- **测试相关**:
  - 测试用例ID：`UT-DOMSVC-01`至`UT-DOMSVC-08`和反向测试`UT-DOMSVC-NEG-01`至`UT-DOMSVC-NEG-04`
  - 测试用例设计：`packages/core/docs/develop/Framework-Testcase-Design.md`（3.2节）
  
- **实现要点**:
  - DomainState接口定义内部状态结构
  - 实现五个核心服务函数:
    ```typescript
    initializeDomain(config: DomainConfig): DomainState;
    compileDPML<T>(content: string, state: DomainState): Promise<T>;
    extendDomain(state: DomainState, config: Partial<DomainConfig>): void;
    getDomainSchema(state: DomainState): Schema;
    getDomainTransformers(state: DomainState): Array<Transformer<unknown, unknown>>;
    ```
  - 处理各种错误情况和边界条件
  - 协调解析、处理和转换流程
  
- **注意事项**:
  - 遵循Core层设计规则，实现业务逻辑
  - 确保函数式设计和不可变数据原则
  - 实现正确的错误处理和异常情况处理
  - 模块服务只负责协调，不实现具体功能

**成功标准(S)**:
- **基础达标**:
  - 所有domainService单元测试通过（`UT-DOMSVC-01`至`UT-DOMSVC-08`和`UT-DOMSVC-NEG-01`至`UT-DOMSVC-NEG-04`）
  - 实现类型正确的内部状态接口
  - 实现五个核心函数，拥有合理的错误处理逻辑
  
- **预期品质**:
  - 有完整的错误处理
  - 有清晰的函数和参数注释
  - 代码符合函数式和不可变设计原则
  - 测试覆盖所有关键功能点和错误处理路径
  - 测试夹具设计合理，支持各种测试场景
  
- **卓越表现**:
  - 优化解析和转换流程的性能
  - 提供更多高级配置选项
  - 实现额外的单元测试覆盖边界情况和复杂场景 