# 介绍

DPML (Deep Prompt Markup Language) 是一种声明式标记语言，用于定义AI应用。它使用类XML/HTML的语法，让AI开发变得人人可及。

## 什么是DPML？

把DPML想象成AI的HTML。就像HTML让你用`<div>`和`<p>`等标签定义网页一样，DPML让你用`<agent>`和`<task>`等标签定义AI应用。

\`\`\`xml
<!-- 这是一个完整的AI助手定义 -->
<agent>
  <llm model="gpt-4"/>
  <prompt>你是一个有用的旅游规划师。</prompt>
</agent>
\`\`\`

## 核心概念

### 声明式，而非命令式

与其编写过程式代码：

\`\`\`javascript
// 传统方式
const agent = new Agent({
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  systemPrompt: '你是一个有用的助手'
})
agent.chat('你好')
\`\`\`

你只需声明你想要什么：

\`\`\`xml
<!-- DPML方式 -->
<agent>
  <llm model="gpt-4" api-key="@env:OPENAI_API_KEY"/>
  <prompt>你是一个有用的助手</prompt>
</agent>
\`\`\`

### 多领域架构

DPML不仅仅用于Agent。它支持多个领域：

- **Agent领域**：定义和运行AI助手
- **Task领域**：用状态机定义可验证的AI任务
- **Role领域**：结构化AI角色的知识和人格
- **Workflow领域**：编排复杂的AI工作流（即将推出）

## 为什么使用DPML？

### 1. 降低门槛

无需学习复杂的AI框架或API。如果你会写HTML，就会写DPML。

### 2. 标准化

所有AI场景使用一种一致的格式。分享、复用和协作变得容易。

### 3. 关注点分离

将AI配置与应用代码分离。更新提示词无需修改代码。

### 4. 工具支持

- CLI工具运行DPML文件
- VSCode插件提供语法高亮和自动补全
- 在线编辑器快速实验
- 验证器确保正确性

## 下一步

- [快速开始](/zh/guide/quickstart) - 创建你的第一个DPML应用
- [Agent领域指南](/zh/guide/agent/) - 了解AI代理
- [Task领域指南](/zh/guide/task/) - 了解任务定义
- [示例](/zh/examples/) - 查看DPML实战
