/**
 * 模式配置工具
 * 
 * 处理转换过程中的不同模式配置(严格/宽松)及相关行为
 */
import { TransformOptions } from '../interfaces/transformOptions';

/**
 * 模式配置选项
 */
export interface ModeConfigOptions {
  /**
   * 错误处理策略
   */
  errorHandling: 'throw' | 'continue' | 'warn';
  
  /**
   * 错误报告详细程度
   */
  errorVerbosity: 'minimal' | 'detailed' | 'debug';
  
  /**
   * 错误阈值
   * 连续出错次数超过阈值后的行为
   */
  errorThreshold: number;
  
  /**
   * 阈值超过后的行为
   */
  thresholdExceededAction: 'disable-visitor' | 'abort-transform';
}

/**
 * 默认严格模式配置
 */
export const DEFAULT_STRICT_MODE: ModeConfigOptions = {
  errorHandling: 'throw',
  errorVerbosity: 'detailed',
  errorThreshold: 0,
  thresholdExceededAction: 'abort-transform'
};

/**
 * 默认宽松模式配置
 */
export const DEFAULT_LOOSE_MODE: ModeConfigOptions = {
  errorHandling: 'warn',
  errorVerbosity: 'minimal',
  errorThreshold: 5,
  thresholdExceededAction: 'disable-visitor'
};

/**
 * 解析TransformOptions中的模式配置
 * 
 * @param options 转换选项
 * @returns 模式配置选项
 */
export function getModeConfig(options?: TransformOptions): ModeConfigOptions {
  // 如果未提供选项，使用默认宽松模式
  if (!options) {
    return DEFAULT_LOOSE_MODE;
  }
  
  // 根据mode选择基础配置
  const baseConfig = options.mode === 'strict' 
    ? DEFAULT_STRICT_MODE 
    : DEFAULT_LOOSE_MODE;
  
  // 合并自定义配置
  return {
    ...baseConfig,
    // 如果提供了自定义阈值，则覆盖默认值
    errorThreshold: options.errorThreshold !== undefined 
      ? options.errorThreshold 
      : baseConfig.errorThreshold,
  };
}

/**
 * 处理模式相关的错误
 * 
 * @param error 错误对象
 * @param config 模式配置
 * @param errorCount 当前错误计数
 * @returns 是否继续处理
 */
export function handleModeError(
  error: Error, 
  config: ModeConfigOptions,
  errorCount: number
): boolean {
  // 判断是否已超过错误阈值
  const isThresholdExceeded = config.errorThreshold > 0 && 
    errorCount > config.errorThreshold;
  
  // 如果超过阈值且配置为中止转换，返回false表示不继续
  if (isThresholdExceeded && config.thresholdExceededAction === 'abort-transform') {
    return false;
  }
  
  // 根据错误处理策略决定是否继续
  switch (config.errorHandling) {
    case 'throw':
      throw error;
    case 'warn':
      console.warn(`转换警告: ${error.message}`);
      return true;
    case 'continue':
      return true;
    default:
      return false;
  }
} 