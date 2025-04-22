# DPML Processing 模块测试用例设计

本文档遵循 [测试用例设计规则](../../../../rules/architecture/test-case-design.md) 和 [测试策略规则](../../../../rules/architecture/testing-strategy.md) 设计 DPML Processing 模块的测试用例。

## 1. 测试范围

本测试计划覆盖 Processing 模块的核心功能，包括：
- API 层和 Types 层的契约稳定性。
- DocumentValidator 执行组件的验证逻辑。
- ProcessingService 模块服务层的集成和协调能力。
- 从 API 调用到返回结果的完整端到端流程。

## 2. 测试类型与目标

- **契约测试**: 确保 API 和类型定义的稳定性，防止意外的破坏性变更。
- **单元测试**: 隔离验证 DocumentValidator 的核心验证逻辑，特别是基于 Schema 进行递归验证和错误收集的部分。
- **集成测试**: 验证 ProcessingService 如何协调验证器和引用映射构建，并正确返回处理结果。
- **端到端测试**: 验证从用户调用 API 到获得最终结果的完整工作流程。

## 3. 测试用例详情

### 3.1 契约测试 (Contract Tests)

#### 文件: `packages/core/src/__tests__/contract/api/processing.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-API-PROC-01 | `processDocument` API 应维持类型签名 | 验证 API 契约稳定性 | 类型检查 | 符合公开文档的函数签名 | 无需模拟 |
| CT-API-PROC-02 | `processDocument` API 应返回符合 ProcessingResult 接口的结果 | 验证返回类型契约 | 有效的 DPMLDocument 和 ProcessedSchema | 返回符合 ProcessingResult 接口的对象 | 模拟 ProcessingService.processDocument 返回符合契约的数据 |
| CT-API-PROC-03 | `processDocument` API 应支持自定义结果类型 | 验证泛型契约 | 类型参数扩展 | 支持扩展基础 ProcessingResult | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/ProcessingResult.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-PRES-01 | ProcessingResult 接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 类型定义符合文档规范 | 无需模拟 |
| CT-TYPE-PRES-02 | ProcessingResult 接口应支持扩展 | 验证类型扩展性 | 扩展 ProcessingResult 的自定义接口 | 成功编译并保持类型安全 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/ValidationResult.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-VRES-01 | ValidationResult 接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 类型定义符合文档规范 | 无需模拟 |
| CT-TYPE-VRES-02 | ValidationResult 应包含 ReadonlyArray 错误和警告 | 验证不可变集合类型 | 类型检查 | errors 和 warnings 属性为 ReadonlyArray 类型 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/contract/types/ReferenceMap.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| CT-TYPE-REFMAP-01 | ReferenceMap 接口应维持结构稳定性 | 验证类型结构契约 | 类型检查 | 类型定义符合文档规范 | 无需模拟 |
| CT-TYPE-REFMAP-02 | ReferenceMap.idMap 应为 ReadonlyMap 类型 | 验证不可变映射类型 | 类型检查 | idMap 属性为 ReadonlyMap 类型 | 无需模拟 |

### 3.2 单元测试 (Unit Tests)

#### 文件: `packages/core/src/__tests__/unit/core/processing/DocumentValidator.test.ts`

