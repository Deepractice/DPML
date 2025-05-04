# DPML CLI 需求文档

## 1. 项目背景

DPML (Deepractice Prompt Markup Language) 是一种专为AI提示词工程设计的声明式标记语言，作为人类意图和AI处理之间的标准化中间表示。目前，DPML生态系统包含多个专门的包：

- `@dpml/core` - 核心功能包
- `@dpml/agent` - 智能代理功能包
- `@dpml/example` - 示例功能包

为了提供统一且简洁的用户体验，我们需要创建一个主入口CLI工具，能够将用户命令路由到相应的领域CLI。

## 2. 需求概述

### 2.1 核心需求

1. 创建一个名为`dpml`的主命令行工具包
2. 实现领域路由功能，格式为：`dpml <domain> [commands...] [options...]`
3. 支持核心领域：core、agent、example
4. 提供清晰的帮助信息和错误处理
5. 遵循npm包设计最佳实践

### 2.2 用户体验目标

1. 简单易用的安装方式：`npm install -g dpml`
2. 直观的命令结构：`dpml <domain> <command>`
3. 统一的命令入口，但保持各领域CLI的完整功能
4. 友好的错误信息和帮助文档

### 2.3 命令格式说明

重要：与现有命令格式的区别

目前各个领域包的命令格式为：
- `dpml-agent agent chat ...` (agent领域)
- `dpml-core core validate ...` (core领域)

在统一的CLI中，命令格式将变为：
- `dpml agent chat ...` (agent领域)
- `dpml core validate ...` (core领域)

这种格式必须保留domain参数，因为它是路由到正确领域CLI的关键。设计不支持省略domain参数的原因是：
1. 明确区分不同领域的功能边界
2. 避免跨领域命令名称冲突
3. 保持命令结构的一致性和可预测性

## 3. 设计方案

### 3.1 包命名与结构

- **包名**：`dpml`（非命名空间）
- **内部目录**：`packages/cli`
- **区分策略**：
  - 命令行工具使用非命名空间包名（dpml）
  - 开发库使用命名空间包名（@dpml/xxx）

### 3.2 技术架构

采用Commander框架实现的路由设计：
1. 使用Commander框架创建专业的命令行界面
2. 解析第一个参数（domain）作为子命令
3. 验证domain是否有效
4. 找到对应领域包的bin文件
5. 将剩余所有参数完整转发给该领域CLI

### 3.3 依赖关系

- 将各领域包作为依赖项引入
- 使用Commander库提供专业的命令行体验
- 不依赖`@dpml/core`的框架功能，保持独立性
- 最小化其他外部依赖，保持轻量

## 4. 实施细节

### 4.1 Commander实现

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Get package information
const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

// Create program instance
const program = new Command();

// Domain package mapping
const DOMAINS = {
  'core': '@dpml/core',
  'agent': '@dpml/agent',
  'example': '@dpml/example'
};

// Configure program basic information
program
  .name('dpml')
  .description('DPML (Deepractice Prompt Markup Language) Command Line Tool')
  .version(packageJson.version);

