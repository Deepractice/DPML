/**
 * 处理提示 API
 */
import { PromptOptions, ProcessedPrompt } from '../types';

/**
 * 处理 DPML 提示文本
 * 
 * @param text DPML 提示文本
 * @param options 处理选项
 * @returns 处理后的提示结果
 */
export function processPrompt(text: string, options?: PromptOptions): ProcessedPrompt {
  // 暂时返回一个空结果，后续实现
  return {
    metadata: {},
    tags: {}
  };
} 