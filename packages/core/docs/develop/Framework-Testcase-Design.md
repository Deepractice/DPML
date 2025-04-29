# DPML Framework模块测试用例设计

本文档遵循 [测试用例设计规则](../../../../rules/architecture/test-case-design.md) 和 [测试策略规则](../../../../rules/architecture/testing-strategy.md) 设计DPML Framework模块的测试用例。

## 1. 测试范围

本测试计划覆盖Framework模块的核心功能，包括：
- API层和Types层的契约稳定性
- 领域编译器的创建与配置
- 闭包状态管理的正确性
- 编译流程的完整性
- 配置扩展机制
- 对其他核心模块的协调
- 从API调用到返回领域对象的完整端到端流程

## 2. 测试类型与目标

- **契约测试**: 确保API和类型定义的稳定性，防止意外的破坏性变更
- **单元测试**: 验证各组件的独立功能，特别是domainService的各个函数
- **集成测试**: 验证Framework如何协调各核心模块，确保完整编译流程的正确性
- **端到端测试**: 验证从用户调用API到获得最终领域对象的完整工作流程

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/api/framework.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-API-FRMW-01 | `createDomainDPML<T>` API应维持类型签名 | 验证API契约稳定性 | 类型检查 | 符合公开文档的函数签名 | 无需模拟 |
| CT-API-FRMW-02 | `createDomainDPML<T>` API应返回符合DomainCompiler接口的对象 | 验证返回类型契约 | 有效的DomainConfig | 返回符合DomainCompiler<T>接口的对象 | 模拟domainService返回符合契约的数据 |
| CT-API-FRMW-03 | `createDomainDPML<T>` API应支持泛型参数 | 验证泛型契约 | 类型参数T | 返回的编译器compile方法能返回T类型结果 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/DomainCompiler.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-DCOMP-01 | DomainCompiler接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含compile、extend、getSchema和getTransformers方法 | 无需模拟 |
| CT-TYPE-DCOMP-02 | DomainCompiler.compile应返回Promise<T> | 验证泛型类型安全 | 类型检查 | compile方法返回Promise<T>类型 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/DomainConfig.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-DCONF-01 | DomainConfig接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含schema、transformers和可选的options字段 | 无需模拟 |
| CT-TYPE-DCONF-02 | DomainConfig.options应为可选字段 | 验证可选性 | 类型检查 | 创建DomainConfig时options字段可省略 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/CompileOptions.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-COPTS-01 | CompileOptions接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 接口包含strictMode、errorHandling、transformOptions和custom字段 | 无需模拟 |
| CT-TYPE-COPTS-02 | CompileOptions.errorHandling应支持限定值 | 验证字面量类型 | 类型检查 | errorHandling字段类型为'throw'或'warn'或'silent'的联合类型 | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/core/framework/domainService.test.ts`

* **测试对象**: domainService模块服务 (`core/framework/domainService.ts`)
* **主要方法**: `initializeDomain`, `compileDPML`, `extendDomain`, `getDomainSchema`, `getDomainTransformers`
* **测试重点**: 验证domainService如何管理领域状态和协调编译流程

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-DOMSVC-01 | initializeDomain应正确初始化领域状态 | 验证初始化功能 | 有效的DomainConfig | 返回包含正确配置的DomainState | 无需模拟 |
| UT-DOMSVC-02 | initializeDomain应设置默认选项 | 验证默认值处理 | 不含options的DomainConfig | 返回包含默认options的DomainState | 无需模拟 |
| UT-DOMSVC-03 | compileDPML应协调解析、处理和转换流程 | 验证编译流程协调 | DPML内容和DomainState | 成功编译并返回领域对象 | 模拟parse、processDocument和transform函数 |
| UT-DOMSVC-04 | extendDomain应更新Schema | 验证Schema更新 | DomainState和含schema的配置 | Schema被更新 | 无需模拟 |
| UT-DOMSVC-05 | extendDomain应更新转换器 | 验证转换器更新 | DomainState和含transformers的配置 | 转换器被更新 | 无需模拟 |
| UT-DOMSVC-06 | extendDomain应更新选项 | 验证选项更新 | DomainState和含options的配置 | 选项被合并更新 | 无需模拟 |
| UT-DOMSVC-07 | getDomainSchema应返回当前Schema | 验证Schema获取 | 含Schema的DomainState | 返回正确的Schema | 无需模拟 |
| UT-DOMSVC-08 | getDomainTransformers应返回当前转换器 | 验证转换器获取 | 含转换器的DomainState | 返回转换器数组副本 | 无需模拟 |
| **反向测试** |
| UT-DOMSVC-NEG-01 | initializeDomain应验证配置有效性 | 验证配置验证 | 无效的DomainConfig | 抛出配置错误 | 无需模拟 |
| UT-DOMSVC-NEG-02 | compileDPML应在验证失败时遵循errorHandling策略 | 验证错误处理 | 无效DPML和'throw'策略 | 抛出验证错误 | 模拟parse和processDocument，后者返回isValid:false |
| UT-DOMSVC-NEG-03 | compileDPML应处理解析错误 | 验证解析错误处理 | 导致解析错误的内容 | 抛出解析错误 | 模拟parse抛出错误 |
| UT-DOMSVC-NEG-04 | compileDPML应处理转换错误 | 验证转换错误处理 | 导致转换错误的内容 | 抛出转换错误 | 模拟transform抛出错误 |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/framework/compileWorkflow.integration.test.ts`

