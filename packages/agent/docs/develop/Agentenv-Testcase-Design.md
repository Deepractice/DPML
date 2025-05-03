# DPML Agent环境变量处理模块测试用例设计

## 1. 测试范围分析

基于对Agentenv-Design.md文档的分析，本测试用例设计文档针对agentenv模块定义全面的测试策略和具体测试用例。agentenv模块作为DPML Agent的组件，主要职责是处理配置中的环境变量引用，提供一种安全、统一的方式替换`@agentenv:ENV_NAME`格式的引用。

### 1.1 模块架构概览

agentenv模块遵循DPML项目的分层架构：
- **API层**：提供`replaceEnvVars<T>`函数作为统一入口点
- **Core层**：实现环境变量替换的核心逻辑
- **常量定义**：环境变量模式和前缀定义

### 1.2 核心功能组件

测试需覆盖以下核心功能组件：
- **环境变量替换功能**：在不同数据类型中识别和替换环境变量引用
- **类型处理**：正确处理字符串、数组、对象和其他类型的值
- **嵌套结构处理**：处理复杂嵌套数据结构中的环境变量引用
- **缺失环境变量处理**：正确处理引用了不存在环境变量的情况
- **特殊情况处理**：null、undefined和非标准数据类型的处理

## 2. 测试类型规划

根据DPML测试策略规则，为agentenv模块设计以下类型的测试：

| 测试类型 | 目录 | 测试重点 | 文件命名模式 |
|--------|------|---------|------------|
| 契约测试 | `/packages/agent/__tests__/contract/` | API稳定性 | `*.contract.test.ts` |
| 单元测试 | `/packages/agent/__tests__/unit/` | 组件内部逻辑 | `*.test.ts` |
| 集成测试 | `/packages/agent/__tests__/integration/` | 组件间协作 | `*.integration.test.ts` |
| 端到端测试 | `/packages/agent/__tests__/e2e/` | 完整功能流程 | `*.e2e.test.ts` |

## 3. 测试用例设计

### 3.1 契约测试用例

契约测试确保API层的稳定性和一致性，是项目测试策略的第一优先级。

#### 3.1.1 API契约测试

**文件路径**: `/packages/agent/__tests__/contract/api/agentenv.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-API-Env-01 | replaceEnvVars函数应符合公开契约 | 验证replaceEnvVars函数存在并遵循类型签名 | 无 | 函数存在且类型为function | 无需模拟 |
| CT-API-Env-02 | replaceEnvVars函数应接受泛型参数并返回相同类型 | 验证函数参数和返回类型符合契约 | 字符串、数组、对象等 | 返回与输入相同类型的值 | 模拟Core层 |
| CT-API-Env-03 | replaceEnvVars函数应将API调用委托给Core层 | 验证API层与Core层的委托关系 | 任意输入值 | 调用agentenvCore.replaceEnvVars | 模拟Core层 |

#### 3.1.2 类型契约测试

**文件路径**: `/packages/agent/__tests__/contract/types/agentenvConstants.contract.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-Type-Env-01 | ENV_VAR_PATTERN常量应符合预期模式 | 验证环境变量正则模式的定义 | 无 | 常量存在且为正则表达式类型 | 无需模拟 |
| CT-Type-Env-02 | ENV_VAR_PREFIX常量应符合预期值 | 验证环境变量前缀的定义 | 无 | 常量等于'@agentenv:' | 无需模拟 |

### 3.2 单元测试用例

单元测试验证各个组件的独立功能，确保其内部逻辑正确。

#### 3.2.1 Core层replaceEnvVars函数单元测试

