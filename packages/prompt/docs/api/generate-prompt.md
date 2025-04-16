# generatePrompt API

`generatePrompt` 函数是 `@dpml/prompt` 包的主要入口点，提供一站式服务将DPML文本或文件路径转换为最终提示文本。

## 函数签名

```typescript
async function generatePrompt(
  input: string,
  options?: GeneratePromptOptions
): Promise<string>;
```

### 参数

| 参数名    | 类型                    | 描述                     |
| --------- | ----------------------- | ------------------------ |
| `input`   | `string`                | DPML文本内容或者文件路径 |
| `options` | `GeneratePromptOptions` | 可选配置选项             |

### 返回值

返回 `Promise<string>`，解析为最终生成的提示文本。

## 选项 (GeneratePromptOptions)

`GeneratePromptOptions` 接口继承自 `PromptTransformerOptions`，包含以下属性：

| 选项名                 | 类型              | 默认值          | 描述                                             |
| ---------------------- | ----------------- | --------------- | ------------------------------------------------ |
| `validateOnly`         | `boolean`         | `false`         | 是否只进行验证而不生成输出                       |
| `basePath`             | `string`          | `process.cwd()` | 解析相对路径引用的基础路径                       |
| `strictMode`           | `boolean`         | `false`         | 是否使用严格模式解析，严格模式下会对错误更加敏感 |
| `lang`                 | `string`          | `'en'`          | 提示的语言设置，覆盖文档中的lang属性             |
| `formatTemplates`      | `FormatTemplates` | 默认格式        | 自定义格式模板配置                               |
| `addLanguageDirective` | `boolean`         | `false`         | 是否在输出末尾添加语言指令                       |
| `tagOrder`             | `string[]`        | 默认顺序        | 自定义标签输出顺序                               |

## 示例

### 基本使用

```javascript
import { generatePrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>数据分析师</role>
  <context>帮助用户分析销售数据</context>
  <thinking>
    先理解用户的数据结构
    分析关键指标趋势
    提供actionable的洞察
  </thinking>
</prompt>
`;

generatePrompt(dpml).then(promptText => {
  console.log(promptText);
});
```

### 带选项使用

```javascript
import { generatePrompt } from '@dpml/prompt';

const dpml = `
<prompt lang="zh-CN">
  <role>程序员</role>
  <context>帮助用户解决TypeScript问题</context>
</prompt>
`;

generatePrompt(dpml, {
  strictMode: true,
  formatTemplates: {
    role: {
      title: '👤 角色',
    },
    context: {
      title: '📝 上下文',
    },
  },
}).then(promptText => {
  console.log(promptText);
  // 输出:
  // 👤 角色
  // 程序员
  //
  // 📝 上下文
  // 帮助用户解决TypeScript问题
});
```

### 处理文件

```javascript
import { generatePrompt } from '@dpml/prompt';

// 如果输入是文件路径，会自动读取文件内容
generatePrompt('./prompts/typescript-helper.dpml', {
  basePath: './templates',
}).then(promptText => {
  console.log(promptText);
});
```

### 仅验证模式

```javascript
import { generatePrompt } from '@dpml/prompt';

const dpml = `
<prompt>
  <role>SQL专家</role>
</prompt>
`;

generatePrompt(dpml, {
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

`generatePrompt` 函数可能抛出以下类型的错误：

- 语法错误：DPML文本解析失败
- 验证错误：标签结构或属性不符合规定
- 文件错误：无法读取指定的文件
- 处理错误：处理过程中的其他错误

建议使用 try-catch 或 Promise 的 catch 方法捕获这些错误：

```javascript
generatePrompt(invalidDpml)
  .then(promptText => {
    console.log('生成成功:', promptText);
  })
  .catch(err => {
    console.error('生成失败:', err.message);
    // 可以检查err.code来获取错误类型
  });
```

## 相关API

- [processPrompt](./process-prompt.md) - DPML文本处理
- [transformPrompt](./transform-prompt.md) - DPML结构转换
- [配置选项](./configuration.md) - 详细配置说明