* **测试对象**: DocumentValidator 执行组件 (`core/processing/DocumentValidator.ts`)
* **主要方法**: `validateDocument`, `validateNode`, `validateAttributes`, `validateChildren`, `validateContent`
* **测试重点**: 验证文档节点是否符合 Schema 规则，并收集验证错误。

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| **正向测试** |
| UT-DOCVAL-01 | validateDocument 应验证符合 Schema 的文档 | 验证基本验证功能 | 符合 Schema 的简单文档 | 返回 isValid 为 true 的结果 | 无需模拟 |
| UT-DOCVAL-02 | validateDocument 应验证复杂嵌套结构 | 验证复杂结构处理 | 嵌套多层的文档结构 | 返回 isValid 为 true 的结果 | 无需模拟 |
| UT-DOCVAL-03 | validateNode 应正确验证单个节点 | 验证节点验证功能 | 单个节点和对应 Schema | 返回有效的验证结果 | 无需模拟 |
| UT-DOCVAL-04 | validateAttributes 应验证有效属性 | 验证属性验证功能 | 带属性的节点和对应 Schema | 返回有效的属性验证结果 | 无需模拟 |
| UT-DOCVAL-05 | validateChildren 应验证有效子元素结构 | 验证子元素验证功能 | 带子元素的节点和对应 Schema | 返回有效的子元素验证结果 | 无需模拟 |
| UT-DOCVAL-06 | validateContent 应验证有效内容 | 验证内容验证功能 | 带内容的节点和对应 Schema | 返回有效的内容验证结果 | 无需模拟 |
| **反向测试** |
| UT-DOCVAL-NEG-01 | validateDocument 应检测未知元素 | 验证未知元素检测 | 包含未定义元素的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| UT-DOCVAL-NEG-02 | validateDocument 应检测无效属性 | 验证无效属性检测 | 包含无效属性的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| UT-DOCVAL-NEG-03 | validateDocument 应检测无效子元素 | 验证无效子元素检测 | 包含无效子元素的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| UT-DOCVAL-NEG-04 | validateDocument 应检测无效内容 | 验证无效内容检测 | 包含无效内容的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| UT-DOCVAL-NEG-05 | validateDocument 应检测缺少必需属性 | 验证必需属性检测 | 缺少必需属性的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| UT-DOCVAL-NEG-06 | validateDocument 应检测缺少必需子元素 | 验证必需子元素检测 | 缺少必需子元素的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| UT-DOCVAL-NEG-07 | validateDocument 应检测缺少必需内容 | 验证必需内容检测 | 缺少必需内容的文档 | 返回 isValid 为 false 和对应错误 | 无需模拟 |
| **错误收集** |
| UT-DOCVAL-ERR-01 | validateDocument 应收集单个错误 | 验证单错误收集 | 包含单个错误的文档 | 返回包含精确一个错误的结果 | 无需模拟 |
| UT-DOCVAL-ERR-02 | validateDocument 应收集多个错误 | 验证多错误收集 | 包含多个错误的文档 | 返回包含所有发现错误的结果 | 无需模拟 |
| UT-DOCVAL-ERR-03 | validateDocument 应为错误提供准确位置 | 验证错误位置信息 | 包含错误的文档 | 错误包含精确的源位置和路径 | 无需模拟 |
| UT-DOCVAL-ERR-04 | validateDocument 应区分错误和警告 | 验证错误分级 | 包含错误和警告的文档 | 错误和警告正确分离到对应数组 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/processing/ValidatorFactory.test.ts`

* **测试对象**: ValidatorFactory 创建组件 (`core/processing/ValidatorFactory.ts`)
* **主要方法**: `createValidator`
* **测试重点**: 验证工厂能正确创建验证器实例。

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| UT-VALFAC-01 | createValidator 应创建验证器实例 | 验证基本创建功能 | 无参数或默认选项 | 返回可用的 DocumentValidator 实例 | 无需模拟 |
| UT-VALFAC-02 | createValidator 应接受验证选项 | 验证选项配置 | 自定义 ValidatorOptions | 返回配置了这些选项的实例 | 无需模拟 |

#### 文件: `packages/core/src/__tests__/unit/core/processing/ProcessingService.test.ts`

* **测试对象**: ProcessingService 模块服务 (`core/processing/ProcessingService.ts`)
* **主要方法**: `processDocument`, `buildIdMap`
* **测试重点**: 验证处理服务如何协调验证器和引用映射构建。

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| UT-PROCSRV-01 | processDocument 应返回正确结构的结果 | 验证结果对象结构 | DPMLDocument 和 ProcessedSchema | 返回包含预期结构的 ProcessingResult | 模拟 ValidatorFactory 和 DocumentValidator |
| UT-PROCSRV-02 | processDocument 应正确构建ID引用映射 | 验证ID映射构建 | 包含ID属性的文档 | 结果包含正确的ID映射 | 模拟 ValidatorFactory 和 DocumentValidator |
| UT-PROCSRV-03 | processDocument 应支持自定义结果类型 | 验证泛型支持 | 带泛型参数的调用 | 返回符合自定义类型的结果 | 模拟 ValidatorFactory 和 DocumentValidator |
| UT-PROCSRV-04 | buildIdMap 应正确构建ID到节点的映射 | 验证映射构建逻辑 | 包含ID的节点树 | 返回ID到节点的正确映射 | 无需模拟 |
| UT-PROCSRV-05 | buildIdMap 应处理重复ID | 验证重复ID处理 | 包含重复ID的节点树 | 保留最后出现的节点映射 | 无需模拟 |
| UT-PROCSRV-06 | buildIdMap 应忽略无ID节点 | 验证无ID节点处理 | 混合有ID和无ID的节点树 | 只映射有ID的节点 | 无需模拟 |

### 3.3 集成测试 (Integration Tests)

#### 文件: `packages/core/src/__tests__/integration/processing/processingFlow.integration.test.ts`

* **测试对象**: ProcessingService 与 DocumentValidator 的集成 (`core/processing/ProcessingService.ts` 和 `core/processing/DocumentValidator.ts`)
* **测试重点**: 验证处理流程的完整协作，从文档验证到结果生成。

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| IT-PROC-01 | 处理服务应协调验证器处理有效文档 | 验证有效文档处理流程 | 有效的 DPMLDocument 和 ProcessedSchema | 返回包含 isValid: true 的处理结果 | 无需模拟 |
| IT-PROC-02 | 处理服务应协调验证器处理无效文档 | 验证无效文档处理流程 | 无效的 DPMLDocument 和 ProcessedSchema | 返回包含 isValid: false 和错误的处理结果 | 无需模拟 |
| IT-PROC-03 | 处理服务应处理复杂文档结构 | 验证复杂结构处理 | 复杂嵌套的 DPMLDocument | 返回包含正确验证结果的处理结果 | 无需模拟 |
| IT-PROC-04 | 处理服务应正确构建引用映射 | 验证引用映射构建 | 包含多个ID引用的文档 | 返回包含正确引用映射的处理结果 | 无需模拟 |

### 3.4 端到端测试 (End-to-End Tests)

#### 文件: `packages/core/src/__tests__/e2e/processing/documentProcessing.e2e.test.ts`

* **测试对象**: 从 API 调用到获得最终结果的完整处理流程。
* **测试重点**: 验证整个处理链路的功能正确性，覆盖 API 层 -> 服务层 -> 验证器 -> 返回结果。

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|:---|:------------|:---------|:---------|:---------|:---------|
| E2E-PROC-01 | 完整处理流程应验证符合Schema的文档 | 验证有效文档端到端流程 | 符合 Schema 的 DPMLDocument | 返回 isValid 为 true 的 ProcessingResult | 无需模拟 |
| E2E-PROC-02 | 完整处理流程应检测不符合Schema的文档 | 验证无效文档端到端流程 | 不符合 Schema 的 DPMLDocument | 返回包含错误的 ProcessingResult | 无需模拟 |
| E2E-PROC-03 | 完整处理流程应支持引用查找 | 验证引用功能端到端流程 | 包含ID引用的 DPMLDocument | 返回包含可用引用映射的 ProcessingResult | 无需模拟 |
| E2E-PROC-04 | 完整处理流程应支持自定义结果类型 | 验证自定义扩展端到端流程 | DPMLDocument 和自定义结果类型参数 | 返回符合扩展类型的 ProcessingResult | 无需模拟 |

## 4. 测试夹具设计

为了支持上述测试用例，应创建以下测试夹具：

```typescript
// packages/core/__tests__/fixtures/processing/documentFixtures.ts