* **测试对象**: 从API创建的DomainCompiler及其完整功能 (`api/framework.ts` 和 `core/framework/domainService.ts`)
* **测试重点**: 验证Framework如何集成核心模块提供完整的编译功能

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-FRMW-01 | Framework应协调解析、处理和转换完成编译 | 验证端到端编译流程 | 有效DPML内容和DomainConfig | 成功编译为领域对象 | 模拟parse、processDocument和transform返回预期结果 |
| IT-FRMW-02 | Framework应支持严格模式配置 | 验证严格模式配置 | 含strictMode:true的配置 | 严格模式配置被正确传递给核心模块 | 模拟核心模块，验证配置传递 |
| IT-FRMW-03 | Framework应支持错误处理策略配置 | 验证错误处理配置 | 含errorHandling选项的配置 | 错误处理策略被正确应用 | 模拟核心模块，验证配置传递 |
| IT-FRMW-04 | Framework应支持转换选项配置 | 验证转换选项配置 | 含transformOptions的配置 | 转换选项被正确传递给transform | 模拟transform，验证选项传递 |
| IT-FRMW-05 | Framework应正确扩展领域配置 | 验证配置扩展流程 | 已创建的编译器和扩展配置 | 配置被正确扩展 | 模拟核心模块，验证配置更新 |

#### 文件: `packages/core/src/__tests__/integration/framework/closureState.integration.test.ts`

* **测试对象**: 闭包状态管理 (`api/framework.ts` 生成的闭包对象)
* **测试重点**: 验证闭包状态如何正确维护及更新

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-CLSR-01 | 闭包应维护独立状态 | 验证状态隔离 | 两个不同配置创建的编译器 | 每个闭包维护独立状态 | 模拟domainService返回可观察状态 |
| IT-CLSR-02 | 闭包应防止外部直接修改状态 | 验证状态封装 | 尝试直接修改闭包状态 | 无法直接访问或修改内部状态 | 无需模拟 |
| IT-CLSR-03 | 闭包方法应共享相同状态 | 验证状态共享 | 调用同一闭包的多个方法 | 所有方法访问同一状态实例 | 模拟domainService函数，验证状态共享 |
| IT-CLSR-04 | 闭包应在extend后保持状态一致性 | 验证状态一致性 | 调用extend后再调用其他方法 | 其他方法使用更新后的状态 | 模拟domainService，验证状态更新传递 |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/framework/frameworkUsage.e2e.test.ts`

* **测试对象**: 从API创建到实际使用的完整流程 (`api/framework.ts` 及其与其他模块的集成)
* **测试重点**: 验证使用Framework的完整用户流程，最小化模拟

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| E2E-FRMW-01 | 用户应能创建领域编译器并编译DPML | 验证基本使用流程 | 有效配置和DPML内容 | 成功编译为领域对象 | 无模拟或最小模拟 |
| E2E-FRMW-02 | 用户应能扩展领域配置 | 验证配置扩展用例 | 已创建的编译器和扩展配置 | 配置被扩展，行为改变 | 无模拟或最小模拟 |
| E2E-FRMW-03 | 用户应能处理错误和警告 | 验证错误处理用例 | 无效DPML内容 | 根据errorHandling策略处理错误 | 无模拟或最小模拟 |
| E2E-FRMW-04 | 用户应能获取Schema和转换器 | 验证状态访问用例 | 已创建的编译器 | 返回当前Schema和转换器 | 无模拟或最小模拟 |
| E2E-FRMW-05 | 用户应能使用自定义转换器 | 验证自定义扩展用例 | 含自定义转换器的配置 | 成功使用自定义转换逻辑 | 无模拟或最小模拟 |

## 4. 测试夹具设计

为了支持上述测试用例，应创建以下测试夹具：

```typescript
// packages/core/src/__tests__/fixtures/framework/frameworkFixtures.ts

