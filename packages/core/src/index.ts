/**
 * DPML Core - Language specification and types
 * @packageDocumentation
 */

// 导出类型系统
export * from './types';

// 导出解析器模块，避免重复导出
export {
  DpmlAdapter,
  TagRegistry,
  TagDefinition,
  // 从tag-definition重新导出，避免与errors重名
  ValidationError as ParserValidationError,
  ValidationWarning
} from './parser';

// 导出处理器模块
export * from './processor';

// 导出转换器模块
export {
  DefaultTransformer,
  DefaultTransformerFactory,
  DefaultOutputAdapterFactory,
  DefaultOutputAdapter,
  JsonOutputAdapter,
  XmlOutputAdapter,
  MarkdownOutputAdapter
} from './transformer';

// 从transformer中导出接口
export type {
  Transformer,
  TransformerFactory,
  TransformerOptions,
  TransformOptions,
  TransformerVisitor,
  OutputAdapter,
  OutputAdapterFactory
} from './transformer';

// 导出错误模块
export * from './errors';

// 导出常量
export * from './constants'; 