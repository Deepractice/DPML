# Framework层CLI统一入口改造方案设计

## 迭代信息

- **迭代编号**：ITER2025050102
- **迭代名称**：Framework层CLI统一入口
- **负责人**：架构师
- **迭代目标**：实现`Framework`层作为CLI创建和命令注册的统一入口，简化`bin.ts`脚本，消除职责重叠。
- **相关Issue**：[issues/framework-cli-unified-entry.md](mdc:issues/framework-cli-unified-entry.md)

## 1. 问题背景

当前DPML命令行工具的实现存在以下问题：

1.  **职责分散**：CLI实例的创建和命令注册逻辑分散在`framework`层（通过`domainConfig`间接注册）和`bin.ts`脚本中（显式创建CLI和重复注册）。
2.  **实现暴露**：`bin.ts`需要了解`framework`和`cli`模块的内部细节来组装完整的CLI工具。
3.  **代码冗余**：命令注册（特别是标准命令和领域命令）的逻辑可能在多处重复。
4.  **维护困难**：修改CLI的创建或命令注册方式需要在多个地方进行同步修改。
5.  **使用复杂**：开发者需要组合来自不同模块的API才能构建一个功能完整的DPML CLI。

此问题违反了单一职责原则和封装原则，增加了系统的耦合度和维护成本。

## 2. 架构设计原则

本次改造遵循以下架构原则：

1.  **单一职责原则**：`Framework`模块应负责管理所有领域（包括核心领域）的定义和命令注册逻辑。它应该提供一个统一的方式来获取一个包含了所有已注册命令的CLI实例。
2.  **封装原则**：`Framework`层应封装CLI的创建和配置细节，向调用者（主要是`bin.ts`）提供一个简单的高级API。`bin.ts`不应关心命令是如何被发现和注册的。
3.  **关注点分离**：`bin.ts`的职责应简化为仅作为应用程序的入口点，负责调用`Framework`提供的统一CLI创建函数并执行。
4.  **API设计**：提供稳定、简洁、类型安全的API (`createDPMLCLI`)。

## 3. 需要修改的文件

1.  `packages/core/src/api/framework.ts`：添加新的`createDPMLCLI`公共API函数。
2.  `packages/core/src/core/framework/domainService.ts`：可能需要添加或调整内部函数，如`getAllRegisteredCommands`和`ensureCoreCommandsRegistered`（或类似逻辑）。
3.  `packages/core/src/bin.ts`：大幅简化，移除CLI创建和命令注册逻辑，改为调用`createDPMLCLI`。
4.  `packages/core/src/api/cli.ts`：`createDPMLCLI`将依赖此模块的`createCLI`。
5.  `packages/core/src/__tests__/unit/api/framework.test.ts`：为`createDPMLCLI`添加单元测试。
6.  `packages/core/src/__tests__/integration/cli/framework-cli.test.ts`：添加或修改集成测试，验证通过`createDPMLCLI`创建的CLI的端到端行为。
7.  `packages/core/docs/product/Framework-Design.md`：更新文档，包含新的`createDPMLCLI` API。
8.  `packages/core/docs/product/CLI-Design.md`：可能需要更新，说明`Framework`层在CLI构建中的新角色和`bin.ts`的简化用法。
9.  `packages/core/docs/guides/cli-usage.md`（如果存在）：更新CLI使用指南。

## 4. 具体修改内容

### 4.1 `api/framework.ts`

添加`createDPMLCLI`函数：

