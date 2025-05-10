import type { LLMClient } from '../../../llm/LLMClient';
import type { ToolCallContext } from '../ToolCallContext';
import type { ToolCallProcessor } from '../ToolCallProcessor';

/**
 * 对话入口处理器
 *
 * 负责首次向LLM发送请求并获取原始响应。
 */
export class ConversationEntryProcessor implements ToolCallProcessor {
  /**
   * 原始LLM客户端引用
   */
  private _originalClient: LLMClient;

  /**
   * 创建对话入口处理器
   *
   * @param originalClient 原始LLM客户端
   */
  constructor(originalClient: LLMClient) {
    this._originalClient = originalClient;
  }

  /**
   * 处理对话入口
   *
   * @param context 工具调用上下文
   * @returns 处理后的上下文
   */
  public async process(context: ToolCallContext): Promise<ToolCallContext> {
    try {
      // 创建新的上下文对象，不修改原对象
      const newContext = { ...context };

      // 检查递归深度，如果大于0表示已经有初始对话
      if (newContext.recursionDepth && newContext.recursionDepth > 0) {
        console.log(`跳过对话入口处理器，递归深度: ${newContext.recursionDepth}`);

        return newContext;
      }

      // 调用LLM获取响应
      console.log('开始向LLM发送请求...');
      let response = await this.callLLM(newContext.messages, newContext.stream);

      console.log('收到LLM响应');

      // 添加详细的响应调试信息
      console.log(`响应类型: ${typeof response}`);
      if (response === null) {
        console.log('警告: LLM响应为null');
      } else if (response === undefined) {
        console.log('警告: LLM响应为undefined');
      } else if (typeof response === 'object') {
        // 检查是否是异步迭代器
        if (Symbol.asyncIterator in response) {
          console.log('响应是异步迭代器');
          console.log('第一个响应块:');

          try {
            // 克隆迭代器以便获取第一个块进行调试
            const clonedResponse = this.cloneAsyncIterable(response);
            const iterator = clonedResponse[Symbol.asyncIterator]();
            const firstChunk = await iterator.next();

            if (!firstChunk.done) {
              console.log('第一块内容:', JSON.stringify(firstChunk.value, null, 2));
              // 替换响应为克隆的迭代器
              response = clonedResponse;
            } else {
              console.log('警告: 迭代器没有返回内容');
            }
          } catch (err) {
            console.log('无法预览异步迭代器内容:', err);
            // 不要改变原始响应
          }
        } else {
          // 常规对象
          console.log('响应内容:', JSON.stringify(response, null, 2));
        }
      } else {
        // 其他类型
        console.log(`响应值: ${String(response)}`);
      }

      // 更新上下文中的响应
      newContext.response = response;

      return newContext;
    } catch (error) {
      // 错误处理
      console.error('对话入口处理失败:', error);
      throw error; // 此处必须抛出错误，因为没有LLM响应无法继续处理
    }
  }

  /**
   * 调用LLM获取响应
   *
   * @param messages 消息列表
   * @param stream 是否流式输出
   * @returns LLM响应
   */
  private async callLLM(messages: Array<any>, stream: boolean): Promise<any> {
    return this._originalClient.sendMessages(messages, stream);
  }

  /**
   * 克隆异步迭代器以便进行调试而不消费原始迭代器
   *
   * @param asyncIterable 原始异步迭代器
   * @returns 克隆的异步迭代器
   */
  private cloneAsyncIterable<T>(asyncIterable: AsyncIterable<T>): AsyncIterable<T> {
    const buffer: Array<T> = [];
    let done = false;
    let error: any = null;

    // 立即开始读取原始迭代器并存储到缓冲区
    void (async () => {
      try {
        for await (const chunk of asyncIterable) {
          buffer.push(chunk);
        }
      } catch (err) {
        error = err;
      } finally {
        done = true;
      }
    })();

    // 返回新的迭代器
    return {
      [Symbol.asyncIterator]() {
        let index = 0;

        return {
          async next(): Promise<IteratorResult<T>> {
            // 如果已经读取完缓冲区且已完成，返回done
            if (index >= buffer.length && done) {
              return { done: true, value: undefined as any };
            }

            // 如果有错误，抛出错误
            if (error) {
              throw error;
            }

            // 等待缓冲区有数据或者读取完成
            while (index >= buffer.length && !done) {
              await new Promise(resolve => setTimeout(resolve, 10));
            }

            // 如果此时有错误，抛出错误
            if (error) {
              throw error;
            }

            // 如果读取完成且没有更多数据，返回done
            if (index >= buffer.length && done) {
              return { done: true, value: undefined as any };
            }

            // 返回缓冲区中的下一个数据
            return { done: false, value: buffer[index++] };
          }
        };
      }
    };
  }
}
