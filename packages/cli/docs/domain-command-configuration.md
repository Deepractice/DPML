# DPML 领域命令配置规范

本文档定义了DPML各领域包如何配置和暴露命令的标准格式，以便CLI能够自动发现和加载这些命令。

## 配置方式

各领域包需要在包根目录创建标准命名的配置文件 `dpml.config.ts`，CLI将自动发现并加载此文件中定义的命令。

### 文件位置

在领域包的根目录下创建 `dpml.config.ts` 文件：

```
packages/agent/
├── src/
│   └── commands/
│       ├── run.ts
│       └── create.ts
├── dpml.config.ts    # 标准命令配置文件
└── package.json
```

### 配置文件格式

`dpml.config.ts` 文件应导出符合以下接口的配置对象：

```typescript
// 命令选项定义
interface CommandOption {
  // 选项标志，如 "-v, --verbose" 或 "--output <file>"
  flag: string;
  // 选项描述
  description: string;
  // 默认值（可选）
  default?: any;
}

// 单个命令定义
interface Command {
  // 命令名称
  name: string;
  // 命令描述
  description: string;
  // 命令选项列表
  options?: CommandOption[];
  // 使用示例
  examples?: string[];
  // 可选：命令别名
  aliases?: string[];
  // 命令执行函数
  execute: (
    args: string | string[],
    options: Record<string, any>,
    context?: any
  ) => Promise<void>;
}

// 生命周期钩子
interface CommandHooks {
  // CLI初始化时执行
  initialize?: () => Promise<void>;
  // 命令执行前调用
  beforeCommand?: (commandName: string) => Promise<void>;
  // 命令执行后调用
  afterCommand?: (commandName: string, result: any) => Promise<void>;
}

// 领域命令配置
interface DomainCommandConfig {
  // 领域名称（对应CLI中的领域部分，如 dpml <domain> <command>）
  domain: string;
  // 命令列表
  commands: Command[];
  // 默认命令（可选）
  // 当用户输入 dpml <domain> <args> 而不指定具体命令时使用
  defaultCommand?: string;
  // 生命周期钩子（可选）
  hooks?: CommandHooks;
}
```

### 示例配置

```typescript
// packages/agent/dpml.config.ts
import { execute as runExecute } from './src/commands/run';
import { execute as createExecute } from './src/commands/create';

export default {
  domain: 'agent',
  // 当用户输入 dpml agent <file> 时默认执行 run 命令
  defaultCommand: 'run',
  commands: [
    {
      name: 'run',
      description: '运行指定的代理',
      options: [
        { flag: '-e, --env <environment>', description: '指定运行环境' },
        { flag: '-v, --verbose', description: '显示详细日志' },
      ],
      examples: [
        'dpml agent run assistant.dpml',
        'dpml agent run --env production assistant.dpml',
      ],
      execute: runExecute,
    },
    {
      name: 'create',
      description: '创建新代理',
      options: [{ flag: '-t, --template <n>', description: '使用模板' }],
      examples: [
        'dpml agent create myagent',
        'dpml agent create --template chat myagent',
      ],
      execute: createExecute,
    },
  ],
  hooks: {
    initialize: async () => {
      // 初始化逻辑
      console.log('Agent commands initialized');
    },
  },
};
```

## 命令实现指南

### 命令执行函数

命令的 `execute` 函数应该符合以下签名：

```typescript
async function execute(
  // 主要参数（来自命令后的位置参数）
  args: string | string[],
  // 选项（来自命令选项）
  options: Record<string, any>,
  // CLI上下文（可选）
  context?: any
): Promise<void>;
```

### 命令实现示例

```typescript
// packages/agent/src/commands/run.ts
export interface RunOptions {
  env?: string;
  verbose?: boolean;
}

export async function execute(
  filePath: string,
  options: RunOptions,
  context?: any
): Promise<void> {
  console.log(
    `Running agent from ${filePath} in ${options.env || 'default'} environment`
  );

  // 命令实现...

  // 返回结果或抛出异常
  if (error) {
    throw new Error(`Failed to run agent: ${error.message}`);
  }
}
```

## 特殊命令规则

### 默认命令

当设置了 `defaultCommand` 属性，在用户不指定具体命令时将使用该命令：

```
dpml agent assistant.dpml  # 等同于 dpml agent run assistant.dpml
```

默认命令必须是已在 `commands` 数组中定义的命令。

#### 命令匹配解析规则

为了避免命令解析的歧义，CLI遵循以下严格的匹配规则：

1. **命令识别优先级**

   - CLI首先检查领域后的第一个参数是否匹配已注册的命令名或别名
   - 如找到匹配的命令，则使用该命令，后续参数作为该命令的参数
   - 如未找到匹配命令，则应用默认命令，并将所有参数传递给该命令

2. **命令名冲突处理**

   - 当参数可能与命令名冲突时（如文件名与命令名相同），已注册的命令名总是具有更高优先级
   - 例如：如果存在`create`命令，则`dpml agent create`一定会调用`create`命令，而不会将`create`作为参数传递给默认命令

3. **参数强制标记**

   - 可使用双连字符`--`作为特殊标记，其后的所有内容都被强制视为参数而非命令
   - 例如：`dpml agent -- create`会将`create`作为参数传递给默认命令，即使存在名为`create`的命令

4. **错误处理**
   - 当指定了不存在的命令且未设置默认命令时，CLI将显示错误信息
   - 当指定了存在的命令但参数不足或无效时，该命令负责处理错误

#### 示例场景

| 命令行输入                 | 解析结果                                             | 说明                     |
| -------------------------- | ---------------------------------------------------- | ------------------------ |
| `dpml agent run file.dpml` | 执行`run`命令，参数为`file.dpml`                     | 明确指定命令             |
| `dpml agent file.dpml`     | 执行默认命令`run`，参数为`file.dpml`                 | 使用默认命令             |
| `dpml agent create`        | 执行`create`命令，无参数                             | 命令名优先               |
| `dpml agent -- create`     | 执行默认命令`run`，参数为`create`                    | 使用`--`强制参数         |
| `dpml agent unknown`       | 若`unknown`不是命令名，执行默认命令，参数为`unknown` | 无匹配命令时使用默认命令 |

### 帮助命令

CLI会自动为每个领域添加 `--help` 选项，显示该领域下的所有可用命令。

### 命令别名

可以通过在命令定义中添加 `aliases` 字段来定义命令别名：

```typescript
{
  name: "run",
  description: "运行指定的代理",
  aliases: ["start", "exec"],
  // ...
}
```

这样用户可以使用 `dpml agent run`、`dpml agent start` 或 `dpml agent exec` 来执行同一个命令。

## 命令发现与加载流程

当CLI执行时，会按照以下步骤发现和加载命令：

1. 查找领域包根目录下的 `dpml.config.ts` 或编译后的 `dpml.config.js` 文件
2. 加载配置文件，注册领域和命令
3. 当用户执行命令时，根据映射调用对应的 execute 函数

## 最佳实践

1. **命令粒度**：每个命令应专注于单一功能，遵循单一职责原则
2. **命令组织**：相关命令应组织在一起，形成逻辑分组
3. **错误处理**：命令应妥善处理错误并提供清晰的错误信息
4. **帮助文档**：为每个命令提供详细的描述和示例
5. **选项命名**：保持选项命名的一致性，遵循CLI选项命名惯例
