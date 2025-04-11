# Prompt 标签设计规范

## 概述

`<prompt>` 标签是 DPML Agent 包中的核心标签之一，直接复用了@dpml/prompt包提供的标签，作为系统提示词的定义方式。Agent包不重新定义此标签，而是将其作为集成点，委托给@dpml/prompt包进行处理。标签的所有特性，包括继承机制，均遵循DPML核心规范。

## 1. 基本结构

`<prompt>` 标签是 `<agent>` 标签的直接子标签，作为连接代理与提示词处理系统的桥梁：

```xml
<agent id="assistant">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt>
    你是一个有帮助的助手，能够回答用户问题并提供有用的信息。
  </prompt>
</agent>
```

## 2. 引用与继承

Agent包直接利用@dpml/core提供的标准继承机制，使用统一的`extends`属性：

### 2.1 使用extends引用外部文件

为了便于管理复杂提示词，可以使用DPML标准的`extends`属性引用外部文件：

```xml
<agent id="research-assistant">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt extends="./prompts/complex-assistant.dpml">
    <!-- 可以为空（完全继承引用内容）或添加覆盖内容 -->
  </prompt>
</agent>
```

特性说明：
- 支持相对路径和绝对路径
- 相对路径基于当前文件所在目录计算
- 支持引用特定ID的标签：`extends="./base.dpml#assistant-base"`
- 支持继承覆盖机制，遵循DPML标准继承规则

## 3. 提示词委托处理机制

Agent包不直接处理提示词内容，而是委托给@dpml/prompt包进行处理：

### 3.1 使用内联提示词

当直接在`<prompt>`标签内提供内容时：

```xml
<prompt>
  你是一个有帮助的助手，请简洁明了地回答用户问题。
</prompt>
```

处理流程：
1. 检测到内联内容
2. 如果内容不是DPML格式，包装为最简单的@dpml/prompt格式
3. 调用@dpml/prompt包的API进行处理
4. 获取生成的提示词文本

### 3.2 使用继承引用

当使用`extends`属性引用外部文件时：

```xml
<prompt extends="./prompts/research-assistant.dpml">
  <!-- 可选：添加覆盖或扩展内容 -->
</prompt>
```

处理流程：
1. 委托@dpml/core处理extends属性，加载和合并引用内容
2. 调用@dpml/prompt包的API进行处理
3. 获取生成的提示词文本

## 4. 与@dpml/prompt包的集成

Agent包不重新实现提示词处理逻辑，而是充分利用@dpml/prompt包的能力：

### 4.1 API调用集成

```typescript
// 伪代码示例
import { generatePrompt } from '@dpml/prompt';

async function processAgentPrompt(promptElement: Element): Promise<string> {
  // 标准的DPML处理流程，extends处理已由@dpml/core完成
  let dpmlContent = extractElementContent(promptElement);
  
  // 如果内容不是DPML格式，包装为简单的DPML
  if (dpmlContent && !dpmlContent.trim().startsWith('<prompt')) {
    dpmlContent = `<prompt>${dpmlContent}</prompt>`;
  }
  
  // 委托给@dpml/prompt处理
  return await generatePrompt(dpmlContent);
}
```

### 4.2 能力复用

通过集成，Agent可以直接利用@dpml/prompt包的所有能力：

- 提示词标签解析与处理
- 继承机制（由@dpml/core提供）
- 格式转换
- 多语言支持

## 5. 使用示例

### 5.1 基本集成示例

```xml
<agent id="simple-assistant">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt>
    你是一个有帮助的助手，请简洁明了地回答用户问题。
  </prompt>
</agent>
```

### 5.2 引用复杂提示词

```xml
<agent id="research-assistant">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt extends="./prompts/complex-assistant.dpml">
    <!-- 空内容 - 完全使用被引用文件的内容 -->
  </prompt>
</agent>
```

### 5.3 引用并覆盖部分内容

```xml
<agent id="specialized-assistant">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt extends="./prompts/base-assistant.dpml">
    <!-- 添加或覆盖内容 -->
    你是一个专门研究气候变化的助手，具有科学背景。
  </prompt>
</agent>
```

`complex-assistant.dpml` 可以是符合@dpml/prompt规范的完整提示词：

```xml
<prompt lang="zh-CN">
  <role>学术研究助手</role>
  <context>
    帮助研究人员进行文献检索、数据分析和论文写作
  </context>
  <thinking>
    分析问题的核心要点
    查找最相关的学术资源
    总结关键发现和方法
  </thinking>
  <protocol>
    保持学术严谨
    清晰标注信息来源
    区分事实与观点
  </protocol>
</prompt>
```

## 6. 实现注意事项

### 6.1 包依赖管理

- 确保@dpml/core和@dpml/prompt作为依赖项正确配置
- 处理可能的版本兼容性问题

### 6.2 错误处理

- 优雅处理@dpml/core和@dpml/prompt可能抛出的错误
- 提供明确的错误信息，区分Agent错误、Core错误和Prompt错误

### 6.3 缓存机制

- 考虑缓存处理结果，避免重复处理相同内容
- 特别是对于通过extends引用的外部文件

### 6.4 安全考虑

- 验证引用文件路径，防止目录遍历攻击
- 对处理后的提示词长度进行合理限制

## 7. 未来扩展性

直接使用`<prompt>`标签并复用DPML标准特性的设计有良好的扩展性：

1. 保持与@dpml/prompt包的一致性，随着prompt包的升级自动获得新特性
2. 利用@dpml/core的标准继承机制，确保全系统一致性
3. 不引入不必要的嵌套层级或特有属性，简化用户理解和使用
4. 如果未来确实需要区分多种提示词类型，可以通过上下文位置或标准属性扩展实现

## 总结

`<prompt>` 标签在DPML Agent中直接复用了@dpml/prompt包的标签定义和@dpml/core的基础功能（如继承机制），通过委托机制充分利用这些能力而不重新发明轮子。这种设计既简洁明了，又保持了良好的扩展性，符合关注点分离原则，让Agent包可以专注于代理生命周期管理和LLM交互，同时享受DPML生态系统提供的全部标准功能。 