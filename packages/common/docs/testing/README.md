# 测试工具 (Testing)

@dpml/common/testing模块提供了测试辅助工具、模拟对象和测试数据工厂函数，用于简化DPML项目中的测试编写。

## 功能特点

- 模拟文件系统(MockFileSystem)工具
- 模拟HTTP客户端(MockHttpClient)工具
- 通用测试断言辅助函数
- 测试数据生成工具
- 测试夹具管理工具
- 与Vitest/Jest测试框架兼容

## 快速入门

### 模拟文件系统

```typescript
import { createMockFileSystem } from '@dpml/common/testing';

describe('文件处理测试', () => {
  it('应正确读取文件内容', async () => {
    // 创建模拟文件系统
    const mockFs = createMockFileSystem({
      '/path/to/file.txt': 'mock file content',
      '/config/settings.json': '{"enabled": true}'
    });
    
    // 测试文件操作
    const content = await mockFs.readFile('/path/to/file.txt', 'utf-8');
    expect(content).toBe('mock file content');
    
    // 验证调用历史
    expect(mockFs.readFile.mock.calls.length).toBe(1);
    expect(mockFs.readFile.mock.calls[0][0]).toBe('/path/to/file.txt');
  });
});
```

### 模拟HTTP客户端

```typescript
import { createMockHttpClient } from '@dpml/common/testing';

describe('API客户端测试', () => {
  it('应正确处理API响应', async () => {
    // 创建模拟HTTP客户端
    const mockHttp = createMockHttpClient({
      'GET https://api.example.com/users': {
        status: 200,
        data: { users: [{ id: 1, name: 'Test User' }] }
      },
      'POST https://api.example.com/users': {
        status: 201,
        data: { id: 2, name: 'New User' }
      }
    });
    
    // 测试HTTP请求
    const response = await mockHttp.get('https://api.example.com/users');
    expect(response.status).toBe(200);
    expect(response.data.users[0].name).toBe('Test User');
    
    // 验证调用历史
    expect(mockHttp.get.mock.calls.length).toBe(1);
  });
});
```

### 测试断言辅助

```typescript
import { 
  assertStructure, 
  assertDeepEquals,
  assertErrorType 
} from '@dpml/common/testing';

describe('断言辅助测试', () => {
  it('应验证对象结构', () => {
    const obj = { id: 1, name: 'Test', meta: { created: '2023-01-01' } };
    
    // 验证对象结构
    assertStructure(obj, {
      id: 'number',
      name: 'string',
      meta: 'object'
    });
    
    // 深度对比，忽略特定字段
    assertDeepEquals(
      obj, 
      { id: 1, name: 'Test', meta: {} }, 
      { ignoreProps: ['meta.created'] }
    );
    
    // 验证错误类型
    assertErrorType(() => {
      throw new TypeError('Test error');
    }, TypeError);
  });
});
```

## 进阶用法

### 测试夹具(Fixtures)

```typescript
import { createFixture, useFixture } from '@dpml/common/testing';

// 定义一个可重用的测试夹具
createFixture('userDatabase', () => {
  // 设置
  const db = {
    users: [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ]
  };
  
  // 返回夹具对象和清理函数
  return {
    fixture: db,
    cleanup: () => {
      db.users = [];
    }
  };
});

describe('用户管理测试', () => {
  it('应获取用户列表', () => {
    // 使用夹具
    const { fixture: db, cleanup } = useFixture('userDatabase');
    
    // 测试逻辑
    expect(db.users.length).toBe(2);
    
    // 自动清理
    cleanup();
  });
});
```

### 模拟时间

```typescript
import { mockTime, advanceTime } from '@dpml/common/testing';

describe('时间相关功能测试', () => {
  beforeEach(() => {
    // 模拟时间为特定日期
    mockTime('2023-05-15T10:00:00Z');
  });
  
  it('应正确计算时间差', () => {
    const start = new Date();
    
    // 前进时间30分钟
    advanceTime(30 * 60 * 1000);
    
    const end = new Date();
    const diff = end.getTime() - start.getTime();
    
    expect(diff).toBe(30 * 60 * 1000);
  });
  
  afterEach(() => {
    // 重置时间模拟
    mockTime.reset();
  });
});
```

## 其他资源

- [模拟文件系统](./MockFileSystem.md)
- [模拟HTTP客户端](./MockHttpClient.md)
- [测试工具函数](./TestUtils.md)
- [断言辅助](./Assertions.md)
- [测试夹具](./Fixtures.md) 