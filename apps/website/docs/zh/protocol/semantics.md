# DPML 语义规范 v1.0

## 文档元数据

- **版本**: 1.0.0
- **状态**: Draft
- **最后更新**: 2025-10-04
- **作者**: 姜山 (Deepractice.ai)
- **语言**: 中文
- **英文版本**: [semantics.en.md](./semantics.en.md)

---

## 摘要

本文档定义 DPML (Deepractice Prompt Markup Language) 的语义规范，规定标签、属性、内容和结构的语义表达规则。

本规范是 [DPML 协议规范](./index.zh-CN.md) 的语义部分，与 [语法规范](./syntax.zh-CN.md) 共同构成完整的 DPML 协议。

---

## 1. 引言

### 1.1 范围

本规范定义：
- 标签的语义表达规则
- 属性的语义约定
- 内容的类型系统
- 结构的语义组合规则

本规范不定义：
- XML 语法规则（见语法规范）
- 具体领域的标签定义（见 Patterns）
- 实现技术细节

### 1.2 规范性语言

本文档中的关键词 "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", "OPTIONAL" 应按照 RFC 2119 的定义解释。

### 1.3 与其他规范的关系

```
DPML 协议规范
├── 语法规范 (Syntax)    - 定义格式和解析规则 (MUST)
└── 语义规范 (Semantics) - 定义语义表达规则 (SHOULD)
```

语义规范是**指导性的** (SHOULD)，不是**强制性的** (MUST)。实现可以根据领域需求调整。

---

## 2. 术语定义

### 2.1 核心术语

**标签 (Tag)**
: XML 元素的名称，表示一个概念或实体。

**属性 (Attribute)**
: 附加在标签上的元数据，提供技术性或配置性信息。

**内容 (Content)**
: 标签包含的实际数据或文本。

**语义 (Semantics)**
: 标签、属性、内容和结构所传达的含义。

**概念 (Concept)**
: 可以被定义、理解和传递的抽象实体。

**认知框架 (Cognitive Framework)**
: 由 DPML 标签组成的结构，用于引导 AI 的内容生成和组织。

### 2.2 设计原则术语

**标签即概念**
: 标签必须表示概念，因此必须是名词。

**约而不束**
: 标签框定内容的语义性质，但不限制具体内容的表达。

**语义正交**
: 不同标签的语义互不重叠，边界清晰。

---

## 3. 语义模型

### 3.1 四维语义

DPML 的语义通过四个维度表达：

1. **标签语义** - 标签名称表达的概念
2. **属性语义** - 属性提供的元数据
3. **内容语义** - 内容承载的信息
4. **结构语义** - 嵌套和顺序传递的关系

这四个维度共同构成完整的语义表达。

### 3.2 语义层次

```
抽象层: 标签定义"是什么"(概念)
      ↓
表达层: type 定义"怎么表达"(格式)
      ↓
内容层: 具体的信息内容
```

---

## 4. 标签语义规范

### 4.1 标签词性要求

标签 SHOULD 表达概念，优先使用名词。

**理论依据:**
- 名词表达独立概念，语义边界清晰
- 利于 AI 理解和人类认知
- 概念化标签易于组合和复用

**推荐做法:**
- 优先使用名词（如：`<agent>`, `<prompt>`, `<config>`）
- 动作性概念名词化（如：validate → `<validation>`, execute → `<execution>`）
- 状态性概念可用形容词名词化（如：pending → `<pending-state>` 或直接 `<pending>`）

**允许的例外:**
- 动作性概念，当名词化会产生歧义时（如：`<execute>` 表示执行动作本身）
- 状态性概念，当形容词本身已成为领域共识术语（如：`<required>`, `<optional>`）

**不推荐:**
- 纯动词标签且可名词化（如：`<validate>` 应改为 `<validation>`）
- 形容词标签且应为属性（如：`<enabled>` 应改为 `enabled="true"`）

### 4.2 标签命名规范

标签名称 MUST 使用 kebab-case（短横线分隔）。

标签名称 SHOULD 满足：
- 长度：1-3 个单词
- 语义：清晰且自解释
- 通用性：优先使用领域通用术语

