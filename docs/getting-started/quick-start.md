# 快速开始

本指南将帮助你在 5 分钟内创建并运行第一个 DPML 应用。

## 前置条件

确保你已经[安装了 DPML](./installation.md)：

```bash
npm install dpml
# 或
bun add dpml
```

## 核心概念

DPML 的使用流程包含三个核心步骤：

1. **定义 Schema** - 描述你的 DPML 文档结构
2. **定义 Transformer** - 将解析后的文档转换为目标格式
3. **编译内容** - 解析、验证并转换 DPML 内容

## 完整示例

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// 1. 定义 Schema
const schema = defineSchema({
  element: 'prompt',
  attributes: [{ name: 'role', required: true }],
  children: {
    elements: [{ element: 'context' }, { element: 'instruction' }],
  },
});

// 2. 定义 Transformer
const transformer = defineTransformer({
  name: 'prompt-transformer',
  transform: input => {
    const doc = input.document;
    return {
      role: doc.rootNode.attributes.get('role'),
      context: doc.rootNode.children[0]?.content,
      instruction: doc.rootNode.children[1]?.content,
    };
  },
});

// 3. 创建 DPML 实例
const dpml = createDPML({
  schema,
  transformers: [transformer],
});

// 4. 编译 DPML 内容
const result = await dpml.compile(`
  <prompt role="assistant">
    <context>You are a helpful assistant</context>
    <instruction>Answer questions clearly</instruction>
  </prompt>
`);

console.log(result);
// { role: 'assistant', context: '...', instruction: '...' }
```

## 分步解析

### 步骤 1：定义 Schema

Schema 定义了 DPML 文档的结构规则：

```typescript
const schema = defineSchema({
  element: 'prompt',           // 根元素名称
  attributes: [                // 属性定义
    { name: 'role', required: true }
  ],
  children: {                  // 子元素定义
    elements: [
      { element: 'context' },
      { element: 'instruction' }
    ],
  },
});
```

Schema 用于：
- 验证 DPML 文档结构是否正确
- 确保必需的属性存在
- 约束子元素的类型和顺序

### 步骤 2：定义 Transformer

Transformer 将解析后的文档转换为你需要的格式：

```typescript
const transformer = defineTransformer({
  name: 'prompt-transformer',
  description: 'Convert DPML to prompt object',  // 可选描述
  transform: (input, context) => {
    const doc = input.document;
    return {
      role: doc.rootNode.attributes.get('role'),
      context: doc.rootNode.children[0]?.content,
      instruction: doc.rootNode.children[1]?.content,
    };
  },
});
```

`transform` 函数接收：
- `input` - 包含解析后的 `document` 对象
- `context` - 转换上下文（可选使用）

### 步骤 3：创建 DPML 实例并编译

```typescript
const dpml = createDPML({
  schema,
  transformers: [transformer],
});

const result = await dpml.compile(content);
```

DPML 实例提供的方法：
- `compile<T>(content)` - 解析、验证并转换内容
- `parse(content)` - 仅解析内容为文档对象
- `validate(content)` - 仅验证内容是否符合 Schema

## 使用内置 Resource 元素

DPML 提供内置的 `<resource>` 元素，用于引用外部资源：

```typescript
import { createDPML, defineSchema } from 'dpml';
import type { ResourceResult } from 'dpml';

const schema = defineSchema({ element: 'prompt' });
const dpml = createDPML({ schema, transformers: [] });

const result = await dpml.compile<ResourceResult>(`
  <prompt>
    <resource src="arp:text:file://./rules.md"/>
    <resource src="deepractice.ai/config.text@1.0"/>
  </prompt>
`);

console.log(result.resources);
// [
//   { src: 'arp:text:file://./rules.md', protocol: 'arp', node: DPMLNode },
//   { src: 'deepractice.ai/config.text@1.0', protocol: 'rxl', node: DPMLNode }
// ]
```

`<resource>` 元素支持两种协议：
- **ARP** - `arp:text:file://./path` 格式
- **RXL** - `domain/path/name.type@version` 格式

## 仅解析或验证

如果你只需要解析或验证，无需完整编译：

```typescript
// 仅解析
const doc = dpml.parse('<prompt role="assistant">Hello</prompt>');
console.log(doc.rootNode.tagName);  // 'prompt'
console.log(doc.rootNode.attributes.get('role'));  // 'assistant'

// 仅验证
const validation = dpml.validate('<prompt>Missing role</prompt>');
console.log(validation.valid);  // false
console.log(validation.errors);  // [{ message: 'Required attribute "role" is missing', ... }]
```

## 类型定义

DPML 提供完整的 TypeScript 类型支持：

```typescript
import type {
  // 核心类型
  DPML,
  DPMLConfig,
  Schema,
  Transformer,
  DPMLDocument,
  DPMLNode,
  ValidationResult,
  // 资源类型
  ResourceInfo,
  ResourceResult,
} from 'dpml';
```

## 下一步学习路径

恭喜你完成了 DPML 快速入门！接下来你可以：

1. **深入了解 Schema** - 学习如何定义复杂的文档结构
2. **掌握 Transformer** - 创建强大的转换逻辑
3. **探索 Resource** - 使用外部资源引用功能
4. **阅读语言规范** - 了解 DPML 的完整语法和语义

相关资源：
- [DPML 语言规范](../../specs/README.md) - 详细的语法和语义文档
- [dpml 包文档](../../packages/dpml/README.md) - API 详细说明
- [介绍](./introduction.md) - 了解设计理念
