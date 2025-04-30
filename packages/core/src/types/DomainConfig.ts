/**
 * 领域配置接口，定义创建领域编译器所需的配置
 */
export interface DomainConfig {
  /**
   * 领域标识符
   * 用于在CLI和其他场景中标识领域
   */
  domain: string;

  /**
   * 领域描述
   * 用于在CLI和其他场景中描述领域
   */
  description?: string;

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

  /**
   * 领域命令配置
   * 用于定义领域特定的CLI命令
   */
  commands?: DomainCommandsConfig;
}

/**
 * 领域命令配置接口
 * 定义领域特定的CLI命令配置
 */
export interface DomainCommandsConfig {
  /**
   * 是否包含标准命令
   * 如果为true，将包含validate和parse等标准命令
   * 默认为false
   */
  includeStandard?: boolean;

  /**
   * 自定义领域命令
   * 定义领域特定的CLI命令
   */
  actions?: Array<DomainAction>;
}

// 导入相关类型
import type { CompileOptions } from './CompileOptions';
import type { DomainAction } from './DomainAction';
import type { Schema } from './Schema';
import type { Transformer } from './Transformer';
