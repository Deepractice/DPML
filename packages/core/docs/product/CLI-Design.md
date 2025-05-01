# DPML CLI设计文档

## 1. 概述

CLI模块是DPML核心的命令行接口，负责提供一致、直观的命令行工具，使用户能够通过终端访问DPML的各项功能。它提供结构化的命令集和声明式API用于定义和组织命令。

### 1.1 设计目标

- **统一接口**：提供一致的命令行界面，作为DPML功能的统一入口
- **声明式定义**：支持通过声明式API定义命令及其结构
- **可扩展性**：支持动态注册外部命令
- **类型安全**：提供完全类型化的API和配置
- **关注点分离**：与其他模块保持清晰的界限，不直接依赖具体实现

## 2. 核心设计理念

基于项目需求和架构规范，我们确立了以下核心设计理念：

1. **闭包状态管理**：
   - 使用闭包模式封装CLI状态和配置
   - 通过闭包函数提供对内部功能的受控访问
   - 避免暴露内部实现细节

2. **声明式命令定义**：
   - 使用类型安全的声明式API定义命令结构
   - 支持命令参数、选项和子命令的嵌套定义
   - 提供清晰的命令描述和帮助信息

3. **命令冲突检测**：
   - 自动检测命令路径重复定义
   - 在设置阶段而非运行时发现冲突
   - 提供明确的错误信息帮助定位问题

4. **外部命令接口**：
   - 提供标准的命令注册接口
   - 接受符合CommandDefinition规范的外部命令
   - 保持CLI对命令来源的无感知性

5. **完全封装外部依赖**：
   - 完全封装Commander.js，不暴露外部库实例
   - 提供一致的API而不依赖外部库细节
   - 确保未来可以更换底层实现而不影响外部接口

## 3. 系统架构

CLI模块严格遵循项目的分层架构：

1. **API层**：`api/cli.ts` 模块，提供 `createCLI` 函数作为底层CLI创建入口，`api/framework.ts` 模块，提供 `createDPMLCLI` 函数作为应用级CLI统一入口。
2. **Types层**：定义 `CLI` 接口、`CommandDefinition` 和相关类型，确保类型安全。
3. **Core层**：`core/cli` 目录，包含 `cliService.ts` (服务逻辑) 和 `CLIAdapter.ts` (底层库适配器)。此外，`core/framework/domainService.ts` 提供对CLI与领域命令集成的支持。

## 4. 模块职责

CLI模块采用严格的职责划分，确保各层次关注点分离：

### 4.1 CLI适配器 (`CLIAdapter.ts`)

-   **职责**: 完全封装底层命令行库 (Commander.js) 的所有实现细节。
-   **功能**:
    -   提供类型安全的命令注册接口 (`setupCommand`)。
    -   处理底层库特有错误，如帮助显示 (`commander.helpDisplayed`) 和版本显示 (`commander.version`)，阻止它们向上层抛出。
    -   提供解析命令行参数的功能 (`parse`)。
    -   管理内部命令路径，检测重复命令。

### 4.2 CLI服务 (`cliService.ts`)

-   **职责**: 作为CLI功能的核心协调者和高级接口提供者。
-   **功能**:
    -   通过 `createCLI` 函数创建和配置CLI实例 (包括初始化 `CLIAdapter`)。
    -   提供稳定的 `CLI` 接口 (`execute`, `showHelp`, `showVersion`, `registerCommands`)。
    -   实现高级错误处理逻辑：在 `execute` 方法中捕获来自 `CLIAdapter.parse` 的错误，进行日志记录，并在非测试环境下退出进程。
    -   组织和注册初始用户命令和后续的外部命令。
    -   验证命令定义的有效性 (如重复命令)。

### 4.3 Framework服务 (`domainService.ts`)

-   **职责**: 管理领域相关的CLI命令注册和提供统一入口。
-   **功能**:
    -   确保核心领域命令初始化 (`ensureCoreInitialized`)。
    -   收集所有已注册的领域命令 (`getAllRegisteredCommands`)。
    -   提供默认领域名称 (`getDefaultDomainName`)。
    -   为每个领域生成相应的命令 (`generateCommandsForDomain`)。

### 4.4 应用入口 (`bin.ts`)

-   **职责**: 仅作为应用的可执行入口点。
-   **功能**:
    -   调用 `createDPMLCLI` 创建完整配置的CLI实例
    -   调用 `cli.execute()` 启动命令行处理。
    -   只负责捕获 `main` 函数执行期间（如初始化阶段）可能发生的未预料错误。

## 5. 核心组件设计 (原 4. 组件设计)

### 5.1 API设计 (原 4.1)

