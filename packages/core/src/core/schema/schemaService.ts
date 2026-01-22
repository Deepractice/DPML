import type { ProcessedSchema } from '../../types/ProcessedSchema';
import type { Schema as UserSchema } from '../../types/Schema';

import { Schema } from './Schema';

/**
 * Schema 模块服务层。
 * 负责协调 Schema 处理流程，例如创建 Schema 业务类实例并调用其方法。
 * @param schema 用户提供的原始 Schema 对象。
 * @returns 处理后的 Schema 结果。
 * @template T 原始 Schema 对象的类型，默认为UserSchema。
 * @template R 处理结果的类型，默认为 ProcessedSchema<T>。
 * 注意：这是一个骨架函数，具体逻辑将在后续任务中实现。
 */
export function processSchema<
  T extends object = UserSchema,
  R extends ProcessedSchema<T> = ProcessedSchema<T>,
>(schema: T): R {
  // 创建 Schema 业务类实例
  const schemaInstance = createSchema();

  // 验证Schema
  const isValid = schemaInstance.validate(schema);

  // 如果无效，收集错误
  const errors = isValid ? undefined : schemaInstance.collectErrors(schema);

  // 组装并返回结果
  return {
    schema,
    isValid,
    errors,
  } as R;
}

/**
 * 创建Schema业务类实例
 * @returns Schema实例
 */
function createSchema(): Schema {
  return new Schema();
}