标签名称 SHOULD NOT 使用缩写，除非是广泛认可的术语（如 id, url）。

### 4.3 标签单复数规范

标签 SHOULD 使用单数形式。

**理由:** XML 原生支持元素重复，无需通过复数标记表达数量。

**例外:** 当复数形式本身具有独立语义时 MAY 使用复数（如 dependencies vs dependency）。

---

## 5. 属性语义规范

### 5.1 属性的性质

属性主要面向计算机处理，提供元数据和技术约束。

属性不受标签词性约束的限制。属性的命名和语义 SHOULD 由领域自定义。

### 5.2 保留属性

协议定义以下保留属性：

**type**
: 指定内容的表达格式（见 6.1 内容类型系统）。

**id**
: 元素的唯一标识符（见语法规范）。

领域定义的属性 SHOULD NOT 与保留属性冲突。

### 5.3 属性 vs 子元素

元数据性质的信息 SHOULD 使用属性。
语义核心内容 SHOULD 使用子元素。

---

## 6. 内容语义规范

### 6.1 内容类型系统

#### 6.1.1 type 属性

标签 MAY 使用 `type` 属性指定内容的表达格式。

`type` 属性的设计目的：
- 当需要复杂表达时，避免创造过度嵌套的标签结构
- 允许使用成熟的 DSL（领域特定语言）表达复杂内容
- 保持标签语义的纯粹性

#### 6.1.2 标准 type 值

v1.0 定义以下标准 type 值：

| type 值 | 语义 |
|---------|------|
| text | 纯文本或自然语言（默认） |
| markdown | Markdown 格式文本 |

未指定 `type` 属性时，默认为 `type="text"`。

#### 6.1.3 type 值的扩展

实现 MAY 定义额外的 type 值以支持特定格式（如 json, python, yaml）。

**命名约定:**

自定义 type 值 SHOULD 直接使用格式名称或语言名称，不使用中间抽象层。

- **标准格式直接用名称**：`json`, `yaml`, `xml`, `toml`
- **编程语言用语言名**：`python`, `javascript`, `rust`, `java`
- **自定义格式建议命名空间**：`x-custom-format`, `myorg-format`

**示例:**
```xml
<!-- 推荐：直接使用格式名 -->
<code type="python">
def hello():
    print("Hello")
</code>

<!-- 不推荐：使用中间抽象层 -->
<code type="code" language="python">  <!-- 过度复杂 -->
```

**扩展机制:**

为避免 type 值冲突和促进生态互操作，DPML 社区提供以下机制：

1. **Type Registry（类型注册表）**
   - 仓库地址：`https://github.com/deepractice/dpml-registry`（规划中）
   - 维护已知 type 值的列表和定义
   - 包含格式说明、解析规范和示例

2. **注册流程（推荐，非强制）**
   - 提交 PR 到 DPML Registry
   - 提供 type 值名称、格式定义、处理规范
   - 社区 review 后合并
   - 注册后的 type 值获得"社区认可"标记

3. **命名空间约定**
   - 未注册的自定义 type 建议使用 `x-` 前缀（实验性）
   - 组织特定 type 建议使用组织标识前缀（如 `myorg-format`）

**冲突处理:**

- v1.0 不强制注册，实现可自由定义 type 值
- 建议优先采用社区已注册的 type 值
- 如遇冲突，优先采用"先注册"原则

#### 6.1.4 type 的嵌套限制

v1.0 不支持嵌套的 type 定义。一个元素只能有一个 type 值。

包含不同格式内容时，SHOULD 使用父级 type 的语法特性（如 markdown 的代码块）。

### 6.2 语义框定原则

标签 SHOULD 框定内容的**性质**，而非内容本身。

**"约而不束"的实现:**
- 约：通过标签名称框定内容应该是什么性质的信息
- 不束：不限制具体内容的表达方式和创造性

---

## 7. 结构语义规范

### 7.1 嵌套语义

标签的嵌套关系表达"包含"或"属于"的语义关系。

子元素 SHOULD 语义上属于父元素。

### 7.2 顺序语义

元素的顺序 MAY 具有语义（如流程步骤）或 MAY 仅为组织目的。

