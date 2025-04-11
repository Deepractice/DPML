# Agent 标签设计规范

## 概述

`<agent>` 标签是 DPML Agent 包中的根标签，用于定义一个完整的AI代理。作为agent领域的顶层载体，它保持简单而灵活，提供基本的结构框架，使其能够轻松嵌入更大的系统中（如工作流）或独立使用。本文档说明 `<agent>` 标签的设计、属性和使用方法。

## 1. 基本结构

`<agent>` 标签作为文档根标签，包含定义代理所需的核心子标签：

```xml
<agent id="example-assistant" version="1.0">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt>
    你是一个有帮助的助手，能够回答用户问题并提供有用的信息。
  </prompt>
</agent>
```

## 2. 属性定义

`<agent>` 标签直接使用 @dpml/core 提供的基础属性，不引入额外的特定属性，以保持简洁性和未来的扩展性：

### 2.1 核心属性

| 属性名 | 描述 | 类型 | 必填 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| `id` | 代理的唯一标识符 | 字符串 | 是 | - | `id="research-assistant"` |
| `version` | 代理定义的版本 | 字符串 | 否 | "1.0" | `version="2.1"` |
| `extends` | 继承其他代理定义 | 字符串 | 否 | - | `extends="./base-agent.dpml"` |

这些属性由 @dpml/core 包提供，agent包不需要重新定义它们。这种设计保持了标签定义的简洁性，同时允许将来根据实际需求添加特定属性。

## 3. 子标签

`<agent>` 标签目前包含以下核心子标签：

| 子标签 | 描述 | 必填 | 可重复 |
|--------|------|------|--------|
| `<llm>` | 大语言模型配置 | 是 | 否 |
| `<prompt>` | 系统提示词定义 | 是 | 否 |

### 3.1 标签顺序

虽然XML解析不强制标签顺序，但为了可读性和一致性，建议按以下顺序排列子标签：

1. `<llm>` - 先定义使用的模型
2. `<prompt>` - 然后定义提示词内容

### 3.2 工作流关系说明

需要特别注意：在整个DPML生态系统中，`<agent>` 标签不包含 `<workflow>` 作为子标签，而是相反：

- `<workflow>` 标签是更高层次的概念，可能包含多个 `<agent>` 标签
- `<agent>` 可以被视为工作流中的一个环节或组件
- 当 `<agent>` 单独使用时，它定义一个独立的代理
- 当 `<agent>` 在工作流中使用时，它作为工作流的一个组件

这种关系反映了agent是工作流中可能的一个环节，而不是agent包含工作流。

### 3.3 未来可能的扩展

随着功能扩展，`<agent>` 标签未来可能支持更多特定功能的子标签，例如：

- `<tools>` - 定义代理可用工具
- `<memory>` - 配置代理记忆系统

## 4. 使用示例

### 4.1 基本代理定义

```xml
<agent id="simple-assistant">
  <llm model="gpt-4-turbo" auth-key-env="OPENAI_API_KEY" />
  
  <prompt>
    你是一个有帮助的助手，请简洁明了地回答用户问题。
  </prompt>
</agent>
```

### 4.2 继承基础代理定义

```xml
<agent 
  id="research-assistant" 
  version="1.2.0" 
  extends="./base-agent.dpml"
>
  <llm 
    api-type="openai" 
    model="gpt-4-turbo" 
    auth-key-env="OPENAI_API_KEY" 
  />
  
  <prompt>
    # 学术研究助手
    
    你是一位专业的学术研究助手，擅长：
    - 文献检索和分析
    - 研究方法指导
    - 学术写作辅助
    - 数据解读
    
    ## 工作准则
    
    - 保持学术严谨性
    - 引用可靠的学术来源
    - 明确区分事实与观点
    - 承认知识的局限性
    
    请以专业、准确、客观的方式回答研究相关问题。
  </prompt>
</agent>
```

### 4.3 在工作流中使用代理(概念示例)

```xml
<!-- 这是一个概念性示例，说明agent与workflow的关系 -->
<workflow id="research-process">
  <step id="initial-research">
    <agent id="research-assistant">
      <llm model="gpt-4-turbo" />
      <prompt>
        你是研究助手，负责初步分析研究问题。
      </prompt>
    </agent>
  </step>
  
  <step id="data-analysis">
    <agent id="data-analyst">
      <llm model="gpt-4-turbo" />
      <prompt>
        你是数据分析师，负责分析实验结果。
      </prompt>
    </agent>
  </step>
</workflow>
```

## 5. 实现注意事项

### 5.1 验证规则

- `id` 属性必须唯一且符合命名规范
- `version` 属性应符合语义化版本格式
- 必须包含 `<llm>` 和 `<prompt>` 子标签
- 验证继承路径是否存在并可访问

### 5.2 解析策略

- 使用XML解析器处理文档结构
- 委托@dpml/core处理继承和基础属性
- 按顺序处理子标签
- 支持错误定位和友好的错误信息

### 5.3 生命周期管理

- 加载代理定义时验证完整性
- 支持动态重新加载代理定义
- 运行时维护代理状态与定义的一致性

## 6. 与其他包的关系

### 6.1 与 @dpml/core 的关系

`<agent>` 标签定义依赖于 `@dpml/core` 包提供的基础设施：

- 使用核心解析器处理XML文档
- 直接使用核心包定义的基础属性（id, version, extends）
- 遵循核心包定义的标签验证规则
- 利用核心包的继承和引用解析机制

### 6.2 与 @dpml/prompt 的关系

`<agent>` 标签与 `@dpml/prompt` 包集成：

- 使用prompt包处理`<prompt>`子标签
- 复用prompt包的标签定义和处理逻辑

### 6.3 与 @dpml/workflow 的关系

`<agent>` 标签可以被 `@dpml/workflow` 包中的标签引用：

- agent作为workflow中的一个组件或步骤
- workflow可以协调多个agent之间的交互

## 总结

`<agent>` 标签作为DPML Agent包的根标签，提供了定义AI代理的入口点。其设计保持简单灵活，仅使用@dpml/core提供的基础属性，不引入不必要的特有属性，使其能够轻松适应各种使用场景。作为领域的顶层标签载体，它专注于自身的核心功能定义，同时可以作为更大系统（如工作流）中的一个组件。这种简洁的设计既满足了当前的基本需求，又为未来的扩展和集成提供了最大的灵活性。 