```typescript
// api/cli.ts
export function createCLI(
  options: CLIOptions, 
  commands: CommandDefinition[]
): CLITypes {
  return cliService.createCLI(options, commands);
}

// api/framework.ts
/**
 * 创建DPML命令行工具实例
 * 
 * 此函数作为DPML CLI的统一入口点，负责：
 * 1. 初始化核心领域（如果尚未完成）
 * 2. 从domainService获取所有已注册的领域命令
 * 3. 创建基础CLI实例
 * 4. 将所有领域命令注册到CLI实例中
 * 5. 为默认领域（如'core'）的命令创建无前缀的别名
 * 6. 返回一个完全配置好的、可执行的CLI实例
 *
 * @param options 可选的CLI配置选项，用于覆盖默认设置
 * @returns 配置完成的CLI实例
 */
export function createDPMLCLI(options?: Partial<CLIOptions>): CLI {
  // ...实现细节
}
```

### 5.2 类型定义 (原 4.2)

```typescript
// types/CLITypes.ts
export interface CLITypes {
  /**
   * 执行CLI处理命令行参数
   * @param argv 命令行参数数组，默认使用process.argv
   */
  execute(argv?: string[]): Promise<void>;
  
  /**
   * 显示帮助信息
   */
  showHelp(): void;
  
  /**
   * 显示版本信息
   */
  showVersion(): void;
  
  /**
   * 注册外部命令
   * @param commands 符合CommandDefinition规范的命令数组
   */
  registerCommands(commands: CommandDefinition[]): void;
}

// types/CLIOptions.ts
export interface CLIOptions {
  /**
   * CLI工具名称
   */
  name: string;
  
  /**
   * CLI版本号
   */
  version: string;
  
  /**
   * CLI描述
   */
  description: string;
  
  /**
   * 默认领域，默认为'core'
   */
  defaultDomain?: string;
}

// types/CommandDefinition.ts
export interface CommandDefinition {
  /**
   * 命令名称
   */
  name: string;
  
  /**
   * 命令描述
   */
  description: string;
  
  /**
   * 位置参数定义
   */
  arguments?: ArgumentDefinition[];
  
  /**
   * 选项参数定义
   */
  options?: OptionDefinition[];
  
  /**
   * 命令执行函数
   */
  action: CommandAction;
  
  /**
   * 子命令定义
   */
  subcommands?: CommandDefinition[];
  
  /**
   * 所属领域，用于组织命令层次结构
   */
  domain?: string;
}

// types/CLIErrors.ts
export class DuplicateCommandError extends Error {
  constructor(
    public readonly commandPath: string
  ) {
    super(`Duplicate command definition: ${commandPath}`);
    this.name = 'DuplicateCommandError';
  }
}
```

### 5.3 Core层设计 (原 4.3)

```typescript
// core/cli/cliService.ts
import { Command } from 'commander';
import { CLIAdapter } from './CLIAdapter';
import { DuplicateCommandError } from '../../types/errors';
import type { CLITypes, CLIOptions, CommandDefinition } from '../../types';

// 默认选项
const defaultOptions: Partial<CLIOptions> = {
  defaultDomain: 'core'
};

export function createCLI(
  options: CLIOptions, 
  userCommands: CommandDefinition[]
): CLITypes {
  // 合并选项
  const mergedOptions: Required<CLIOptions> = {
    ...defaultOptions,
    ...options
  } as Required<CLIOptions>;
  
  // 创建适配器
  const adapter = new CLIAdapter(
    mergedOptions.name,
    mergedOptions.version,
    mergedOptions.description
  );
  
  // 设置全局选项
  setupGlobalOptions(adapter, mergedOptions);
  
  // 验证并设置用户命令
  validateCommands(userCommands);
  setupUserCommands(adapter, userCommands);
  
  // 返回CLI接口
  return {
    execute: (argv?: string[]) => adapter.parse(argv),
    showHelp: () => adapter.showHelp(),
    showVersion: () => adapter.showVersion(),
    registerCommands: (commands: CommandDefinition[]) => {
      validateCommands(commands);
      registerExternalCommands(adapter, commands);
    }
  };
}

// 设置全局选项
function setupGlobalOptions(
  adapter: CLIAdapter, 
  options: Required<CLIOptions>
): void {
  // 设置全局选项如--verbose等
}

// 设置用户自定义命令
function setupUserCommands(
  adapter: CLIAdapter, 
  commands: CommandDefinition[]
): void {
  commands.forEach(command => adapter.setupCommand(command));
}

// 注册外部命令
function registerExternalCommands(
  adapter: CLIAdapter, 
  commands: CommandDefinition[]
): void {
  commands.forEach(command => adapter.setupCommand(command));
}

// 验证命令集是否有重复定义
function validateCommands(commands: CommandDefinition[]): void {
  const pathSet = new Set<string>();
  
  function validateCommandTree(command: CommandDefinition, parentPath?: string) {
    const path = getCommandPath(command, parentPath);
    
    if (pathSet.has(path)) {
      throw new DuplicateCommandError(path);
    }
    
    pathSet.add(path);
    
    if (command.subcommands?.length) {
      command.subcommands.forEach(sub => validateCommandTree(sub, path));
    }
  }
  
  commands.forEach(cmd => validateCommandTree(cmd));
}

// 获取命令的完整路径用于检测重复
function getCommandPath(command: CommandDefinition, parentPath?: string): string {
  const domainPrefix = command.domain ? `${command.domain}:` : '';
  const basePath = `${domainPrefix}${command.name}`;
  return parentPath ? `${parentPath} ${basePath}` : basePath;
}
```

