import type { SchemaError } from './SchemaError';

/**
 * 表示经过处理（验证）后的 Schema 定义结果。
 * @template T 原始 Schema 对象的类型。
 */
export interface ProcessedSchema<T extends object> {
  /**
   * 用户提供的原始 Schema 对象。
   */
  schema: T;
  /**
   * 指示 Schema 定义是否有效（是否通过了所有验证规则）。
   */
  isValid: boolean;
  /**
   * 如果 Schema 无效 (isValid 为 false)，则包含一个或多个 SchemaError 对象。
   * 如果 Schema 有效，则此属性为 undefined。
   */
  errors?: SchemaError[];
}
