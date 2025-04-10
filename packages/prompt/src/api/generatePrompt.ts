/**
 * 生成提示 API
 */
import { PromptOptions, TransformOptions } from '../types';
import { processPrompt } from './processPrompt';
import { transformPrompt } from './transformPrompt';

/**
 * 一步生成提示文本
 * 
 * @param text DPML 提示文本
 * @param processOptions 处理选项
 * @param transformOptions 转换选项
 * @returns 生成的提示文本
 */
export async function generatePrompt(
  text: string, 
  processOptions?: PromptOptions, 
  transformOptions?: TransformOptions
): Promise<string> {
  try {
    // 处理提示
    const processed = await processPrompt(text, processOptions);
    
    // 如果只验证不生成文本，返回空字符串
    if (processOptions?.validateOnly) {
      return '';
    }
    
    // 转换为文本
    return transformPrompt(processed, transformOptions);
  } catch (err) {
    // 统一处理错误
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error('提示生成过程中发生未知错误');
    }
  }
} 