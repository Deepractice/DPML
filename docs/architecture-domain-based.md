# DPML基于领域的架构设计

## 1. 架构概述

DPML (Deepractice Prompt Markup Language) 采用基于领域(Domain-Based)的架构设计，将系统划分为清晰的功能领域，每个领域由独立的包负责实现。这种设计既提供了良好的模块化和关注点分离，又避免了插件架构带来的复杂性。

核心思想是：
- 基础设施由核心包提供
- 每个业务领域由专门的领域包实现
- 清晰的领域边界，减少耦合
- 按需安装，降低复杂度

## 2. 设计原则

### 2.1 领域驱动
- 按业务领域而非技术层次划分模块
- 每个领域包有明确的职责边界
- 领域内高内聚，领域间低耦合

### 2.2 简洁性优先
- 简单直接的设计优于过度灵活
- 约定优于配置
- 避免复杂的注册和发现机制

### 2.3 扩展开放
- 任何人可以创建新的领域包
- 遵循命名约定即可集成到生态
- 不强制复杂的插件接口适配

### 2.4 按需组装
- 用户只需安装必要的领域包
- 减少不必要的依赖和复杂度
- CLI工具自动发现已安装的领域

## 3. 项目结构

```
DPML生态系统
├── 核心基础
│   ├── @dpml/core          # 核心库：提供基础设施和类型定义
│   └── @dpml/cli           # CLI框架：命令行工具基础框架
│
├── 官方领域包
│   ├── @dpml/prompt        # 提示词领域：处理提示词相关功能
│   ├── @dpml/agent         # 代理领域：处理代理相关功能
│   └── @dpml/workflow      # 工作流领域：处理多代理工作流
│
└── 社区领域包(举例)
    ├── @org/dpml-vision    # 视觉领域：处理图像相关提示词
    ├── dpml-education      # 教育领域：针对教育场景优化
    └── dpml-legal          # 法律领域：法律文档处理
```

## 4. 领域包设计

每个领域包应满足：

### 4.1 命名约定
- 官方包：`@dpml/{domain-name}`
- 社区包：`dpml-{domain-name}` 或 `@org/dpml-{domain-name}`

### 4.2 包结构
```
domain-package/
├── src/                    # 源代码
├── bin/                    # CLI命令入口
├── package.json            # 包定义，包含dpml相关元数据
└── README.md               # 文档
```

### 4.3 package.json配置
```json
{
  "name": "@example/dpml-mydomain",
  "bin": {
    "dpml-mydomain": "./bin/cli.js"
  },
  "dpml": {
    "domain": "mydomain",
    "description": "My custom DPML domain"
  },
  "dependencies": {
    "@dpml/core": "^1.0.0"
  }
}
```

## 5. CLI架构

DPML CLI遵循一级命令对应领域的设计：

```
dpml <domain> <command> [options] [file]
```

例如：
- `dpml prompt build sample.dpml` - 构建提示词
- `dpml agent run agent.dpml` - 运行代理
- `dpml workflow visualize flow.dpml` - 可视化工作流

### 5.1 命令发现机制

CLI工具通过以下方式发现可用领域：

1. 查找已安装的符合命名约定的包
2. 读取package.json中的dpml相关元数据
3. 自动构建命令路由表

```typescript
// 伪代码示例
function discoverDomains() {
  const packages = findInstalledPackages(/^(@.*\/)?dpml-.*|@dpml\/.*/);
  
  const domains = {};
  for (const pkg of packages) {
    if (pkg.dpml && pkg.dpml.domain) {
      domains[pkg.dpml.domain] = {
        path: pkg.path,
        description: pkg.dpml.description,
        commands: getCommandsFromPackage(pkg)
      };
    } else if (pkg.name.includes('dpml-')) {
      const domainName = pkg.name.replace(/^(@.*\/)?dpml-/, '');
      domains[domainName] = {
        path: pkg.path,
        description: pkg.description,
        commands: getCommandsFromPackage(pkg)
      };
    }
  }
  
  return domains;
}
```

### 5.2 命令执行流程

```
用户输入命令
    ↓
解析命令行参数
    ↓
发现已安装领域
    ↓
查找对应领域处理器
    ↓
调用领域命令执行
    ↓
返回结果
```

## 6. 核心包功能

