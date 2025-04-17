# 测试规范

本文档定义了DPML项目的测试规范和最佳实践。

## 基本原则

1. **测试框架**：项目统一使用Vitest进行单元测试和集成测试
2. **工具依赖**：使用`@dpml/common/testing`提供的工具进行模拟和辅助测试
3. **测试覆盖率**：核心模块和公共API需达到至少80%的覆盖率
4. **测试隔离**：测试应该相互隔离，避免共享状态
5. **测试可读性**：测试应清晰表达其目的，遵循 Arrange-Act-Assert 模式

## 测试结构和命名

### 测试文件命名规则

```
src/__tests__/[unit|integration]/[模块名]/[测试对象].[test|spec].ts
```

例如：
- `src/__tests__/unit/parser/xml-parser.test.ts` - 单元测试
- `src/__tests__/integration/parser-transformer/data-flow.test.ts` - 集成测试

### 测试套件和用例命名

遵循以下命名规范，确保测试目的明确：

```typescript
// 单元测试
describe('UT-[Module]-[Feature]', () => {
  // 单个测试用例
  test('should [expected result] when [condition]', () => {
    // ...
  });
});

// 集成测试
describe('IT-[ModuleA]-[ModuleB]', () => {
  // ...
});
```

例如：

```typescript
// parser/xml-parser.test.ts
describe('UT-Parser-ParseXML', () => {
  test('should correctly parse valid XML string', () => {
    // ...
  });
  
  test('should throw SyntaxError when XML format is invalid', () => {
    // ...
  });
});
```

### 测试文件结构

每个测试文件应遵循以下结构：

```typescript
/**
 * 模块的单元测试
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { 
  createMockFunction, 
  fileSystemMock 
} from '@dpml/common/testing';
import { ModuleToTest } from '../../module-to-test';

describe('UT-Module-Feature', () => {
  // 设置测试夹具
  let fixture;
  
  // 每个测试前的设置
  beforeEach(() => {
    fixture = {
      // 初始化测试数据和模拟
    };
  });
  
  // 每个测试后的清理
  afterEach(() => {
    // 清理资源
  });
  
  // 按功能分组的测试用例
  describe('Feature A', () => {
    test('scenario 1', () => {
      // 安排 (Arrange)
      
      // 执行 (Act)
      
      // 断言 (Assert)
    });
    
    test('scenario 2', () => {
      // ...
    });
  });
  
  describe('Feature B', () => {
    // ...
  });
});
```

## 模拟规范

### 模拟策略

1. **最小化模拟**：只模拟测试直接依赖的外部系统和模块
2. **明确边界**：在测试中明确指出哪些是被模拟的部分
3. **模拟真实行为**：模拟应尽可能准确地反映真实行为

### 使用模拟工具

1. **模拟函数**

```typescript
import { createMockFunction } from '@dpml/common/testing';

const mockCallback = createMockFunction();
moduleUnderTest.doSomethingWithCallback(mockCallback);

// 验证调用
expect(mockCallback.mock.calls.length).toBe(1);
expect(mockCallback.mock.calls[0][0]).toBe('expected arg');
```

2. **模拟文件系统**

```typescript
import { fileSystemMock } from '@dpml/common/testing';

const mockFs = fileSystemMock.createMockFileSystem({
  '/config.json': '{"setting": "value"}',
});

// 使用模拟文件系统测试
const result = await moduleUnderTest.readConfig('/config.json', mockFs);
expect(result).toEqual({ setting: 'value' });
```

3. **模拟HTTP客户端**

```typescript
import { httpClientMock } from '@dpml/common/testing';

const mockHttp = httpClientMock.createMockHttpClient({
  responses: {
    'GET https://api.example.com/data': {
      status: 200,
      data: { id: 1, name: 'Test' }
    }
  }
});

// 使用模拟HTTP客户端测试
const result = await moduleUnderTest.fetchData(mockHttp);
expect(result.name).toBe('Test');
```

### 依赖注入

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

## 异步测试规范

### 处理Promise

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

### 超时和重试

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

## 测试环境

### 环境设置

使用测试环境工具控制测试环境：

```typescript
import { environmentUtils } from '@dpml/common/testing';

test('should run in specific environment', async () => {
  await environmentUtils.withTestEnvironment(
    {
      env: { NODE_ENV: 'test', API_KEY: 'test-key' },
      mockTime: true
    },
    async (env) => {
      // 控制时间
      env.setCurrentTime(new Date('2023-01-01'));
      
      // 运行测试...
      
      // 推进时间
      env.advanceTimeBy(3600000); // 前进1小时
      
      // 继续测试...
    }
  );
});
```

### 测试夹具

每个包应自行管理测试夹具，不使用common包的夹具工具，以避免跨包维护的复杂性。

