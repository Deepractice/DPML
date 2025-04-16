# DPML 测试工具迁移指南

## 概述

DPML项目的测试工具已从独立的`@dpml/testing`包迁移到`@dpml/common`包中的`testing`模块。本文档提供了如何使用新测试工具的指南。

## 迁移步骤

1. 所有项目已经从`package.json`中移除了`@dpml/testing`依赖
2. 所有项目已添加`@dpml/common`依赖
3. `@dpml/testing`包已被完全删除

## 使用新测试工具

### 导入测试工具

```typescript
// 旧方式
import { ... } from '@dpml/testing';

// 新方式
import { ... } from '@dpml/common/testing';
```

### 可用的测试工具

`@dpml/common/testing`模块提供以下测试工具：

#### 模拟函数

```typescript
import { createMockFunction } from '@dpml/common/testing';

const mockFn = createMockFunction();
// 或提供实现
const mockWithImpl = createMockFunction((x: number) => x * 2);
```

#### 测试环境管理

```typescript
import { createTestEnvironment, withTestEnvironment } from '@dpml/common/testing';

// 创建测试环境
const env = createTestEnvironment({
  name: 'test-env',
  mockTime: true,
  env: { TEST_VAR: 'value' }
});

// 或使用辅助函数
await withTestEnvironment(
  { name: 'test-env' },
  async (env) => {
    // 测试代码...
  }
);
```

#### 测试夹具管理

```typescript
import { createFixtureCollection, withFixture } from '@dpml/common/testing';

// 创建和使用夹具
await withFixture(
  {
    name: 'testData',
    data: { value: 'test' }
  },
  async (fixture) => {
    // 使用fixture.data...
  }
);
```

#### 异步测试工具

```typescript
import {
  sleep,
  waitUntil,
  withTimeout,
  retryOperation,
  parallel
} from '@dpml/common/testing';

// 等待条件满足
await waitUntil(() => someCondition === true);

// 带超时的Promise
const result = await withTimeout(longRunningPromise, 5000);

// 重试操作
const result = await retryOperation(
  async () => { /* 可能失败的操作 */ },
  { maxAttempts: 3 }
);
```

#### 模拟对象

```typescript
import { createMockFileSystem, createMockHttpClient } from '@dpml/common/testing';

// 创建模拟文件系统
const mockFs = createMockFileSystem({
  '/config.json': '{"key": "value"}'
});

// 创建模拟HTTP客户端
const mockHttp = createMockHttpClient({
  responses: {
    'GET https://api.example.com/test': {
      status: 200,
      data: { result: 'ok' }
    }
  }
});
```

## 更多资源

完整的测试工具文档可在以下位置找到：

- [测试工具文档](../packages/common/src/testing/README.md)
- [单元测试示例](../packages/common/tests/unit/testing) 