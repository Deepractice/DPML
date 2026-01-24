# DPML 变换器系统

本文档介绍 DPML 的变换器 (Transformer) 系统，用于将处理结果转换为目标格式。

## 什么是变换器

变换器是 DPML 处理流程的最后一个阶段，负责将 `ProcessingResult` 转换为应用需要的目标格式。

```
DPML 文本 → [解析] → DPMLDocument → [处理] → ProcessingResult → [变换] → 目标格式
```

变换器系统的核心价值：

- **领域适配**：将通用的 DPML 结构转换为领域特定对象
- **数据提取**：从文档中提取需要的信息
- **格式转换**：生成 JSON、对象、或其他格式

## 核心概念

### Transformer 接口

每个变换器都实现 `Transformer` 接口：

```typescript
interface Transformer<TInput, TOutput> {
  // 变换器名称（必需，用于标识）
  name: string;

  // 变换器描述（可选）
  description?: string;

  // 执行转换的核心方法
  transform(input: TInput, context: TransformContext): TOutput;
}
```

### TransformContext

转换上下文，在转换过程中维护状态：

```typescript
class TransformContext {
  // 存储和获取数据
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | undefined;
  has(key: string): boolean;

  // 访问原始数据
  getDocument(): DPMLDocument;
  getReferences(): ReferenceMap | undefined;
  getValidation(): ValidationResult;
  isDocumentValid(): boolean;

  // 获取所有结果
  getAllResults(): Record<string, unknown>;
}
```

### Pipeline

管道负责按顺序执行多个变换器：

```typescript
class Pipeline {
  // 添加变换器到管道
  add<TInput, TOutput>(transformer: Transformer<TInput, TOutput>): Pipeline;

  // 执行管道
  execute<TInput, TOutput>(input: TInput, context: TransformContext): TOutput;
}
```

## 使用变换器

### 注册变换器

使用 `registerTransformer` 注册自定义变换器：

```typescript
import { registerTransformer } from '@dpml/core';

registerTransformer({
  name: 'prompt-extractor',
  description: '提取 prompt 元素的内容',
  transform: (input, context) => {
    const document = context.getDocument();
    const prompts: string[] = [];

    // 遍历文档提取 prompt 内容
    function extractPrompts(node: DPMLNode) {
      if (node.tagName === 'prompt') {
        prompts.push(node.content);
      }
      node.children.forEach(extractPrompts);
    }

    extractPrompts(document.rootNode);
    return { prompts };
  },
});
```

### 执行转换

使用 `transform` 函数执行转换：

```typescript
import { parse, processSchema, processDocument, transform } from '@dpml/core';

// 1. 解析文档
const document = parse('<agent><prompt>Hello</prompt></agent>');

// 2. 处理文档
const schema = processSchema({ root: { element: 'agent' } });
const processingResult = processDocument(document, schema);

// 3. 执行转换
const result = transform(processingResult);

console.log(result.merged);       // 合并后的结果
console.log(result.transformers); // 各变换器的结果
console.log(result.metadata);     // 转换元数据
```

## 转换选项

`transform` 函数接受可选的 `TransformOptions`：

```typescript
interface TransformOptions {
  // 初始上下文数据
  context?: Record<string, unknown>;

  // 结果模式
  resultMode?: 'full' | 'merged' | 'raw';

  // 包含的变换器（白名单）
  include?: string[];

  // 排除的变换器（黑名单）
  exclude?: string[];
}
```

### 结果模式

| 模式 | 描述 |
|------|------|
| `full` | 返回完整结果，包括 `transformers`、`merged` 和 `raw` |
| `merged` | 仅返回合并后的结果 |
| `raw` | 仅返回原始输出 |

```typescript
// 使用完整模式（默认）
const fullResult = transform(processingResult, { resultMode: 'full' });

// 仅获取合并结果
const mergedResult = transform(processingResult, { resultMode: 'merged' });
```

### 过滤变换器

```typescript
// 只运行指定的变换器
const result = transform(processingResult, {
  include: ['prompt-extractor', 'config-extractor']
});

// 排除特定变换器
const result = transform(processingResult, {
  exclude: ['debug-transformer']
});
```

## 转换结果

`TransformResult` 包含转换的完整结果：

```typescript
interface TransformResult<T> {
  // 各变换器的结果映射
  transformers: Record<string, unknown>;

  // 合并后的结果
  merged: T;

  // 原始输出
  raw?: unknown;

  // 警告信息
  warnings?: TransformWarning[];

  // 元数据
  metadata: TransformMetadata;
}
```

### 元数据结构

```typescript
interface TransformMetadata {
  // 参与转换的变换器名称
  transformers: string[];

  // 转换选项
  options: TransformOptions;

  // 时间戳
  timestamp: number;

  // 执行时间（毫秒）
  executionTime?: number;
}
```

## 创建自定义变换器

### 基础示例

创建一个提取 LLM 配置的变换器：

