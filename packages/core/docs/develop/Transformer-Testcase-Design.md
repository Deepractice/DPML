# DPML Transformer模块测试用例设计

本文档遵循 [测试用例设计规则](../../../../rules/architecture/test-case-design.md) 和 [测试策略规则](../../../../rules/architecture/testing-strategy.md) 设计DPML Transformer模块的测试用例。

## 1. 测试范围

本测试计划覆盖Transformer模块的核心功能，包括：
- API层和Types层的契约稳定性
- 核心转换器组件的功能正确性
- 模块服务层的协调能力
- Pipeline执行流程
- TransformContext的上下文共享机制
- 不同结果模式和合并策略
- 从API调用到返回结果的完整端到端流程

## 2. 测试类型与目标

- **契约测试**: 确保API和类型定义的稳定性，防止意外的破坏性变更
- **单元测试**: 验证各转换器组件的独立功能和Pipeline的协调功能
- **集成测试**: 验证transformerService如何协调不同组件并正确返回结果
- **端到端测试**: 验证从用户调用API到获得最终结果的完整工作流程

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/api/transformer.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-API-TRANS-01 | `transform<T>` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 符合公开文档的函数签名，接受ProcessingResult和可选的TransformOptions，返回TransformResult<T> | 无需模拟 |
| CT-API-TRANS-02 | `registerTransformer` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 函数接受符合Transformer<TInput, TOutput>接口的对象 | 无需模拟 |
| CT-API-TRANS-03 | `registerStructuralMapper` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 函数接受MappingRule数组作为参数 | 无需模拟 |
| CT-API-TRANS-04 | `transform<T>` API应返回符合TransformResult接口的结果 | 验证返回类型契约 | 有效的ProcessingResult | 返回符合TransformResult<T>接口的对象 | 模拟transformerService返回符合契约的数据 |
| CT-API-TRANS-05 | `transform<T>` API应支持自定义结果类型 | 验证泛型契约 | 类型参数扩展 | 支持扩展TransformResult<T>的泛型参数 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/Transformer.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-TRANS-01 | Transformer接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含name、description、type和transform方法 | 无需模拟 |
| CT-TYPE-TRANS-02 | Transformer接口应支持泛型类型安全 | 验证泛型类型安全 | 不同类型参数的实现 | 类型参数正确应用于transform方法的参数和返回值 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/TransformContext.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-CTXT-01 | TransformContext类应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 类包含set、get、has、getDocument等公共方法 | 无需模拟 |
| CT-TYPE-CTXT-02 | TransformContext.set/get应保持类型安全 | 验证泛型类型安全 | 不同类型的存取操作 | 类型参数正确应用于set和get方法 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/TransformResult.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-RES-01 | TransformResult接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含transformers、merged、raw、warnings和metadata字段 | 无需模拟 |
| CT-TYPE-RES-02 | TransformResult应支持泛型类型T | 验证泛型类型支持 | 不同类型参数T | merged字段类型应为T | 无需模拟 |
| CT-TYPE-RES-03 | TransformResult.transformers应为Record类型 | 验证类型约束 | 类型检查 | transformers字段类型为Record<string, unknown> | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/TransformOptions.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-OPT-01 | TransformOptions接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含context、resultMode、include和exclude字段 | 无需模拟 |
| CT-TYPE-OPT-02 | TransformOptions.resultMode应支持限定值 | 验证字面量类型 | 类型检查 | resultMode字段类型为'full'或'merged'或'raw'的联合类型 | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/transformer/transformers/StructuralMapperTransformer.test.ts`

* **测试对象**: StructuralMapperTransformer执行组件 (`core/transformer/StructuralMapperTransformer.ts`)
* **主要方法**: `transform`
* **测试重点**: 验证组件如何基于映射规则从ProcessingResult中提取和转换数据

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-STRUCTMAP-01 | transform应基于选择器提取数据 | 验证基本选择器映射 | 带有匹配选择器的输入和简单映射规则 | 返回按映射规则构建的对象 | 模拟TransformContext |
| UT-STRUCTMAP-02 | transform应处理嵌套路径映射 | 验证嵌套路径映射 | 带有嵌套路径映射规则的输入 | 返回带有正确嵌套结构的对象 | 模拟TransformContext |
| UT-STRUCTMAP-03 | transform应应用转换函数 | 验证值转换功能 | 带有transform函数的映射规则 | 返回的值经过transform函数处理 | 模拟TransformContext |
| UT-STRUCTMAP-04 | transform应将结果存储到上下文 | 验证上下文存储 | 带有name的转换器 | 结果被存储到上下文中对应name的key下 | 模拟TransformContext |
| **反向测试** |
| UT-STRUCTMAP-NEG-01 | transform应处理选择器无匹配的情况 | 验证无匹配处理 | 无匹配元素的输入 | 对应路径值为undefined | 模拟TransformContext |
| UT-STRUCTMAP-NEG-02 | transform应处理转换函数抛出异常的情况 | 验证异常处理 | 带有会抛出异常的transform函数的规则 | 捕获异常并添加警告，路径值为undefined | 模拟TransformContext |

#### 文件: `packages/core/src/__tests__/unit/transformer/transformers/TemplateTransformer.test.ts`

* **测试对象**: TemplateTransformer执行组件 (`core/transformer/TemplateTransformer.ts`)
* **主要方法**: `transform`
* **测试重点**: 验证组件如何基于模板和数据生成字符串输出

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-TEMPLATE-01 | transform应使用字符串模板渲染数据 | 验证字符串模板功能 | 字符串模板和数据对象 | 返回渲染后的字符串 | 模拟TransformContext |
| UT-TEMPLATE-02 | transform应使用函数模板渲染数据 | 验证函数模板功能 | 函数模板和数据对象 | 返回函数执行的结果 | 模拟TransformContext |
| UT-TEMPLATE-03 | transform应应用预处理函数 | 验证预处理功能 | 数据对象和预处理函数 | 数据先经预处理后再应用模板 | 模拟TransformContext |
| UT-TEMPLATE-04 | transform应将结果存储到上下文 | 验证上下文存储 | 带有name的转换器 | 结果被存储到上下文中对应name的key下 | 模拟TransformContext |
| **反向测试** |
| UT-TEMPLATE-NEG-01 | transform应处理模板函数抛出异常的情况 | 验证异常处理 | 会抛出异常的模板函数 | 捕获异常并添加警告，返回空字符串 | 模拟TransformContext |

#### 文件: `packages/core/src/__tests__/unit/transformer/transformers/AggregatorTransformer.test.ts`

* **测试对象**: AggregatorTransformer执行组件 (`core/transformer/AggregatorTransformer.ts`)
* **主要方法**: `transform`
* **测试重点**: 验证组件如何收集和聚合元素

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-AGGRE-01 | transform应收集匹配选择器的元素 | 验证基本收集功能 | 带有匹配选择器的输入和简单CollectorConfig | 返回包含所有匹配元素的数组 | 模拟TransformContext |
| UT-AGGRE-02 | transform应基于groupBy字段分组元素 | 验证分组功能 | 带有groupBy配置的CollectorConfig | 返回按groupBy字段分组的对象 | 模拟TransformContext |
| UT-AGGRE-03 | transform应基于sortBy字段排序元素 | 验证排序功能 | 带有sortBy配置的CollectorConfig | 返回按sortBy字段排序的数组 | 模拟TransformContext |
| UT-AGGRE-04 | transform应将结果存储到上下文 | 验证上下文存储 | 带有name的转换器 | 结果被存储到上下文中对应name的key下 | 模拟TransformContext |
| **反向测试** |
| UT-AGGRE-NEG-01 | transform应处理选择器无匹配的情况 | 验证无匹配处理 | 无匹配元素的输入 | 返回空数组或空对象(如果groupBy) | 模拟TransformContext |

#### 文件: `packages/core/src/__tests__/unit/transformer/transformers/ResultCollectorTransformer.test.ts`

* **测试对象**: ResultCollectorTransformer执行组件 (`core/transformer/ResultCollectorTransformer.ts`)
* **主要方法**: `transform`
* **测试重点**: 验证组件如何收集并合并转换结果

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-RESCOL-01 | transform应收集所有转换器结果 | 验证基本收集功能 | 未指定transformerNames | 返回包含所有转换器结果的对象 | 模拟TransformContext提供多个转换器结果 |
| UT-RESCOL-02 | transform应只收集指定转换器结果 | 验证选择性收集 | 指定部分transformerNames | 返回仅包含指定转换器结果的对象 | 模拟TransformContext提供多个转换器结果 |
| UT-RESCOL-03 | transform应正确合并结果 | 验证合并功能 | 多个具有相同结构的转换器结果 | 返回合并后的结果对象 | 模拟TransformContext提供可合并的转换器结果 |
| **反向测试** |
| UT-RESCOL-NEG-01 | transform应处理上下文中没有指定结果的情况 | 验证错误处理 | 指定不存在的transformerNames | 对应结果为undefined，添加警告 | 模拟TransformContext |

#### 文件: `packages/core/src/__tests__/unit/transformer/Pipeline.test.ts`

* **测试对象**: Pipeline协调组件 (`core/transformer/Pipeline.ts`)
* **主要方法**: `add`, `execute`
* **测试重点**: 验证组件如何管理和执行转换器链

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-PIPE-01 | add应添加转换器到管道 | 验证添加功能 | 一个Transformer实例 | 转换器被添加到内部数组 | 模拟Transformer |
| UT-PIPE-02 | execute应按顺序执行转换器 | 验证执行顺序 | 多个转换器和输入数据 | 按添加顺序依次执行转换器 | 模拟多个Transformer，验证调用顺序 |
| UT-PIPE-03 | execute应传递前一个转换器的输出作为下一个的输入 | 验证数据流 | 连续的转换器和输入数据 | 每个转换器接收前一个的输出 | 模拟多个Transformer，验证数据传递 |
| UT-PIPE-04 | execute应传递相同的上下文给所有转换器 | 验证上下文共享 | 多个转换器和上下文 | 所有转换器接收同一个上下文实例 | 模拟多个Transformer，验证上下文共享 |
| **反向测试** |
| UT-PIPE-NEG-01 | execute应处理转换器抛出异常的情况 | 验证异常处理 | 会抛出异常的转换器 | 捕获异常并中断执行，传递异常 | 模拟抛出异常的Transformer |

#### 文件: `packages/core/src/__tests__/unit/transformer/TransformerRegistry.test.ts`

* **测试对象**: TransformerRegistry状态管理组件 (`core/transformer/TransformerRegistry.ts`)
* **主要方法**: `register`, `getTransformers`
* **测试重点**: 验证组件如何管理已注册的转换器

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-REG-01 | register应添加转换器到注册表 | 验证注册功能 | 一个Transformer实例 | 转换器被添加到内部数组 | 模拟Transformer |
| UT-REG-02 | register应支持多次注册不同转换器 | 验证多次注册 | 多个不同的Transformer实例 | 所有转换器都被添加到注册表 | 模拟多个Transformer |
| UT-REG-03 | getTransformers应返回所有已注册转换器 | 验证获取功能 | 预先注册的多个转换器 | 返回包含所有已注册转换器的数组 | 模拟多个Transformer |
| **反向测试** |
| UT-REG-NEG-01 | getTransformers在无注册转换器时应返回空数组 | 验证空状态 | 未注册任何转换器 | 返回空数组 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/transformer/TransformContext.test.ts`

