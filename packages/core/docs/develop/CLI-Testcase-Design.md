# DPML CLI模块测试用例设计

本文档遵循 [测试用例设计规则](../../../../rules/architecture/test-case-design.md) 设计DPML CLI模块的测试用例。

## 1. 测试范围

本测试计划覆盖CLI模块的核心功能，包括：
- API层和Types层的契约稳定性
- CLI实例的创建与配置
- 命令定义和注册机制
- 命令冲突检测功能
- 闭包状态管理的正确性
- 命令行参数解析和执行流程
- 完整的命令行交互端到端流程

## 2. 测试类型与目标

- **契约测试**: 确保API和类型定义的稳定性，防止意外的破坏性变更
- **单元测试**: 验证各组件的独立功能，特别是cliService和CLIAdapter的各个函数
- **集成测试**: 验证CLI的命令注册和执行流程，确保完整命令执行流程
- **端到端测试**: 验证从用户输入命令到执行结果的完整工作流程

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/api/cli.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-API-CLITypes-01 | `createCLI` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 符合公开文档的函数签名 | 无需模拟 |
| CT-API-CLITypes-02 | `createCLI` API应返回符合CLI接口的对象 | 验证返回类型契约 | 有效的CLIOptions和CommandDefinition[] | 返回符合CLI接口的对象 | 模拟cliService返回符合契约的数据 |
| CT-API-CLITypes-03 | `createCLI` API应支持类型安全的命令定义 | 验证类型安全性 | 不同类型的CommandDefinition | 类型错误被类型系统捕获 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/CLITypes.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-CLITypes-01 | CLI接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含execute、showHelp、showVersion和registerCommands方法 | 无需模拟 |
| CT-TYPE-CLITypes-02 | CLITypes.execute应返回Promise<void> | 验证返回类型 | 类型检查 | execute方法返回Promise<void>类型 | 无需模拟 |
| CT-TYPE-CLITypes-03 | CLITypes.registerCommands应接受命令定义数组 | 验证参数类型 | 类型检查 | registerCommands接受CommandDefinition[]参数 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/CommandDefinition.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-CMDF-01 | CommandDefinition接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含name、description、arguments、options、action、subcommands和domain字段 | 无需模拟 |
| CT-TYPE-CMDF-02 | CommandDefinition.subcommands应支持递归结构 | 验证递归类型 | 嵌套的CommandDefinition | 子命令支持与父命令相同的结构 | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/core/cli/cliService.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-CLISVC-01 | createCLI应正确初始化CLI | 验证初始化功能 | 有效的CLIOptions和CommandDefinition[] | 返回包含正确方法的CLI对象 | 模拟CLIAdapter |
| UT-CLISVC-02 | createCLI应设置默认选项 | 验证默认值处理 | 不含defaultDomain的CLIOptions | 使用'core'作为默认领域 | 模拟CLIAdapter |
| UT-CLISVC-03 | setupGlobalOptions应设置全局选项 | 验证全局选项设置 | CLIAdapter和Options | 全局选项被设置 | 模拟CLIAdapter |
| UT-CLISVC-04 | setupUserCommands应遍历注册用户命令 | 验证命令注册 | CLIAdapter和CommandDefinition[] | 所有命令被注册 | 模拟CLIAdapter.setupCommand |
| UT-CLISVC-05 | registerExternalCommands应正确注册外部命令 | 验证外部命令注册 | CLIAdapter和CommandDefinition[] | 外部命令被正确注册 | 模拟CLIAdapter.setupCommand |
| UT-CLISVC-06 | validateCommands应验证命令无重复 | 验证命令冲突检测 | 无重复的CommandDefinition[] | 不抛出异常 | 无需模拟 |
| **反向测试** |
| UT-CLISVC-NEG-01 | validateCommands应检测到重复命令 | 验证命令冲突检测 | 包含重复命令的数组 | 抛出DuplicateCommandError | 无需模拟 |
| UT-CLISVC-NEG-02 | validateCommands应检测子命令重复 | 验证子命令冲突检测 | 包含重复子命令的数组 | 抛出DuplicateCommandError | 无需模拟 |
| UT-CLISVC-NEG-03 | validateCommands应检测跨领域命令重复 | 验证跨领域冲突检测 | 不同领域有相同命令名 | 抛出DuplicateCommandError | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/cli/CLIAdapter.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-CLIADP-01 | CLIAdapter构造函数应创建Commander实例 | 验证初始化 | 名称、版本和描述 | 创建正确配置的实例 | 模拟Commander构造函数 |
| UT-CLIADP-02 | setupCommand应注册单个命令 | 验证命令注册 | CommandDefinition | 命令被正确注册 | 模拟Commander.command和相关方法 |
| UT-CLIADP-03 | setupCommand应处理命令参数 | 验证参数注册 | 带参数的CommandDefinition | 参数被正确注册 | 模拟Commander命令方法 |
| UT-CLIADP-04 | setupCommand应处理命令选项 | 验证选项注册 | 带选项的CommandDefinition | 选项被正确注册 | 模拟Commander命令方法 |
| UT-CLIADP-05 | setupCommand应递归处理子命令 | 验证子命令注册 | 带子命令的CommandDefinition | 子命令被递归注册 | 模拟Commander命令方法 |
| UT-CLIADP-06 | setupDomainCommands应注册领域命令 | 验证领域命令注册 | 领域名和命令数组 | 领域命令被注册 | 模拟setupCommand方法 |
| UT-CLIADP-07 | parse应调用Commander解析 | 验证命令行解析 | 命令行参数数组 | Commander.parseAsync被调用 | 模拟Commander.parseAsync |
| **反向测试** |
| UT-CLIADP-NEG-01 | setupCommand应检测命令重复 | 验证重复检测 | 重复的命令路径 | 抛出DuplicateCommandError | 模拟Commander命令方法 |
| UT-CLIADP-NEG-02 | action处理程序应捕获命令执行错误 | 验证错误处理 | 抛出错误的命令处理函数 | 错误被捕获并处理 | 模拟命令action和console.error |

