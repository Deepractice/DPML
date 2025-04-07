/**
 * Transformer 接口模块导出
 */

// 测试使用@core别名导入模块
import { Document } from '@core/types/node';

// 导出所有接口
export * from './adapterChain';
export * from './adapterSelector';
export * from './outputAdapter';
export * from './outputAdapterFactory';
export * from './outputProcessor';
export * from './tagProcessor';
export * from './tagProcessorRegistry';
export * from './transformContext';
export * from './transformerOptions';
export * from './transformOptions';
export * from './transformer';
export * from './transformerFactory';
export * from './transformerVisitor'; 