当顺序具有语义时，SHOULD 通过元素名称或属性明确表达。

### 7.3 语义正交性

同一层次的元素 SHOULD 语义正交（互不重叠）。

---

## 8. 认知框架

### 8.1 定义

认知框架是由 DPML 标签组成的结构，用于引导 AI 的内容生成和思维组织。

**核心特性:**
- 通过标签框定"应该生成什么性质的内容"
- 不限制具体内容本身
- 是可复制的模式（Pattern）

### 8.2 设计原则

#### 8.2.1 完备性原则

认知框架 SHOULD 覆盖目标认知过程的所有关键维度。

**完备性检查:**
- 是否涵盖了思维过程的主要阶段？
- 遗漏某个标签会导致输出不完整吗？
- 框架是否引导了完整的认知闭环？

**示例 - 问题分析框架:**
```xml
<analysis>
  <situation>当前状况</situation>     <!-- 观察 -->
  <problem>核心问题</problem>         <!-- 识别 -->
  <root-cause>根本原因</root-cause>   <!-- 分析 -->
  <solution>解决方案</solution>       <!-- 决策 -->
</analysis>
```

**反例 - 不完备:**
```xml
<analysis>
  <problem>核心问题</problem>
  <solution>解决方案</solution>
  <!-- 缺少观察和分析阶段，框架不完整 -->
</analysis>
```

#### 8.2.2 正交性原则

框架内的元素 SHOULD 语义正交（互不重叠）。

**正交性检查:**
- 两个标签的内容能否合并？
- 某个标签的内容会不会同时符合另一个标签？
- 标签间是否有明确的语义边界？

**示例 - 正交性良好:**
```xml
<evaluation>
  <strengths>优势</strengths>
  <weaknesses>不足</weaknesses>
  <opportunities>机会</opportunities>
  <threats>威胁</threats>
</evaluation>
<!-- SWOT 四个维度互不重叠 -->
```

**反例 - 语义重叠:**
```xml
<evaluation>
  <good-points>优点</good-points>
  <advantages>优势</advantages>      <!-- 与 good-points 语义重叠 -->
  <bad-points>缺点</bad-points>
</evaluation>
```

#### 8.2.3 层次性原则

框架 SHOULD 具有清晰的层次结构，体现认知过程的逻辑关系。

**层次设计:**
- 并列关系：同级标签表达同类性质的内容
- 包含关系：父标签包含子标签，表达整体与部分
- 顺序关系：标签顺序反映认知流程

**示例 - 层次清晰:**
```xml
<decision>
  <context>背景</context>
  <options>
    <option id="a">方案A</option>
    <option id="b">方案B</option>
  </options>
  <analysis>
    <pros>优势分析</pros>
    <cons>劣势分析</cons>
  </analysis>
  <recommendation>推荐决策</recommendation>
</decision>
```

### 8.3 设计反模式

#### 8.3.1 过度嵌套

**问题:** 层级过深（>3层），增加理解和使用成本。

**反例:**
```xml
<analysis>
  <level1>
    <level2>
      <level3>
        <level4>内容</level4>
      </level3>
    </level2>
  </level1>
</analysis>
```

**改进:** 扁平化或使用属性
```xml
<analysis>
  <insight category="level1.level2.level3">内容</insight>
</analysis>
```

#### 8.3.2 概念混淆

**问题:** 标签名称抽象或模糊，AI 和人类难以理解应该填充什么内容。

**反例:**
```xml
<thing>
  <stuff>...</stuff>
  <info>...</info>
</thing>
```

**改进:** 使用具体、自解释的标签名
```xml
<product-review>
  <features>...</features>
  <user-feedback>...</user-feedback>
</product-review>
```

#### 8.3.3 语义冗余

**问题:** 多个标签表达相同或高度重叠的语义。

**反例:**
```xml
<report>
  <summary>摘要</summary>
  <abstract>摘要</abstract>      <!-- 冗余 -->
  <overview>概览</overview>       <!-- 冗余 -->
</report>
```

**改进:** 合并为单一标签或明确区分
```xml
<report>
  <executive-summary>执行摘要</executive-summary>
  <technical-details>技术细节</technical-details>
</report>
```