```typescript
import { createCLI } from './cli'; // 依赖CLI API层
import { domainService } from '../core/framework/domainService'; // 依赖Core服务层
import type { CLITypes, CLIOptions, CommandDefinition } from '../types'; // 依赖Types层
import { VERSION } from '../version'; // 假设版本信息在这里

/**
 * 创建DPML命令行工具实例。
 *
 * 此函数作为DPML CLI的统一入口点，负责：
 * 1. 初始化核心领域（如果尚未完成）。
 * 2. 从domainService获取所有已注册的领域命令。
 * 3. 使用api/cli模块创建基础CLI实例。
 * 4. 将所有领域命令注册到CLI实例中。
 * 5. 特殊处理默认领域（如'core'），为其命令创建无领域前缀的别名。
 * 6. 返回一个完全配置好的、可执行的CLI实例。
 *
 * @param options 可选的CLI配置选项，用于覆盖默认设置（如名称、版本、描述）。
 * @returns 配置完成的CLI实例，符合CLITypes接口。
 *
 * @example
 * ```typescript
 * // 在 bin.ts 或其他入口脚本中使用
 * import { createDPMLCLI } from '@dpml/core';
 *
 * async function run() {
 *   const cli = createDPMLCLI({ version: '1.2.3' });
 *   await cli.execute();
 * }
 *
 * run().catch(error => {
 *   console.error("CLI execution failed:", error);
 *   process.exit(1);
 * });
 * ```
 */
export function createDPMLCLI(options?: Partial<CLIOptions>): CLITypes {
  // 确保核心命令已注册（或任何必要的初始化）
  domainService.ensureCoreInitialized(); // 假设domainService有此方法

  // 准备CLI选项
  const cliOptions: CLIOptions = {
    name: options?.name || 'dpml',
    version: options?.version || VERSION, // 使用导入或计算得出的版本
    description: options?.description || 'DPML Command Line Tool - Data Processing Markup Language',
    // defaultDomain 可以在这里或在domainService内部处理
  };

  // 1. 创建基础CLI实例 (不包含命令)
  const cli = createCLI(cliOptions, []);

  // 2. 获取所有已注册的领域命令
  const allCommands = domainService.getAllRegisteredCommands(); // 假设domainService有此方法

  // 3. 注册所有原始命令 (带领域前缀，如 core:parse)
  cli.registerCommands(allCommands);

  // 4. 处理默认领域（假设为 'core'）的无前缀命令
  const defaultDomainName = domainService.getDefaultDomainName(); // 假设domainService知道默认领域
  const defaultDomainCommands = allCommands
    .filter(cmd => cmd.domain === defaultDomainName)
    .map(cmd => {
      // 创建命令副本，移除领域信息以避免前缀冲突
      const unprefixedCmd: CommandDefinition = {
        ...cmd,
        // 从名称中移除前缀 'core:'
        name: cmd.name.startsWith(`${defaultDomainName}:`)
            ? cmd.name.substring(defaultDomainName.length + 1)
            : cmd.name,
        // 移除domain属性，这样注册时不会被cliService/adapter添加前缀
        domain: undefined,
        // 可能需要调整描述或添加标记说明这是别名
        description: `${cmd.description} (Alias for ${cmd.domain}:${cmd.name})`,
      };
      // 注意：确保子命令（如果存在）也正确处理
      // if (unprefixedCmd.subcommands) { ... }
      return unprefixedCmd;
    })
    // 过滤掉可能因名称冲突而无法创建别名的命令（例如，如果存在非core领域的同名顶级命令）
    .filter(cmd => {
       // 检查是否已存在同名顶级命令（需要一种方式查询已注册命令）
       // 简化：暂时假设不会冲突，或由 registerCommands 内部处理
       return true;
    });

  // 5. 注册无前缀的默认领域命令别名
  if (defaultDomainCommands.length > 0) {
    cli.registerCommands(defaultDomainCommands);
  }

  // 6. 返回完全配置的CLI实例
  return cli;
}
```

### 4.2 `core/framework/domainService.ts`

需要确保或添加以下功能：

-   `domainRegistry`: 内部存储已注册领域及其命令的地方。
-   `ensureCoreInitialized()`: 确保核心领域及其标准命令已被注册到`domainRegistry`。这可能在`domainService`首次被调用时触发，或者需要显式调用。
-   `getAllRegisteredCommands(): CommandDefinition[]`: 从`domainRegistry`收集并返回所有领域的所有命令定义列表。
-   `getDefaultDomainName(): string`: 返回配置的默认领域名称（例如 'core'）。

