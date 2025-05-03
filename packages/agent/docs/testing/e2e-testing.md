# DPML Agent 端到端测试配置指南

本文档说明如何配置和使用 DPML Agent 的端到端测试。

## 测试模式

DPML Agent 的端到端测试支持两种模式：

1. **模拟模式**：使用模拟的 LLM 客户端，不需要真实的 API 密钥
2. **真实 API 模式**：连接到真实的 LLM 服务（如 OpenAI、Anthropic 等）

系统会自动检测环境变量，决定使用哪种模式。如果检测到有效的 API 配置，将使用真实 API；否则将使用模拟。

## 环境变量配置

### 步骤 1: 创建环境变量文件

在 `packages/agent` 目录下，已经有一个 `.env.example` 文件作为模板。复制该文件并重命名为 `.env`：

```bash
cd packages/agent
cp .env.example .env
```

### 步骤 2: 配置 API 密钥

编辑 `.env` 文件，根据你要测试的 LLM 服务配置相应的环境变量：

```
# OpenAI API配置
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# Anthropic API配置
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
ANTHROPIC_MODEL=claude-3

# 日志配置
LOG_LEVEL=info

# 测试配置
TEST_TIMEOUT=10000
```

### 步骤 3: 运行测试

配置完成后，运行端到端测试：

```bash
cd packages/agent
pnpm test:e2e
```

## 自动模式切换

端到端测试文件会自动检测环境变量是否有效：

- 如果检测到有效的 API 配置，将会使用真实 API
- 如果没有检测到有效配置，将自动切换到模拟模式
- 在控制台中会显示当前使用的测试模式

## 扩展支持的 LLM 服务

如需支持更多 LLM 服务的自动检测，可以修改 `packages/agent/src/__tests__/e2e/env-helper.ts` 文件，在 `isLLMConfigValid` 和 `getLLMConfig` 函数中添加相应的处理逻辑。

## 注意事项

1. **API 密钥安全**：
   - 永远不要提交包含真实 API 密钥的 `.env` 文件到版本控制系统
   - `.env` 文件已经被添加到 `.gitignore`，确保不会意外提交
   
2. **费用控制**：
   - 使用真实 API 进行测试会产生 API 调用费用
   - 考虑设置 API 使用限额，避免意外产生过高费用

3. **CI/CD 配置**：
   - 在 CI/CD 环境中，可以通过环境变量或秘密配置提供 API 密钥
   - 对于公开的 PR，建议默认使用模拟模式，避免泄露 API 密钥 