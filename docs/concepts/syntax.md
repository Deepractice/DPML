# DPML 语法概念

本文档介绍 DPML 的核心语法概念：Element（元素）、Attribute（属性）、Content（内容）以及保留属性。

## 概述

DPML 采用类 XML 语法，这不是巧合，而是基于**四维语义理论**的必然选择。类 XML 语法是唯一能同时服务人类、AI 和计算机的格式，具有 4 个独立的语义维度。

```xml
<element-name attribute-name="attribute-value">
  内容或子元素
</element-name>
```

## Element（元素）

元素是 DPML 的基本构建单元，使用标签表示概念。

### 命名规则

元素名必须遵循 **kebab-case** 命名约定：

- 全部小写字母 (a-z)
- 可以包含数字 (0-9)，但不能以数字开头
- 单词之间用连字符 (-) 分隔
- 禁止下划线 (_) 和驼峰命名

```xml
<!-- 有效的元素名 -->
<agent>
<travel-planner>
<api-config>
<tool-call-v2>

<!-- 无效的元素名 -->
<Agent>           <!-- 大写 -->
<travelPlanner>   <!-- 驼峰 -->
<api_config>      <!-- 下划线 -->
<2fa-auth>        <!-- 以数字开头 -->
```

### 元素形式

#### 容器元素

包含子元素或内容的元素：

```xml
<agent>
  <llm model="gpt-4"/>
  <prompt>你是助手</prompt>
</agent>
```

#### 自闭合元素

没有内容的空元素：

```xml
<llm model="gpt-4" api-key="sk-xxx"/>
```

#### 文本内容元素

包含文本内容的元素：

```xml
<prompt>你是一个有用的助手</prompt>
```

### 元素在代码中的表示

解析后，元素表示为 `DPMLNode` 对象：

```typescript
interface DPMLNode {
  readonly tagName: string;          // 元素名
  readonly attributes: Map<string, string>;  // 属性集合
  readonly children: DPMLNode[];     // 子元素
  readonly content: string;          // 文本内容
  readonly parent: DPMLNode | null;  // 父元素
}
```

## Attribute（属性）

属性是附加到元素的键值对，用于表示配置信息。

### 语法规则

```xml
<element attr1="value1" attr2="value2">
```

- 属性名必须是 kebab-case
- 属性值必须用引号（单引号或双引号）
- 同一元素的属性名不能重复
- 属性顺序对语义无影响

### 转义规则

属性值中的特殊字符需要转义：

| 字符 | 转义形式 |
|------|----------|
| `<`  | `&lt;`   |
| `>`  | `&gt;`   |
| `&`  | `&amp;`  |
| `"`  | `&quot;` |
| `'`  | `&apos;` |

### 属性的语义职责

属性主要服务于**计算机解析**，用于传递结构化配置：

```xml
<llm
  model="gpt-4"
  api-key="sk-xxx"
  temperature="0.7"
  max-tokens="2000"
/>
```

### 属性在代码中的访问

```typescript
const document = parse('<llm model="gpt-4"/>');
const node = document.rootNode;

// 通过 Map 访问属性
const model = node.attributes.get('model');  // 'gpt-4'
```

## Content（内容）

内容是元素内的文本数据，用于表示自然语言或数据。

### 内容类型

1. **文本内容** - 纯文本或自然语言
2. **子元素** - 嵌套的元素
3. **混合内容** - 文本和子元素混合
4. **空** - 自闭合元素

### 文本内容

```xml
<prompt>你是一个有用的编程助手。</prompt>
```

### 混合内容

```xml
<prompt>
  你是一个具有以下技能的助手：
  <skill>规划</skill>
  <skill>分析</skill>
</prompt>
```

混合内容在语法上合法，但领域规范可以限制为纯文本或纯子元素。

### 内容的语义职责

内容主要服务于 **AI 理解**，是自然语言的表达空间：