// 创建基本有效文档和对应Schema
export function createValidDocumentFixture() {
  return {
    document: {
      rootNode: {
        tagName: 'button',
        attributes: new Map([['type', 'submit']]),
        children: [],
        content: '提交',
        parent: null
      }
    },
    schema: {
      isValid: true,
      schema: {
        element: 'button',
        attributes: [
          { name: 'type', enum: ['submit', 'reset', 'button'] }
        ],
        content: { type: 'text', required: true }
      }
    }
  };
}

// 创建无效文档和对应Schema
export function createInvalidDocumentFixture() {
  return {
    document: {
      rootNode: {
        tagName: 'button',
        attributes: new Map([['color', 'red']]), // 未定义的属性
        children: [],
        content: '',  // 缺少必需内容
        parent: null
      }
    },
    schema: {
      isValid: true,
      schema: {
        element: 'button',
        attributes: [
          { name: 'type', enum: ['submit', 'reset', 'button'] }
        ],
        content: { type: 'text', required: true }
      }
    }
  };
}

// 创建带ID引用的文档
export function createDocumentWithIdsFixture() {
  return {
    document: {
      rootNode: {
        tagName: 'form',
        attributes: new Map([['id', 'login-form']]),
        children: [
          {
            tagName: 'input',
            attributes: new Map([
              ['id', 'username'],
              ['type', 'text']
            ]),
            children: [],
            content: '',
            parent: null // 在实际测试中需要设置为父节点
          },
          {
            tagName: 'button',
            attributes: new Map([
              ['id', 'submit-btn'],
              ['type', 'submit']
            ]),
            children: [],
            content: '登录',
            parent: null // 在实际测试中需要设置为父节点
          }
        ],
        content: '',
        parent: null
      }
    },
    schema: {
      isValid: true,
      schema: {
        // 对应的Schema定义...
      }
    }
  };
}

