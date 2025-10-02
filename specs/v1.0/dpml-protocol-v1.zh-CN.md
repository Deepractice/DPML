# DPML 协议规范 v1.0

**状态**: 草案
**日期**: 2025年10月
**作者**: 姜山 (Deepractice.ai)

---

## 摘要

本文档定义了 Deepractice 提示词标记语言（DPML）协议 1.0 版本的技术规范。

DPML 是一种基于 XML 的标记语言，旨在统一 AI 系统中计算机、AI 和人类的信息交换。本规范定义了 DPML 的语法、语义、验证规则、错误处理机制和互操作性要求，为实现者提供明确的技术指导。

设计理念和理论基础详见 [DPML 设计白皮书](../../whitepapers/v1.0/dpml-whitepaper.zh-CN.md)。

---

## 目录

1. [引言](#1-引言)
2. [设计原则](#2-设计原则)
3. [术语](#3-术语)
4. [协议概述](#4-协议概述)
5. [语法规范](#5-语法规范)
6. [元素规范](#6-元素规范)
7. [属性规范](#7-属性规范)
8. [内容规范](#8-内容规范)
9. [文件格式](#9-文件格式)
10. [解析与验证](#10-解析与验证)
11. [互操作性](#11-互操作性)
12. [安全考虑](#12-安全考虑)
13. [IANA 考虑](#13-iana-考虑)
14. [参考文献](#14-参考文献)
15. [附录](#附录)

---

## 1. 引言

### 1.1 动机

现代 AI 系统涉及三方协同：人类提供意图，AI 进行语义转译，计算机执行指令。传统方法将这三方的信息分散在不兼容的格式中（纯文本 Prompt、YAML/JSON 配置、文档），导致：

- 信息不同步（修改配置忘记更新 Prompt）
- 系统不可观测（AI 推理过程是黑盒）
- 维护成本高（需要在多个文件间跳转）

DPML 通过采用 XML 的四维语义（tag/attribute/content/structure），将这三种信息统一到单一文档中，实现：

1. **统一信息载体** - 单一文档承载所有驱动信号
2. **职责分离** - 不同类型的信息在结构上明确分离
3. **全程可观测** - DPML 流转过程可实时可视化

### 1.2 目标

DPML 协议旨在：

1. **定义精确语法** - 明确什么是合法的 DPML 文档
2. **规范解析行为** - 确保不同实现的一致性
3. **支持工具生态** - 提供验证、转换、可视化的基础
4. **保持简洁性** - 协议层核心概念 ≤ 5 个，降低认知负担
5. **预留扩展性** - 支持未来演进且不破坏兼容性

本协议的 5 个核心概念：

- **元素（Element）**：表示概念的 XML 标签结构
- **属性（Attribute）**：附加到元素的键值对配置
- **内容（Content）**：元素内的文本或子元素
- **保留属性（type/id）**：协议层定义的通用属性
- **文件格式（.dpml/.pml）**：标准化的文档容器

### 1.3 范围

本规范定义：

- **核心语法** - 元素、属性和内容的格式规则
- **验证规则** - 格式正确性和结构有效性检查
- **错误处理** - 非法输入的处理行为
- **互操作性要求** - 不同实现的兼容性保证

本规范不定义：

- **领域语义** - `<agent>`、`<task>` 等的具体含义（由领域规范定义）
- **运行时行为** - 元素如何执行或解释（由实现决定）
- **高级扩展** - 命名空间、版本控制等预留给未来版本

### 1.4 需求语言

本文档中的关键词"必须（MUST）"、"禁止（MUST NOT）"、"要求（REQUIRED）"、"应当（SHALL）"、"不应（SHALL NOT）"、"应该（SHOULD）"、"不应该（SHOULD NOT）"、"推荐（RECOMMENDED）"、"可以（MAY）"和"可选（OPTIONAL）"按照 RFC 2119 中的描述进行解释。

---

## 2. 设计原则

DPML 基于以下核心设计原则（详细论证见[设计白皮书](../../whitepapers/v1.0/dpml-whitepaper.zh-CN.md)第 3 章）：

### 2.1 三方协同原则

信息载体必须同时服务计算机（配置解析）、AI（自然语言处理）和人类（可视化观察）。

**实现要求**：
- 元素（tag）必须是人类可理解的概念
- 属性（attribute）必须是机器可解析的键值对
- 内容（content）必须为 AI 提供自然语言空间
- 结构（structure）必须支持 DOM 可视化

### 2.2 最小认知负担原则

协议层的复杂度必须最小化，以降低 AI 和人类的理解成本。

**实现要求**：
- 核心概念 ≤ 5 个
- 使用共识术语（role、agent、task）而非自造词
- 遵循单一命名规范（kebab-case）
- 保留属性 ≤ 2 个（type、id）

### 2.3 职责分离原则

不同类型的信息必须在语法结构上明确分离。

**实现要求**：
- 配置参数必须使用属性表达（`model="gpt-4"`）
- 自然语言内容必须使用元素内容表达（`<prompt>你是助手</prompt>`）
- 层级关系必须使用嵌套结构表达（DOM 树）
- 禁止在内容中混入配置语法

### 2.4 约而不束原则

提供结构约束，但不限制表达灵活性。

**实现要求**：
- 约束语法结构（XML 格式、命名规范）
- 不约束内容表达（自然语言自由）
- 不约束逻辑（避免 if-else 控制流）
- 原则优于规则（通过设计引导而非强制）

---

## 3. 术语

### 3.1 核心术语

**DPML 文档（DPML Document）**
包含 DPML 标记的文件，使用 `.dpml` 或 `.pml` 扩展名。

**元素（Element）**
表示概念的 XML 标签结构，包含开始标签、结束标签（或自闭合）、可选的属性和内容。

**属性（Attribute）**
附加到元素的键值对，格式为 `name="value"`。

**内容（Content）**
元素内的文本数据或子元素。

**保留属性（Reserved Attribute）**
协议层定义的通用属性，当前包括：
- `type` - 指示内容格式类型
- `id` - 元素的唯一标识符

**格式良好（Well-Formed）**
符合 XML 1.0 语法规则的文档（标签正确闭合、属性正确引用等）。

**有效（Valid）**
同时满足格式良好和 DPML 验证规则的文档。

### 3.2 约定术语

**kebab-case**
全小写字母，单词间用连字符分隔的命名风格（如 `travel-planner`）。

**概念（Concept）**
由元素标签表示的语义单元，应使用共识术语而非自造词。

**领域（Domain）**
DPML 的专门化应用区域（如 Agent 领域、Task 领域），具有特定的元素定义。

---

## 4. 协议概述

### 4.1 基础

DPML 是 **XML 1.0 的受约束子集**：

- **基于** - XML 1.0 规范 [XML]
- **增加** - 命名约定、保留属性、元语义规则
- **移除** - DTD、XML Schema、处理指令、实体（为简洁性）

### 4.2 层次结构

```
┌─────────────────────────────────────────────┐
│           DPML 协议（元层）                 │
│  • 语法规则（本规范）                       │
│  • 元素/属性/内容的元语义                   │
│  • 保留属性                                 │
│  • 验证和错误处理                           │
└─────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────┐
│           领域规范（独立文档）              │
│  • Agent 领域 - 对话式 AI 配置              │
│  • Task 领域 - 状态机任务定义               │
│  • Role 领域 - AI 人格定义                  │
│  • Workflow 领域 - 工作流编排               │
└─────────────────────────────────────────────┘
```

### 4.3 实现一致性级别

实现可以声明以下一致性级别：

**Level 1: 基础解析器（Basic Parser）**
- 必须正确解析格式良好的 DPML 文档
- 必须验证命名约定（kebab-case）
- 必须识别保留属性（type、id）

**Level 2: 验证解析器（Validating Parser）**
- Level 1 的所有要求
- 必须执行完整的验证规则（第 10 章）
- 必须正确处理错误（返回规定的错误代码）

**Level 3: 领域感知解析器（Domain-Aware Parser）**
- Level 2 的所有要求
- 必须支持至少一个领域规范的验证
- 必须提供领域特定的错误信息

---

## 5. 语法规范

### 5.1 基本结构

DPML 文档必须是格式良好的 XML：

```xml
<element-name attribute-name="attribute-value">
  内容或子元素
</element-name>
```

**ABNF 定义**：

```abnf
dpml-document  = [xml-decl] root-element
root-element   = element
element        = start-tag content end-tag / empty-element
start-tag      = "<" element-name *attribute ">"
end-tag        = "</" element-name ">"
empty-element  = "<" element-name *attribute "/>"
```

### 5.2 命名约定

#### 5.2.1 元素名称

元素名称必须遵循 **kebab-case**：

**语法规则**：
- 必须全部小写字母（a-z）
- 可以包含数字（0-9），但不能以数字开头
- 单词之间必须用连字符（-）分隔
- 禁止使用下划线（_）、禁止驼峰命名

**ABNF 定义**：

```abnf
element-name   = lowercase-word *("-" lowercase-word)
lowercase-word = ALPHA *(ALPHA / DIGIT)
ALPHA          = %x61-7A  ; a-z
DIGIT          = %x30-39  ; 0-9
```

**有效示例**：
```xml
<agent>
<travel-planner>
<api-config>
<tool-call-v2>
```

**无效示例**：
```xml
<Agent>           <!-- 大写字母 -->
<travelPlanner>   <!-- 驼峰命名 -->
<api_config>      <!-- 下划线 -->
<2fa-auth>        <!-- 以数字开头 -->
```

#### 5.2.2 属性名称

属性名称必须遵循与元素相同的 **kebab-case** 规则。

**有效示例**：
```xml
<llm model="gpt-4" api-key="..." max-tokens="2000"/>
```

**无效示例**：
```xml
<llm apiKey="..." maxTokens="..."/>  <!-- 驼峰命名 -->
<llm API_KEY="..."/>                 <!-- 大写+下划线 -->
```

### 5.3 字符编码

DPML 文档应该使用 **UTF-8** 编码。

**规则**：
- UTF-8 是推荐编码，实现必须支持
- 如果使用其他编码，必须包含 XML 声明：
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  ```
- 实现可以支持其他 XML 1.0 规定的编码（UTF-16、ISO-8859-1 等）

### 5.4 空白字符处理

#### 5.4.1 空白字符定义

空白字符包括：
- 空格（U+0020）
- 制表符（U+0009）
- 换行符（U+000A）
- 回车符（U+000D）

#### 5.4.2 处理规则

**在元素内容中**：
- 协议层：所有空白字符必须保留（遵循 XML 1.0 规范）
- 领域层：可以定义修剪或规范化规则

**在属性值中**：
- 前导和尾随空白字符必须保留
- 内部空白字符必须保留

**在标签之间**：
- 仅用于格式化的空白字符可以忽略
- 实现应该提供选项保留或移除格式化空白

**示例**：

```xml
<prompt>
  你是助手。
  你擅长编程。
</prompt>
```

内容保留为：
```
\n  你是助手。\n  你擅长编程。\n
```

---

## 6. 元素规范

### 6.1 元素定义

在 DPML 中，元素表示**概念**而非仅仅是结构标记。

**概念的特征**：
- **完备性** - 自包含的语义单元
- **共识性** - 广泛理解的术语（如 role、agent、task）
- **清晰性** - 明确的边界和组成

### 6.2 元素结构

元素有三种形式：

#### 6.2.1 容器元素

包含子元素或文本内容：

```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>你是助手</prompt>
</agent>
```

#### 6.2.2 自闭合元素

不包含内容的叶子节点：

```xml
<llm model="gpt-4" api-key="sk-xxx"/>
```

等价于：

```xml
<llm model="gpt-4" api-key="sk-xxx"></llm>
```

#### 6.2.3 文本内容元素

仅包含文本：

```xml
<prompt>你是一个有用的助手</prompt>
```

### 6.3 混合内容

混合内容（文本 + 子元素）在语法上有效：

```xml
<prompt>
  你是一个具有以下技能的助手：
  <skill>规划</skill>
  <skill>分析</skill>
</prompt>
```

**处理规则**：
- 协议层：语法上合法
- 领域层：可以限制为纯文本或纯子元素
- 实现：必须保留文本和元素的顺序

### 6.4 协议层约束

协议定义：
- 命名必须是 kebab-case
- 必须使用共识概念（role、agent、task 等）

协议不定义：
- 哪些元素存在（如 `<agent>` 的含义）
- 元素的层次规则（哪些元素可以包含哪些）
- 必需或可选（哪些元素是强制的）
- 元素顺序约束

这些由领域规范定义。

---

## 7. 属性规范

### 7.1 属性语义

属性主要服务**机器解析**：
- 类型标记（`type="json"`）
- 标识符（`id="main-prompt"`）
- 配置参数（`model="gpt-4"`）

AI 和人类可以理解属性，但属性针对机器处理优化。

### 7.2 属性语法

#### 7.2.1 基本格式

```xml
<element attr1="value1" attr2="value2">
```

**规则**：
- 属性名必须是 kebab-case
- 属性值必须用引号（单引号或双引号）
- 同一元素的属性名不能重复
- 属性顺序对语义无影响

#### 7.2.2 属性值

在协议层面，所有属性值都是字符串。

**转义规则**：
- `<` 必须转义为 `&lt;`
- `>` 必须转义为 `&gt;`
- `&` 必须转义为 `&amp;`
- `"` 在双引号属性值中必须转义为 `&quot;`
- `'` 在单引号属性值中必须转义为 `&apos;`

**示例**：

```xml
<data value="x &lt; 10 &amp;&amp; y &gt; 5"/>
<data value='Say "hello"'/>
```

### 7.3 保留属性

协议定义两个所有元素都可以使用的保留属性。

#### 7.3.1 `type` 属性

**用途**：指示元素内容的格式类型

**语法**：
```abnf
type-attribute = "type" "=" DQUOTE type-value DQUOTE
type-value     = "text" / "markdown" / "json" / "javascript" /
                 "python" / "yaml" / other-type
other-type     = 1*VCHAR  ; 实现定义的类型
```

**默认值**：`text`（纯文本）

**标准类型值**：

| 类型值 | 内容格式 | 机器处理 | AI 理解 |
|--------|---------|---------|---------|
| `text` | 纯文本 | 字符串存储 | 自然语言 |
| `markdown` | Markdown | Markdown 解析 | 格式化文本 |
| `json` | JSON | JSON 解析 | 数据结构 |
| `javascript` | JavaScript | 代码解析/执行 | 代码逻辑 |
| `python` | Python | 代码解析/执行 | 代码逻辑 |
| `yaml` | YAML | YAML 解析 | 数据结构 |

**示例**：

```xml
<prompt type="markdown">
# 系统提示词
你是一个助手。
</prompt>

<config type="json">
{
  "timeout": 30,
  "retry": 3
}
</config>

<script type="javascript">
function greet(name) {
  return `Hello, ${name}!`;
}
</script>
```

**处理规则**：
- 实现必须识别 `type` 属性
- 实现应该支持标准类型值
- 实现可以支持自定义类型值
- 未识别的类型值应视为 `text`

#### 7.3.2 `id` 属性

**用途**：元素的唯一标识符

**语法**：
```abnf
id-attribute = "id" "=" DQUOTE id-value DQUOTE
id-value     = 1*(ALPHA / DIGIT / "-" / "_")
```

**规则**：
- 在单个文档中必须唯一
- 可以包含字母、数字、连字符、下划线
- 推荐使用 kebab-case
- 用于未来的引用机制（虽然 v1.0 未实现）

**示例**：

```xml
<prompt id="travel-system-prompt">
  你是一名旅游规划专家。
</prompt>

<tool id="weather-api" name="get-weather"/>
```

**保留用途**：
- v1.0：仅用于标识，不支持引用
- 未来版本：支持 `<ref id="..."/>` 引用机制

### 7.4 领域特定属性

领域可以定义自己的属性：

```xml
<llm
  model="gpt-4"
  api-key="sk-xxx"
  temperature="0.7"
  max-tokens="2000"
/>
```

**约束**：
- 必须遵循 kebab-case
- 在协议层面都是字符串
- 类型解释由领域规范定义

---

## 8. 内容规范

### 8.1 内容类型

元素内容可以是：

1. **文本内容** - 自然语言或数据
2. **子元素** - 嵌套概念
3. **混合内容** - 文本 + 子元素
4. **空** - 自闭合元素

### 8.2 按类型的内容处理

内容的处理方式取决于 `type` 属性：

#### 8.2.1 `type="text"` (默认)

**机器处理**：
- 作为字符串存储
- 保留所有空白字符（除非领域规范另有规定）

**AI 理解**：
- 作为自然语言处理
- 保留语义和上下文

**示例**：
```xml
<prompt>
你是一个专业的旅行规划助手。
你擅长制定详细的行程。
</prompt>
```

#### 8.2.2 `type="markdown"`

**机器处理**：
- 使用 Markdown 解析器处理
- 生成 HTML 或结构化表示

**AI 理解**：
- 理解 Markdown 格式（标题、列表、强调）
- 提取语义结构

**示例**：
```xml
<prompt type="markdown">
# 角色
你是专业的 Python 开发者

## 技能
- 数据分析
- 机器学习
</prompt>
```

#### 8.2.3 `type="json"`

**机器处理**：
- 使用 JSON 解析器验证和解析
- 转换为内部数据结构

**AI 理解**：
- 理解数据结构
- 识别键值关系

**示例**：
```xml
<config type="json">
{
  "temperature": 0.7,
  "max_tokens": 2000
}
</config>
```

#### 8.2.4 `type="javascript"` / `type="python"`

**机器处理**：
- 使用代码解析器验证语法
- 可选：执行代码（需安全沙箱）

**AI 理解**：
- 理解代码逻辑
- 识别函数、变量、控制流

**示例**：
```xml
<script type="javascript">
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
</script>
```

### 8.3 特殊字符和转义

#### 8.3.1 必须转义的字符

在文本内容中，以下字符必须转义：

| 字符 | 转义形式 | 使用场景 |
|------|---------|---------|
| `<` | `&lt;` | 总是 |
| `&` | `&amp;` | 总是 |
| `>` | `&gt;` | 推荐（不强制） |
| `"` | `&quot;` | 在属性值中（双引号） |
| `'` | `&apos;` | 在属性值中（单引号） |

**示例**：

```xml
<prompt>
使用 &lt;tag&gt; 进行标记 &amp; 使用 &quot;引号&quot;
</prompt>
```

#### 8.3.2 代码内容的特殊处理

对于 `type="javascript"`、`type="python"` 等代码类型：

**选项 1：使用转义**
```xml
<script type="javascript">
if (x &lt; 10 &amp;&amp; y &gt; 5) {
  console.log("Valid");
}
</script>
```

**选项 2：使用 CDATA**
```xml
<script type="javascript"><![CDATA[
if (x < 10 && y > 5) {
  console.log("Valid");
}
]]></script>
```

**推荐**：CDATA 更适合代码内容（可读性更好）

#### 8.3.3 空白字符规范化

**规则**：
- 协议层：必须保留所有空白字符
- 领域层：可以定义规范化规则

**示例**：

输入：
```xml
<prompt>
  你是助手。
  你擅长编程。
</prompt>
```

协议层保留：
```
"\n  你是助手。\n  你擅长编程。\n"
```

领域层可选规范化：
```
"你是助手。\n你擅长编程。"
```

---

## 9. 文件格式

### 9.1 文件扩展名

DPML 文档必须使用以下扩展名之一：

- **`.dpml`** - 主要的官方扩展名（推荐）
- **`.pml`** - 短别名，完全等价

**规则**：
- 两个扩展名在语义上完全等价
- 实现必须同等对待这两个扩展名
- 文件系统和工具应该识别这两个扩展名

### 9.2 MIME 类型

**主要 MIME 类型**：`application/dpml+xml`
**备选 MIME 类型**：`text/dpml+xml`

**规则**：
- `+xml` 后缀表示基于 XML 的格式
- 实现应该优先使用 `application/dpml+xml`
- HTTP 服务器应该为 `.dpml` 和 `.pml` 文件设置正确的 MIME 类型

**示例（Apache .htaccess）**：
```
AddType application/dpml+xml .dpml .pml
```

### 9.3 文档结构

#### 9.3.1 根元素

DPML 文档必须有且仅有一个根元素：

**有效**：
```xml
<agent>
  ...
</agent>
```

**无效**：
```xml
<agent>...</agent>
<task>...</task>  <!-- 多个根元素 -->
```

**规则**：
- 根元素可以是任何有效的元素
- 根元素名称由领域规范定义
- 协议层不限制根元素的选择

#### 9.3.2 XML 声明

XML 声明是可选的：

**有 XML 声明**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  ...
</agent>
```

**无 XML 声明**：
```xml
<agent>
  ...
</agent>
```

**推荐**：
- 如果编码不是 UTF-8，必须包含 XML 声明
- 为了明确性，推荐总是包含 XML 声明

#### 9.3.3 注释

支持 XML 注释：

```xml
<!-- 这是注释 -->
<agent>
  <!-- 配置 LLM -->
  <llm model="gpt-4"/>
</agent>
```

**规则**：
- 注释可以出现在元素之间
- 注释不能出现在标签内部
- 注释不能嵌套
- 注释内容不能包含 `--`

### 9.4 最小文档

最小的有效 DPML 文档：

```xml
<agent/>
```

或带内容：

```xml
<agent>
  <llm model="gpt-4"/>
</agent>
```

---

## 10. 解析与验证

本章定义实现者必须遵循的解析流程、验证规则和错误处理机制。

### 10.1 解析流程

#### 10.1.1 基本解析流程

实现必须按以下步骤解析 DPML 文档：

```
步骤 1: 读取文档
  ├─ 检测字符编码（UTF-8/UTF-16/...）
  ├─ 读取完整文档内容
  └─ 如果读取失败 → 错误 E001

步骤 2: XML 格式验证
  ├─ 验证 XML 格式良好性
  ├─ 检查标签正确闭合
  ├─ 检查属性正确引用
  └─ 如果格式不良 → 错误 E002

步骤 3: 命名规范验证
  ├─ 验证所有元素名是 kebab-case
  ├─ 验证所有属性名是 kebab-case
  └─ 如果违反规范 → 错误 E003

步骤 4: 保留属性验证
  ├─ 验证 type 属性值（如果存在）
  ├─ 验证 id 属性值（如果存在）
  ├─ 检查 id 唯一性
  └─ 如果验证失败 → 错误 E004

步骤 5: 构建 DOM 树
  ├─ 创建文档对象模型
  ├─ 保留所有空白字符
  └─ 构建成功 → 返回 DOM

步骤 6: 领域验证（可选）
  └─ 由领域规范定义
```

#### 10.1.2 解析器伪代码

```python
def parse_dpml(file_path: str) -> DPMLDocument:
    """
    解析 DPML 文档

    返回: DPMLDocument 对象
    抛出: DPMLParseError, DPMLValidationError
    """
    # 步骤 1: 读取文档
    try:
        content = read_file(file_path, encoding='utf-8')
    except IOError as e:
        raise DPMLParseError("E001", f"无法读取文件: {e}")

    # 步骤 2: XML 格式验证
    try:
        xml_tree = parse_xml(content)
    except XMLSyntaxError as e:
        raise DPMLParseError("E002", f"XML 格式错误: {e}")

    # 步骤 3: 命名规范验证
    for element in xml_tree.iter():
        if not is_kebab_case(element.tag):
            raise DPMLValidationError(
                "E003",
                f"元素名 '{element.tag}' 不是 kebab-case"
            )
        for attr_name in element.attrib:
            if not is_kebab_case(attr_name):
                raise DPMLValidationError(
                    "E003",
                    f"属性名 '{attr_name}' 不是 kebab-case"
                )

    # 步骤 4: 保留属性验证
    id_set = set()
    for element in xml_tree.iter():
        # 验证 type 属性
        if 'type' in element.attrib:
            type_value = element.attrib['type']
            if not is_valid_type(type_value):
                raise DPMLValidationError(
                    "E004",
                    f"无效的 type 值: '{type_value}'"
                )

        # 验证 id 属性
        if 'id' in element.attrib:
            id_value = element.attrib['id']
            if not is_valid_id(id_value):
                raise DPMLValidationError(
                    "E004",
                    f"无效的 id 值: '{id_value}'"
                )
            if id_value in id_set:
                raise DPMLValidationError(
                    "E004",
                    f"重复的 id: '{id_value}'"
                )
            id_set.add(id_value)

    # 步骤 5: 构建 DPML 文档对象
    doc = DPMLDocument(xml_tree)

    return doc


def is_kebab_case(name: str) -> bool:
    """验证是否为 kebab-case"""
    if not name:
        return False
    if name[0].isdigit():
        return False
    return all(c.islower() or c.isdigit() or c == '-' for c in name)


def is_valid_type(type_value: str) -> bool:
    """验证 type 属性值"""
    # 标准类型
    standard_types = [
        'text', 'markdown', 'json',
        'javascript', 'python', 'yaml'
    ]
    if type_value in standard_types:
        return True
    # 自定义类型：任何非空字符串
    return len(type_value) > 0


def is_valid_id(id_value: str) -> bool:
    """验证 id 属性值"""
    if not id_value:
        return False
    return all(c.isalnum() or c in '-_' for c in id_value)
```

### 10.2 验证规则

#### 10.2.1 格式良好性（Well-Formedness）

文档必须满足 XML 1.0 格式良好性规则：

1. **唯一根元素**
   ```xml
   <!-- 有效 -->
   <agent>...</agent>

   <!-- 无效：多个根元素 -->
   <agent>...</agent>
   <task>...</task>
   ```

2. **标签正确嵌套**
   ```xml
   <!-- 有效 -->
   <agent><llm/></agent>

   <!-- 无效：嵌套错误 -->
   <agent><llm></agent></llm>
   ```

3. **属性值正确引用**
   ```xml
   <!-- 有效 -->
   <llm model="gpt-4"/>

   <!-- 无效：缺少引号 -->
   <llm model=gpt-4/>
   ```

4. **特殊字符正确转义**
   ```xml
   <!-- 有效 -->
   <data>x &lt; 10</data>

   <!-- 无效：未转义 -->
   <data>x < 10</data>
   ```

#### 10.2.2 DPML 特定规则

1. **命名规范**

   **规则 V001**: 所有元素名必须是 kebab-case
   ```xml
   <!-- 有效 -->
   <travel-planner/>

   <!-- 无效 -->
   <TravelPlanner/>  <!-- 大写 -->
   <travel_planner/> <!-- 下划线 -->
   ```

   **规则 V002**: 所有属性名必须是 kebab-case
   ```xml
   <!-- 有效 -->
   <llm api-key="..."/>

   <!-- 无效 -->
   <llm apiKey="..."/>
   ```

2. **保留属性**

   **规则 V003**: `type` 属性值必须非空
   ```xml
   <!-- 有效 -->
   <prompt type="markdown">...</prompt>

   <!-- 无效 -->
   <prompt type="">...</prompt>
   ```

   **规则 V004**: `id` 属性值必须匹配模式 `^[a-zA-Z0-9_-]+$`
   ```xml
   <!-- 有效 -->
   <prompt id="system-prompt-v2"/>

   <!-- 无效 -->
   <prompt id="system prompt"/>  <!-- 包含空格 -->
   <prompt id="系统提示词"/>      <!-- 非 ASCII -->
   ```

   **规则 V005**: `id` 在文档中必须唯一
   ```xml
   <!-- 无效：重复的 id -->
   <prompt id="main"/>
   <tool id="main"/>
   ```

#### 10.2.3 验证算法

```python
def validate_dpml(doc: DPMLDocument) -> ValidationResult:
    """
    验证 DPML 文档

    返回: ValidationResult (包含错误列表)
    """
    errors = []

    # V001: 元素名 kebab-case
    for element in doc.iter():
        if not is_kebab_case(element.tag):
            errors.append(ValidationError(
                code="V001",
                message=f"元素名 '{element.tag}' 不是 kebab-case",
                element=element
            ))

    # V002: 属性名 kebab-case
    for element in doc.iter():
        for attr_name in element.attrib:
            if not is_kebab_case(attr_name):
                errors.append(ValidationError(
                    code="V002",
                    message=f"属性名 '{attr_name}' 不是 kebab-case",
                    element=element
                ))

    # V003: type 属性非空
    for element in doc.iter():
        if 'type' in element.attrib:
            if not element.attrib['type']:
                errors.append(ValidationError(
                    code="V003",
                    message="type 属性值不能为空",
                    element=element
                ))

    # V004: id 属性格式
    id_pattern = re.compile(r'^[a-zA-Z0-9_-]+$')
    for element in doc.iter():
        if 'id' in element.attrib:
            id_value = element.attrib['id']
            if not id_pattern.match(id_value):
                errors.append(ValidationError(
                    code="V004",
                    message=f"id 属性值 '{id_value}' 格式无效",
                    element=element
                ))

    # V005: id 唯一性
    id_map = {}
    for element in doc.iter():
        if 'id' in element.attrib:
            id_value = element.attrib['id']
            if id_value in id_map:
                errors.append(ValidationError(
                    code="V005",
                    message=f"重复的 id: '{id_value}'",
                    element=element,
                    first_occurrence=id_map[id_value]
                ))
            else:
                id_map[id_value] = element

    return ValidationResult(
        valid=(len(errors) == 0),
        errors=errors
    )
```

### 10.3 错误处理

#### 10.3.1 错误级别

实现必须区分错误级别：

| 级别 | 代码前缀 | 处理方式 | 示例 |
|------|---------|---------|------|
| 致命错误 | E | 必须停止解析 | E001, E002 |
| 验证错误 | V | 可以继续但标记为无效 | V001, V002 |
| 警告 | W | 仅记录，不影响有效性 | W001 |

#### 10.3.2 错误代码

**致命错误（E 系列）**：

| 代码 | 描述 | 恢复策略 |
|------|------|---------|
| E001 | 文件读取失败 | 无法恢复，报错退出 |
| E002 | XML 格式不良 | 无法恢复，报错退出 |
| E003 | 编码错误 | 尝试其他编码，失败则退出 |

**验证错误（V 系列）**：

| 代码 | 描述 | 恢复策略 |
|------|------|---------|
| V001 | 元素名不是 kebab-case | 记录错误，继续验证 |
| V002 | 属性名不是 kebab-case | 记录错误，继续验证 |
| V003 | type 属性值无效 | 记录错误，视为 type="text" |
| V004 | id 属性值格式无效 | 记录错误，忽略该 id |
| V005 | id 重复 | 记录错误，保留第一个 |

**警告（W 系列）**：

| 代码 | 描述 | 处理方式 |
|------|------|---------|
| W001 | 未知的 type 值 | 记录警告，视为 text |
| W002 | 推荐使用 UTF-8 | 记录警告，继续处理 |
| W003 | 推荐包含 XML 声明 | 记录警告，继续处理 |

#### 10.3.3 错误报告格式

实现应该提供结构化的错误报告：

```json
{
  "valid": false,
  "errors": [
    {
      "code": "V001",
      "level": "error",
      "message": "元素名 'TravelPlanner' 不是 kebab-case",
      "location": {
        "line": 5,
        "column": 3,
        "xpath": "/agent/TravelPlanner"
      },
      "suggestion": "使用 'travel-planner' 替代 'TravelPlanner'"
    },
    {
      "code": "V005",
      "level": "error",
      "message": "重复的 id: 'main-prompt'",
      "location": {
        "line": 12,
        "column": 15,
        "xpath": "/agent/prompt[2]"
      },
      "context": {
        "first_occurrence": {
          "line": 8,
          "xpath": "/agent/prompt[1]"
        }
      }
    }
  ],
  "warnings": [
    {
      "code": "W001",
      "level": "warning",
      "message": "未知的 type 值: 'rust'",
      "location": {
        "line": 15,
        "column": 20
      },
      "suggestion": "确认 'rust' 是有效的内容类型"
    }
  ]
}
```

#### 10.3.4 错误恢复

实现可以提供错误恢复机制：

**策略 1: 严格模式**
- 遇到任何验证错误立即失败
- 不尝试恢复
- 适用于生产环境

**策略 2: 宽松模式**
- 记录所有错误但继续处理
- 尽可能恢复（使用默认值）
- 适用于开发环境

**示例**：

```python
class DPMLParser:
    def __init__(self, strict_mode=True):
        self.strict_mode = strict_mode

    def parse(self, file_path):
        doc = self._parse_xml(file_path)
        errors = self._validate(doc)

        if errors:
            if self.strict_mode:
                raise DPMLValidationError(errors)
            else:
                # 宽松模式：记录错误但返回文档
                logger.warning(f"发现 {len(errors)} 个验证错误")
                for error in errors:
                    logger.warning(error)
                doc.errors = errors

        return doc
```

### 10.4 测试用例

实现应该通过以下测试用例：

#### 10.4.1 基本解析测试

**测试 1: 最小文档**
```xml
<agent/>
```
期望：解析成功

**测试 2: 带属性的文档**
```xml
<agent>
  <llm model="gpt-4"/>
</agent>
```
期望：解析成功

**测试 3: 多层嵌套**
```xml
<agent>
  <role>
    <personality>...</personality>
  </role>
</agent>
```
期望：解析成功

#### 10.4.2 命名规范测试

**测试 4: 无效的元素名**
```xml
<Agent/>  <!-- 大写 -->
```
期望：验证错误 V001

**测试 5: 无效的属性名**
```xml
<llm apiKey="..."/>  <!-- 驼峰 -->
```
期望：验证错误 V002

#### 10.4.3 保留属性测试

**测试 6: 无效的 type 值**
```xml
<prompt type="">...</prompt>
```
期望：验证错误 V003

**测试 7: 无效的 id 值**
```xml
<prompt id="system prompt"/>  <!-- 包含空格 -->
```
期望：验证错误 V004

**测试 8: 重复的 id**
```xml
<agent>
  <prompt id="main"/>
  <tool id="main"/>
</agent>
```
期望：验证错误 V005

#### 10.4.4 边界情况测试

**测试 9: 空文档**
```xml
```
期望：致命错误 E002

**测试 10: 多个根元素**
```xml
<agent/>
<task/>
```
期望：致命错误 E002

**测试 11: 未闭合标签**
```xml
<agent>
  <llm model="gpt-4">
</agent>
```
期望：致命错误 E002

---

## 11. 互操作性

本章定义不同 DPML 实现之间的互操作性要求。

### 11.1 实现一致性

#### 11.1.1 必须实现（MUST）

所有实现必须：

1. **正确解析格式良好的 DPML 文档**
   - 支持所有 XML 1.0 语法
   - 正确处理 UTF-8 编码
   - 保留所有空白字符（在协议层面）

2. **验证命名规范**
   - 检测非 kebab-case 的元素名
   - 检测非 kebab-case 的属性名
   - 报告验证错误 V001 和 V002

3. **识别保留属性**
   - 识别 `type` 属性
   - 识别 `id` 属性
   - 验证其格式和唯一性

4. **提供错误报告**
   - 使用规定的错误代码（E/V/W 系列）
   - 提供错误位置信息（行号、列号）
   - 区分错误级别（致命/验证/警告）

#### 11.1.2 应该实现（SHOULD）

实现应该：

1. **支持标准 type 值**
   - text, markdown, json
   - javascript, python, yaml

2. **提供 DOM API**
   - 允许程序化访问元素
   - 支持 XPath 查询
   - 支持元素遍历

3. **支持验证器 API**
   - 提供独立的验证函数
   - 支持自定义验证规则
   - 支持领域规范验证

#### 11.1.3 可以实现（MAY）

实现可以：

1. **扩展功能**
   - 支持自定义 type 值
   - 提供格式化输出
   - 提供可视化工具

2. **性能优化**
   - 流式解析
   - 增量验证
   - 缓存机制

### 11.2 扩展机制

#### 11.2.1 自定义元素

领域规范可以定义自定义元素：

```xml
<agent>
  <custom-element custom-attr="value">
    自定义内容
  </custom-element>
</agent>
```

**约束**：
- 必须遵循 kebab-case
- 不能与未来的保留元素冲突
- 应该在领域规范中明确定义

#### 11.2.2 自定义属性

领域规范可以定义自定义属性：

```xml
<llm
  model="gpt-4"
  custom-param="value"
  x-vendor-specific="..."
/>
```

**约束**：
- 必须遵循 kebab-case
- 不能与保留属性（type、id）冲突
- 推荐使用 `x-` 前缀标识实验性属性

#### 11.2.3 自定义 type 值

实现可以支持自定义 type 值：

```xml
<code type="rust">
fn main() {
    println!("Hello, world!");
}
</code>
```

**处理规则**：
- 未识别的 type 值应视为 `text`
- 应该记录警告 W001
- 不应该导致验证失败

### 11.3 版本兼容性

#### 11.3.1 向前兼容

DPML v1.0 文档在未来版本中必须保持有效：

**规则**：
- v1.0 的所有语法在 v2.0+ 中仍然有效
- 新版本可以添加新功能，但不能破坏旧语法
- 新版本可以添加新的保留属性，但必须可选

**示例**：

```xml
<!-- v1.0 文档 -->
<agent>
  <llm model="gpt-4"/>
</agent>

<!-- v2.0 可能添加新属性，但旧文档仍然有效 -->
<agent version="2.0">  <!-- 新属性 -->
  <llm model="gpt-4"/>
</agent>
```

#### 11.3.2 版本检测

实现可以通过以下方式检测版本：

**方式 1: 根元素属性**
```xml
<agent version="1.0">
  ...
</agent>
```

**方式 2: 元数据元素**
```xml
<agent>
  <metadata version="1.0"/>
  ...
</agent>
```

**方式 3: XML 注释**
```xml
<!-- DPML v1.0 -->
<agent>
  ...
</agent>
```

**规则**：
- v1.0 不强制要求版本声明
- 缺少版本声明时，应假定为 v1.0
- 未来版本可以要求版本声明

#### 11.3.3 弃用策略

当未来版本弃用某些功能时：

**阶段 1: 标记为弃用**
- 功能仍然有效
- 发出弃用警告
- 提供迁移指导

**阶段 2: 移除（至少 2 个主版本后）**
- 功能不再支持
- 报告验证错误
- 提供自动迁移工具

### 11.4 互操作性测试

#### 11.4.1 测试套件

实现应该通过官方测试套件：

```
dpml-test-suite/
├── valid/               # 合法文档测试
│   ├── minimal.dpml
│   ├── with-attributes.dpml
│   └── nested.dpml
├── invalid/             # 非法文档测试
│   ├── bad-naming.dpml  # 期望: V001/V002
│   ├── bad-type.dpml    # 期望: V003
│   └── duplicate-id.dpml # 期望: V005
└── edge-cases/          # 边界情况
    ├── empty.dpml
    ├── whitespace.dpml
    └── unicode.dpml
```

#### 11.4.2 互操作性检查清单

实现必须通过：

- [ ] 解析所有 `valid/` 目录下的文档
- [ ] 正确报告 `invalid/` 目录下的错误
- [ ] 处理 `edge-cases/` 目录下的边界情况
- [ ] 生成的 DOM 与参考实现一致
- [ ] 错误代码与规范一致

---

## 12. 安全考虑

### 12.1 代码注入

#### 12.1.1 风险

`type="javascript"` 或 `type="python"` 的内容包含可执行代码，存在注入风险。

**攻击场景**：

```xml
<script type="javascript">
// 恶意代码
const fs = require('fs');
fs.unlinkSync('/important/file');
</script>
```

#### 12.1.2 防护措施

实现必须：

1. **默认禁用代码执行**
   - 默认情况下仅解析，不执行
   - 需要显式配置才能执行代码

2. **沙箱隔离**
   - 在隔离环境中执行代码
   - 限制文件系统访问
   - 限制网络访问
   - 限制系统调用

3. **用户确认**
   - 执行前请求用户确认
   - 显示代码内容和来源
   - 提供安全警告

**示例实现**：

```python
class DPMLExecutor:
    def __init__(self, sandbox=True, require_confirmation=True):
        self.sandbox = sandbox
        self.require_confirmation = require_confirmation

    def execute_script(self, element):
        if element.attrib.get('type') not in ['javascript', 'python']:
            return None

        # 用户确认
        if self.require_confirmation:
            if not self.confirm_execution(element):
                raise SecurityError("用户拒绝执行代码")

        # 沙箱执行
        if self.sandbox:
            return self.execute_in_sandbox(element.text)
        else:
            logger.warning("在非沙箱模式下执行代码")
            return self.execute_unsafe(element.text)
```

### 12.2 数据敏感性

#### 12.2.1 风险

属性和内容可能包含敏感信息：

```xml
<llm
  api-key="sk-xxx123456789"  <!-- 敏感 -->
  endpoint="https://internal.api"  <!-- 敏感 -->
/>

<database-config type="json">
{
  "username": "admin",
  "password": "secret123"  <!-- 敏感 -->
}
</database-config>
```

#### 12.2.2 防护措施

实现应该：

1. **检测敏感属性**
   - 识别常见的敏感属性名（api-key、password、token）
   - 发出安全警告

2. **支持环境变量**
   ```xml
   <llm api-key="${API_KEY}"/>  <!-- 从环境变量读取 -->
   ```

3. **支持外部引用**
   ```xml
   <llm api-key-file="./secrets/api-key.txt"/>
   ```

4. **日志脱敏**
   ```
   <!-- 记录日志时 -->
   <llm api-key="sk-xxx123456789"/>

   <!-- 显示为 -->
   <llm api-key="sk-xxx***"/>
   ```

**实现建议**：

```python
SENSITIVE_ATTRS = ['api-key', 'password', 'token', 'secret']

def sanitize_for_logging(element):
    """脱敏后记录日志"""
    sanitized = copy.deepcopy(element)
    for attr in SENSITIVE_ATTRS:
        if attr in sanitized.attrib:
            value = sanitized.attrib[attr]
            if len(value) > 6:
                sanitized.attrib[attr] = value[:6] + "***"
            else:
                sanitized.attrib[attr] = "***"
    return sanitized
```

### 12.3 XML 安全

#### 12.3.1 XXE 攻击

**风险**：XML 外部实体（XXE）攻击

```xml
<!DOCTYPE agent [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<agent>
  <data>&xxe;</data>  <!-- 读取系统文件 -->
</agent>
```

**防护**：

DPML v1.0 **不支持** DTD 和外部实体。

实现必须：
- 禁用 DTD 处理
- 禁用外部实体解析
- 拒绝包含 DOCTYPE 的文档

**Python 示例**：

```python
from lxml import etree

parser = etree.XMLParser(
    resolve_entities=False,  # 禁用实体解析
    no_network=True,         # 禁用网络访问
    dtd_validation=False,    # 禁用 DTD 验证
    load_dtd=False           # 禁用 DTD 加载
)

tree = etree.parse(file, parser)
```

#### 12.3.2 十亿笑攻击

**风险**：通过实体扩展耗尽内存

```xml
<!DOCTYPE agent [
  <!ENTITY lol "lol">
  <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
  ...
]>
<agent>&lol9;</agent>
```

**防护**：

禁用实体扩展（同 12.3.1）

#### 12.3.3 XPath 注入

**风险**：动态构造 XPath 查询

```python
# 不安全
user_input = "'] | //secret | //*['"
xpath = f"//agent[@id='{user_input}']"
```

**防护**：

使用参数化查询或验证输入：

```python
# 安全
def find_by_id(doc, id_value):
    # 验证输入
    if not re.match(r'^[a-zA-Z0-9_-]+$', id_value):
        raise ValueError("无效的 id")

    # 使用参数化查询（如果库支持）
    return doc.xpath("//agent[@id=$id]", id=id_value)
```

### 12.4 实现建议

#### 12.4.1 安全默认配置

```python
class DPMLParser:
    def __init__(self):
        # 默认安全配置
        self.allow_code_execution = False
        self.sandbox_mode = True
        self.disable_external_entities = True
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.max_depth = 100  # 最大嵌套深度
```

#### 12.4.2 安全检查清单

实现应该：

- [ ] 禁用 DTD 和外部实体
- [ ] 默认禁用代码执行
- [ ] 提供沙箱执行环境
- [ ] 脱敏日志输出
- [ ] 验证输入大小和深度
- [ ] 提供安全配置选项
- [ ] 文档化安全最佳实践

---

## 13. IANA 考虑

### 13.1 媒体类型注册

本节为向 IANA 注册 DPML 媒体类型的请求。

**类型名称**：application
**子类型名称**：dpml+xml
**必需参数**：无
**可选参数**：
  - `charset`：字符编码，默认 UTF-8

**编码考虑**：与 XML 相同，可使用 7bit、8bit 或 binary

**安全考虑**：见第 12 节

**互操作性考虑**：
  - 基于 XML 1.0
  - 不支持 DTD、实体、处理指令

**已发布规范**：本文档

**使用此媒体类型的应用**：
  - AI 开发工具
  - 提示词工程平台
  - Agent 配置系统
  - 工作流编排引擎

**附加信息**：
  - **魔数**：与 XML 相同（`<?xml` 或 `<`）
  - **文件扩展名**：`.dpml`、`.pml`
  - **Macintosh 文件类型代码**：TEXT

**联系人**：
姜山 (Sean Jiang)
sean@deepractice.ai

**预期用途**：COMMON

**作者/变更控制器**：
Deepractice.ai

### 13.2 文件扩展名注册

**扩展名 1**：`.dpml`
**MIME 类型**：`application/dpml+xml`
**描述**：Deepractice 提示词标记语言文档

**扩展名 2**：`.pml`
**MIME 类型**：`application/dpml+xml`
**描述**：DPML 文档（短别名）

---

## 14. 参考文献

### 14.1 规范性引用

**[XML]**
Bray, T., Paoli, J., Sperberg-McQueen, C., Maler, E., and F. Yergeau,
"Extensible Markup Language (XML) 1.0 (Fifth Edition)",
W3C Recommendation, November 2008.
https://www.w3.org/TR/xml/

**[RFC2119]**
Bradner, S.,
"Key words for use in RFCs to Indicate Requirement Levels",
BCP 14, RFC 2119, March 1997.
https://www.rfc-editor.org/rfc/rfc2119

**[RFC3986]**
Berners-Lee, T., Fielding, R., and L. Masinter,
"Uniform Resource Identifier (URI): Generic Syntax",
STD 66, RFC 3986, January 2005.
https://www.rfc-editor.org/rfc/rfc3986

### 14.2 信息性引用

**[RFC7322]**
Flanagan, H. and S. Ginoza,
"RFC Style Guide",
RFC 7322, September 2014.
https://www.rfc-editor.org/rfc/rfc7322

**[HTML5]**
"HTML5 Specification",
W3C Recommendation.
https://www.w3.org/TR/html5/

**[DPML-WHITEPAPER]**
Jiang, S.,
"DPML 设计白皮书",
Deepractice.ai, October 2025.
../../whitepapers/v1.0/dpml-whitepaper.zh-CN.md

---

## 附录

### 附录 A: 完整示例

#### A.1 简单 Agent

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>
  <prompt>你是一个有用的编程助手。</prompt>
</agent>
```

#### A.2 带 Markdown 提示词的 Agent

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>

  <prompt type="markdown">
# 角色
你是一名专注于数据科学的 Python 专家。

## 技能
- 使用 pandas 进行数据分析
- 使用 matplotlib 进行可视化
- 使用 scikit-learn 进行机器学习

## 原则
- 编写清晰、有文档的代码
- 解释你的推理
- 提供可工作的示例
  </prompt>
</agent>
```

#### A.3 带 JSON 配置的 Agent

```xml
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  <llm
    model="gpt-4"
    api-key="sk-xxx"
  />

  <prompt id="system">
    你是一名张家界旅游规划专家。
  </prompt>

  <config type="json">
  {
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 0.9
  }
  </config>
</agent>
```

#### A.4 多层结构

```xml
<agent>
  <llm model="gpt-4" api-key="sk-xxx"/>

  <role>
    <personality type="markdown">
我是一个具有强大分析能力的同理心助手。
当用户感到沮丧时，我首先承认他们的感受。
当用户困惑时，我会一步步详细解释。
    </personality>

    <principle>
始终将用户体验置于技术正确性之上。
使用类比和示例解释复杂概念。
    </principle>
  </role>
</agent>
```

---

### 附录 B: 完整 ABNF 语法

DPML 的形式化 ABNF 语法：

```abnf
; DPML 文档
dpml-document  = [xml-decl] root-element [comment]

; XML 声明
xml-decl       = "<?xml" WSP "version" WSP "=" WSP quoted-string
                 [WSP "encoding" WSP "=" WSP quoted-string]
                 [WSP "standalone" WSP "=" WSP quoted-string]
                 WSP "?>"

; 根元素
root-element   = element

; 元素
element        = empty-element / start-tag content end-tag

empty-element  = "<" element-name *attribute WSP "/>"

start-tag      = "<" element-name *attribute ">"

end-tag        = "</" element-name ">"

; 元素名称（kebab-case）
element-name   = lowercase-word *("-" lowercase-word)

lowercase-word = ALPHA *(ALPHA / DIGIT)

; 属性
attribute      = WSP attribute-name "=" quoted-string

attribute-name = lowercase-word *("-" lowercase-word)

; 内容
content        = *(text / element / comment / cdata)

; 文本
text           = 1*CHAR  ; 排除 < 和 &，或使用转义

; 注释
comment        = "<!--" *(CHAR - "--") "-->"

; CDATA
cdata          = "<![CDATA[" *(CHAR - "]]>") "]]>"

; 引用字符串
quoted-string  = DQUOTE *QCHAR DQUOTE / SQUOTE *QCHAR SQUOTE

QCHAR          = %x20-21 / %x23-26 / %x28-5B / %x5D-7E  ; 可打印字符

; 基本字符
ALPHA          = %x61-7A  ; a-z
DIGIT          = %x30-39  ; 0-9
CHAR           = %x09 / %x0A / %x0D / %x20-D7FF / %xE000-FFFD
WSP            = %x20 / %x09 / %x0A / %x0D  ; 空白字符
DQUOTE         = %x22  ; "
SQUOTE         = %x27  ; '
```

---

### 附录 C: 验证算法伪代码

完整的验证算法实现：

```python
from typing import List, Optional
from dataclasses import dataclass
import re


@dataclass
class ValidationError:
    """验证错误"""
    code: str
    level: str  # 'error' | 'warning'
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    xpath: Optional[str] = None
    suggestion: Optional[str] = None


class DPMLValidator:
    """DPML 验证器"""

    def __init__(self):
        self.errors: List[ValidationError] = []
        self.kebab_pattern = re.compile(r'^[a-z][a-z0-9]*(-[a-z0-9]+)*$')
        self.id_pattern = re.compile(r'^[a-zA-Z0-9_-]+$')
        self.standard_types = {
            'text', 'markdown', 'json',
            'javascript', 'python', 'yaml'
        }

    def validate(self, doc) -> List[ValidationError]:
        """
        验证 DPML 文档

        返回: 错误列表（空列表表示文档有效）
        """
        self.errors = []

        # V001: 验证元素名
        self._validate_element_names(doc)

        # V002: 验证属性名
        self._validate_attribute_names(doc)

        # V003: 验证 type 属性
        self._validate_type_attributes(doc)

        # V004: 验证 id 属性格式
        self._validate_id_format(doc)

        # V005: 验证 id 唯一性
        self._validate_id_uniqueness(doc)

        # W001: 检查未知的 type 值
        self._check_unknown_types(doc)

        return self.errors

    def _validate_element_names(self, doc):
        """V001: 元素名必须是 kebab-case"""
        for element in doc.iter():
            if not self._is_kebab_case(element.tag):
                self.errors.append(ValidationError(
                    code="V001",
                    level="error",
                    message=f"元素名 '{element.tag}' 不是 kebab-case",
                    xpath=self._get_xpath(element),
                    suggestion=self._suggest_kebab_case(element.tag)
                ))

    def _validate_attribute_names(self, doc):
        """V002: 属性名必须是 kebab-case"""
        for element in doc.iter():
            for attr_name in element.attrib:
                if not self._is_kebab_case(attr_name):
                    self.errors.append(ValidationError(
                        code="V002",
                        level="error",
                        message=f"属性名 '{attr_name}' 不是 kebab-case",
                        xpath=self._get_xpath(element),
                        suggestion=self._suggest_kebab_case(attr_name)
                    ))

    def _validate_type_attributes(self, doc):
        """V003: type 属性值必须非空"""
        for element in doc.iter():
            if 'type' in element.attrib:
                type_value = element.attrib['type']
                if not type_value or type_value.strip() == '':
                    self.errors.append(ValidationError(
                        code="V003",
                        level="error",
                        message="type 属性值不能为空",
                        xpath=self._get_xpath(element)
                    ))

    def _validate_id_format(self, doc):
        """V004: id 属性值必须匹配模式"""
        for element in doc.iter():
            if 'id' in element.attrib:
                id_value = element.attrib['id']
                if not self.id_pattern.match(id_value):
                    self.errors.append(ValidationError(
                        code="V004",
                        level="error",
                        message=f"id 属性值 '{id_value}' 格式无效",
                        xpath=self._get_xpath(element),
                        suggestion="id 只能包含字母、数字、连字符和下划线"
                    ))

    def _validate_id_uniqueness(self, doc):
        """V005: id 在文档中必须唯一"""
        id_map = {}
        for element in doc.iter():
            if 'id' in element.attrib:
                id_value = element.attrib['id']
                if id_value in id_map:
                    self.errors.append(ValidationError(
                        code="V005",
                        level="error",
                        message=f"重复的 id: '{id_value}'",
                        xpath=self._get_xpath(element),
                        suggestion=f"第一次出现在: {self._get_xpath(id_map[id_value])}"
                    ))
                else:
                    id_map[id_value] = element

    def _check_unknown_types(self, doc):
        """W001: 检查未知的 type 值"""
        for element in doc.iter():
            if 'type' in element.attrib:
                type_value = element.attrib['type']
                if type_value not in self.standard_types:
                    self.errors.append(ValidationError(
                        code="W001",
                        level="warning",
                        message=f"未知的 type 值: '{type_value}'",
                        xpath=self._get_xpath(element),
                        suggestion=f"标准 type 值: {', '.join(self.standard_types)}"
                    ))

    def _is_kebab_case(self, name: str) -> bool:
        """检查是否为 kebab-case"""
        return bool(self.kebab_pattern.match(name))

    def _suggest_kebab_case(self, name: str) -> str:
        """建议 kebab-case 形式"""
        # 简单转换：驼峰 -> kebab
        result = re.sub(r'([A-Z])', r'-\1', name).lower()
        result = result.lstrip('-')
        # 下划线 -> 连字符
        result = result.replace('_', '-')
        return f"建议使用: '{result}'"

    def _get_xpath(self, element) -> str:
        """获取元素的 XPath"""
        # 简化版本，实际实现应该更完整
        path = []
        current = element
        while current is not None:
            path.insert(0, current.tag)
            current = current.getparent()
        return '/' + '/'.join(path)


# 使用示例
def validate_dpml_file(file_path: str) -> bool:
    """
    验证 DPML 文件

    返回: True 如果有效，False 如果无效
    """
    from lxml import etree

    # 解析文件
    try:
        doc = etree.parse(file_path)
    except etree.XMLSyntaxError as e:
        print(f"XML 格式错误: {e}")
        return False

    # 验证
    validator = DPMLValidator()
    errors = validator.validate(doc)

    if not errors:
        print("✓ 文档有效")
        return True
    else:
        print(f"✗ 发现 {len(errors)} 个错误:")
        for error in errors:
            print(f"  [{error.code}] {error.message}")
            if error.xpath:
                print(f"      位置: {error.xpath}")
            if error.suggestion:
                print(f"      建议: {error.suggestion}")
        return False
```

---

### 附录 D: 为什么选择 XML

本附录简要说明选择 XML 作为 DPML 基础的技术原因。详细论证见 [DPML 设计白皮书](../../whitepapers/v1.0/dpml-whitepaper.zh-CN.md) 附录 C。

#### D.1 语义维度对比

| 格式 | 语义维度 | 三方协同能力 |
|------|---------|-------------|
| YAML | 2（键 + 值） | 主要服务计算机 |
| JSON | 2（键 + 值） | 主要服务计算机 |
| XML | 4（tag + attribute + content + structure） | 同时服务三方 |

#### D.2 核心优势

**Tag（标签）**
- 三方都能理解概念
- 人类：直观的语义块
- AI：概念上下文
- 计算机：节点类型

**Attribute（属性）**
- 三方都能读取配置
- 计算机：键值对解析
- AI：参数理解
- 人类：配置查看

**Content（内容）**
- 三方都能访问内容
- AI：自然语言空间
- 人类：可读内容
- 计算机：数据提取

**Structure（结构）**
- 三方都能利用层级
- 人类：DOM 可视化
- 计算机：树遍历
- AI：上下文关系

#### D.3 实现优势

- **成熟工具链** - 可复用 XML 解析器和工具
- **AI 原生理解** - 大模型对标签语言有强大能力
- **人类友好** - DOM 结构符合认知习惯
- **无需编译** - 直接就是最终形态

---

### 附录 E: 实现建议

#### E.1 推荐的解析库

**Python**:
```python
# 推荐: lxml（功能完整、性能好）
from lxml import etree

parser = etree.XMLParser(
    resolve_entities=False,
    no_network=True
)
doc = etree.parse('example.dpml', parser)

# 备选: xml.etree.ElementTree（标准库）
import xml.etree.ElementTree as ET
doc = ET.parse('example.dpml')
```

**JavaScript/TypeScript**:
```javascript
// Node.js: fast-xml-parser
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});
const doc = parser.parse(xmlContent);

// 浏览器: DOMParser
const parser = new DOMParser();
const doc = parser.parseFromString(xmlContent, 'application/xml');
```

**Java**:
```java
// DOM
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(new File("example.dpml"));
```

#### E.2 验证器实现

```python
class DPMLParser:
    """完整的 DPML 解析器"""

    def __init__(self, strict=True):
        self.strict = strict
        self.validator = DPMLValidator()

    def parse(self, file_path):
        """解析并验证 DPML 文件"""
        # 1. XML 解析
        doc = self._parse_xml(file_path)

        # 2. DPML 验证
        errors = self.validator.validate(doc)

        # 3. 错误处理
        if errors:
            if self.strict:
                raise DPMLValidationError(errors)
            else:
                logger.warning(f"发现 {len(errors)} 个验证错误")
                for error in errors:
                    logger.warning(f"[{error.code}] {error.message}")

        return DPMLDocument(doc, errors)

    def _parse_xml(self, file_path):
        """安全的 XML 解析"""
        from lxml import etree

        parser = etree.XMLParser(
            resolve_entities=False,
            no_network=True,
            dtd_validation=False,
            load_dtd=False
        )

        try:
            return etree.parse(file_path, parser)
        except etree.XMLSyntaxError as e:
            raise DPMLParseError(f"XML 格式错误: {e}")
```

#### E.3 性能优化建议

1. **流式解析**
   ```python
   # 对于大文件，使用 iterparse
   for event, elem in etree.iterparse('large.dpml'):
       if elem.tag == 'agent':
           # 处理 agent 元素
           process_agent(elem)
           # 清理以节省内存
           elem.clear()
   ```

2. **缓存验证结果**
   ```python
   class CachedValidator:
       def __init__(self):
           self.cache = {}

       def validate(self, file_path):
           mtime = os.path.getmtime(file_path)
           if file_path in self.cache:
               cached_mtime, cached_result = self.cache[file_path]
               if mtime == cached_mtime:
                   return cached_result

           result = self._do_validate(file_path)
           self.cache[file_path] = (mtime, result)
           return result
   ```

3. **并行验证**
   ```python
   from concurrent.futures import ThreadPoolExecutor

   def validate_many(file_paths):
       with ThreadPoolExecutor(max_workers=4) as executor:
           results = executor.map(validate_dpml_file, file_paths)
       return list(results)
   ```

---

## 作者地址

**姜山（Sean Jiang）**
Deepractice.ai
邮箱：sean@deepractice.ai
网站：https://deepractice.ai

---

**DPML 协议规范 v1.0 结束**
