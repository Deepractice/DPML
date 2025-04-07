/**
 * 处理器模块入口
 * 
 * 提供处理DPML文档的功能
 */

// 导出接口
export * from '@core/processor/interfaces';

// 导出实现
export * from '@core/processor/defaultProcessor';
export * from '@core/processor/defaultReferenceResolver';

// 导出访问者
export * from '@core/processor/visitors';

// 导出协议处理器
export * from '@core/processor/protocols';

// 导出工厂函数
export * from '@core/processor/factory'; 