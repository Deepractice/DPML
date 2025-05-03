# DPML Core

## 1. 简介

DPML (Deepractice Prompt Markup Language) 是一种专为AI提示词工程设计的声明式标记语言，作为人类意图和AI处理之间的标准化中间表示。DPML Core 包提供了解析、验证、转换和执行DPML文档的核心功能，使开发者能够为特定领域创建自定义的DPML编译器。

DPML 基于"意图交互模式"设计，在这一模式中：
- **人类**是终极的创新载体，专注于高层次意图表达，关注"做什么"而非"怎么做"
- **AI**是抽象与具象的桥梁，将人类意图转换为结构化指令
- **计算机**是终极的效率载体，精确高速地执行任务

作为中间表示语言，DPML通过声明式标记语法，降低了技术门槛，提高了开发效率，支持各行业创建自己的领域特定语言(DSL)。

## 2. 核心组件概览

DPML Core 框架由以下核心组件构成：

![DPML Core架构](https://placeholder-for-dpml-architecture.png)

- **Schema** - 定义领域特定DPML文档的结构和约束
- **解析器** - 将DPML文本解析为内存中的文档对象模型(DOM)
- **处理器** - 验证文档是否符合Schema并处理引用
- **转换器** - 将DPML文档转换为特定目标格式或数据结构
- **编译器** - 封装上述组件的统一入口点，负责调度整个处理流程
- **CLI系统** - 提供命令行界面功能，用于与DPML文档交互

## 3. 快速入门

### 3.1 安装

```bash
npm install @dpml/core
```

### 3.2 基本使用示例

```typescript
import { createDomainDPML } from '@dpml/core';

// 1. 定义领域Schema
const mySchema = {
  // Schema定义（见后文详细说明）
};

// 2. 创建转换器
const myTransformer = {
  name: 'myTransformer',
  transform: (input, context) => {
    // 转换逻辑
    return { result: 'transformed data' };
  }
};

// 3. 定义CLI命令配置
const commandsConfig = {
  includeStandard: true, // 包含标准命令（validate、parse）
  actions: [
    {
      name: 'process',
      description: '处理DPML文档',
      args: [
        {
          name: 'filePath',
          description: '文件路径',
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
        // 命令实现逻辑
        console.log(`处理文件: ${filePath}, 输出格式: ${options.output}`);
      }
    }
  ]
};

// 4. 创建领域编译器
const myDPML = createDomainDPML<ResultType>({
  domain: 'my-domain',
  description: '我的DPML领域',
  schema: mySchema,
  transformers: [myTransformer],
  commands: commandsConfig // 添加命令配置
});

// 5. 使用编译器处理DPML文档
async function processDPML() {
  const dpmlContent = '<my-element>DPML content</my-element>';
  const result = await myDPML.compiler.compile(dpmlContent);
  console.log(result);
}

// 6. CLI入口点（在bin.ts文件中）
async function main() {
  await myDPML.cli.execute();
}

processDPML();
```

### 3.3 CLI使用示例

安装全局或本地DPML CLI后，可以使用命令行工具：

```bash
# 验证DPML文档
dpml my-domain validate path/to/document.xml

# 执行自定义命令
dpml my-domain custom-command path/to/document.xml --option value
```

## 4. 详细指南

### 4.1 Schema

Schema是DPML的核心组成部分，它定义了领域特定DPML文档的结构和约束规则。

#### 4.1.1 Schema的类型结构

```typescript
// 文档级别的结构定义
interface DocumentSchema {
  root: ElementSchema | TypeReference;  // 根元素定义
  types?: Array<ElementSchema>;         // 可复用类型定义
  globalAttributes?: Array<AttributeSchema>; // 全局属性定义
  namespaces?: Record<string, string>;  // 命名空间定义
}

// 元素结构定义
interface ElementSchema {
  element: string;                      // 元素标签名
  attributes?: Array<AttributeSchema>;  // 属性定义
  children?: ChildrenSchema;            // 子元素定义
  content?: ContentSchema;              // 内容模型定义
}

// 类型引用
interface TypeReference {
  $ref: string;                         // 引用的类型名称
}
```

#### 4.1.2 Schema示例

```typescript
import { Schema, DocumentSchema } from '@dpml/core';

// 定义工作流领域的Schema
const workflowSchema: DocumentSchema = {
  // 根元素定义
  root: {
    element: 'workflow',
    attributes: [
      { name: 'name', required: true },
      { name: 'version' }
    ],
    children: {
      elements: [
        { $ref: 'step' },  // 引用预定义类型
        { $ref: 'transition' }
      ]
    }
  },
  // 可复用类型定义
  types: [
    {
      element: 'step',
      attributes: [
        { name: 'id', required: true },
        { name: 'type', enum: ['start', 'process', 'end'], required: true }
      ],
      content: { type: 'text', required: true }
    },
    {
      element: 'transition',
      attributes: [
        { name: 'from', required: true },
        { name: 'to', required: true },
        { name: 'condition' }
      ]
    }
  ]
};
```

### 4.2 转换器(Transformer)

转换器负责将处理后的DPML文档转换为领域特定的对象结构。DPML Core提供多种方式创建和使用转换器。

#### 4.2.1 转换器接口

所有转换器必须实现`Transformer<TInput, TOutput>`接口：

```typescript
interface Transformer<TInput, TOutput> {
  // 转换器名称，用于标识和调试
  name: string;
  
  // 转换方法
  transform(input: TInput, context: TransformContext): TOutput;
}
```

#### 4.2.2 使用TransformerDefiner创建转换器

```typescript
import { createTransformerDefiner } from '@dpml/core';

// 获取转换器定义器
const definer = createTransformerDefiner();

// 创建结构映射转换器
const workflowTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'workflowTransformer', // 转换器名称
  [
    {
      selector: "workflow",  // 元素选择器
      targetPath: "",        // 目标路径
      transform: (value) => ({
        name: value.attributes.get("name") || "",
        version: value.attributes.get("version"),
        steps: []
      })
    },
    {
      selector: "workflow > step",
      targetPath: "steps[]", // 数组路径表示法
      transform: (value) => ({
        id: value.attributes.get("id") || "",
        type: value.attributes.get("type") || "process",
        description: value.content || ""
      })
    }
  ]
);
```

#### 4.2.3 内置转换器类型

DPML Core提供多种内置转换器类型，满足不同需求：

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
  'promptTemplateTransformer',
  "你好，{{userName}}！欢迎使用DPML。",
  // 可选的预处理函数
  (input) => ({
    userName: input.userName.toUpperCase()
  })
);

