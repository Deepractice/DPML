# @dpml/common 升级与迁移指南

本文档提供从旧版本迁移到最新版本@dpml/common的指南和注意事项。

## 版本1.0.0

### 从0.x版本升级

如果你正在使用@dpml/common的0.x版本，以下是升级到1.0.0版本的主要变更和迁移步骤。

#### 主要变更

1. **包结构调整**
   - 采用更模块化的结构，支持部分导入
   - 命名空间导出取代直接导出
   - 完善的TypeScript类型定义

2. **日志系统改进**
   - 引入新的日志格式化器API
   - 添加可配置的传输通道
   - 支持上下文和元数据

3. **错误处理增强**
   - 标准化错误代码
   - 引入Result类型
   - 更完善的错误详情支持

4. **测试工具扩展**
   - 新增模拟对象API
   - 增强的断言辅助函数
   - 测试夹具管理系统

#### 迁移步骤

##### 1. 更新导入语句

**旧版本:**
```typescript
import { createLogger, isEmpty, MockFileSystem } from '@dpml/common';
```

**新版本:**
```typescript
import { createLogger } from '@dpml/common/logger';
import { stringUtils } from '@dpml/common/utils';
import { createMockFileSystem } from '@dpml/common/testing';

// 或者使用命名空间导入
import { logger, utils, testing } from '@dpml/common';
const { createLogger } = logger;
const { stringUtils } = utils;
const { createMockFileSystem } = testing;
```

##### 2. 日志系统迁移

**旧版本:**
```typescript
import { createLogger, LogLevel } from '@dpml/common';

const logger = createLogger('my-package');
logger.setLevel(LogLevel.INFO);
logger.log('info', 'This is a message');
```

**新版本:**
```typescript
import { createLogger, LogLevel, ConsoleTransport } from '@dpml/common/logger';

const logger = createLogger('my-package');
logger.setLevel(LogLevel.INFO);
logger.addTransport(new ConsoleTransport({ colorize: true }));
logger.info('This is a message');
```

##### 3. 错误处理迁移

**旧版本:**
```typescript
import { DPMLError } from '@dpml/common';

throw new DPMLError('Something went wrong', 'ERROR_CODE');
```

**新版本:**
```typescript
import { createDPMLError, DPMLErrorCode } from '@dpml/common/types';

throw createDPMLError(
  'Something went wrong', 
  DPMLErrorCode.OPERATION_FAILED,
  { details: 'Additional information' }
);
```

##### 4. 使用Result类型

**旧版本:**
```typescript
function processData(data: string): string | Error {
  try {
    // 处理数据
    return processedData;
  } catch (err) {
    return err instanceof Error ? err : new Error(String(err));
  }
}

// 调用代码
const result = processData(data);
if (result instanceof Error) {
  console.error(result);
} else {
  console.log(result);
}
```

**新版本:**
```typescript
import { Result, success, failure } from '@dpml/common/types';

function processData(data: string): Result<string, Error> {
  try {
    // 处理数据
    return success(processedData);
  } catch (err) {
    return failure(err instanceof Error ? err : new Error(String(err)));
  }
}

// 调用代码
const result = processData(data);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

##### 5. 测试工具迁移

**旧版本:**
```typescript
import { MockFileSystem } from '@dpml/common';

const mockFs = new MockFileSystem({
  '/test/file.txt': 'content'
});
```

**新版本:**
```typescript
import { createMockFileSystem } from '@dpml/common/testing';

const mockFs = createMockFileSystem({
  '/test/file.txt': 'content'
});
```

#### 兼容层

为了平滑迁移，1.0.0版本提供了兼容层，允许使用旧式导入。这些导入会产生废弃警告，建议及时迁移到新API：

```typescript
// 仍然有效，但会产生废弃警告
import { createLogger, isEmpty } from '@dpml/common';
```

兼容层计划在1.2.0版本移除，请尽快完成迁移。

## 版本0.9.0 → 0.10.0

### 主要变更

- 添加了文件系统接口
- 引入了HTTP客户端接口
- 改进了日志级别控制

### 迁移步骤

略（历史版本）

## 版本0.8.0 → 0.9.0

### 主要变更

- 重命名了部分工具函数
- 更新了错误处理API

### 迁移步骤

略（历史版本）

## 常见问题

### 导入失败

**问题**: 升级后无法正确导入模块
**解决方案**: 检查导入路径，确保使用正确的模块路径

```typescript
// 错误
import { createLogger } from '@dpml/common';

// 正确
import { createLogger } from '@dpml/common/logger';
// 或
import { logger } from '@dpml/common';
const { createLogger } = logger;
```

### 类型错误

**问题**: 升级后出现TypeScript类型错误
**解决方案**: 检查类型定义，可能需要更新类型注解

```typescript
// 旧版本
function process(logger: any) {}

// 新版本 - 使用正确的类型
import { ILogger } from '@dpml/common/logger';
function process(logger: ILogger) {}
```

### 多版本共存

**问题**: 项目中同时存在多个版本的@dpml/common
**解决方案**: 使用pnpm的重写规则统一版本

```json
{
  "pnpm": {
    "overrides": {
      "@dpml/common": "^1.0.0"
    }
  }
}
```

## 进一步帮助

如果你在迁移过程中遇到任何问题，请参考以下资源：

- [API参考文档](./API-Reference.md)
- [GitHub问题跟踪器](https://github.com/your-org/dpml/issues)
- [社区论坛](https://community.yourorg.com) 