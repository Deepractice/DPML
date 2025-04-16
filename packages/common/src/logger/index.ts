/**
 * 日志系统模块
 * 
 * 提供统一的日志接口和实现，支持多级别日志和不同输出目标。
 */

// 导出核心组件
export * from './core';

// 导出格式化器
export * from './formatters';

// 导出传输通道
export * from './transports';

// 辅助函数
import { LogLevel, loggerFactory } from './core';
import { isNodeEnvironment } from './core/environment';
import { FileTransport, FileTransportOptions } from './transports/file-transport';

/**
 * 创建日志记录器的便捷方法
 * 
 * @param name 包或模块名称
 * @param options 可选的日志选项
 * @returns 日志记录器实例
 */
export const createLogger = (name: string, options?: any) => {
  return loggerFactory.getLogger(name, options);
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
  
  const fileOptions = typeof options === 'string' 
    ? { filename: options } 
    : options;
    
  try {
    return new FileTransport(fileOptions);
  } catch (error) {
    console.error(`创建文件传输失败: ${(error as Error).message}`);
    return null;
  }
}; 