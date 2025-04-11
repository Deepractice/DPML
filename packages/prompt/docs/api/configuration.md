# 配置选项

`@dpml/prompt` 包提供了丰富的配置选项，用于自定义DPML处理和转换行为。本文档详细介绍了所有可用的配置选项，以及如何在不同API函数中使用这些选项。

## 配置选项概览

配置选项按功能分为几个主要类别：

1. **通用选项** - 适用于所有API的基本选项
2. **处理选项** - 影响DPML解析和处理行为的选项
3. **转换选项** - 影响输出格式和内容的选项
4. **格式选项** - 控制标签内容格式化的选项

## 通用选项

这些选项可以在任何API函数中使用：

| 选项名 | 类型 | 默认值 | 描述 |
|-------|-----|-------|------|
| `basePath` | `string` | `process.cwd()` | 解析相对路径引用的基础路径 |
| `lang` | `string` | `'en'` | 提示的语言设置，覆盖文档中的lang属性 |

## 处理选项 (PromptOptions)

这些选项影响DPML文本的解析和处理行为，通常用于 `processPrompt` 函数：

| 选项名 | 类型 | 默认值 | 描述 |
|-------|-----|-------|------|
| `mode` | `'strict' \| 'loose'` | `'loose'` | 解析模式，strict会更严格地验证 |
| `validateOnly` | `boolean` | `false` | 是否只进行验证而不处理内容 |

示例：

```javascript
processPrompt(dpml, {
  mode: 'strict',
  validateOnly: true
})
```

## 转换选项 (TransformOptions)

这些选项影响处理后DPML结构转换为文本的行为，通常用于 `transformPrompt` 函数：

| 选项名 | 类型 | 默认值 | 描述 |
|-------|-----|-------|------|
| `format` | `FormatOptions` | 默认格式 | 自定义格式模板配置 |
| `addLanguageDirective` | `boolean` | `false` | 是否在输出末尾添加语言指令 |
| `tagOrder` | `string[]` | 默认顺序 | 自定义标签输出顺序 |

示例：

```javascript
transformPrompt(processed, {
  format: { /* 格式选项 */ },
  addLanguageDirective: true,
  tagOrder: ['role', 'context', 'thinking']
})
```

## 格式选项 (FormatOptions)

格式选项允许自定义各标签的格式化方式，通过 `format` 属性传递：

```typescript
interface FormatOptions {
  [tagName: string]: TagFormatOptions;
}

interface TagFormatOptions {
  title?: string;                       // 标题
  prefix?: string;                      // 前缀
  suffix?: string;                      // 后缀
  wrapper?: (content: string) => string; // 内容包装器函数
}
```

### 默认格式模板

```javascript
const defaultFormatTemplates = {
  role: {
    title: '# 角色'
  },
  context: {
    title: '# 上下文'
  },
  thinking: {
    title: '# 思考框架'
  },
  executing: {
    title: '# 执行步骤'
  },
  testing: {
    title: '# 质量检查'
  },
  protocol: {
    title: '# 交互协议'
  },
  custom: {
    title: '# 自定义'
  }
};
```

### 格式选项示例

```javascript
transformPrompt(processed, {
  format: {
    role: {
      title: '👤 角色',
      wrapper: (content) => `**${content}**`
    },
    context: {
      title: '📝 上下文',
      prefix: '> '
    },
    thinking: {
      title: '🧠 思维方式',
      suffix: '\n---'
    }
  }
})
```

## generatePrompt组合选项 (GeneratePromptOptions)

`generatePrompt` 函数接受一个组合了处理选项和转换选项的配置对象：

| 选项名 | 类型 | 默认值 | 描述 |
|-------|-----|-------|------|
| `validateOnly` | `boolean` | `false` | 是否只进行验证而不生成输出 |
| `basePath` | `string` | `process.cwd()` | 解析相对路径引用的基础路径 |
| `strictMode` | `boolean` | `false` | 是否使用严格模式解析 (对应mode: 'strict') |
| `lang` | `string` | `'en'` | 提示的语言设置，覆盖文档中的lang属性 |
| `formatTemplates` | `FormatOptions` | 默认格式 | 自定义格式模板配置 (对应format选项) |
| `addLanguageDirective` | `boolean` | `false` | 是否在输出末尾添加语言指令 |
| `tagOrder` | `string[]` | 默认顺序 | 自定义标签输出顺序 |

示例：

```javascript
generatePrompt(dpml, {
  strictMode: true,
  lang: 'zh-CN',
  formatTemplates: {
    role: { title: '👤 角色' },
    context: { title: '📝 上下文' }
  },
  addLanguageDirective: true
})
```

## 语言特定格式

不同语言可以有不同的默认格式模板。`@dpml/prompt` 内置了中文(zh-CN)的特定格式模板：

```javascript
const zhCNFormatTemplates = {
  role: {
    title: '# 角色'
  },
  context: {
    title: '# 上下文'
  },
  thinking: {
    title: '# 思考框架'
  },
  executing: {
    title: '# 执行步骤'
  },
  testing: {
    title: '# 质量检查'
  },
  protocol: {
    title: '# 交互协议'
  },
  custom: {
    title: '# 自定义'
  }
};
```

语言设置通过以下方式确定：

1. 转换选项中的 `lang` 属性
2. 如果未指定，则使用处理后结构中的 `metadata.lang` 属性
3. 如果都未指定，默认使用 `'en'`

## 标签顺序

默认标签输出顺序为：

```javascript
const defaultTagOrder = [
  'role',
  'context',
  'thinking',
  'executing',
  'testing',
  'protocol',
  'custom'
];
```

可以通过 `tagOrder` 选项自定义顺序：

```javascript
transformPrompt(processed, {
  tagOrder: ['context', 'role', 'thinking', 'protocol']
})
```

## 语言指令

当 `addLanguageDirective` 设置为 `true` 时，会在输出末尾添加语言指令：

```javascript
const langDirectives = {
  'en': 'Please respond in English.',
  'zh-CN': '请用中文回答。',
  'ja': '日本語で回答してください。',
  'ko': '한국어로 대답해 주세요.',
  'fr': 'Veuillez répondre en français.',
  'de': 'Bitte antworten Sie auf Deutsch.',
  'es': 'Por favor, responda en español.',
  'it': 'Per favore, risponda in italiano.',
  'ru': 'Пожалуйста, ответьте на русском языке.',
  'pt': 'Por favor, responda em português.'
};
```

## 最佳实践

### 配置重用

对于经常使用的配置，可以创建配置对象并重用：

```javascript
const myConfig = {
  strictMode: true,
  formatTemplates: {
    role: { title: '## 角色' },
    context: { title: '## 上下文' }
  },
  addLanguageDirective: true
};

// 在多个地方重用
generatePrompt(dpml1, myConfig);
generatePrompt(dpml2, myConfig);
```

### 格式模板继承

可以基于默认模板创建自定义模板：

```javascript
import { defaultFormatTemplates } from '@dpml/prompt';

const myTemplates = {
  ...defaultFormatTemplates,
  role: {
    ...defaultFormatTemplates.role,
    wrapper: (content) => `**${content}**`
  },
  // 添加自定义模板
  customTag: {
    title: '# 自定义标签'
  }
};
```

### 选择合适的API

- 如果只需要简单地生成提示文本，使用 `generatePrompt`
- 如果需要更精细的控制或中间处理，使用 `processPrompt` 和 `transformPrompt` 的组合
- 如果只需要验证DPML文本的有效性，使用 `processPrompt` 并设置 `validateOnly: true` 