### 5.4 适配器设计

```typescript
// core/cli/CLIAdapter.ts
import { Command } from 'commander';
import { DuplicateCommandError } from '../../types/errors';
import type { CommandDefinition, ArgumentDefinition, OptionDefinition } from '../../types';

export class CLIAdapter {
  private program: Command;
  private commandPaths = new Set<string>();
  
  constructor(name: string, version: string, description: string) {
    this.program = new Command(name)
      .version(version)
      .description(description);
  }
  
  public setupCommand(command: CommandDefinition, parentPath?: string): void {
    // 构建完整命令路径
    const commandPath = this.buildCommandPath(command, parentPath);
    
    // 检查命令是否重复
    if (this.commandPaths.has(commandPath)) {
      throw new DuplicateCommandError(commandPath);
    }
    
    // 记录命令路径
    this.commandPaths.add(commandPath);
    
    // 创建Commander命令
    const cmd = this.program.command(command.name)
      .description(command.description);
    
    // 应用参数和选项
    this.applyArguments(cmd, command.arguments || []);
    this.applyOptions(cmd, command.options || []);
    
    // 设置动作
    cmd.action(async (...args) => {
      try {
        await command.action(...args);
      } catch (error) {
        this.handleError(error);
      }
    });
    
    // 处理子命令
    if (command.subcommands?.length) {
      command.subcommands.forEach(subcommand => {
        this.setupCommand(subcommand, commandPath);
      });
    }
  }
  
  public setupDomainCommands(domainName: string, commands: CommandDefinition[]): void {
    // 添加领域前缀到命令中
    commands.forEach(command => {
      this.setupCommand({
        ...command,
        domain: domainName
      });
    });
  }
  
  public async parse(argv?: string[]): Promise<void> {
    await this.program.parseAsync(argv || process.argv);
  }
  
  public showHelp(): void {
    this.program.outputHelp();
  }
  
  public showVersion(): void {
    
  }
  
  private buildCommandPath(command: CommandDefinition, parentPath?: string): string {
    const domainPrefix = command.domain ? `${command.domain}:` : '';
    const basePath = `${domainPrefix}${command.name}`;
    return parentPath ? `${parentPath} ${basePath}` : basePath;
  }
  
  private applyArguments(command: Command, args: ArgumentDefinition[]): void {
    args.forEach(arg => {
      const argDescription = arg.description || '';
      if (arg.required) {
        command.argument(`<${arg.name}>`, argDescription);
      } else if (arg.variadic) {
        command.argument(`[${arg.name}...]`, argDescription);
      } else {
        command.argument(`[${arg.name}]`, argDescription);
      }
    });
  }
  
  private applyOptions(command: Command, options: OptionDefinition[]): void {
    options.forEach(opt => {
      command.option(
        opt.flags,
        opt.description || '',
        opt.defaultValue
      );
    });
  }
  
  private handleError(error: Error): void {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
```

## 6. 错误处理

CLI模块采用分层错误处理策略，确保底层库的实现细节不会暴露给调用者，并提供一致的用户体验：

### 6.1 适配器层 (`CLIAdapter.parse`)

`CLIAdapter.parse` 方法负责 **捕获并处理** 底层库 (Commander.js) 特有的、非致命的退出情况。这包括用户请求帮助 (`--help`) 或版本信息 (`--version`)。

-   当检测到 `commander.helpDisplayed` 或 `commander.version` 错误码时，`parse` 方法会 **直接返回**，因为 Commander.js 已经处理了相应的输出。这些情况不被视为程序错误。
-   在 **测试环境** (`NODE_ENV === 'test'` 或 `VITEST`) 下，为了方便测试断言，`parse` 方法也会直接返回，即使遇到其他错误。
-   对于其他 **真正的解析错误** 或来自命令 `action` 的错误 (在非测试环境)，`parse` 方法会将其 **重新抛出**，交由上层处理。

