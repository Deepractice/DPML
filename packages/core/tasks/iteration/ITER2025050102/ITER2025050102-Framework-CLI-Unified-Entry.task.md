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
- 遇到测试失败时，我将使用日志和系统性调试方法而非依赖猜测
- 我将确保实现满足所有测试要求，不妥协代码质量
- 我将确保代码实现符合业务逻辑，而非仅为通过测试

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
- 我绝不通过修改测试代码的方式通过测试，除非测试代码本身有明显错误
- 我绝不编写专门为应付测试而不符合业务逻辑的实现代码
- 我绝不依赖猜测解决问题，而是使用日志和断点进行系统性调试
- 如果我需要修改测试，我将明确说明修改理由并请求人类审批
- 我绝不在未理清任务全貌的情况下，直接开始进行任务
- 端到端测试绝对不允许靠 mock

## 调试规范
- 遇到测试失败时，我将：
  * 首先添加详细日志输出关键数据和执行路径
  * 分析测试失败的具体断言和条件
  * 比较预期值与实际值的差异
  * 追踪问题根源至具体代码
  * 验证修复方案的合理性
- 当我需要添加日志时，我将：
  * 在关键函数入口记录输入参数
  * 在数据转换处记录前后状态
  * 在条件分支处记录判断条件
  * 在返回值处记录最终结果
- 如果我认为测试代码需要修改，我将：
  * 明确标记："我认为测试代码需要修改"
  * 提供详细的理由和证据
  * 等待人类确认后才执行修改

## 项目结构
我们的项目是 monorepo，基于 pnpm workspace 管理。

## 权利
- 我有权利在设计本身就无法达成目标时停止工作
- 我有权利在符合规范的情况下，发挥自身的能力，让任务完成的更好

我理解这些规范的重要性，并承诺在整个任务执行过程中严格遵守。我将在每个关键阶段做出明确声明，以证明我始终遵循规范执行。

---

## 任务：实现Framework层CLI统一入口 (ITER2025050102)

**任务类型**: 终结任务 (final)

**目标(O)**:

*   **功能目标**:
    *   实现 `Framework` 层作为 CLI 创建和命令注册的统一入口函数 `createDPMLCLI`。
    *   消除 `bin.ts` 中 CLI 创建和命令注册的职责，使其仅作为应用入口。
    *   集中管理所有领域命令的注册逻辑到 `Framework` 层。
    *   确保默认领域（如'core'）的命令可以通过带前缀和不带前缀两种方式调用。
    *   解决 [issues/framework-cli-unified-entry.md](mdc:issues/framework-cli-unified-entry.md) 中描述的问题。
*   **执行任务**:
    *   **创建/修改文件**:
        *   `packages/core/src/api/framework.ts`: 添加 `createDPMLCLI` 函数。
        *   `packages/core/src/core/framework/domainService.ts`: 实现或调整内部逻辑以支持命令注册表的存储和检索 (`domainRegistry`, `ensureCoreInitialized`, `getAllRegisteredCommands`, `getDefaultDomainName`, `generateCommandsForDomain`)。
        *   `packages/core/src/bin.ts`: 简化脚本，移除 CLI 创建和显式命令注册，改为调用 `createDPMLCLI`。
        *   `packages/core/src/__tests__/unit/api/framework.test.ts`: 添加 `createDPMLCLI` 的单元测试。
        *   `packages/core/src/__tests__/integration/cli/framework-cli.test.ts`: 添加或修改集成测试，验证端到端CLI行为。
        *   `packages/core/docs/product/Framework-Design.md`: 更新文档。
        *   `packages/core/docs/product/CLI-Design.md`: 更新文档。
        *   `packages/core/docs/guides/cli-usage.md` (如果存在): 更新文档。
    *   **实现功能**:
        *   在 `api/framework.ts` 中实现 `createDPMLCLI` 的完整逻辑，包括调用 `domainService`、调用 `createCLI`、注册命令和处理别名。
        *   在 `core/framework/domainService.ts` 中实现命令的集中存储和检索机制。
        *   确保 `bin.ts` 干净、简洁，只调用 `createDPMLCLI().execute()`。
*   **任务边界**:
    *   **包含**: 实现 `createDPMLCLI` API，修改 `domainService` 以支持该API，简化 `bin.ts`，添加/修改相关测试，更新文档。
    *   **不包含**: 创建新的领域或命令，修改现有 `createDomainDPML` 的核心逻辑（除非必要），实现复杂的命令冲突解决逻辑（超出基本检查）。

**环境(E)**:

