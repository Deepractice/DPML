---
layout: home

hero:
  name: DPML
  text: Deepractice提示词标记语言
  tagline: 像写HTML一样定义AI应用，声明式标记语言让AI开发变得简单直观
  image:
    src: /logo.png
    alt: DPML
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quickstart
    - theme: alt
      text: 查看GitHub
      link: https://github.com/Deepractice/DPML

features:
  - icon: 📝
    title: 声明式语法
    details: 使用类XML/HTML标签定义AI行为，无需编写复杂代码

  - icon: 🎯
    title: 低门槛
    details: 5分钟上手，无需深入了解AI模型内部原理

  - icon: 🚀
    title: 多领域支持
    details: Agent、Task、Role、Workflow - 一种语言覆盖所有AI场景

  - icon: 🔌
    title: 可扩展
    details: 插件系统和领域扩展机制，满足定制化需求

  - icon: 🛠️
    title: 完整工具链
    details: CLI工具、VSCode插件、在线编辑器 - 应有尽有

  - icon: 🌐
    title: 标准化
    details: RFC风格规范，确保一致性和互操作性
---

## 快速示例

几行代码创建一个AI旅游助手：

\`\`\`xml
<agent>
  <llm model="gpt-4" api-key="@env:OPENAI_API_KEY"/>
  <prompt>
    你是一名张家界旅游规划师，擅长为客户规划张家界行程。
  </prompt>
</agent>
\`\`\`

立即运行：

\`\`\`bash
dpml agent chat travel.dpml
\`\`\`

## 你可以做什么

### 🤖 创建AI Agent
用简单的标记语言定义和运行对话式AI助手。**现已可用！**

### 📋 定义任务（即将推出）
使用状态机原理创建可验证的AI任务。

### 🎭 构建角色（即将推出）
结构化定义AI人格和知识能力。

## 为什么选择DPML？

传统AI开发需要深入理解模型API、提示词工程和复杂代码。DPML改变这一切：

- **简单**：写标签而不是代码
- **标准**：一种格式适用所有AI任务
- **可分享**：易于分发和复用
- **可维护**：结构清晰，容易理解

## 立即开始

\`\`\`bash
# 安装DPML CLI
npm install -g dpml

# 创建你的第一个Agent
dpml init my-agent

# 开始对话
dpml agent chat my-agent.dpml
\`\`\`

[阅读完整指南 →](/zh/guide/quickstart)
