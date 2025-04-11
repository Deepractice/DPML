# 格式模板

格式模板是 `@dpml/prompt` 包的核心特性之一，它控制DPML标签内容如何被格式化为最终的提示文本。格式模板允许开发者自定义每个标签的输出格式，包括标题、前缀、后缀和内容包装方式。

## 格式模板结构

格式模板的基本结构是一个对象，其中键是标签名，值是格式选项：

```typescript
interface FormatTemplates {
  [tagName: string]: TagFormatOptions;
}

interface TagFormatOptions {
  title?: string;                       // 标签标题
  prefix?: string;                      // 内容前缀
  suffix?: string;                      // 内容后缀
  wrapper?: (content: string) => string; // 内容包装函数
}
```

## 默认格式模板

`@dpml/prompt` 包提供了默认的格式模板：

```javascript
export const defaultFormatTemplates: FormatTemplates = {
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

## 格式模板应用过程

当 `transformPrompt` 函数执行时，格式模板会按照以下步骤应用：

1. 确定使用的格式模板（用户提供的或默认的）
2. 根据语言设置选择语言特定的模板
3. 对每个标签内容应用格式化：
   - 添加标题（如果有）
   - 添加前缀（如果有）
   - 应用内容包装函数（如果有）
   - 添加后缀（如果有）
4. 按照标签顺序组装最终文本

## 自定义格式模板

### 基本使用

您可以在 `transformPrompt` 函数中通过 `format` 选项提供自定义格式模板：

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

const processed = await processPrompt(dpml);
const promptText = transformPrompt(processed, {
  format: {
    role: {
      title: '## 角色定义'
    },
    context: {
      title: '## 工作背景',
      prefix: '> '
    }
  }
});
```

在 `generatePrompt` 函数中，通过 `formatTemplates` 选项提供：

```javascript
import { generatePrompt } from '@dpml/prompt';

const promptText = await generatePrompt(dpml, {
  formatTemplates: {
    role: {
      title: '## 角色定义'
    },
    context: {
      title: '## 工作背景',
      prefix: '> '
    }
  }
});
```

### 扩展默认模板

您可以导入并扩展默认格式模板：

```javascript
import { defaultFormatTemplates, transformPrompt } from '@dpml/prompt';

const myFormatTemplates = {
  ...defaultFormatTemplates,
  role: {
    title: '👤 角色',
    wrapper: (content) => `**${content}**`
  },
  // 覆盖已有标签的格式
  context: {
    title: '📋 上下文',
    prefix: '- '
  },
  // 添加自定义标签的格式
  custom_tag: {
    title: '🔖 自定义内容'
  }
};

const promptText = transformPrompt(processed, {
  format: myFormatTemplates
});
```

### 格式项详解

#### 标题 (title)

标题会添加在标签内容的上方：

```javascript
format: {
  role: {
    title: '# 角色定义'
  }
}

// 输出:
// # 角色定义
// 助手角色描述内容
```

#### 前缀 (prefix)

前缀会添加在每行内容的开头：

```javascript
format: {
  context: {
    title: '## 上下文',
    prefix: '> '
  }
}

// 输出:
// ## 上下文
// > 第一行上下文
// > 第二行上下文
```

#### 后缀 (suffix)

后缀会添加在内容的末尾：

```javascript
format: {
  thinking: {
    title: '## 思考框架',
    suffix: '\n---'
  }
}

// 输出:
// ## 思考框架
// 思考框架内容
// ---
```

#### 包装函数 (wrapper)

包装函数可以对整个内容进行转换：

```javascript
format: {
  role: {
    title: '## 角色',
    wrapper: (content) => `**${content}**`
  }
}

// 输出:
// ## 角色
// **助手角色描述内容**
```

包装函数也可以实现更复杂的格式化：

```javascript
format: {
  thinking: {
    title: '## 思考步骤',
    wrapper: (content) => {
      // 将内容按行分割，添加数字编号
      const lines = content.split('\n');
      return lines.map((line, i) => `${i+1}. ${line}`).join('\n');
    }
  }
}
```

## 语言特定格式

`@dpml/prompt` 包支持基于语言设置使用不同的格式模板。目前内置了中文(zh-CN)格式模板：

```javascript
export const zhCNFormatTemplates: FormatTemplates = {
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

语言设置的确定方式如下：

1. 如果转换选项中提供了 `lang` 属性，使用该值
2. 否则，使用处理后结构中的 `metadata.lang` 属性
3. 如果都未提供，默认使用 `'en'`

示例：

```javascript
// 在DPML中指定语言
const dpml = `
<prompt lang="zh-CN">
  <role>翻译</role>
  <context>将英文文本翻译成中文</context>
</prompt>
`;

