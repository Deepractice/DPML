/**
 * 表示 Schema 验证过程中遇到的错误。
 * @template T 可选的泛型，用于携带额外的错误详情。
 */
export interface SchemaError<T = unknown> {
  /**
   * 错误描述信息，应清晰易懂。
   */
  message: string;
  /**
   * 错误代码，用于程序化识别错误类型。
   */
  code: string;
  /**
   * 错误在 Schema 对象中发生的路径。
   * 例如： "elements[0].attributes[1].name"
   */
  path: string;
  /**
   * 可选的额外错误详情。
   */
  details?: T;
}
