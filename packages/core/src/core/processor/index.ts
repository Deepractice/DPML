// 导出核心处理器模块
export { DefaultProcessor as defaultProcessor } from './defaultProcessor';
// 导出引用解析器
export { DefaultReferenceResolver as defaultReferenceResolver } from './defaultReferenceResolver';
// 导出工厂方法
export { createProcessor as factory } from './factory';
// 导出处理上下文
export { ProcessingContext as processingContext } from './processingContext';

// 错误处理相关
export * from './errors/errorHandler';
export * from './errors/processingError';

// 工具类导出
export * from './utils/memoryOptimizer';

// 标签处理器导出
export * from './tagProcessors/abstractTagProcessor'; 