# @dpml/prompt

[![NPM version](https://img.shields.io/npm/v/@dpml/prompt.svg)](https://www.npmjs.com/package/@dpml/prompt)
[![Node.js CI](https://github.com/dpml/prompt/actions/workflows/node.js.yml/badge.svg)](https://github.com/dpml/prompt/actions/workflows/node.js.yml)
[![License](https://img.shields.io/npm/l/@dpml/prompt.svg)](https://github.com/dpml/prompt/blob/main/LICENSE)

DPML提示词标记语言处理库，用于生成结构化大语言模型提示词。基于 `@dpml/core` 构建，提供易用的API和灵活的格式选项。

## 功能特点

- **结构化提示词定义**：使用XML标记语言定义提示词结构
- **组件化设计**：将提示词拆分为角色、上下文、思考框架等组件
- **灵活格式控制**：自定义输出格式和样式
- **多语言支持**：内置中英文支持，可扩展其他语言
- **错误处理**：精确的错误提示和位置信息
- **扩展性**：支持自定义标签和处理器

## 安装

```bash
npm install @dpml/prompt
```

## 快速开始

### 基本使用

```javascript
import { generatePrompt } from '@dpml/prompt';

// DPML格式提示词
const dpml = `
<prompt>
  <role>编程助手</role>
  <context>帮助用户解决JavaScript问题</context>
  <thinking>
    理解用户问题背后的真实需求
    考虑多种解决方案
    选择最佳实践
  </thinking>
</prompt>
`;

// 生成最终提示词文本
generatePrompt(dpml).then(promptText => {
  console.log(promptText);
});
```

### 高级使用

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

// 第一步：处理DPML文档
processPrompt(dpml).then(processed => {
  console.log('处理结果:', processed);
  
  // 第二步：转换为最终文本
  const promptText = transformPrompt(processed, {
    format: {
      role: {
        title: '👤 角色',
        wrapper: (content) => `**${content}**`
      },
      context: {
        title: '📝 上下文',
        prefix: '• '
      }
    },
    addLanguageDirective: true
  });
  
  console.log(promptText);
});
```

## DPML语法

DPML使用XML风格的标记语言，主要包括以下标签：

- `<prompt>` - 根标签，可包含lang属性
- `<role>` - 定义AI助手的角色
- `<context>` - 提供上下文信息
- `<thinking>` - 描述思考框架
- `<executing>` - 定义执行步骤
- `<testing>` - 定义质量检查标准
- `<protocol>` - 定义交互协议
- `<custom>` - 自定义内容

示例:

```xml
<prompt lang="zh-CN">
  <role>法律顾问</role>
  <context>
    帮助用户理解法律条款
    提供法律建议（非法律意见）
  </context>
  <thinking>
    考虑法律的基本原则
    参考相关法规和案例
    考虑不同司法管辖区的差异
  </thinking>
  <protocol>
    清晰声明不构成法律意见
    使用准确的法律术语
    提供参考依据
  </protocol>
</prompt>
```

## API参考

### generatePrompt

一站式函数，将DPML文本转换为最终提示文本。

```javascript
async function generatePrompt(
  input: string,
  options?: GeneratePromptOptions
): Promise<string>
```

### processPrompt

处理DPML文本，将其解析为结构化的中间表示。

```javascript
async function processPrompt(
  text: string,
  options?: PromptOptions
): Promise<ProcessedPrompt>
```

### transformPrompt

将处理后的DPML结构转换为最终提示文本。

```javascript
function transformPrompt(
  processedPrompt: ProcessedPrompt,
  options?: TransformOptions
): string
```

## 配置选项

### GeneratePromptOptions

```typescript
interface GeneratePromptOptions {
  validateOnly?: boolean;       // 是否只进行验证
  basePath?: string;            // 基础路径
  strictMode?: boolean;         // 严格模式
  lang?: string;                // 语言设置
  formatTemplates?: FormatTemplates; // 格式模板
  addLanguageDirective?: boolean;    // 添加语言指令
  tagOrder?: string[];          // 标签顺序
}
```

### 格式模板

格式模板控制DPML标签内容如何被格式化为最终文本：

```typescript
interface FormatTemplates {
  [tagName: string]: TagFormatOptions;
}

interface TagFormatOptions {
  title?: string;                       // 标题
  prefix?: string;                      // 内容前缀
  suffix?: string;                      // 内容后缀
  wrapper?: (content: string) => string; // 内容包装函数
}
```

## 示例

查看 [examples](./examples/) 目录获取更多示例代码。

## 错误处理

```javascript
try {
  const promptText = await generatePrompt(dpml);
  console.log(promptText);
} catch (err) {
  console.error('生成提示词失败:', err.message);
  
  // 根据错误类型进行特定处理
  if (err.code?.startsWith('PARSE_')) {
    console.error('DPML语法错误，请检查语法');
  } else if (err.code?.startsWith('VALIDATION_')) {
    console.error('DPML验证错误，请检查标签结构和属性');
  }
}
```

## 文档

详细文档见 [docs/api](./docs/api/) 目录：

- [generatePrompt API](./docs/api/generate-prompt.md)
- [processPrompt API](./docs/api/process-prompt.md)
- [transformPrompt API](./docs/api/transform-prompt.md)
- [配置选项](./docs/api/configuration.md)
- [格式模板](./docs/api/format-templates.md)
- [错误处理](./docs/api/error-handling.md)

## 兼容性

- 支持 Node.js 16.x 及以上版本
- 支持CommonJS和ESM模块系统
- 支持现代浏览器环境

## 许可证

MIT 