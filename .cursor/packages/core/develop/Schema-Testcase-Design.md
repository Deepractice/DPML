# DPML Schema 模块测试用例设计

本文档遵循 [测试用例设计规则](../../../../rules/architecture/test-case-design.md) 和 [测试策略规则](../../../../rules/architecture/testing-strategy.md) 设计 DPML Schema 模块的测试用例。

## 1. 测试范围

本测试计划覆盖 Schema 模块的核心功能，包括：
- API 层和 Types 层的契约稳定性。
- Schema 业务类 (`Schema.ts`) 的核心验证逻辑。
- 模块服务层 (`schemaService.ts`) 的集成和协调能力。
- 从 API 调用到返回结果的完整端到端流程。

## 2. 测试类型与目标

- **契约测试**: 确保 API 和类型定义的稳定性，防止意外的破坏性变更。
- **单元测试**: 隔离验证 `Schema` 业务类的核心逻辑，特别是根据 Meta 规则进行验证和错误收集的部分。
- **集成测试**: 验证 `schemaService` 如何协调 `Schema` 类并正确返回处理结果。
- **端到端测试**: 验证从用户调用 API 到获得最终结果的完整工作流程。

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/api/schemaApi.contract.test.ts`

| ID               | 测试用例名称                               | 测试目的                                       | 测试输入             | 期望结果                                                     | Mock情况     |
| :--------------- | :----------------------------------------- | :--------------------------------------------- | :------------------- | :----------------------------------------------------------- | :----------- |
| CT-API-Schema-01 | `processSchema` API 应维持类型签名         | 验证 `processSchema` 函数签名和类型的稳定性    | 类型检查 (编译时)    | 函数存在，接受一个泛型对象 `T`，返回 `ProcessedSchema<T>` 或其子类型 | 无需模拟     |
| CT-API-Schema-02 | `processSchema` API 应返回符合契约的结果   | 验证返回类型结构符合 `ProcessedSchema<T>` 契约 | 有效 Schema 对象 `T` | 返回的对象包含 `schema` (类型 T), `isValid` (boolean), `errors` (可选, `SchemaError[]`) | 无需模拟     |
| CT-API-Schema-03 | `processSchema` API 异常处理符合契约 (N/A) | (如果API层定义了特定异常)验证异常类型是否符合约定 | 触发错误的输入       | (如果定义) 抛出指定类型的错误                                | (按需模拟服务层) |

#### 文件: `packages/core/src/__tests__/contract/types/processedSchema.contract.test.ts`

| ID                      | 测试用例名称                                   | 测试目的                                             | 测试输入          | 期望结果                                                                                               | Mock情况 |
| :---------------------- | :--------------------------------------------- | :--------------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------- | :------- |
| CT-Type-ProcSchema-01 | `ProcessedSchema<T>` 类型应维持结构稳定性        | 验证 `ProcessedSchema<T>` 接口结构不被意外修改       | 类型定义检查      | 接口包含 `schema: T`, `isValid: boolean`, `errors?: SchemaError[]` 属性，类型正确，可选性符合定义 | 无需模拟 |
| CT-Type-ProcSchema-02 | `ProcessedSchema<T>` 应支持不同的泛型类型 `T`    | 验证泛型 `T` 的正确应用                              | 使用不同类型 `T` | `schema` 属性的类型能正确反映传入的 `T`                                                              | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/schemaError.contract.test.ts`

