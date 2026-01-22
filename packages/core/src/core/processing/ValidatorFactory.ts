import { DocumentValidator } from './DocumentValidator';

/**
 * 验证器配置选项接口
 */
export interface ValidatorOptions {
  /**
   * 是否进行严格验证
   * 在严格模式下，所有警告都会被视为错误
   */
  readonly strictMode?: boolean;

  /**
   * 是否忽略警告
   * 设置为true时，警告不会影响验证结果
   */
  readonly ignoreWarnings?: boolean;

  /**
   * 自定义验证错误处理行为
   * 可由用户提供额外的错误处理逻辑
   */
  readonly errorHandler?: (error: Error) => void;
}

/**
 * 验证器工厂类
 * 负责创建和配置DocumentValidator实例
 */
export class ValidatorFactory {
  /**
   * 创建验证器实例
   * @param options 验证器配置选项
   * @returns 配置好的DocumentValidator实例
   */
  public createValidator(options?: ValidatorOptions): DocumentValidator {
    // 创建新的验证器实例
    const validator = new DocumentValidator();

    // 应用配置选项
    if (options) {
      // 在这里，我们不直接修改validator实例
      // 因为DocumentValidator的当前实现不支持配置选项
      // 未来如果DocumentValidator支持配置，可以在这里应用选项

      // 如果有自定义错误处理函数并且发生错误，则触发它
      if (options.errorHandler) {
        try {
          // 验证器初始化相关代码（目前为空）
        } catch (error) {
          options.errorHandler(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    }

    return validator;
  }
}
