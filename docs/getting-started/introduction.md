# DPML 介绍

## 为什么需要 DPML

### 问题陈述

当 AI 系统从简单对话演进为多 Agent 协作时，配置文件、提示词、文档分散在不兼容的格式中：

| 角色       | 需要什么         | 传统方法              | 问题                                |
| ---------- | ---------------- | --------------------- | ----------------------------------- |
| **人类**   | 可观测的系统状态 | 文档与代码分离        | 无法观测 AI 推理过程，文档与实现脱节 |
| **AI**     | 上下文和约束     | Prompt 与配置分离     | 缺乏执行上下文，无法准确转译         |
| **计算机** | 结构化指令       | 配置文件（YAML/JSON） | AI 无法理解，人类难以审计            |

**真实案例**：一个旅行规划 Agent 的配置分散在 3 个文件中：

```yaml
# config.yaml
model: llm-model
temperature: 0.7
```

```markdown
# system_prompt.md
你是专业的旅行规划助手，保持准确和可靠的建议。
```

```markdown
# README.md
本 Agent 使用保守策略，temperature=0.5 (注: 此文档已过时)
```

当产品经理要求"让回答更有创意"，工程师修改 `config.yaml`（temperature 0.7 -> 0.9），但忘记更新 `system_prompt.md` 中的"保持准确"指令，`README.md` 文档早已过时。结果：AI 输出飘忽不定，用户投诉增加，花 3 天定位是 temperature 与 prompt 指令冲突。

**核心矛盾**：这些本质上都是 Prompt（给人类的文档、给 AI 的指令、给计算机的配置），却被迫使用不兼容的格式，导致信息无法同步、调试困难、**缺少统一的信息流转载体**。

## DPML 是什么

**DPML（Deepractice Prompt Markup Language）** 是一种声明式标记语言，用于定义结构化的 AI 提示词和配置。它采用类 XML 语法，将配置、指令和文档统一在单一载体中：

```xml
<prompt role="assistant">
  <context>You are a helpful travel planner</context>
  <instruction>Help users plan their trips</instruction>
</prompt>
```

### 核心洞察

DPML 基于"三方定位理论"：

- **人类：创新意图** - 唯一能主动发起实践并产生真正创新的角色
- **AI：语义转译** - 唯一能同时理解自然语言和高速处理的角色
- **计算机：精确执行** - 唯一能以超高速度和绝对精确度执行指令的角色

> **现代 AI 系统需要三种类型的驱动信号（人类驱动、AI 驱动、计算机驱动），这些信息必须统一为单一流转载体，且流转过程必须全程可观测。**

### 四维语义

DPML 采用类 XML 语法的四个语义维度：

| 维度        | 作用           | 示例                                        |
| ----------- | -------------- | ------------------------------------------- |
| **Tag**     | 概念标识       | `<agent>`, `<prompt>`, `<instruction>`      |
| **Attribute** | 配置参数     | `model="llm-model"`, `role="assistant"`     |
| **Content** | 自然语言空间   | `<prompt>你是一个助手</prompt>`             |
| **Structure** | 层级可视化   | 嵌套的元素表示逻辑关系                      |

这四个维度是必要且充分的最小集合，能同时服务人类、AI 和计算机三方。

## 核心特性

- **声明式语法** - 使用直观的类 XML 标记定义 AI 提示词
- **Schema 验证** - 根据可自定义的模式验证文档结构
- **可扩展** - 创建自定义转换器，将 DPML 转换为任意目标格式
- **类型安全** - 完整的 TypeScript 支持和类型定义
- **内置元素** - `<resource>` 元素用于引用外部资源（支持 ARP/RXL 协议）

## 适用场景

DPML 适用于以下场景：

### 1. 复杂 Prompt 管理

当你的提示词超过数百行，需要模块化和结构化管理时：

```xml
<prompt role="assistant">
  <persona>
    <trait>专业、友好</trait>
    <expertise>旅行规划</expertise>
  </persona>
  <instruction>
    <rule>始终提供准确的信息</rule>
    <rule>考虑用户的预算限制</rule>
  </instruction>
</prompt>
```

### 2. 多 Agent 协作系统

定义 Agent 的行为、工具调用和状态管理：

```xml
<agent name="travel-planner" model="llm-model">
  <context>You are a travel planning assistant</context>
  <tools>
    <tool name="search-flights"/>
    <tool name="book-hotel"/>
  </tools>
</agent>
```

### 3. 配置与 Prompt 统一

将分散的配置和提示词合并到单一文件：

```xml
<agent name="assistant" model="llm-model" temperature="0.7">
  <context>你是专业的旅行规划助手</context>
  <instruction>提供创意且准确的建议</instruction>
</agent>
```

### 4. 可审计的 AI 系统

利用 DPML 的结构化特性，实现 AI 系统的可观测性和可调试性。

## 下一步

- [安装指南](./installation.md) - 安装 DPML 包
- [快速开始](./quick-start.md) - 5 分钟完成你的第一个 DPML 应用