// 使用模板转换器
const result = promptTemplateTransformer.transform({userName: "张三"}, context);
// 输出: "你好，张三！欢迎使用DPML。"
```

**聚合转换器示例**：

```typescript
// 创建聚合转换器
const stepsCollectorTransformer = definer.defineAggregator<unknown, {steps: any[]}>(
  'stepsCollectorTransformer',
  {
    selector: "workflow > step",
    groupBy: "type",  // 可选，按类型分组
    sortBy: "id"      // 可选，按ID排序
  }
);

// 结果示例：收集所有步骤到数组
// {
//   steps: [
//     {id: "step1", type: "start", ...},
//     {id: "step2", type: "process", ...},
//     {id: "step5", type: "end", ...}
//   ]
// }
```

#### 4.2.4 选择器(Selector)语法

DPML使用简单直观的选择器语法来定位元素：

| 选择器类型 | 语法 | 描述 | 示例 |
|------------|------|------|------|
| 标签选择器 | `tagName` | 选择所有指定标签的元素 | `workflow` |
| 属性选择器 | `tagName[attr]` | 选择具有特定属性的元素 | `step[type]` |
| 属性值选择器 | `tagName[attr="value"]` | 选择属性等于特定值的元素 | `step[type="process"]` |
| 直接子元素选择器 | `parent > child` | 选择作为直接子元素的元素 | `workflow > step` |

#### 4.2.5 转换器执行顺序

转换器按注册顺序执行，后注册的转换器可以访问前面转换器的结果：

```typescript
// 定义转换器序列，顺序很重要
const transformers = [
  // 1. 基础转换器：创建核心结构（必须首先执行）
  workflowBaseTransformer,
  
  // 2. 内容填充转换器：添加详细信息
  stepsTransformer,
  
  // 3. 关系处理转换器：处理元素间引用
  transitionsTransformer
];
```

### 4.3 编译器(Compiler)

编译器是DPML的核心组件，它协调Schema验证、文档解析和转换过程。

#### 4.3.1 创建领域编译器

```typescript
import { createDomainDPML } from '@dpml/core';