**文件路径**: `/packages/agent/__tests__/unit/core/agentenv/agentenvCore.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-Env-Core-01 | replaceEnvVars应处理null/undefined | 验证空值处理逻辑 | null, undefined | 直接返回输入值 | 无需模拟 |
| UT-Env-Core-02 | replaceEnvVars应处理基本字符串 | 验证字符串处理逻辑 | 普通字符串 | 原样返回没有变量引用的字符串 | 无需模拟 |
| UT-Env-Core-03 | replaceEnvVars应替换字符串中的环境变量引用 | 验证环境变量替换逻辑 | '@agentenv:TEST_VAR' | 替换为环境变量值 | 模拟process.env |
| UT-Env-Core-04 | replaceEnvVars应替换字符串中的多个环境变量引用 | 验证多变量替换 | 含多个变量引用的字符串 | 所有引用被替换 | 模拟process.env |
| UT-Env-Core-05 | replaceEnvVars应处理不存在的环境变量 | 验证缺失环境变量处理 | 引用不存在变量的字符串 | 保留原始引用，输出警告 | 模拟console.warn |
| UT-Env-Core-06 | replaceEnvVars应处理数组 | 验证数组处理逻辑 | 含环境变量引用的数组 | 数组中的所有引用被替换 | 模拟process.env |
| UT-Env-Core-07 | replaceEnvVars应处理简单对象 | 验证对象处理逻辑 | 含环境变量引用的对象 | 对象中的所有引用被替换 | 模拟process.env |
| UT-Env-Core-08 | replaceEnvVars应处理嵌套对象 | 验证嵌套结构处理 | 含多层嵌套的对象 | 所有层级的引用被替换 | 模拟process.env |
| UT-Env-Core-09 | replaceEnvVars应处理混合数据结构 | 验证复杂结构处理 | 对象内含数组与嵌套对象 | 所有引用被正确替换 | 模拟process.env |
| UT-Env-Core-10 | replaceEnvVars应正确处理非对象非数组非字符串类型 | 验证其他类型处理 | 数字、布尔值等 | 原样返回 | 无需模拟 |

#### 3.2.2 Core层replaceInString函数单元测试

**文件路径**: `/packages/agent/__tests__/unit/core/agentenv/replaceInString.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-Env-Str-01 | replaceInString应替换单个环境变量引用 | 验证基本替换功能 | '@agentenv:TEST_VAR' | 替换为环境变量值 | 模拟process.env |
| UT-Env-Str-02 | replaceInString应替换字符串中的多个环境变量引用 | 验证多变量替换 | 含多个变量引用的字符串 | 所有引用被替换 | 模拟process.env |
| UT-Env-Str-03 | replaceInString应保留普通文本 | 验证非变量部分保留 | 混合普通文本和变量引用 | 只替换变量引用部分 | 模拟process.env |
| UT-Env-Str-04 | replaceInString应处理不存在的环境变量 | 验证缺失环境变量处理 | 引用不存在变量的字符串 | 保留原始引用，输出警告 | 模拟console.warn |
| UT-Env-Str-05 | replaceInString应处理连续的环境变量引用 | 验证连续引用处理 | 连续变量引用字符串 | 所有引用被正确替换 | 模拟process.env |

### 3.3 集成测试用例

集成测试验证API层与Core层之间的协作和数据流。

#### 3.3.1 agentenv模块集成测试

**文件路径**: `/packages/agent/__tests__/integration/agentenv.integration.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-Env-01 | API层应将调用委托给Core层 | 验证API到Core的委托 | 任意输入 | Core层函数被调用 | 模拟Core层 |
| IT-Env-02 | API层应传递正确的参数给Core层 | 验证参数传递 | 复杂对象 | 参数完整传递 | 模拟Core层 |
| IT-Env-03 | API层应返回Core层的处理结果 | 验证返回值传递 | 任意输入 | 返回Core层的结果 | 模拟Core层 |
| IT-Env-04 | Core层应使用常量中定义的模式 | 验证常量使用 | 含环境变量引用的字符串 | 使用ENV_VAR_PATTERN常量 | 部分模拟 |

### 3.4 端到端测试用例

端到端测试验证从API到实际功能的完整工作流程。

#### 3.4.1 环境变量替换端到端测试

**文件路径**: `/packages/agent/__tests__/e2e/agentenv-replacement.e2e.test.ts`

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-Env-01 | 应替换字符串中的环境变量引用 | 验证字符串替换功能 | 含环境变量引用的字符串 | 环境变量被替换为实际值 | 设置实际环境变量 |
| E2E-Env-02 | 应替换复杂对象中的环境变量引用 | 验证对象处理功能 | 含嵌套环境变量引用的对象 | 所有引用被替换为实际值 | 设置实际环境变量 |
| E2E-Env-03 | 应处理混合数据类型 | 验证混合类型处理 | 包含各种类型的复杂结构 | 所有引用被正确替换 | 设置实际环境变量 |
| E2E-Env-04 | 应处理不存在的环境变量 | 验证错误处理 | 引用不存在变量的输入 | 保留原始引用，输出警告 | 确保环境变量不存在 |
| E2E-Env-05 | 应正确处理空值和特殊输入 | 验证边界情况处理 | null、undefined等值 | 正确处理不抛出错误 | 无需模拟 |

## 4. 模拟策略

### 4.1 单元测试模拟策略

- **环境变量模拟**：模拟process.env对象，提供可控的环境变量值
- **控制台输出模拟**：模拟console.warn，验证警告消息
- **核心函数隔离**：通过模拟确保单元测试只测试单个函数的逻辑

### 4.2 环境变量处理模拟示例

```typescript
// 设置模拟环境变量
beforeEach(() => {
  process.env = {
    ...process.env,
    TEST_VAR: 'test-value',
    API_KEY: 'sk-1234567890',
    SERVER_URL: 'https://api.example.com'
  };
});

