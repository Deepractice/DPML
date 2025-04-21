# 测试策略规则

本文档定义了DPML类库测试策略的强制规则。

> **重要说明**：本文档中的所有代码示例仅用于说明设计规则和原则，是概念性的举例而非实际实现要求。实际实现时应遵循规则的精神，而不必严格按照示例代码的具体实现细节。

## 1. 基本原则

1. **测试框架**：项目统一使用Vitest进行单元测试和集成测试
2. **工具依赖**：使用`@dpml/common/testing`提供的工具进行模拟和辅助测试
3. **测试覆盖率**：核心模块和公共API需达到至少80%的覆盖率
4. **测试隔离**：测试应该相互隔离，避免共享状态
5. **测试可读性**：测试应清晰表达其目的，遵循 Arrange-Act-Assert 模式

## 2. 分层测试策略

不同架构层次应采用不同的测试策略，针对其在架构中的职责进行有效测试：

| 架构层次 | 测试类型 | 测试重点 | 测试工具 |
|---------|---------|---------|---------|
| **API层和Types层** | 契约测试、端到端测试 | 接口稳定性、类型定义、完整功能路径 | Vitest、TypeScript |
| **模块服务层** | 集成测试、单元测试 | 业务逻辑、用例级功能、错误处理、组件协作 | Vitest、模拟 |
| **执行组件和状态管理组件** | 单元测试 | 业务逻辑、边界条件 | Vitest、模拟 |

## 3. 测试侧重点

### 3.1 需要单元测试的组件

1. **模块服务单元测试规则**: **模块服务层**的业务逻辑函数必须进行单元测试
2. **执行组件单元测试规则**: **执行组件**(如Parser)的具体实现必须进行单元测试
3. **状态管理组件单元测试规则**: **状态管理组件**的核心方法必须进行单元测试
4. **创建组件单元测试规则**: **创建组件**的创建逻辑必须进行单元测试

### 3.2 可以不做单元测试的组件

1. **API函数测试例外规则**: **API层函数**(因为只是薄层委托)可以不做单元测试
2. **简单工具函数测试例外规则**: 简单的工具函数可以不做单元测试
3. **纯类型测试例外规则**: 纯数据类型定义可以不做单元测试

## 4. 测试组织

> **注意**：有关测试目录结构、命名规范和文件组织的详细规则，请参考[测试用例设计规则](./test-case-design.md)文档的第1章节"测试目录结构规则"。

## 5. 测试实践规则

### 5.1 契约测试规则

1. **API契约测试规则**: 必须进行契约测试，确保API签名和类型定义不会意外变更
2. **类型兼容性测试规则**: 确保类型系统检测到潜在的破坏性变更

```typescript
// API层契约测试示例
describe('API契约测试', () => {
  it('parse函数应保持签名稳定', () => {
    // 验证函数存在且签名正确
    expect(typeof parse).toBe('function');
    // 调用函数验证基本行为
    const result = parse('<tag>content</tag>');
    expect(result).toHaveProperty('rootNode');
  });
});
```

### 5.2 端到端测试规则

1. **流程完整性规则**: 端到端测试必须验证从API调用到最终结果的完整流程
2. **关键路径规则**: 必须覆盖所有关键业务路径
3. **边界条件规则**: 必须测试关键边界条件和异常处理

### 5.3 集成测试规则

1. **模块服务集成测试规则**: 必须测试模块服务层的用例级功能，包括错误处理
2. **组件协作规则**: 必须测试多个组件协作场景
3. **跨模块功能规则**: 必须测试跨模块功能整合

```typescript
// 模块服务层集成测试示例
describe('IT-Parsing-Service', () => {
  it('应正确解析并验证文档', () => {
    const result = parseWithValidation('<tag>content</tag>');
    expect(result.valid).toBe(true);
    expect(result.document.rootNode.tagName).toBe('tag');
  });
  
  it('应统一处理解析错误', () => {
    expect(() => parseWithValidation('<<<')).toThrow(ParserError);
  });
});
```

### 5.4 单元测试规则

1. **隔离性规则**: 必须隔离测试模块服务和执行组件的核心逻辑
2. **依赖模拟规则**: 必须模拟外部依赖，确保真正的单元测试
3. **边界条件规则**: 必须覆盖边界条件和异常场景

