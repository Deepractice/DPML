/**
 * Framework模块内部类型定义
 * 这些类型只在Core层内部使用，不会暴露给API层
 */

import { ConfigurationError, CompilationError } from '../../types';
import type { CompileOptions } from '../../types/CompileOptions';
import type { DomainCompiler } from '../../types/DomainCompiler';
import type { Schema } from '../../types/Schema';
import type { Transformer } from '../../types/Transformer';

/**
 * 领域上下文接口
 * 定义领域编译器的内部状态结构
 */
export interface DomainContext {
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
   * 领域架构
   */
  schema: Schema;

  /**
   * 转换器数组
   */
  transformers: Array<Transformer<unknown, unknown>>;

  /**
   * 编译选项
   * 包含必填的编译选项，确保所有选项都有默认值
   */
  options: Required<CompileOptions> & {
    /**
     * 自定义选项默认为空对象
     */
    custom: Record<string, any>;
  };

  /**
   * 领域编译器实例
   * 在初始化时可能为空，在创建编译器后设置
   */
  compiler?: DomainCompiler<unknown>;
}

// 错误类型已移至Types层，从types模块导入使用
export { ConfigurationError, CompilationError };