// 清理模拟环境变量
afterEach(() => {
  delete process.env.TEST_VAR;
  delete process.env.API_KEY;
  delete process.env.SERVER_URL;
});
```

## 5. 测试覆盖率目标

依据DPML测试策略规则，设定如下覆盖率目标：

| 测试类型 | 行覆盖率目标 | 分支覆盖率目标 | 重点覆盖领域 |
|---------|------------|-------------|------------|
| 单元测试 | >95% | 100% | 类型处理逻辑、环境变量替换、错误处理 |
| 集成测试 | >90% | >95% | API与Core层协作 |
| 端到端测试 | 核心流程100% | N/A | 实际环境变量替换场景 |

## 6. 测试实现示例

### 6.1 API契约测试实现示例

```typescript
// /packages/agent/__tests__/contract/api/agentenv.contract.test.ts
import { describe, test, expect, vi } from 'vitest';
import { replaceEnvVars } from '../../../api/agentenv';
import * as agentenvCore from '../../../core/agentenv/agentenvCore';

// 模拟Core层
vi.mock('../../../core/agentenv/agentenvCore', () => ({
  replaceEnvVars: vi.fn(val => val)
}));

describe('CT-API-Env', () => {
  test('replaceEnvVars函数应符合公开契约', () => {
    // 验证函数存在且为函数类型
    expect(typeof replaceEnvVars).toBe('function');
  });

  test('replaceEnvVars函数应接受泛型参数并返回相同类型', () => {
    // 字符串测试
    const strInput = 'test';
    const strResult = replaceEnvVars(strInput);
    expect(typeof strResult).toBe('string');
    
    // 对象测试
    const objInput = { key: 'value' };
    const objResult = replaceEnvVars(objInput);
    expect(typeof objResult).toBe('object');
    
    // 数组测试
    const arrInput = ['test'];
    const arrResult = replaceEnvVars(arrInput);
    expect(Array.isArray(arrResult)).toBe(true);
  });
  
  test('replaceEnvVars函数应将API调用委托给Core层', () => {
    const input = '@agentenv:TEST_VAR';
    replaceEnvVars(input);
    expect(agentenvCore.replaceEnvVars).toHaveBeenCalledWith(input);
  });
});
```

### 6.2 Core层单元测试实现示例

```typescript
// /packages/agent/__tests__/unit/core/agentenv/agentenvCore.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { replaceEnvVars } from '../../../../core/agentenv/agentenvCore';

