/**
 * DPML Core - Language specification and types
 * @packageDocumentation
 */

// 导出类型系统
export * from './types';

// 导出解析器模块，避免重复导出
import { DpmlAdapter, TagRegistry, ValidationError, ValidationWarningImpl } from './parser';
import type { TagDefinition, ValidationWarning } from './parser';

// 重新导出类型和类
export {
  DpmlAdapter,
  TagRegistry,
  // 从tag-definition重新导出，避免与errors重名
  ValidationError as ParserValidationError,
  ValidationWarningImpl
};

export type { TagDefinition, ValidationWarning };

// 导出处理器模块
export * from './processor';

// 导出转换器模块
export {
  DefaultTransformer,
  DefaultTransformerFactory
} from './transformer';

// 从transformer中导出接口
export type {
  Transformer,
  TransformerFactory,
  TransformOptions,
  TransformerVisitor,
  OutputAdapter,
  OutputAdapterFactory
} from './transformer';

// 导出错误模块
export * from './errors';

// 导出常量
export * from './constants';

// 导出API函数
export {
  parse,
  process
} from './api';

// 导出Warning接口
export type { Warning } from './api';