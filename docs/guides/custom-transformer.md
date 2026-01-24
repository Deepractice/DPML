# 自定义变换器指南

本指南介绍如何创建和使用 DPML 变换器（Transformer），将解析后的文档转换为目标格式。

## 概述

变换器是 DPML 编译管道的核心组件，负责将解析后的文档结构转换为应用所需的数据格式。变换器可以：

- 提取文档中的特定数据
- 转换数据结构
- 生成目标格式输出
- 链式组合多个变换步骤

## 变换器基础

### 定义简单变换器

使用 `defineTransformer` 创建变换器：

```typescript
import { defineTransformer } from 'dpml';

const myTransformer = defineTransformer({
  name: 'my-transformer',
  description: 'A simple transformer',
  transform: (input, context) => {
    return {
      content: input.document.rootNode.content,
    };
  },
});
```

### 变换器接口

变换器必须实现以下接口：

```typescript
interface TransformerDefinition<TInput, TOutput> {
  /** 变换器名称（必需） */
  name: string;

  /** 变换器描述（可选） */
  description?: string;

  /** 转换函数（必需） */
  transform: (input: TInput, context: TransformContext) => TOutput;
}
```

### 泛型类型支持

使用泛型定义输入输出类型，确保类型安全：

```typescript
interface ProcessingInput {
  document: DPMLDocument;
  isValid: boolean;
}

interface PromptConfig {
  role: string;
  content: string;
}

const typedTransformer = defineTransformer<ProcessingInput, PromptConfig>({
  name: 'prompt-transformer',
  transform: (input, context) => {
    const rootNode = input.document.rootNode;
    return {
      role: rootNode.attributes.get('role') || 'user',
      content: rootNode.content,
    };
  },
});
```

## 访问文档数据

### 访问根节点

```typescript
const transformer = defineTransformer({
  name: 'root-extractor',
  transform: (input) => {
    const rootNode = input.document.rootNode;

    return {
      tagName: rootNode.tagName,
      content: rootNode.content,
    };
  },
});
```

### 访问属性

节点属性存储在 `Map<string, string>` 中：

```typescript
const transformer = defineTransformer({
  name: 'attr-extractor',
  transform: (input) => {
    const rootNode = input.document.rootNode;
    const attributes = rootNode.attributes;

    return {
      role: attributes.get('role'),
      temperature: attributes.get('temperature'),
      // 获取所有属性
      allAttributes: Object.fromEntries(attributes),
    };
  },
});
```

### 访问子元素

遍历和处理子节点：

```typescript
const transformer = defineTransformer({
  name: 'children-extractor',
  transform: (input) => {
    const rootNode = input.document.rootNode;
    const children = rootNode.children;

    return {
      childCount: children.length,
      childTags: children.map(child => child.tagName),
      childContents: children.map(child => ({
        tag: child.tagName,
        content: child.content,
      })),
    };
  },
});
```

### 递归遍历文档树

```typescript
function extractAllText(node: DPMLNode): string[] {
  const texts: string[] = [];

  if (node.content) {
    texts.push(node.content);
  }

  for (const child of node.children) {
    texts.push(...extractAllText(child));
  }

  return texts;
}

const transformer = defineTransformer({
  name: 'text-collector',
  transform: (input) => {
    return {
      allTexts: extractAllText(input.document.rootNode),
    };
  },
});
```

## 使用 TransformContext

`TransformContext` 提供转换过程中的上下文信息和状态管理：

### 访问上下文方法

```typescript
const transformer = defineTransformer({
  name: 'context-aware',
  transform: (input, context) => {
    // 获取原始文档
    const document = context.getDocument();

    // 检查文档有效性
    const isValid = context.isDocumentValid();

    // 获取验证结果
    const validation = context.getValidation();

    return {
      isValid,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  },
});
```

### 在变换器间共享数据

使用 context 的 `set` 和 `get` 方法在变换器之间传递数据：

```typescript
// 第一个变换器：提取数据并存储
const firstTransformer = defineTransformer({
  name: 'data-extractor',
  transform: (input, context) => {
    const metadata = {
      processedAt: new Date().toISOString(),
      nodeCount: countNodes(input.document.rootNode),
    };

    // 存储数据供后续变换器使用
    context.set('metadata', metadata);

    return input;
  },
});

// 第二个变换器：使用共享数据
const secondTransformer = defineTransformer({
  name: 'data-consumer',
  transform: (input, context) => {
    // 获取之前存储的数据
    const metadata = context.get<{ processedAt: string; nodeCount: number }>('metadata');

    return {
      ...input,
      metadata,
    };
  },
});
```

## 变换器组合

### 链式变换器

DPML 按顺序执行变换器数组中的变换器，每个变换器的输出作为下一个变换器的输入：

```typescript
import { createDPML, defineSchema, defineTransformer } from 'dpml';

// 第一个变换器：添加前缀
const prefixTransformer = defineTransformer({
  name: 'prefix-adder',
  transform: (input) => ({
    ...input,
    content: `[PREFIX] ${input.document?.rootNode?.content || ''}`,
  }),
});

// 第二个变换器：添加后缀
const suffixTransformer = defineTransformer({
  name: 'suffix-adder',
  transform: (input) => ({
    ...input,
    content: `${input.content} [SUFFIX]`,
  }),
});

// 组合使用
const dpml = createDPML({
  schema: defineSchema({ element: 'prompt' }),
  transformers: [prefixTransformer, suffixTransformer],
});

const result = await dpml.compile('<prompt>Content</prompt>');
// result.content === "[PREFIX] Content [SUFFIX]"
```

### 条件变换

根据条件决定是否执行变换：

