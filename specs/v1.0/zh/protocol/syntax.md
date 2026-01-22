# DPML 语法规范 v1.0

## 文档元数据

- **版本**: 1.0.0
- **状态**: Draft
- **最后更新**: 2025-10-04
- **作者**: 姜山 (Deepractice.ai)
- **语言**: 中文
- **英文版本**: [syntax.en.md](./syntax.en.md)

---

## 摘要

本文档定义 DPML (Deepractice Prompt Markup Language) 的**语法规范**,包括 XML 格式要求、解析规则和验证标准。

本规范是 [DPML 协议规范](./index.zh-CN.md) 的**语法部分**,关注"**能不能解析**"(计算机视角)。

语义规范参见 [semantics.zh-CN.md](./semantics.zh-CN.md),设计理念参见 [DPML 设计白皮书](../whitepaper/index.zh-CN.md)。

---

## 目录

1. [引言](#1-引言)
2. [语法规范](#2-语法规范)
3. [元素规范](#3-元素规范)
4. [属性规范](#4-属性规范)
5. [内容规范](#5-内容规范)
6. [文件格式](#6-文件格式)
7. [验证规则](#7-验证规则)
8. [一致性要求](#8-一致性要求)
9. [IANA 考虑](#9-iana-考虑)
10. [参考文献](#10-参考文献)
11. [附录](#附录)

---

## 1. 引言

### 1.1 目标

DPML 协议旨在：

1. **定义精确语法** - 明确什么是合法的 DPML 文档
2. **规范解析行为** - 确保不同实现的一致性
3. **保持简洁性** - 核心概念 ≤ 5 个
4. **预留扩展性** - 支持未来演进

**5 个核心概念**：

- **元素（Element）** - 表示概念的 XML 标签
- **属性（Attribute）** - 机器可解析的配置
- **内容（Content）** - AI 和人类可读的文本
- **保留属性（type/id）** - 协议层定义的通用属性
- **文件格式（.dpml/.pml）** - 标准化容器

### 1.2 范围

**本规范定义**：

- 核心语法（元素、属性、内容的格式规则）
- 验证规则（格式正确性和结构有效性）
- 一致性要求（不同实现的兼容性保证）

**本规范不定义**：

- 领域语义（`<agent>`、`<task>` 的具体含义由领域规范定义）
- 运行时行为（元素如何执行由实现决定）
- 高级扩展（命名空间、版本控制预留给未来版本）

### 1.3 术语

**DPML 文档**
包含 DPML 标记的文件，使用 `.dpml` 或 `.pml` 扩展名。

**元素（Element）**
表示概念的 XML 标签结构，包含开始标签、结束标签（或自闭合）、可选的属性和内容。

**属性（Attribute）**
附加到元素的键值对，格式为 `name="value"`。

**内容（Content）**
元素内的文本数据或子元素。

**保留属性**
协议层定义的通用属性：`type`（内容格式类型）、`id`（唯一标识符）。

**格式良好（Well-Formed）**
符合 XML 1.0 语法规则的文档。

**有效（Valid）**
同时满足格式良好和 DPML 验证规则的文档。

**kebab-case**
全小写字母，单词间用连字符分隔（如 `travel-planner`）。

**领域（Domain）**
DPML 的专门化应用区域（如 Agent、Task），由独立规范定义。

### 1.4 需求语言

关键词"必须（MUST）"、"禁止（MUST NOT）"、"应该（SHOULD）"、"不应该（SHOULD NOT）"、"可以（MAY）"按照 RFC 2119 解释。

### 1.5 协议概述

DPML 是 **XML 1.0 的受约束子集**：

- **基于** XML 1.0 规范 [XML]
- **增加** 命名约定、保留属性、验证规则
- **移除** DTD、XML Schema、处理指令、实体（为简洁性）

**层次结构**：

```
┌─────────────────────────────────────────────┐
│           DPML 协议（本规范）               │
│  • 语法规则                                 │
│  • 元语义（tag/attribute/content/structure）│
│  • 保留属性（type/id）                      │
│  • 验证规则                                 │
└─────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────┐
│           领域规范（独立文档）              │
│  • 定义具体元素（如 <agent>）               │
│  • 定义领域特定属性和验证规则               │
└─────────────────────────────────────────────┘
```

**一致性级别**：

- **Level 1: 基础解析器** - 正确解析格式良好的文档，验证 kebab-case，识别保留属性
- **Level 2: 验证解析器** - Level 1 + 执行完整验证规则
- **Level 3: 领域感知解析器** - Level 2 + 支持至少一个领域规范的验证

---

## 2. 语法规范

### 2.1 基本结构

DPML 文档必须是格式良好的 XML：

```xml
<element-name attribute-name="attribute-value">
  内容或子元素
</element-name>
```

**ABNF 定义**：

```text
dpml-document  = [xml-decl] root-element
root-element   = element
element        = start-tag content end-tag / empty-element
start-tag      = "<" element-name *attribute ">"
end-tag        = "</" element-name ">"
empty-element  = "<" element-name *attribute "/>"
```

### 2.2 命名约定

#### 2.2.1 元素名称

元素名称必须遵循 **kebab-case**：

**语法规则**：

- 全部小写字母（a-z）
- 可以包含数字（0-9），但不能以数字开头
- 单词之间用连字符（-）分隔
- 禁止下划线（\_）、驼峰命名

**ABNF 定义**：

```text
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
<Agent>           <!-- 大写 -->
<travelPlanner>   <!-- 驼峰 -->
<api_config>      <!-- 下划线 -->
<2fa-auth>        <!-- 以数字开头 -->
```

#### 2.2.2 属性名称

属性名称必须遵循与元素相同的 **kebab-case** 规则。

### 2.3 字符编码

DPML 文档应该使用 **UTF-8** 编码。

**规则**：

- UTF-8 是推荐编码，实现必须支持
- 如使用其他编码，必须包含 XML 声明：
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  ```

### 2.4 空白字符处理

**空白字符定义**：空格（U+0020）、制表符（U+0009）、换行符（U+000A）、回车符（U+000D）

**处理规则**：

- **元素内容**：协议层必须保留所有空白字符（遵循 XML 1.0）
- **属性值**：必须保留前导、尾随和内部空白
- **标签之间**：格式化空白可以忽略

---

## 3. 元素规范

### 3.1 元素结构

#### 3.1.1 容器元素

```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>你是助手</prompt>
</agent>
```

#### 3.1.2 自闭合元素

```xml
<llm model="gpt-4" api-key="sk-xxx"/>
```

#### 3.1.3 文本内容元素

```xml
<prompt>你是一个有用的助手</prompt>
```

### 3.2 混合内容

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

### 3.3 协议层约束

**协议定义**：

- 命名必须是 kebab-case
- 必须使用共识概念（推荐）

**协议不定义**：

- 哪些元素存在（由领域规范定义）
- 元素的层次规则
- 必需或可选
- 元素顺序

---

## 4. 属性规范

### 4.1 属性语法

**基本格式**：

```xml
<element attr1="value1" attr2="value2">
```

**规则**：

- 属性名必须是 kebab-case
- 属性值必须用引号（单引号或双引号）
- 同一元素的属性名不能重复
- 属性顺序对语义无影响

**转义规则**：

- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`（双引号属性值中）
- `'` → `&apos;`（单引号属性值中）

### 4.2 保留属性

#### 4.2.1 `type` 属性

**用途**：指示元素内容的格式类型

**默认值**：`text`

**v1.0 规范性类型值**：

| 类型值     | 内容格式          | 规范性               |
| ---------- | ----------------- | -------------------- |
| `text`     | 纯文本/自然语言   | **MUST 支持** (默认) |
| `markdown` | Markdown 格式文本 | **MUST 支持**        |

**扩展类型值**(示例，非规范性要求)：

| 类型值       | 内容格式   | 说明                   |
| ------------ | ---------- | ---------------------- |
| `json`       | JSON       | 数据结构，实现可选支持 |
| `javascript` | JavaScript | 代码，实现可选支持     |
| `python`     | Python     | 代码，实现可选支持     |
| `yaml`       | YAML       | 数据结构，实现可选支持 |

**示例**：

```xml
<!-- v1.0 规范性类型 -->
<prompt type="markdown">
# 系统提示词
你是一个助手。
</prompt>

<!-- 扩展类型示例 (可选支持) -->
<config type="json">
{
  "timeout": 30,
  "retry": 3
}
</config>
```

**处理规则**：

- 实现**必须**识别 `type` 属性
- 实现**必须**支持 `text` 和 `markdown`
- 实现**可以**支持扩展类型值(如 json, python 等)
- 未识别的类型值**应该**视为 `text` 并记录警告 W01

#### 4.2.2 `id` 属性

**用途**：元素的唯一标识符

**语法规则**：

- 在单个文档中必须唯一
- 可以包含字母、数字、连字符、下划线
- 推荐使用 kebab-case

**示例**：

```xml
<prompt id="travel-system-prompt">
  你是一名旅游规划专家。
</prompt>
```

**保留用途**：

- v1.0：仅用于标识，不支持引用
- 未来版本：支持引用机制

### 4.3 领域特定属性

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
- 协议层面都是字符串
- 类型解释由领域规范定义

---

## 5. 内容规范

### 5.1 内容类型

元素内容可以是：

1. **文本内容** - 自然语言或数据
2. **子元素** - 嵌套概念
3. **混合内容** - 文本 + 子元素
4. **空** - 自闭合元素

### 5.2 特殊字符和转义

**必须转义的字符**：

| 字符 | 转义形式 | 使用场景 |
| ---- | -------- | -------- |
| `<`  | `&lt;`   | 总是     |
| `&`  | `&amp;`  | 总是     |
| `>`  | `&gt;`   | 推荐     |

**代码内容处理**：

对于 `type="javascript"`、`type="python"` 等代码类型，推荐使用 CDATA：

```xml
<script type="javascript"><![CDATA[
if (x < 10 && y > 5) {
  console.log("Valid");
}
]]></script>
```

### 5.3 空白字符规范化

**规则**：

- 协议层：必须保留所有空白字符
- 领域层：可以定义规范化规则

---

## 6. 文件格式

### 6.1 文件扩展名

DPML 文档必须使用以下扩展名之一：

- **`.dpml`** - 主要的官方扩展名（推荐）
- **`.pml`** - 短别名，完全等价

### 6.2 MIME 类型

**主要 MIME 类型**：`application/dpml+xml`
**备选 MIME 类型**：`text/dpml+xml`

### 6.3 文档结构

#### 6.3.1 根元素

DPML 文档必须有且仅有一个根元素。

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

#### 6.3.2 XML 声明

XML 声明是可选的：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<agent>
  ...
</agent>
```

**推荐**：

- 如果编码不是 UTF-8，必须包含 XML 声明
- 为了明确性，推荐总是包含

#### 6.3.3 注释

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

### 6.4 最小文档

最小的有效 DPML 文档：

```xml
<agent/>
```

---

## 7. 验证规则

### 7.1 格式良好性

文档必须满足 XML 1.0 格式良好性规则：

1. **唯一根元素**
2. **标签正确嵌套**
3. **属性值正确引用**
4. **特殊字符正确转义**

### 7.2 DPML 特定规则

#### 规则 V1: 命名规范

- **V1.1**: 所有元素名必须是 kebab-case
- **V1.2**: 所有属性名必须是 kebab-case

#### 规则 V2: 保留属性

- **V2.1**: `type` 属性值必须非空
- **V2.2**: `id` 属性值必须匹配模式 `^[a-zA-Z0-9_-]+$`
- **V2.3**: `id` 在文档中必须唯一

### 7.3 错误代码

**致命错误（E 系列）**：

| 代码 | 描述         |
| ---- | ------------ |
| E01  | 文件读取失败 |
| E02  | XML 格式不良 |

**验证错误（V 系列）**：

| 代码 | 描述                  |
| ---- | --------------------- |
| V11  | 元素名不是 kebab-case |
| V12  | 属性名不是 kebab-case |
| V21  | type 属性值无效       |
| V22  | id 属性值格式无效     |
| V23  | id 重复               |

**警告（W 系列）**：

| 代码 | 描述           |
| ---- | -------------- |
| W01  | 未知的 type 值 |
| W02  | 推荐使用 UTF-8 |

### 7.4 错误报告格式

实现应该提供结构化的错误报告：

```json
{
  "valid": false,
  "errors": [
    {
      "code": "V11",
      "level": "error",
      "message": "元素名 'TravelPlanner' 不是 kebab-case",
      "location": {
        "line": 5,
        "column": 3
      },
      "suggestion": "使用 'travel-planner'"
    }
  ]
}
```

---

## 8. 一致性要求

### 8.1 必须实现（MUST）

所有实现必须：

1. 正确解析格式良好的 DPML 文档
2. 支持 UTF-8 编码
3. 验证 kebab-case 命名规范
4. 识别保留属性（type、id）
5. 报告规定的错误代码

### 8.2 应该实现（SHOULD）

实现应该：

1. 提供 DOM API
2. 支持独立验证功能
3. 支持扩展 type 值（json/javascript/python/yaml 等）

### 8.3 扩展机制

#### 8.3.1 自定义元素

领域规范可以定义自定义元素，但必须遵循 kebab-case。

#### 8.3.2 自定义属性

领域规范可以定义自定义属性，但：

- 必须遵循 kebab-case
- 不能与保留属性（type、id）冲突
- 推荐使用 `x-` 前缀标识实验性属性

#### 8.3.3 自定义 type 值

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
- 应该记录警告 W01
- 不应该导致验证失败

### 8.4 版本兼容性

DPML v1.0 文档在未来版本中必须保持有效。

**规则**：

- v1.0 的所有语法在 v2.0+ 中仍然有效
- 新版本可以添加新功能，但不能破坏旧语法
- 缺少版本声明时，应假定为 v1.0

### 8.5 安全要求

实现必须遵循 XML 1.0 安全最佳实践：

- **禁用** DTD 和外部实体（防止 XXE 攻击）
- **禁用** 实体扩展（防止十亿笑攻击）
- **默认禁用** 代码执行（`type="javascript"` / `type="python"`）

---

## 9. IANA 考虑

### 9.1 媒体类型注册

**类型名称**：application
**子类型名称**：dpml+xml
**必需参数**：无
**可选参数**：charset（默认 UTF-8）

**安全考虑**：实现必须禁用 DTD 和外部实体，默认禁用代码执行。

**已发布规范**：本文档

**使用此媒体类型的应用**：AI 开发工具、提示词工程平台、Agent 配置系统、工作流编排引擎

**文件扩展名**：`.dpml`、`.pml`

**联系人**：姜山 (Sean Jiang) <sean@deepractice.ai>

**预期用途**：COMMON

**作者/变更控制器**：Deepractice.ai

---

## 10. 参考文献

### 10.1 规范性引用

**[XML]**
Bray, T., et al.,
"Extensible Markup Language (XML) 1.0 (Fifth Edition)",
W3C Recommendation, November 2008.
https://www.w3.org/TR/xml/

**[RFC2119]**
Bradner, S.,
"Key words for use in RFCs to Indicate Requirement Levels",
BCP 14, RFC 2119, March 1997.
https://www.rfc-editor.org/rfc/rfc2119

### 10.2 信息性引用

**[DPML-PROTOCOL]**
Jiang, S.,
"DPML 协议规范总览",
Deepractice.ai, October 2025.
./index.zh-CN.md

**[DPML-SEMANTICS]**
Jiang, S.,
"DPML 语义规范",
Deepractice.ai, October 2025.
./semantics.zh-CN.md

**[DPML-WHITEPAPER]**
Jiang, S.,
"DPML 设计白皮书",
Deepractice.ai, October 2025.
../whitepaper/index.zh-CN.md

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
  <llm model="gpt-4" api-key="sk-xxx"/>

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

```text
; DPML 文档
dpml-document  = [xml-decl] root-element

; XML 声明
xml-decl       = "<?xml" WSP "version" WSP "=" WSP quoted-string
                 [WSP "encoding" WSP "=" WSP quoted-string] WSP "?>"

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
quoted-string  = dquoted-string / squoted-string
dquoted-string = DQUOTE *dqchar DQUOTE
squoted-string = SQUOTE *sqchar SQUOTE

; 字符串内字符（排除引号和特殊字符，或使用转义）
dqchar         = %x20-21 / %x23-26 / %x28-D7FF / %xE000-FFFD / escaped-char
                 ; 排除 " (%x22) 和控制字符
sqchar         = %x20-26 / %x28-D7FF / %xE000-FFFD / escaped-char
                 ; 排除 ' (%x27) 和控制字符

; 转义字符
escaped-char   = "&lt;" / "&gt;" / "&amp;" / "&quot;" / "&apos;"

; 基本字符
ALPHA          = %x61-7A  ; a-z
DIGIT          = %x30-39  ; 0-9
CHAR           = %x09 / %x0A / %x0D / %x20-D7FF / %xE000-FFFD
WSP            = %x20 / %x09 / %x0A / %x0D
DQUOTE         = %x22     ; "
SQUOTE         = %x27     ; '
```

---

## 作者地址

**姜山（Sean Jiang）**
Deepractice.ai
邮箱：sean@deepractice.ai
网站：https://deepractice.ai

---

**DPML 协议规范 v1.0**