// 创建基本领域配置夹具
export function createDomainConfigFixture() {
  return {
    schema: {
      element: "model",
      attributes: [{ name: "id", required: true }],
      children: {
        elements: [
          { 
            element: "agent",
            attributes: [
              { name: "name", required: true },
              { name: "temperature", required: false },
              { name: "max-tokens", required: false }
            ]
          },
          {
            element: "prompt",
            attributes: [{ name: "type", enum: ["system", "user", "assistant"] }],
            content: { type: "text", required: true }
          }
        ]
      }
    },
    transformers: [
      {
        name: "modelTransformer",
        description: "Transforms model structure",
        type: "structural",
        transform: (result) => ({
          id: result.document.rootNode.attributes.get("id"),
          agent: {
            name: result.document.rootNode.children
              .find(child => child.tagName === "agent")?.attributes.get("name"),
            temperature: parseFloat(result.document.rootNode.children
              .find(child => child.tagName === "agent")?.attributes.get("temperature") || "0.7"),
            maxTokens: parseInt(result.document.rootNode.children
              .find(child => child.tagName === "agent")?.attributes.get("max-tokens") || "2048", 10)
          },
          prompts: result.document.rootNode.children
            .filter(child => child.tagName === "prompt")
            .map(prompt => ({
              type: prompt.attributes.get("type"),
              content: prompt.content
            }))
        })
      }
    ],
    options: {
      strictMode: true,
      errorHandling: "throw" as const,
      transformOptions: {
        resultMode: "merged" as const
      }
    }
  };
}

// 创建有效DPML内容夹具
export function createValidDPMLFixture() {
  return `
    <model id="test-model">
      <agent name="gpt-4" temperature="0.7" max-tokens="2048" />
      <prompt type="system">你是一个有用的助手</prompt>
      <prompt type="user">告诉我关于人工智能的信息</prompt>
    </model>
  `;
}

// 创建无效DPML内容夹具
export function createInvalidDPMLFixture() {
  return `
    <model>
      <agent temperature="0.7" />
      <unknown-tag>Invalid element</unknown-tag>
      <prompt>Missing type attribute</prompt>
    </model>
  `;
}

// 创建扩展配置夹具
export function createExtensionConfigFixture() {
  return {
    options: {
      strictMode: false,
      errorHandling: "warn" as const
    },
    transformers: [
      {
        name: "additionalTransformer",
        description: "Additional transformer",
        type: "custom",
        transform: (result) => ({
          summary: "This is a summary of the model"
        })
      }
    ]
  };
}

// 创建预期输出夹具
export function createExpectedOutputFixture() {
  return {
    id: "test-model",
    agent: {
      name: "gpt-4",
      temperature: 0.7,
      maxTokens: 2048
    },
    prompts: [
      {
        type: "system",
        content: "你是一个有用的助手"
      },
      {
        type: "user",
        content: "告诉我关于人工智能的信息"
      }
    ]
  };
}

// 创建领域状态夹具
export function createDomainStateFixture() {
  const config = createDomainConfigFixture();
  return {
    schema: config.schema,
    transformers: [...config.transformers],
    options: {
      strictMode: true,
      errorHandling: "throw",
      transformOptions: {
        resultMode: "merged"
      },
      custom: {}
    }
  };
}
```

## 5. 测试实现示例

```typescript
// packages/core/src/__tests__/unit/core/framework/domainService.test.ts
import { describe, test, expect, vi } from 'vitest';
import { initializeDomain, compileDPML, extendDomain } from '../../../../src/core/framework/domainService';
import { createDomainConfigFixture, createDomainStateFixture, createValidDPMLFixture } from '../../../fixtures/framework/frameworkFixtures';
import { parse } from '../../../../src/core/parsingService';
import { processDocument } from '../../../../src/core/processingService';
import { transform } from '../../../../src/core/transformerService';

// 模拟依赖
vi.mock('../../../../src/core/parsingService', () => ({
  parse: vi.fn()
}));
vi.mock('../../../../src/core/processingService', () => ({
  processDocument: vi.fn()
}));
vi.mock('../../../../src/core/transformerService', () => ({
  transform: vi.fn()
}));

