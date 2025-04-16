/**
 * 导入测试脚本
 *
 * 这个脚本用于测试@dpml/common包的导出结构
 */

// 测试从包根直接导入
import { createLogger, LogLevel, DPMLError, createDPMLError } from '../src';

// 测试从子路径导入
import { logger, types } from '../src';
import { TextFormatter, ConsoleTransport } from '../src/logger';

// 测试命名空间导入

// 创建日志记录器
const directLogger = createLogger('test-direct');

directLogger.setLevel(LogLevel.DEBUG);
directLogger.debug('这是从包根直接导入的测试');

// 使用命名空间创建日志记录器
const namespaceLogger = logger.createLogger('test-namespace');

namespaceLogger.info('这是使用命名空间导入的测试');

// 创建错误
const error = createDPMLError('测试错误', 'TEST_ERROR', { test: true });

console.log('错误:', error);

// 使用命名空间创建错误
const namespaceError = types.createDPMLError('命名空间测试错误', 'TEST_ERROR', {
  test: true,
});

console.log('命名空间错误:', namespaceError);

console.log('测试完成，所有导入方式都正常工作！');