### 8.4 设计检查清单

在发布认知框架前，使用以下检查清单验证：

**完备性:**
- [ ] 框架覆盖了认知过程的所有关键阶段
- [ ] 每个标签都有明确的用途和价值
- [ ] 没有遗漏的关键维度

**正交性:**
- [ ] 标签间语义边界清晰
- [ ] 没有内容可以同时归入两个标签
- [ ] 没有明显的语义重叠

**可用性:**
- [ ] 标签名称自解释
- [ ] 层级结构清晰（≤3层）
- [ ] AI 和人类都能理解应该填充什么

**一致性:**
- [ ] 遵循命名规范（kebab-case）
- [ ] 标签词性一致（优先名词）
- [ ] 层次关系符合逻辑

### 8.5 实践建议

**从简单开始:**
- 先设计 2-3 个核心标签
- 验证框架可用性后再扩展
- 避免过早优化

**参考成熟模式:**
- 5W1H（What/Why/When/Where/Who/How）
- SWOT（Strengths/Weaknesses/Opportunities/Threats）
- PDCA（Plan/Do/Check/Act）

**迭代优化:**
- 收集实际使用反馈
- 观察 AI 生成质量
- 根据数据调整框架

**文档化:**
- 说明框架的适用场景
- 提供示例用法
- 解释每个标签的预期内容

---

## 9. 一致性要求

### 9.1 符合性级别

**完全符合 (Full Conformance)**
: 标签遵循所有 MUST 要求，并遵循大部分 SHOULD 建议。

**基本符合 (Basic Conformance)**
: 标签遵循所有 MUST 要求。

**不符合 (Non-Conformance)**
: 标签违反任何 MUST 要求。

### 9.2 验证

语义符合性 MAY 通过以下方式验证：
- 人工审查
- 自动化语义分析工具
- Pattern 定义的具体规则

---

## 10. 扩展机制

### 10.1 自定义标签

实现 MAY 定义领域特定的标签。

自定义标签 MUST 遵循本规范的标签语义要求（第 4 节）。

自定义标签 SHOULD 通过 Pattern 定义其语义和用法。

### 10.2 自定义属性

实现 MAY 定义领域特定的属性。

自定义属性 SHOULD NOT 与保留属性冲突。

### 10.3 自定义 type 值

实现 MAY 定义额外的 type 值。

自定义 type 值 SHOULD 有明确的格式定义和处理规范。

---

## 11. 参考文献

### 11.1 规范性引用

**[RFC2119]**
Bradner, S.,
"Key words for use in RFCs to Indicate Requirement Levels",
BCP 14, RFC 2119, March 1997.
https://www.rfc-editor.org/rfc/rfc2119

### 11.2 信息性引用

**[DPML-PROTOCOL]**
Jiang, S.,
"DPML 协议规范总览",
Deepractice.ai, October 2025.
./index.zh-CN.md

**[DPML-SYNTAX]**
Jiang, S.,
"DPML 语法规范",
Deepractice.ai, October 2025.
./syntax.zh-CN.md

**[DPML-WHITEPAPER]**
Jiang, S.,
"DPML 设计白皮书",
Deepractice.ai, October 2025.
../whitepaper/index.zh-CN.md

**[PATTERN-META]**
Jiang, S.,
"Meta-Pattern: 模式定义的模式",
Deepractice.ai, October 2025.
../patterns/meta/pattern.dpml

---

## 附录 A: 术语索引

| 术语 | 定义位置 |
|------|---------|
| 标签 (Tag) | 2.1 |
| 属性 (Attribute) | 2.1 |
| 内容 (Content) | 2.1 |
| 语义 (Semantics) | 2.1 |
| 概念 (Concept) | 2.1 |
| 认知框架 (Cognitive Framework) | 2.1, 8.1 |
| 标签即概念 | 2.2, 4.1 |
| 约而不束 | 2.2, 6.2 |
| 语义正交 | 2.2, 7.3 |
| 四维语义 | 3.1 |

---

**版本历史:**
- v1.0.0 (2025-10-04) - 初始版本