// 创建复杂嵌套文档
export function createComplexDocumentFixture() {
  // 创建一个复杂嵌套结构...
}
```

## 5. 测试实现示例

```typescript
// packages/core/__tests__/unit/core/processing/DocumentValidator.test.ts
import { describe, test, expect } from 'vitest';
import { DocumentValidator } from '../../../../src/core/processing/DocumentValidator';
import { createValidDocumentFixture, createInvalidDocumentFixture } from '../../../fixtures/processing/documentFixtures';

describe('UT-DOCVAL', () => {
  test('validateDocument 应验证符合 Schema 的文档', () => {
    // 准备
    const fixture = createValidDocumentFixture();
    const validator = new DocumentValidator();
    
    // 执行
    const result = validator.validateDocument(fixture.document, fixture.schema);
    
    // 断言
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('validateDocument 应检测无效属性', () => {
    // 准备
    const fixture = createInvalidDocumentFixture();
    const validator = new DocumentValidator();
    
    // 执行
    const result = validator.validateDocument(fixture.document, fixture.schema);
    
    // 断言
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toContain('INVALID_ATTRIBUTE');
  });
});
```

## 6. 测试覆盖率目标

- **契约测试**: 覆盖所有公共 API 和暴露的类型，确保接口稳定性。
- **单元测试**: 覆盖 DocumentValidator 的核心验证逻辑和 ProcessingService 的功能，目标行覆盖率 85%+。
- **集成测试**: 覆盖处理流程的主要协作路径，目标行覆盖率 80%+。
- **端到端测试**: 覆盖用户常见的文档处理场景。

## 7. 模拟策略

- **单元测试**:
  - 测试 DocumentValidator 时不需要模拟，直接测试验证逻辑。
  - 测试 ProcessingService 时需要模拟 ValidatorFactory 和 DocumentValidator，隔离单元测试。
- **集成测试**: 不模拟内部组件，使用真实实现测试组件协作。
- **端到端测试**: 完全不模拟，使用真实组件验证完整流程。

## 8. 测试总结

本测试用例设计覆盖了 Processing 模块的所有关键组件和功能点，按照 DPML 架构测试策略规则设计了各种类型的测试：

1. **契约测试**: 确保 API 和类型的稳定性
2. **单元测试**: 验证各组件的独立功能
3. **集成测试**: 验证组件间协作
4. **端到端测试**: 验证完整用户流程

测试用例设计注重正面测试和反面测试的平衡，确保既测试正常功能路径，也测试错误处理机制。 