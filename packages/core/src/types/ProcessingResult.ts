import type { ProcessingContext } from './ProcessingContext';
import type { ReferenceMap } from './ReferenceMap';
import type { ValidationResult } from './ValidationResult';

/**
 * 处理结果接口
 * 包含文档处理的完整结果信息
 */
export interface ProcessingResult {
  /**
   * 处理上下文
   */
  readonly context: ProcessingContext;

  /**
   * 验证结果
   */
  readonly validation: ValidationResult;

  /**
   * 引用映射
   */
  readonly references?: ReferenceMap;

  /**
   * 扩展数据
   * 允许添加自定义的处理数据
   */
  readonly extensions?: Record<string, unknown>;
}
