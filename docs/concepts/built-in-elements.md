# DPML 内置元素

本文档介绍 DPML 的内置元素 (Intrinsic Elements)，这些元素由 DPML 核心定义，无论用户 Schema 如何定义都会被识别和处理。

## 什么是内置元素

类似于 HTML 有内置元素（如 `<img>`、`<a>`、`<script>`），DPML 也有内置元素。这些元素：

- 由 DPML 核心定义，不需要在用户 Schema 中声明
- 具有特殊的语义和处理逻辑
- 在任何 DPML 文档中都可以使用

## resource 元素

`<resource>` 是 DPML v1.0 中唯一的内置元素，用于引用外部资源。

### 基本语法

```xml
<resource src="资源地址"/>
```

### 属性

| 属性 | 必需 | 描述 |
|------|------|------|
| `src` | 否 | 资源地址，支持多种协议 |

### 内容

`<resource>` 元素可以包含可选的文本内容：

```xml
<resource src="arp:text:file:///path/to/file.txt">
  备用内容（当资源无法加载时使用）
</resource>
```

### 示例

```xml
<agent>
  <prompt>
    你是一个专业的编程助手。
  </prompt>

  <!-- 引用外部资源 -->
  <resource src="localhost/prompts/coding-style.text@1.0.0"/>
</agent>
```

## 协议类型

`<resource>` 元素的 `src` 属性支持多种协议：

### ARP 协议

ARP (Agent Resource Protocol) 是一种低级 I/O 协议，用于访问各种资源。

**格式**：`arp:{semantic}:{transport}://{location}`

- **semantic**：内容语义（如 `text`、`binary`）
- **transport**：传输协议（如 `file`、`http`、`https`）
- **location**：资源位置

**示例**：

```xml
<!-- 本地文件 -->
<resource src="arp:text:file:///path/to/prompt.txt"/>

<!-- HTTP 资源 -->
<resource src="arp:text:https://example.com/prompts/assistant.txt"/>

<!-- 二进制文件 -->
<resource src="arp:binary:file:///path/to/image.png"/>
```

### RXL 协议

RXL (Resource Locator) 是 ResourceX 的资源定位格式，类似于 npm 包的定位方式。

**格式**：`[domain/path/]name[.type][@version]`

**示例**：

```xml
<!-- 完整格式 -->
<resource src="deepractice.ai/prompts/coding-assistant.prompt@1.0.0"/>

<!-- 简化格式（本地域） -->
<resource src="localhost/my-prompt.text@1.0"/>

<!-- 带路径 -->
<resource src="example.com/team/project/config.json@2.0.0"/>
```

### 协议检测

DPML 会自动检测 `src` 属性的协议类型：

| 规则 | 协议类型 |
|------|----------|
| 以 `arp:` 开头 | ARP 协议 |
| 匹配 `domain/path` 格式 | RXL 协议 |
| 其他 | unknown |

## ResourceInfo 结构

解析 `<resource>` 元素后，可以获取 `ResourceInfo` 结构：

```typescript
interface ResourceInfo {
  // 原始 src 属性值
  src: string | undefined;

  // 检测到的协议类型
  protocol: 'arp' | 'rxl' | 'unknown';

  // 原始节点引用
  node: unknown;
}
```

## 内置元素 Schema

`<resource>` 元素的内置 Schema 定义：

```typescript
const resourceSchema: ElementSchema = {
  element: 'resource',
  attributes: [
    { name: 'src', required: false }
  ],
  content: { type: 'text', required: false }
};
```

### Schema 宽容性

内置元素采用类似 HTML 的宽容策略：

- `src` 属性在解析时不强制必需
- 允许缺少 `src` 的 `<resource>` 元素
- 验证在更高层级（运行时）进行

## API 使用

### 检查内置元素

```typescript
import { isIntrinsicElement, getIntrinsicSchema } from '@dpml/core';

// 检查是否是内置元素
isIntrinsicElement('resource');  // true
isIntrinsicElement('prompt');    // false

// 获取内置元素的 Schema
const schema = getIntrinsicSchema('resource');
```

### 检测协议

```typescript
import { detectProtocol } from '@dpml/core';

detectProtocol('arp:text:file:///path');                    // 'arp'
detectProtocol('localhost/name.type@1.0.0');               // 'rxl'
detectProtocol('deepractice.ai/prompts/assistant.text');   // 'rxl'
detectProtocol('unknown-format');                          // 'unknown'
detectProtocol(undefined);                                 // 'unknown'
```

## 使用场景

### 引用共享提示词

```xml
<agent>
  <llm model="gpt-4"/>

  <!-- 引用共享的系统提示词 -->
  <resource src="company.com/prompts/base-assistant.text@1.0.0"/>

  <!-- 本地特定提示词 -->
  <prompt>
    额外的特定指令...
  </prompt>
</agent>
```

### 引用配置文件

```xml
<workflow>
  <!-- 引用工作流配置 -->
  <resource src="arp:text:file:///config/workflow.json"/>

  <step id="step-1">
    <!-- 步骤内容 -->
  </step>
</workflow>
```

### 模块化文档

```xml
<agent>
  <!-- 基础角色定义 -->
  <resource src="localhost/roles/developer.text@1.0"/>

  <!-- 技能模块 -->
  <resource src="localhost/skills/python.text@1.0"/>
  <resource src="localhost/skills/typescript.text@1.0"/>

  <!-- 工具配置 -->
  <resource src="localhost/tools/code-execute.text@1.0"/>
</agent>
```

## 与用户元素的区别

| 特性 | 内置元素 | 用户元素 |
|------|----------|----------|
| 定义位置 | DPML 核心 | 用户 Schema |
| Schema 要求 | 不需要 | 需要在 Schema 中定义 |
| 处理逻辑 | 内置特殊处理 | 通用处理 |
| 示例 | `<resource>` | `<prompt>`, `<agent>` |

## 扩展性

未来版本可能会添加更多内置元素，例如：

- `<include>` - 文档包含
- `<ref>` - 内部引用
- `<template>` - 模板定义
- `<slot>` - 插槽机制

所有内置元素都会在 `INTRINSIC_ELEMENTS` 中定义，并提供相应的 API 进行检测和处理。

## 下一步

- [架构概览](./overview.md) - 了解整体架构
- [语法概念](./syntax.md) - 了解 Element、Attribute、Content
- [Schema 系统](./schema.md) - 了解如何定义文档结构
- [变换器系统](./transformer.md) - 了解如何转换文档
