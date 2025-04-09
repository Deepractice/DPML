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
  allowUnknownTags: true,  // 允许未知标签
  validate: true,          // 启用验证
  tolerant: false,         // 错误是否继续解析
  preserveComments: false  // 是否保留注释
});
```

#### 标签注册系统

定义和注册自定义标签：

```typescript
import { TagRegistry, TagDefinition } from '@dpml/core';

// 获取标签注册表
const registry = new TagRegistry();

// 定义标签
const promptTagDef: TagDefinition = {
  name: 'prompt',
  attributes: {
    id: {
      type: 'string',
      required: true
    },
    version: {
      type: 'string',
      required: false
    },
    extends: {
      type: 'string',
      required: false
    }
  },
  allowedChildren: ['role', 'context', 'thinking', 'executing'],
  contentFormat: 'markdown',
  validate: (element, context) => {
    // 自定义验证逻辑
    return { valid: true };
  }
};

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
  strictMode: false,     // 严格模式
  errorRecovery: true,   // 出错时是否继续处理
  basePath: './templates' // 解析相对路径的基础目录
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
  async process(element: Element, context: ProcessingContext): Promise<Element> {
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
  async resolveReference(reference: Reference, context: ProcessingContext): Promise<any> {
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
      console.error(`位置: 行 ${error.location.line}, 列 ${error.location.column}`);
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
  REFERENCE = 'reference'
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

| 模块 | 主要功能 |
|-----|---------|
| `Parser` | 解析DPML文本为AST |
| `Processor` | 处理AST, 提供语义分析 |
| `Transformer` | 转换处理后的文档为目标格式 |
| `TagRegistry` | 管理标签定义 |
| `ReferenceResolver` | 解析引用和资源链接 |
| `OutputAdapter` | 格式化输出 |
| `ErrorHandler` | 错误处理 |

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
  
  async process(element: Element, context: ProcessingContext): Promise<Element> {
    // 提取角色信息
    const roleInfo = {
      name: element.attributes.name,
      expertise: element.attributes.expertise,
      description: this.extractDescription(element)
    };
    
    // 添加到元数据
    element.metadata = element.metadata || {};
    element.metadata.roleInfo = roleInfo;
    
    return element;
  }
  
  private extractDescription(element: Element): string {
    // 从子内容节点提取描述文本
    return element.children
      .filter(child => isContent(child))
      .map(child => (child as Content).value)
      .join('');
  }
}
```

### 继承处理器

实现标签继承机制：

```typescript
// 示例：处理继承关系
class InheritanceProcessor implements TagProcessor {
  canProcess(element: Element): boolean {
    return element.attributes.extends !== undefined;
  }
  
  async process(element: Element, context: ProcessingContext): Promise<Element> {
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
      ...element.attributes
    };
    
    // 如果目标元素没有自己的内容，继承源元素的内容
    if (element.children.length === 0) {
      element.children = [...referencedElement.children];
    }
    
    return element;
  }
}
```

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
      basePath: './templates'
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

// 注册自定义标签
registry.registerTagDefinition('my-tag', {
  attributes: {
    id: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: false,
      validate: (value) => {
        return ['a', 'b', 'c'].includes(value) || 
          `无效的type属性值: ${value}，应为a, b或c`;
      }
    }
  },
  allowedChildren: ['sub-tag', 'content'],
  validate: (element, context) => {
    // 验证逻辑
    const valid = true;
    const errors = [];
    
    if (element.attributes.type && !['a', 'b', 'c'].includes(element.attributes.type)) {
      valid = false;
      errors.push({
        code: 'INVALID_TYPE',
        message: `无效的type属性值: ${element.attributes.type}，应为a, b或c`
      });
    }
    
    return { valid, errors };
  }
});
```

---

## 贡献指南

欢迎贡献代码、报告问题或提出建议。请参阅我们的[贡献指南](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE) 