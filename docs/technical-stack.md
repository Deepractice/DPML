# DPML 技术选型与项目结构

本文档描述了DPML项目的技术选型与架构设计，包括项目结构、技术栈选择及各模块职责。

## 项目结构

DPML采用Monorepo方式组织代码，将相关项目集中管理但独立发布：

```
dpml/
├── packages/
│   ├── core/               # 核心库
│   ├── prompt/             # DPML提示词处理引擎
│   ├── agent/              # 代理框架
│   ├── workflow/           # 多代理工作流框架
│   └── cli/                # 命令行工具
├── examples/               # 使用示例
├── docs/                   # 文档
├── tests/                  # 集成测试
├── scripts/                # 构建脚本
├── package.json            # 根项目配置
└── README.md               # 项目说明
```

## 各包职责区分

### core

- **定位**：规范层，不包含实现
- **职责**：定义DPML语言规范、接口和类型系统
- **输出**：TypeScript类型定义、规范文档
- **依赖关系**：被所有其他包依赖

### prompt

- **技术栈**：TypeScript, XML解析库（如fast-xml-parser）, Markdown解析库
- **责任**：解析DPML文档，转换为可用的提示词格式
- **规模**：中等，约5000-8000行代码
- **依赖关系**：依赖core，被agent和workflow依赖

### agent

- **技术栈**：TypeScript, LLM交互库, 状态管理
- **责任**：为Agent提供运行环境，处理状态和记忆
- **规模**：中等，约5000-8000行代码
- **依赖关系**：依赖prompt，被workflow依赖

### workflow

- **技术栈**：TypeScript, 工作流引擎, 事件系统
- **责任**：编排多个Agent协作，管理工作流执行
- **规模**：中等到大型，约8000-12000行代码
- **依赖关系**：依赖agent

### cli

- **定位**：工具层，命令行界面
- **职责**：提供命令行交互、验证工具、快速启动
- **输出**：CLI可执行文件
- **依赖关系**：依赖所有核心包

## 技术栈选择

### 核心技术

| 技术         | 选择            | 理由                                       |
| ------------ | --------------- | ------------------------------------------ |
| 开发语言     | TypeScript 5.x  | 提供类型安全，提高代码质量，良好的工具支持 |
| 运行时       | Node.js 18+ LTS | 长期支持版本，稳定性好，功能完整           |
| 包管理       | pnpm            | 更高效的依赖管理，优秀的workspace支持      |
| Monorepo管理 | Turborepo       | 智能构建缓存，简化monorepo工作流           |

### 构建系统

| 技术     | 选择      | 理由                                               |
| -------- | --------- | -------------------------------------------------- |
| 构建工具 | tsup      | 基于esbuild，构建速度极快，配置简单，适合Node.js库 |
| 模块格式 | ESM + CJS | 同时支持现代ES模块和传统CommonJS环境               |
| 类型生成 | tsc       | 官方工具，生成高质量的类型定义                     |

tsup相比Vite的优势在于：

- 专为Node.js库设计，更适合DPML项目性质
- 配置更简单，维护成本低
- 基于esbuild的极速构建体验
- 对TypeScript支持更加原生
- 轻松输出多种格式(ESM/CJS)

### 测试框架

| 技术     | 选择       | 理由                                         |
| -------- | ---------- | -------------------------------------------- |
| 单元测试 | Vitest     | 兼容Jest API，但速度更快，与构建系统集成更好 |
| E2E测试  | Playwright | 跨环境测试支持，功能全面                     |
| 覆盖率   | Vitest内置 | 无需额外工具，集成度高                       |

### 文档工具

| 技术     | 选择      | 理由                                         |
| -------- | --------- | -------------------------------------------- |
| API文档  | TypeDoc   | TypeScript专用文档生成器，支持类型信息       |
| 文档网站 | VitePress | 轻量级，性能好，支持Vue组件                  |
| 示例文档 | MDX       | 支持在Markdown中嵌入交互组件                 |
| UML图表  | Mermaid   | 可直接嵌入Markdown，GitHub原生支持，语法简洁 |

### 代码质量

