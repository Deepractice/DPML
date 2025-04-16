/**
 * 日志系统入口模块
 * 
 * 提供日志记录、格式化和传输功能
 */

// 导出核心类型和工厂
export * from './core/types';
export { loggerFactory } from './core/logger-factory';

// 导出传输实现
export { ConsoleTransport } from './transports/console-transport';
export { FileTransport } from './transports/file-transport';

// 导出格式化器
export { TextFormatter } from './formatters/text-formatter';
export { JsonFormatter } from './formatters/json-formatter';

// 导出测试帮助工具
export { _setEnvironmentOverrides, _resetEnvironmentOverrides } from './core/environment';

// 辅助函数
import { LogLevel } from './core/types';
import { loggerFactory } from './core/logger-factory';
import { isNodeEnvironment } from './core/environment';
import { FileTransport, FileTransportOptions } from './transports/file-transport';
import { ILogger } from './core/types';

/**
 * 创建日志记录器的便捷方法
 * 
 * @param nameOrOptions 包或模块名称，或选项对象
 * @param options 可选的日志选项
 * @returns 日志记录器实例
 */
export const createLogger = (nameOrOptions: string | any, options?: any): ILogger => {
  if (typeof nameOrOptions === 'string') {
    return loggerFactory.getLogger(nameOrOptions, options);
  } else {
    // 重新映射名称字段到packageName，以保持向后兼容
    const loggerOptions = {
      ...nameOrOptions,
      packageName: nameOrOptions.name
    };
    
    return loggerFactory.getLogger(nameOrOptions.name, loggerOptions);
  }
};

/**
 * 配置全局日志选项的便捷方法
 */
export const configureLogger = (options: any) => {
  loggerFactory.configure(options);
};

/**
 * 创建文件传输的便捷方法（仅在Node.js环境有效）
 * 
 * @param options 文件传输选项
 * @returns 文件传输实例或null（浏览器环境中）
 */
export const createFileTransport = (options: FileTransportOptions | string): FileTransport | null => {
  if (!isNodeEnvironment()) {
    return null;
  }
  
  const fileOptions: FileTransportOptions = typeof options === 'string' 
    ? { filePath: options } 
    : options;
    
  try {
    return new FileTransport(fileOptions);
  } catch (error) {
    console.error(`创建文件传输失败: ${(error as Error).message}`);
    return null;
  }
}; 