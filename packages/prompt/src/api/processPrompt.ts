/**
 * 处理提示 API
 */
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { parse, process as coreProcess } from '@dpml/core';
import { PromptOptions, ProcessedPrompt } from '../types';

/**
 * 处理 DPML 提示文本
 * 
 * @param text DPML 提示文本或文件路径
 * @param options 处理选项
 * @returns 处理后的提示结果
 */
export async function processPrompt(text: string, options: PromptOptions = {}): Promise<ProcessedPrompt> {
  try {
    // 检查输入是否为空
    if (!text || text.trim() === '') {
      throw new Error('输入为空');
    }
    
    // 确定输入是文本还是文件路径
    let dpmlText = text;
    
    // 如果输入像路径，尝试读取文件
    if ((text.trim().startsWith('/') || 
         text.trim().startsWith('./') || 
         text.trim().startsWith('../') || 
         /^[a-zA-Z]:\\/.test(text.trim()) || 
         text.trim().endsWith('.dpml')) && 
        !text.trim().includes('\n')) {
      try {
        const currentDir = typeof process !== 'undefined' ? process.cwd() : '.';
        const resolvedPath = path.resolve(options.basePath || currentDir, text);
        dpmlText = await fs.promises.readFile(resolvedPath, 'utf-8');
      } catch (err) {
        throw new Error(`读取文件失败: ${(err as Error).message}`);
      }
    }
    
    // 解析DPML文本
    const parseResult = await parse(dpmlText);
    
    // 处理选项
    const processOptions = {
      // 将mode映射到strictMode
      strictMode: options.mode === 'strict',
      // 其他选项直接传递
      validateOnly: options.validateOnly,
      basePath: options.basePath,
      // 添加mode属性以满足测试需求
      mode: options.mode
    };
    
    // 处理AST
    const processedDoc = await coreProcess(parseResult.ast, processOptions);
    
    // 构造符合ProcessedPrompt接口的对象
    const result: ProcessedPrompt = {
      metadata: processedDoc.metadata || {},
      tags: {},
      rawDocument: processedDoc
    };
    
    // 从processedDoc中提取标签内容
    if (processedDoc.children) {
      for (const child of processedDoc.children) {
        if (child.type === 'element' && 'tagName' in child) {
          const element = child as any; // 使用any暂时绕过类型检查
          result.tags[element.tagName] = {
            content: element.content || '',
            attributes: element.attributes || {},
            metadata: element.metadata || {}
          };
        }
      }
    }
    
    return result;
  } catch (err) {
    // 统一处理错误
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error('提示处理过程中发生未知错误');
    }
  }
} 