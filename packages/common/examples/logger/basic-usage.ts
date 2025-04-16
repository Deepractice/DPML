/**
 * 日志系统基本使用示例
 *
 * 这个示例演示了@dpml/common/logger的基本使用方法，包括：
 * - 创建日志记录器
 * - 设置日志级别
 * - 记录不同级别的日志
 * - 使用不同的格式化器
 * - 配置输出通道
 */

import {
  createLogger,
  LogLevel,
  TextFormatter,
  JsonFormatter,
  ConsoleTransport,
  MemoryTransport,
} from '../../src/logger';

// 创建日志记录器
const logger = createLogger('example-app');

// 设置日志级别 (默认为INFO)
logger.setLevel(LogLevel.DEBUG);

// 添加控制台输出 (默认彩色)
logger.addTransport(new ConsoleTransport({ colorize: true }));

// 添加内存输出 (用于测试或查看历史)
const memoryTransport = new MemoryTransport({ maxSize: 10 });

logger.addTransport(memoryTransport);

// 记录不同级别的日志
logger.debug('这是调试信息', { detail: '调试详情' });
logger.info('这是普通信息');
logger.warn('这是警告信息');
logger.error('这是错误信息', { code: 500, message: '服务器错误' });

// 查看内存中的日志
console.log('\n内存中的日志:');
console.log(memoryTransport.getLogs());

// 使用文本格式化器
console.log('\n使用文本格式化器:');
const textLogger = createLogger('text-format');

textLogger.setFormatter(
  new TextFormatter({
    template: '[{timestamp}] [{level}] [{packageName}]: {message}',
    showTimestamp: true,
    timestampFormat: 'HH:mm:ss',
  })
);
textLogger.addTransport(new ConsoleTransport({ colorize: false }));

textLogger.info('这是带时间戳的文本格式日志');
textLogger.warn('这是警告信息', { userId: 123 });

// 使用JSON格式化器
console.log('\n使用JSON格式化器:');
const jsonLogger = createLogger('json-format');

jsonLogger.setFormatter(new JsonFormatter({ pretty: true, includeMeta: true }));
jsonLogger.addTransport(new ConsoleTransport());

jsonLogger.info('这是JSON格式的日志', { userId: 456, action: 'login' });

// 使用日志上下文
console.log('\n使用日志上下文:');
const baseLogger = createLogger('auth-service');
const userLogger = baseLogger.withContext({
  userId: 'user-123',
  session: 'abc-xyz',
});

userLogger.info('用户登录'); // 包含userId和session上下文
userLogger.debug('检查权限', { resource: 'document-456' }); // 合并上下文和日志参数

// 运行示例
// pnpm tsx examples/logger/basic-usage.ts
