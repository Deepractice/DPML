# Schema 定义指南

本指南介绍如何使用 DPML 定义 Schema 来约束文档结构，确保文档符合预期格式。

## 概述

Schema 定义了 DPML 文档的结构约束，包括：

- **元素名称**：文档中允许使用的元素标签
- **属性规则**：元素可以或必须具有的属性
- **子元素**：元素可以包含的子元素
- **内容约束**：元素的文本内容规则

## 基础 Schema 定义

### 简单元素 Schema

最简单的 Schema 只需定义一个元素名称：

```typescript
import { defineSchema } from 'dpml';

const schema = defineSchema({
  element: 'prompt',
});
```

这个 Schema 定义了一个名为 `prompt` 的根元素，可以匹配如下文档：

```xml
<prompt>Hello World</prompt>
```

### 带属性的 Schema

可以为元素定义属性，包括必需属性和可选属性：

```typescript
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    { name: 'role', required: true },
    { name: 'temperature', type: 'string' },
  ],
});
```

**属性定义选项：**

| 选项 | 类型 | 说明 |
|------|------|------|
| `name` | string | 属性名称（必需） |
| `required` | boolean | 是否必需，默认 `false` |
| `type` | string | 值类型，如 `'string'`、`'number'` |
| `enum` | string[] | 允许的枚举值列表 |
| `pattern` | string | 正则表达式模式 |
| `default` | string | 默认值 |

匹配此 Schema 的文档：

```xml
<prompt role="assistant" temperature="0.7">Hello</prompt>
```

### 枚举属性验证

限制属性值必须在指定列表中：

```typescript
const schema = defineSchema({
  element: 'prompt',
  attributes: [
    {
      name: 'role',
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
  ],
});
```

## 嵌套元素定义

### 定义子元素

使用 `children` 属性定义允许的子元素：

```typescript
const schema = defineSchema({
  element: 'prompt',
  children: {
    elements: [
      { element: 'context' },
      { element: 'instruction' },
    ],
  },
});
```

匹配的文档结构：

```xml
<prompt>
  <context>You are a helpful assistant</context>
  <instruction>Answer the question</instruction>
</prompt>
```

### 子元素数量约束

可以限制子元素的数量范围：

```typescript
const schema = defineSchema({
  element: 'prompt',
  children: {
    elements: [
      { element: 'message' },
    ],
    min: 1,
    max: 10,
  },
});
```

### 有序子元素

指定子元素必须按顺序出现：

```typescript
const schema = defineSchema({
  element: 'prompt',
  children: {
    elements: [
      { element: 'system' },
      { element: 'context' },
      { element: 'instruction' },
    ],
    orderImportant: true,
  },
});
```

## 内容约束

### 文本内容

定义元素的文本内容约束：

```typescript
const schema = defineSchema({
  element: 'prompt',
  content: {
    type: 'text',
    required: true,
  },
});
```

**内容类型选项：**

| 类型 | 说明 |
|------|------|
| `text` | 纯文本内容 |
| `mixed` | 混合内容（文本和子元素） |

### 内容模式匹配

使用正则表达式验证内容格式：

```typescript
const schema = defineSchema({
  element: 'email',
  content: {
    type: 'text',
    required: true,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  },
});
```

## DocumentSchema 格式

对于复杂文档，可以使用 DocumentSchema 格式定义可复用的类型：

```typescript
const schema = defineSchema({
  root: {
    element: 'prompt',
  },
  types: [
    { element: 'context' },
    { element: 'instruction' },
  ],
});
```

### 类型引用

使用 `$ref` 引用已定义的类型：

```typescript
const schema = defineSchema({
  root: {
    element: 'prompt',
    children: {
      elements: [
        { $ref: 'context' },
        { $ref: 'instruction' },
      ],
    },
  },
  types: [
    {
      element: 'context',
      content: { type: 'text' },
    },
    {
      element: 'instruction',
      attributes: [{ name: 'priority', type: 'string' }],
    },
  ],
});
```

### 全局属性

定义适用于所有元素的全局属性：

```typescript
const schema = defineSchema({
  root: { element: 'prompt' },
  globalAttributes: [
    { name: 'id', type: 'string' },
    { name: 'class', type: 'string' },
  ],
});
```

## 完整示例

以下是一个完整的 AI Prompt Schema 示例：

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// 定义复杂的 Prompt Schema
const promptSchema = defineSchema({
  root: {
    element: 'prompt',
    attributes: [
      { name: 'version', type: 'string', default: '1.0' },
    ],
    children: {
      elements: [
        { $ref: 'system' },
        { $ref: 'context' },
        { $ref: 'examples' },
        { $ref: 'instruction' },
      ],
    },
  },
  types: [
    {
      element: 'system',
      content: { type: 'text', required: true },
    },
    {
      element: 'context',
      attributes: [
        { name: 'source', type: 'string' },
      ],
      content: { type: 'mixed' },
    },
    {
      element: 'examples',
      children: {
        elements: [{ $ref: 'example' }],
        min: 1,
      },
    },
    {
      element: 'example',
      children: {
        elements: [
          { element: 'input', content: { type: 'text' } },
          { element: 'output', content: { type: 'text' } },
        ],
        orderImportant: true,
      },
    },
    {
      element: 'instruction',
      attributes: [
        { name: 'format', enum: ['text', 'json', 'markdown'] },
      ],
      content: { type: 'text', required: true },
    },
  ],
});

// 创建 DPML 实例
const dpml = createDPML({
  schema: promptSchema,
  transformers: [],
});

// 验证文档
const result = dpml.validate(`
  <prompt version="1.0">
    <system>You are a helpful coding assistant.</system>
    <context source="user-profile">
      The user is a beginner programmer.
    </context>
    <examples>
      <example>
        <input>How to print hello world?</input>
        <output>Use console.log("Hello World")</output>
      </example>
    </examples>
    <instruction format="markdown">
      Answer the following question step by step.
    </instruction>
  </prompt>
`);

console.log(result.isValid); // true
```

## 常见问题

### Schema 定义失败

如果 Schema 定义失败，通常是因为缺少必要字段：

```typescript
// 错误：缺少 element 或 root 属性
const badSchema = defineSchema({
  attributes: [],
}); // 抛出错误: Schema definition must have "element" or "root" property
```

### 非对象 Schema

Schema 必须是对象类型：

```typescript
// 错误：不是对象
const badSchema = defineSchema('not an object'); // 抛出错误
const nullSchema = defineSchema(null); // 抛出错误
```

## 最佳实践

1. **从简单开始**：先定义最基本的结构，逐步添加约束
2. **使用类型复用**：对于重复出现的元素结构，使用 `types` 和 `$ref` 复用
3. **合理设置必需属性**：只将真正必需的属性设为 `required: true`
4. **使用枚举限制值**：对于有限选项的属性，使用 `enum` 提供清晰的约束
5. **添加默认值**：为可选属性提供合理的默认值

## 相关文档

- [自定义变换器指南](./custom-transformer.md)
- [验证最佳实践](./validation.md)
- [集成指南](./integration.md)