* **测试对象**: TransformContext类 (`core/transformer/TransformContext.ts`)
* **主要方法**: `set`, `get`, `has`, `getDocument`, `getAllResults`
* **测试重点**: 验证类如何管理转换过程中的状态和数据访问

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-CTX-01 | set应存储数据到内部Map | 验证存储功能 | 键值对 | 数据被存储 | 无需模拟 |
| UT-CTX-02 | get应返回之前存储的数据 | 验证检索功能 | 已存储数据的键 | 返回对应的值 | 无需模拟 |
| UT-CTX-03 | has应检查键是否存在 | 验证检查功能 | 存在/不存在的键 | 返回true/false | 无需模拟 |
| UT-CTX-04 | getDocument应返回处理结果中的文档 | 验证文档访问 | 带文档的ProcessingResult | 返回文档 | 模拟ProcessingResult |
| UT-CTX-05 | getAllResults应返回所有存储的数据 | 验证结果集合 | 多个存储的数据 | 返回包含所有数据的对象 | 无需模拟 |
| **类型安全测试** |
| UT-CTX-TYPE-01 | set和get应保持类型安全 | 验证泛型类型安全 | 不同类型的数据 | 类型信息在存取过程中保持一致 | 无需模拟 |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/transformer/transformerService.integration.test.ts`

* **测试对象**: transformerService模块服务 (`core/transformer/transformerService.ts`)
* **测试重点**: 验证服务如何协调Pipeline、Registry和转换器的工作

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-TRANSVC-01 | transform应创建Pipeline并执行转换流程 | 验证完整转换流程 | 处理结果和转换选项 | 返回包含正确转换结果的TransformResult | 无需模拟，使用真实组件 |
| IT-TRANSVC-02 | transform应支持full结果模式 | 验证full模式 | resultMode:'full' | 返回包含transformers、merged和raw的结果 | 无需模拟，使用真实组件 |
| IT-TRANSVC-03 | transform应支持merged结果模式 | 验证merged模式 | resultMode:'merged' | 返回仅包含merged的结果 | 无需模拟，使用真实组件 |
| IT-TRANSVC-04 | transform应支持raw结果模式 | 验证raw模式 | resultMode:'raw' | 返回仅包含raw的结果 | 无需模拟，使用真实组件 |
| IT-TRANSVC-05 | transform应支持include过滤 | 验证include过滤 | include:['transformer1'] | 结果仅包含指定转换器的输出 | 无需模拟，使用真实组件 |
| IT-TRANSVC-06 | transform应支持exclude过滤 | 验证exclude过滤 | exclude:['transformer2'] | 结果不包含指定转换器的输出 | 无需模拟，使用真实组件 |
| IT-TRANSVC-07 | registerTransformer应注册转换器到注册表 | 验证注册功能 | 自定义转换器 | 转换器被注册并在transform中使用 | 无需模拟，使用真实组件 |
| IT-TRANSVC-08 | registerStructuralMapper应创建并注册结构映射转换器 | 验证便捷注册 | 映射规则数组 | 创建StructuralMapperTransformer并注册 | 无需模拟，使用真实组件 |

#### 文件: `packages/core/src/__tests__/integration/transformer/pipelineExecution.integration.test.ts`

* **测试对象**: Pipeline执行流程 (`core/transformer/Pipeline.ts` 及各转换器)
* **测试重点**: 验证Pipeline如何协调多个转换器的工作，以及在转换器链中如何共享上下文和传递数据

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-PIPELINE-01 | Pipeline应协调结构映射和模板转换器 | 验证常见转换链 | 带有结构映射和模板转换器的Pipeline | 结构映射结果作为模板输入，生成最终输出 | 无需模拟，使用真实组件 |
| IT-PIPELINE-02 | Pipeline应支持转换器间的上下文数据共享 | 验证上下文共享 | 多个会写入/读取上下文的转换器 | 后面的转换器能读取前面写入的数据 | 无需模拟，使用真实组件 |
| IT-PIPELINE-03 | Pipeline应支持复杂的转换链 | 验证复杂场景 | 多种类型的转换器组合 | 正确执行所有转换，产生预期结果 | 无需模拟，使用真实组件 |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/transformer/transformProcess.e2e.test.ts`