#### 文件: `packages/core/src/__tests__/unit/core/cli/commandUtils.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| UT-CLIUTL-01 | mergeDefaultOptions应合并默认选项 | 验证选项合并 | 部分选项对象 | 返回包含默认值的完整选项 | 无需模拟 |
| UT-CLIUTL-02 | validateCommands应验证无重复命令 | 验证命令验证 | 无重复的命令数组 | 不抛出异常 | 无需模拟 |
| UT-CLIUTL-03 | getCommandPath应返回完整命令路径 | 验证路径构建 | 命令和可选父路径 | 返回正确格式的完整路径 | 无需模拟 |
| UT-CLIUTL-04 | getCommandPath应处理领域前缀 | 验证领域处理 | 带领域的命令和父路径 | 路径包含领域前缀 | 无需模拟 |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/cli/commandExecution.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-CLIEXC-01 | CLI应处理基本命令执行 | 验证基本命令流程 | 简单命令定义和参数 | 命令被正确执行 | 模拟action函数 |
| IT-CLIEXC-02 | CLI应处理带参数的命令 | 验证参数处理 | 带参数的命令定义和输入 | 参数被正确传递给action | 模拟action函数 |
| IT-CLIEXC-03 | CLI应处理带选项的命令 | 验证选项处理 | 带选项的命令定义和输入 | 选项被正确传递给action | 模拟action函数 |
| IT-CLIEXC-04 | CLI应处理嵌套子命令 | 验证子命令流程 | 嵌套命令定义和输入 | 子命令被正确执行 | 模拟子命令action函数 |
| IT-CLIEXC-05 | CLI应处理外部注册的命令 | 验证外部命令执行 | 外部注册的命令定义和输入 | 外部命令被正确执行 | 模拟action函数 |

