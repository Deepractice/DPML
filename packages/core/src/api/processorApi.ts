/**
 * 处理器API
 * 提供DPML文档处理功能
 */

import {
  defaultProcessor,
  defaultReferenceResolver,
  factory,
  processingContext
} from '../core/processor';

// 从错误处理模块导入错误类型
import { ErrorHandler } from '../core/processor/errors/errorHandler';
import { ProcessingError } from '../core/processor/errors/processingError';

// 导出处理器API
export {
  defaultProcessor,
  defaultReferenceResolver,
  factory,
  processingContext,
  ErrorHandler as errorHandler,
  ProcessingError as processingError
}; 