* **测试对象**: 从API调用到获得最终结果的完整转换流程
* **测试重点**: 验证整个转换链路的功能正确性，覆盖API层→模块服务层→Pipeline→转换器→结果合并

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| E2E-TRANS-01 | 完整流程应支持基本结构映射转换 | 验证结构映射端到端流程 | 处理结果和结构映射规则 | 返回符合映射规则的结构化数据 | 无需模拟 |
| E2E-TRANS-02 | 完整流程应支持多步转换链 | 验证复杂转换端到端流程 | 处理结果和多个注册的转换器 | 返回经过完整转换链处理的结果 | 无需模拟 |
| E2E-TRANS-03 | 完整流程应支持自定义结果类型 | 验证类型安全端到端流程 | 处理结果和自定义泛型类型 | 返回符合指定类型的结果 | 无需模拟 |
| E2E-TRANS-04 | 完整流程应处理错误和警告 | 验证错误处理端到端流程 | 会导致转换异常的处理结果 | 返回包含警告的结果，程序不中断 | 无需模拟 |

## 4. 测试夹具设计

为了支持上述测试用例，应创建以下测试夹具：

```typescript
// packages/core/src/__tests__/fixtures/transformer/transformerFixtures.ts

// 创建基本处理结果夹具
export function createProcessingResultFixture() {
  return {
    document: {
      rootNode: {
        tagName: 'model',
        attributes: new Map([['id', 'test-model']]),
        children: [
          {
            tagName: 'session',
            attributes: new Map([
              ['name', 'gpt-4'],
              ['temperature', '0.7'],
              ['max-tokens', '2048']
            ]),
            children: [],
            content: '',
            parent: null // 在实际测试中需要设置
          },
          {
            tagName: 'prompt',
            attributes: new Map([['type', 'system']]),
            children: [],
            content: '你是一个有用的助手',
            parent: null // 在实际测试中需要设置
          },
          {
            tagName: 'prompt',
            attributes: new Map([['type', 'user']]),
            children: [],
            content: '告诉我关于人工智能的信息',
            parent: null // 在实际测试中需要设置
          }
        ],
        content: '',
        parent: null
      }
    },
    isValid: true,
    references: new Map([['test-model', /* 引用到模型节点 */]]),
    schema: { /* schema信息 */ }
  };
}

// 创建结构映射规则夹具
export function createMappingRulesFixture() {
  return [
    { selector: 'session', targetPath: 'parameters' },
    { selector: 'session[temperature]', targetPath: 'parameters.temperature', 
      transform: (value: string) => parseFloat(value) },
    { selector: 'session[max-tokens]', targetPath: 'parameters.maxTokens', 
      transform: (value: string) => parseInt(value, 10) },
    { selector: 'prompt[type="system"]', targetPath: 'systemPrompt',
      transform: (node: any) => node.content }
  ];
}

// 创建模板字符串夹具
export function createTemplateFixture() {
  return `System: {{systemPrompt}}