```typescript
// 模块服务层单元测试示例
describe('UT-Parsing-Service', () => {
  it('findNodeById应返回正确节点', () => {
    const doc = createTestDocument();
    const node = findNodeById(doc, 'test-id');
    expect(node?.tagName).toBe('expected-tag');
  });
});
```

## 6. 契约测试策略规则

### 6.1 契约测试定义与目的

1. **契约测试基本定义规则**: 契约测试是验证组件间接口约定的测试，确保不同组件可以按预期互操作
2. **契约测试目标规则**: 契约测试的主要目标是验证接口稳定性、类型定义准确性、行为一致性和版本兼容性
3. **契约破坏预防规则**: 契约测试必须在CI流程中优先执行，防止意外的接口破坏合并到代码库

### 6.2 契约测试覆盖范围

1. **契约测试范围限定规则**: DPML项目的契约测试**仅针对API层和Types层**进行，不要求对内部实现层进行契约测试。

2. **API层契约测试规则**: 必须对所有公开API进行契约测试，确保:
   - 函数存在性和类型签名一致性
   - 返回值类型正确性
   - 异常处理与文档一致性
   - 向后兼容性维护

3. **Types层契约测试规则**: 必须对所有公开类型定义进行契约测试，确保:
   - 类型定义稳定性和一致性
   - 类型属性和结构符合文档
   - 类型兼容性遵循预期
   - 类型变更受到严格控制

### 6.3 契约测试实施策略

1. **API稳定性契约测试规则**: 公共API的契约测试必须验证以下内容:

```typescript
// API稳定性契约测试示例
describe('CT-Parser-API', () => {
  test('parse函数应符合公开的契约', () => {
    // 1. 验证函数签名
    expect(typeof parse).toBe('function');
    
    // 2. 验证参数类型(通过TypeScript编译时检查)
    
    // 3. 验证返回值结构
    const result = parse('<root></root>');
    expect(result).toHaveProperty('rootNode');
    expect(result.rootNode).toHaveProperty('tagName');
    expect(result.rootNode).toHaveProperty('children');
    
    // 4. 验证错误处理约定
    expect(() => parse('<<<')).toThrow();
  });
});
```

2. **Types层契约测试规则**: 类型定义的契约测试必须验证以下内容:

```typescript
// Types层契约测试示例
describe('CT-DPMLNode-Type', () => {
  test('DPMLNode类型应符合公开的契约定义', () => {
    // 1. 创建符合类型的对象(编译时检查)
    const node: DPMLNode = {
      tagName: 'div',
      attributes: new Map([['id', 'test']]),
      children: [],
      content: '',
      parent: null
    };
    
    // 2. 验证类型结构(运行时检查)
    expect(node).toHaveProperty('tagName');
    expect(node).toHaveProperty('attributes');
    expect(node).toHaveProperty('children');
    expect(node).toHaveProperty('content');
    expect(node).toHaveProperty('parent');
    
    // 3. 验证类型兼容性
    const nodeWithLocation: DPMLNode = {
      ...node,
      sourceLocation: { 
        startLine: 1, 
        startColumn: 1, 
        endLine: 2, 
        endColumn: 10 
      }
    };
    expect(nodeWithLocation.sourceLocation).toBeDefined();
  });
});
```

### 6.4 契约变更管理

1. **契约版本化规则**: 所有公共契约必须明确版本化，并记录变更历史
2. **变更通知规则**: 契约变更必须明确通知所有相关利益方，包括内部团队和外部用户
3. **破坏性变更规则**: 破坏性变更必须遵循以下流程:
   - 预先公告变更计划
   - 提供迁移路径和指南
   - 引入临时兼容性层
   - 执行全面的契约测试验证

4. **契约弃用规则**: 弃用契约元素的流程:
   - 标记为弃用并提供替代方案
   - 保持一段过渡期(至少一个主要版本周期)
   - 在新版本中完全移除

### 6.5 契约测试组织与命名

1. **契约测试文件组织规则**: 契约测试必须放在专门的`contract`目录下，按如下结构组织:
   - `contract/api/` - API层契约测试
   - `contract/types/` - Types层契约测试