*   **参考资源**:
    *   **设计文档**:
        *   [本迭代设计方案: ITER-Framework-CLI-Unified-Entry-Design.md](mdc:packages/core/tasks/iteration/ITER2025050102/ITER-Framework-CLI-Unified-Entry-Design.md) (主要依据)
        *   [相关Issue: framework-cli-unified-entry.md](mdc:issues/framework-cli-unified-entry.md)
        *   [Framework设计: Framework-Design.md](mdc:packages/core/docs/product/Framework-Design.md)
        *   [CLI设计: CLI-Design.md](mdc:packages/core/docs/product/CLI-Design.md)
    *   **代码参考**:
        *   `packages/core/src/api/cli.ts` (`createCLI` 函数)
        *   现有 `packages/core/src/core/framework/domainService.ts` 实现
        *   现有 `packages/core/src/bin.ts` 实现 (用于对比简化效果)
    *   **测试文件**:
        *   `packages/core/src/__tests__/unit/core/framework/domainService.test.ts` (需要扩展)
        *   `packages/core/src/__tests__/unit/api/cli.test.ts` (理解 `createCLI` 的测试)
        *   `packages/core/src/__tests__/integration/cli/*` (可能需要参考或修改)
*   **上下文信息**:
    *   **架构约束**: 严格遵循分层架构 ([rules/architecture/index.md](mdc:rules/architecture/index.md))，`api` 层调用 `core` 层，`bin.ts` 调用 `api` 层。
    *   **技术栈**: TypeScript, pnpm workspace Monorepo。
    *   **依赖关系**: `createDPMLCLI` 依赖 `createCLI` 和 `domainService`。`bin.ts` 依赖 `createDPMLCLI`。
    *   **前置任务**: `cliService` 和 `CLIAdapter` 已经能够注册和执行命令，`domainService` 已经存在（但需要修改）。
*   **规范索引**:
    *   [OES任务设计规则: oes-task-design.md](mdc:rules/architecture/oes-task-design.md)
    *   [编码规范](../../../../rules/architecture/coding-standards.md) (假设存在)
    *   [测试规范](../../../../rules/architecture/testing-strategy.md) 和 [测试用例设计](../../../../rules/architecture/test-case-design.md)
    *   项目使用TDD开发模式。
*   **注意事项**:
    *   **`domainService` 重构**: 修改 `domainService` 需要小心，确保不破坏现有功能（如果 `createDomainDPML` 仍被使用）。需要充分测试。
    *   **命令别名冲突**: 需要考虑无前缀的核心命令与非核心领域顶级命令重名的可能性。初步设计是假设不冲突或由 `cli.registerCommands` 处理，但实现时需注意。
    *   **版本号管理**: `createDPMLCLI` 需要获取正确的版本号（例如从 `version.ts` 或 `package.json`）。
    *   **幂等性**: `domainService.ensureCoreInitialized` 应设计为幂等操作。

**实现指导(I)**:

*   **算法与流程**:
    1.  **`domainService` 修改**:
        *   实现内部 `domainRegistry` (如 `Map<string, DomainRegistration>`) 用于存储领域配置和命令。
        *   修改 `initializeDomain` (或类似函数) 将生成的命令存入 `domainRegistry`。
        *   实现 `getAllRegisteredCommands` 从 `domainRegistry` 读取所有命令。
        *   实现 `ensureCoreInitialized` 检查并按需初始化核心领域，确保其命令存入 `domainRegistry`。
        *   实现 `getDefaultDomainName` 返回默认领域名 ('core')。
        *   实现 `generateCommandsForDomain` (或重构现有逻辑) 以便能独立获取一个领域的命令列表。
    2.  **`api/framework.ts` 实现 `createDPMLCLI`**:
        *   调用 `domainService.ensureCoreInitialized()`。
        *   准备 `CLIOptions`，合并默认值和传入参数。
        *   调用 `createCLI(cliOptions, [])` 创建基础CLI实例。
        *   调用 `domainService.getAllRegisteredCommands()` 获取所有命令。
        *   调用 `cli.registerCommands(allCommands)` 注册原始命令。
        *   调用 `domainService.getDefaultDomainName()` 获取默认领域名。
        *   过滤 `allCommands` 找到默认领域命令。
        *   `map` 这些命令，创建副本，移除 `domain` 属性，修改 `name` (移除前缀)，调整 `description`。
        *   (可选/谨慎) 添加别名冲突检查逻辑。
        *   调用 `cli.registerCommands(defaultDomainCommands)` 注册别名。
        *   返回 `cli` 实例。
    3.  **`bin.ts` 简化**:
        *   移除所有 `createCLI` 调用和 `registerCommands` 调用。
        *   移除所有命令获取逻辑 (`getAllRegisteredCommands` 等)。
        *   只保留 `import { createDPMLCLI }` 和 `main` 函数。
        *   `main` 函数中只包含 `const cli = createDPMLCLI(...)` 和 `await cli.execute()`。
        *   保留顶层的 `catch` 块处理未预期的启动错误。
