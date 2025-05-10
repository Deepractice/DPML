import type { Agent, AgentConfig, ChatInput, ChatOutput, Content } from '../types';
import { AgentError, AgentErrorType } from '../types';

import { AgentRunner } from './AgentRunner';
import { createClient } from './llm/llmFactory';
import { InMemoryAgentSession } from './session/InMemoryAgentSession';

/**
 * 创建符合Agent接口的实例
 *
 * @param config Agent配置
 * @returns Agent实例
 */
export function createAgent(config: AgentConfig): Agent {
  // 创建LLM客户端
  const llmClient = createClient(config.llm);

  // 创建会话管理器
  const session = new InMemoryAgentSession();

  // 创建AgentRunner实例
  const runner = new AgentRunner(config, llmClient, session);

  // 返回符合Agent接口的对象，使用闭包模式
  return {
    chat: (input: string | ChatInput) => handleChat(runner, input),
    chatStream: (input: string | ChatInput) => handleChatStream(runner, input)
  };
}

/**
 * 处理聊天请求
 */
async function handleChat(runner: AgentRunner, input: string | ChatInput): Promise<string> {
  try {
    // 标准化输入为ChatInput
    const chatInput = normalizeChatInput(input);

    // 发送消息并获取响应
    const response = await runner.sendMessage(chatInput, false);

    // 确保响应不是异步迭代器
    if (Symbol.asyncIterator in response) {
      throw new AgentError(
        '意外收到流式响应',
        AgentErrorType.UNKNOWN,
        'UNEXPECTED_STREAM_RESPONSE'
      );
    }

    // 提取回复中的文本内容
    return extractTextFromContent(response.content);
  } catch (error: unknown) {
    // 已经是AgentError则直接抛出
    if (error instanceof AgentError) {
      throw error;
    }

    // 否则包装为AgentError
    throw new AgentError(
      `聊天请求处理失败: ${error instanceof Error ? error.message : String(error)}`,
      AgentErrorType.UNKNOWN,
      'CHAT_PROCESSING_ERROR',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * 处理流式聊天请求
 */
async function* handleChatStream(runner: AgentRunner, input: string | ChatInput): AsyncIterable<string> {
  // 标准化输入为ChatInput
  const chatInput = normalizeChatInput(input);

  console.log('AgentService: 开始处理流式聊天请求');

  try {
    // 发送消息并获取流式响应
    console.log('AgentService: 向AgentRunner发送请求');
    const responseStream = await runner.sendMessage(chatInput, true);

    console.log('AgentService: 从AgentRunner获取响应');

    // 确保响应是异步迭代器
    if (!(Symbol.asyncIterator in responseStream)) {
      console.log('AgentService: 收到的不是流式响应，将作为单个文本块返回');
      // 如果收到单一响应而非流，也将其作为单个块返回
      const textContent = extractTextFromContent((responseStream as ChatOutput).content);

      console.log(`AgentService: 提取文本内容，长度 ${textContent.length}`);
      yield textContent;

      return;
    }

    // 处理流式响应
    console.log('AgentService: 开始处理流式响应');
    let chunkCount = 0;

    try {
      for await (const chunk of responseStream as AsyncIterable<ChatOutput>) {
        chunkCount++;
        // 提取每个块中的文本内容
        const textContent = extractTextFromContent(chunk.content);

        if (textContent) {
          console.log(`AgentService: 产出第${chunkCount}个响应块，长度 ${textContent.length}`);
          yield textContent;
        } else {
          console.log(`AgentService: 跳过第${chunkCount}个响应块，内容为空`);
        }
      }

      console.log(`AgentService: 流处理完成，共处理${chunkCount}个响应块`);
    } catch (streamError) {
      console.error(`AgentService: 流处理出错: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
      throw streamError; // 重新抛出错误以便上层处理
    }
  } catch (error: unknown) {
    // 已经是AgentError则直接抛出
    if (error instanceof AgentError) {
      throw error;
    }

    // 否则包装为AgentError
    const agentError = new AgentError(
      `流式聊天请求处理失败: ${error instanceof Error ? error.message : String(error)}`,
      AgentErrorType.UNKNOWN,
      'STREAM_PROCESSING_ERROR',
      error instanceof Error ? error : new Error(String(error))
    );

    console.error(`AgentService: ${agentError.message}`);
    throw agentError;
  }
}

/**
 * 将字符串或ChatInput标准化为ChatInput
 */
function normalizeChatInput(input: string | ChatInput): ChatInput {
  if (typeof input === 'string') {
    return {
      content: {
        type: 'text',
        value: input
      }
    };
  }

  return input;
}

/**
 * 从内容中提取文本
 */
function extractTextFromContent(content: Content): string {
  if (Array.isArray(content)) {
    // 寻找数组中的第一个文本内容
    const textItem = content.find(item => item.type === 'text');

    return textItem ? textItem.value as string : '';
  } else if (content.type === 'text') {
    // 直接返回文本内容
    return content.value as string;
  }

  return '';
}
