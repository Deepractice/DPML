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

## 实现标准命令（基础任务）

**目标(O)**:
- 实现Framework模块的标准命令功能，包括validate和parse命令
- 创建framework/cli子目录，规范CLI相关功能的组织结构
- 设计通用的命令执行环境，确保标准命令能访问领域上下文

**环境(E)**:
- **代码相关**:
  - 需要创建 `packages/core/src/core/framework/cli/standardActions.ts` - 标准命令实现
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Design.md` - 迭代设计文档
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Testcase-Design.md` - 测试用例设计
  
- **测试相关**:
  - 需要创建 `packages/core/src/__tests__/unit/core/framework/cli/standardActions.test.ts` - 标准命令单元测试
  - 测试用例ID: UT-STDACT-01, UT-STDACT-02, UT-STDACT-04
  - 测试夹具: `packages/core/src/__tests__/fixtures/framework/cliFixtures.ts`

- **实现要点**:
  - 创建framework/cli目录结构：
    ```
    packages/core/src/core/framework/cli/
    ├── standardActions.ts
    └── index.ts
    ```
  - 实现标准命令定义:
    ```typescript
    // standardActions.ts
    import { DomainAction } from '../../../types/DomainAction';
    import fs from 'fs/promises';
    import path from 'path';
    
    export const standardActions: DomainAction[] = [
      {
        name: 'validate',
        description: '验证DPML文档是否符合领域规范',
        args: [
          { name: 'file', description: 'DPML文件路径', required: true }
        ],
        options: [
          { flags: '--strict', description: '启用严格验证模式' }
        ],
        executor: async (context, file, options) => {
          // 实现验证逻辑
          const content = await fs.readFile(file, 'utf-8');
          // 使用领域上下文中的schema进行验证
          // ...
        }
      },
      {
        name: 'parse',
        description: '解析DPML文档并输出解析结果',
        args: [
          { name: 'file', description: 'DPML文件路径', required: true }
        ],
        options: [
          { flags: '--output <file>', description: '输出文件路径' },
          { flags: '--format <format>', description: '输出格式 (json|xml)', defaultValue: 'json' }
        ],
        executor: async (context, file, options) => {
          // 实现解析逻辑
          // ...
        }
      }
    ];
    
    export default standardActions;
    ```
  
- **注意事项**:
  - 标准命令应该独立于具体领域，但需要使用领域上下文执行命令
  - 命令执行器函数应该处理文件I/O、错误处理和结果输出
  - 确保命令行参数和选项遵循Commander.js的命名和格式约定
  - 所有命令应提供清晰的帮助信息
  - compile命令不作为标准命令提供，因为不同领域的transformer不同，应由领域开发者自行定义

**成功标准(S)**:
- **基础达标**:
  - 成功创建framework/cli目录结构
  - 实现validate和parse两个标准命令
  - 通过单元测试：UT-STDACT-01, UT-STDACT-02
  - 标准命令能正确访问和使用领域上下文
  
- **预期品质**:
  - 命令实现符合单一职责原则
  - 命令执行器具有良好的错误处理机制
  - 命令帮助信息完整清晰
  - 实现测试用例：UT-STDACT-04，验证命令执行功能
  
- **卓越表现**:
  - 提供丰富的命令选项，满足不同场景需求
  - 支持多种输出格式
  - 命令执行过程中提供进度反馈
  - 为命令添加详细的使用示例
  - 文档说明领域开发者如何定义特定领域的compile命令 