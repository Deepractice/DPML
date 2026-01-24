# DPML 核心概念

本目录包含 DPML (Deepractice Prompt Markup Language) 的核心概念文档。

## 文档列表

| 文档 | 描述 |
|------|------|
| [架构概览](./overview.md) | DPML 整体架构、核心组件和数据流 |
| [语法概念](./syntax.md) | Element、Attribute、Content 和保留属性 |
| [Schema 系统](./schema.md) | 文档结构定义和验证规则 |
| [变换器系统](./transformer.md) | 文档转换和自定义变换器 |
| [内置元素](./built-in-elements.md) | resource 等内置元素详解 |

## 阅读顺序

建议按以下顺序阅读：

1. **架构概览** - 了解 DPML 的整体设计和核心组件
2. **语法概念** - 掌握 DPML 的四维语义结构
3. **Schema 系统** - 学习如何定义和验证文档结构
4. **变换器系统** - 了解如何将文档转换为目标格式
5. **内置元素** - 熟悉 DPML 的内置元素

## 快速入门

如果您只是想快速了解 DPML：

```xml
<agent>
  <llm model="gpt-4" temperature="0.7"/>
  <prompt type="markdown">
# 角色
你是一个专业的编程助手。

## 技能
- 代码审查
- 问题解决
- 最佳实践建议
  </prompt>
</agent>
```

然后阅读 [架构概览](./overview.md) 了解如何解析和处理这段 DPML。

## 相关资源

- [DPML 语法规范](/specs/v1.0/zh/protocol/syntax.md)
- [DPML 设计白皮书](/specs/v1.0/zh/whitepaper/index.md)
- [@dpml/core 包文档](/packages/core/README.md)