2. **契约测试命名规则**: 契约测试文件必须使用`.contract.test.ts`后缀，如：
   - `parser.contract.test.ts` - Parser API的契约测试
   - `DPMLNode.contract.test.ts` - DPMLNode类型的契约测试

3. **契约测试ID规则**: 契约测试用例ID必须使用以下格式:
   - API测试: `CT-API-[API名称]-[序号]`，如 `CT-API-Parser-01`
   - 类型测试: `CT-Type-[类型名称]-[序号]`，如 `CT-Type-DPMLNode-01`

4. **描述性测试名称规则**: 契约测试名称必须明确描述被测试的API或类型以及验证的具体方面

## 7. 模拟规范

### 7.1 模拟策略

1. **最小化模拟**：只模拟测试直接依赖的外部系统和模块
2. **明确边界**：在测试中明确指出哪些是被模拟的部分
3. **模拟真实行为**：模拟应尽可能准确地反映真实行为

### 7.2 使用模拟工具

```typescript
import { createMockFunction } from '@dpml/common/testing';

// 模拟函数
const mockCallback = createMockFunction();
moduleUnderTest.doSomethingWithCallback(mockCallback);

// 验证调用
expect(mockCallback.mock.calls.length).toBe(1);
expect(mockCallback.mock.calls[0][0]).toBe('expected arg');

// 模拟文件系统
import { fileSystemMock } from '@dpml/common/testing';

const mockFs = fileSystemMock.createMockFileSystem({
  '/config.json': '{"setting": "value"}',
});

// 使用模拟文件系统测试
const result = await moduleUnderTest.readConfig('/config.json', mockFs);
expect(result).toEqual({ setting: 'value' });
```

### 7.3 依赖注入

优先使用依赖注入使代码可测试：

```typescript
// 推荐
class Parser {
  constructor(private fileSystem) {}
  
  async parse(filePath) {
    const content = await this.fileSystem.readFile(filePath);
    // ...
  }
}

// 测试时
const mockFs = fileSystemMock.createMockFileSystem({/*...*/});
const parser = new Parser(mockFs);
```

## 8. 异步测试规范

### 8.1 处理Promise

使用`async/await`语法，避免Promise链：

```typescript
// 推荐
test('should complete async operation successfully', async () => {
  const result = await moduleUnderTest.asyncOperation();
  expect(result).toBe(expected);
});

// 避免
test('should complete async operation successfully', () => {
  return moduleUnderTest.asyncOperation()
    .then(result => {
      expect(result).toBe(expected);
    });
});
```

### 8.2 超时和重试

使用测试工具处理不稳定测试：

```typescript
import { asyncUtils } from '@dpml/common/testing';

test('should eventually satisfy condition', async () => {
  // 等待条件满足，最多5秒
  await asyncUtils.waitUntil(() => condition === true, { timeout: 5000 });
  
  // 或使用重试
  const result = await asyncUtils.retryOperation(
    async () => moduleUnderTest.unreliableOperation(),
    { maxAttempts: 3, delay: 100 }
  );
  
  expect(result).toBeTruthy();
});
```

## 9. 测试夹具规则

### 9.1 夹具设计原则

1. **局部性原则**：测试夹具应该在包内部定义和使用，避免跨包依赖
2. **简单性原则**：保持夹具设计简单，只包含测试所需的最小数据集
3. **独立性原则**：夹具应该是独立的，不应依赖于其他夹具

### 9.2 推荐的夹具实现方式

```typescript
// tests/fixtures/user-fixture.ts
export interface UserFixture {
  validUser: {
    id: number;
    name: string;
    email: string;
  };
  invalidUser: {
    id: number;
    // 缺少必要字段
  };
}

export function createUserFixture(): UserFixture {
  return {
    validUser: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    },
    invalidUser: {
      id: 2
      // 缺少name和email字段
    }
  };
}

// 使用示例
// tests/unit/user/validator.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { createUserFixture } from '../../fixtures/user-fixture';
import { validateUser } from '../../../src/user/validator';

describe('UT-User-Validator', () => {
  let fixture: ReturnType<typeof createUserFixture>;
  
  beforeEach(() => {
    fixture = createUserFixture();
  });
  
  test('should validate user successfully', () => {
    const result = validateUser(fixture.validUser);
    expect(result.valid).toBe(true);
  });
});
```

