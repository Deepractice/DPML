# @dpml/core 示例

本目录包含 `@dpml/core` 包的示例代码，展示如何使用DPML核心功能进行解析、处理和转换。

## 示例结构

- `basic/` - 基础解析示例
  - `parsing.ts` - 基本解析功能和选项
  - `simple-dpml.xml` - 简单DPML示例文件
  - `README.md` - 基础示例说明

- `custom-tags/` - 自定义标签示例
  - `tag-definition.ts` - 定义和注册自定义标签
  - `custom-validation.ts` - 自定义标签验证逻辑
  - `custom-dpml.xml` - 使用自定义标签的示例文件
  - `README.md` - 自定义标签示例说明

- `processing/` - 文档处理示例
  - `semantic-processing.ts` - 语义处理示例
  - `custom-tag-processor.ts` - 自定义标签处理器
  - `reference-resolver.ts` - 引用解析
  - `sample-dpml.xml` - 示例DPML文件
  - `README.md` - 处理示例说明

- `transformers/` - 转换器示例
  - `markdown-transformer.ts` - 转换到Markdown格式
  - `json-transformer.ts` - 转换到JSON格式
  - `custom-transformer.ts` - 自定义转换器
  - `sample-dpml.xml` - 示例DPML文件
  - `README.md` - 转换器示例说明

- `complete-workflow/` - 完整工作流示例
  - `prompt-processing.ts` - 完整处理流程
  - `error-handling.ts` - 错误处理与恢复
  - `custom-workflow.ts` - 自定义工作流
  - `templates/` - 模板文件目录
  - `README.md` - 完整工作流说明

## 运行示例

确保已安装依赖：

```bash
pnpm install
```

按照各子目录中的README.md指引运行示例：

```bash
# 例如运行基础解析示例
pnpm swc examples/core/basic/parsing.ts

# 运行自定义标签示例
pnpm swc examples/core/custom-tags/tag-definition.ts

# 运行完整工作流示例
pnpm swc examples/core/complete-workflow/prompt-processing.ts
``` 