# 错误处理

`@dpml/prompt` 包提供了全面的错误处理机制，以帮助开发者快速定位和解决问题。本文档详细介绍了可能出现的错误类型以及如何处理这些错误。

## 错误类型

`@dpml/prompt` 包中的错误主要分为以下几类：

| 错误类型 | 错误码前缀    | 描述                         |
| -------- | ------------- | ---------------------------- |
| 解析错误 | `PARSE_`      | DPML文本语法解析过程中的错误 |
| 验证错误 | `VALIDATION_` | DPML标签结构或属性验证错误   |
| 处理错误 | `PROCESSING_` | DPML处理过程中的错误         |
| 转换错误 | `TRANSFORM_`  | DPML转换为提示文本时的错误   |
| 文件错误 | `FILE_`       | 文件读取或写入错误           |
| 引用错误 | `REFERENCE_`  | 标签引用解析错误             |
| 未知错误 | `UNKNOWN_`    | 未分类的其他错误             |

## PromptError 类

所有错误都是通过 `PromptError` 类实例化并抛出的。这个错误类继承自标准 JavaScript `Error`，并提供了以下额外属性：

```typescript
interface PromptErrorOptions {
  code: PromptErrorCode; // 错误代码
  message: string; // 错误消息
  level: ErrorLevel; // 错误级别
  position?: Position; // 错误位置
  cause?: Error; // 原始错误
  suggestions?: string[]; // 错误修复建议
}
```

## 常见错误代码

以下是一些常见的错误代码及其含义：

### 解析错误

- `PARSE_SYNTAX_ERROR` - DPML语法错误
- `PARSE_INVALID_TAG` - 无效的标签名
- `PARSE_UNCLOSED_TAG` - 未闭合的标签

### 验证错误

- `VALIDATION_MISSING_REQUIRED_ATTRIBUTE` - 缺少必需属性
- `VALIDATION_INVALID_ATTRIBUTE_VALUE` - 属性值无效
- `VALIDATION_DISALLOWED_NESTED_TAG` - 不允许的嵌套标签

### 处理错误

- `PROCESSING_TAG_NOT_FOUND` - 找不到指定标签
- `PROCESSING_CIRCULAR_REFERENCE` - 循环引用
- `PROCESSING_MISSING_PROCESSOR` - 缺少处理器

### 文件错误

- `FILE_NOT_FOUND` - 文件未找到
- `FILE_READ_ERROR` - 文件读取错误
- `FILE_WRITE_ERROR` - 文件写入错误

### 引用错误

- `REFERENCE_INVALID_PATH` - 无效的引用路径
- `REFERENCE_BROKEN_LINK` - 引用断链
- `REFERENCE_CYCLE_DETECTED` - 检测到引用循环

## 错误处理最佳实践

### 1. 捕获和处理错误

始终使用 try-catch 或 Promise 的 catch 方法捕获可能的错误：

```javascript
import { generatePrompt } from '@dpml/prompt';

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

或者使用 Promise 链式调用：

```javascript
generatePrompt(dpml)
  .then(promptText => {
    console.log('生成成功:', promptText);
  })
  .catch(err => {
    console.error('生成失败:', err.message);
    // 处理错误
  });
