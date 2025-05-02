# DPML Agent 设计需求文档

## 设计原则

DPML Agent 包的设计遵循以下核心原则：

1. **职责单一**：每个标签和组件应只负责一个明确的功能
2. **约定大于配置**：提供合理默认值，最小化必要配置
3. **奥卡姆剃刀**：不引入不必要的复杂性，保持设计简洁

## 基本标签结构

Agent 包将提供以下核心标签结构：

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

## 标签详细说明

### `<agent>`

顶层标签，代表一个智能体。保持简洁，不添加额外属性。

### `<llm>`

负责配置语言模型连接，属性包括：

- `api-type`：API提供商（如"openai"、"anthropic"）
- `api-url`：API端点URL
- `api-key`：访问密钥
- `model`：使用的模型名称（如"gpt-4-turbo"）

### `<prompt>`

定义系统提示词，默认为系统提示词类型。标签内容直接作为提示词文本。无需type属性，简化配置。

### `<experimental>`

包含实验性功能，隔离非稳定API，减少对核心功能的影响。

### `<tools>`

在`<experimental>`标签下，声明Agent可用的工具：

- 每个工具通过`<tool>`标签定义
- 必要属性：`name`（工具名称）和`description`（工具描述）

## 使用方式

### 基本使用流程

1. **创建DPML文档**：定义Agent配置

```xml
<agent>
  <llm api-type="openai" api-url="https://api.openai.com/v1" api-key="YOUR_API_KEY" model="gpt-4-turbo">
  </llm>
  
  <prompt>
    你是一个帮助用户编写代码的助手，专长是JavaScript和TypeScript。
  </prompt>
</agent>
```

2. **加载并使用Agent**：

```typescript
import { AgentRunner } from '@dpml/agent';

// 加载DPML文档
const dpmlContent = fs.readFileSync('my-agent.xml', 'utf-8');
const agent = await AgentRunner.fromDPML(dpmlContent);

// 发送消息并获取响应
const response = await agent.sendMessage("如何在JavaScript中实现深拷贝？");
console.log(response);
```

### 命令行使用

DPML Agent包提供了简洁的命令行界面，方便用户快速验证和使用Agent。

#### 验证Agent配置

使用`validate`命令验证DPML配置文件的正确性：

```bash
dpml agent validate <file-path>
```

**参数说明**：
- `<file-path>`: Agent配置文件路径

**功能**：
- 验证XML语法
- 检查必要标签和属性是否存在
- 提供清晰的错误信息和修复建议

**使用示例**：
```bash
$ dpml agent validate my-assistant.xml
✓ XML语法有效
✓ 必要标签和属性存在
✓ 配置有效
```

#### 交互式对话

使用`chat`命令启动与Agent的交互式对话：

```bash
dpml agent chat <file-path> [--env <KEY=VALUE>...] [--env-file <path>]
```

**参数说明**：
- `<file-path>`: Agent配置文件路径
- `--env`: 可选，指定环境变量，可多次使用（例如 `--env OPENAI_API_KEY=sk-xxx`）
- `--env-file`: 可选，指定包含环境变量的文件路径（例如 `--env-file .env`）

**功能**：
- 加载并初始化Agent
- 提供交互式命令行界面
- 支持多轮对话
- 支持基本的命令行控制

**使用示例**：
```bash
$ dpml agent chat my-assistant.xml --env OPENAI_API_KEY=sk-xxx

DPML Agent Chat
加载Agent配置: my-assistant.xml

你好，我是AI助手。有什么我可以帮助你的？
> 你能解释一下什么是DPML吗？

DPML (Deepractice Prompt Markup Language) 是一种专为AI提示词工程设计的声明式标记语言...

> 谢谢，再见
再见！如果有其他问题，随时回来咨询。

会话已结束。
```

使用环境变量文件：
```bash
$ cat .env
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx

$ dpml agent chat my-assistant.xml --env-file .env
```

### 使用场景示例

#### 1. 创建客服助手

```xml
<agent>
  <llm api-type="openai" model="gpt-3.5-turbo">
  </llm>
  
  <prompt>
    你是一个专业的客服助手，负责回答用户关于我们产品的问题。
    产品信息：我们提供基于AI的文档自动化解决方案。
    定价：基础版每月99美元，专业版每月199美元，企业版需要联系销售。
    请用友好专业的语气回答问题。
  </prompt>
</agent>
```

#### 2. 创建带工具的研究助手

```xml
<agent>
  <llm api-type="anthropic" model="claude-3-opus">
  </llm>
  
  <prompt>
    你是一个学术研究助手，帮助研究人员查找和总结相关文献。
    请提供全面、客观的信息，并注明信息来源。
  </prompt>
  
  <experimental>
    <tools>
      <tool name="search" description="搜索学术文献" />
      <tool name="summarize" description="总结长文本" />
    </tools>
  </experimental>
</agent>
```

## 第一阶段功能范围

第一阶段将提供以下功能：

1. **基本Agent配置**：通过DPML快速定义Agent
2. **LLM集成**：支持连接主流LLM服务
3. **提示词管理**：定义和使用系统提示词
4. **工具支持**：使用预定义和自定义工具扩展Agent能力
5. **简单交互API**：通过编程接口与Agent交互
6. **命令行工具**：提供基本的验证和交互式对话功能

## 未来扩展方向

未来版本计划支持：

1. **记忆系统**：管理对话历史和状态
2. **工作流定义**：实现ReAct等决策流程
3. **高级提示词管理**：支持模板和条件逻辑
4. **多Agent协作**：定义多个Agent之间的交互
5. **高级命令行功能**：批处理模式、输出格式化、会话管理等 