/**
 * 编译选项接口，控制编译行为
 */
export interface CompileOptions {
  /**
   * 是否启用严格模式
   * 在严格模式下，会对文档结构进行更严格的验证
   */
  strictMode?: boolean;

  /**
   * 错误处理策略
   * - 'throw': 遇到错误时抛出异常
   * - 'warn': 遇到错误时记录警告但继续执行
   * - 'silent': 忽略错误并继续执行
   */
  errorHandling?: 'throw' | 'warn' | 'silent';

  /**
   * 转换选项
   * 控制转换过程的行为
   */
  transformOptions?: TransformOptions;

  /**
   * 自定义选项
   * 允许存储任意附加配置
   */
  custom?: Record<string, any>;
}

// 导入相关类型
import type { TransformOptions } from './TransformOptions';
