# DPML Core

## 简介

DPML (Deepractice Prompt Markup Language) 是一种专为AI提示词工程设计的声明式标记语言，作为人类意图和AI处理之间的标准化中间表示。DPML Core 包提供了解析、验证、转换和执行DPML文档的核心功能，使开发者能够为特定领域创建自定义的DPML编译器。

DPML 基于"意图交互模式"设计，在这一模式中：
- **人类**是终极的创新载体，专注于高层次意图表达，关注"做什么"而非"怎么做"
- **AI**是抽象与具象的桥梁，将人类意图转换为结构化指令
- **计算机**是终极的效率载体，精确高速地执行任务

作为中间表示语言，DPML通过声明式标记语法，降低了技术门槛，提高了开发效率，支持各行业创建自己的领域特定语言(DSL)。DPML Core就是这一理念的核心实现，它使开发者无需深入理解底层技术细节，即可构建复杂的数据处理工作流。

## 安装

```bash
npm install @dpml/core
```

## 开发领域包指南

本指南将帮助你使用DPML Core开发自己的领域特定DPML包。

### 1. 基本概念

DPML框架基于以下核心概念：

- **Schema** - 定义领域特定DPML文档的结构和约束
- **解析器** - 将DPML文本解析为内存中的文档对象模型
- **处理器** - 验证文档是否符合Schema并处理引用
- **转换器** - 将DPML文档转换为特定目标格式或数据结构
- **领域编译器** - 封装上述组件的统一入口点

### 2. 创建领域包的步骤

#### 2.1 定义领域Schema

##### 2.1.1 Schema的作用与原理

Schema是DPML的核心组成部分，它定义了领域特定DPML文档的结构和约束规则。Schema的主要作用包括：

- **结构定义**：指定文档可包含的元素、属性及其层级关系
- **约束验证**：设置必填项、枚举值、模式匹配等验证规则
- **类型系统**：提供可复用的类型定义，支持引用和组合
- **语义描述**：通过结构化定义，表达领域模型的语义

Schema采用声明式模型，开发者只需描述"应该是什么"，而非"如何验证"。DPML处理器会根据Schema自动执行验证，生成详细的错误报告，并构建引用映射，为后续转换提供基础。

##### 2.1.2 Schema的类型结构

DPML的Schema系统包含以下核心类型：

| 类型 | 描述 | 主要属性 |
|------|------|---------|
| **DocumentSchema** | 文档级别的结构定义 | `root`：根元素定义<br>`types`：可复用类型定义<br>`globalAttributes`：全局属性定义<br>`namespaces`：命名空间定义 |
| **ElementSchema** | 元素结构定义 | `element`：元素标签名<br>`attributes`：属性定义数组<br>`children`：子元素定义<br>`content`：内容模型定义 |
| **AttributeSchema** | 属性定义 | `name`：属性名<br>`type`：属性值类型<br>`required`：是否必填<br>`enum`：枚举可选值<br>`pattern`：正则校验模式<br>`default`：默认值 |
| **ContentSchema** | 内容模型定义 | `type`：内容类型（'text'或'mixed'）<br>`required`：是否必填<br>`pattern`：内容正则校验 |
| **ChildrenSchema** | 子元素集合定义 | `elements`：允许的子元素数组<br>`orderImportant`：顺序是否重要<br>`min`：最少子元素数量<br>`max`：最多子元素数量 |
| **TypeReference** | 类型引用 | `$ref`：引用的类型名称，指向types数组中定义的元素 |

这些类型组合使用，可以构建从简单到复杂的各种领域模型。DocumentSchema是入口点，通过它可以定义完整的文档结构。其中，TypeReference允许你引用在types数组中定义的类型，实现类型复用。

##### 2.1.3 Schema示例

下面是一个工作流程定义的DPML示例及其对应的Schema：

**DPML文档示例**：
```xml
<workflow name="数据处理流程" version="1.0">
  <variables>
    <variable name="inputFile" type="string">data.csv</variable>
    <variable name="outputFormat" type="string">json</variable>
  </variables>
  
  <step id="step1" type="start">
    读取输入文件
  </step>
  
  <step id="step2" type="process">
    数据清洗和转换
  </step>
  
  <step id="step3" type="decision">
    是否需要额外处理?
  </step>
  
  <step id="step4" type="process">
    格式化输出
  </step>
  
  <step id="step5" type="end">
    保存结果
  </step>
  
  <transition from="step1" to="step2" />
  <transition from="step2" to="step3" />
  <transition from="step3" to="step4" condition="skipProcessing == false" />
  <transition from="step3" to="step5" condition="skipProcessing == true" />
  <transition from="step4" to="step5" />
</workflow>
```

