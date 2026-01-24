# DPML 架构概览

本文档介绍 DPML (Deepractice Prompt Markup Language) 的整体架构设计。

## 什么是 DPML

DPML 是一种基于类 XML 语法的协议，用于统一人类、AI 和计算机之间的信息流转。它不是简单的配置文件格式，而是一个**三方协同的信息载体**。

### 核心理念

DPML 基于**三方定位理论**：

| 角色 | 核心能力 | 在 DPML 中的职责 |
|------|----------|------------------|
| **人类** | 创新意图 | 编写和阅读 DPML 文档，观测系统状态 |
| **AI** | 语义转译 | 理解 DPML 上下文，生成结构化响应 |
| **计算机** | 精确执行 | 解析、验证、转换 DPML 文档 |

### 四维语义

DPML 采用类 XML 语法，具有 4 个语义维度：

| 维度 | 主要服务对象 | 职责 | 示例 |
|------|-------------|------|------|
| **Tag** | 人类 | 概念定义 | `<prompt>`, `<agent>` |
| **Attribute** | 计算机 | 配置参数 | `model="gpt-4"` |
| **Content** | AI | 语义内容 | `你是一个助手` |
| **Structure** | 人类 | 层级组织 | DOM 树结构 |

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      DPML 应用层                             │
│   (Agent 配置、Workflow 编排、Prompt 管理等领域应用)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     @dpml/core 核心层                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Parser │→│  Schema │→│  Processing  │→│ Transformer │ │
│  │  解析器 │  │  验证器 │  │   处理器    │  │   变换器   │ │
│  └─────────┘  └─────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DPML 文档层                             │
│           .dpml / .pml 文件 (类 XML 语法)                    │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Parser (解析器)

将 DPML 文本解析为文档对象模型 (DOM)。

```typescript
import { parse } from '@dpml/core';

const document = parse('<prompt>Hello World</prompt>');
console.log(document.rootNode.tagName);  // 'prompt'
console.log(document.rootNode.content);  // 'Hello World'
```

**职责**：
- 解析 XML 语法
- 构建 DPMLDocument 和 DPMLNode 树
- 验证格式良好性 (well-formed)
- 提取源码位置信息

### 2. Schema (模式)

定义文档结构规则，用于验证文档有效性。

```typescript
import { processSchema } from '@dpml/core';

const schema = {
  root: {
    element: 'prompt',
    attributes: [{ name: 'role', required: true }],
  },
};

const processedSchema = processSchema(schema);
```

**职责**：
- 定义元素结构
- 定义属性规则
- 定义内容模型
- 定义子元素关系

### 3. Processing (处理器)

对文档进行验证和语义处理。

```typescript
import { parse, processSchema, processDocument } from '@dpml/core';

const document = parse('<prompt role="assistant">Hello</prompt>');
const schema = processSchema({ root: { element: 'prompt' } });
const result = processDocument(document, schema);

console.log(result.isValid);  // true
```

**职责**：
- Schema 验证
- ID 唯一性检查
- 引用关系解析
- 生成 ProcessingResult

### 4. Transformer (变换器)

将处理结果转换为目标格式。

```typescript
import { transform, registerTransformer } from '@dpml/core';

registerTransformer({
  name: 'my-transformer',
  transform: (input, context) => {
    return { content: context.getDocument().rootNode.content };
  },
});

const output = transform(processingResult);
```

**职责**：
- 执行转换管道
- 维护转换上下文
- 支持自定义转换器
- 输出目标格式

## 数据流

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  DPML 文本  │ →  │ DPMLDocument│ →  │ Processing │ →  │   Output   │
│   (.dpml)  │    │   (DOM)    │    │   Result   │    │  (自定义)  │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
      │                 │                 │                 │
      │    parse()      │ processDocument │   transform()   │
      └─────────────────┴─────────────────┴─────────────────┘
```

### 阶段说明

1. **解析阶段** (Parse)
   - 输入：DPML 文本字符串
   - 输出：DPMLDocument 对象
   - 验证：XML 格式良好性

2. **处理阶段** (Process)
   - 输入：DPMLDocument + ProcessedSchema
   - 输出：ProcessingResult
   - 验证：Schema 有效性、引用完整性

3. **转换阶段** (Transform)
   - 输入：ProcessingResult
   - 输出：自定义格式 (如 Agent 配置对象)
   - 处理：领域特定的数据映射

## 核心类型

### DPMLDocument

表示完整的 DPML 文档。

```typescript
interface DPMLDocument {
  readonly rootNode: DPMLNode;      // 文档根节点
  readonly nodesById?: Map<string, DPMLNode>;  // ID 索引
  readonly metadata: DocumentMetadata;  // 文档元数据
}
```

### DPMLNode

表示文档中的单个节点。

```typescript
interface DPMLNode {
  readonly tagName: string;          // 标签名
  readonly attributes: Map<string, string>;  // 属性集合
  readonly children: DPMLNode[];     // 子节点
  readonly content: string;          // 文本内容
  readonly parent: DPMLNode | null;  // 父节点
  readonly sourceLocation?: SourceLocation;  // 源码位置
}
```

### ProcessingResult

表示处理后的结果。

```typescript
interface ProcessingResult {
  document: DPMLDocument;     // 原始文档
  isValid: boolean;           // 有效性标志
  references?: ReferenceMap;  // 引用关系
  schema?: unknown;           // Schema 信息
  validation?: ValidationResult;  // 验证详情
}
```

## 设计原则

### 1. 分层架构

- **API 层**：提供简洁的公共接口
- **Core 层**：实现核心逻辑
- **Types 层**：定义类型系统

### 2. 不可变数据

所有节点和文档对象都是只读的，使用 `readonly` 修饰符确保不可变性。

### 3. 类型安全

使用 TypeScript 泛型确保类型安全的转换流程。

### 4. 可扩展性

- 支持自定义 Schema
- 支持自定义 Transformer
- 支持内置元素扩展

## 下一步

- [语法概念](./syntax.md) - 了解 Element、Attribute、Content
- [Schema 系统](./schema.md) - 了解如何定义和验证文档结构
- [变换器系统](./transformer.md) - 了解如何转换文档
- [内置元素](./built-in-elements.md) - 了解 resource 等内置元素
