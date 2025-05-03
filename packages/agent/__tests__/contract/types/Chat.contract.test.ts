/**
 * Chat Types契约测试
 *
 * 验证ChatInput和ChatOutput类型的结构稳定性。
 */
import { describe, test, expect } from 'vitest';

import type { ChatInput, ChatOutput, Content } from '../../../src/types';

describe('CT-Type-Chat', () => {
  test('CT-Type-Chat-01: ChatInput类型应符合公开契约', () => {
    // 创建单一内容项的ChatInput
    const textInput: ChatInput = {
      content: {
        type: 'text',
        value: '测试文本输入'
      }
    };

    // 创建多内容项的ChatInput
    const multimodalInput: ChatInput = {
      content: [
        {
          type: 'text',
          value: '这是文本和图片'
        },
        {
          type: 'image',
          value: new Uint8Array([1, 2, 3]),
          mimeType: 'image/jpeg'
        }
      ]
    };

    // 验证结构
    expect(textInput).toHaveProperty('content');
    expect(multimodalInput).toHaveProperty('content');

    // 验证类型兼容性
    const inputs: ChatInput[] = [textInput, multimodalInput];

    expect(inputs.length).toBe(2);
  });

  test('CT-Type-Chat-02: ChatOutput类型应符合公开契约', () => {
    // 创建单一内容项的ChatOutput
    const textOutput: ChatOutput = {
      content: {
        type: 'text',
        value: '测试文本输出'
      }
    };

    // 创建多内容项的ChatOutput
    const multimodalOutput: ChatOutput = {
      content: [
        {
          type: 'text',
          value: '以下是生成的图片:'
        },
        {
          type: 'image',
          value: new Uint8Array([1, 2, 3]),
          mimeType: 'image/png'
        }
      ]
    };

    // 验证结构
    expect(textOutput).toHaveProperty('content');
    expect(multimodalOutput).toHaveProperty('content');

    // 验证类型兼容性
    const outputs: ChatOutput[] = [textOutput, multimodalOutput];

    expect(outputs.length).toBe(2);
  });

  test('CT-Type-Chat-03: ChatInput和ChatOutput应支持相同的Content类型', () => {
    // 创建Content内容
    const textContent: Content = {
      type: 'text',
      value: '共享内容'
    };

    // 创建使用相同Content的输入和输出
    const input: ChatInput = { content: textContent };
    const output: ChatOutput = { content: textContent };

    // 验证输入和输出都能使用相同的Content
    expect(input.content).toBe(textContent);
    expect(output.content).toBe(textContent);

    // 验证内容类型的一致性
    const contentFromInput = input.content;
    const contentFromOutput = output.content;

    // 如果不是数组，应该有相同的类型和值
    if (!Array.isArray(contentFromInput) && !Array.isArray(contentFromOutput)) {
      expect(contentFromInput.type).toBe(contentFromOutput.type);
      expect(contentFromInput.value).toBe(contentFromOutput.value);
    }
  });

  test('CT-Type-Chat-04: ChatOutput应能用作AsyncIterable的返回值', () => {
    // 创建异步生成器函数返回ChatOutput
    async function* generateOutputs(): AsyncIterable<ChatOutput> {
      yield {
        content: {
          type: 'text',
          value: '第一个片段'
        }
      };

      yield {
        content: {
          type: 'text',
          value: '第二个片段'
        }
      };
    }

    // 验证异步迭代器的类型兼容性
    const generator = generateOutputs();

    expect(generator[Symbol.asyncIterator]).toBeDefined();
  });
});