### 6.1 @dpml/core
- 提供DPML解析和处理的基础设施
- 定义通用类型和接口
- 提供公共工具函数
- 实现@引用系统基础

### 6.2 @dpml/cli
- 提供CLI基础框架
- 实现领域发现机制
- 处理命令行参数
- 提供通用CLI工具

## 7. 领域包功能

### 7.1 @dpml/prompt (提示词领域)
- 处理提示词文档
- 生成各种模型格式的提示
- 提供提示词评估和优化
- CLI命令: `dpml prompt`

### 7.2 @dpml/agent (代理领域)
- 处理代理定义
- 执行代理逻辑
- 管理代理状态和记忆
- CLI命令: `dpml agent`

### 7.3 @dpml/workflow (工作流领域)
- 处理多代理工作流
- 编排代理协作
- 管理工作流状态
- CLI命令: `dpml workflow`

## 8. 扩展生态系统

### 8.1 创建新领域包
任何开发者可以创建新领域包，步骤如下：

1. 创建新包：`dpml-mydomain`
2. 在package.json中添加必要元数据
3. 实现领域特定功能，依赖@dpml/core
4. 提供命令行入口
5. 发布到npm

### 8.2 使用示例
开发者创建的新领域可以无缝集成到DPML生态：

```bash
# 安装新领域包
npm install -g dpml-scientific

# 使用新领域功能
dpml scientific analyze experiment.dpml
```

### 8.3 领域内扩展
每个领域包可以提供自己的扩展机制：

```typescript
// 领域内的扩展点示例
class ScientificDomain {
  analyzers = new Map();
  
  registerAnalyzer(name, analyzer) {
    this.analyzers.set(name, analyzer);
  }
  
  analyze(document, type) {
    const analyzer = this.analyzers.get(type);
    if (!analyzer) {
      throw new Error(`Analyzer "${type}" not found`);
    }
    return analyzer.analyze(document);
  }
}
```

## 9. 与插件架构的比较

### 9.1 领域架构优势
- **简洁明了**：清晰的领域边界，易于理解
- **低复杂度**：无需处理插件注册、冲突解决等
- **开发友好**：创建新领域包无需适配复杂接口
- **独立进化**：各领域可独立发展，不受核心包限制

### 9.2 适用场景
- 系统可按业务领域清晰划分
- 用户通常只需部分功能，而非全部
- 扩展方向多样，难以预设统一插件接口
- 强调开发体验和生态多样性

## 10. 开发指南

### 10.1 使用现有领域
```bash
# 安装基础包
npm install @dpml/core

# 安装所需领域
npm install @dpml/prompt

# 使用API
import { createParser } from '@dpml/core';
import { createPromptBuilder } from '@dpml/prompt';

const parser = createParser();
const builder = createPromptBuilder();

const document = await parser.parse(dpmlText);
const prompt = await builder.build(document);
```

### 10.2 开发新领域

```bash
# 创建新包
mkdir dpml-mydomain
cd dpml-mydomain
npm init

# 设置依赖
npm install @dpml/core --save
```

创建package.json:
```json
{
  "name": "dpml-mydomain",
  "version": "1.0.0",
  "description": "My DPML domain",
  "bin": {
    "dpml-mydomain": "./bin/cli.js"
  },
  "dpml": {
    "domain": "mydomain",
    "description": "My custom DPML domain"
  },
  "dependencies": {
    "@dpml/core": "^1.0.0"
  }
}
```

实现功能:
```typescript
// src/index.ts
import { DPMLDocument } from '@dpml/core';

export function processMyDomain(document: DPMLDocument) {
  // 实现领域特定逻辑
}

// bin/cli.js
#!/usr/bin/env node
import { createParser } from '@dpml/core';
import { processMyDomain } from '../src/index.js';

async function main() {
  const parser = createParser();
  const document = await parser.parse(/* 输入 */);
  const result = processMyDomain(document);
  console.log(result);
}

main().catch(console.error);
```

## 11. 总结

DPML的基于领域的架构设计提供了清晰的模块化结构，同时避免了插件架构带来的复杂性。通过将系统划分为核心基础设施和独立的领域包，DPML实现了高内聚、低耦合的系统设计，既便于使用也便于扩展。

这种设计特别适合DPML这样的领域特定语言生态系统，让不同领域的开发者可以贡献特定领域的功能，同时用户可以按需选择所需的领域包，避免不必要的复杂性。 