```

### 2. 使用错误代码区分错误类型

错误代码可以帮助你区分不同类型的错误并采取相应的处理措施：

```javascript
try {
  await processPrompt(dpml);
} catch (err) {
  switch (err.code) {
    case 'PARSE_SYNTAX_ERROR':
      console.error('DPML语法错误:', err.message);
      break;
    case 'VALIDATION_MISSING_REQUIRED_ATTRIBUTE':
      console.error('缺少必需属性:', err.message);
      break;
    case 'FILE_NOT_FOUND':
      console.error('文件未找到:', err.message);
      break;
    default:
      console.error('其他错误:', err.message);
  }
}
```

### 3. 利用错误位置信息

解析和验证错误通常会包含错误的准确位置，这可以帮助开发者快速定位问题：

```javascript
try {
  await processPrompt(dpml);
} catch (err) {
  console.error('错误:', err.message);

  if (err.position) {
    console.error(
      `错误位置: 行 ${err.position.start.line}, 列 ${err.position.start.column}`
    );

    // 显示错误上下文
    const lines = dpml.split('\n');
    const errorLine = lines[err.position.start.line - 1];
    console.error('出错的行:', errorLine);
    console.error(' '.repeat(err.position.start.column - 1) + '^');
  }
}
```

### 4. 处理特定的错误场景

#### 处理解析错误

```javascript
try {
  await processPrompt(dpml);
} catch (err) {
  if (err.code?.startsWith('PARSE_')) {
    console.error('DPML解析错误:', err.message);
    if (err.suggestions && err.suggestions.length > 0) {
      console.error('建议修复:', err.suggestions.join('\n'));
    }
  }
}
```

#### 处理文件错误

```javascript
try {
  await generatePrompt('./prompts/my-prompt.dpml');
} catch (err) {
  if (err.code?.startsWith('FILE_')) {
    console.error('文件操作错误:', err.message);
    // 可能需要检查文件路径是否正确，或者文件权限是否足够
  }
}
```

#### 处理验证错误

```javascript
try {
  await processPrompt(dpml, { mode: 'strict' });
} catch (err) {
  if (err.code?.startsWith('VALIDATION_')) {
    console.error('DPML验证错误:', err.message);
    // 可能需要检查标签结构或属性是否符合要求
  }
}
```

## 错误预防

### 1. 使用验证模式

在处理重要的DPML文档前，可以先进行验证：

```javascript
try {
  await processPrompt(dpml, { validateOnly: true });
  console.log('DPML验证通过');
} catch (err) {
  console.error('DPML验证失败:', err.message);
}
```

### 2. 降级处理

对于非关键错误，可以考虑降级处理：

```javascript
try {
  return await generatePrompt(dpml, { strictMode: true });
} catch (err) {
  console.warn('使用严格模式失败，尝试宽松模式:', err.message);
  try {
    // 退回到宽松模式
    return await generatePrompt(dpml, { strictMode: false });
  } catch (fallbackErr) {
    console.error('生成失败:', fallbackErr.message);
    throw fallbackErr;
  }
}
```

### 3. 提供友好的错误信息

在用户界面中显示友好的错误信息：

```javascript
try {
  const promptText = await generatePrompt(dpml);
  showPromptText(promptText);
} catch (err) {
  let userFriendlyMessage = '生成提示词失败';

  if (err.code?.startsWith('PARSE_')) {
    userFriendlyMessage = 'DPML语法错误，请检查您的提示词格式';
  } else if (err.code?.startsWith('VALIDATION_')) {
    userFriendlyMessage = 'DPML格式不符合要求，请检查标签使用';
  } else if (err.code?.startsWith('FILE_')) {
    userFriendlyMessage = '文件访问错误，请检查文件路径';
  }

  showErrorMessage(userFriendlyMessage, err.message);
}
```

## 错误处理与调试技巧

### 1. 日志记录

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

async function generateWithLogging(dpml) {
  try {
    console.log('开始处理DPML...');
    const processed = await processPrompt(dpml);
    console.log('处理成功，开始转换...');
    console.log('处理结果:', JSON.stringify(processed, null, 2));

    const promptText = transformPrompt(processed);
    console.log('转换成功!');
    return promptText;
  } catch (err) {
    console.error('错误:', err.code, err.message);
    if (err.position) {
      console.error('错误位置:', err.position);
    }
    throw err;
  }
}
```

### 2. 错误监控

在生产环境中，可以收集和监控错误：

```javascript
function monitorErrors(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      // 记录错误信息
      recordError({
        code: err.code,
        message: err.message,
        timestamp: new Date(),
        // 其他需要记录的信息
      });

      // 重新抛出错误，以便调用者也能处理
      throw err;
    }
  };
}

// 使用监控包装函数
const safeGeneratePrompt = monitorErrors(generatePrompt);
```

## 相关API

- [generatePrompt](./generate-prompt.md) - 一站式DPML处理
- [processPrompt](./process-prompt.md) - DPML文本处理
- [transformPrompt](./transform-prompt.md) - 处理结果转换
