/**
 * 日志功能测试示例
 *
 * 运行方式:
 * ts-node packages/core/examples/logger-test.ts
 */

import { createLogger, TextFormatter } from '../../common/src/logger';

// 创建基本日志记录器
const logger = createLogger('core:examples');

// 创建一个自定义模板的日志记录器
const customLogger = createLogger('core:custom', {
  formatter: new TextFormatter({
    template: '[{timestamp}] [{level}] [{fileName}:{lineNumber}] {message}'
  })
});

// 创建一个禁用代码位置信息的日志记录器
const simpleLogger = createLogger('core:simple', {
  formatter: new TextFormatter({
    showCodeLocation: false,
    showFunctionName: false,
    template: '[{timestamp}] [{packageName}] [{level}] {message}'
  })
});

/**
 * 基本日志演示函数
 */
function demonstrateBasicLogging() {


  logger.debug('This is a debug message');
  logger.info('This is an info message');
  logger.warn('This is a warning message');
  logger.error('This is an error message');

  // 使用结构化数据
  logger.info('Processing completed', { duration: 120, itemsProcessed: 50 });
}

/**
 * 自定义格式日志演示函数
 */
function demonstrateCustomFormatting() {


  customLogger.info('Custom formatted log message');
  customLogger.error('Custom formatted error with data', { code: 500 });
}

/**
 * 简化格式日志演示函数
 */
function demonstrateSimpleLogging() {


  simpleLogger.info('Simple log without code location');
  simpleLogger.warn('Simple warning without function name');
}

/**
 * 嵌套调用演示函数
 */
function demonstrateNestedCalls() {


  function nestedFunction() {
    function deeplyNestedFunction() {
      logger.info('Log from deeply nested function');
    }

    logger.info('Log from nested function');
    deeplyNestedFunction();
  }

  logger.info('Log from outer function');
  nestedFunction();
}

/**
 * 类方法日志演示
 */
class LoggingDemo {
  private logger = createLogger('core:class-demo');

  public demonstrateClassLogging() {


    this.logger.info('Log from class method');
    this.helperMethod();
  }

  private helperMethod() {
    this.logger.info('Log from private helper method');
  }
}

// 执行所有演示



demonstrateBasicLogging();
demonstrateCustomFormatting();
demonstrateSimpleLogging();
demonstrateNestedCalls();

const demo = new LoggingDemo();

demo.demonstrateClassLogging();



