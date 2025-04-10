/**
 * @dpml/prompt API
 * 
 * 提供简洁易用的提示生成功能
 */
import { PromptTransformerOptions } from './transformers/promptTransformer';
import { generatePrompt as generatePromptImpl } from './api/generatePrompt';
import { processPrompt } from './api/processPrompt';
import { transformPrompt } from './api/transformPrompt';
import { PromptOptions } from './types';

/**
 * 生成提示选项
 */
export interface GeneratePromptOptions extends PromptTransformerOptions {
  /**
   * 解析选项
   */
  parseOptions?: any;
  
  /**
   * 处理选项
   */
  processOptions?: any;
  
  /**
   * 是否只验证，不生成输出
   */
  validateOnly?: boolean;
  
  /**
   * 基础路径，用于解析引用
   */
  basePath?: string;
  
  /**
   * 严格模式
   */
  strictMode?: boolean;
}

/**
 * 生成提示文本
 * 
 * 将DPML文本或文件转换为纯文本提示
 * 
 * @param input DPML文本或文件路径
 * @param options 选项
 * @returns 生成的提示文本
 */
export async function generatePrompt(
  input: string,
  options: GeneratePromptOptions = {}
): Promise<string> {
  // 转换选项格式并调用实现
  const processOptions: PromptOptions = {
    mode: options.strictMode ? 'strict' : 'loose',
    validateOnly: options.validateOnly,
    basePath: options.basePath,
    lang: options.lang
  };
  
  const transformOptions = {
    format: options.formatTemplates,
    addLanguageDirective: options.addLanguageDirective,
    tagOrder: options.tagOrder
  };
  
  return await generatePromptImpl(input, processOptions, transformOptions);
}

// 导出其他API函数
export { processPrompt, transformPrompt }; 