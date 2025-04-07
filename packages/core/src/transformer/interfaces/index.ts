/**
 * Transformer 接口模块导出
 */

// 测试使用@core别名导入模块
import { Element } from '@core/types/node';

export * from './transformer';
export * from './transformerVisitor';
export * from './transformContext';
export * from './transformOptions';
export * from './adapterSelector';
export * from './outputAdapter';
export * from './outputAdapterFactory';
export * from './adapterChain';
export * from './tagProcessor';
export * from './tagProcessorRegistry';
export * from './transformerFactory';
export * from './outputProcessor'; 