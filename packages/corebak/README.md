# @dpml/core

核心基础设施包，为DPML (Deepractice Prompt Markup Language) 提供解析、处理和转换框架。

## 目录

- [概述](#概述)
- [安装](#安装)
- [主要功能](#主要功能)
- [API参考](#api参考)
- [扩展指南](#扩展指南)
- [示例](#示例)

## 概述

`@dpml/core` 提供了构建DPML生态系统的基础设施，包括：

- XML解析与AST构建
- 文档处理与语义分析
- 通用转换框架
- 标签注册与验证
- 错误处理机制

该包被设计为可扩展的基础层，领域特定包（如`@dpml/prompt`）建立在此之上，添加特定领域的语义和功能。

## 安装

```bash
npm install @dpml/core
```

## 主要功能

### 1. XML/DPML解析与处理

#### 解析器 (Parser)

将DPML文本转换为抽象语法树(AST)：

```typescript
import { parse } from '@dpml/core';

// 基本解析
const result = await parse('<prompt id="example">这是一个示例</prompt>');
const ast = result.ast;

// 使用选项
const result = await parse(dpmlText, {
  allowUnknownTags: true, // 允许未知标签
  validate: true, // 启用验证
  tolerant: false, // 错误是否继续解析
  preserveComments: false, // 是否保留注释
});
```

#### 标签注册系统

定义和注册自定义标签：

```typescript
import { TagRegistry, TagDefinition } from '@dpml/core';

// 获取标签注册表
const registry = new TagRegistry();

// 基础标签属性工具
const baseTagAttributes = TagRegistry.getBaseAttributes(); // 包含id, version, extends等通用属性
console.log(baseTagAttributes);
// 输出: {
//   id: { type: 'string', required: false },
//   version: { type: 'string', required: false },
//   extends: { type: 'string', required: false }
// }

// 方式1: 直接定义标签（包含所有属性）
const promptTagDef: TagDefinition = {
  name: 'prompt',
  attributes: {
    id: {
      type: 'string',
      required: true,
    },
    version: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: ['role', 'context', 'thinking', 'executing'],
  contentFormat: 'markdown',
  validate: (element, context) => {
    // 自定义验证逻辑
    return { valid: true };
  },
};

// 方式2: 使用辅助函数创建（自动包含通用属性）
const promptTagDef2 = TagRegistry.createTagDefinition({
  // 只需添加特有属性，通用属性(id,version,extends)已包含
  attributes: {
    lang: { type: 'string', required: false },
    model: { type: 'string', required: false },
  },
  // 自定义验证函数可以覆盖或扩展基础验证
  validate: (element, context) => {
    // 自定义验证逻辑
    return { valid: true };
  },
  allowedChildren: ['role', 'context', 'thinking', 'executing'],
});

// 方式3: 覆盖基础属性的默认设置
const strictTagDef = TagRegistry.createTagDefinition({
  attributes: {
    // 覆盖id属性，设为必填
    id: { type: 'string', required: true },
    // 添加特有属性
    custom: { type: 'string', required: false },
  },
  allowedChildren: ['child'],
});

// 注册标签
registry.registerTagDefinition('prompt', promptTagDef);

// 检查注册状态
const isDefined = registry.isTagRegistered('prompt'); // true
```

### 2. 文档处理与语义扩展

#### 处理器 (Processor)

处理解析后的AST，提供语义分析和转换：

```typescript
import { process } from '@dpml/core';

// 基本处理
const processedDoc = await process(ast);

// 使用处理选项
const processedDoc = await process(ast, {
  strictMode: false, // 严格模式
  errorRecovery: true, // 出错时是否继续处理
  basePath: './templates', // 解析相对路径的基础目录
});
```

#### 标签处理器 (TagProcessor)

实现特定标签的语义处理：

```typescript
import { TagProcessor, Element, ProcessingContext } from '@dpml/core';

// 创建标签处理器
class PromptTagProcessor implements TagProcessor {
  // 判断是否可以处理该元素
  canProcess(element: Element): boolean {
    return element.tagName === 'prompt';
  }

  // 处理元素
  async process(
    element: Element,
    context: ProcessingContext
  ): Promise<Element> {
    // 实现处理逻辑
    // 例如：提取特定属性、验证语义正确性、添加元数据
    element.metadata = element.metadata || {};
    element.metadata.processed = true;

    return element;
  }

  // 设置优先级
  priority = 10;
}
```

#### 引用解析 (ReferenceResolver)

处理跨文件引用和资源链接：

```typescript
import { ReferenceResolver, Reference, ProcessingContext } from '@dpml/core';

// 创建引用解析器
class CustomReferenceResolver implements ReferenceResolver {
  async resolveReference(
    reference: Reference,
    context: ProcessingContext
  ): Promise<any> {
    // 处理文件协议
    if (reference.protocol === 'file') {
      // 实现文件读取逻辑
      return loadFileContent(reference.path);
    }

    // 处理HTTP协议
    if (reference.protocol === 'http' || reference.protocol === 'https') {
      // 实现HTTP请求逻辑
      return fetchContent(reference.protocol + '://' + reference.path);
    }

    throw new Error(`不支持的协议: ${reference.protocol}`);
  }
}
```

### 3. 转换与输出

#### 转换器 (Transformer)

将处理后的文档转换为目标格式：

```typescript
import { DefaultTransformer } from '@dpml/core';

// 创建自定义转换器
class PromptTransformer extends DefaultTransformer<string> {
  visitElement(element: Element): string {
    if (element.tagName === 'prompt') {
      // 处理prompt标签
      return `# ${element.attributes.id}\n\n${this.processChildren(element).join('\n')}`;
    }

    if (element.tagName === 'role') {
      // 处理role标签
      return `## 角色\n\n${this.processChildren(element).join('')}`;
    }

    // 默认处理
    return this.processChildren(element).join('');
  }

  visitContent(content: Content): string {
    // 处理文本内容
    return content.value;
  }

  transform(doc: ProcessedDocument): string {
    return this.visit(doc);
  }
}

// 使用转换器
const transformer = new PromptTransformer();
const result = transformer.transform(processedDoc);
```

#### 输出适配器 (OutputAdapter)

自定义输出格式：

```typescript
import { OutputAdapter } from '@dpml/core';

// 创建自定义输出适配器
class MarkdownOutputAdapter implements OutputAdapter {
  format(data: any): string {
    // 将数据格式化为Markdown
    if (typeof data === 'object') {
      return this.formatObject(data);
    }
    return String(data);
  }

  private formatObject(obj: any): string {
    // 实现对象到Markdown的转换逻辑
    // ...
  }
}
```

### 4. 错误处理

统一错误处理机制：

```typescript
import { DPMLError, ErrorCodes } from '@dpml/core';

try {
  const result = await parse(dpmlText);
  const processed = await process(result.ast);
} catch (error) {
  if (error instanceof DPMLError) {
    console.error(`错误类型: ${error.code}`);
    console.error(`错误消息: ${error.message}`);
    if (error.location) {
      console.error(
        `位置: 行 ${error.location.line}, 列 ${error.location.column}`
      );
    }
  } else {
    console.error('未知错误:', error);
  }
}
```

## API参考

### 核心数据类型

```typescript
// 节点类型
enum NodeType {
  DOCUMENT = 'document',
  ELEMENT = 'element',
  CONTENT = 'content',
  REFERENCE = 'reference',
}

// 元素节点
interface Element {
  type: NodeType.ELEMENT;
  tagName: string;
  attributes: Record<string, any>;
  children: Node[];
  metadata?: Record<string, any>;
  position: SourcePosition;
}

// 内容节点
interface Content {
  type: NodeType.CONTENT;
  value: string;
  position: SourcePosition;
}

// 处理后的文档
interface ProcessedDocument extends Document {
  metadata?: Record<string, any>;
  semantics?: Record<string, any>;
}
```

### 主要模块

| 模块                | 主要功能                   |
| ------------------- | -------------------------- |
| `Parser`            | 解析DPML文本为AST          |
| `Processor`         | 处理AST, 提供语义分析      |
| `Transformer`       | 转换处理后的文档为目标格式 |
| `TagRegistry`       | 管理标签定义               |
| `ReferenceResolver` | 解析引用和资源链接         |
| `OutputAdapter`     | 格式化输出                 |
| `ErrorHandler`      | 错误处理                   |

## 扩展指南

### 创建领域特定包

领域特定包（如`@dpml/prompt`）应该：

1. **定义领域标签**：创建并注册特定领域的标签定义
2. **实现标签处理器**：为每个标签提供语义处理逻辑
3. **创建转换器**：实现从处理后文档到目标格式的转换
4. **提供简化API**：封装复杂操作，提供简单易用的API

### 标签处理器实现

标签处理器是扩展DPML语义的核心：

```typescript
// 示例：role标签处理器
class RoleTagProcessor implements TagProcessor {
  canProcess(element: Element): boolean {
    return element.tagName === 'role';
  }

  async process(
    element: Element,
    context: ProcessingContext
  ): Promise<Element> {
    // 初始化元数据
    element.metadata = element.metadata || {};

    // 注意：不需要处理extends属性，已由InheritanceVisitor处理
    // 只提取领域特定属性
    const { name, type, ...otherAttrs } = element.attributes;

    // 添加领域特定元数据
    element.metadata['role'] = {
      type: 'role',
      name,
      roleType: type,
      // 不包含extends属性
      attributes: otherAttrs,
    };

    // 处理状态标记
    element.metadata.processed = true;
    element.metadata.processorName = 'RoleTagProcessor';

    return element;
  }
}
```

### 继承处理器

```typescript
// 示例：处理继承关系
class InheritanceProcessor implements TagProcessor {
  canProcess(element: Element): boolean {
    return element.attributes.extends !== undefined;
  }

  async process(
    element: Element,
    context: ProcessingContext
  ): Promise<Element> {
    const extendsAttr = element.attributes.extends;

    // 解析引用
    const referencedElement = await context.resolveReference(extendsAttr);

    if (!referencedElement) {
      throw new DPMLError(
        ErrorCodes.REFERENCE_ERROR,
        `无法解析继承引用: ${extendsAttr}`
      );
    }

    // 合并属性
    element.attributes = {
      ...referencedElement.attributes,
      ...element.attributes,
    };

    // 如果目标元素没有自己的内容，继承源元素的内容
    if (element.children.length === 0) {
      element.children = [...referencedElement.children];
    }

    return element;
  }
}
```

### 基础标签属性和简化标签定义

DPML中的所有标签都支持一组基础属性，包括：

- `id`: 唯一标识符
- `class`: 类名，用于样式和分组
- `style`: 行内样式
- `datatest`: 测试标识符

`TagRegistry`提供了便捷方法来管理这些基础属性并简化标签定义过程：

```typescript
// 获取所有基础属性
const baseAttrs = TagRegistry.getBaseAttributes();
// 返回 { id: true, class: true, style: true, datatest: true }

// 创建包含基础属性的标签定义
const myTagAttributes = {
  type: true, // 自定义属性
  format: true, // 自定义属性
};

// 自定义属性将与基础属性合并
const myTagDef = TagRegistry.createTagDefinition({
  name: 'myTag',
  attributes: myTagAttributes,
  allowedChildren: ['text', 'code'],
});

// 简化标签注册过程
const registry = new TagRegistry();

// 旧方式：分两步完成
registry.registerTagDefinition('myTag', myTagDef);

// 新方式：使用便捷方法直接注册
registry.registerTag('myTag', {
  attributes: {
    type: true,
    format: true,
  },
  allowedChildren: ['text', 'code'],
  selfClosing: false,
});
```

这种方式不仅简化了标签定义和注册过程，还确保了所有标签一致地实现基础属性。

## 示例

### 完整处理流程

```typescript
import { parse, process, DefaultTransformer } from '@dpml/core';

// 自定义转换器
class MyTransformer extends DefaultTransformer<string> {
  // 实现转换逻辑
}

// 完整处理流程
async function processDPML(dpmlText: string): Promise<string> {
  try {
    // 1. 解析DPML文本
    const parseResult = await parse(dpmlText);

    // 2. 处理AST
    const processedDoc = await process(parseResult.ast, {
      basePath: './templates',
    });

    // 3. 转换为目标格式
    const transformer = new MyTransformer();
    return transformer.transform(processedDoc);
  } catch (error) {
    // 错误处理
    console.error('处理DPML时出错:', error);
    throw error;
  }
}
```

### 注册自定义标签

```typescript
import { TagRegistry } from '@dpml/core';

// 获取标签注册表
const registry = new TagRegistry();

// 使用辅助函数注册自定义标签（自动包含id,version,extends等通用属性）
registry.registerTagDefinition(
  'my-tag',
  TagRegistry.createTagDefinition({
    attributes: {
      // 特定属性
      type: {
        type: 'string',
        required: false,
        validate: value => {
          return (
            ['a', 'b', 'c'].includes(value) ||
            `无效的type属性值: ${value}，应为a, b或c`
          );
        },
      },
    },
    allowedChildren: ['sub-tag', 'content'],
    validate: (element, context) => {
      // 验证逻辑
      let valid = true;
      const errors = [];

      if (
        element.attributes.type &&
        !['a', 'b', 'c'].includes(element.attributes.type)
      ) {
        valid = false;
        errors.push({
          code: 'INVALID_TYPE',
          message: `无效的type属性值: ${element.attributes.type}，应为a, b或c`,
        });
      }

      return { valid, errors };
    },
  })
);

// 直接注册（手动指定所有属性，包括通用属性）
registry.registerTagDefinition('custom-tag', {
  attributes: {
    // 通用属性需手动添加
    id: { type: 'string', required: true },
    version: { type: 'string', required: false },
    extends: { type: 'string', required: false },
    // 特定属性
    format: { type: 'string', required: true },
  },
  allowedChildren: ['child-tag'],
});
```

> 注意：属性定义推荐使用对象格式（如上例所示），而非数组格式。对象格式提供了更好的类型定义和验证能力。
> 虽然系统同时支持数组格式(`attributes: ['id', 'version']`)以保持向后兼容性，但建议在新代码中使用对象格式。

### 继承机制与处理流程

Core包内置了强大的继承处理机制，通过`InheritanceVisitor`实现。重要说明：

1. **继承处理职责分工**：

   - `InheritanceVisitor`（优先级100）：完全负责处理标签继承逻辑
     - 解析extends属性引用的元素
     - 合并属性（子标签优先）
     - 合并内容（当子标签无内容时使用父标签内容）
   - 领域包`TagProcessor`（优先级更低）：
     - 不需要处理继承逻辑（已由InheritanceVisitor处理）
     - 应忽略extends属性，专注于特定领域的语义处理

2. **处理顺序**：
   - 解析基础AST（Parser）
   - 处理继承关系（InheritanceVisitor，优先级100）
   - 处理领域标签语义（DomainTagVisitor调用TagProcessor，优先级60）

```typescript
// 示例：正确的TagProcessor实现 - 不处理extends属性
class CorrectRoleTagProcessor implements TagProcessor {
  canProcess(element: Element): boolean {
    return element.tagName === 'role';
  }

  async process(
    element: Element,
    context: ProcessingContext
  ): Promise<Element> {
    // 初始化元数据
    element.metadata = element.metadata || {};

    // 注意：不需要处理extends属性，已由InheritanceVisitor处理
    // 只提取领域特定属性
    const { name, type, ...otherAttrs } = element.attributes;

    // 添加领域特定元数据
    element.metadata['role'] = {
      type: 'role',
      name,
      roleType: type,
      // 不包含extends属性
      attributes: otherAttrs,
    };

    // 处理状态标记
    element.metadata.processed = true;
    element.metadata.processorName = 'RoleTagProcessor';

    return element;
  }
}
```

有关继承机制的详细信息，请参阅[继承机制专题文档](../docs/inheritance-mechanism.md)。
