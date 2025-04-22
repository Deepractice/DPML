import type { ProcessingError } from './ProcessingError';
import type { ProcessingWarning } from './ProcessingWarning';

/**
 * 验证结果接口
 * 包含文档验证结果的详细信息
 */
export interface ValidationResult {
  /**
   * 是否通过验证
   */
  readonly isValid: boolean;

  /**
   * 验证过程中发现的错误
   */
  readonly errors: ReadonlyArray<ProcessingError>;

  /**
   * 验证过程中发现的警告
   */
  readonly warnings: ReadonlyArray<ProcessingWarning>;
}
