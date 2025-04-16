# DPML Agent 示例

本目录包含了使用 `@dpml/agent` 包创建和使用智能代理的示例。

## 目录结构

- `basic/` - 基础代理示例
  - `assistant.dpml` - 基本助手代理的DPML定义
  - `simple-agent.ts` - 使用DPML文件创建和使用代理的示例
  - `stream-agent.ts` - 使用流式API的示例
  - `config-agent.ts` - 使用配置对象创建代理的示例

## 运行前准备

在运行这些示例前，请确保：

1. 已安装所有依赖：

```bash
pnpm install
```

2. 设置必要的环境变量，例如API密钥：

```bash
# Unix/Linux/macOS
export OPENAI_API_KEY=你的OpenAI密钥

# Windows
set OPENAI_API_KEY=你的OpenAI密钥
```

## 运行示例

使用pnpm运行这些示例：

```bash
# 运行基本代理示例
pnpm ts-node examples/agent/basic/simple-agent.ts

# 运行流式API示例
pnpm ts-node examples/agent/basic/stream-agent.ts

# 运行配置对象示例
pnpm ts-node examples/agent/basic/config-agent.ts
```

## 示例说明

1. **simple-agent.ts** - 展示如何从DPML文件创建代理，并使用该代理进行基本的对话。

2. **stream-agent.ts** - 展示如何使用流式API获取实时响应，适用于需要逐步显示内容的场景。

3. **config-agent.ts** - 展示如何直接使用配置对象创建代理，无需预先定义DPML文件。

## API密钥注意事项

这些示例使用了环境变量中的API密钥。请确保不要在代码中硬编码你的API密钥，而是通过环境变量或其他安全方式提供。

## 高级用例

更多高级用例，请参考：

- 官方文档：[链接到官方文档]
- API参考：[链接到API参考]