#### 文件: `packages/core/src/__tests__/integration/cli/closureState.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-CLICLSR-01 | CLI闭包应维护独立状态 | 验证状态隔离 | 两个不同配置创建的CLI | 每个CLI维护独立状态 | 模拟CLIAdapter |
| IT-CLICLSR-02 | CLI闭包应防止外部直接修改状态 | 验证状态封装 | 尝试直接修改CLI状态 | 无法直接访问或修改内部状态 | 无需模拟 |
| IT-CLICLSR-03 | CLI闭包方法应共享相同状态 | 验证状态共享 | 调用同一CLI的多个方法 | 所有方法访问同一适配器实例 | 模拟CLIAdapter |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/cli/cliUsage.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| E2E-CLITypes-01 | 用户应能定义和执行基本命令 | 验证基本用例 | 基本命令定义和执行 | 命令被正确执行 | 最小模拟 |
| E2E-CLITypes-02 | 用户应能定义和执行带参数的命令 | 验证参数用例 | 带参数的命令定义和执行 | 参数被正确处理 | 最小模拟 |
| E2E-CLITypes-03 | 用户应能定义和执行带选项的命令 | 验证选项用例 | 带选项的命令定义和执行 | 选项被正确处理 | 最小模拟 |
| E2E-CLITypes-04 | 用户应能定义和执行嵌套子命令 | 验证子命令用例 | 嵌套命令定义和执行 | 子命令被正确解析和执行 | 最小模拟 |
| E2E-CLITypes-05 | 用户应能获取帮助信息 | 验证帮助功能 | --help选项 | 显示正确的帮助信息 | 最小模拟 |
| E2E-CLITypes-06 | 用户应能获取版本信息 | 验证版本功能 | --version选项 | 显示正确的版本信息 | 最小模拟 |
| E2E-CLITypes-07 | CLI应正确处理无效命令 | 验证错误处理 | 未定义的命令 | 显示适当的错误信息 | 最小模拟 |
| E2E-CLITypes-08 | CLI应支持动态注册命令 | 验证动态注册 | 后续注册的外部命令 | 外部命令被正确执行 | 最小模拟 |

## 4. 测试夹具设计

