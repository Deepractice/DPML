# DPML 文档

欢迎阅读 DPML 文档。DPML (Deepractice Prompt Markup Language) 是一种用于结构化 AI 提示工程的声明式标记语言。

## 什么是 DPML?

DPML 提供了一种标准化的方式来描述 AI 行为，使用类似 XML 的直观语法来定义提示、上下文和指令。

## 核心特性

| 特性         | 描述                                            |
| ------------ | ----------------------------------------------- |
| 声明式语法   | 使用直观的 XML 风格标记定义 AI 提示              |
| Schema 验证  | 支持自定义 Schema 验证文档结构                   |
| 可扩展       | 创建自定义 Transformer 转换为任意目标格式        |
| 类型安全     | 完整的 TypeScript 支持与类型定义                 |
| 内置元素     | `<resource>` 元素支持外部资源引用 (ARP/RXL 协议) |

## 快速示例

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

const dpml = createDPML({ schema: defineSchema({ element: 'prompt' }), transformers: [] });
const result = await dpml.compile('<prompt role="assistant">你是一个有帮助的助手</prompt>');
```

## 文档导航

### 入门指南 (Getting Started)

- [介绍](./getting-started/introduction.md) - 为什么需要 DPML
- [安装](./getting-started/installation.md) - 安装与环境配置
- [快速开始](./getting-started/quick-start.md) - 5 分钟上手教程

### 核心概念 (Concepts)

- [概念索引](./concepts/index.md) - 核心概念导航
- [架构概览](./concepts/overview.md) - DPML 整体架构
- [语法](./concepts/syntax.md) - Element、Attribute、Content
- [Schema 系统](./concepts/schema.md) - 验证与约束
- [变换器](./concepts/transformer.md) - 数据转换
- [内置元素](./concepts/built-in-elements.md) - resource 元素详解

### 实战指南 (Guides)

- [定义 Schema](./guides/defining-schema.md) - Schema 定义实战
- [自定义变换器](./guides/custom-transformer.md) - Transformer 开发
- [验证最佳实践](./guides/validation.md) - 错误处理与验证
- [集成指南](./guides/integration.md) - 与 AI 工具和构建系统集成

### API 参考 (API Reference)

- [dpml 包 API](./api/dpml.md) - 主包公共 API
- [@dpml/core API](./api/core.md) - 核心库内部 API
- [错误处理](./api/errors.md) - 错误类型与处理

### 设计决策 (Design)

- [ADR 索引](./design/README.md) - 架构决策记录
- [ADR-001: 标记语言选择](./design/adr-001-markup-language.md)
- [ADR-002: 三方协同模型](./design/adr-002-three-party-model.md)
- [ADR-003: Schema 验证策略](./design/adr-003-schema-validation.md)

### 正式规范 (Specifications)

- [规范管理](../specs/README.md) - 规范版本与编辑流程
- [v1.0 协议规范 (英文)](../specs/v1.0/en/protocol/syntax.md) - 语法规范
- [v1.0 协议规范 (中文)](../specs/v1.0/zh/protocol/index.md) - 中文版规范
- [白皮书 (英文)](../specs/v1.0/en/whitepaper/index.md) - 设计白皮书
- [白皮书 (中文)](../specs/v1.0/zh/whitepaper/index.md) - 中文版白皮书

### 开发相关

- [BDD 测试](../bdd/) - 行为驱动开发测试
- [开发流程](../issues/000-unified-development-mode.md) - Code Review + BDD 工作流

## 包结构

```
dpml/
├── packages/
│   ├── dpml/          # 主包 - 公共 API
│   └── core/          # 核心库 - 解析、验证、转换
├── bdd/               # BDD 测试
│   ├── features/      # Gherkin 特性文件
│   └── steps/         # 步骤定义
└── specs/             # 语言规范
    └── v1.0/          # v1.0 协议规范
```

## API 概览

### `createDPML(config)`

创建 DPML 实例。

```typescript
const dpml = createDPML({
  schema: Schema,
  transformers: Transformer[]
});
```

**方法:**

- `compile<T>(content: string): Promise<T>` - 解析、验证并转换 DPML 内容
- `parse(content: string): DPMLDocument` - 解析 DPML 内容为文档对象
- `validate(content: string): ValidationResult` - 根据 Schema 验证内容

### `defineSchema(definition)`

定义用于验证 DPML 文档的 Schema。

### `defineTransformer(definition)`

定义用于转换处理结果的 Transformer。

## 内置元素

### `<resource>` - 外部资源引用

```xml
<prompt>
  <resource src="arp:text:file://./config.md"/>
  <resource src="deepractice.ai/sean/knowledge@1.0"/>
</prompt>
```

| 协议      | 格式                 | 示例                                |
| --------- | -------------------- | ----------------------------------- |
| `arp`     | 以 `arp:` 开头       | `arp:text:file://./config.md`       |
| `rxl`     | 域名/路径模式        | `deepractice.ai/path/name.type@1.0` |
| `unknown` | 其他格式             | 无效或空的 src                      |

## 相关链接

- [GitHub 仓库](https://github.com/Deepractice/dpml)
- [npm 包](https://www.npmjs.com/package/dpml)
- [Deepractice 组织](https://github.com/Deepractice)

## 相关项目

DPML 是 Deepractice AI 基础设施的一部分:

- **[AgentVM](https://github.com/Deepractice/AgentVM)** - AI Agent 运行时环境
- **[AgentX](https://github.com/Deepractice/AgentX)** - AI Agent 执行框架
- **[ResourceX](https://github.com/Deepractice/ResourceX)** - AI 资源管理协议

---

**维护者**: Deepractice.ai
