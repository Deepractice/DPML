import type { ToolCallContext } from './ToolCallContext';
import type { ToolCallProcessor } from './ToolCallProcessor';

/**
 * 工具调用管道
 *
 * 协调多个处理器执行工具调用流程。
 */
export class ToolCallPipeline {
  /**
   * 处理器列表
   */
  private _processors: ToolCallProcessor[] = [];

  /**
   * 添加处理器
   *
   * @param processor 处理器
   * @returns 管道实例，支持链式调用
   */
  public addProcessor(processor: ToolCallProcessor): ToolCallPipeline {
    this._processors.push(processor);

    return this;
  }

  /**
   * 执行整个处理链
   *
   * @param context 初始上下文
   * @returns 最终上下文
   */
  public async execute(context: ToolCallContext): Promise<ToolCallContext> {
    let currentContext = { ...context };

    // 顺序执行所有处理器
    console.log(`开始执行工具调用管道，共${this._processors.length}个处理器`);

    for (let i = 0; i < this._processors.length; i++) {
      const processor = this._processors[i];
      const processorName = processor.constructor.name;

      try {
        console.log(`执行处理器[${i + 1}/${this._processors.length}]: ${processorName}`);
        currentContext = await processor.process(currentContext);
        console.log(`处理器${processorName}执行完成`);
      } catch (error) {
        console.error(`处理器${processorName}执行失败:`, error);
        throw error;
      }
    }

    console.log('工具调用管道执行完成');

    return currentContext;
  }

  /**
   * 工厂方法创建管道
   *
   * @returns 新的管道实例
   */
  public static create(): ToolCallPipeline {
    return new ToolCallPipeline();
  }
}
