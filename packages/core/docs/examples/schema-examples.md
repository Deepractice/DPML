# Schema 模块示例

本文档展示了如何使用 Schema 模块来定义和验证 DPML 文档的结构规则。

## Schema 模块简介

Schema 模块用于定义 DPML 文档的结构规则，包括元素、属性、内容等的约束条件。通过 Schema 定义，可以验证用户提供的 DPML 文档是否符合预期的结构要求。

主要概念：

- **DocumentSchema**: 文档级别的结构，描述整个文档的规则
- **ElementSchema**: 元素级别的结构，描述单个元素的规则
- **AttributeSchema**: 描述元素属性的规则
- **ContentSchema**: 描述元素内容的规则
- **ChildrenSchema**: 描述元素子元素的规则
- **TypeReference**: 引用已定义类型的方式

## 基本示例

### 简单元素定义

```typescript
// 定义一个简单的元素Schema
const buttonSchema: ElementSchema = {
  element: 'button',
  attributes: [
    {
      name: 'type',
      type: 'string',
      enum: ['primary', 'secondary', 'danger']
    },
    {
      name: 'disabled',
      type: 'boolean'
    }
  ],
  content: {
    type: 'text'
  }
};

// 验证该元素Schema
const result = processSchema(buttonSchema);
 // true
```

### 完整文档定义

```typescript
// 定义一个完整的文档Schema
const formDocumentSchema: DocumentSchema = {
  root: {
    element: 'form',
    attributes: [
      {
        name: 'action',
        type: 'string',
        required: true
      },
      {
        name: 'method',
        type: 'string',
        enum: ['GET', 'POST']
      }
    ],
    children: {
      elements: [
        {
          element: 'input',
          attributes: [
            {
              name: 'type',
              type: 'string',
              required: true,
              enum: ['text', 'number', 'email', 'password']
            },
            {
              name: 'name',
              type: 'string',
              required: true
            }
          ]
        },
        {
          element: 'button',
          attributes: [
            {
              name: 'type',
              type: 'string',
              enum: ['submit', 'reset', 'button']
            }
          ],
          content: {
            type: 'text',
            required: true
          }
        }
      ]
    }
  }
};

// 验证该文档Schema
const result = processSchema(formDocumentSchema);
 // true
```

### 使用类型引用

```typescript
// 定义一个使用类型引用的文档Schema
const promptDocumentSchema: DocumentSchema = {
  root: {
    element: 'prompt',
    children: {
      elements: [
        { $ref: 'role' },
        { $ref: 'context' },
        { $ref: 'thinking' }
      ]
    }
  },
  types: [
    {
      element: 'role',
      attributes: [
        {
          name: 'type',
          type: 'string',
          enum: ['system', 'user', 'assistant']
        }
      ],
      content: {
        type: 'text',
        required: true
      }
    },
    {
      element: 'context',
      content: {
        type: 'text'
      }
    },
    {
      element: 'thinking',
      content: {
        type: 'text'
      }
    }
  ],
  globalAttributes: [
    {
      name: 'id',
      type: 'string'
    }
  ]
};

// 验证该文档Schema
const result = processSchema(promptDocumentSchema);
 // true
```

## 错误处理示例

```typescript
// 定义一个包含错误的元素Schema
const invalidElementSchema = {
  // 缺少 element 属性
  attributes: [
    {
      name: 'type',
      type: 'string'
    }
  ]
};

// 验证该元素Schema
const result = processSchema(invalidElementSchema);
 // false

// 输出:
// [
//   {
//     message: 'element字段是必需的，且必须是字符串',
//     code: 'MISSING_ELEMENT',
//     path: ''
//   }
// ]
```

## 使用场景

Schema 模块可用于以下场景：

1. **定义 DPML 文档的结构规则**：可以明确规定哪些元素可以出现在哪些位置，元素可以有哪些属性等
2. **验证用户提供的 DPML 文档**：检查文档是否符合预定义的结构规则
3. **提供错误报告**：当文档不符合规则时，提供详细的错误信息，帮助用户修正问题
4. **支持编辑器功能**：为编辑器提供结构信息，实现自动完成、语法检查等功能

通过这些功能，Schema 模块使 DPML 文档的创建和验证更加标准化和自动化，提高了文档的质量和一致性。

## Schema 接口说明

DPML Schema 模块提供了以下用户友好的接口：

### AttributeSchema

```typescript
interface AttributeSchema {
  name: string;         // 属性名称
  type?: string;        // 属性值类型
  required?: boolean;   // 是否必需
  enum?: string[];      // 枚举值列表
  pattern?: string;     // 值验证的正则表达式
  default?: string;     // 默认值
}
```

### ContentSchema

```typescript
interface ContentSchema {
  type: 'text' | 'mixed';   // 内容类型
  required?: boolean;       // 是否必需
  pattern?: string;         // 内容验证的正则表达式
}
```

### ChildrenSchema

```typescript
interface ChildrenSchema {
  elements: (ElementSchema | TypeReference)[]; // 允许的子元素
  orderImportant?: boolean;                   // 顺序是否重要
  min?: number;                               // 最小子元素数量
  max?: number;                               // 最大子元素数量
}
```

### ElementSchema

```typescript
interface ElementSchema {
  element: string;               // 元素名称
  attributes?: AttributeSchema[]; // 属性定义
  content?: ContentSchema;       // 内容定义
  children?: ChildrenSchema;     // 子元素定义
}
```

### DocumentSchema

```typescript
interface DocumentSchema {
  root: ElementSchema | TypeReference | string; // 根元素
  types?: ElementSchema[];                     // 可复用类型
  globalAttributes?: AttributeSchema[];        // 全局属性
  namespaces?: string[];                       // 命名空间
}
```

### TypeReference

```typescript
interface TypeReference {
  $ref: string;  // 引用的类型名称
}
``` 