```typescript
// CLIAdapter.ts 简化示例
public async parse(argv?: string[]): Promise<void> {
  try {
    await this.program.parseAsync(argv || process.argv);
  } catch (err) {
    // 处理Commander.js特有错误 (非错误退出)
    if (err && typeof err === 'object' && 'code' in err) {
      if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
        return; // 不是错误，直接返回
      }
    }
    
    // 测试环境中特殊处理
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      return; // 方便测试断言
    }
    
    // 其他真正的错误则向上抛出
    throw err;
  }
}

// CLIAdapter.ts action wrapper 简化示例
cmd.action(async (...args) => {
  try {
    await command.action(...args);
  } catch (err) {
    this.handleError(err as Error, command); // 内部处理（如日志）
    throw err; // 重新抛出给 Service 层
  }
});
```

### 6.2 服务层 (`cliService.execute`)

`cliService` 返回的 `execute` 方法负责捕获从 `CLIAdapter.parse` 抛出的 **所有未处理错误**。

-   使用 `try...catch` 包裹对 `adapter.parse()` 的调用。
-   在 `catch` 块中：
    -   使用 `console.error` **记录错误信息**，向用户提供反馈。
    -   检查环境：如果 **不是测试环境**，则调用 `process.exit(1)` 退出程序，表示执行失败。
    -   **重新抛出错误** (`throw error`)，允许 `execute` 的调用者（理论上，但在 `bin.ts` 中通常不需要）进一步处理。

```typescript
// cliService.ts 简化示例
return {
  execute: async (argv?: string[]) => {
    try {
      await adapter.parse(argv);
    } catch (error) {
      console.error('命令执行出错:', error);
      
      // 非测试环境时退出进程
      if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
        process.exit(1);
      }
      
      throw error; // 重新抛出
    }
  },
  // ...其他方法
};
```

### 6.3 应用入口层 (`bin.ts`)

应用入口脚本 (`bin.ts`) **不应** 包含针对 Commander.js 特定错误代码的检查。它的职责是调用 `cli.execute()` 并处理 **初始化阶段** 或 `cli.execute` 抛出的 **未捕获** 错误（理论上 `cli.execute` 会处理并退出，但这提供最终保障）。

```typescript
// bin.ts 简化示例
async function main() {
  // ... 创建和注册 CLI ...
  
  // 直接执行CLI，无需 try-catch 处理 commander 特定错误
  await cli.execute(); 
}

// 仅捕获 main 函数启动或执行期间的意外错误
main().catch(error => {
  console.error('CLI启动或执行过程中发生意外错误:', error);
  process.exit(1); // 以错误码退出
});
```

这种分层处理确保了职责清晰，提高了代码的可维护性，并为用户提供了统一的错误反馈。

## 7. bin.ts正确使用示例

以下是 `bin.ts` 脚本的推荐实现方式，展示了如何利用 `cliService` 提供的抽象，而无需关心底层细节：

```typescript
#!/usr/bin/env node

import { createCLI } from './api/cli'; // 从 API 层导入
import {
  getAllRegisteredCommands, 
  // ... 其他需要的领域服务
} from './core/framework/domainService';

// 可以从 package.json 获取版本信息
const VERSION = process.env.npm_package_version || 'unknown'; 

async function main() {
  // 1. 创建CLI实例
  const cli = createCLI({
    name: 'dpml', // 替换为你的CLI名称
    version: VERSION,
    description: 'DPML命令行工具' // 替换为你的CLI描述
  }, []); // 初始命令可以为空，稍后注册

  // 2. (可选) 初始化领域和注册命令
  // const coreContext = initializeDomain(...);
  // processDomainCommands(..., coreContext);
  
  // 3. 获取所有需要注册的命令
  const commandsToRegister = getAllRegisteredCommands(); 
  // 可能还需要合并其他来源的命令

  // 4. 注册命令到CLI实例
  cli.registerCommands(commandsToRegister);

  // 5. 执行CLI - 无需 try-catch 处理 Commander 特有错误
  // 错误处理已由 cliService.execute 内部完成
  await cli.execute(); 
}

// 6. 捕获并处理 main 函数执行期间的意外错误
main().catch(error => {
  console.error('CLI启动或执行过程中发生意外错误:', error);
  process.exit(1); // 以错误码退出
});
```

**关键点**: `bin.ts` 的主要职责是组装和启动。它依赖 `createCLI` 来获取一个功能完备且包含错误处理逻辑的 `CLI` 实例，然后调用 `execute` 即可。

## 8. 未来展望 (原 5. 未来展望)
// ... existing code ...
## 9. 附录 (原 6. 附录)
// ... existing code ...