Parameters: Temperature {{parameters.temperature}}, Max Tokens {{parameters.maxTokens}}`;
}

// 创建CollectorConfig夹具
export function createCollectorConfigFixture() {
  return {
    selector: 'prompt',
    groupBy: 'type'
  };
}

// 创建转换结果的预期输出夹具
export function createExpectedOutputFixture() {
  return {
    parameters: {
      temperature: 0.7,
      maxTokens: 2048
    },
    systemPrompt: '你是一个有用的助手',
    prompts: {
      system: ['你是一个有用的助手'],
      user: ['告诉我关于人工智能的信息']
    }
  };
}
```

## 5. 测试实现示例

```typescript
// packages/core/src/__tests__/unit/transformer/StructuralMapperTransformer.test.ts
import { describe, test, expect, vi } from 'vitest';
import { StructuralMapperTransformer } from '../../../src/core/transformer/StructuralMapperTransformer';
import { createProcessingResultFixture, createMappingRulesFixture } from '../../fixtures/transformer/transformerFixtures';

describe('StructuralMapperTransformer', () => {
  test('应基于选择器提取数据', () => {
    // 准备
    const mappingRules = createMappingRulesFixture();
    const transformer = new StructuralMapperTransformer(mappingRules);
    const input = createProcessingResultFixture();
    const mockContext = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      getDocument: vi.fn().mockReturnValue(input.document)
    };
    
    // 执行
    const result = transformer.transform(input, mockContext as any);
    
    // 断言
    expect(result).toHaveProperty('parameters');
    expect(result.parameters).toHaveProperty('temperature', 0.7);
    expect(result.parameters).toHaveProperty('maxTokens', 2048);
    expect(result).toHaveProperty('systemPrompt', '你是一个有用的助手');
  });
});

// packages/core/src/__tests__/integration/transformer/transformerService.integration.test.ts
import { describe, test, expect } from 'vitest';
import { transformerService } from '../../../src/core/transformer/transformerService';
import { createProcessingResultFixture, createMappingRulesFixture } from '../../fixtures/transformer/transformerFixtures';

describe('transformerService集成测试', () => {
  test('应注册并使用结构映射转换器', () => {
    // 准备
    const input = createProcessingResultFixture();
    const mappingRules = createMappingRulesFixture();
    
    // 注册转换器
    transformerService.registerStructuralMapper(mappingRules);
    
    // 执行
    const result = transformerService.transform(input);
    
    // 断言
    expect(result.isValid).toBe(true);
    expect(result.merged).toHaveProperty('parameters');
    expect(result.merged.parameters).toHaveProperty('temperature', 0.7);
    expect(result.merged.parameters).toHaveProperty('maxTokens', 2048);
  });
});
```

