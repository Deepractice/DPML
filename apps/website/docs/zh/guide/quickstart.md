# 快速开始

5分钟上手DPML。

## 安装

全局安装DPML CLI：

```bash
npm install -g dpml
```

或使用npx（无需安装）：

```bash
npx dpml --version
```

## 你的第一个Agent

### 1. 创建DPML文件

创建一个名为`travel-assistant.dpml`的文件：

```xml
<agent>
  <llm
    api-type="openai"
    api-key="@env:OPENAI_API_KEY"
    api-url="https://api.openai.com/v1"
    model="gpt-4"/>

  <prompt>
## 角色
你是一名张家界旅游规划师，擅长为客户规划张家界行程。

## 技能
- 推荐景点
- 规划行程
- 建议住宿
- 提供旅行建议
  </prompt>
</agent>
```

### 2. 配置环境变量

在同一目录创建`.env`文件：

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. 开始对话

```bash
dpml agent chat travel-assistant.dpml --env-file .env
```

你会看到一个交互式对话界面：

```
🤖 旅游助手已就绪。输入'exit'退出。

你: 你好！我想下个月去张家界。
助手: 好选择！张家界非常美丽...
```

## 理解代码

让我们分解每个部分的作用：

```xml
<agent>
  <!-- LLM配置 -->
  <llm
    api-type="openai"           <!-- 使用哪个LLM提供商 -->
    api-key="@env:OPENAI_API_KEY" <!-- 从环境变量读取API密钥 -->
    model="gpt-4"/>             <!-- 使用哪个模型 -->

  <!-- 系统提示词 -->
  <prompt>
    你是一名旅游规划师...
  </prompt>
</agent>
```

### 环境变量引用

`@env:`前缀告诉DPML从环境变量中读取：

```xml
api-key="@env:OPENAI_API_KEY"
```

这比硬编码敏感信息更安全。

## 下一步

现在你已经有一个运行的Agent，可以尝试：

### 探索其他领域

- [定义任务](/zh/guide/task/) - 创建可验证的AI任务
- [创建角色](/zh/guide/role/) - 结构化AI人格

### 添加更多功能

- [工具调用](/zh/guide/agent/tools) - 让Agent使用外部工具
- [MCP集成](/zh/guide/agent/mcp) - 连接MCP服务器
- [提示词工程](/zh/guide/agent/prompts) - 编写更好的提示词

### 查看更多示例

- [Agent示例](/zh/examples/agent/) - 旅游、客服、编程助手
- [Task示例](/zh/examples/task/) - Monorepo配置、功能开发
- [完整项目](/zh/examples/projects/) - 使用DPML构建的完整应用

## 故障排查

### "命令未找到: dpml"

确保已全局安装：

```bash
npm install -g dpml
```

或使用npx：

```bash
npx dpml agent chat travel-assistant.dpml
```

### "未找到API密钥"

检查你的`.env`文件：

```bash
# 确保文件存在并包含密钥
cat .env
```

### "DPML语法无效"

验证你的DPML文件：

```bash
dpml validate travel-assistant.dpml
```

## 获取帮助

- [完整文档](/zh/guide/) - 完整指南
- [GitHub Issues](https://github.com/Deepractice/DPML/issues) - 报告bug
- [讨论区](https://github.com/Deepractice/DPML/discussions) - 提问
