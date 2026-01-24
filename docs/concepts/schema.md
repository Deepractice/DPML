# DPML Schema 系统

本文档介绍 DPML 的 Schema 系统，用于定义和验证文档结构。

## 什么是 Schema

Schema 是用于定义 DPML 文档结构的规则集合。它描述了：

- 哪些元素是合法的
- 元素可以有哪些属性
- 元素可以包含什么内容
- 元素之间的层级关系

通过 Schema，可以验证 DPML 文档是否符合预期的结构。

## Schema 类型

DPML 支持两种 Schema 类型：

### DocumentSchema

定义完整文档的结构，包含根元素和可复用的类型定义。

```typescript
interface DocumentSchema {
  // 根元素定义（必需）
  root: ElementSchema | TypeReference | string;

  // 可复用的类型定义
  types?: ElementSchema[];

  // 全局属性（适用于所有元素）
  globalAttributes?: AttributeSchema[];

  // 命名空间声明
  namespaces?: string[];
}
```

### ElementSchema

定义单个元素的结构。

```typescript
interface ElementSchema {
  // 元素名称（必需）
  element: string;

  // 属性定义
  attributes?: AttributeSchema[];

  // 内容模型
  content?: ContentSchema;

  // 子元素定义
  children?: ChildrenSchema;
}
```

## 定义 Schema

### 基本示例

定义一个简单的 `prompt` 元素：

```typescript
import { processSchema } from '@dpml/core';

const schema = {
  root: {
    element: 'prompt',
    attributes: [
      { name: 'role', required: true },
      { name: 'type', enum: ['text', 'markdown'] }
    ],
    content: { type: 'text', required: true }
  }
};

const processedSchema = processSchema(schema);
console.log(processedSchema.isValid);  // true
```

对应的合法 DPML 文档：

```xml
<prompt role="system" type="markdown">
你是一个专业的编程助手。
</prompt>
```

### 复杂示例

定义一个包含多个元素的 Agent 结构：

```typescript
const agentSchema = {
  root: {
    element: 'agent',
    children: {
      elements: [
        { $ref: 'llm' },
        { $ref: 'prompt' },
        { $ref: 'tools' }
      ]
    }
  },
  types: [
    {
      element: 'llm',
      attributes: [
        { name: 'model', required: true },
        { name: 'temperature', type: 'number' },
        { name: 'max-tokens', type: 'number' }
      ]
    },
    {
      element: 'prompt',
      attributes: [
        { name: 'type', enum: ['text', 'markdown'] }
      ],
      content: { type: 'text', required: true }
    },
    {
      element: 'tools',
      children: {
        elements: [
          {
            element: 'tool',
            attributes: [{ name: 'name', required: true }]
          }
        ]
      }
    }
  ]
};
```

对应的合法 DPML 文档：

```xml
<agent>
  <llm model="gpt-4" temperature="0.7"/>
  <prompt type="markdown">
# 角色
你是一个专业的编程助手。
  </prompt>
  <tools>
    <tool name="search"/>
    <tool name="code-execute"/>
  </tools>
</agent>
```

## 属性定义

使用 `AttributeSchema` 定义元素的属性：

```typescript
interface AttributeSchema {
  // 属性名称（必需）
  name: string;

  // 属性值类型
  type?: string;  // 'string' | 'number' | 'boolean'

  // 是否必需
  required?: boolean;  // 默认 false

  // 枚举值列表
  enum?: string[];

  // 正则表达式模式
  pattern?: string;

  // 默认值
  default?: string;
}
```

### 属性示例

```typescript
const attributes = [
  // 必需属性
  { name: 'model', required: true },

  // 带类型的属性
  { name: 'temperature', type: 'number' },

  // 枚举属性
  { name: 'type', enum: ['text', 'markdown', 'json'] },

  // 带模式的属性
  { name: 'id', pattern: '^[a-z][a-z0-9-]*$' },

  // 带默认值的属性
  { name: 'enabled', type: 'boolean', default: 'true' }
];
```

## 内容定义

使用 `ContentSchema` 定义元素的内容模型：

```typescript
interface ContentSchema {
  // 内容类型
  type: 'text' | 'mixed';

  // 是否必需
  required?: boolean;  // 默认 false

  // 内容模式
  pattern?: string;
}
```

### 内容类型说明

- **text**: 纯文本内容，不允许子元素
- **mixed**: 混合内容，允许文本和子元素混合

```typescript
// 纯文本内容
{
  element: 'prompt',
  content: { type: 'text', required: true }
}

// 混合内容
{
  element: 'description',
  content: { type: 'mixed' }
}
```

## 子元素定义

使用 `ChildrenSchema` 定义元素可以包含的子元素：

```typescript
interface ChildrenSchema {
  // 允许的子元素列表
  elements: (ElementSchema | TypeReference)[];

  // 顺序是否重要
  orderImportant?: boolean;  // 默认 false

  // 子元素数量限制
  min?: number;
  max?: number;
}
```