**对应的Schema定义**：
```typescript
import { Schema, DocumentSchema } from '@dpml/core';

// 定义工作流领域的Schema
const workflowSchema: DocumentSchema = {
  // 根元素定义
  root: {
    element: 'workflow',
    attributes: [
      {
        name: 'name',
        required: true
      },
      {
        name: 'version'
      }
    ],
    children: {
      elements: [
        // 通过$ref引用预定义类型
        { $ref: 'variables' },
        { $ref: 'step' },
        { $ref: 'transition' }
      ]
    }
  },
  // 可复用类型定义
  types: [
    {
      // 定义variables元素类型
      element: 'variables',
      children: {
        elements: [
          // 引用variable类型
          { $ref: 'variable' }
        ],
        min: 1
      }
    },
    {
      // 定义variable元素类型
      element: 'variable',
      attributes: [
        {
          name: 'name',
          required: true
        },
        {
          name: 'type',
          enum: ['string', 'number', 'boolean'],
          default: 'string'
        }
      ],
      content: {
        type: 'text'
      }
    },
    {
      // 定义step元素类型
      element: 'step',
      attributes: [
        {
          name: 'id',
          required: true
        },
        {
          name: 'type',
          enum: ['start', 'process', 'decision', 'end'],
          required: true
        }
      ],
      content: {
        type: 'text',
        required: true
      }
    },
    {
      // 定义transition元素类型
      element: 'transition',
      attributes: [
        {
          name: 'from',
          required: true
        },
        {
          name: 'to',
          required: true
        },
        {
          name: 'condition'
        }
      ]
    }
  ],
  // 全局属性定义
  globalAttributes: [
    {
      name: 'description'
    }
  ]
};
```

这个Schema定义了一个完整的工作流语言模型，包含工作流的基本结构、变量定义、步骤和转换。注意其中通过 `{ $ref: '类型名' }` 语法引用了在 `types` 数组中定义的类型，实现了类型复用。通过这个Schema，可以验证DPML文档是否满足工作流的结构要求，例如每个步骤必须有ID和类型，转换必须指定起点和终点等。

#### 2.2 创建领域转换器

转换器负责将处理后的DPML文档转换为领域特定的对象结构。DPML Core提供了多种方式创建和使用转换器，以适应不同的使用场景和复杂度要求。

##### 2.2.1 转换器注册

所有转换器在使用前必须注册到领域编译器中。注册可以在创建编译器时通过配置完成：

```typescript
import { createDomainDPML } from '@dpml/core';

// 注册转换器（在创建编译器时）
const workflowDPML = createDomainDPML<Workflow>({
  schema: workflowSchema,
  transformers: [
    // 此处列出所有需要的转换器
    workflowTransformer,
    variablesTransformer
  ],
  options: {
    strictMode: true
  }
});

// 动态添加新的转换器
workflowDPML.compiler.extend({
  transformers: [
    additionalTransformer
  ]
});
```

注册的转换器将按照注册顺序执行，后注册的转换器可以访问前面转换器的结果，并在结果合并时具有更高的优先级（解决字段冲突）。

##### 2.2.2 使用TransformerDefiner创建转换器

DPML Core提供了`TransformerDefiner`API，让你可以声明式地创建各种类型的转换器，无需了解实现细节：

```typescript
import { createTransformerDefiner } from '@dpml/core';

// 获取转换器定义器
const definer = createTransformerDefiner();

// 定义领域对象类型
interface Workflow {
  name: string;
  version?: string;
  steps: Array<{
    id: string;
    type: string;
    description: string;
  }>;
}

// 创建结构映射转换器
const workflowTransformer = definer.defineStructuralMapper<unknown, Workflow>([
  {
    selector: "workflow",
    targetPath: "",
    transform: (node) => ({
      name: node.attributes.get("name") || "",
      version: node.attributes.get("version"),
      steps: []
    })
  },
  {
    selector: "workflow > step",
    targetPath: "steps[]",
    transform: (node) => ({
      id: node.attributes.get("id") || "",
      type: node.attributes.get("type") || "process",
      description: node.content || ""
    })
  }
]);
```