| 技术     | 选择                | 理由                               |
| -------- | ------------------- | ---------------------------------- |
| Linter   | ESLint + TS-ESLint  | 强大的代码检查，TypeScript专用规则 |
| 格式化   | Prettier            | 一致的代码风格，无需争论           |
| 提交检查 | husky + lint-staged | 自动化代码质量检查                 |
| 提交规范 | Commitlint          | 标准化提交信息格式                 |

## 各包特定依赖

### core

轻量级，几乎无外部依赖：

- **typescript**: 类型系统

### prompt

解析DPML文档，处理提示词规范，转换为不同格式，提供引用解析：

- **fast-xml-parser**: 高性能XML解析
- **marked**: Markdown解析
- **axios**: HTTP请求
- **pdf-parse**: PDF文档处理(可选)
- **node-html-parser**: HTML解析(可选)

### agent

代理定义和实例化，状态和记忆管理，工具使用机制，与LLM交互：

- **OpenAI SDK/Anthropic SDK**: 连接大语言模型
- **Zustand**: 轻量级状态管理
- **uuid**: 唯一标识符生成
- **leveldb**: 持久化存储(可选)

### workflow

多代理编排，工作流定义和执行，消息传递机制，监控和可视化：

- **自研工作流引擎**: 基于状态机
- **p-limit**: 并发控制
- **event-emitter**: 事件处理
- **Redis客户端**(可选): 用于分布式部署

### cli

命令行工具:

- **commander**: 命令行参数解析
- **inquirer**: 交互式提示
- **ora**: 加载动画
- **chalk**: 终端着色
- **boxen**: 信息框展示

## 开发工具链

| 工具           | 用途                   |
| -------------- | ---------------------- |
| Changesets     | 版本管理和变更日志生成 |
| GitHub Actions | CI/CD自动化            |
| Docker         | 示例部署和开发环境     |
| VS Code + 扩展 | 推荐的开发环境设置     |

## 发布策略

- 遵循语义化版本(SemVer)
- 使用Changesets管理版本和发布
- 各包独立发布但保持版本协调
- 提供包含所有工具的统一meta包

## 兼容性目标

- Node.js: ≥ 16.x (优先支持LTS版本)
- 浏览器(针对浏览器版本): 现代浏览器(Chrome, Firefox, Safari, Edge)
- TypeScript: ≥ 4.7

## 性能目标

- 解析速度: 100KB DPML文档 < 500ms
- 内存使用: 处理1MB文档 < 200MB内存
- 启动时间: CLI工具冷启动 < 300ms

## UML图表使用指南

DPML项目使用Mermaid绘制UML图表，用于可视化系统架构、组件关系和流程。

### Mermaid图表类型

项目中主要使用以下几种图表：

1. **类图(Class Diagram)** - 展示模块的类和接口结构

   ```mermaid
   classDiagram
     class Parser {
       +parse(text: string): Document
     }
     class Registry {
       +register(name: string, handler: any)
       +get(name: string): any
     }
     Parser --> Registry
   ```

2. **时序图(Sequence Diagram)** - 描述组件间交互流程

   ```mermaid
   sequenceDiagram
     Client->>Parser: parse(text)
     Parser->>Lexer: tokenize(text)
     Lexer-->>Parser: tokens
     Parser->>Validator: validate(ast)
     Validator-->>Parser: validationResult
     Parser-->>Client: document
   ```

3. **流程图(Flowchart)** - 展示处理逻辑和决策点

   ```mermaid
   flowchart TD
     A[开始] --> B{是否包含DPML标签?}
     B -->|是| C[解析标签]
     B -->|否| D[作为纯文本处理]
     C --> E[处理引用]
     D --> F[返回结果]
     E --> F
   ```

4. **包图(Package Diagram)** - 展示包依赖关系

### 图表位置

- 每个包的设计文档(`docs/design.md`)包含相关UML图
- 复杂流程在专门的流程文档中描述
- 可以在PR和Issue中使用Mermaid代码块添加临时图表说明问题

### 使用指南

- 使用Markdown代码块嵌入Mermaid图表:
  \```mermaid
  // 图表代码
  \```
- 保持图表简洁，一个图表专注表达一个概念
- 复杂系统分解为多个简单图表而非一个复杂图表
- 图表中使用英文以确保最佳兼容性

### 工具推荐

- VS Code插件: Markdown Preview Mermaid Support
- 在线编辑器: [Mermaid Live Editor](https://mermaid.live/)
