/**
 * Framework模块转换器索引
 * 导出转换器工厂和类型
 */

// 导出工厂函数
export {
  createStructuralMapper,
  createAggregator,
  createTemplateTransformer,
  createRelationProcessor,
  createSemanticExtractor,
  createResultCollector
} from './transformerFactory';

// 导出类型
export * from './types';
