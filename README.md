# DPML (Deepractice Prompt Markup Language)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 像写HTML一样写AI：标签语言驱动的AI工程开发新范式

## 简介

想象一下：只需编写几行类似HTML的代码，就能创建一个专业的AI助手。

```dpml
<agent>
  <llm model="gpt-4"></llm>
  <prompt>你是营销专家</prompt>
</agent>
```

这就是DPML的魅力 - 它用简单的标签语言代替了复杂的编程，让任何人都能轻松定制和部署AI应用。

通过直观的声明式语法，DPML显著降低了AI开发门槛，提高开发效率，让AI技术真正走向大众。无需深入理解模型原理，只需描述您想要的结果。

## 核心特点

- **声明式配置**：使用类 XML，HTML 语法声明式定义AI助手行为，无需编写复杂代码
- **低门槛**：无需深入了解AI模型细节和编程知识
- **快速部署**：几行配置即可创建功能完整的对话机器人
- **标准化**：提供统一的Agent配置格式，便于分享和复用

## 快速开始

### 安装

```bash
npm install -g dpml
```

### 创建环境变量文件

在当前目录创建一个`.env`文件，用于存储API密钥和其他敏感信息：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwq-plus
```
示例的配置我们使用了阿里云百炼平台提供的大模型调用 url 和 通义 qwq-plus 大模型。

这些环境变量将被DPML自动读取，可以在配置文件中通过`@agentenv:`前缀引用。

### 创建Agent配置文件

创建一个`travel.dpml`文件：

```dpml
<agent>
  <llm api-type="openai"
  api-key="@agentenv:OPENAI_API_KEY"
  api-url="@agentenv:OPENAI_API_URL"
  model="@agentenv:OPENAI_MODEL"/>

  <prompt>

  ## 角色

  你是一名张家界旅游规划师， 你擅长为客户规划恩施行程。

  </prompt>
  
</agent>
```

### 启动对话

```bash
dpml agent chat travel.xml --env-file .env
```

## 环境变量

DPML支持在配置文件中引用环境变量，避免将敏感信息（如API密钥）直接硬编码：

### 在配置中引用环境变量

```dpml
<agent>
  <llm api-type="openai" api-key="@agentenv:OPENAI_API_KEY" model="gpt-4-turbo">
  </llm>
</agent>
```

### 设置环境变量的方式

1. **命令行传递**:
   ```bash
   dpml agent chat my-assistant.xml --env OPENAI_API_KEY=sk-xxx
   ```

2. **环境变量文件**:
   创建`.env`文件并在其中设置变量：
   ```
   OPENAI_API_KEY=sk-xxx
   ANTHROPIC_API_KEY=sk-yyy
   ```

3. **系统环境变量**:
   ```bash
   # Linux/macOS
   export OPENAI_API_KEY=sk-xxx
   
   # Windows
   set OPENAI_API_KEY=sk-xxx
   ```

## 标签语法参考

DPML使用类似HTML的标签语法定义AI助手的配置：

### 基本结构

```dpml
<agent>
  <!-- Agent配置内容 -->
</agent>
```

### 核心标签

| 标签 | 描述 | 属性 |
|------|------|------|
| `<agent>` | 根标签，包含所有配置 | - |
| `<llm>` | 定义使用的大语言模型 | `api-type`, `api-key`, `api-url`, `model` |
| `<prompt>` | 定义系统提示词 | - |

## 未来规划

### 工具扩展
- 更完善的文档体系
- IDE 插件支持
- DPML Develop Kit 领域开发框架

### 领域开发
- Agent领域 支持 `<tools>` 标签实现智能体工具调用
- Agent领域 支持 `<mcp-servers>` 标签实现智能体 MCP 接入
- MCP领域 支持 通过定义标签开发开发 MCP Servers
- Prompt领域 支持 结构化定义提示词，实现提示词工程化
- Repository领域 实现中央仓库，提供模板复用，共享 DPML 
- Workflow领域 支持 AI 企业级工作流
