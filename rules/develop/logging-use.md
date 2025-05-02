# DPML 日志使用指南

## 1. 概述

本文档提供了在 DPML 项目中使用日志模块的最佳实践和指导方针。日志是开发、调试和运维过程中的重要工具，合理的日志记录可以帮助理解系统行为、诊断问题并监控性能。

## 2. 基本原则

### 2.1 日志的目的

- **调试辅助**：在开发阶段帮助理解代码执行流程和状态
- **错误诊断**：在生产环境中帮助定位和分析问题
- **行为审计**：记录关键操作和状态变更
- **性能监控**：记录操作时间和资源使用情况

### 2.2 日志质量原则

- **相关性**：日志应该提供有意义的上下文信息
- **可读性**：日志消息应该清晰、简洁，使用一致的格式
- **完整性**：包含足够的信息以理解发生了什么
- **可过滤性**：使用结构化数据和明确的日志级别，便于后续分析
- **适量性**：避免过度记录导致日志膨胀和性能问题

### 2.3 接口和实现

DPML的日志系统基于以下接口定义:

```typescript
export type Logger = {
  debug(message: string, context?: Record<string, unknown>, error?: Error): void;
  info(message: string, context?: Record<string, unknown>, error?: Error): void;
  warn(message: string, context?: Record<string, unknown>, error?: Error): void;
  error(message: string, context?: Record<string, unknown>, error?: Error): void;
  fatal(message: string, context?: Record<string, unknown>, error?: Error): void;
}
```

日志接口设计遵循以下原则:

- **简单性**：提供最小、必要的方法集，便于实现和使用
- **一致性**：所有日志级别使用相同的方法签名
- **可扩展性**：实现可以添加额外功能，但接口保持稳定
- **类型安全**：使用TypeScript类型确保正确使用

在使用时应当严格遵循接口定义，避免依赖特定实现的非公开方法，以保证代码在不同日志实现下的兼容性。

## 3. 获取日志器

### 3.1 使用命名日志器

每个模块应该使用带有明确名称的日志器，以便于区分不同模块的日志：

```typescript
import { getLogger } from '@dpml/core';

// 用模块名称作为日志器名称
const logger = getLogger('parser');

// 也可以使用更细粒度的命名
const logger = getLogger('parser.validator');
```

### 3.2 避免使用默认日志器

除非在应用入口点或通用工具类中，否则应避免使用默认日志器：

```typescript
// 不推荐
import { getDefaultLogger } from '@dpml/core';
const logger = getDefaultLogger();

// 推荐
import { getLogger } from '@dpml/core';
const logger = getLogger('yourModuleName');
```

### 3.3 日志器作用域

- **类级别**：在类中使用私有静态日志器
- **模块级别**：在模块顶层定义日志器
- **函数级别**：避免在函数内部创建日志器，应从外部传入或使用模块级日志器

```typescript
// 在类中
class Parser {
  private static logger = getLogger('Parser');
  
  parse(input: string): Document {
    Parser.logger.debug('开始解析');
    // ...
  }
}

// 在模块中
// parser.ts
const logger = getLogger('parser');

export function parse(input: string): Document {
  logger.debug('开始解析');
  // ...
}
```

## 4. 日志级别使用指南

### 4.1 DEBUG

用于详细的调试信息，通常仅在开发环境启用：

- 函数入口和退出点
- 关键变量值和状态
- 详细执行流程
- 中间结果和决策点

```typescript
logger.debug('开始解析XML文档', { documentSize: input.length });
logger.debug('找到节点', { nodeType, nodeCount: nodes.length });
```

### 4.2 INFO

用于记录正常但重要的系统事件：

- 服务启动和停止
- 配置加载完成
- 任务完成
- 重要操作的成功执行

```typescript
logger.info('DPML引擎初始化完成', { version: '1.0.0' });
logger.info('文档解析完成', { documentId, parseTime: `${elapsed}ms` });
```

### 4.3 WARN

用于潜在问题或即将发生的问题警告：

- 配置不当但系统仍能工作
- 性能下降警告
- 失败的重试操作
- 弃用API的使用
- 临近资源限制

