/**
 * 生成提示 API
 */
import { ErrorLevel } from '@dpml/core';

import { handlePromptError, PromptError, PromptErrorCode } from '../errors';

import { processPrompt } from './processPrompt';
import { transformPrompt } from './transformPrompt';

import type { PromptOptions, TransformOptions } from '../types';

/**
 * 一步生成提示文本
 *
 * @param text DPML 提示文本
 * @param processOptions 处理选项
 * @param transformOptions 转换选项
 * @returns 生成的提示文本
 * @throws {PromptError} 处理过程中的错误
 */
export async function generatePrompt(
  text: string,
  processOptions?: PromptOptions,
  transformOptions?: TransformOptions
): Promise<string> {
  // 验证输入
  if (!text || text.trim() === '') {
    throw new PromptError({
      code: PromptErrorCode.UNKNOWN_ERROR,
      message: '输入为空',
      level: ErrorLevel.ERROR,
    });
  }

  // 处理提示
  const processed = await processPrompt(text, processOptions);

  // 如果只验证不生成文本，返回空字符串
  if (processOptions?.validateOnly) {
    return '';
  }

  // 转换为文本
  return transformPrompt(processed, transformOptions);
}
