# @dpml/common 测试工具

提供DPML项目通用的测试工具、模拟对象和测试辅助功能。

## 功能概述

测试工具模块包含以下主要组件：

- **Mock Functions**: 创建和管理模拟函数
- **Mock Objects**: 文件系统和HTTP客户端的模拟实现
- **Test Data Factories**: 测试数据生成工厂
- **Test Environment**: 测试环境管理工具
- **Test Fixtures**: 测试夹具管理机制
- **Async Test Utilities**: 异步测试辅助工具

## 使用说明

### 模拟函数 (Mock Functions)

```typescript
import { createMockFunction } from '@dpml/common/testing';

// 创建简单的模拟函数
const mockFn = createMockFunction();
mockFn('arg1', 'arg2');

// 检查调用
console.log(mockFn.mock.calls); // [['arg1', 'arg2']]

// 创建有实现的模拟函数
const mockWithImpl = createMockFunction((x: number) => x * 2);
const result = mockWithImpl(5); // 10
```

### 模拟文件系统 (Mock File System)

```typescript
import { createMockFileSystem } from '@dpml/common/testing';

const mockFs = createMockFileSystem({
  // 初始文件系统状态
  '/path/to/file.txt': 'file content',
  '/path/to/dir': {
    'nested.txt': 'nested content'
  }
});

// 使用模拟文件系统
await mockFs.readFile('/path/to/file.txt'); // 'file content'
await mockFs.exists('/path/to/dir/nested.txt'); // true
```

### 模拟HTTP客户端 (Mock HTTP Client)

```typescript
import { createMockHttpClient } from '@dpml/common/testing';

const mockHttp = createMockHttpClient({
  responses: {
    'GET https://api.example.com/users': {
      status: 200,
      data: [{ id: 1, name: 'User 1' }]
    },
    'POST https://api.example.com/users': {
      status: 201,
      data: { id: 2, name: 'New User' }
    }
  }
});

// 使用模拟HTTP客户端
const users = await mockHttp.get('https://api.example.com/users');
```

### 测试数据工厂 (Test Data Factories)

```typescript
import { createUserFactory } from '@dpml/common/testing';

// 创建用户工厂
const userFactory = createUserFactory();

// 创建单个用户
const user = userFactory.create({ name: 'Custom Name' });

// 创建多个用户
const users = userFactory.createMany(3, { isActive: true });
```

### 测试环境管理 (Test Environment)

```typescript
import { createTestEnvironment, withTestEnvironment } from '@dpml/common/testing';

// 创建和管理测试环境
const env = createTestEnvironment({
  name: 'test-env',
  mockTime: true,
  env: { TEST_VAR: 'value' }
});

await env.setup();
// 在模拟环境中运行测试
env.setCurrentTime(new Date('2023-01-01'));
env.advanceTimeBy(60000); // 前进1分钟
await env.teardown();

// 或使用辅助函数
await withTestEnvironment(
  { name: 'test-env', mockTime: true },
  async (env) => {
    // 在环境中运行测试...
  }
);
```

### 测试夹具管理 (Test Fixtures)

```typescript
import { createFixtureCollection, withFixture } from '@dpml/common/testing';

// 创建夹具集合
const fixtures = createFixtureCollection();

// 添加夹具
fixtures.add({
  name: 'testData',
  data: { users: [], projects: [] },
  setup: async () => {
    // 初始化夹具...
  },
  teardown: async () => {
    // 清理夹具...
  }
});

// 使用夹具
await withFixture(
  {
    name: 'userFixture',
    data: { id: 1, name: 'Test User' }
  },
  async (fixture) => {
    // 使用fixture.data...
  }
);
```

### 异步测试工具 (Async Test Utilities)

```typescript
import {
  sleep,
  waitUntil,
  withTimeout,
  retryOperation,
  parallel
} from '@dpml/common/testing';

// 等待指定时间
await sleep(1000);

// 等待条件满足
await waitUntil(() => someCondition === true);

// 带超时的Promise
const result = await withTimeout(longRunningPromise, 5000);

// 重试操作
const result = await retryOperation(
  async () => { /* 可能失败的操作 */ },
  { maxAttempts: 3, delay: 100 }
);

// 并行执行
const { successes, errors } = await parallel([
  () => promise1(),
  () => promise2(),
  () => promise3()
]);
```

## 进阶用法

### 组合使用多个工具

```typescript
import {
  createMockFileSystem,
  createMockHttpClient,
  withTestEnvironment,
  withFixture
} from '@dpml/common/testing';

// 在测试中组合使用多个工具
await withTestEnvironment(
  { name: 'integration-test', mockTime: true },
  async (env) => {
    const mockFs = createMockFileSystem({
      '/config.json': JSON.stringify({ apiUrl: 'https://api.example.com' })
    });
    
    const mockHttp = createMockHttpClient({
      responses: {
        'GET https://api.example.com/status': {
          status: 200,
          data: { status: 'ok' }
        }
      }
    });
    
    await withFixture(
      {
        name: 'testContext',
        data: { fs: mockFs, http: mockHttp }
      },
      async (fixture) => {
        // 执行测试...
      }
    );
  }
);
```

## 最佳实践

1. **隔离测试环境**：始终使用`withTestEnvironment`确保测试环境的隔离
2. **使用工厂创建测试数据**：避免在测试中硬编码测试数据
3. **模拟外部依赖**：使用模拟对象替代文件系统、网络请求等外部依赖
4. **使用夹具共享测试状态**：对于复杂测试，使用夹具管理共享状态
5. **合理使用异步工具**：使用`waitUntil`、`retryOperation`等处理异步测试场景

## 贡献

欢迎提交Issues和Pull Requests来改进测试工具。 