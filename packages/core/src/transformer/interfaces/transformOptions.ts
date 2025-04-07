/**
 * 转换选项接口
 * 
 * 定义转换过程的配置选项
 */
export interface TransformOptions {
  /**
   * 输出格式
   * 例如: 'json', 'string', 'object' 等
   */
  format?: string;
  
  /**
   * 转换模式
   * strict: 严格模式，任何错误都会中断转换
   * loose: 宽松模式，尝试处理错误并继续转换
   */
  mode?: 'strict' | 'loose';
  
  /**
   * 全局变量
   * 在整个转换过程中可用的变量
   */
  variables?: Record<string, any>;
  
  /**
   * 其他扩展选项
   * 允许添加自定义选项
   */
  [key: string]: any;
} 