```typescript
logger.warn('配置项已弃用', { option: 'legacyMode', suggestedAlternative: 'standardMode' });
logger.warn('XML节点缺少推荐属性', { nodeType, missingAttribute: 'id' });
```

### 4.4 ERROR

用于错误事件，但不一定影响整个系统运行：

- 请求处理失败
- 操作超时
- 资源访问失败
- 数据验证失败

```typescript
logger.error('XML解析失败', { fileName, line: 42, column: 10 }, error);
logger.error('无法访问外部资源', { url, statusCode: 404 });
```

### 4.5 FATAL

用于导致应用终止的严重错误：

- 系统无法启动
- 关键依赖不可用
- 数据损坏
- 不可恢复的系统状态

```typescript
logger.fatal('数据库连接失败，无法继续运行', { dbHost }, error);
logger.fatal('检测到无效系统状态', { state: 'corrupted' });
```

## 5. 结构化日志最佳实践

### 5.1 上下文信息

使用上下文对象提供结构化信息，而不是拼接字符串：

```typescript
// 不推荐
logger.info(`处理文档 ${docId}，大小: ${size} 字节，类型: ${type}`);

// 推荐
logger.info('处理文档', { docId, size: `${size} 字节`, type });
```

### 5.2 错误记录

记录错误时，使用错误参数而不是手动提取错误信息：

```typescript
// 不推荐
try {
  // ...
} catch (error) {
  logger.error(`解析失败: ${error.message}`);
}

// 推荐
try {
  // ...
} catch (error) {
  logger.error('解析失败', { operation: 'parseXML' }, error);
}
```

### 5.3 避免敏感信息

不要记录敏感信息，如密码、令牌或个人身份信息：

```typescript
// 不推荐
logger.debug('用户登录', { username, password });

// 推荐
logger.debug('用户登录尝试', { username, hasPassword: !!password });
```

### 5.4 性能考量

对于可能产生大量日志的操作，可以使用条件检查避免不必要的字符串构建和复杂计算：

```typescript
// 不推荐 - 无论日志级别如何，都会执行昂贵的计算
logger.debug('详细状态', { stats: calculateExpensiveStats() });

// 推荐 - 根据环境变量或配置进行条件判断
const isDebugMode = process.env.LOG_LEVEL === 'DEBUG';
if (isDebugMode) {
  logger.debug('详细状态', { stats: calculateExpensiveStats() });
}

// 或者使用三元运算符在日志上下文中进行懒加载
logger.debug('系统状态', { 
  basic: getBasicStats(),
  // 只在需要时计算复杂统计数据
  details: isDebugMode ? calculateExpensiveStats() : '详细信息已禁用'
});
```

**注意**：当前 `Logger` 接口并没有提供 `isDebugEnabled()` 等级别检查方法。您需要通过其他方式（如环境变量、配置参数）来确定当前日志级别，并据此决定是否执行昂贵的计算。

在未来版本中，我们计划为日志接口添加类似 `isLevelEnabled(level: LogLevel)` 的方法，以便更方便地进行性能优化。

## 6. 日志配置

### 6.1 开发环境

```typescript
import { setDefaultLogLevel, LogLevel } from '@dpml/core';

// 开发环境使用DEBUG级别
if (process.env.NODE_ENV === 'development') {
  setDefaultLogLevel(LogLevel.DEBUG);
}
```

### 6.2 测试环境

```typescript
// 测试环境使用INFO级别，或针对特定模块使用DEBUG
if (process.env.NODE_ENV === 'test') {
  setDefaultLogLevel(LogLevel.INFO);
  
  // 为特定测试场景启用更详细的日志
  const parserLogger = createLogger('parser', {
    minLevel: LogLevel.DEBUG
  });
}
```

### 6.3 生产环境

```typescript
// 生产环境默认使用WARN或ERROR级别
if (process.env.NODE_ENV === 'production') {
  setDefaultLogLevel(LogLevel.WARN);
  
  // 为关键组件设置适当的日志级别
  const securityLogger = createLogger('security', {
    minLevel: LogLevel.INFO
  });
}
```

## 7. 日志与错误处理集成

### 7.1 错误处理模式

