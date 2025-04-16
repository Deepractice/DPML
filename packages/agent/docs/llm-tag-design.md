# LLM 标签设计规范

## 概述

`<llm>` 标签是 DPML Agent 包中的核心标签之一，用于配置代理与大语言模型的交互方式。本文档详细说明 `<llm>` 标签的设计、属性定义和使用方法。

## 1. 基本结构

`<llm>` 标签是 `<agent>` 标签的直接子标签，负责定义与大语言模型的连接和调用参数。

```xml
<agent id="assistant">
  <llm
    api-type="openai"
    api-url="https://api.openai.com/v1"
    model="gpt-4-turbo"
    key-env="OPENAI_API_KEY"
  />

  <prompt>
    <!-- 系统提示词内容 -->
  </prompt>
</agent>
```

## 2. 属性定义

### 2.1 核心属性（首版实现）

| 属性名     | 描述                    | 类型   | 必填 | 默认值   | 示例                                  |
| ---------- | ----------------------- | ------ | ---- | -------- | ------------------------------------- |
| `api-type` | API规范/协议类型        | 字符串 | 否   | "openai" | `api-type="openai"`                   |
| `api-url`  | API端点URL              | 字符串 | 是   | -        | `api-url="https://api.openai.com/v1"` |
| `model`    | 模型标识符              | 字符串 | 是   | -        | `model="gpt-4-turbo"`                 |
| `key-env`  | 存储API密钥的环境变量名 | 字符串 | 否¹  | -        | `key-env="OPENAI_API_KEY"`            |

¹ 当API需要认证时，此属性为必填。如果使用本地无需认证的模型，可以省略此属性。

### 2.2 属性详细说明

#### `api-type`

指定API规范/协议类型，决定如何构造API请求。

- **可选值**:
  - `"openai"` - 符合OpenAI API规范
  - `"anthropic"` - 符合Anthropic API规范
  - `"custom"` - 自定义API规范

#### `api-url`

指定API的端点URL。这是一个必填属性，明确强调用户对选择具体模型和服务提供商的控制权。

- **常见值**:
  - OpenAI API: `"https://api.openai.com/v1"`
  - Azure OpenAI: `"https://your-resource.openai.azure.com/openai/deployments/your-deployment"`
  - Anthropic: `"https://api.anthropic.com"`
  - 本地服务: `"http://localhost:1234/v1"`

#### `model`

指定要使用的模型标识符，是必填属性。

- **常见值**:
  - OpenAI: `"gpt-4-turbo"`, `"gpt-3.5-turbo"`
  - Anthropic: `"claude-3-opus"`, `"claude-3-sonnet"`
  - 开源模型: `"llama-3-70b"`, `"mistral-7b"` 等

#### `key-env`

指定存储API密钥的环境变量名。系统将从该环境变量获取密钥值。当使用需要认证的API时必填。

## 3. 使用示例

### 3.1 基本使用

```xml
<agent id="simple-assistant">
  <llm
    api-url="https://api.openai.com/v1"
    model="gpt-4-turbo"
    key-env="OPENAI_API_KEY"
  />

  <prompt>
    你是一个有帮助的助手，请简明扼要地回答问题。
  </prompt>
</agent>
```

### 3.2 使用自定义API端点

```xml
<agent id="azure-assistant">
  <llm
    api-type="openai"
    api-url="https://myorg.openai.azure.com/openai/deployments/my-gpt4"
    model="gpt-4"
    key-env="AZURE_OPENAI_KEY"
  />

  <prompt>
    你是一个部署在Azure上的助手。
  </prompt>
</agent>
```

### 3.3 无认证本地模型

```xml
<agent id="local-assistant">
  <llm
    api-type="openai"
    api-url="http://localhost:1234/v1"
    model="llama3"
  />

  <prompt>
    你是一个本地部署的助手。
  </prompt>
</agent>
```

## 4. 未来扩展

为保持良好的扩展性，未来版本可能通过子标签添加更多控制能力：

```xml
<!-- 未来版本示例 - 仅供参考 -->
<agent id="advanced-assistant">
  <llm api-type="openai" api-url="https://api.openai.com/v1" model="gpt-4-turbo">
    <!-- 参数控制 -->
    <parameters>
      <param name="temperature" value="0.7" />
      <param name="max-tokens" value="4000" />
      <param name="top-p" value="0.95" />
    </parameters>

    <!-- 高级认证 - 未来扩展通过子标签实现 -->
    <auth type="oauth">
      <client-id-env>CLIENT_ID</client-id-env>
      <client-secret-env>CLIENT_SECRET</client-secret-env>
      <scope>model.read</scope>
    </auth>

    <!-- 高级控制 -->
    <rate-limit max-requests="60" window="1m" />
    <fallback model="gpt-3.5-turbo" />
  </llm>

  <prompt>...</prompt>
</agent>
```

### 4.1 认证扩展

复杂的认证方式将通过`<auth>`子标签实现，而不是通过属性：

```xml
<llm api-url="https://api.example.com" model="advanced-model">
  <!-- OAuth认证 -->
  <auth type="oauth">
    <client-id-env>CLIENT_ID</client-id-env>
    <client-secret-env>CLIENT_SECRET</client-secret-env>
    <token-url>https://auth.example.com/token</token-url>
    <scope>model.access</scope>
  </auth>
</llm>
```

### 4.2 其他潜在扩展参数

未来版本可能支持的参数包括：

- **温度控制**: `temperature`, `top-p`, `frequency-penalty`, `presence-penalty`
- **输出控制**: `max-tokens`, `stop-sequences`, `seed`, `response-format`
- **高级功能**: `stream`, `tools`, `tool-choice`, `logit-bias`
- **多样性控制**: `n`, `best-of`, `top-k`, `repetition-penalty`

## 5. 实现注意事项

### 5.1 属性值验证

- `api-url` 必须是有效的URL
- `model` 值应检查是否为有效的模型标识符
- `key-env` 应验证环境变量是否存在

### 5.2 错误处理

- 缺少必要属性时提供明确错误信息
- API调用失败时应有适当的错误处理和重试机制
- 环境变量不存在时应提供明确警告

### 5.3 安全考虑

- 认证凭据应只从环境变量或安全存储中获取，避免硬编码
- 记录和错误信息中不应暴露敏感信息
- 支持超时和速率限制以防止资源滥用

## 总结

`<llm>` 标签为DPML Agent提供了连接大语言模型的核心功能。设计保持简洁性的同时，通过必填的`api-url`属性明确强调了用户对选择模型和服务提供商的控制权。认证机制采用简单的环境变量方式，而更复杂的认证需求将在未来通过专门的子标签实现，这样既满足了当前的基本使用场景，又保留了应对复杂需求的扩展能力。
