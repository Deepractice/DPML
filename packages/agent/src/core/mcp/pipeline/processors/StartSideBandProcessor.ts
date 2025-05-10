import type { ChatOutput } from '../../../../types';
import type { ToolCallContext } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 流分叉处理器
 *
 * 实现旁观者模式，确保流式内容正确分发到用户和处理管道。
 * 使用内存中数组缓存数据，确保数据不丢失。
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

        console.log('MCP流处理: 检测到流式响应，准备分流');

        // 获取原始响应流
        const originalStream = newContext.response as AsyncIterable<ChatOutput>;

        // 创建共享缓冲区和状态
        const sharedBuffer: ChatOutput[] = [];
        let isComplete = false;
        let streamError: Error | null = null;

        // 启动数据收集器（不等待完成）
        void (async () => {
          try {
            console.log('MCP流处理: 开始收集原始流数据');
            let processedChunks = 0;

            for await (const chunk of originalStream) {
              processedChunks++;
              sharedBuffer.push({ ...chunk }); // 复制一份以防止引用问题
              console.log(`MCP流处理: 收集到第${processedChunks}个数据块`);
            }

            console.log(`MCP流处理: 原始流收集完成，共${processedChunks}个数据块`);
          } catch (error) {
            console.error('MCP流处理: 流收集错误:', error);
            streamError = error instanceof Error ? error : new Error(String(error));
          } finally {
            isComplete = true;
            console.log('MCP流处理: 标记流处理完成');
          }
        })();

        // 创建新的用户流
        let userStreamCount = 0;

        const userStream: AsyncIterable<ChatOutput> = {
          [Symbol.asyncIterator]() {
            return {
              async next(): Promise<IteratorResult<ChatOutput>> {
                // 检查是否有错误
                if (streamError) {
                  console.error('MCP用户流: 传递上游错误');
                  throw streamError;
                }

                // 等待数据或流结束
                while (sharedBuffer.length <= userStreamCount && !isComplete) {
                  await new Promise(resolve => setTimeout(resolve, 10));

                  // 再次检查错误
                  if (streamError) {
                    console.error('MCP用户流: 等待过程中发现错误');
                    throw streamError;
                  }
                }

                // 如果缓冲区中有数据
                if (userStreamCount < sharedBuffer.length) {
                  const chunk = sharedBuffer[userStreamCount++];

                  console.log(`MCP用户流: 返回第${userStreamCount}个数据块`);

                  return { done: false, value: chunk };
                }

                // 如果流已结束且没有更多数据
                if (isComplete) {
                  console.log('MCP用户流: 流结束');

                  return { done: true, value: undefined as any };
                }

                // 这种情况理论上不应该发生
                console.warn('MCP用户流: 意外状态 - 既没有更多数据也没标记完成');

                return { done: true, value: undefined as any };
              }
            };
          }
        };

        // 创建处理流并立即启动处理（不等待结果）
        void (async () => {
          try {
            console.log('MCP处理流: 开始分析内容');
            let fullContent = '';

            // 分析所有数据块
            for (let i = 0; i < sharedBuffer.length || !isComplete; i++) {
              // 等待数据
              while (i >= sharedBuffer.length && !isComplete) {
                await new Promise(resolve => setTimeout(resolve, 20));
              }

              // 如果流结束且没有更多数据，退出循环
              if (i >= sharedBuffer.length && isComplete) {
                break;
              }

              // 提取内容
              const chunk = sharedBuffer[i];

              if (typeof chunk.content === 'string') {
                fullContent += chunk.content;
              } else if (Array.isArray(chunk.content)) {
                const textItems = chunk.content.filter(item => item.type === 'text');

                fullContent += textItems.map(item => item.value).join('');
              } else if (chunk.content && typeof chunk.content === 'object' && chunk.content.type === 'text') {
                fullContent += chunk.content.value;
              }
            }

            console.log('MCP处理流: 内容分析完成');
            this.detectToolCallIntent(fullContent);
          } catch (error) {
            console.error('MCP处理流: 分析出错', error);
          }
        })();

        // 替换上下文中的响应流
        newContext.response = userStream;
        console.log('MCP流处理: 已替换上下文中的响应流');
      }

      return newContext;
    } catch (error) {
      console.error('MCP流处理: 处理失败', error);

      return context; // 失败时返回原始上下文
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
    const hasToolCall = (
      content.includes('<function_calls>') ||
      content.includes('<tool>') ||
      content.includes('function_call') ||
      content.includes('I need to use a tool')
    );

    if (hasToolCall) {
      console.log('MCP处理流: 检测到工具调用意图');
    }

    return hasToolCall;
  }
}
