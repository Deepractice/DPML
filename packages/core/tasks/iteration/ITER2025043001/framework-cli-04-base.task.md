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

## 实现命令适配器（基础任务）

**目标(O)**:
- 实现领域命令到CLI命令的适配器，将DomainAction转换为CommandDefinition
- 确保命令适配器能正确处理领域前缀和命令上下文
- 在适配过程中提供领域上下文注入功能，使命令执行时能访问领域信息

**环境(E)**:
- **代码相关**:
  - 需要创建 `packages/core/src/core/framework/cli/commandAdapter.ts` - 命令适配器实现
  - 需要引用 `packages/core/src/types/DomainAction.ts` - 领域命令定义
  - 需要引用 `packages/core/src/types/cli.ts` - 包含CommandDefinition接口
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Design.md` - 迭代设计文档
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Testcase-Design.md` - 测试用例设计
  
- **测试相关**:
  - 需要创建 `packages/core/src/__tests__/unit/core/framework/cli/commandAdapter.test.ts` - 适配器单元测试
  - 测试用例ID: UT-CMDADP-01, UT-CMDADP-02, UT-CMDADP-03, UT-CMDADP-04, UT-CMDADP-05

- **实现要点**:
  - 创建命令适配器模块:
    ```typescript
    // commandAdapter.ts
    import { DomainAction } from '../../../types/DomainAction';
    import { DomainContext } from '../types';
    import { CommandDefinition } from '../../../types/cli';
    
    /**
     * 将领域命令转换为CLI命令定义
     * @param action 领域命令
     * @param domain 领域标识符
     * @param context 领域上下文
     * @returns CLI命令定义
     */
    export function adaptDomainAction(
      action: DomainAction,
      domain: string,
      context: DomainContext
    ): CommandDefinition {
      return {
        name: `${domain}:${action.name}`,
        description: action.description,
        arguments: action.args,
        options: action.options,
        action: async (...args) => {
          // 执行器调用时注入领域上下文
          return action.executor(context, ...args);
        },
        domain: domain
      };
    }
    
    /**
     * 批量转换领域命令
     * @param actions 领域命令数组
     * @param domain 领域标识符
     * @param context 领域上下文
     * @returns CLI命令定义数组
     */
    export function adaptDomainActions(
      actions: DomainAction[],
      domain: string,
      context: DomainContext
    ): CommandDefinition[] {
      return actions.map(action => adaptDomainAction(action, domain, context));
    }
    ```
  
- **注意事项**:
  - 确保命令名称采用`domain:command`格式，保持命名空间隔离
  - 适配器应该透明地传递所有参数，不改变命令的功能行为
  - 注入上下文时应保持执行器函数的参数顺序不变
  - 适配器设计应符合适配器模式的标准实践
  - 考虑处理命令名称冲突的情况

**成功标准(S)**:
- **基础达标**:
  - 实现adaptDomainAction函数，正确转换领域命令
  - 实现adaptDomainActions函数，支持批量转换
  - 通过单元测试：UT-CMDADP-01, UT-CMDADP-02, UT-CMDADP-03
  - 确保命令名称格式正确，包含领域前缀
  
- **预期品质**:
  - 适配器代码简洁清晰，遵循单一职责原则
  - 代码有完整的注释和类型定义
  - 通过单元测试：UT-CMDADP-04, UT-CMDADP-05
  - 上下文注入机制正确工作，命令执行时能访问领域信息
  
- **卓越表现**:
  - 提供命令名称冲突检测和解决机制
  - 支持命令别名和简写形式
  - 实现命令分组功能，按领域归类显示
  - 为复杂命令提供更丰富的配置选项 