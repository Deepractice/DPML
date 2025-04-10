/**
 * @dpml/prompt API
 * 
 * 提供简洁易用的提示生成功能
 */
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { parse, process as dpmlProcess } from '@dpml/core';
import { PromptTransformer, PromptTransformerOptions } from './transformers/promptTransformer';
import { FormatTemplates } from './transformers/formatConfig';

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
  try {
    // 检查输入是否为空
    if (!input || input.trim() === '') {
      throw new Error('输入为空');
    }
    
    // 确定输入是文本还是文件路径
    let dpmlText = input;
    
    // 如果输入像路径，尝试读取文件
    if ((input.trim().startsWith('/') || input.trim().startsWith('./') || input.trim().startsWith('../') || /^[a-zA-Z]:\\/.test(input.trim()) || input.trim().endsWith('.dpml')) && !input.trim().includes('\n')) {
      try {
        const currentDir = typeof process !== 'undefined' ? process.cwd() : '.';
        const resolvedPath = path.resolve(options.basePath || currentDir, input);
        dpmlText = await fs.promises.readFile(resolvedPath, 'utf-8');
      } catch (err) {
        throw new Error(`读取文件失败: ${(err as Error).message}`);
      }
    }
    
    // 解析DPML
    const parseResult = await parse(dpmlText, options.parseOptions);
    
    // 处理AST
    const processedDoc = await dpmlProcess(parseResult.ast, options.processOptions);
    
    // 如果只需验证，直接返回空字符串
    if (options.validateOnly) {
      return '';
    }
    
    // 创建转换器
    const transformer = new PromptTransformer({
      formatTemplates: options.formatTemplates,
      lang: options.lang,
      addLanguageDirective: options.addLanguageDirective,
      tagOrder: options.tagOrder
    });
    
    // 转换为纯文本
    const result = transformer.transform(processedDoc);
    
    return result;
  } catch (err) {
    // 统一处理错误
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error('提示生成过程中发生未知错误');
    }
  }
} 