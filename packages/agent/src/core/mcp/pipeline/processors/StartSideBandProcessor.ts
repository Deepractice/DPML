import type { ChatOutput } from '../../../../types';
import type { ToolCallContext } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 流分叉处理器
 *
 * 实现旁观者模式，处理流式内容分叉。
 */
export class StartSideBandProcessor implements ToolCallProcessor {
  /**
   * 处理分叉逻辑
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 检查是否为流式响应
      if (newContext.stream &&
          newContext.response &&
          Symbol.asyncIterator in (newContext.response as any)) {

        console.log('检测到流式响应，开始分叉处理');

        // 保存原始响应流
        const originalStream = newContext.response as AsyncIterable<ChatOutput>;

        // 创建流分叉
        const [userStream, processingStream] = this.forkStream(originalStream);

        // 用户流直接传递给上下文
        newContext.response = userStream;

        // 处理流用于后续处理
        this.monitorProcessingStream(processingStream)
          .catch(error => console.error('处理流监控错误:', error));
      } else {
        console.log('非流式响应，跳过分叉处理');
      }

      return newContext;
    } catch (error) {
      console.error('流分叉处理失败:', error);

      return context; // 失败时返回原始上下文
    }
  }

  /**
   * 创建流分叉
   *
   * @param originalStream 原始响应流
   * @returns [用户流, 处理流]
   */
  private forkStream(
    originalStream: AsyncIterable<ChatOutput>
  ): [AsyncIterable<ChatOutput>, AsyncIterable<ChatOutput>] {
    // 创建两个监听器数组
    const userListeners: Array<(value: ChatOutput) => void> = [];
    const processingListeners: Array<(value: ChatOutput) => void> = [];

    // 队列用于存储已经发送但尚未被消费的块
    const userQueue: ChatOutput[] = [];
    const processingQueue: ChatOutput[] = [];

    // 标志位表示流是否已经结束
    let isDone = false;
    let error: Error | null = null;

    // 启动异步任务处理原始流
    (async () => {
      try {
        for await (const chunk of originalStream) {
          // 向两个流发送数据
          this.pushToStream(chunk, userQueue, userListeners);
          this.pushToStream(chunk, processingQueue, processingListeners);
        }
      } catch (err) {
        error = err instanceof Error ? err : new Error(String(err));
      } finally {
        isDone = true;

        // 通知所有等待的监听器流已经结束
        userListeners.forEach(resolve => resolve(null as any));
        processingListeners.forEach(resolve => resolve(null as any));
      }
    })();

    // 创建用户流
    const userStream: AsyncIterable<ChatOutput> = {
      [Symbol.asyncIterator]() {
        return this.createIterator(userQueue, userListeners);
      },

      createIterator(queue: ChatOutput[], listeners: Array<(value: ChatOutput) => void>) {
        return {
          async next(): Promise<IteratorResult<ChatOutput>> {
            // 检查队列中是否有数据
            if (queue.length > 0) {
              return { done: false, value: queue.shift()! };
            }

            // 如果流已经结束并且没有更多数据，返回done
            if (isDone) {
              return { done: true, value: undefined as any };
            }

            // 如果出错，抛出错误
            if (error) {
              throw error;
            }

            // 等待新数据
            return new Promise<IteratorResult<ChatOutput>>(resolve => {
              const listener = (value: ChatOutput) => {
                if (value === null) {
                  // 流结束
                  resolve({ done: true, value: undefined as any });
                } else {
                  resolve({ done: false, value });
                }

                // 从监听器数组中移除自己
                const index = listeners.indexOf(listener);

                if (index !== -1) {
                  listeners.splice(index, 1);
                }
              };

              // 添加到监听器数组
              listeners.push(listener);
            });
          }
        };
      }
    } as AsyncIterable<ChatOutput>;

    // 创建处理流
    const processingStream: AsyncIterable<ChatOutput> = {
      [Symbol.asyncIterator]() {
        return {
          async next(): Promise<IteratorResult<ChatOutput>> {
            // 检查队列中是否有数据
            if (processingQueue.length > 0) {
              return { done: false, value: processingQueue.shift()! };
            }

            // 如果流已经结束并且没有更多数据，返回done
            if (isDone) {
              return { done: true, value: undefined as any };
            }

            // 如果出错，抛出错误
            if (error) {
              throw error;
            }

            // 等待新数据
            return new Promise<IteratorResult<ChatOutput>>(resolve => {
              const listener = (value: ChatOutput) => {
                if (value === null) {
                  // 流结束
                  resolve({ done: true, value: undefined as any });
                } else {
                  resolve({ done: false, value });
                }

                // 从监听器数组中移除自己
                const index = processingListeners.indexOf(listener);

                if (index !== -1) {
                  processingListeners.splice(index, 1);
                }
              };

              // 添加到监听器数组
              processingListeners.push(listener);
            });
          }
        };
      }
    } as AsyncIterable<ChatOutput>;

    return [userStream, processingStream];
  }

  /**
   * 向流发送数据
   */
  private pushToStream(
    chunk: ChatOutput,
    queue: ChatOutput[],
    listeners: Array<(value: ChatOutput) => void>
  ): void {
    if (listeners.length > 0) {
      // 有等待的监听器，直接发送数据
      const listener = listeners.shift()!;

      listener(chunk);
    } else {
      // 没有等待的监听器，加入队列
      queue.push(chunk);
    }
  }

  /**
   * 监控处理流
   *
   * @param stream 处理流
   */
  private async monitorProcessingStream(stream: AsyncIterable<ChatOutput>): Promise<void> {
    try {
      let fullContent = '';

      // 收集完整内容
      for await (const chunk of stream) {
        if (typeof chunk.content === 'string') {
          fullContent += chunk.content;
        } else {
          fullContent += JSON.stringify(chunk.content);
        }
      }

      console.log('收集到完整流内容');

      // 检测工具调用意图
      if (this.detectToolCallIntent(fullContent)) {
        console.log('检测到工具调用意图');
      }
    } catch (error) {
      console.error('处理流监控失败:', error);
    }
  }

  /**
   * 检测工具调用意图
   *
   * @param content 内容
   * @returns 是否包含工具调用意图
   */
  private detectToolCallIntent(content: string): boolean {
    // 检查常见的工具调用标记
    return (
      content.includes('<function_calls>') ||
      content.includes('<tool>') ||
      content.includes('function_call') ||
      content.includes('I need to use a tool')
    );
  }
}
