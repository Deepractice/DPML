/**
 * 解析器配置选项接口
 * 控制解析器的行为和特性
 */
export interface ParserOptions {
  /**
   * 是否保留空白字符
   * @default false
   */
  preserveWhitespace?: boolean;

  /**
   * 文件编码
   * @default 'utf-8'
   */
  encoding?: string;

  /**
   * 是否在解析时进行验证
   * @default true
   */
  validateOnParse?: boolean;

  /**
   * 验证失败时是否抛出异常
   * @default true
   */
  throwOnError?: boolean;

  /**
   * 源文件名(parseFile时自动设置)
   */
  fileName?: string;
}