```typescript
// core/framework/domainService.ts (示意性修改)

// 假设存在一个内部注册表
interface DomainRegistration {
  config: DomainConfig; // 领域配置
  commands: CommandDefinition[]; // 该领域注册的命令
}
const domainRegistry = new Map<string, DomainRegistration>();
let coreInitialized = false;
const DEFAULT_DOMAIN = 'core';

export const domainService = {
  // ... 其他现有方法如 initializeDomain, extendDomain ...

  /**
   * 确保核心领域及其命令已初始化并注册。
   * 可以设计为幂等操作。
   */
  ensureCoreInitialized(): void {
    if (coreInitialized) {
      return;
    }
    // 检查'core'是否已注册
    if (!domainRegistry.has(DEFAULT_DOMAIN)) {
      // 如果没有，则初始化并注册核心领域
      // 这部分逻辑可能来自 issue 中提到的 ensureCoreCommandsRegistered
      const coreConfig: DomainConfig = { /* ... 核心领域配置 ... */ };
      const coreContext = this.initializeDomain(coreConfig); // 使用现有方法
       // 假设 processDomainCommands 会将命令添加到注册表
      // processDomainCommands({ includeStandard: true, actions: [] }, coreContext);
    }
    coreInitialized = true;
  },

  /**
   * 获取所有已注册的命令定义。
   * @returns 所有领域命令的扁平列表。
   */
  getAllRegisteredCommands(): CommandDefinition[] {
    const allCommands: CommandDefinition[] = [];
    for (const registration of domainRegistry.values()) {
      allCommands.push(...registration.commands);
    }
    return allCommands;
  },

  /**
   * 获取默认领域的名称。
   * @returns 默认领域名称字符串。
   */
  getDefaultDomainName(): string {
    // 可以从配置或常量中获取
    return DEFAULT_DOMAIN;
  },

  /**
   * (修改) 注册领域时，将其命令存储到注册表
   */
  initializeDomain(config: DomainConfig): DomainState {
    // ... (原有的验证和状态创建) ...
    const state = { /* ... 创建 state ... */ };

    // 提取或生成该领域的命令
    const commands = this.generateCommandsForDomain(config); // 假设有此方法

    // 存储到注册表
    domainRegistry.set(config.domain, { config, commands });

    return state; // 返回状态供闭包使用（如果createDomainDPML仍保留）
  },

  // (新增或重构) 根据领域配置生成命令
  generateCommandsForDomain(config: DomainConfig): CommandDefinition[] {
      // ... 根据 config.schema, config.transformers, config.actions 等生成命令 ...
      // 例如：processDomainCommands({ includeStandard: true, actions: config.actions || [] }, config);
      // 需要确保 processDomainCommands 返回或注册命令列表
      return [ /* ... 生成的命令 ... */ ];
  }

  // ... 其他辅助函数 ...
};
```
**注意**: 上述 `domainService` 的修改是示意性的，需要根据现有 `domainService` 的具体实现进行调整。关键是实现命令的集中存储和检索。

### 4.3 `bin.ts`

简化 `bin.ts` 脚本：

```typescript
#!/usr/bin/env node
/**
 * DPML Command Line Tool Entry Point
 */

import { createDPMLCLI } from './api/framework'; // 直接从framework API导入

async function main() {
  // 1. 创建完全配置的CLI实例
  // 可以传递选项覆盖默认值，例如从package.json读取版本
  const cli = createDPMLCLI({
    // version: process.env.npm_package_version || 'unknown'
  });

  // 2. 执行CLI
  // createDPMLCLI 返回的实例内部已包含错误处理 (来自 cliService.execute)
  await cli.execute();
}

// 捕获 main 函数执行期间（主要是初始化或意外情况）的错误
main().catch(error => {
  // 避免重复打印 createDPMLCLI 内部已处理并打印的错误
  // 可以检查错误类型或标记来决定是否打印
  if (!(error instanceof Error && error.message.includes('命令执行出错'))) {
     console.error('CLI encountered an unexpected error:', error);
  }
  process.exit(1); // 确保以非零状态码退出
});
```

## 5. 测试调整

### 5.1 单元测试 (`framework.test.ts`)

-   为 `createDPMLCLI` 添加新的测试套件。
-   测试用例：
    -   验证是否能成功创建一个 `CLITypes` 实例。
    -   验证默认选项和传入选项是否正确应用。
    -   模拟 `domainService.getAllRegisteredCommands` 返回命令，验证这些命令是否被注册（可能需要 mock `cli.registerCommands`)。
    -   验证默认领域（如 'core'）的命令是否同时注册了带前缀和不带前缀的版本。
    -   验证 `domainService.ensureCoreInitialized` 是否被调用。