- 不受配置语法约束
- 支持多行文本
- 支持 Markdown 格式（通过 `type="markdown"`）

### 特殊字符处理

内容中必须转义的字符：

| 字符 | 转义形式 |
|------|----------|
| `<`  | `&lt;`   |
| `&`  | `&amp;`  |

对于代码类型的内容，推荐使用 CDATA：

```xml
<script type="javascript"><![CDATA[
if (x < 10 && y > 5) {
  console.log("Valid");
}
]]></script>
```

## 保留属性

DPML 协议层定义了两个保留属性，所有元素都可以使用。

### type 属性

指示元素内容的格式类型。

**默认值**：`text`

**规范性类型值**：

| 类型值 | 内容格式 | 支持级别 |
|--------|----------|----------|
| `text` | 纯文本/自然语言 | **必须支持** (默认) |
| `markdown` | Markdown 格式 | **必须支持** |

**扩展类型值**（实现可选支持）：

| 类型值 | 内容格式 |
|--------|----------|
| `json` | JSON 数据 |
| `javascript` | JavaScript 代码 |
| `python` | Python 代码 |
| `yaml` | YAML 数据 |

**示例**：

```xml
<!-- 默认为 text -->
<prompt>你是一个助手。</prompt>

<!-- 显式指定 markdown -->
<prompt type="markdown">
# 角色
你是一名数据科学专家。

## 技能
- 数据分析
- 机器学习
</prompt>

<!-- 扩展类型 -->
<config type="json">
{
  "timeout": 30,
  "retry": 3
}
</config>
```

**处理规则**：

- 实现必须识别 `type` 属性
- 实现必须支持 `text` 和 `markdown`
- 未识别的类型值应视为 `text` 并记录警告

### id 属性

元素的唯一标识符。

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

**当前用途**：

- v1.0：仅用于标识，支持通过 `nodesById` 快速访问
- 未来版本：支持引用机制

**在代码中访问**：

```typescript
const document = parse('<prompt id="main">Hello</prompt>');

// 通过 ID 快速访问节点
const node = document.nodesById?.get('main');
```

## Structure（结构）

结构通过元素的嵌套关系形成 DOM 树，是第四个语义维度。

### 层级关系

```xml
<agent>                    <!-- 根元素 -->
  <llm model="gpt-4"/>     <!-- 子元素 -->
  <role>                   <!-- 子元素 -->
    <personality>          <!-- 孙元素 -->
      我是一个友好的助手
    </personality>
  </role>
</agent>
```

### 结构的语义职责

结构主要服务于**人类理解**：

- DOM 树天然可视化
- 层级关系直观明了
- 支持工具渲染为界面

### 在代码中遍历结构

```typescript
const document = parse(dpmlText);

function traverse(node: DPMLNode, depth = 0) {
  console.log('  '.repeat(depth) + node.tagName);
  for (const child of node.children) {
    traverse(child, depth + 1);
  }
}

traverse(document.rootNode);
```

## 四维语义对比

| 维度 | XML 表达 | 主要职责 | 主要服务对象 |
|------|----------|----------|-------------|
| Tag | `<element>` | 概念定义 | 人类 |
| Attribute | `attr="value"` | 配置参数 | 计算机 |
| Content | 元素内文本 | 语义内容 | AI |
| Structure | 嵌套层级 | 层级组织 | 人类 |

这四个维度相互独立，共同构成完整的语义表达能力：

- **缺失 Tag**：无法理解概念
- **缺失 Attribute**：配置混入内容，难以解析
- **缺失 Content**：AI 没有自然语言空间
- **缺失 Structure**：无法可视化层级关系

## 下一步

- [架构概览](./overview.md) - 了解整体架构
- [Schema 系统](./schema.md) - 了解如何定义文档结构
- [变换器系统](./transformer.md) - 了解如何转换文档
- [内置元素](./built-in-elements.md) - 了解 resource 等内置元素