```typescript
import { AppError, ErrorCodes } from '../errors';
import { getLogger } from '@dpml/core';

const logger = getLogger('service');

function processData(input: Data) {
  try {
    // 处理逻辑
  } catch (error) {
    // 记录原始错误
    logger.error('数据处理失败', { inputId: input.id }, error);
    
    // 转换为应用错误并抛出
    if (error instanceof SyntaxError) {
      throw new AppError(ErrorCodes.INVALID_FORMAT, '输入格式无效', { cause: error });
    }
    throw new AppError(ErrorCodes.UNKNOWN, '未知处理错误', { cause: error });
  }
}
```

### 7.2 全局错误处理器

```typescript
import { getLogger } from '@dpml/core';

const logger = getLogger('errorHandler');

// 全局未捕获异常处理
process.on('uncaughtException', (error) => {
  logger.fatal('未捕获的异常', {}, error);
  // 执行清理并优雅退出
  process.exit(1);
});

// Promise拒绝处理
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝', { promise }, reason instanceof Error ? reason : new Error(String(reason)));
});
```

## 8. 高级技巧

### 8.1 使用自定义日志器

```typescript
import { createLogger, LogLevel, ConsoleTransport, FileTransport } from '@dpml/core';

// 对关键组件使用文件传输器
const criticalLogger = createLogger('critical', {
  minLevel: LogLevel.INFO,
  transports: [
    new ConsoleTransport(),
    new FileTransport('./logs/critical.log')
  ]
});
```

### 8.2 调用位置跟踪

```typescript
import { createLogger, LogLevel } from '@dpml/core';

// 为调试目的启用调用位置跟踪
const debugLogger = createLogger('debugger', {
  minLevel: LogLevel.DEBUG,
  callSiteCapture: {
    enabled: true,
    forLevels: [LogLevel.ERROR, LogLevel.FATAL]
  }
});
```

### 8.3 异步日志处理

```typescript
import { createLogger, LogLevel, AsyncConsoleTransport } from '@dpml/core';

// 高性能场景使用异步日志
const highThroughputLogger = createLogger('highLoad', {
  minLevel: LogLevel.INFO,
  transports: [
    new AsyncConsoleTransport(1000) // 1秒刷新间隔
  ]
});
```

## 9. 常见问题

### 9.1 过度记录

避免在循环中记录大量信息，除非确实需要：

```typescript
// 不推荐
items.forEach(item => {
  logger.debug('处理项目', { item });
  // 处理逻辑
});

// 推荐
logger.debug('开始批量处理', { itemCount: items.length });
// 处理逻辑
logger.debug('完成批量处理', { processedCount: items.length });
```

### 9.2 日志级别不当

根据信息的重要性选择合适的日志级别：

```typescript
// 不推荐
logger.error('找不到配置项，使用默认值'); // 这不是错误，而是预期的回退行为

// 推荐
logger.info('使用默认配置', { reason: '配置项不存在' });
```

### 9.3 缺乏上下文

确保日志消息包含足够的上下文：

```typescript
// 不推荐
logger.error('操作失败');

// 推荐
logger.error('文档合并操作失败', { sourceDoc: docId, targetDoc: targetId, reason: 'schemaConflict' });
```

### 9.4 API一致性问题

确保使用的日志API与实际接口定义一致：

```typescript
// 错误 - Logger接口中不存在此方法
if (logger.isDebugEnabled()) {
  logger.debug('详细信息', { details: expensiveOperation() });
}

// 正确 - 使用已定义的接口方法
logger.debug('概要信息', { summary: cheapOperation() });

// 正确 - 使用外部变量控制详细日志
if (isVerboseLogging) {
  logger.debug('详细信息', { details: expensiveOperation() });
}
```

在开发时，务必查阅最新的接口定义，确保代码与实际实现保持一致。如果发现文档与接口不一致，应及时报告并更新文档，避免误导其他开发者。

## 10. 总结

良好的日志实践能够显著提高开发效率和系统可维护性。遵循本指南的建议，可以确保DPML项目中的日志既有助于开发调试，又能在生产环境中提供有价值的诊断信息。

记住以下核心原则：
- 使用命名日志器区分不同模块
- 选择适当的日志级别
- 提供结构化的上下文信息
- 正确处理和记录错误
- 考虑性能影响
- 不记录敏感信息

通过一致地应用这些原则，可以建立一个既有用又高效的日志系统。 