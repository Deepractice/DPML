# 共享类型定义 (Types)

@dpml/common/types模块提供了DPML项目中共享的类型定义，包括错误类型、结果类型、接口定义和工具类型。

## 功能特点

- 完整的TypeScript类型定义
- 强类型设计，提高代码安全性
- 接口标准化，确保跨包一致性
- 工具类型，简化通用类型操作
- 错误处理标准化

## 快速入门

### 错误类型

```typescript
import { DPMLError, DPMLErrorCode, createDPMLError } from '@dpml/common/types';

// 创建标准错误
const error = createDPMLError('无法读取文件', DPMLErrorCode.FILE_NOT_FOUND, {
  path: '/path/to/file.txt',
});

// 错误包含标准属性
console.error(error.message); // 无法读取文件
console.error(error.code); // FILE_NOT_FOUND
console.error(error.details); // { path: '/path/to/file.txt' }

// 检查错误类型
if (error instanceof DPMLError) {
  // 处理DPML错误
}

// 错误代码枚举
function handleError(err: Error) {
  if (err instanceof DPMLError) {
    switch (err.code) {
      case DPMLErrorCode.FILE_NOT_FOUND:
        // 处理文件未找到错误
        break;
      case DPMLErrorCode.PERMISSION_DENIED:
        // 处理权限错误
        break;
      // ...其他错误类型
    }
  }
}
```

### 结果类型

```typescript
import { Result, success, failure } from '@dpml/common/types';

// 创建成功结果
const successResult: Result<number, Error> = success(42);

// 创建失败结果
const failureResult: Result<number, Error> = failure(new Error('操作失败'));

// 处理结果
function processResult<T>(result: Result<T, Error>): T | null {
  if (result.success) {
    return result.value;
  } else {
    console.error(result.error);
    return null;
  }
}

// 结果映射
const mappedResult = successResult.map(value => value * 2);
const flatMappedResult = successResult.flatMap(value =>
  value > 0 ? success(value * 2) : failure(new Error('值必须为正'))
);
```

### 文件系统接口

```typescript
import { FileSystem, FileEntry, FileStats } from '@dpml/common/types';

// 实现文件系统接口
class CustomFileSystem implements FileSystem {
  async readFile(path: string, encoding?: string): Promise<string | Buffer> {
    // 实现文件读取
    return '文件内容';
  }

  async writeFile(path: string, data: string | Buffer): Promise<void> {
    // 实现文件写入
  }

  async exists(path: string): Promise<boolean> {
    // 检查文件是否存在
    return true;
  }

  // ...其他方法
}

// 使用文件系统接口
async function processFile(fs: FileSystem, path: string) {
  if (await fs.exists(path)) {
    const content = await fs.readFile(path, 'utf-8');
    // 处理内容
  }
}
```

### HTTP客户端接口

```typescript
import {
  HttpClient,
  HttpResponse,
  HttpRequestOptions,
} from '@dpml/common/types';

// 实现HTTP客户端接口
class CustomHttpClient implements HttpClient {
  async get<T = any>(
    url: string,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    // 实现GET请求
    return {
      status: 200,
      data: { message: 'Success' } as T,
      headers: { 'content-type': 'application/json' },
    };
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    // 实现POST请求
    return {
      status: 201,
      data: { id: 1 } as T,
      headers: { 'content-type': 'application/json' },
    };
  }

  // ...其他方法
}

// 使用HTTP客户端接口
async function fetchUserData(http: HttpClient, userId: string) {
  const response = await http.get<{ name: string; email: string }>(
    `https://api.example.com/users/${userId}`
  );

  if (response.status === 200) {
    return response.data;
  }

  throw new Error(`获取用户数据失败: ${response.status}`);
}
```

### 工具类型

```typescript
import {
  DeepPartial,
  Nullable,
  StringKeyOf,
  RecursiveReadonly,
  DeepRequired,
} from '@dpml/common/types';

// 部分对象类型
interface User {
  id: number;
  name: string;
  profile: {
    age: number;
    email: string;
  };
}

const partialUser: DeepPartial<User> = {
  name: 'Test',
  profile: {
    email: 'test@example.com',
  },
};

// 可空类型
const nullableName: Nullable<string> = null; // 可以是字符串或null

// 字符串键类型
type UserKey = StringKeyOf<User>; // 'id' | 'name' | 'profile'

// 深度只读类型
const readonlyUser: RecursiveReadonly<User> = {
  id: 1,
  name: 'Test',
  profile: {
    age: 30,
    email: 'test@example.com',
  },
};
// readonlyUser.name = 'New'; // 错误: 只读属性不能修改
// readonlyUser.profile.age = 31; // 错误: 嵌套属性也是只读的
```

## 其他资源

- [错误类型](./ErrorTypes.md)
- [结果类型](./ResultTypes.md)
- [文件系统接口](./FileSystem.md)
- [HTTP客户端接口](./HttpClient.md)
- [工具类型](./UtilityTypes.md)