TransformerDefiner支持多种内置转换器类型：

| 转换器类型 | 方法 | 描述 |
|------------|------|------|
| 结构映射转换器 | `defineStructuralMapper` | 将DPML节点映射到目标对象结构，支持选择器和路径映射 |
| 模板转换器 | `defineTemplateTransformer` | 使用模板生成文本输出，如生成代码或文档 |
| 聚合转换器 | `defineAggregator` | 收集、分组和处理符合条件的节点 |
| 关系处理转换器 | `defineRelationProcessor` | 处理节点间的关系，如构建引用关系图 |
| 语义提取转换器 | `defineSemanticExtractor` | 提取领域特定语义信息 |
| 结果收集转换器 | `defineResultCollector` | 收集多个转换器的结果 |

**模板转换器示例**：

```typescript
// 创建模板转换器
const promptTemplateTransformer = definer.defineTemplateTransformer<{userName: string}>(
  "你好，{{userName}}！欢迎使用DPML。",
  // 可选的预处理函数
  (input) => ({
    userName: input.userName.toUpperCase()
  })
);
```

**聚合转换器示例**：

```typescript
// 创建聚合转换器
const stepsCollectorTransformer = definer.defineAggregator<unknown, {steps: any[]}>({
  selector: "workflow > step",
  groupBy: "type",  // 可选，按类型分组
  sortBy: "id"      // 可选，按ID排序
});
```

##### 2.2.3 创建自定义转换器

对于更复杂的转换逻辑，你可以通过实现`Transformer<TInput, TOutput>`接口创建完全自定义的转换器：

```typescript
import { Transformer, TransformContext } from '@dpml/core';

// 自定义工作流转换器
class CustomWorkflowTransformer implements Transformer<unknown, Workflow> {
  // 转换器名称，用于标识和调试
  name = 'CustomWorkflowTransformer';
  
  // 可选的描述
  description = '自定义工作流转换器';
  
  // 转换方法实现
  transform(input: unknown, context: TransformContext): Workflow {
    // 获取处理后的文档
    const document = context.getDocument();
    
    // 从文档中提取需要的数据
    const workflowNode = document.rootNode;
    const stepsNodes = workflowNode.children.filter(node => node.tagName === 'step');
    
    // 创建工作流对象
    const workflow: Workflow = {
      name: workflowNode.attributes.get('name') || 'Default Workflow',
      version: workflowNode.attributes.get('version'),
      steps: []
    };
    
    // 处理每个步骤节点
    workflow.steps = stepsNodes.map(node => ({
      id: node.attributes.get('id') || '',
      type: node.attributes.get('type') || 'process',
      description: node.content || ''
    }));
    
    // 可以将中间结果存储在上下文中，供后续转换器使用
    context.set('stepsCount', workflow.steps.length);
    
    // 返回转换结果
    return workflow;
  }
}

// 创建转换器实例
const customTransformer = new CustomWorkflowTransformer();
```

自定义转换器使你能够：
- 实现任意复杂的转换逻辑
- 访问完整的文档结构和上下文
- 存储中间结果供其他转换器使用
- 与内置转换器无缝协作

TransformContext提供了多种工具方法：
- `getDocument()`: 获取原始文档对象
- `getReferences()`: 获取ID引用映射
- `set<T>(key, value)`: 存储类型安全的数据
- `get<T>(key)`: 获取类型安全的数据
- `has(key)`: 检查键是否存在
- `isDocumentValid()`: 检查文档是否有效
- `getAllResults()`: 获取所有存储的结果

##### 2.2.4 选择器(Selector)规则

在使用转换器时，选择器(Selector)是定位和选择DPML文档中节点的关键。DPML使用简单且直观的选择器语法来定位元素。

**支持的选择器语法**:

| 选择器类型 | 语法 | 描述 | 示例 |
|------------|------|------|------|
| 标签选择器 | `tagName` | 选择所有指定标签的元素 | `workflow` |
| 属性选择器 | `tagName[attr]` | 选择具有特定属性的元素 | `step[type]` |
| 属性值选择器 | `tagName[attr="value"]` | 选择属性等于特定值的元素 | `step[type="process"]` |
| 直接子元素选择器 | `parent > child` | 选择作为直接子元素的元素 | `workflow > step` |

**选择器示例**:

```typescript
// 基本标签选择器 - 选择所有工作流元素
"workflow"

// 属性选择器 - 选择有type属性的步骤
"step[type]"

// 属性值选择器 - 选择类型为'decision'的步骤
"step[type=\"decision\"]"

// 子元素选择器 - 选择工作流直接子元素中的步骤
"workflow > step"
```

**数组路径标记**:

当需要获取多个匹配元素时，可以在目标路径后添加 `[]` 后缀：

```typescript
// 定义转换器，收集所有步骤到数组
const stepsTransformer = definer.defineStructuralMapper([
  {
    selector: "step",           // 选择所有step元素
    targetPath: "steps[]",      // 将结果放入steps数组
    transform: (node) => ({
      id: node.attributes.get("id") || "",
      type: node.attributes.get("type") || "process"
    })
  }
]);
```

**选择器最佳实践**:

1. **保持简单性**: 使用最简单的选择器满足需求
2. **考虑文档结构**: 选择器应该反映文档的层次结构
3. **验证选择器**: 确保选择器能匹配到预期的节点
4. **处理选择器失败**: 在转换器中添加逻辑处理选择器未匹配到节点的情况

##### 2.2.5 领域CLI命令注册

DPML Core 支持为领域包定义特定的命令行工具，让用户能够通过命令行与你的领域包交互。这些命令可以在创建领域编译器时配置：

```typescript
import { createDomainDPML } from '@dpml/core';

// 创建带有CLI命令的领域编译器
const workflowDPML = createDomainDPML<Workflow>({
  // 领域标识符，用于CLI中标识该领域
  domain: 'workflow',
  
  // 领域描述
  description: '工作流处理领域',
  
  // Schema和转换器配置
  schema: workflowSchema,
  transformers: [workflowTransformer],
  
  // 领域命令配置
  commands: {
    // 是否包含标准命令（如validate和parse）
    includeStandard: true,
    
    // 自定义领域命令
    actions: [
      {
        // 命令名称（应遵循kebab-case格式）
        name: 'execute',
        
        // 命令描述
        description: '执行工作流',
        
        // 位置参数定义
        args: [
          {
            name: 'filePath',
            description: '工作流文件路径',
            required: true
          }
        ],
        
        // 选项参数定义
        options: [
          {
            flags: '-d, --debug',
            description: '启用调试模式'
          },
          {
            flags: '-o, --output <format>',
            description: '输出格式',
            defaultValue: 'json',
            choices: ['json', 'xml', 'yaml']
          }
        ],
        
        // 命令处理函数
        action: async (actionContext, filePath, options) => {
          // 读取文件
          const content = await readFile(filePath, 'utf-8');
          
          // 编译DPML为领域对象
          const workflow = await workflowDPML.compiler.compile(content);
          
          // 执行领域特定逻辑
          console.log(`执行工作流: ${workflow.name}`);
          console.log(`调试模式: ${options.debug ? '开启' : '关闭'}`);
          console.log(`输出格式: ${options.output}`);
        }
      },
      {
        name: 'visualize',
        description: '可视化工作流',
        args: [
          {
            name: 'filePath',
            description: '工作流文件路径',
            required: true
          }
        ],
        action: async (actionContext, filePath) => {
          // 可视化工作流逻辑...
          console.log(`可视化工作流: ${filePath}`);
        }
      }
    ]
  },
  
  // 其他编译器选项
  options: {
    strictMode: true
  }
});
```

通过这种方式注册的命令可以通过 DPML CLI 执行：

```bash
# 使用标准命令
dpml workflow validate path/to/workflow.xml

# 使用自定义命令
dpml workflow execute path/to/workflow.xml --debug

# 使用带选项的自定义命令
dpml workflow execute path/to/workflow.xml --output yaml
```

CLI命令定义参数：

| 参数 | 描述 | 示例 |
|------|------|------|
| `name` | 命令名称，用于CLI调用 | `'execute'` |
| `description` | 命令描述，用于帮助信息 | `'执行工作流'` |
| `args` | 位置参数定义数组 | `[{ name: 'filePath', description: '...', required: true }]` |
| `options` | 选项参数定义数组 | `[{ flags: '-d, --debug', description: '...' }]` |
| `action` | 命令处理函数 | `(actionContext, ...args) => { ... }` |

位置参数定义：

| 参数 | 描述 | 示例 |
|------|------|------|
| `name` | 参数名称 | `'filePath'` |
| `description` | 参数描述 | `'工作流文件路径'` |
| `required` | 是否必需 | `true` |
| `defaultValue` | 默认值 | `'default.xml'` |
| `choices` | 可选值数组 | `['file1.xml', 'file2.xml']` |

