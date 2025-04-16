# @dpml/prompt 示例

本目录包含了一系列示例，展示如何在各种场景中使用 `@dpml/prompt` 包。这些示例从基础使用到高级应用场景，帮助开发者快速上手并理解如何在实际项目中应用DPML提示标记语言。

## 示例文件说明

### 1. 基础使用 (basic-usage.js)

展示 `@dpml/prompt` 包的基本使用方法，包括：

- 基本的DPML提示生成
- 自定义格式选项
- 错误处理
- 多语言支持

```bash
# 运行基础示例
node basic-usage.js
```

### 2. 高级处理 (advanced-processing.js)

展示如何使用更细粒度的API进行高级处理，包括：

- 使用 `processPrompt` 和 `transformPrompt` 分步处理
- 修改处理后的中间结构
- 实现自定义转换逻辑
- 使用各种处理和转换选项

```bash
# 运行高级处理示例
node advanced-processing.js
```

### 3. 实用案例 (practical-use-cases.js)

展示在实际应用场景中的使用方法，包括：

- 创建可重用的提示模板
- 在Web应用中使用DPML
- 批量处理多个DPML文件
- 基于用户输入的动态提示生成

```bash
# 运行实用案例示例
node practical-use-cases.js
```

## 示例运行说明

每个示例文件都可以单独运行，或者按需导入其中的特定函数：

```javascript
// 单独运行文件
node basic-usage.js

// 或者在其他模块中导入特定功能
const { customFormatExample } = require('./basic-usage');
customFormatExample().then(() => console.log('示例完成'));
```

## 文件结构

```
examples/
├── README.md                   # 本文件
├── basic-usage.js              # 基础使用示例
├── advanced-processing.js      # 高级处理示例
└── practical-use-cases.js      # 实用案例示例
```

## 依赖项

这些示例依赖于：

- `@dpml/prompt` 包
- Node.js (v16+)

## 示例模式

每个示例文件都遵循以下模式：

1. 一组独立的示例函数，每个演示一个特定功能
2. 一个 `runAllExamples` 函数，按顺序运行所有示例
3. 文件可以作为模块导入或直接执行

## 进一步学习

完成这些示例后，建议查看：

- API文档 (`/packages/prompt/docs/api/`)
- 格式模板文档 (`/packages/prompt/docs/api/format-templates.md`)
- 错误处理文档 (`/packages/prompt/docs/api/error-handling.md`)
