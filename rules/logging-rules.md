# 日志使用规则

本文档定义了DPML项目的日志使用规则和最佳实践，基于`@dpml/common`包提供的日志系统。

## 日志系统概述

DPML项目使用统一的日志系统，由`@dpml/common`包中的`logger`模块提供支持。该系统具有以下特点：

1. **分级日志** - 支持DEBUG、INFO、WARN、ERROR四个级别
2. **可配置格式** - 支持文本和JSON格式输出
3. **多传输通道** - 支持控制台、文件和内存传输
4. **包级隔离** - 按包或模块名称进行日志隔离
5. **上下文元数据** - 支持添加额外的上下文信息
6. **自动捕获代码位置** - 记录函数名、文件名和行号信息

## 日志语言规范

**所有日志消息必须使用英文**，不允许使用中文或其他语言。这确保了：

1. 日志的国际化兼容性
2. 更好的日志搜索和过滤能力
3. 与代码保持语言一致性
4. 便于自动化工具处理

## 代码位置自动捕获

日志系统自动捕获并记录以下代码位置信息：

1. **文件名** - 记录日志调用所在的源文件名
2. **函数名** - 记录发起日志调用的函数或方法名称 
3. **行号** - 记录日志调用在源码中的精确行号

这些信息在日志消息中默认显示格式为：`[filename.ts:123] [functionName]`，便于快速定位代码位置。

### 示例输出

```
[2023-06-01T12:34:56.789Z] [parser] [INFO] [document-parser.ts:45] [parseDocument] Successfully parsed XML document, elements: 120
```

### 配置和自定义

可以通过文本格式化器选项自定义代码位置信息的显示：

```typescript
import { createLogger, TextFormatter } from '@dpml/common';

// 创建自定义文本格式化器
const formatter = new TextFormatter({
  // 隐藏代码位置信息
  showCodeLocation: false,
  
  // 隐藏函数名
  showFunctionName: false,
  
  // 自定义模板
  template: '[{timestamp}] [{level}] {message}'
});

// 创建使用自定义格式化器的日志记录器
const logger = createLogger('my-package', {
  formatter
});
```

## 日志级别使用规则

### DEBUG 级别
- **用途**：用于详细的调试信息，仅在开发环境启用
- **适用场景**：
  - 函数输入输出的详细信息
  - 算法内部状态和中间值
  - 流程执行路径跟踪
- **示例**：
  ```typescript
  logger.debug('Parsing XML document, input size:', data.length);
  logger.debug('Parser state:', { position: pos, line: lineNum });
  ```

### INFO 级别
- **用途**：记录正常的应用运行信息，默认级别
- **适用场景**：
  - 应用启动和初始化信息
  - 重要操作的执行开始和完成
  - 配置加载和变更信息
  - 定期统计信息
- **示例**：
  ```typescript
  logger.info('Parser initialized, supported formats:', formats);
  logger.info('Document processing completed, elements generated:', elementCount);
  ```

### WARN 级别
- **用途**：记录潜在问题或值得注意的异常情况
- **适用场景**：
  - 使用已废弃API
  - 性能下降和资源使用警告
  - 可恢复的错误条件
  - 接近限制的情况
- **示例**：
  ```typescript
  logger.warn('Config option "indentSize" is deprecated, use "tabSize" instead');
  logger.warn('Parsing time exceeded threshold', { expected: 100, actual: 350 });
  ```

### ERROR 级别
- **用途**：记录导致功能无法正常工作的错误
- **适用场景**：
  - 未捕获的异常
  - 关键功能失败
  - 外部服务不可用
  - 数据损坏或格式错误
- **示例**：
  ```typescript
  logger.error('Failed to parse document', err);
  logger.error('Unable to connect to remote service', { url, status, message });
  ```

## 日志记录最佳实践

### 1. 使用统一日志创建方式
```typescript
import { createLogger } from '@dpml/common';

// 包级别日志记录器
const logger = createLogger('package-name');

// 更具体的模块日志记录器
const parserLogger = createLogger('package-name:parser');
```

