# transformPrompt API

`transformPrompt` 函数用于将经过处理的DPML结构（ProcessedPrompt对象）转换为最终提示文本。这个函数通常作为DPML处理流程的第二步，在 [`processPrompt`](./process-prompt.md) 之后使用。

## 函数签名

```typescript
function transformPrompt(
  processedPrompt: ProcessedPrompt,
  options?: TransformOptions
): string
```

### 参数

| 参数名 | 类型 | 描述 |
|-------|-----|------|
| `processedPrompt` | `ProcessedPrompt` | 已处理的DPML结构，通常是processPrompt的输出 |
| `options` | `TransformOptions` | 可选配置选项 |

### 返回值

返回 `string`，最终生成的提示文本。

## 选项 (TransformOptions)

| 选项名 | 类型 | 默认值 | 描述 |
|-------|-----|-------|------|
| `format` | `FormatOptions` | 默认格式 | 自定义格式模板配置 |
| `addLanguageDirective` | `boolean` | `false` | 是否在输出末尾添加语言指令 |
| `tagOrder` | `string[]` | 默认顺序 | 自定义标签输出顺序 |

## 格式选项 (FormatOptions)

`format` 选项允许自定义各标签的格式化方式：

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

默认格式模板如下：

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

## 示例

### 基本使用

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>医疗顾问</role>
  <context>帮助用户理解健康数据</context>
  <thinking>
    检查数据的完整性和准确性
    应用医学知识理解数据
    提供清晰易懂的解释
  </thinking>
</prompt>
`;

processPrompt(dpml).then(processed => {
  // 将处理后的结构转换为文本
  const promptText = transformPrompt(processed);
  console.log(promptText);
});
```

### 自定义格式

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>客服代表</role>
  <context>帮助解决产品问题</context>
  <protocol>使用礼貌友好的语气</protocol>
</prompt>
`;

processPrompt(dpml).then(processed => {
  // 使用自定义格式
  const promptText = transformPrompt(processed, {
    format: {
      role: {
        title: '💼 职责',
        wrapper: (content) => `【${content}】`
      },
      context: {
        title: '📋 工作内容',
        prefix: '• ',
      },
      protocol: {
        title: '🤝 沟通方式',
        prefix: '> ',
      }
    }
  });
  
  console.log(promptText);
  // 输出:
  // 💼 职责
  // 【客服代表】
  // 
  // 📋 工作内容
  // • 帮助解决产品问题
  // 
  // 🤝 沟通方式
  // > 使用礼貌友好的语气
});
```

### 自定义标签顺序

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>销售代表</role>
  <context>帮助客户找到合适的产品</context>
  <thinking>分析客户需求，提供最佳匹配</thinking>
  <protocol>保持专业且有说服力</protocol>
</prompt>
`;

processPrompt(dpml).then(processed => {
  // 自定义标签输出顺序
  const promptText = transformPrompt(processed, {
    tagOrder: ['protocol', 'role', 'context', 'thinking']
  });
  
  console.log(promptText);
  // 输出会按照指定的顺序排列标签内容
});
```

### 添加语言指令

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

const dpml = `
<prompt lang="zh-CN">
  <role>翻译</role>
  <context>将英文文本翻译成中文</context>
</prompt>
`;

processPrompt(dpml).then(processed => {
  // 添加语言指令
  const promptText = transformPrompt(processed, {
    addLanguageDirective: true
  });
  
  console.log(promptText);
  // 输出末尾会添加：请用中文回答
});
```

## 完整工作流示例

下面是一个完整的处理和转换工作流示例：

```javascript
import { processPrompt, transformPrompt } from '@dpml/prompt';

async function generateCustomPrompt(dpmlText) {
  try {
    // 第一步：处理DPML
    const processed = await processPrompt(dpmlText);
    
    // 可以在这里检查或修改处理后的结构
    if (!processed.tags.role) {
      throw new Error('提示必须包含角色标签');
    }
    
    // 添加额外的元数据
    processed.metadata.generatedAt = new Date().toISOString();
    
    // 第二步：转换为最终文本
    const promptText = transformPrompt(processed, {
      format: {
        role: { title: '## 角色定义' },
        context: { title: '## 工作上下文' }
      },
      addLanguageDirective: processed.metadata.lang === 'zh-CN'
    });
    
    return promptText;
  } catch (err) {
    console.error('生成失败:', err.message);
    throw err;
  }
}
```

## 相关API

- [generatePrompt](./generate-prompt.md) - 一站式DPML处理
- [processPrompt](./process-prompt.md) - DPML文本处理
- [配置选项](./configuration.md) - 详细配置说明 