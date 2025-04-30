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

## CLI模块集成实现任务

**目标(O)**:
- 创建并实现以下集成测试文件：
  - `packages/core/src/__tests__/integration/cli/commandExecution.integration.test.ts`
  - `packages/core/src/__tests__/integration/cli/closureState.integration.test.ts`
- 完善cliService中的Framework集成功能
- 实现setupFrameworkCommands函数，支持领域命令注册
- 确保CLI与Framework模块正确集成
- 验证命令执行流程的完整性
- 验证闭包状态管理机制的正确性

**环境(E)**:
- **项目进度**:
  - 当前阶段：CLI模块开发第三阶段（3/4）
  - 前置任务：CLI模块基础实现任务（已完成）
  - 后续任务：CLI模块最终完善任务
  - 依赖关系：需要CLI基础组件和Framework模块

- **代码相关**:
  - `packages/core/src/core/cli/cliService.ts`: CLI服务层
  - `packages/core/src/core/cli/CLIAdapter.ts`: Commander适配器
  - `packages/core/src/api/framework.ts`: Framework API
  - `packages/core/src/api/CLITypes.ts`: CLITypes API层

- **测试相关**:
  - 单元测试用例: UT-CLISVC-05 (领域命令注册)
  - 集成测试用例: 
    - IT-CLIEXC-01, IT-CLIEXC-02, IT-CLIEXC-03, IT-CLIEXC-04, IT-CLIEXC-05 (命令执行)
    - IT-CLICLSR-01, IT-CLICLSR-02, IT-CLICLSR-03 (闭包状态)

- **实现要点**:
  - Framework集成:
    ```typescript
    // cliService.ts
    function setupFrameworkCommands(adapter: CLIAdapter): void {
      const domains = framework.getDomains();
      
      domains.forEach(domain => {
        adapter.setupDomainCommands(domain.name, domain.commands);
      });
    }
    ```
  
  - 命令执行测试:
    ```typescript
    // commandExecution.integration.test.ts
    describe('IT-CLIEXC', () => {
      test('CLI应处理基本命令执行', async () => {
        // 创建CLI，执行命令，验证结果
      });
      
      test('CLI应处理带参数的命令', async () => {
        // 测试参数传递
      });
      
      // 其他测试...
    });
    ```
  
  - 状态管理测试:
    ```typescript
    // closureState.integration.test.ts
    describe('IT-CLICLSR', () => {
      test('CLI闭包应维护独立状态', () => {
        // 创建多个CLI实例，验证状态独立
      });
      
      // 其他测试...
    });
    ```

- **注意事项**:
  - 闭包模式应与Framework模块保持一致
  - 确保Framework返回的领域命令被正确处理
  - 集成测试应验证端到端流程
  - 命令行参数应正确传递到action函数

**成功标准(S)**:
- **基础达标**:
  - 单元测试UT-CLISVC-05通过
  - 集成测试IT-CLIEXC-01至IT-CLIEXC-05通过
  - 集成测试IT-CLICLSR-01至IT-CLICLSR-03通过
  - CLI能够从Framework获取并注册领域命令
  
- **预期品质**:
  - 集成代码设计清晰，符合DPML架构规范
  - 命令执行过程中参数和选项处理正确
  - 错误信息准确，有助于用户调试
  - 集成测试覆盖率达到80%以上
  
- **卓越表现**:
  - 提供领域命令特殊处理机制，增强灵活性
  - 优化集成性能，减少资源消耗
  - 增强调试和日志功能 
