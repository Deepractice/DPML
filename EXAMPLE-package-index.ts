/**
 * @dpml/core 包的主入口文件
 *
 * 这个文件手动维护，定义了@dpml/core包的公共API
 * 导出采用命名空间形式，避免命名冲突
 */

// 命名空间导出子模块
export * as parser from './parser';
export * as processor from './processor';
export * as transformer from './transformer';
export * as api from './api';

// 扁平导出类型 - 类型通常可以扁平导出以简化使用
export * from './types';

// 选择性导出工具函数
export {
  formatError,
  createLogger,
  // 只导出需要暴露的工具函数，而不是整个utils模块
} from './utils';

// 直接从文件导出特定内容
export { DpmlParser } from './parser/dpml-parser';
export { ProcessorManager } from './processor/processor-manager';

// 导出主要类/函数
export class Core {
  // 核心类实现...
}

// 导出版本信息
export const VERSION = '1.0.0';
