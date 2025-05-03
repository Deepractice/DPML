# DPML Agent

DPML Agent包提供了使用DPML构建和运行智能体的工具和API。

## 安装

```bash
npm install @dpml/agent
```

## 使用方法

### 通过API使用

```typescript
import { AgentRunner } from '@dpml/agent';

// 加载DPML文档
const dpmlContent = fs.readFileSync('my-agent.xml', 'utf-8');
const agent = await AgentRunner.fromDPML(dpmlContent);

// 发送消息并获取响应
const response = await agent.sendMessage("如何在JavaScript中实现深拷贝？");
console.log(response);
```

### 通过命令行使用

验证Agent配置:

```bash
dpml agent validate my-agent.xml
```

与Agent交互:

```bash
dpml agent chat my-agent.xml --env OPENAI_API_KEY=sk-xxx
```

## 设计原则

DPML Agent包的设计遵循以下核心原则：

1. **职责单一**：每个标签和组件只负责一个明确的功能
2. **约定大于配置**：提供合理默认值，最小化必要配置
3. **奥卡姆剃刀**：不引入不必要的复杂性，保持设计简洁

## DPML语法示例

```xml
<agent>
  <!-- LLM配置 -->
  <llm api-type="openai" api-url="https://api.openai.com/v1" api-key="..." model="gpt-4-turbo">
  </llm>
  
  <!-- 系统提示词 -->
  <prompt>
    你是一个专业的助手，请帮助用户解决问题。
  </prompt>
  
  <!-- 实验性功能 -->
  <experimental>
    <tools>
      <tool name="search" description="搜索网络信息" />
      <tool name="calculator" description="进行数学计算" />
    </tools>
  </experimental>
</agent>
```

## 功能列表

- 基本Agent配置
- LLM集成
- 提示词管理
- 工具支持
- 简单交互API
- 命令行工具

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```