### 子元素示例

```typescript
// 内联定义子元素
{
  element: 'tools',
  children: {
    elements: [
      {
        element: 'tool',
        attributes: [{ name: 'name', required: true }]
      }
    ]
  }
}

// 通过引用定义子元素
{
  element: 'agent',
  children: {
    elements: [
      { $ref: 'llm' },
      { $ref: 'prompt' }
    ],
    orderImportant: true
  }
}
```

## 类型引用

使用 `TypeReference` 引用在 `types` 中定义的类型：

```typescript
interface TypeReference {
  $ref: string;  // 引用的类型名称
}
```

### 类型引用示例

```typescript
const schema = {
  root: {
    element: 'workflow',
    children: {
      elements: [
        { $ref: 'step' }  // 引用 types 中的 step
      ]
    }
  },
  types: [
    {
      element: 'step',
      attributes: [
        { name: 'id', required: true },
        { name: 'name', required: true }
      ],
      children: {
        elements: [
          { $ref: 'step' }  // 递归引用自身
        ]
      }
    }
  ]
};
```

## 处理 Schema

使用 `processSchema` 函数处理和验证 Schema：

```typescript
import { processSchema } from '@dpml/core';

const schema = {
  root: { element: 'prompt' }
};

const result = processSchema(schema);

console.log(result.isValid);   // true 或 false
console.log(result.schema);    // 原始 schema
console.log(result.errors);    // 错误列表（如果无效）
```

### ProcessedSchema 结构

```typescript
interface ProcessedSchema<T extends object> {
  // 原始 Schema
  schema: T;

  // 是否有效
  isValid: boolean;

  // 错误列表
  errors?: SchemaError[];
}

interface SchemaError {
  // 错误消息
  message: string;

  // 错误代码
  code: string;

  // 错误路径
  path: string;
}
```

## 验证规则

Schema 验证器会检查以下规则：

### ElementSchema 规则

| 规则 | 描述 |
|------|------|
| `element` 必需 | 必须提供元素名称 |
| `element` 类型 | 必须是字符串 |
| `attributes` 类型 | 如果存在，必须是数组 |
| `content.type` 必需 | 如果定义了 content，type 是必需的 |
| `children.elements` 必需 | 如果定义了 children，elements 是必需的 |

### DocumentSchema 规则

| 规则 | 描述 |
|------|------|
| `root` 必需 | 必须定义根元素 |
| `root` 类型 | 必须是 ElementSchema、TypeReference 或字符串 |
| `types` 类型 | 如果存在，必须是数组 |
| `globalAttributes` 类型 | 如果存在，必须是数组 |

### AttributeSchema 规则

| 规则 | 描述 |
|------|------|
| `name` 必需 | 必须提供属性名称 |
| `name` 类型 | 必须是字符串 |
| `enum` 类型 | 如果存在，必须是字符串数组 |

## 错误代码

| 代码 | 描述 |
|------|------|
| `INVALID_SCHEMA` | 无效的 Schema 对象 |
| `INVALID_SCHEMA_TYPE` | 无效的 Schema 类型 |
| `MISSING_ELEMENT` | 缺少 element 字段 |
| `MISSING_ROOT` | 缺少 root 字段 |
| `MISSING_ATTRIBUTE_NAME` | 缺少属性名称 |
| `MISSING_CONTENT_TYPE` | 缺少 content.type 字段 |
| `MISSING_CHILDREN_ELEMENTS` | 缺少 children.elements 字段 |
| `INVALID_ATTRIBUTES_TYPE` | attributes 不是数组 |
| `INVALID_REF_TYPE` | $ref 不是字符串 |

## 最佳实践

### 1. 使用类型复用

将重复使用的元素定义为 types：

```typescript
const schema = {
  root: { element: 'workflow', children: { elements: [{ $ref: 'task' }] } },
  types: [
    { element: 'task', /* ... */ }
  ]
};
```

### 2. 合理使用必需属性

只将真正必需的属性标记为 `required: true`：

```typescript
{
  element: 'llm',
  attributes: [
    { name: 'model', required: true },      // 必需
    { name: 'temperature' },                 // 可选
  ]
}
```

### 3. 使用枚举限制值

对于有限的选项，使用 `enum`：

```typescript
{
  name: 'type',
  enum: ['text', 'markdown', 'json']
}
```

### 4. 提供默认值

为可选属性提供合理的默认值：

```typescript
{
  name: 'temperature',
  type: 'number',
  default: '0.7'
}
```

## 下一步

- [架构概览](./overview.md) - 了解整体架构
- [语法概念](./syntax.md) - 了解 Element、Attribute、Content
- [变换器系统](./transformer.md) - 了解如何转换文档
- [内置元素](./built-in-elements.md) - 了解 resource 等内置元素
