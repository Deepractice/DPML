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

## 项目结构
我们的项目是 monorepo，基于 pnpm workspace 管理。

## 权利
- 我有权利在设计本身就无法达成目标是停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 重命名DomainState为DomainContext（基础任务）

**目标(O)**:
- 将DomainState接口重命名为DomainContext，以更好地反映其作为领域上下文的角色
- 更新所有使用DomainState的代码引用，确保完全兼容
- 确保DomainContext作为使用后的标准术语，包括在文档和注释中

**环境(E)**:
- **代码相关**:
  - `packages/core/src/core/framework/types.ts` - 包含DomainState接口定义
  - `packages/core/src/core/framework/domainService.ts` - 使用DomainState的核心服务
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Design.md` - 迭代设计文档
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Testcase-Design.md` - 测试用例设计
  
- **测试相关**:
  - `packages/core/src/__tests__/unit/core/framework/domainService.test.ts` - DomainService单元测试
  - `packages/core/src/__tests__/fixtures/framework/domainFixtures.ts` - 相关测试夹具
  - 测试用例ID: UT-DOMSVC-09, UT-DOMSVC-10

- **实现要点**:
  - 在`packages/core/src/core/framework/types.ts`中重命名接口：
    ```typescript
    export interface DomainContext {
      // 保持接口内容不变，仅重命名
      schema: SchemaDefinition;
      transformers: TransformerDefinition[];
      compiler?: DomainCompiler;
      options: DomainOptions;
      
      // 新增字段
      domain: string;
      description?: string;
    }
    ```
  - 更新所有使用DomainState的导入和引用：
    - `packages/core/src/core/framework/domainService.ts`
    - `packages/core/src/api/framework.ts`
    - 所有测试文件
  - 更新测试夹具中的DomainState实例为DomainContext
  
- **注意事项**:
  - 这是一个重命名重构，不应改变任何功能行为
  - 确保测试夹具中的模拟对象正确更新
  - 由于这是内部API改变，确保所有内部使用点都已更新
  - 检查是否有文档或注释引用了DomainState，同步更新

**成功标准(S)**:
- **基础达标**:
  - DomainState成功重命名为DomainContext，所有相关导入和引用已更新
  - DomainContext接口包含新增的domain和description字段
  - 相关单元测试通过：UT-DOMSVC-09, UT-DOMSVC-10
  - 现有测试在更新后仍然全部通过
  
- **预期品质**:
  - 所有文档和注释中的DomainState引用都已更新为DomainContext
  - 代码中没有遗留的DomainState引用
  - 重命名不影响运行时行为，所有使用点行为保持一致
  
- **卓越表现**:
  - 提供DomainContext接口的完整文档
  - 明确DomainContext的职责和使用场景
  - 对重命名过程进行详细的提交说明，方便代码审查 