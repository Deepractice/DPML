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

## CLI模块契约实现任务

**目标(O)**:
- 创建CLI模块的基础目录结构
- 创建并实现以下文件：
  - `packages/core/src/types/cli.ts`: CLI核心类型和接口
  - `packages/core/src/types/errors.ts`: 错误类型定义(添加CLI相关)
  - `packages/core/src/api/cli.ts`: CLI模块API函数
- 创建并实现以下测试文件：
  - `packages/core/src/__tests__/contract/types/CLI.contract.test.ts`
  - `packages/core/src/__tests__/contract/types/CommandDefinition.contract.test.ts`
  - `packages/core/src/__tests__/contract/api/cli.contract.test.ts`
- 实现CLI模块所需的所有接口和类型定义
- 实现API层的createCLI函数契约
- 为后续实现准备架构基础

**环境(E)**:
- **项目进度**:
  - 当前阶段：CLI模块开发第一阶段（1/4）
  - 前置任务：无，这是CLI模块的第一个任务
  - 后续任务：CLI模块基础实现任务
  - 依赖模块：Framework模块已完成

- **代码相关**:
  - `packages/core/docs/product/CLI-Design.md`: CLI模块设计文档
  - `packages/core/docs/develop/CLI-Testcase-Design.md`: CLI模块测试用例设计
  - `packages/core/src/api/framework.ts`: Framework模块参考实现
  
- **测试相关**:
  - 契约测试用例: CT-API-CLI-01, CT-API-CLI-02, CT-API-CLI-03
  - 类型测试用例: CT-TYPE-CLI-01, CT-TYPE-CLI-02, CT-TYPE-CMDF-01, CT-TYPE-CMDF-02

- **实现要点**:
  - Types层定义：
    ```typescript
    // CLI主接口
    export interface CLI {
      execute(argv?: string[]): Promise<void>;
      showHelp(): void;
      showVersion(): void;
    }

    // CLI选项
    export interface CLIOptions {
      name: string;
      version: string;
      description: string;
      defaultDomain?: string;
    }

    // 命令定义
    export interface CommandDefinition {
      name: string;
      description: string;
      arguments?: ArgumentDefinition[];
      options?: OptionDefinition[];
      action: CommandAction;
      subcommands?: CommandDefinition[];
      domain?: string;
    }

    // 其他必要类型...
    ```
    
  - API层实现：
    ```typescript
    export function createCLI(
      options: CLIOptions, 
      commands: CommandDefinition[]
    ): CLI {
      // 仅实现契约，内部逻辑在后续任务中实现
      return {
        execute: async () => {},
        showHelp: () => {},
        showVersion: () => {}
      };
    }
    ```

- **注意事项**:
  - 遵循分层架构，API层只提供薄层接口
  - 类型设计需要考虑递归结构，允许嵌套子命令
  - 确保命令定义接口足够灵活，能支持各种命令场景
  - 错误类型需要设计准确，便于后续错误处理

**成功标准(S)**:
- **基础达标**:
  - 创建所有必要的文件和目录结构
  - 所有类型和接口定义完备
  - 契约测试CT-TYPE-CLI-01, CT-TYPE-CLI-02通过
  - 契约测试CT-TYPE-CMDF-01, CT-TYPE-CMDF-02通过
  - 契约测试CT-API-CLI-01, CT-API-CLI-02, CT-API-CLI-03通过
  
- **预期品质**:
  - 类型定义全面且符合TypeScript最佳实践
  - 接口和类型有完整的JSDoc文档注释
  - API设计符合DPML整体架构风格
  - 代码风格符合项目规范
  
- **卓越表现**:
  - 类型定义支持高级TypeScript特性，提升类型安全
  - 创建类型辅助函数，简化使用体验
  - 为类型和API提供丰富的使用示例 