# @dpml/prompt API 文档

本文档提供了 `@dpml/prompt` 包的API参考。这个包实现了DPML提示标记语言的处理与转换功能，使开发者能够通过结构化的方式定义、处理和转换提示词。

## 核心API

`@dpml/prompt` 包暴露了三个主要API函数：

| 函数名 | 描述 |
|-------|------|
| [`generatePrompt`](./generate-prompt.md) | 一站式函数，将DPML文本转换为最终提示文本 |
| [`processPrompt`](./process-prompt.md) | 处理DPML文本，解析为结构化的中间表示 |
| [`transformPrompt`](./transform-prompt.md) | 将处理后的DPML结构转换为最终提示文本 |

## 快速开始

### 安装

```bash
npm install @dpml/prompt
```

### 基本使用

```javascript
import { generatePrompt } from '@dpml/prompt';

// DPML格式提示词
const dpml = `
<prompt>
  <role>专业助手</role>
  <context>帮助用户解决编程问题</context>
</prompt>
`;

// 生成最终提示词文本
generatePrompt(dpml).then(promptText => {
  console.log(promptText);
  // 输出:
  // # 角色
  // 专业助手
  // 
  // # 上下文
  // 帮助用户解决编程问题
});
```

## 深入理解

如果需要更细粒度的控制，可以分别使用 `processPrompt` 和 `transformPrompt` 函数：

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>专业助手</role>
  <context>帮助用户解决编程问题</context>
</prompt>
`;

// 第一步：处理DPML
processPrompt(dpml).then(processed => {
  console.log('处理结果:', processed);
  
  // 第二步：转换为最终文本
  const promptText = transformPrompt(processed);
  console.log('最终提示词:', promptText);
});
```

## 更多文档

- [generatePrompt API](./generate-prompt.md)
- [processPrompt API](./process-prompt.md)
- [transformPrompt API](./transform-prompt.md)
- [配置选项](./configuration.md)
- [格式模板](./format-templates.md)
- [错误处理](./error-handling.md)

## 示例

查看 [示例目录](../../examples/) 获取更多使用场景和示例代码。 