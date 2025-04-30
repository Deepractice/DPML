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

## 扩展DomainConfig接口（基础任务）

**目标(O)**:
- 为DomainConfig接口添加领域标识符和描述字段，使领域配置更完整
- 扩展DomainConfig接口以支持领域命令配置，允许用户定义标准命令和自定义命令
- 创建DomainAction接口，定义领域命令的结构

**环境(E)**:
- **代码相关**:
  - `packages/core/src/types/DomainConfig.ts` - 包含DomainConfig接口定义
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Design.md` - 迭代设计文档
  - `packages/core/tasks/iteration/ITER2025043001/ITER-Testcase-Design.md` - 测试用例设计
  
- **测试相关**:
  - `packages/core/src/__tests__/contract/types/DomainConfig.contract.test.ts` - DomainConfig契约测试
  - 需要创建 `packages/core/src/__tests__/contract/types/DomainAction.contract.test.ts` - 新的DomainAction契约测试
  - 测试用例ID: CT-TYPE-DCONF-03, CT-TYPE-DCONF-04, CT-TYPE-DCONF-05, CT-TYPE-DACT-01, CT-TYPE-DACT-02

- **实现要点**:
  - 在DomainConfig接口中添加以下字段：
    ```typescript
    domain: string; // 领域标识符
    description?: string; // 可选的领域描述
    commands?: {
      includeStandard?: boolean; // 是否包含标准命令
      actions?: DomainAction[]; // 自定义领域命令
    };
    ```
  - 创建新文件 `packages/core/src/types/DomainAction.ts`，定义DomainAction接口：
    ```typescript
    export interface DomainAction {
      name: string;
      description: string;
      args?: Array<{
        name: string;
        description: string;
        required?: boolean;
      }>;
      options?: Array<{
        flags: string;
        description: string;
        defaultValue?: any;
      }>;
      executor: (context: DomainContext, ...args: any[]) => Promise<any>;
    }
    ```
  
- **注意事项**:
  - 确保DomainConfig的扩展不破坏现有的使用模式
  - DomainAction接口需要在参数和选项定义上保持与CLI模块的兼容性
  - 命令名称应遵循kebab-case格式，例如"validate-schema"
  - 领域标识符将用作命令前缀，如"my-domain:command-name"

**成功标准(S)**:
- **基础达标**:
  - DomainConfig接口扩展完成，通过契约测试：CT-TYPE-DCONF-03, CT-TYPE-DCONF-04, CT-TYPE-DCONF-05
  - DomainAction接口创建完成，通过契约测试：CT-TYPE-DACT-01, CT-TYPE-DACT-02
  - 文件结构符合架构规范，接口放置在types层
  
- **预期品质**:
  - 接口设计清晰，字段命名直观
  - 注释完整，使用TSDoc格式
  - 类型定义严格，不使用any类型
  - 所有字段都有明确的类型限制
  
- **卓越表现**:
  - 提供完整的类型示例文档
  - 考虑向前兼容性，为将来扩展预留空间
  - 为接口添加更多约束和验证，如正则表达式验证命令名称格式 