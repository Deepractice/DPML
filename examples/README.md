# DPML 示例集

本目录包含DPML (Deepractice Prompt Markup Language)的各种使用示例，帮助开发者快速了解和使用DPML框架。

## 目录结构

每个DPML包都有自己的示例子目录：

- `core/` - `@dpml/core`包的示例
  - `basic/` - 基础解析示例
  - `custom-tags/` - 自定义标签示例
  - `processing/` - 文档处理示例
  - `transformers/` - 转换器示例
  - `complete-workflow/` - 完整工作流示例
  
- `prompt/` - `@dpml/prompt`包的示例（待添加）

- `agent/` - `@dpml/agent`包的示例（待添加）

- `workflow/` - `@dpml/workflow`包的示例（待添加）

- `cli/` - `@dpml/cli`包的示例（待添加）

## 运行示例

每个示例目录都包含`README.md`文件，详细说明了示例的用途和运行方法。

要运行示例，请确保已安装依赖：

```bash
pnpm install
```

然后在各示例目录下按照README.md的指引运行示例：

```bash
# 例如运行基础解析示例
ts-node examples/core/basic/parsing.ts
``` 