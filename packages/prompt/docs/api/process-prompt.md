# processPrompt API

`processPrompt` 函数用于处理DPML文本，将其解析为结构化的中间表示（ProcessedPrompt对象）。这个函数通常作为DPML处理流程的第一步，之后可以使用 [`transformPrompt`](./transform-prompt.md) 将结果转换为最终文本。

## 函数签名

```typescript
async function processPrompt(
  text: string,
  options?: PromptOptions
): Promise<ProcessedPrompt>;
```

### 参数

| 参数名    | 类型            | 描述                     |
| --------- | --------------- | ------------------------ |
| `text`    | `string`        | DPML文本内容或者文件路径 |
| `options` | `PromptOptions` | 可选配置选项             |

### 返回值

返回 `Promise<ProcessedPrompt>`，解析为处理后的DPML结构。

## ProcessedPrompt 结构

`ProcessedPrompt` 是DPML文档处理后的中间表示，包含以下属性：

```typescript
interface ProcessedPrompt {
  // 元数据
  metadata: {
    id?: string; // 提示ID
    version?: string; // 版本
    lang?: string; // 语言
    extends?: string; // 继承源
    [key: string]: any; // 其他元数据
  };

  // 标签内容映射
  tags: {
    [tagName: string]: {
      content?: string; // 标签内容
      attributes?: Record<string, any>; // 标签属性
      metadata?: Record<string, any>; // 标签元数据
    };
  };

  // 原始文档
  rawDocument?: any;
}
```

## 选项 (PromptOptions)

| 选项名         | 类型                  | 默认值          | 描述                           |
| -------------- | --------------------- | --------------- | ------------------------------ |
| `mode`         | `'strict' \| 'loose'` | `'loose'`       | 解析模式，strict会更严格地验证 |
| `validateOnly` | `boolean`             | `false`         | 是否只进行验证而不处理内容     |
| `basePath`     | `string`              | `process.cwd()` | 解析相对路径引用的基础路径     |
| `lang`         | `string`              | 文档中的设置    | 语言设置，覆盖文档中的lang属性 |

## 示例

### 基本使用

```javascript
import { processPrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>金融顾问</role>
  <context>帮助用户分析投资组合</context>
  <thinking>
    分析用户的风险承受能力
    考虑市场行情和经济状况
    提供平衡风险和收益的建议
  </thinking>
</prompt>
`;

processPrompt(dpml).then(processed => {
  console.log('处理结果:', processed);
  console.log('角色内容:', processed.tags.role.content);
  console.log('思考框架:', processed.tags.thinking.content);
});
```

### 带选项使用

```javascript
import { processPrompt } from '@dpml/prompt';

const dpml = `
<prompt lang="en">
  <role>Technical Writer</role>
  <context>Help users create clear documentation</context>
</prompt>
`;

processPrompt(dpml, {
  mode: 'strict',
  lang: 'zh-CN', // 覆盖文档中的lang属性
}).then(processed => {
  console.log('处理结果:', processed);
  console.log('语言设置:', processed.metadata.lang); // 输出: 'zh-CN'
});
```

### 处理文件

```javascript
import { processPrompt } from '@dpml/prompt';

// 如果输入是文件路径，会自动读取文件内容
processPrompt('./prompts/technical-writer.dpml', {
  basePath: './templates',
}).then(processed => {
  console.log('处理结果:', processed);
});
```

### 仅验证模式

```javascript
import { processPrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>法律顾问</role>
  <context>提供法律建议</context>
</prompt>
`;

processPrompt(dpml, {
  validateOnly: true,
})
  .then(() => {
    console.log('DPML验证通过');
  })
  .catch(err => {
    console.error('DPML验证失败:', err.message);
  });
```

## 错误处理

`processPrompt` 函数可能抛出以下类型的错误：

- 语法错误：DPML文本解析失败
- 验证错误：标签结构或属性不符合规定
- 文件错误：无法读取指定的文件
- 处理错误：处理过程中的其他错误

建议使用 try-catch 或 Promise 的 catch 方法捕获这些错误：

```javascript
processPrompt(dpml)
  .then(processed => {
    console.log('处理成功:', processed);
  })
  .catch(err => {
    console.error('处理失败:', err.message);
  });
```

## 相关API

- [generatePrompt](./generate-prompt.md) - 一站式DPML处理
- [transformPrompt](./transform-prompt.md) - 处理结果转换
- [配置选项](./configuration.md) - 详细配置说明