describe('UT-Env-Core', () => {
  // 模拟console.warn
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  
  beforeEach(() => {
    // 设置测试环境变量
    process.env.TEST_VAR = 'test-value';
    process.env.API_KEY = 'sk-1234567890';
    
    // 清理模拟历史
    warnSpy.mockClear();
  });
  
  afterEach(() => {
    // 清理测试环境变量
    delete process.env.TEST_VAR;
    delete process.env.API_KEY;
  });
  
  test('replaceEnvVars应处理null/undefined', () => {
    expect(replaceEnvVars(null)).toBe(null);
    expect(replaceEnvVars(undefined)).toBe(undefined);
  });
  
  test('replaceEnvVars应处理基本字符串', () => {
    expect(replaceEnvVars('hello world')).toBe('hello world');
  });
  
  test('replaceEnvVars应替换字符串中的环境变量引用', () => {
    expect(replaceEnvVars('@agentenv:TEST_VAR')).toBe('test-value');
  });
  
  test('replaceEnvVars应替换字符串中的多个环境变量引用', () => {
    const input = 'Key: @agentenv:API_KEY, Test: @agentenv:TEST_VAR';
    const expected = 'Key: sk-1234567890, Test: test-value';
    expect(replaceEnvVars(input)).toBe(expected);
  });
  
  test('replaceEnvVars应处理不存在的环境变量', () => {
    const input = '@agentenv:NON_EXISTENT_VAR';
    expect(replaceEnvVars(input)).toBe(input);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('NON_EXISTENT_VAR'));
  });
  
  test('replaceEnvVars应处理数组', () => {
    const input = ['@agentenv:TEST_VAR', 'normal', '@agentenv:API_KEY'];
    const expected = ['test-value', 'normal', 'sk-1234567890'];
    expect(replaceEnvVars(input)).toEqual(expected);
  });
  
  test('replaceEnvVars应处理简单对象', () => {
    const input = {
      key1: '@agentenv:TEST_VAR',
      key2: 'normal',
      key3: '@agentenv:API_KEY'
    };
    const expected = {
      key1: 'test-value',
      key2: 'normal',
      key3: 'sk-1234567890'
    };
    expect(replaceEnvVars(input)).toEqual(expected);
  });
  
  test('replaceEnvVars应处理嵌套对象', () => {
    const input = {
      key1: '@agentenv:TEST_VAR',
      nested: {
        key2: '@agentenv:API_KEY',
        deeper: {
          key3: '@agentenv:TEST_VAR'
        }
      }
    };
    const expected = {
      key1: 'test-value',
      nested: {
        key2: 'sk-1234567890',
        deeper: {
          key3: 'test-value'
        }
      }
    };
    expect(replaceEnvVars(input)).toEqual(expected);
  });
  
  test('replaceEnvVars应处理混合数据结构', () => {
    const input = {
      key1: '@agentenv:TEST_VAR',
      array: ['normal', '@agentenv:API_KEY'],
      nested: {
        key2: '@agentenv:TEST_VAR'
      }
    };
    const expected = {
      key1: 'test-value',
      array: ['normal', 'sk-1234567890'],
      nested: {
        key2: 'test-value'
      }
    };
    expect(replaceEnvVars(input)).toEqual(expected);
  });
  
  test('replaceEnvVars应正确处理非对象非数组非字符串类型', () => {
    expect(replaceEnvVars(123)).toBe(123);
    expect(replaceEnvVars(true)).toBe(true);
    expect(replaceEnvVars(false)).toBe(false);
  });
});
```

### 6.3 集成测试实现示例

```typescript
// /packages/agent/__tests__/integration/agentenv.integration.test.ts
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { replaceEnvVars as apiReplaceEnvVars } from '../../api/agentenv';
import * as agentenvCore from '../../core/agentenv/agentenvCore';

// 部分模拟Core层
vi.mock('../../core/agentenv/agentenvCore', async () => {
  const actual = await vi.importActual('../../core/agentenv/agentenvCore');
  return {
    ...actual,
    replaceEnvVars: vi.fn((...args) => {
      // 调用实际函数但跟踪调用
      return (actual as any).replaceEnvVars(...args);
    })
  };
});

describe('IT-Env', () => {
  beforeEach(() => {
    // 设置测试环境变量
    process.env.TEST_VAR = 'integration-value';
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // 清理测试环境变量
    delete process.env.TEST_VAR;
  });
  
  test('API层应将调用委托给Core层', () => {
    const input = '@agentenv:TEST_VAR';
    apiReplaceEnvVars(input);
    expect(agentenvCore.replaceEnvVars).toHaveBeenCalledTimes(1);
  });
  
  test('API层应传递正确的参数给Core层', () => {
    const input = { key: '@agentenv:TEST_VAR', nested: { key2: 'normal' } };
    apiReplaceEnvVars(input);
    expect(agentenvCore.replaceEnvVars).toHaveBeenCalledWith(input);
  });
  
  test('API层应返回Core层的处理结果', () => {
    const input = '@agentenv:TEST_VAR';
    const result = apiReplaceEnvVars(input);
    expect(result).toBe('integration-value');
  });
});
```

## 7. 测试夹具设计

### 7.1 环境变量测试夹具

**文件路径**: `/packages/agent/__tests__/fixtures/env.fixture.ts`

```typescript
/**
 * 测试用的环境变量设置和清理工具
 */