// 或在选项中指定语言
const promptText = await generatePrompt(dpml, {
  lang: 'zh-CN'
});
```

## 自定义语言格式

您可以添加自己的语言特定格式模板：

```javascript
import { transformPrompt } from '@dpml/prompt';

// 定义法语格式模板
const frFormatTemplates = {
  role: {
    title: '# Rôle'
  },
  context: {
    title: '# Contexte'
  },
  thinking: {
    title: '# Cadre de Réflexion'
  },
  executing: {
    title: '# Étapes d\'Exécution'
  },
  testing: {
    title: '# Contrôle de Qualité'
  },
  protocol: {
    title: '# Protocole d\'Interaction'
  },
  custom: {
    title: '# Personnalisé'
  }
};

// 使用自定义语言格式
const promptText = transformPrompt(processed, {
  lang: 'fr',
  format: {
    // 基本格式（适用于所有语言）
    ...myBaseFormat,
    // 特定于法语的格式覆盖
    ['fr']: frFormatTemplates
  }
});
```

## 格式模板最佳实践

### 1. 使用一致的格式标准

为您的应用程序创建一致的格式标准：

```javascript
// 定义应用的标准格式
const appStandardFormat = {
  role: {
    title: '## 角色',
    wrapper: (content) => `**${content}**`
  },
  context: {
    title: '## 上下文',
    prefix: '> '
  },
  thinking: {
    title: '## 思维方式'
  },
  executing: {
    title: '## 操作步骤',
    prefix: '- '
  },
  testing: {
    title: '## 质量标准',
    prefix: '✓ '
  },
  protocol: {
    title: '## 交流准则'
  }
};

// 在所有地方使用这个标准格式
const result = await generatePrompt(dpml, {
  formatTemplates: appStandardFormat
});
```

### 2. 根据输出目标调整格式

为不同的输出目标创建不同的格式模板：

```javascript
// Markdown格式（适合文档）
const markdownFormat = {
  role: {
    title: '## 角色',
    wrapper: (content) => `**${content}**`
  },
  context: {
    title: '## 上下文',
    prefix: '> '
  }
};

// HTML格式（适合网页）
const htmlFormat = {
  role: {
    title: '<h2>角色</h2>',
    wrapper: (content) => `<strong>${content}</strong>`
  },
  context: {
    title: '<h2>上下文</h2>',
    wrapper: (content) => `<blockquote>${content}</blockquote>`
  }
};

// 纯文本格式（适合控制台）
const plainTextFormat = {
  role: {
    title: '角色:',
    suffix: '\n---'
  },
  context: {
    title: '上下文:',
    suffix: '\n---'
  }
};
```

### 3. 创建特定场景的模板

为特定场景创建专用模板：

```javascript
// 技术文档模板
const technicalDocFormat = {
  role: {
    title: '## Technical Writer',
    prefix: '> '
  },
  context: {
    title: '## Documentation Scope',
    prefix: '- '
  },
  thinking: {
    title: '## Technical Considerations',
    prefix: '* '
  }
};

// 问答模板
const qnaFormat = {
  role: {
    title: '## Expert Type'
  },
  context: {
    title: '## Domain Knowledge'
  },
  protocol: {
    title: '## Response Format',
    wrapper: (content) => `\`\`\`\n${content}\n\`\`\``
  }
};
```

## 示例场景

### 创建不同角色的自定义格式

```javascript
// 编程助手格式
const programmerFormat = {
  role: {
    title: '```js\n// 角色定义\n```'
  },
  thinking: {
    title: '```js\n// 思路分析\n```'
  },
  executing: {
    title: '```js\n// 执行步骤\n```'
  }
};

// 医疗顾问格式
const medicalFormat = {
  role: {
    title: '🩺 医疗专业人员'
  },
  context: {
    title: '📋 医学背景',
    prefix: '• '
  },
  protocol: {
    title: '⚠️ 免责声明',
    wrapper: (content) => `*${content}*`
  }
};
```

### 使用包装函数增强内容

```javascript
// Markdown增强
const enhancedMarkdown = {
  role: {
    title: '## 角色',
    wrapper: (content) => content.replace(/重要/g, '**重要**')
                                .replace(/注意/g, '*注意*')
  },
  thinking: {
    wrapper: (content) => {
      const lines = content.split('\n');
      return lines.map(line => {
        if (line.trim().startsWith('-')) {
          return line; // 保持原有格式
        }
        return `> ${line}`; // 其他行添加引用格式
      }).join('\n');
    }
  }
};
```

## 相关API

- [transformPrompt](./transform-prompt.md) - 使用格式模板转换DPML
- [配置选项](./configuration.md) - 所有配置选项的详细说明 