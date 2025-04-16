# @dpml/common

DPML项目的通用工具和共享功能库。

## 安装

```bash
pnpm add @dpml/common
```

## 功能

该包提供了四个核心模块：

### 1. 日志系统

提供统一的日志接口和实现，支持多级别日志和不同输出目标：

```typescript
import {
  createLogger,
  LogLevel,
  configureLogger,
  createFileTransport,
} from '@dpml/common/logger';

// 创建日志记录器
const logger = createLogger('my-package');

// 设置日志级别
logger.setLevel(LogLevel.DEBUG);

// 记录不同级别的日志
logger.debug('这是调试信息');
logger.info('这是普通信息');
logger.warn('这是警告信息');
logger.error('这是错误信息', { code: 500 });

// 全局配置日志
import { JsonFormatter } from '@dpml/common/logger';
configureLogger({
  level: LogLevel.INFO,
  formatter: new JsonFormatter({ pretty: true }),
});

// 添加文件传输 (Node.js环境)
const fileTransport = createFileTransport('./logs/app.log');
if (fileTransport) {
  logger.addTransport(fileTransport);
}
```

#### 格式化器

```typescript
import { TextFormatter, JsonFormatter } from '@dpml/common/logger';

// 文本格式化器
const textFormatter = new TextFormatter({
  template: '[{timestamp}] [{packageName}] [{level}] {message}',
  showTimestamp: true,
  showPackageName: true,
});

// JSON格式化器
const jsonFormatter = new JsonFormatter({
  pretty: true,
  indent: 2,
  includeMeta: true,
});
```

#### 传输通道

```typescript
import {
  ConsoleTransport,
  MemoryTransport,
  createFileTransport,
} from '@dpml/common/logger';

// 控制台传输
const consoleTransport = new ConsoleTransport({ colorize: true });

// 内存传输 (用于测试或缓存)
const memoryTransport = new MemoryTransport({ maxSize: 100 });
const logs = memoryTransport.getLogs();

// 文件传输 (仅Node.js环境)
const fileTransport = createFileTransport({
  filename: './logs/app.log',
  append: true,
  mkdir: true,
});
```

### 2. 测试工具

提供测试辅助工具、模拟对象和测试数据工厂：

```typescript
import { createMockFileSystem, createMockFunction } from '@dpml/common/testing';

const mockFs = createMockFileSystem();
mockFs.readFile.mock.calls; // 访问调用历史
```

### 3. 通用工具函数

提供字符串处理、数组操作、对象处理和异步操作等工具：

```typescript
import { stringUtils, arrayUtils, asyncUtils } from '@dpml/common/utils';

// 字符串工具
stringUtils.isEmpty(''); // true
stringUtils.ensureEndsWith('path', '/'); // 'path/'

// 数组工具
arrayUtils.chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// 异步工具
await asyncUtils.sleep(1000);
await asyncUtils.retry(() => fetchData(), { maxAttempts: 3, delay: 500 });
```

### 4. 共享类型定义

提供DPML项目中共享的基础类型定义：

```typescript
import { FileSystem, HttpClient, DPMLError, Result } from '@dpml/common/types';

// 错误处理
const error = createDPMLError('操作失败', 'OPERATION_FAILED', { id: 123 });

// Result类型
const result: Result<number, Error> = success(42);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

## 部分导入

为了优化构建体积，你可以只导入需要的模块：

```typescript
// 只导入日志系统
import { createLogger } from '@dpml/common/logger';

// 只导入工具函数
import { stringUtils } from '@dpml/common/utils';
```

## 文档

详细文档请参阅：

- [API参考文档](./docs/API-Reference.md)
- [日志系统文档](./docs/logger/README.md)
- [测试工具文档](./docs/testing/README.md)
- [工具函数文档](./docs/utils/README.md)
- [类型定义文档](./docs/types/README.md)
- [集成指南](./docs/integration-guide.md)
- [升级与迁移指南](./docs/migration-guide.md)

## 示例

更多使用示例请查看[examples](./examples)目录。

## 许可证

MIT
