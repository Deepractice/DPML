/**
 * 错误处理模块导出
 */

// 错误基类
export * from './promptError';

// 特定错误类型
export * from './parseError';
export * from './validationError';
export * from './processingError';
export * from './transformError';

// 错误处理工具函数

/**
 * 统一处理提示错误
 * 
 * @param error 错误对象
 * @throws {PromptError} 转换后的提示错误
 */
export function handlePromptError(error: unknown): never {
  // 导入PromptError类
  const { PromptError } = require('./promptError');
  
  // 如果已经是PromptError类型，直接抛出
  if (error instanceof PromptError) {
    throw error;
  }
  
  // 其他错误转换为PromptError再抛出
  throw PromptError.fromError(error);
} 