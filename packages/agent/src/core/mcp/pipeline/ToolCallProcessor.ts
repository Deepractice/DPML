import type { ToolCallContext } from './ToolCallContext';

/**
 * 工具调用处理器接口
 *
 * 定义处理工具调用的统一接口。
 */
export interface ToolCallProcessor {
  /**
   * 处理当前上下文并传递给下一个处理器
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  process(context: ToolCallContext): Promise<ToolCallContext>;
}
