/**
 * ProcessorFactory
 *
 * 提供创建处理器实例的工厂函数
 */
import { ProcessorOptions } from './interfaces';
import { DefaultProcessor } from './defaultProcessor';
/**
 * 处理器工厂选项
 */
export interface ProcessorFactoryOptions extends ProcessorOptions {
    /**
     * 是否注册基础访问者
     */
    registerBaseVisitors?: boolean;
    /**
     * 是否注册基础协议处理器
     */
    registerBaseProtocolHandlers?: boolean;
    /**
     * 是否注册标签处理器访问者
     */
    registerTagProcessorVisitor?: boolean;
    /**
     * 是否使用严格模式
     */
    strictMode?: boolean;
}
/**
 * 创建默认处理器
 * @param options 处理器选项
 * @returns 处理器实例
 */
export declare function createProcessor(options?: ProcessorFactoryOptions): DefaultProcessor;
//# sourceMappingURL=factory.d.ts.map