```typescript
// packages/core/src/__tests__/fixtures/cli/cliFixtures.ts

// 创建基本CLI选项夹具
export function createCLIOptionsFixture() {
  return {
    name: 'dpml',
    version: '1.0.0',
    description: 'DPML命令行工具'
  };
}

// 创建命令定义夹具
export function createCommandDefinitionsFixture() {
  return [
    {
      name: 'parse',
      description: '解析DPML文档',
      arguments: [
        { 
          name: 'file', 
          description: 'DPML文件路径', 
          required: true 
        }
      ],
      options: [
        { 
          flags: '-o, --output <file>', 
          description: '输出文件路径' 
        },
        { 
          flags: '--format <format>', 
          description: '输出格式 (json, xml, yaml)', 
          defaultValue: 'json' 
        }
      ],
      action: vi.fn().mockImplementation((file, options) => {
        console.log(`解析文件: ${file}`);
        console.log(`输出路径: ${options.output || '标准输出'}`);
        console.log(`输出格式: ${options.format}`);
      })
    },
    {
      name: 'validate',
      description: '验证DPML文档',
      arguments: [
        { 
          name: 'file', 
          description: 'DPML文件路径', 
          required: true 
        }
      ],
      options: [
        { 
          flags: '--strict', 
          description: '使用严格模式验证' 
        }
      ],
      action: vi.fn().mockImplementation((file, options) => {
        console.log(`验证文件: ${file}`);
        console.log(`严格模式: ${options.strict ? '是' : '否'}`);
      })
    },
    {
      name: 'convert',
      description: '转换DPML文档格式',
      subcommands: [
        {
          name: 'to-json',
          description: '转换为JSON格式',
          arguments: [
            { 
              name: 'file', 
              description: 'DPML文件路径', 
              required: true 
            }
          ],
          action: vi.fn().mockImplementation((file) => {
            console.log(`转换文件到JSON: ${file}`);
          })
        },
        {
          name: 'to-xml',
          description: '转换为XML格式',
          arguments: [
            { 
              name: 'file', 
              description: 'DPML文件路径', 
              required: true 
            }
          ],
          action: vi.fn().mockImplementation((file) => {
            console.log(`转换文件到XML: ${file}`);
          })
        }
      ]
    }
  ];
}

// 创建重复命令夹具
export function createDuplicateCommandsFixture() {
  return [
    {
      name: 'parse',
      description: '解析DPML文档',
      action: vi.fn()
    },
    {
      name: 'parse',  // 重复的命令名
      description: '解析DPML文档（重复）',
      action: vi.fn()
    }
  ];
}

// 创建子命令重复夹具
export function createDuplicateSubcommandsFixture() {
  return [
    {
      name: 'convert',
      description: '转换DPML文档格式',
      subcommands: [
        {
          name: 'to-json',
          description: '转换为JSON格式',
          action: vi.fn()
        },
        {
          name: 'to-json',  // 重复的子命令
          description: '转换为JSON格式（重复）',
          action: vi.fn()
        }
      ]
    }
  ];
}

// 创建跨领域重复命令夹具
export function createCrossDomainDuplicateCommandsFixture() {
  return [
    {
      name: 'export',
      description: '导出功能',
      domain: 'domain1',
      action: vi.fn()
    },
    {
      name: 'export',  // 相同名称但不同领域
      description: '导出功能',
      domain: 'domain2',
      action: vi.fn()
    }
  ];
}

// 创建命令行参数夹具
export function createCommandLineArgsFixture(command: string) {
  return ['node', 'dpml', ...command.split(' ')];
}

// 创建外部命令夹具
export function createExternalCommandsFixture() {
  return [
    {
      name: 'external',
      description: '外部命令示例',
      arguments: [
        { 
          name: 'input', 
          description: '输入文件', 
          required: true 
        }
      ],
      action: vi.fn().mockImplementation((input) => {
        console.log(`处理外部命令: ${input}`);
      })
    }
  ];
}
```

## 5. 测试实现示例

