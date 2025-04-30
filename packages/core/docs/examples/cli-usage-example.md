# DPML CLITypes 使用示例

本文档提供了DPML CLI模块的使用示例和最佳实践，帮助您快速上手CLI功能的开发和扩展。

## 基本使用

以下是创建和使用CLI的基本示例：

```typescript
import { createCLI } from '@dpml/core';
import type { CommandDefinition } from '@dpml/core';

// 定义命令
const commands: CommandDefinition[] = [
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
      }
    ],
    action: async (file, options) => {
      console.log(`解析文件: ${file}`);
      console.log(`输出路径: ${options.output || '标准输出'}`);
      
      // 实际解析逻辑
      // const result = await parseFile(file);
      // if (options.output) {
      //   fs.writeFileSync(options.output, JSON.stringify(result));
      // } else {
      //   console.log(JSON.stringify(result, null, 2));
      // }
    }
  }
];

// 创建CLI
const cli = createCLI(
  {
    name: 'dpml',
    version: '1.0.0',
    description: 'DPML命令行工具'
  },
  commands
);

// 执行CLI
cli.execute().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
```

命令行使用示例：

```bash
# 基本命令
dpml parse input.dpml

# 带选项的命令
dpml parse input.dpml -o output.json
```

## 嵌套子命令

DPML CLI支持嵌套的命令结构：

```typescript
const commands: CommandDefinition[] = [
  {
    name: 'convert',
    description: '转换DPML文档',
    action: () => {
      console.log('请指定转换格式');
    },
    subcommands: [
      {
        name: 'to-json',
        description: '转换为JSON格式',
        arguments: [
          { name: 'file', description: 'DPML文件路径', required: true }
        ],
        action: (file) => {
          console.log(`转换文件 ${file} 为JSON格式`);
          // 实际转换逻辑
        }
      },
      {
        name: 'to-xml',
        description: '转换为XML格式',
        arguments: [
          { name: 'file', description: 'DPML文件路径', required: true }
        ],
        action: (file) => {
          console.log(`转换文件 ${file} 为XML格式`);
          // 实际转换逻辑
        }
      }
    ]
  }
];
```

命令行使用示例：

```bash
# 子命令
dpml convert to-json input.dpml
dpml convert to-xml input.dpml
```

## 动态注册命令

DPML CLI支持在运行时动态注册额外的命令：

```typescript
// 创建基本CLI
const cli = createCLI(options, initialCommands);

// 定义额外命令
const additionalCommands: CommandDefinition[] = [
  {
    name: 'validate',
    description: '验证DPML文档',
    arguments: [
      { name: 'file', description: 'DPML文件路径', required: true }
    ],
    action: (file) => {
      console.log(`验证文件: ${file}`);
      // 实际验证逻辑
    }
  }
];

// 动态注册额外命令
cli.registerCommands(additionalCommands);
```

## 与Framework集成

DPML CLI可以轻松集成Framework中注册的命令：

```typescript
import { createCLI } from '@dpml/core/api/cli';
import { getCommandDefinitions } from '@dpml/core/api/framework';

// 创建CLI
const cli = createCLI(options, userCommands);

// 注册来自Framework的命令
cli.registerCommands(getCommandDefinitions());
```

## 错误处理和帮助信息

DPML CLI提供了增强的错误处理和帮助信息：

```typescript
try {
  // 执行CLI
  await cli.execute();
} catch (error) {
  console.error(`执行错误: ${error.message}`);
  cli.showHelp();
  process.exit(1);
}
```

查看帮助和版本信息：

```bash
# 显示主帮助
dpml --help

# 显示命令帮助
dpml parse --help

# 显示版本信息
dpml --version
```

## 最佳实践

1. **按领域组织命令**：使用`domain`属性将命令归类到不同领域，提高可维护性。

2. **提供详细的描述**：为命令、参数和选项提供清晰的描述文本，使用户能够理解命令的用途。

3. **使用类型安全**：利用TypeScript类型系统，确保命令定义和处理逻辑保持类型安全。

4. **提供帮助和出错提示**：当命令失败时，提供有用的错误信息和相关帮助提示。

5. **考虑测试**：为命令实现单元测试和集成测试，确保命令行界面正常工作。

## 完整示例

一个包含多种功能的完整CLI示例：

```typescript
import { createCLI } from '@dpml/core';
import { readFileSync, writeFileSync } from 'fs';

const commands = [
  {
    name: 'parse',
    description: '解析DPML文件',
    arguments: [
      { name: 'file', description: 'DPML文件路径', required: true }
    ],
    options: [
      { flags: '-o, --output <file>', description: '输出文件路径' },
      { flags: '-f, --format <format>', description: '输出格式 (json|xml)', defaultValue: 'json' }
    ],
    action: (file, options) => {
      try {
        // 读取文件
        const content = readFileSync(file, 'utf-8');
        console.log(`成功读取文件: ${file}`);
        
        // 解析处理逻辑
        const result = { message: `已解析 ${file}` };
        
        // 输出结果
        if (options.output) {
          writeFileSync(options.output, JSON.stringify(result, null, 2));
          console.log(`结果已保存到: ${options.output}`);
        } else {
          console.log('解析结果:');
          console.log(JSON.stringify(result, null, 2));
        }
      } catch (error) {
        console.error(`处理文件时出错: ${error.message}`);
        process.exit(1);
      }
    }
  },
  // 其他命令...
];

// 创建CLI
const cli = createCLI(
  {
    name: 'dpml',
    version: '1.0.0',
    description: 'DPML命令行工具'
  },
  commands
);

// 执行CLI
cli.execute().catch(error => {
  console.error(`执行CLI时发生错误: ${error.message}`);
  process.exit(1);
});
``` 
