# 日志系统 (Logger)

@dpml/common/logger模块提供了统一的日志接口和实现，支持多级别日志和不同输出目标。

## 功能特点

- 支持多种日志级别（debug、info、warn、error）
- 按包名创建日志实例，便于区分来源
- 支持多种输出目标（控制台、文件、内存）
- 灵活的格式化器系统
- 支持动态调整日志级别
- 日志上下文和元数据支持
- 支持异步日志操作
- 适用于浏览器和Node.js环境

## 快速入门

### 基本使用

```typescript
import { createLogger, LogLevel } from '@dpml/common/logger';

// 创建日志记录器
const logger = createLogger('my-package');

// 记录不同级别的日志
logger.debug('这是调试信息');
logger.info('这是普通信息');
logger.warn('这是警告信息');
logger.error('这是错误信息', { code: 500 });

// 动态调整日志级别
logger.setLevel(LogLevel.INFO); // 将不再显示debug级别信息
```

### 自定义格式

```typescript
import { createLogger, TextFormatter } from '@dpml/common/logger';

const logger = createLogger('my-package');

// 自定义文本格式
logger.setFormatter(new TextFormatter({
  template: '[{timestamp}] [{packageName}] [{level}] {message}',
  showTimestamp: true,
  timestampFormat: 'YYYY-MM-DD HH:mm:ss'
}));
```

### 添加输出目标

```typescript
import { createLogger, ConsoleTransport, createFileTransport } from '@dpml/common/logger';

const logger = createLogger('my-package');

// 设置控制台输出
const consoleTransport = new ConsoleTransport({ colorize: true });
logger.addTransport(consoleTransport);

// 添加文件输出 (Node.js环境)
const fileTransport = createFileTransport('./logs/app.log');
if (fileTransport) {
  logger.addTransport(fileTransport);
}
```

## 进阶用法

### 全局配置

配置所有日志记录器的默认行为：

```typescript
import { configureLogger, LogLevel, JsonFormatter } from '@dpml/common/logger';

configureLogger({
  level: LogLevel.INFO,
  formatter: new JsonFormatter({ pretty: true }),
  transports: [new ConsoleTransport()]
});
```

### 日志上下文

添加额外信息到日志条目：

```typescript
import { createLogger } from '@dpml/common/logger';

const logger = createLogger('auth-service');

// 添加用户ID到所有日志
const userLogger = logger.withContext({ userId: 'user-123' });
userLogger.info('用户登录'); // 日志将包含userId字段

// 单条日志添加上下文
logger.info('用户登出', { userId: 'user-123' });
```

## 其他资源

- [日志级别](./LogLevel.md)
- [日志记录器API](./Logger.md)
- [格式化器](./Formatters.md)
- [传输通道](./Transports.md)
- [配置系统](./Configuration.md) 