```typescript
// packages/core/src/__tests__/unit/core/cli/cliService.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { 
  createCLI, 
  setupGlobalOptions, 
  setupUserCommands, 
  registerExternalCommands, 
  validateCommands 
} from '../../../../src/core/cli/cliService';
import { CLIAdapter } from '../../../../src/core/cli/CLIAdapter';
import { DuplicateCommandError } from '../../../../src/types/errors';
import { 
  createCLIOptionsFixture, 
  createCommandDefinitionsFixture, 
  createDuplicateCommandsFixture,
  createExternalCommandsFixture
} from '../../../fixtures/cli/cliFixtures';

// 模拟依赖
vi.mock('../../../../src/core/cli/CLIAdapter');

describe('UT-CLISVC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('createCLI应正确初始化CLI', () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const mockAdapter = {
      parse: vi.fn(),
      showHelp: vi.fn(),
      showVersion: vi.fn()
    };
    
    // 模拟CLIAdapter构造函数
    (CLIAdapter as jest.Mock).mockImplementation(() => mockAdapter);
    
    // 执行
    const cli = createCLI(options, commands);
    
    // 断言
    expect(CLIAdapter).toHaveBeenCalledWith(options.name, options.version, options.description);
    expect(cli).toHaveProperty('execute');
    expect(cli).toHaveProperty('showHelp');
    expect(cli).toHaveProperty('showVersion');
  });
  
  test('validateCommands应检测到重复命令', () => {
    // 准备
    const duplicateCommands = createDuplicateCommandsFixture();
    
    // 执行与断言
    expect(() => validateCommands(duplicateCommands)).toThrow(DuplicateCommandError);
  });

  test('registerExternalCommands应正确注册外部命令', () => {
    // 准备
    const externalCommands = createExternalCommandsFixture();
    const mockAdapter = {
      setupCommand: vi.fn()
    };
    
    // 执行
    registerExternalCommands(mockAdapter as any, externalCommands);
    
    // 断言
    expect(mockAdapter.setupCommand).toHaveBeenCalledTimes(externalCommands.length);
    expect(mockAdapter.setupCommand).toHaveBeenCalledWith(externalCommands[0]);
  });
});

// packages/core/src/__tests__/integration/cli/commandExecution.integration.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createCLI } from '../../../../src/api/cli';
import { 
  createCLIOptionsFixture, 
  createCommandDefinitionsFixture,
  createExternalCommandsFixture,
  createCommandLineArgsFixture 
} from '../../../fixtures/cli/cliFixtures';

describe('IT-CLIEXC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('CLI应处理基本命令执行', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const cmdArgs = createCommandLineArgsFixture('parse test.dpml --format json');
    
    // 获取模拟action
    const parseAction = commands[0].action;
    
    // 创建CLI
    const cli = createCLI(options, commands);
    
    // 执行
    await cli.execute(cmdArgs);
    
    // 断言
    expect(parseAction).toHaveBeenCalledWith('test.dpml', expect.objectContaining({ format: 'json' }));
  });

  test('CLI应处理外部注册的命令', async () => {
    // 准备
    const options = createCLIOptionsFixture();
    const commands = createCommandDefinitionsFixture();
    const externalCommands = createExternalCommandsFixture();
    const cmdArgs = createCommandLineArgsFixture('external test-input.txt');
    
    // 获取模拟action
    const externalAction = externalCommands[0].action;
    
    // 创建CLI并注册外部命令
    const cli = createCLI(options, commands);
    cli.registerCommands(externalCommands);
    
    // 执行
    await cli.execute(cmdArgs);
    
    // 断言
    expect(externalAction).toHaveBeenCalledWith('test-input.txt', expect.anything());
  });
});
```

## 6. 测试覆盖率目标

- **契约测试**: 覆盖所有公共API和Types，确保接口稳定性。
- **单元测试**: 覆盖cliService和CLIAdapter所有函数的核心逻辑，目标行覆盖率85%+。
- **集成测试**: 覆盖CLI的主要执行流程和闭包状态管理，目标行覆盖率80%+。
- **端到端测试**: 覆盖关键的用户使用场景。

## 7. 模拟策略

- **契约测试**: 主要进行类型检查，部分情况下需要模拟cliService返回符合契约的数据。
- **单元测试**:
  - 测试cliService时，模拟CLIAdapter
  - 测试CLIAdapter时，模拟Commander.js的实例和方法
  - 重点测试命令注册和冲突检测逻辑
- **集成测试**: 模拟命令的action函数，验证参数传递和执行流程。
- **端到端测试**: 尽量减少模拟，使用真实组件验证完整流程。

## 8. 测试总结

本测试设计覆盖了CLI模块的所有核心组件和关键功能，遵循DPML架构测试策略规则，设计了不同类型的测试：

1. **契约测试**: 确保API和类型的稳定性和一致性
2. **单元测试**: 验证cliService和CLIAdapter各函数的独立功能
3. **集成测试**: 验证CLI对Commander.js的适配和命令注册执行流程
4. **端到端测试**: 验证完整用户命令行交互流程

测试用例设计注重正向测试和反向测试的平衡，确保既测试正常功能路径，也测试错误处理和冲突检测机制。测试夹具设计提供了丰富的命令定义和配置数据，便于测试的实施和维护。

通过全面的测试覆盖，确保CLI模块能够稳定、高效地创建和管理命令行界面，准确执行用户命令，并提供类型安全的API接口。 
