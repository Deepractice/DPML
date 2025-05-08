import type { ToolCallContext } from '../ToolCallContext';
import type { ToolCallPipeline } from '../ToolCallPipeline';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 递归处理器
 *
 * 处理多轮工具调用，根据需要递归调用管道。
 */
export class RecursiveProcessor implements ToolCallProcessor {
  /**
   * 管道引用
   */
  private _pipeline: ToolCallPipeline;

  /**
   * 最大递归深度
   */
  private readonly _maxRecursionDepth: number = 5;

  /**
   * 创建递归处理器
   *
   * @param pipeline 管道实例
   * @param maxRecursionDepth 最大递归深度，默认为5
   */
  constructor(pipeline: ToolCallPipeline, maxRecursionDepth: number = 5) {
    this._pipeline = pipeline;
    this._maxRecursionDepth = maxRecursionDepth;
  }

  /**
   * 处理递归逻辑
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 获取当前递归深度
      const currentDepth = newContext.recursionDepth || 0;

      // 设置或更新递归深度
      newContext.recursionDepth = currentDepth;

      // 检查是否有工具执行结果需要进一步处理
      if (this.shouldContinueProcessing(newContext)) {
        console.log(`检测到需要继续处理的工具结果，当前递归深度: ${currentDepth}`);

        // 检查是否超过最大递归深度
        if (currentDepth >= this._maxRecursionDepth) {
          console.log(`达到最大递归深度(${this._maxRecursionDepth})，停止递归`);

          // 设置最终响应
          newContext.finalResponse = {
            role: 'assistant',
            content: '达到最大工具调用深度，无法进一步处理。请尝试简化您的请求。'
          };

          return newContext;
        }

        // 准备新的上下文对象，继续处理
        const recursiveContext: ToolCallContext = {
          // 传递当前消息历史
          messages: [...newContext.messages],
          // 保持流设置
          stream: newContext.stream,
          // 保留工具列表
          tools: newContext.tools,
          // 递增递归深度
          recursionDepth: currentDepth + 1
        };

        console.log(`开始递归执行，新深度: ${recursiveContext.recursionDepth}`);

        // 递归执行管道
        const result = await this._pipeline.execute(recursiveContext);

        // 合并结果
        if (result.response) {
          newContext.response = result.response;
        }

        if (result.finalResponse) {
          newContext.finalResponse = result.finalResponse;
        }

        console.log('递归处理完成');

        return newContext;
      }

      console.log('不需要继续处理，完成递归');

      return newContext;
    } catch (error) {
      console.error('递归处理失败:', error);

      return context; // 失败时返回原始上下文
    }
  }

  /**
   * 判断是否需要继续处理
   *
   * @param context 工具调用上下文
   * @returns 是否继续处理
   */
  private shouldContinueProcessing(context: ToolCallContext): boolean {
    // 检查是否有工具执行结果
    if (!context.results || context.results.length === 0) {
      return false;
    }

    // 检查是否有成功的工具执行结果
    const hasSuccessfulResults = context.results.some(
      result => result.status === 'success'
    );

    // 如果有成功的工具执行结果，需要继续处理
    return hasSuccessfulResults;
  }
}