| ID                   | 测试用例名称                                | 测试目的                                          | 测试输入     | 期望结果                                                                                                   | Mock情况 |
| :------------------- | :------------------------------------------ | :---------------------------------------------- | :----------- | :--------------------------------------------------------------------------------------------------------- | :------- |
| CT-Type-SchError-01 | `SchemaError<T>` 类型应维持结构稳定性         | 验证 `SchemaError<T>` 接口结构不被意外修改        | 类型定义检查 | 接口包含 `message: string`, `code: string`, `path: string`, `details?: T` 属性，类型正确，可选性符合定义 | 无需模拟 |
| CT-Type-SchError-02 | `SchemaError<T>` 应支持可选的泛型 `details` | 验证 `details` 属性的泛型和可选性                 | 使用/不使用 T | `details` 属性可以接受任何类型 `T` 或为 `undefined`                                                        | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/schema/Schema.test.ts`

* **测试对象**: `Schema` 业务类 (`core/schema/Schema.ts`)
* **主要方法**: `validate`, `collectErrors`
* **测试重点**: 验证该类如何根据内部 Meta 规则验证输入的 Schema 对象。

| ID                       | 测试用例名称                                             | 测试目的                                                     | 测试输入                                                                      | 期望结果 (`validate`/`collectErrors`) | Mock情况     |
| :----------------------- | :------------------------------------------------------- | :----------------------------------------------------------- | :---------------------------------------------------------------------------- | :--------------------------------------- | :----------- |
| **Positive Cases (validate)** |                                                          |                                                              |                                                                               |                                          |              |
| UT-Schema-Val-01         | `validate` 应接受基本的有效 `ElementSchema`              | 验证最简单的元素 Schema 结构                                 | `{ element: "button" }`                                                       | `true`                                   | 无需模拟     |
| UT-Schema-Val-02         | `validate` 应接受带有效 `attributes` 的 `ElementSchema`    | 验证属性定义的正确性 (名称、类型、可选性)                    | `{ element: "button", attributes: [{ name: "type", enum: ["a","b"] }, { name: "disabled" }] }` | `true`                                   | 无需模拟     |
| UT-Schema-Val-03         | `validate` 应接受带有效 `content` 的 `ElementSchema`       | 验证内容定义的正确性 (类型、必填)                          | `{ element: "p", content: { type: "text", required: true } }`                 | `true`                                   | 无需模拟     |
| UT-Schema-Val-04         | `validate` 应接受带有效 `children` 的 `ElementSchema`      | 验证子元素定义的正确性 (内联元素)                          | `{ element: "div", children: { elements: [{ element: "span" }] } }`          | `true`                                   | 无需模拟     |
| UT-Schema-Val-05         | `validate` 应接受带有效 `$ref` 引用的 `ElementSchema`      | 验证子元素使用类型引用的正确性                               | `{ element: "form", children: { elements: [{ $ref: "button" }] } }`           | `true` (假设"button"在Meta中已定义)      | 无需模拟     |
| UT-Schema-Val-06         | `validate` 应接受有效的 `DocumentSchema`                 | 验证文档级 Schema 结构 (含 `types` 和 `root`)                | `DocumentMeta` 示例 (见 Schema-Design.md)                                     | `true`                                   | 无需模拟     |
| UT-Schema-Val-07         | `validate` 应接受带 `globalAttributes` 的 `DocumentSchema` | 验证文档级全局属性定义                                       | `DocumentMeta` 示例 + `globalAttributes`                                    | `true`                                   | 无需模拟     |
| **Negative Cases (validate)** |                                                          |                                                              |                                                                               |                                          |              |
| UT-Schema-ValNeg-01      | `validate` 应拒绝缺少 `element` 的 `ElementSchema`         | 验证核心属性的缺失                                           | `{ attributes: [...] }`                                                      | `false`                                  | 无需模拟     |
| UT-Schema-ValNeg-02      | `validate` 应拒绝 `attributes` 不是数组的 `ElementSchema`  | 验证属性定义的类型错误                                       | `{ element: "button", attributes: { name: "type" } }`                         | `false`                                  | 无需模拟     |
| UT-Schema-ValNeg-03      | `validate` 应拒绝 `attribute` 定义缺少 `name`            | 验证属性项内部的必填字段缺失                                 | `{ element: "button", attributes: [{ enum: ["a","b"] }] }`                    | `false`                                  | 无需模拟     |
| UT-Schema-ValNeg-04      | `validate` 应拒绝 `content` 定义缺少 `type`              | 验证内容定义内部的必填字段缺失                               | `{ element: "p", content: { required: true } }`                               | `false`                                  | 无需模拟     |
| UT-Schema-ValNeg-05      | `validate` 应拒绝 `children` 定义缺少 `elements`         | 验证子元素定义内部的必填字段缺失                             | `{ element: "div", children: { orderImportant: true } }`                      | `false`                                  | 无需模拟     |
| UT-Schema-ValNeg-06      | `validate` 应拒绝无效的 `$ref` (引用不存在的类型)        | 验证类型引用解析失败的情况                                   | `{ element: "form", children: { elements: [{ $ref: "nonExistent" }] } }`      | `false`                                  | 无需模拟     |
| UT-Schema-ValNeg-07      | `validate` 应拒绝 `DocumentSchema` 缺少 `root`           | 验证文档级 Schema 的核心属性缺失                             | `{ metaType: "document", types: [...] }`                                      | `false`                                  | 无需模拟     |
| **Error Collection (collectErrors)** |                                                          |                                                              |                                                                               |                                          |              |
| UT-Schema-CollErr-01     | `collectErrors` 应收集单个错误信息                       | 验证单个验证失败时的错误收集                                 | `{ attributes: [...] }` (同 UT-Schema-ValNeg-01)                              | 返回包含1个 `SchemaError` 的数组         | 无需模拟     |
| UT-Schema-CollErr-02     | `collectErrors` 应收集多个错误信息                       | 验证多个验证失败时的错误收集                                 | `{ content: {}, children: {} }` (同时缺少 `element`, `content.type`, `children.elements`) | 返回包含多个 `SchemaError` 的数组      | 无需模拟     |
| UT-Schema-CollErr-03     | `collectErrors` 应包含正确的错误 `path`                  | 验证错误路径的准确性                                         | `{ element: "button", attributes: [{ enum: ["a","b"] }] }` (缺少 `name`)     | 错误 `path` 应指向 `attributes[0]`     | 无需模拟     |
| UT-Schema-CollErr-04     | `collectErrors` 对有效 Schema 应返回空数组             | 验证有效输入时不收集错误                                     | `{ element: "button" }` (同 UT-Schema-Val-01)                                 | 返回空数组 `[]`                            | 无需模拟     |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/schema/schemaService.integration.test.ts`