// 创建领域编译器
const workflowDPML = createDomainDPML<Workflow>({
  // 领域标识符
  domain: 'workflow',
  
  // 领域描述
  description: '工作流处理领域',
  
  // Schema定义
  schema: workflowSchema,
  
  // 转换器数组
  transformers: [workflowTransformer],
  
  // 命令配置
  commands: commandsConfig,
  
  // 编译选项
  options: {
    strictMode: true,
    errorHandling: 'throw'
  }
});
```

#### 4.3.2 使用编译器

```typescript
async function processWorkflow(dpmlContent: string): Promise<void> {
  try {
    // 编译DPML为领域对象
    const workflow = await workflowDPML.compiler.compile(dpmlContent);
    
    // 使用领域对象...
    console.log(`工作流名称: ${workflow.name}`);
    console.log(`步骤数量: ${workflow.steps.length}`);
  } catch (error) {
    console.error('编译失败:', error.message);
  }
}
```

#### 4.3.3 错误处理策略

编译器支持三种错误处理策略：
- **'throw'** (默认)：遇到错误时立即抛出异常
- **'warn'**：记录警告但继续执行
- **'silent'**：忽略错误，静默继续执行

```typescript
// 设置错误处理策略
const workflowDPML = createDomainDPML<Workflow>({
  // 其他配置...
  options: {
    errorHandling: 'warn'  // 'throw' | 'warn' | 'silent'
  }
});
```

#### 4.3.4 扩展编译器

可以通过`extend`方法动态扩展现有编译器：

```typescript
// 添加新的转换器
workflowDPML.compiler.extend({
  transformers: [newTransformer]
});

// 更新编译选项
workflowDPML.compiler.extend({
  options: {
    strictMode: false
  }
});
```

### 4.4 CLI系统

DPML Core提供了完整的CLI框架，允许领域包开发者快速创建自定义命令行工具。

#### 4.4.1 CLI架构概述

CLI系统由以下组件组成：

1. **命令定义**：描述命令名称、参数、选项和行为
2. **命令注册**：将命令添加到领域DPML实例
3. **命令执行器**：处理命令行参数并调用相应命令
4. **执行上下文**：提供命令执行期间所需的工具和状态

![CLI系统架构图](https://placeholder-for-cli-architecture.png)

#### 4.4.2 命令定义结构

命令使用以下结构定义：

```typescript
// 领域命令配置
const commandsConfig: DomainCommandsConfig = {
  // 是否包含标准命令（如validate和parse）
  includeStandard: true,
  
  // 自定义领域命令
  actions: [
    {
      // 命令名称（使用kebab-case格式）
      name: 'execute',
      
      // 命令描述（显示在帮助信息中）
      description: '执行工作流',
      
      // 位置参数定义
      args: [
        {
          name: 'filePath',        // 参数名称
          description: '文件路径',  // 参数描述
          required: true           // 是否必需
        }
      ],
      
      // 选项参数定义
      options: [
        {
          flags: '-o, --output <format>', // 选项标志
          description: '输出格式',        // 选项描述
          defaultValue: 'json',           // 默认值
          choices: ['json', 'xml', 'yaml'] // 可选值
        }
      ],
      
      // 命令处理函数 - 当命令被执行时调用
      action: async (domainActionContext, filePath, options) => {
        // 命令实现...
      }
    }
  ]
};
```

#### 4.4.3 命令执行上下文(DomainActionContext)

`domainActionContext`对象是命令处理函数的第一个参数，提供重要的环境信息和工具：

```typescript
/**
 * 命令执行上下文(DomainActionContext)
 */
interface DomainActionContext {
  /**
   * 获取当前领域编译器实例
   */
  getCompiler<T = unknown>(): DomainCompiler<T>;
  
  /**
   * 获取领域标识符
   */
  getDomain(): string;
  
  /**
   * 获取领域描述
   */
  getDescription(): string;
  