选项参数定义：

| 参数 | 描述 | 示例 |
|------|------|------|
| `flags` | 选项标识，包含简写和全名 | `'-d, --debug'` |
| `description` | 选项描述 | `'启用调试模式'` |
| `defaultValue` | 默认值 | `false` |
| `required` | 是否必需 | `false` |
| `choices` | 可选值数组 | `['json', 'xml', 'yaml']` |

这些命令将在用户安装你的领域包并使用 DPML CLI 时可用，大大提升了领域包的可用性和用户体验。

#### 2.3 创建领域编译器

使用Framework API创建领域编译器，作为用户的统一入口点：

```typescript
import { createDomainDPML } from '@dpml/core';

// 创建领域编译器
const workflowDPML = createDomainDPML<Workflow>({
  // 必需参数：领域标识符
  domain: 'workflow',
  
  // 可选参数：领域描述
  description: '工作流处理领域',
  
  // 必需参数：Schema定义
  schema: workflowSchema,
  
  // 必需参数：转换器数组
  transformers: [workflowTransformer],
  
  // 可选参数：编译选项
  options: {
    strictMode: true,
    errorHandling: 'throw'
  },
  
  // 可选参数：命令配置
  commands: {
    includeStandard: true,
    actions: [
      // ... 领域命令定义 ...
    ]
  }
});

// 导出编译器供用户使用
export default workflowDPML;
```

`createDomainDPML` 函数参数说明：

| 参数 | 类型 | 是否必需 | 描述 |
|------|------|----------|------|
| `domain` | string | 是 | 领域标识符，用于在CLI和其他场景中标识该领域 |
| `description` | string | 否 | 领域描述，用于在CLI和其他场景中描述该领域 |
| `schema` | Schema | 是 | 领域特定的Schema定义 |
| `transformers` | Array<Transformer> | 是 | 转换器实例数组 |
| `options` | CompileOptions | 否 | 编译选项，如严格模式、错误处理策略等 |
| `commands` | DomainCommandsConfig | 否 | 领域命令配置，用于定义CLI命令 |

#### 2.4 使用领域编译器

领域包用户可以通过导入并使用你的编译器来处理 DPML 文档：

```typescript
import workflowDPML from 'your-workflow-package';

async function processWorkflow(dpmlContent: string): Promise<void> {
  try {
    // 编译DPML为领域对象（返回Promise）
    const workflow = await workflowDPML.compiler.compile(dpmlContent);
    
    console.log(`工作流名称: ${workflow.name}`);
    console.log(`步骤数量: ${workflow.steps.length}`);
    
    // 使用领域对象...
  } catch (error) {
    console.error('编译失败:', error.message);
  }
}
```

所有领域编译器都实现了 `DomainCompiler<T>` 接口，提供以下方法：

| 方法 | 返回类型 | 描述 |
|------|---------|------|
| `compile(content: string)` | `Promise<T>` | 编译 DPML 内容为领域对象，异步操作 |
| `extend(config: Partial<DomainConfig>)` | `void` | 扩展当前配置，添加新转换器或更新选项 |
| `getSchema()` | `Schema` | 获取当前使用的 Schema 定义 |
| `getTransformers()` | `Array<Transformer<unknown, unknown>>` | 获取当前使用的转换器数组 |

`createDomainDPML` 函数返回的是 `DomainDPML<T>` 复合对象，包含以下属性：

| 属性 | 类型 | 描述 |
|------|------|------|
| `compiler` | `DomainCompiler<T>` | 领域编译器实例，提供编译及相关功能 |
| `cli` | `CLI` | 命令行接口实例，提供命令行功能 |

示例：获取当前 Schema 和转换器

```typescript
// 获取当前 Schema
const schema = workflowDPML.compiler.getSchema();
console.log('当前 Schema 定义:', schema);

// 获取当前转换器
const transformers = workflowDPML.compiler.getTransformers();
console.log(`当前使用 ${transformers.length} 个转换器`);
```

### 3. 扩展功能

#### 3.1 扩展现有编译器

通过 `extend` 方法，可以动态扩展现有的领域编译器配置，添加新功能或修改现有设置：