describe('UT-DOMSVC', () => {
  test('initializeDomain应正确初始化领域状态', () => {
    // 准备
    const config = createDomainConfigFixture();
    
    // 执行
    const state = initializeDomain(config);
    
    // 断言
    expect(state.schema).toBe(config.schema);
    expect(state.transformers).toEqual(config.transformers);
    expect(state.options).toEqual(expect.objectContaining(config.options));
  });
  
  test('compileDPML应协调解析、处理和转换流程', async () => {
    // 准备
    const dpmlContent = createValidDPMLFixture();
    const state = createDomainStateFixture();
    const mockDocument = { rootNode: {} };
    const mockProcessingResult = { validation: { isValid: true } };
    const mockTransformResult = { id: 'test-model' };
    
    // 设置模拟返回值
    parse.mockResolvedValue(mockDocument);
    processDocument.mockReturnValue(mockProcessingResult);
    transform.mockReturnValue(mockTransformResult);
    
    // 执行
    const result = await compileDPML(dpmlContent, state);
    
    // 断言
    expect(parse).toHaveBeenCalledWith(dpmlContent);
    expect(processDocument).toHaveBeenCalledWith(mockDocument, state.schema);
    expect(transform).toHaveBeenCalledWith(
      mockProcessingResult, 
      state.transformers, 
      state.options.transformOptions
    );
    expect(result).toBe(mockTransformResult);
  });
  
  test('extendDomain应更新Schema', () => {
    // 准备
    const state = createDomainStateFixture();
    const originalSchema = state.schema;
    const newSchema = { element: "newRoot" };
    
    // 执行
    extendDomain(state, { schema: newSchema });
    
    // 断言
    expect(state.schema).toBe(newSchema);
    expect(state.schema).not.toBe(originalSchema);
  });
});

// packages/core/src/__tests__/integration/framework/compileWorkflow.integration.test.ts
import { describe, test, expect, vi } from 'vitest';
import { createDomainDPML } from '../../../../src/api/framework';
import { createDomainConfigFixture, createValidDPMLFixture } from '../../../fixtures/framework/frameworkFixtures';
import * as parsingService from '../../../../src/core/parsingService';
import * as processingService from '../../../../src/core/processingService';
import * as transformerService from '../../../../src/core/transformerService';

// 部分模拟核心服务
vi.spyOn(parsingService, 'parse');
vi.spyOn(processingService, 'processDocument');
vi.spyOn(transformerService, 'transform');

describe('IT-FRMW', () => {
  test('Framework应协调解析、处理和转换完成编译', async () => {
    // 准备
    const config = createDomainConfigFixture();
    const dpmlContent = createValidDPMLFixture();
    
    // 创建领域编译器
    const compiler = createDomainDPML(config);
    
    // 执行
    await compiler.compile(dpmlContent);
    
    // 断言
    expect(parsingService.parse).toHaveBeenCalledWith(dpmlContent);
    expect(processingService.processDocument).toHaveBeenCalled();
    expect(transformerService.transform).toHaveBeenCalled();
  });
});
```

## 6. 测试覆盖率目标

- **契约测试**: 覆盖所有公共API和Types，确保接口稳定性。
- **单元测试**: 覆盖domainService所有函数的核心逻辑，目标行覆盖率85%+。
- **集成测试**: 覆盖Framework的主要协调流程和闭包状态管理，目标行覆盖率80%+。
- **端到端测试**: 覆盖关键的用户使用场景。

## 7. 模拟策略

- **契约测试**: 主要进行类型检查，部分情况下需要模拟domainService返回符合契约的数据。
- **单元测试**:
  - 测试domainService时，模拟parse、processDocument和transform函数，隔离依赖。
  - 重点测试状态管理逻辑和错误处理。
- **集成测试**: 模拟核心模块的返回值，但验证真实调用流程和参数传递。
- **端到端测试**: 尽量减少模拟，使用真实组件验证完整流程。

## 8. 测试总结

本测试设计覆盖了Framework模块的所有核心组件和关键功能，遵循DPML架构测试策略规则，设计了不同类型的测试：

1. **契约测试**: 确保API和类型的稳定性和一致性
2. **单元测试**: 验证domainService各函数的独立功能
3. **集成测试**: 验证Framework对核心模块的协调能力和闭包状态管理
4. **端到端测试**: 验证完整用户工作流程

测试用例设计注重正向测试和反向测试的平衡，确保既测试正常功能路径，也测试错误处理机制。测试夹具设计提供了丰富的配置数据和DPML内容，便于测试的实施和维护。

通过全面的测试覆盖，确保Framework模块能够稳定、高效地创建和管理领域特定的DPML编译器，准确协调各核心模块完成编译流程，并提供类型安全的API接口。 