## 6. 测试覆盖率目标

- **契约测试**: 覆盖所有公共API和Types，确保接口稳定性。
- **单元测试**: 覆盖所有转换器和关键组件的核心逻辑，目标行覆盖率85%+。
- **集成测试**: 覆盖transformerService的主要协调流程和典型转换链，目标行覆盖率80%+。
- **端到端测试**: 覆盖关键的转换流程和结果合并策略。

## 7. 模拟策略

- **契约测试**: 主要进行类型检查，部分情况下需要模拟transformerService返回符合契约的数据。
- **单元测试**:
  - 测试转换器时，模拟TransformContext以隔离依赖。
  - 测试Pipeline时，模拟Transformer组件，验证调用流程。
  - 测试Registry时，基本无需模拟。
- **集成测试**: 原则上不模拟内部依赖，使用真实组件验证协作流程。
- **端到端测试**: 完全不模拟，使用真实组件验证完整流程。

## 8. 测试总结

本测试设计覆盖了Transformer模块的所有核心组件和关键功能，遵循DPML架构测试策略规则，设计了不同类型的测试：

1. **契约测试**: 确保API和类型的稳定性和一致性
2. **单元测试**: 验证各组件的独立功能，包括所有转换器类型
3. **集成测试**: 验证模块服务的协调能力和组件间的协作
4. **端到端测试**: 验证完整用户工作流程

测试用例设计注重正向测试和反向测试的平衡，确保既测试正常功能路径，也测试错误处理机制。测试夹具设计提供了丰富的输入数据和预期结果，便于测试的实施和维护。

通过全面的测试覆盖，确保Transformer模块能够稳定、高效地完成不同场景下的数据转换需求，支持多种转换策略和结果呈现模式。 
