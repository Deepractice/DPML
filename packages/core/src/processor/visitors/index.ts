/**
 * 访问者模块入口
 * 
 * 提供各种节点访问者
 */

// 导出访问者实现
export * from './idValidationVisitor';
export * from './referenceVisitor';
export * from './documentMetadataVisitor';
export * from './inheritanceVisitor';

// 导出工厂函数
export * from './factory'; 