### 2. 结构化日志内容
- 使用简洁、结构化的日志消息
- 对象数据作为单独参数传递，而非字符串拼接
```typescript
// 推荐
logger.info('Parsing completed', { duration, elements: count });

// 避免
logger.info(`Parsing completed, took ${duration}ms, contains ${count} elements`);
```

### 3. 附加上下文信息
```typescript
// 创建带上下文的日志记录器
const logger = createLogger('package-name', {
  meta: {
    version: '1.0.0',
    environment: process.env.NODE_ENV
  }
});
```

### 4. 错误记录规范
```typescript
try {
  // 业务逻辑
} catch (err) {
  // 记录完整错误对象，而非仅message
  logger.error('Operation failed', err);
  
  // 如果需要，可以添加额外上下文
  logger.error('Operation failed', err, { operation: 'parse', inputSize });
}
```

### 5. 避免过度记录
- 避免在循环中大量记录日志
- 避免记录敏感信息（密码、令牌等）
- 高频操作使用采样记录
```typescript
// 采样记录示例
if (Math.random() < 0.01) { // 1%采样率
  logger.debug('High frequency operation details', { details });
}
```

### 6. 日志信息编写规范
- 使用简短、准确的英文描述
- 采用动词开头的主动语态
- 保持一致的命名约定和术语
- 在类似事件中使用相同的动词（started/completed，succeeded/failed）

```typescript
// 一致的动词使用
logger.info('Starting document processing', { docId });
logger.info('Completed document processing', { docId, duration });

// 错误的一致性
logger.info('Begin document processing', { docId });  // 不一致
logger.info('Document processing done', { docId });   // 不一致
```

## 生产环境日志配置

### 1. 日志级别设置
- 开发环境：DEBUG或INFO
- 测试环境：INFO
- 生产环境：WARN或INFO

```typescript
import { configureLogger, LogLevel } from '@dpml/common';

// 根据环境配置默认日志级别
configureLogger({
  level: process.env.NODE_ENV === 'production' 
    ? LogLevel.WARN 
    : LogLevel.INFO
});
```

### 2. 文件日志（仅服务端）
```typescript
import { configureLogger, createFileTransport } from '@dpml/common';

// 添加文件传输
configureLogger({
  transports: [
    createFileTransport({
      filePath: 'logs/app.log',
      maxSize: '10m',
      maxFiles: 5
    })
  ]
});
```

### 3. JSON格式化（适用于日志聚合系统）
```typescript
import { configureLogger, JsonFormatter } from '@dpml/common';

// 使用JSON格式化器
configureLogger({
  formatter: new JsonFormatter()
});
```

## 禁止使用的日志实践

1. **禁止使用console直接记录日志**
   ```typescript
   // 错误
   console.log('Processing completed');
   console.error('Error occurred', err);
   
   // 正确
   logger.info('Processing completed');
   logger.error('Error occurred', err);
   ```

2. **禁止记录无上下文的错误信息**
   ```typescript
   // 错误
   logger.error('Error');
   logger.error(err.message);
   
   // 正确
   logger.error('Operation X failed', err);
   ```

3. **禁止创建重复的日志记录器**
   ```typescript
   // 错误 - 每次调用都创建新记录器
   function process() {
     const logger = createLogger('package');
     logger.info('Processing');
   }
   
   // 正确 - 全局或模块级别创建一次
   const logger = createLogger('package');
   function process() {
     logger.info('Processing');
   }
   ```

4. **禁止使用非英文记录日志**
   ```typescript
   // 错误
   logger.info('处理完成');
   
   // 正确
   logger.info('Processing completed');
   ```

## 日志监控与分析

1. **定义关键日志指标**：
   - 错误率和类型分布
   - 关键操作执行时间
   - 资源使用情况

2. **错误日志分析流程**：
   - 收集生产环境ERROR级别日志
   - 按模块和错误类型分类
   - 设置关键错误告警阈值

3. **性能监控日志**：
   - 关键操作开始和结束配对日志
   - 包含执行时间和资源使用信息
   ```typescript
   const startTime = Date.now();
   logger.info('Started document processing', { docId });
   // 处理逻辑
   logger.info('Completed document processing', { 
     docId, 
     duration: Date.now() - startTime,
     memoryUsage: process.memoryUsage().heapUsed
   });
   ``` 