  /**
   * 获取编译选项
   */
  getOptions(): Required<CompileOptions>;
}
```

使用示例：

```typescript
action: async (domainActionContext, filePath, options) => {
  try {
    // 读取文件
    const content = await readFile(filePath, 'utf-8');
    
    // 使用编译器解析DPML
    const workflow = await domainActionContext.getCompiler().compile(content);
    
    console.log(`执行工作流: ${workflow.name}`);
    console.log(`输出格式: ${options.output}`);
    
    // 实际执行逻辑...
  } catch (error) {
    console.error('执行失败:', error.message);
  }
}
```

#### 4.4.4 命令执行流程

当用户在命令行输入DPML命令时，执行流程如下：

1. `bin.js`脚本被Node.js执行
2. 脚本调用`domainDPML.cli.execute()`
3. CLI系统解析命令行参数，确定要执行的命令
4. 创建domainActionContext对象，包含编译器和环境信息
5. 调用匹配命令的action函数，传入domainActionContext、参数和选项
6. 命令处理函数执行业务逻辑

#### 4.4.5 完整示例

**1. 定义命令配置**

```typescript
// config/cli.ts
import { readFile } from 'fs/promises';
import type { DomainCommandsConfig } from '@dpml/core';

export const commandsConfig: DomainCommandsConfig = {
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
      action: async (domainActionContext, filePath, options) => {
        try {
          // 读取文件
          const content = await readFile(filePath, 'utf-8');
          
          // 使用编译器解析DPML
          const workflow = await domainActionContext.getCompiler().compile(content);
          
          console.log(`执行工作流: ${workflow.name}`);
          console.log(`输出格式: ${options.output}`);
          
          // 实际执行逻辑...
        } catch (error) {
          console.error('执行失败:', error.message);
        }
      }
    }
  ]
};
```

**2. 创建领域DPML实例**

```typescript
// index.ts
import { createDomainDPML } from '@dpml/core';
import { workflowSchema } from './config/schema';
import { transformers } from './config/transformers';
import { commandsConfig } from './config/cli';
import type { Workflow } from './types';

// 创建领域DPML实例
export const workflowDPML = createDomainDPML<Workflow>({
  domain: 'workflow',
  description: '工作流处理领域',
  schema: workflowSchema,
  transformers,
  commands: commandsConfig
});

// 导出编译器
export const compiler = workflowDPML.compiler;
```

**3. CLI入口点**

```typescript
// bin.ts
import { workflowDPML } from './index';

async function main() {
  try {
    // 执行CLI命令
    await workflowDPML.cli.execute();
  } catch (error) {
    console.error('CLI执行错误:', error.message);
    process.exit(1);
  }
}

main();
```

**4. 最终用户使用方式**

```bash
# 安装工具
npm install -g my-workflow-tool

# 执行命令
dpml workflow execute path/to/workflow.xml --output yaml

# 查看帮助
dpml workflow --help
dpml workflow execute --help
```

## 5. 最佳实践

### 5.1 模块化设计

- 将Schema定义、转换器和命令配置分别放在独立模块中
- 使用桶文件(index.ts)统一导出
- 保持每个组件职责单一

### 5.2 转换器设计

- 遵循单一职责原则，一个转换器只负责一种转换
- 使用有意义的名称标识转换器
- 仔细规划转换器执行顺序
- 使用选择器精确定位目标元素

### 5.3 错误处理

- 提供清晰的错误信息
- 在合适的环境中选择合适的错误处理策略
- 使用日志系统记录关键信息

### 5.4 CLI命令设计

- 提供清晰、一致的命令名称和选项
- 添加详细的帮助信息
- 处理各种边缘情况和错误
- 提供用户友好的反馈

## 6. 完整项目结构示例

领域包项目结构示例：

```
my-dpml-domain/
  ├── src/
  │   ├── api/                 # API层 - 对外接口
  │   │   └── index.ts         # 公共API导出
  │   │
  │   ├── core/                # Core层 - 核心业务逻辑
  │   │
  │   ├── types/               # Types层 - 类型定义
  │   │
  │   ├── config/              # 配置目录
  │   │   ├── schema.ts        # Schema配置
  │   │   ├── transformers.ts  # 转换器配置
  │   │   ├── cli.ts           # CLI配置
  │   │   └── index.ts         # 配置导出
  │   │
  │   ├── bin.ts               # CLI入口
  │   └── index.ts             # 包主入口
  │
  ├── examples/                # 使用示例
  │
  ├── package.json
  └── README.md
```

## 安装

```bash
npm install @dpml/core
```