export class EnvFixture {
  private originalEnv: NodeJS.ProcessEnv;
  private testEnv: Record<string, string> = {};
  
  /**
   * 创建环境变量测试夹具
   * @param env 要设置的环境变量
   */
  constructor(env?: Record<string, string>) {
    // 保存原始环境
    this.originalEnv = { ...process.env };
    
    // 设置测试环境变量
    if (env) {
      this.set(env);
    }
  }
  
  /**
   * 设置环境变量
   */
  set(env: Record<string, string>): void {
    this.testEnv = { ...this.testEnv, ...env };
    Object.entries(env).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
  
  /**
   * 删除特定环境变量
   */
  unset(keys: string[]): void {
    keys.forEach(key => {
      delete process.env[key];
      delete this.testEnv[key];
    });
  }
  
  /**
   * 清理所有测试环境变量，恢复原始环境
   */
  cleanup(): void {
    // 删除所有测试变量
    Object.keys(this.testEnv).forEach(key => {
      delete process.env[key];
    });
    
    // 恢复原始环境（可选）
    // process.env = { ...this.originalEnv };
    
    this.testEnv = {};
  }
}

/**
 * 创建标准测试环境
 */
export function createTestEnv(): EnvFixture {
  return new EnvFixture({
    TEST_VAR: 'test-value',
    API_KEY: 'sk-1234567890',
    SERVER_URL: 'https://api.example.com',
    USERNAME: 'testuser',
    PASSWORD: 'testpass123',
    DEBUG: 'true'
  });
}
```

### 7.2 测试工具函数夹具

**文件路径**: `/packages/agent/__tests__/fixtures/testUtils.fixture.ts`

```typescript
/**
 * 创建测试用字符串，包含环境变量引用
 */
export function createTestString(includeExisting = true, includeNonExistent = false): string {
  let result = 'Basic text with ';
  
  if (includeExisting) {
    result += '@agentenv:TEST_VAR and @agentenv:API_KEY';
  }
  
  if (includeNonExistent) {
    result += ' and @agentenv:NON_EXISTENT_VAR';
  }
  
  return result;
}

/**
 * 创建测试用对象，包含环境变量引用
 */
export function createTestObject(depth = 2): Record<string, any> {
  const obj: Record<string, any> = {
    simple: '@agentenv:TEST_VAR',
    normal: 'no variables here',
    array: ['plain', '@agentenv:API_KEY', 123]
  };
  
  if (depth > 0) {
    obj.nested = createTestObject(depth - 1);
  }
  
  return obj;
}

/**
 * 创建包含多种数据类型的复杂对象
 */
export function createComplexObject(): Record<string, any> {
  return {
    string: '@agentenv:TEST_VAR',
    number: 42,
    boolean: true,
    null: null,
    undefined: undefined,
    array: [
      '@agentenv:API_KEY',
      123,
      { key: '@agentenv:SERVER_URL' }
    ],
    nested: {
      level1: {
        level2: {
          deep: '@agentenv:USERNAME'
        }
      },
      sibling: '@agentenv:PASSWORD'
    },
    mixed: 'Start @agentenv:TEST_VAR middle @agentenv:API_KEY end'
  };
}
```

## 8. 优先级和实施顺序

根据DPML测试策略，测试实施应按以下优先级顺序进行：

1. **契约测试**：确保API和常量定义稳定
2. **核心单元测试**：验证`replaceEnvVars`函数的基本功能
3. **类型处理单元测试**：验证对不同类型输入的处理
4. **集成测试**：验证API层与Core层协作
5. **边界条件测试**：验证错误处理和特殊输入处理
6. **端到端测试**：验证实际环境下的功能

## 9. 结论

本文档详细设计了DPML Agent环境变量处理模块的测试用例，涵盖了契约测试、单元测试、集成测试和端到端测试。测试用例设计遵循DPML测试策略规则，确保全面验证agentenv模块的功能和质量。

测试设计重点关注以下几个方面：
- API的稳定性与类型安全
- 环境变量替换的正确性
- 不同数据类型的处理逻辑
- 嵌套数据结构的处理能力
- 错误处理和边界条件处理

虽然agentenv模块功能简单，但通过全面的测试可以确保其在各种场景下都能正确工作，为整个Agent模块提供可靠的环境变量处理功能。 