```typescript
const conditionalTransformer = defineTransformer({
  name: 'conditional',
  transform: (input, context) => {
    // 只在文档有效时进行转换
    if (!context.isDocumentValid()) {
      return {
        ...input,
        error: 'Invalid document',
      };
    }

    return {
      ...input,
      processed: true,
    };
  },
});
```

## 内置变换器

### Resource 变换器

DPML 内置了 `dpml:resource-extractor` 变换器，自动提取所有 `<resource>` 元素：

```typescript
import { createDPML, defineSchema } from 'dpml';
import type { ResourceResult } from 'dpml';

const dpml = createDPML({
  schema: defineSchema({ element: 'prompt' }),
  transformers: [], // 内置变换器自动注册
});

const result = await dpml.compile<ResourceResult>(`
  <prompt>
    <resource src="arp:text:file://./rules.md"/>
    <resource src="localhost/config.text@1.0"/>
  </prompt>
`);

console.log(result.resources);
// [
//   { src: 'arp:text:file://./rules.md', protocol: 'arp', node: DPMLNode },
//   { src: 'localhost/config.text@1.0', protocol: 'rxl', node: DPMLNode }
// ]
```

## 实战案例

### 案例 1：Prompt 配置提取器

将 DPML 文档转换为 AI 模型配置：

```typescript
interface AIPromptConfig {
  model: string;
  temperature: number;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

const promptConfigTransformer = defineTransformer<any, AIPromptConfig>({
  name: 'ai-prompt-config',
  description: 'Transforms DPML to AI prompt configuration',
  transform: (input) => {
    const rootNode = input.document.rootNode;
    const messages: AIPromptConfig['messages'] = [];

    // 提取系统消息
    const systemNode = rootNode.children.find(c => c.tagName === 'system');
    if (systemNode) {
      messages.push({
        role: 'system',
        content: systemNode.content.trim(),
      });
    }

    // 提取用户消息
    const userNodes = rootNode.children.filter(c => c.tagName === 'user');
    for (const node of userNodes) {
      messages.push({
        role: 'user',
        content: node.content.trim(),
      });
    }

    return {
      model: rootNode.attributes.get('model') || 'gpt-4',
      temperature: parseFloat(rootNode.attributes.get('temperature') || '0.7'),
      messages,
    };
  },
});
```

### 案例 2：Markdown 生成器

将结构化文档转换为 Markdown 格式：

```typescript
const markdownTransformer = defineTransformer({
  name: 'markdown-generator',
  transform: (input) => {
    const rootNode = input.document.rootNode;
    let markdown = '';

    for (const child of rootNode.children) {
      switch (child.tagName) {
        case 'title':
          markdown += `# ${child.content.trim()}\n\n`;
          break;
        case 'section':
          const heading = child.attributes.get('title') || '';
          markdown += `## ${heading}\n\n`;
          markdown += `${child.content.trim()}\n\n`;
          break;
        case 'code':
          const lang = child.attributes.get('lang') || '';
          markdown += '```' + lang + '\n';
          markdown += child.content.trim() + '\n';
          markdown += '```\n\n';
          break;
        default:
          markdown += `${child.content.trim()}\n\n`;
      }
    }

    return {
      ...input,
      markdown: markdown.trim(),
    };
  },
});
```

### 案例 3：验证增强变换器

添加自定义验证逻辑：

```typescript
interface ValidationEnhancedResult {
  isValid: boolean;
  customErrors: string[];
  data: unknown;
}

const validationEnhancer = defineTransformer<any, ValidationEnhancedResult>({
  name: 'validation-enhancer',
  transform: (input, context) => {
    const customErrors: string[] = [];
    const rootNode = input.document.rootNode;

    // 自定义验证：检查内容长度
    if (rootNode.content.length > 10000) {
      customErrors.push('Content exceeds maximum length of 10000 characters');
    }

    // 自定义验证：检查必要的子元素
    const hasInstruction = rootNode.children.some(c => c.tagName === 'instruction');
    if (!hasInstruction) {
      customErrors.push('Missing required <instruction> element');
    }

    return {
      isValid: context.isDocumentValid() && customErrors.length === 0,
      customErrors,
      data: input,
    };
  },
});
```

## 错误处理

### 变换器定义错误

```typescript
// 错误：缺少 name
const badTransformer = defineTransformer({
  transform: (input) => input,
}); // 抛出错误: Transformer must have a name

// 错误：缺少 transform 函数
const badTransformer2 = defineTransformer({
  name: 'incomplete',
}); // 抛出错误: Transformer must have a transform function

// 错误：空名称
const badTransformer3 = defineTransformer({
  name: '',
  transform: (input) => input,
}); // 抛出错误
```

### 运行时错误处理

```typescript
const safeTransformer = defineTransformer({
  name: 'safe-transformer',
  transform: (input, context) => {
    try {
      // 可能失败的操作
      const data = JSON.parse(input.document.rootNode.content);
      return { ...input, parsedData: data };
    } catch (error) {
      // 优雅地处理错误
      return {
        ...input,
        parsedData: null,
        parseError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
```

## 最佳实践

1. **保持变换器单一职责**：每个变换器只做一件事
2. **使用类型定义**：利用泛型确保输入输出类型安全
3. **不可变数据**：不要修改输入对象，始终返回新对象
4. **错误处理**：在变换器中妥善处理可能的错误
5. **使用 Context 共享状态**：避免使用全局变量
6. **有意义的命名**：使用清晰的变换器名称便于调试

## 相关文档

- [Schema 定义指南](./defining-schema.md)
- [验证最佳实践](./validation.md)
- [集成指南](./integration.md)
