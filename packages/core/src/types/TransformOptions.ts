/**
 * 转换选项接口，配置转换过程
 */
export interface TransformOptions {
  /**
   * 初始上下文数据
   * 在转换开始前注入到上下文中
   */
  context?: Record<string, unknown>;

  /**
   * 结果模式选择
   * - 'full': 返回完整结果，包括transformers、merged和raw
   * - 'merged': 仅返回merged部分
   * - 'raw': 仅返回raw部分
   */
  resultMode?: 'full' | 'merged' | 'raw';

  /**
   * 包含的转换器
   * 如果提供，只有指定的转换器结果会被包含在最终结果中
   */
  include?: string[];

  /**
   * 排除的转换器
   * 如果提供，指定的转换器结果会被排除在最终结果外
   */
  exclude?: string[];
}
