# DPML Project

## 简介

DPML (Deepractice Prompt Markup Language) 是一种专为AI提示词工程设计的声明式标记语言，作为人类意图和AI处理之间的标准化中间表示。

DPML 基于"意图交互模式"理念设计，旨在实现三方高效协作：
- **人类**：专注于创新和高层次意图表达，关注"做什么"而非"怎么做"
- **AI**：理解意图并转换为结构化指令，作为抽象与具象的桥梁
- **计算机**：高效执行具体任务，实现最终目标

通过声明式XML语法，DPML降低技术门槛，提高开发效率，支持各行业创建自己的领域特定语言(DSL)。

## API Documentation

This documentation is automatically generated using TypeDoc. It provides detailed API references for the DPML packages.

## Packages

- **@dpml/core** - 提供解析、验证、转换和执行DPML文档的核心功能
- **@dpml/common** - Core utilities and shared functionality
- **@dpml/agent** - Agent implementation and tools

## Getting Started

Please refer to the specific package documentation for detailed usage instructions.

## Development

To generate this documentation locally:

```bash
pnpm run docs        # Generate documentation
pnpm run docs:watch  # Generate and watch for changes
pnpm run docs:serve  # Serve documentation locally
``` 