*   **技术选型**:
    *   TypeScript。
    *   依赖 `@dpml/core` 内部的 `createCLI` 和类型定义。
    *   使用 `Map` 实现 `domainRegistry`。
*   **代码模式**:
    *   **Factory**: `createDPMLCLI` 作为创建完整CLI实例的工厂函数。
    *   **Service**: `domainService` 提供领域和命令管理服务。
    *   **Facade**: `createDPMLCLI` 可以看作是简化CLI创建过程的Facade。
    *   **Immutability**: 在创建命令别名时，确保创建副本 (`{ ...cmd }`) 而不是修改原始命令对象。
*   **实现策略**:
    1.  **TDD**: 先为 `domainService` 的新/修改功能编写单元测试 (如 `getAllRegisteredCommands`, `ensureCoreInitialized`)。
    2.  实现 `domainService` 的修改并通过测试。
    3.  为 `createDPMLCLI` 编写单元测试，覆盖选项处理、命令注册调用、别名生成等。
    4.  实现 `createDPMLCLI` 函数并通过测试。
    5.  修改 `bin.ts`。
    6.  编写/修改集成测试 (`framework-cli.test.ts`) 验证 `bin.ts` 通过 `createDPMLCLI` 运行CLI的完整流程，包括带前缀/无前缀命令的执行和帮助信息。
    7.  运行所有测试 (`pnpm test`) 和 Linter (`pnpm lint --fix`)。
    8.  更新文档。
*   **调试指南**:
    *   **`domainService`**: 在 `getAllRegisteredCommands` 和 `ensureCoreInitialized` 中添加日志，确认命令是否正确加载和返回。
    *   **`createDPMLCLI`**: 
        *   日志记录从 `domainService` 获取的命令列表 (`allCommands`)。
        *   日志记录生成的别名命令列表 (`defaultDomainCommands`)。
        *   日志记录传递给 `cli.registerCommands` 的参数。
    *   **CLI验证**: 运行简化后的 `bin.ts`，并通过 `--help` 选项检查命令列表（是否包含带前缀和无前缀的核心命令）。执行核心命令的两种形式 (`core:cmd` 和 `cmd`) 看是否都能工作。
    *   **测试失败**: 系统性分析单元测试和集成测试的失败信息，使用 `console.log` 追踪数据流和逻辑分支。参考 `oes-task-design.md` 中的调试示例。

**成功标准(S)**:

*   **基础达标**:
    *   `packages/core/src/api/framework.ts` 中存在 `createDPMLCLI` 函数。
    *   `packages/core/src/bin.ts` 文件显著简化，不再包含 `createCLI` 或 `registerCommands` 的直接调用。
    *   `packages/core/src/__tests__/unit/api/framework.test.ts` 中 `createDPMLCLI` 相关单元测试通过。
    *   `packages/core/src/__tests__/unit/core/framework/domainService.test.ts` 中与命令注册表相关的测试通过。
    *   执行 `pnpm test packages/core/src/__tests__/unit/api/framework.test.ts` 通过。
    *   执行 `pnpm test packages/core/src/__tests__/unit/core/framework/domainService.test.ts` 通过。
    *   `pnpm lint --fix` 后无 Error 级 lint 错误。
*   **预期品质**:
    *   通过 `createDPMLCLI` 创建的CLI实例，其 `--help` 输出正确显示所有注册的命令，包括带前缀的核心命令和不带前缀的核心命令别名。
    *   核心命令可以通过带前缀 (`core:command`) 和不带前缀 (`command`) 两种方式成功执行。
    *   非核心领域的命令按预期工作（带领域前缀）。
    *   `packages/core/src/__tests__/integration/cli/framework-cli.test.ts` 中的相关集成测试通过。
    *   执行 `pnpm test packages/core` 全部通过。
    *   执行 `pnpm build` 在 `core` 包中成功。
    *   代码符合项目编码规范和架构原则。
*   **卓越表现** (可选):
    *   `createDPMLCLI` 的实现考虑了命令别名冲突的潜在问题，并有适当的处理或警告机制。
    *   代码有清晰的 JSDoc 注释。
*   **终结任务特定标准**:
    *   **所有相关测试通过** (单元测试、集成测试)。
    *   **代码成功提交并通过CI验证** (需要手动或通过脚本触发 `git commit` 并观察 husky hooks 和 CI 结果)。
    *   **相关文档已更新**: `Framework-Design.md`, `CLI-Design.md`, `cli-usage.md` (如果存在) 已根据实现进行更新。 