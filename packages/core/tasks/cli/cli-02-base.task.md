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

## CLI模块基础实现任务

**目标(O)**:
- 创建并实现以下核心文件：
  - `packages/core/src/core/cli/commandUtils.ts`: 命令工具函数
  - `packages/core/src/core/cli/CLIAdapter.ts`: Commander.js适配器
  - `packages/core/src/core/cli/cliService.ts`: CLI服务层
- 创建并实现以下测试文件：
  - `packages/core/src/__tests__/unit/core/cli/commandUtils.test.ts`
  - `packages/core/src/__tests__/unit/core/cli/CLIAdapter.test.ts`
  - `packages/core/src/__tests__/unit/core/cli/cliService.test.ts`
- 实现CommandUtils工具函数，包括：
  - 选项合并函数
  - 命令路径构建函数
  - 命令重复验证函数
- 实现CLIAdapter适配器，封装Commander.js库
- 实现cliService服务层核心功能

**环境(E)**:
- **项目进度**:
  - 当前阶段：CLI模块开发第二阶段（2/4）
  - 前置任务：CLI模块契约实现任务（已完成）
  - 后续任务：CLI模块集成实现任务
  - 依赖关系：需要先完成契约实现任务中的类型定义和API设计

- **代码相关**:
  - `packages/core/src/types/CLITypes.ts`: CLI类型定义
  - `packages/core/src/api/CLITypes.ts`: CLITypes API层
  - `packages/core/docs/product/CLITypes-Design.md`: CLI设计文档
  - 外部依赖: commander.js（需要安装并引入）

- **测试相关**:
  - 单元测试用例: 
    - UT-CLIUTL-01, UT-CLIUTL-02, UT-CLIUTL-03, UT-CLIUTL-04 (commandUtils)
    - UT-CLIADP-01, UT-CLIADP-02, UT-CLIADP-03, UT-CLIADP-04, UT-CLIADP-05, UT-CLIADP-06, UT-CLIADP-07 (CLIAdapter)
    - UT-CLISVC-01, UT-CLISVC-02, UT-CLISVC-03, UT-CLISVC-04, UT-CLISVC-06 (cliService)
  - 反向测试用例:
    - UT-CLIADP-NEG-01, UT-CLIADP-NEG-02
    - UT-CLISVC-NEG-01, UT-CLISVC-NEG-02

- **实现要点**:
  - commandUtils工具函数:
    ```typescript
    // 合并默认选项
    export function mergeDefaultOptions(options: CLIOptions): Required<CLIOptions> {
      return {
        defaultDomain: 'core',
        ...options
      } as Required<CLIOptions>;
    }

    // 验证命令没有重复
    export function validateCommands(commands: CommandDefinition[]): void {
      // 遍历命令树，检测命令名重复
    }

    // 获取命令完整路径
    export function getCommandPath(command: CommandDefinition, parentPath?: string): string {
      // 构建包含领域前缀的命令路径
    }
    ```
  
  - CLIAdapter类:
    ```typescript
    export class CLIAdapter {
      private program: Command;
      private commandPaths: Set<string>;
      
      constructor(name: string, version: string, description: string) {
        // 初始化Commander实例
      }
      
      public setupCommand(command: CommandDefinition, parentPath?: string): void {
        // 注册命令、参数和选项
      }
      
      public setupDomainCommands(domainName: string, commands: CommandDefinition[]): void {
        // 注册领域命令
      }
      
      public async parse(argv?: string[]): Promise<void> {
        // 解析命令行参数
      }
      
      // 其他公共方法
    }
    ```
  
  - cliService服务:
    ```typescript
    // 公共API函数实现
    export function createCLI(options: CLIOptions, commands: CommandDefinition[]): CLITypes {
      // 验证命令无重复
      // 创建适配器
      // 设置选项和命令
      // 返回CLI接口
    }
    
    // 内部函数：设置全局选项
    function setupGlobalOptions(adapter: CLIAdapter, options: Required<CLIOptions>): void {
      // 实现全局选项设置
    }
    
    // 内部函数：设置用户命令
    function setupUserCommands(adapter: CLIAdapter, commands: CommandDefinition[]): void {
      // 遍历注册用户命令
    }
    ```

- **注意事项**:
  - CLIAdapter必须完全封装Commander.js，不对外暴露任何Commander细节
  - 确保命令重复检测能够正确处理嵌套命令
  - 命令解析过程中需要处理可能的异常
  - 所有方法必须有良好的类型注解

**成功标准(S)**:
- **基础达标**:
  - commandUtils单元测试通过：UT-CLIUTL-01至UT-CLIUTL-04
  - CLIAdapter单元测试通过：UT-CLIADP-01至UT-CLIADP-07
  - cliService单元测试通过：UT-CLISVC-01至UT-CLISVC-06
  - 反向测试通过：UT-CLIADP-NEG-01, UT-CLIADP-NEG-02, UT-CLISVC-NEG-01, UT-CLISVC-NEG-02
  - 命令注册和冲突检测机制正常工作
  
- **预期品质**:
  - 代码结构清晰，符合DPML架构和编程规范
  - 函数和类方法有完整JSDoc注释
  - 错误处理机制健全，提供清晰的错误信息
  - 单元测试覆盖率达到85%以上
  
- **卓越表现**:
  - 提供详细的调试日志，方便排查问题
  - 优化命令注册和解析的性能
  - 完善的参数验证机制 