#### 夹具设计原则

1. **局部性原则**：测试夹具应该在包内部定义和使用，避免跨包依赖
2. **简单性原则**：保持夹具设计简单，只包含测试所需的最小数据集
3. **独立性原则**：夹具应该是独立的，不应依赖于其他夹具

#### 推荐的夹具实现方式

```typescript
// packages/your-package/src/__tests__/fixtures/user-fixture.ts
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
// packages/your-package/src/__tests__/unit/user/validator.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { createUserFixture } from '../../fixtures/user-fixture';
import { validateUser } from '../../../user/validator';

describe('UT-User-Validator', () => {
  let fixture: ReturnType<typeof createUserFixture>;
  
  beforeEach(() => {
    fixture = createUserFixture();
  });
  
  test('should validate user successfully', () => {
    const result = validateUser(fixture.validUser);
    expect(result.valid).toBe(true);
  });
  
  test('should fail validation with appropriate error', () => {
    const result = validateUser(fixture.invalidUser);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('name is required');
  });
});
```

#### 复杂夹具的管理

对于需要初始化和清理的复杂夹具，可以使用以下模式：

```typescript
// packages/your-package/src/__tests__/fixtures/database-fixture.ts
export interface DatabaseFixture {
  connection: any;
  testData: {
    users: any[];
    products: any[];
  };
  setup(): Promise<void>;
  teardown(): Promise<void>;
}

export function createDatabaseFixture(): DatabaseFixture {
  let connection: any = null;
  const testData = {
    users: [],
    products: []
  };
  
  return {
    get connection() { return connection; },
    testData,
    
    async setup() {
      // 初始化数据库连接
      connection = await createTestConnection();
      
      // 填充测试数据
      testData.users = await connection.insertUsers([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]);
      
      testData.products = await connection.insertProducts([
        { id: 1, name: 'Product 1' }
      ]);
    },
    
    async teardown() {
      // 清理测试数据
      if (connection) {
        await connection.clearAllData();
        await connection.close();
        connection = null;
      }
    }
  };
}

// 使用示例
// 在测试文件中
let dbFixture: ReturnType<typeof createDatabaseFixture>;

beforeEach(async () => {
  dbFixture = createDatabaseFixture();
  await dbFixture.setup();
});

afterEach(async () => {
  await dbFixture.teardown();
});

test('should retrieve user from database', async () => {
  // 使用dbFixture.connection和dbFixture.testData...
});
```

## 断言最佳实践

### 精确断言

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

### 测试异常

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

## 测试数据策略

### 使用工厂创建测试数据

```typescript
import { createUserFactory } from '../factories/user-factory';

const userFactory = createUserFactory();

test('should correctly process user data', () => {
  // 创建基本用户
  const user = userFactory.create();
  
  // 创建带有特定属性的用户
  const adminUser = userFactory.create({ role: 'admin' });
  
  // 创建多个用户
  const users = userFactory.createMany(3, { isActive: true });
  
  // 使用测试数据...
});
```

### 避免硬编码测试数据

```typescript
// 避免
test('should calculate total', () => {
  const cart = {
    items: [
      { id: 1, price: 10.99, quantity: 2 },
      { id: 2, price: 5.99, quantity: 1 }
    ]
  };
  
  const total = calculateTotal(cart);
  expect(total).toBe(27.97);
});

// 推荐
test('should calculate total', () => {
  // 定义测试用例
  const testCase = {
    items: [
      { id: 1, price: 10, quantity: 2 }, // 使用整数简化计算
      { id: 2, price: 5, quantity: 1 }
    ],
    expectedTotal: 25 // 清晰的预期结果
  };
  
  const total = calculateTotal({ items: testCase.items });
  expect(total).toBe(testCase.expectedTotal);
});
```

## 测试覆盖率要求

| 模块类型 | 行覆盖率要求 | 分支覆盖率要求 |
|---------|------------|-------------|
| 核心模块 | 90%        | 85%         |
| 工具类   | 85%        | 80%         |
| 公共API  | 90%        | 85%         |
| UI组件   | 75%        | 70%         |
| 内部实现 | 70%        | 65%         |

### 排除特定文件

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

## CI集成

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

## 最佳实践

1. **测试公共API**: 优先测试模块的公共API而非内部实现
2. **单一职责**: 每个测试只测试一个行为或功能
3. **避免条件逻辑**: 测试中应避免使用条件逻辑
4. **避免测试私有方法**: 通过公共API间接测试私有方法
5. **测试边界条件**: 包括空值、边界值和异常路径
6. **测试错误处理**: 确保错误被正确捕获和处理
7. **避免直接修改全局状态**:使用测试环境隔离全局状态
8. **快速测试**: 单元测试应该执行迅速，减少不必要的等待 