```typescript
// 添加新的转换器
workflowDPML.compiler.extend({
  transformers: [additionalTransformer]
});

// 更新编译选项
workflowDPML.compiler.extend({
  options: {
    strictMode: false,
    errorHandling: 'warn'
  }
});

// 同时更新多个配置项
workflowDPML.compiler.extend({
  domain: 'updated-workflow',
  description: '更新后的工作流处理领域',
  transformers: [newTransformer1, newTransformer2],
  options: {
    strictMode: false
  }
});
```

`extend` 方法接受 `Partial<DomainConfig>` 类型的参数，这意味着你可以更新以下配置项：

| 配置项 | 描述 | 示例 |
|-------|------|------|
| `domain` | 更新领域标识符 | `'updated-workflow'` |
| `description` | 更新领域描述 | `'更新后的描述'` |
| `schema` | 替换整个 Schema | `newSchema` |
| `transformers` | 添加新的转换器 | `[newTransformer]` |
| `options` | 更新编译选项 | `{ strictMode: false }` |

**注意事项**：

1. **转换器添加而非替换**：新的转换器会被添加到现有转换器列表末尾，而不是替换现有列表
2. **选项合并而非替换**：新的选项会与现有选项合并，只更新指定的字段
3. **流水线安全**：可以在编译过程中动态扩展编译器，不会影响当前正在进行的操作

实际应用场景：

```typescript
// 根据用户输入动态添加转换器
function addCustomTransformer(type: string) {
  let transformer;
  
  if (type === 'html') {
    transformer = definer.defineTemplateTransformer('<html>{{content}}</html>');
  } else if (type === 'json') {
    transformer = definer.defineStructuralMapper([/* JSON映射规则 */]);
  }
  
  if (transformer) {
    // 动态扩展编译器
    workflowDPML.compiler.extend({
      transformers: [transformer]
    });
  }
}
```

#### 3.2 使用命令行工具

领域DPML对象包含内置的CLI功能，可以直接用于构建命令行工具：

```typescript
import { createDomainDPML } from '@dpml/core';
import { readFile } from 'fs/promises';

// 创建领域DPML实例
const workflowDPML = createDomainDPML<Workflow>({
  domain: 'workflow',
  description: '工作流处理领域',
  schema: workflowSchema,
  transformers: [workflowTransformer],
  commands: {
    includeStandard: true,
    actions: [
      {
        name: 'execute',
        description: '执行工作流',
        args: [
          {
            name: 'filePath',
            description: '工作流文件路径',
            required: true
          }
        ],
        options: [
          {
            flags: '-o, --output <format>',
            description: '输出格式',
            defaultValue: 'json'
          }
        ],
        action: async (actionContext, filePath, options) => {
          // 读取文件
          const content = await readFile(filePath, 'utf-8');
          
          // 编译工作流
          const workflow = await workflowDPML.compiler.compile(content);
          
          // 处理输出
          console.log(`执行工作流 "${workflow.name}" 完成`);
          console.log(`输出格式: ${options.output}`);
        }
      }
    ]
  }
});

// 在应用入口点使用CLI（如bin.ts）
async function main() {
  // 直接使用领域DPML中的cli属性
  await workflowDPML.cli.execute();
}

// 执行主函数
main().catch(error => {
  console.error('CLI执行出错:', error);
  process.exit(1);
});
```

命令行调用示例：

```bash
# 使用领域命令
$ dpml workflow execute path/to/workflow.xml

# 使用带选项的命令
$ dpml workflow execute path/to/workflow.xml --output yaml
```

这种设计使得API更加一致，领域的所有功能（包括编译和命令行）都通过单一入口点提供，避免了重复配置和多个API调用。

### 4. 高级功能

#### 4.1 自定义转换器

如果预定义的转换器不能满足需求，可以创建自定义转换器：

```typescript
import { Transformer, TransformContext } from '@dpml/core';

class CustomWorkflowTransformer implements Transformer<unknown, Workflow> {
  name = 'CustomWorkflowTransformer';
  
  transform(input: unknown, context: TransformContext): Workflow {
    const document = context.getDocument();
    // 实现自定义转换逻辑...
    return workflow;
  }
}

const customTransformer = new CustomWorkflowTransformer();
```

#### 4.2 组合多个转换器

可以组合多个转换器形成处理管道：

```typescript
import { createPipeline } from '@dpml/core';

// 创建处理管道
const pipeline = createPipeline()
  .add(dataExtractorTransformer)
  .add(relationBuilderTransformer)
  .add(workflowTransformer);

// 在领域编译器中使用
const workflowDPML = createDomainDPML<Workflow>({
  schema: myDomainSchema,
  transformers: [pipeline],
  options: {
    strictMode: true
  }
});
```