## 10. 断言最佳实践

### 10.1 精确断言

断言应该精确，避免过于宽松或过于严格：

```typescript
// 推荐 - 精确断言
expect(result.name).toBe('Expected Name');
expect(result.items).toHaveLength(3);

// 避免 - 过于宽松
expect(result).toBeTruthy();

// 避免 - 不必要的严格
expect(result).toEqual({
  id: 1,
  name: 'Expected Name',
  items: [
    { id: 1, value: 'a' },
    { id: 2, value: 'b' },
    { id: 3, value: 'c' }
  ],
  createdAt: expect.any(Date)
});
```

### 10.2 测试异常

清晰地测试异常情况：

```typescript
// 方法1：使用toThrow
test('should throw ValidationError when input is invalid', () => {
  expect(() => moduleUnderTest.validate(invalidInput))
    .toThrow('ValidationError');
});

// 方法2：使用try/catch
test('should throw ValidationError when input is invalid', async () => {
  try {
    await moduleUnderTest.validateAsync(invalidInput);
    // 如果没有抛出错误，测试应该失败
    expect.fail('Expected to throw ValidationError');
  } catch (error) {
    expect(error.name).toBe('ValidationError');
    expect(error.message).toContain('Invalid input');
  }
});
```

## 11. 测试覆盖率要求

| 组件类型 | 行覆盖率要求 | 分支覆盖率要求 |
|---------|------------|-------------|
| 核心模块服务 | 90% | 85% |
| 执行组件 | 85% | 80% |
| 状态管理组件 | 85% | 80% |
| 创建组件 | 80% | 75% |
| API层 | 90% | 85% |

### 11.1 排除特定文件

在`vitest.config.ts`中配置:

```typescript
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/*.d.ts',
        '**/index.ts',
        '**/types.ts',
        '**/__tests__/**',
        '**/mocks/**'
      ]
    }
  }
});
```

## 12. 测试工具和框架规则

1. **测试框架规则**: 必须使用**Vitest**作为测试框架
2. **模拟工具规则**: 使用Vitest内置的模拟功能，避免引入其他模拟库
3. **断言库规则**: 使用Vitest提供的断言API
4. **配置一致性规则**: 项目中的Vitest配置应保持一致，便于开发者理解和扩展

## 13. 组件测试策略表

各组件类型的测试策略应符合以下规则：

| 组件类型 | 主要测试方法 | 测试重点 | 测试示例 |
|---------|------------|----------|---------|
| API层 | 集成测试+契约测试 | 接口稳定性、行为正确性 | 验证API签名和基本功能 |
| 模块服务层 | 单元测试+集成测试 | 业务逻辑正确性，跨模块功能组合 | 测试各种业务场景和边界条件，测试跨模块协作 |
| 执行组件 | 单元测试 | 功能实现正确性 | 隔离测试每个方法行为 |
| 状态管理组件 | 单元测试+状态测试 | 状态管理正确性 | 测试状态变化和并发行为 |

## 14. CI集成

在CI流程中运行测试并验证覆盖率：

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Check Coverage
        run: |
          if [[ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') < 80 ]]; then
            echo "Line coverage below 80%"
            exit 1
          fi
```

## 15. 测试不足的处理规则

1. **优先级规则**: 如果测试资源有限，应优先测试核心业务逻辑和高风险组件
2. **技术债务记录规则**: 对于测试覆盖不足的区域，应明确记录为技术债务
3. **渐进式改进规则**: 随着项目发展，逐步增加测试覆盖范围

## 16. 最佳实践总结

1. **测试公共API**: 优先测试模块的公共API而非内部实现
2. **单一职责**: 每个测试只测试一个行为或功能
3. **避免条件逻辑**: 测试中应避免使用条件逻辑
4. **避免测试私有方法**: 通过公共API间接测试私有方法
5. **测试边界条件**: 包括空值、边界值和异常路径
6. **测试错误处理**: 确保错误被正确捕获和处理
7. **避免直接修改全局状态**: 使用测试环境隔离全局状态
8. **快速测试**: 单元测试应该执行迅速，减少不必要的等待 