### 5.2 集成测试 (`framework-cli.test.ts`)

-   创建新的集成测试文件或修改现有文件。
-   测试通过 `createDPMLCLI` 创建的CLI实例的端到端行为。
    -   执行一个核心命令（如 `parse`）的无前缀版本。
    -   执行一个核心命令（如 `core:parse`）的带前缀版本。
    -   执行一个非核心领域命令（如果存在）。
    -   测试帮助信息 (`--help`) 是否同时显示带前缀和无前缀的核心命令。
    -   测试版本信息 (`--version`)。

## 6. 文档更新

### 6.1 `Framework-Design.md`

-   添加 `createDPMLCLI` API 的说明。
-   解释 `Framework` 层现在作为CLI创建的统一入口。
-   更新架构图或组件关系图以反映新的API和流程。

### 6.2 `CLI-Design.md`

-   更新 `bin.ts` 的推荐使用示例，展示其简化后的形式。
-   可能需要添加章节说明 `Framework` 层如何与 `CLI` 模块协作来构建最终的CLI工具。

### 6.3 使用指南

-   更新任何展示如何设置或使用DPML CLI的文档或示例，反映 `bin.ts` 的变化和 `createDPMLCLI` 的用法（如果用户需要自定义入口）。

## 7. 迁移计划

1.  **阶段1：Core层准备**
    -   任务1: 实现或调整 `domainService` 中的 `domainRegistry`、`ensureCoreInitialized`、`getAllRegisteredCommands`、`getDefaultDomainName` 和命令生成/存储逻辑。添加单元测试。
2.  **阶段2：API层实现**
    -   任务2: 在 `api/framework.ts` 中实现 `createDPMLCLI` 函数。
    -   任务3: 添加 `createDPMLCLI` 的单元测试。
3.  **阶段3：入口点改造**
    -   任务4: 简化 `bin.ts` 脚本，使其调用 `createDPMLCLI`。
4.  **阶段4：测试与验证**
    -   任务5: 添加或修改集成测试，确保CLI行为符合预期。
    -   任务6: 手动测试常用命令和帮助/版本信息。
5.  **阶段5：文档更新**
    -   任务7: 更新 `Framework-Design.md`, `CLI-Design.md` 和其他相关文档。

## 8. 验收标准

1.  `createDPMLCLI` 函数在 `api/framework.ts` 中存在且功能符合设计。
2.  `bin.ts` 脚本显著简化，不再包含CLI创建或显式命令注册逻辑。
3.  通过 `createDPMLCLI` 创建的CLI实例包含所有已注册的领域命令。
4.  默认领域（如 'core'）的命令可以通过带前缀和不带前缀两种方式调用。
5.  `--help` 输出正确显示所有命令，包括别名。
6.  所有相关单元测试和集成测试通过。
7.  相关设计文档和用户指南已更新。
8.  代码符合项目编码规范和架构原则。

## 9. 风险评估

1.  **`domainService` 重构风险**：
    -   风险：修改 `domainService` 以集中管理命令注册可能引入错误或影响现有 `createDomainDPML` 功能（如果保留）。
    -   缓解措施：进行充分的单元测试和集成测试，确保 `domainService` 的修改是向后兼容或有明确迁移路径的。仔细审查命令生成和存储逻辑。
2.  **命令别名冲突风险**：
    -   风险：无前缀的核心命令可能与用户自定义的非核心领域中的顶级命令名称冲突。
    -   缓解措施：`createDPMLCLI` 在注册别名时应进行冲突检测（需要查询已注册命令的能力），或者在文档中明确说明此潜在冲突及解决方法（例如，避免使用与核心命令相同的名称作为顶级命令）。
3.  **测试覆盖不足风险**：
    -   风险：可能未能覆盖所有命令注册和执行的组合场景。
    -   缓解措施：设计全面的集成测试，覆盖核心命令（带/不带前缀）、非核心命令、帮助、版本以及错误处理。

</rewritten_file> 