#### 4.3 异步处理

处理大型文档或执行异步转换：

```typescript
// 异步编译方法
async function processLargeWorkflow(filePath: string): Promise<Workflow> {
  // 异步读取文件
  const content = await readFile(filePath, 'utf-8');
  
  // 使用编译器处理
  return await workflowDPML.compiler.compile(content);
}
```

### 5. 最佳实践

- **模块化设计**: 将Schema定义、转换器和领域逻辑分开，便于维护和测试
- **类型安全**: 充分利用TypeScript的类型系统确保编译时类型检查
- **错误处理**: 提供清晰的错误信息和恢复机制
- **文档化**: 详细记录Schema结构和使用示例
- **测试覆盖**: 为Schema、转换器和编译器编写全面的测试
- **版本控制**: 为API变更提供明确的版本策略

### 6. 示例项目

完整的领域包项目结构示例，符合DPML分层架构规则：

```
my-dpml-domain/
  ├── src/
  │   ├── api/                 # API层 - 对外接口
  │   │   ├── index.ts         # 公共API导出
  │   │   └── domain.ts        # 领域特定API
  │   │
  │   ├── core/                # Core层 - 核心业务逻辑
  │   │
  │   ├── types/               # Types层 - 类型定义
  │   │
  │   ├── config/              # 配置目录
  │   │   ├── schema.ts        # Schema配置
  │   │   ├── cli.ts           # CLI配置
  │   │   ├── transformer.ts   # 转换器配置
  │   │   └── index.ts         # 配置导出
  │   │
  │   ├── __tests__/           # 测试文件
  │   │   ├── unit/            # 单元测试
  │   │   │   ├── api/         # API层单元测试
  │   │   │   ├── core/        # Core层单元测试
  │   │   │   └── types/       # Types层契约测试
  │   │   │
  │   │   ├── integration/     # 集成测试
  │   │   │   ├── api-core/    # API与Core层集成测试
  │   │   │   └── module/      # 跨模块集成测试
  │   │   │
  │   │   ├── e2e/             # 端到端测试
  │   │   │   ├── cli/         # CLI功能测试
  │   │   │   └── workflow/    # 完整工作流测试
  │   │   │
  │   │   ├── contract/        # 契约测试
  │   │   │   ├── api/         # API契约测试
  │   │   │   └── types/       # 类型系统契约测试
  │   │   │
  │   │   └── fixtures/        # 测试夹具
  │   │       ├── schemas/     # Schema测试数据
  │   │       ├── documents/   # DPML文档测试数据
  │   │       └── mocks/       # 模拟对象和数据
  │   │
  │   ├── bin.ts               # CLI入口
  │   └── agentDPML.ts         # 领域合成入口
  │
  ├── examples/                # 使用示例
  │   ├── basic.ts
  │   └── agent-examples/
  │
  ├── package.json
  ├── tsconfig.json
  └── README.md
```

在这个结构中：

1. **分层架构**：
   - **API层**：提供对外接口，是用户与系统交互的唯一入口
   - **Core层**：核心业务逻辑
   - **Types层**：类型和接口定义

2. **Config目录**：包含各种配置文件
   - **schema.ts**：定义领域的Schema配置
   - **cli.ts**：定义CLI命令配置
   - **transformer.ts**：配置转换器规则和映射

3. **领域合成**：
   - **agentDPML.ts**：将Schema、转换器和CLI集成为完整的DPML领域

典型的领域合成文件`agentDPML.ts`示例：

```typescript
import { createDomainDPML } from '@dpml/core';
import { schema } from './config/schema';
import { transformers } from './config/transformer';
import { commandsConfig } from './config/cli';
import type { Agent } from './types/domain';

// 创建Agent领域DPML实例
const agentDPML = createDomainDPML<Agent>({
  domain: 'agent',
  description: 'AI代理配置领域',
  schema,
  transformers,
  commands: commandsConfig,
  options: {
    strictMode: true,
    errorHandling: 'throw'
  }
});

// 导出完整的领域DPML对象
export default agentDPML;

// 为方便使用，也可以单独导出编译器
export const agentCompiler = agentDPML.compiler;

// 导出CLI实例
export const agentCLI = agentDPML.cli;
```
