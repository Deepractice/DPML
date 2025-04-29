/**
 * 领域配置接口，定义创建领域编译器所需的配置
 */
export interface DomainConfig {
  /**
   * 领域特定的架构定义
   */
  schema: Schema;

  /**
   * 转换器实例数组
   */
  transformers: Array<Transformer<unknown, unknown>>;

  /**
   * 可选的编译选项
   */
  options?: CompileOptions;
}

// 导入相关类型
import type { CompileOptions } from './CompileOptions';
import type { Schema } from './Schema';
import type { Transformer } from './Transformer';