// Add subcommands for each domain
Object.keys(DOMAINS).forEach(domain => {
  const domainCommand = program
    .command(domain)
    .description(`${domain} domain operations`)
    .allowUnknownOption() // Allow unknown options to be passed to subcommand
    .action(async (options, command) => {
      const packageName = DOMAINS[domain];
      
      try {
        // Get subcommand arguments
        const args = command.args.slice(1); // Remove domain name
        const unknownOptions = command.parseOptions(process.argv).unknown || [];
        
        // Get bin path
        const binPath = getBinPath(packageName);
        
        // Create subprocess to execute command
        const child = spawn('node', [binPath, ...args, ...unknownOptions], {
          stdio: 'inherit'
        });
        
        child.on('exit', (code) => {
          process.exit(code || 0);
        });
      } catch (error) {
        console.error(`Error: Cannot execute ${domain} domain command`);
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
    
  // Add help text
  domainCommand.addHelpText('after', `
Examples:
  dpml ${domain} --help          View help for ${domain} domain
  dpml ${domain} validate file.xml   Validate a DPML document
  `);
});

// Add overall help information
program.addHelpText('after', `
Examples:
  dpml core validate file.xml    Validate a core domain DPML document
  dpml agent chat agent-config.xml    Interact with an agent
  
For more information visit: https://github.com/Deepractice/dpml
`);

// Get package bin path
function getBinPath(packageName: string): string {
  try {
    const packagePath = require.resolve(`${packageName}/package.json`);
    const packageDir = packagePath.substring(0, packagePath.lastIndexOf('/'));
    return resolve(packageDir, 'dist/bin.js');
  } catch (error) {
    throw new Error(`Cannot find bin file for ${packageName} package`);
  }
}

// Execute program
program.parse();
```

### 4.2 CLI默认命令

除了路由命令到领域CLI外，DPML主命令行工具还应提供一些内置命令，用于管理和导航领域。第一个此类命令是`list`，它显示所有可用的领域。

#### 4.2.1 list命令实现

```typescript
// 添加list命令 - 显示所有可用领域
program
  .command('list')
  .description('List all available DPML domains')
  .action(() => {
    // 直接从DOMAINS对象获取并显示域名
    console.log('Available DPML domains:');
    console.log('');
    Object.keys(DOMAINS).forEach(domain => {
      console.log(`  ${domain}`);
    });
  });
```

这个简单实现只显示已注册领域的名称，不获取任何额外信息，以确保命令执行快速且可靠。

#### 4.2.2 命令输出示例

```
$ dpml list
Available DPML domains:

  core
  agent
  example
```

#### 4.2.3 未来扩展

未来可以扩展此命令以提供更多信息和选项，例如：
- `--json` - 以JSON格式输出
- `--verbose` - 显示详细信息（版本、描述等）
- `--installed` - 只显示已安装的领域

还可以添加其他管理命令：
- `dpml info <domain>` - 显示特定领域的详细信息
- `dpml install <domain>` - 安装新领域
- `dpml update [domain]` - 更新领域

### 4.3 package.json 配置

```json
{
  "name": "dpml",
  "version": "0.0.1",
  "description": "DPML (Deepractice Prompt Markup Language) 命令行工具",
  "type": "module",
  "bin": {
    "dpml": "./dist/bin.js"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "dependencies": {
    "@dpml/core": "^0.0.1",
    "@dpml/agent": "^0.0.1",
    "@dpml/example": "^0.0.1",
    "commander": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "dpml",
    "cli",
    "prompt-engineering"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### 4.4 tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.5 项目目录结构

```
packages/cli/
  ├── src/
  │   └── bin.ts          # CLI入口点
  ├── dist/               # 编译输出
  ├── docs/               # 文档
  │   └── requirements.md # 本文档
  ├── package.json        # 包配置
  ├── tsconfig.json       # TypeScript配置
  └── README.md           # 用户文档
```

## 5. 使用示例

### 5.1 安装

```bash
# 全局安装
npm install -g dpml

# 或本地项目安装
npm install dpml
```

### 5.2 基本使用

```bash
# 列出所有可用领域
dpml list

# 使用core领域功能
dpml core validate file.xml

# 使用agent领域功能
dpml agent chat agent-config.xml --env API_KEY=sk-xxxx

# 使用example领域功能
dpml example generate template.xml
```

### 5.3 获取帮助

```bash
# 主帮助
dpml --help

# 领域帮助
dpml core --help
```

## 6. 发布计划

1. 完成v0.0.1版本开发
2. 进行本地测试，确保所有领域正常工作
3. 发布到npm注册表
4. 收集用户反馈，迭代改进

## 7. 未来扩展

1. 支持插件系统，允许第三方领域包注册
2. 添加更多辅助功能，如自动更新检查
3. 提供详细的使用统计和诊断功能
4. 优化错误处理和用户反馈机制
5. 扩展CLI默认命令集，提供更丰富的领域管理功能

