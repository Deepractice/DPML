/**
 * 转换提示 API
 */

import { NodeType, ErrorLevel } from '@dpml/core';


import { handlePromptError, TransformError, PromptErrorCode } from '../errors';
import { PromptTransformer } from '../transformers/promptTransformer';

import type { PromptTransformerOptions } from '../transformers/promptTransformer';
import type { ProcessedPrompt, TransformOptions } from '../types';
import type { Document } from '@dpml/core';

/**
 * 将处理后的提示转换为文本
 *
 * @param prompt 处理后的提示
 * @param options 转换选项
 * @returns 转换后的文本
 * @throws {TransformError} 转换过程中的错误
 */
export function transformPrompt(
  prompt: ProcessedPrompt,
  options: TransformOptions = {}
): string {
  // 检查输入是否有效
  if (!prompt || !prompt.tags) {
    throw TransformError.createInvalidInputError('无效的提示输入');
  }

  // 转换TransformOptions到PromptTransformerOptions
  const transformerOptions: PromptTransformerOptions = {
    // 格式模板转换
    formatTemplates: options.format,

    // 应用语言指令选项
    addLanguageDirective: options.addLanguageDirective,

    // 应用标签顺序
    tagOrder: options.tagOrder,

    // 使用提示元数据中的语言（如果有）
    lang: prompt.metadata?.lang,
  };

  try {
    // 创建转换器
    const transformer = new PromptTransformer(transformerOptions);

    // 转换为文本 - 需要将ProcessedPrompt适配为Document
    // 使用原始文档如果存在
    if (prompt.rawDocument) {
      return transformer.transform(prompt.rawDocument);
    }

    // 否则尝试构建一个简化的Document用于转换
    // 这是不完整的适配，实际项目中应更完整地处理
    const adaptedDocument: Document = {
      type: NodeType.DOCUMENT,
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
      children: [],
    };

    return transformer.transform(adaptedDocument);
  } catch (transformErr) {
    // 处理转换器特定错误
    if (transformErr instanceof Error) {
      throw TransformError.createFormatterError(
        'PromptTransformer',
        transformErr
      );
    }

    throw transformErr;
  }
}