*   **测试对象**: `schemaService` (`core/schema/schemaService.ts`)
*   **测试重点**: 验证 `schemaService` 如何协调 `Schema` 业务类，并正确组装和返回 `ProcessedSchema` 对象。

| ID                       | 测试用例名称                                                | 测试目的                                                         | 测试输入                      | 期望结果                                           | Mock情况                 |
| :----------------------- | :---------------------------------------------------------- | :--------------------------------------------------------------- | :---------------------------- | :------------------------------------------------- | :----------------------- |
| IT-SchemaSvc-Process-01 | `processSchema` 应为有效 Schema 返回 `isValid: true`          | 验证服务层处理有效 Schema 的完整流程                             | 有效 Schema 对象 (如 UT-Schema-Val-01 输入) | 返回 `{ schema: ..., isValid: true }`              | 无需模拟 (使用真实 Schema 类) |
| IT-SchemaSvc-Process-02 | `processSchema` 应为无效 Schema 返回 `isValid: false` 及错误    | 验证服务层处理无效 Schema 并收集错误的流程                       | 无效 Schema 对象 (如 UT-Schema-ValNeg-01 输入) | 返回 `{ schema: ..., isValid: false, errors: [...] }` | 无需模拟 (使用真实 Schema 类) |
| IT-SchemaSvc-Process-03 | `processSchema` 应正确传递泛型类型 `T`                        | 验证泛型信息在服务层传递的正确性                                 | 类型化的有效 Schema 对象 `T`    | 返回结果的 `schema` 属性类型为 `T`               | 无需模拟 (使用真实 Schema 类) |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/schema/schemaWorkflow.e2e.test.ts`

*   **测试对象**: 从 `api/schema.processSchema` 调用到获得最终结果的完整工作流。
*   **测试重点**: 验证整个 Schema 处理链路的功能正确性，覆盖 API 层 -> 服务层 -> 业务类 -> 返回结果。

| ID                     | 测试用例名称                                           | 测试目的                                      | 测试输入 (调用 `api/schema.processSchema`) | 期望结果 (最终返回给用户)                        | Mock情况 |
| :--------------------- | :----------------------------------------------------- | :-------------------------------------------- | :--------------------------------------- | :------------------------------------------- | :------- |
| E2E-Schema-Valid-01  | 完整流程应正确处理有效的 Schema                      | 验证从 API 到 Core 的完整有效路径             | 有效 Schema 对象 `T`                   | 返回 `{ schema: T, isValid: true }`          | 无需模拟 |
| E2E-Schema-Invalid-01 | 完整流程应正确处理无效的 Schema 并返回错误           | 验证从 API 到 Core 的完整无效路径及错误处理   | 无效 Schema 对象 `T`                   | 返回 `{ schema: T, isValid: false, errors: [...] }` | 无需模拟 |

## 4. 模拟策略

- **单元测试**: `Schema` 类主要进行逻辑判断，不直接依赖外部服务，因此其单元测试基本无需模拟。
- **集成测试**: 测试 `schemaService` 与 `Schema` 类的协作，原则上不模拟内部依赖（即 `Schema` 类）。
- **端到端测试**: 完全不模拟内部组件，验证真实流程。

## 5. 测试覆盖率目标

- **契约测试**: 覆盖所有公共 API 和 Types。
- **单元测试**: 覆盖 `Schema` 类的核心验证逻辑和错误收集逻辑，目标行覆盖率 85%+。
- **集成测试**: 覆盖 `schemaService` 的主要协调流程，目标行覆盖率 80%+。
- **端到端测试**: 覆盖关键的有效和无效工作流。

## 6. 测试夹具

实际测试代码中，应定义可复用的函数或常量来创建不同类型的有效和无效 Schema 对象，作为测试夹具，提高测试代码的可读性和可维护性。 