```typescript
const llmExtractor: Transformer<ProcessingResult, LLMConfig> = {
  name: 'llm-extractor',
  description: '提取 LLM 配置',
  transform: (input, context) => {
    const document = context.getDocument();

    // 查找 llm 元素
    function findLLM(node: DPMLNode): DPMLNode | null {
      if (node.tagName === 'llm') return node;
      for (const child of node.children) {
        const found = findLLM(child);
        if (found) return found;
      }
      return null;
    }

    const llmNode = findLLM(document.rootNode);

    if (!llmNode) {
      return { model: 'default', temperature: 0.7 };
    }

    return {
      model: llmNode.attributes.get('model') || 'default',
      temperature: parseFloat(llmNode.attributes.get('temperature') || '0.7'),
      maxTokens: parseInt(llmNode.attributes.get('max-tokens') || '2000'),
    };
  },
};

registerTransformer(llmExtractor);
```

### 使用上下文传递数据

变换器可以通过上下文共享数据：

```typescript
// 第一个变换器：提取配置
const configExtractor: Transformer<ProcessingResult, void> = {
  name: 'config-extractor',
  transform: (input, context) => {
    const config = extractConfig(context.getDocument());
    context.set('config', config);  // 存储到上下文
  },
};

// 第二个变换器：使用配置
const configProcessor: Transformer<void, ProcessedConfig> = {
  name: 'config-processor',
  transform: (input, context) => {
    const config = context.get<Config>('config');  // 从上下文获取
    return processConfig(config);
  },
};
```

### 添加警告

变换器可以记录警告信息：

```typescript
const validatingTransformer: Transformer<ProcessingResult, Result> = {
  name: 'validator',
  transform: (input, context) => {
    const warnings = context.get<TransformWarning[]>('warnings') || [];

    if (someCondition) {
      warnings.push({
        code: 'DEPRECATED_ATTRIBUTE',
        message: '属性 "api-key" 已弃用，请使用 "apiKey"',
        transformer: 'validator',
        severity: 'medium',
      });
      context.set('warnings', warnings);
    }

    return result;
  },
};
```

## 变换器管道

多个变换器按注册顺序在管道中执行：

```
输入 → 变换器1 → 变换器2 → 变换器3 → 输出
           ↓         ↓         ↓
        上下文    上下文    上下文
```

### 管道特性

1. **顺序执行**：变换器按注册顺序执行
2. **数据传递**：前一个变换器的输出作为下一个的输入
3. **上下文共享**：所有变换器共享同一个 `TransformContext`
4. **结果收集**：每个变换器的结果按名称存储

### 管道示例

```typescript
// 注册多个变换器
registerTransformer({
  name: 'metadata-extractor',
  transform: (input, context) => {
    return { metadata: extractMetadata(context.getDocument()) };
  },
});

registerTransformer({
  name: 'content-extractor',
  transform: (input, context) => {
    return { content: extractContent(context.getDocument()) };
  },
});

registerTransformer({
  name: 'config-extractor',
  transform: (input, context) => {
    return { config: extractConfig(context.getDocument()) };
  },
});

// 执行转换
const result = transform(processingResult);

// 结果包含所有变换器的输出
console.log(result.transformers['metadata-extractor']);
console.log(result.transformers['content-extractor']);
console.log(result.transformers['config-extractor']);

// merged 包含合并后的结果
console.log(result.merged);
// { metadata: {...}, content: {...}, config: {...} }
```

## 变换器注册表

DPML 使用全局注册表管理变换器：

```typescript
// 注册变换器
registerTransformer(myTransformer);

// 变换器名称必须唯一
registerTransformer({ name: 'duplicate', /* ... */ });  // 抛出错误
```

### 注册规则

- 每个变换器必须有 `name`
- 名称在注册表中必须唯一
- 重复注册会抛出错误

## 最佳实践

### 1. 单一职责

每个变换器专注于一个任务：

```typescript
// 好：专注于提取 prompt
{ name: 'prompt-extractor', transform: extractPrompts }

// 好：专注于提取 config
{ name: 'config-extractor', transform: extractConfig }

// 避免：一个变换器做太多事情
{ name: 'everything-extractor', transform: extractEverything }
```

### 2. 使用描述性名称

```typescript
{ name: 'llm-config-extractor' }      // 好
{ name: 'agent-prompt-processor' }    // 好
{ name: 'processor1' }                // 避免
```

### 3. 优雅处理缺失数据

```typescript
transform: (input, context) => {
  const node = findNode(context.getDocument(), 'optional-element');

  // 返回默认值而不是抛出错误
  if (!node) {
    return { value: null, found: false };
  }

  return { value: node.content, found: true };
}
```

### 4. 利用类型安全

```typescript
interface AgentConfig {
  model: string;
  temperature: number;
  prompt: string;
}

const agentTransformer: Transformer<ProcessingResult, AgentConfig> = {
  name: 'agent-transformer',
  transform: (input, context): AgentConfig => {
    // TypeScript 确保返回正确的类型
    return {
      model: 'gpt-4',
      temperature: 0.7,
      prompt: 'Hello',
    };
  },
};
```

## 下一步

- [架构概览](./overview.md) - 了解整体架构
- [语法概念](./syntax.md) - 了解 Element、Attribute、Content
- [Schema 系统](./schema.md) - 了解如何定义文档结构
- [内置元素](./built-in-elements.md) - 了解 resource 等内置元素
