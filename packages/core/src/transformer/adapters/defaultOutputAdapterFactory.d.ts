import { OutputAdapter } from '../interfaces/outputAdapter';
import { OutputAdapterFactory, OutputAdapterFactoryOptions } from '../interfaces/outputAdapterFactory';
/**
 * 默认的输出适配器工厂实现
 *
 * 管理适配器注册和获取
 */
export declare class DefaultOutputAdapterFactory implements OutputAdapterFactory {
    /**
     * 适配器映射
     * @private
     */
    private adapters;
    /**
     * 默认适配器名称
     * @private
     */
    private defaultAdapterName;
    /**
     * 是否严格匹配
     * @private
     */
    private strictMatching;
    /**
     * 构造函数
     * @param options 工厂配置选项
     */
    constructor(options?: OutputAdapterFactoryOptions);
    /**
     * 注册适配器
     *
     * @param name 适配器名称/类型
     * @param adapter 适配器实例或工厂函数
     */
    register(name: string, adapter: OutputAdapter | (() => OutputAdapter)): void;
    /**
     * 获取适配器
     *
     * @param format 输出格式名称
     * @returns 对应的适配器，如果未找到则返回默认适配器或null
     */
    getAdapter(format: string): OutputAdapter | null;
    /**
     * 检查是否支持指定格式
     *
     * @param format 输出格式名称
     * @returns 是否支持该格式
     */
    supportsFormat(format: string): boolean;
    /**
     * 获取所有已注册的适配器名称
     *
     * @returns 适配器名称数组
     */
    getRegisteredFormats(): string[];
    /**
     * 设置默认适配器
     *
     * @param name 适配器名称
     */
    setDefaultAdapter(name: string): void;
}
//# sourceMappingURL=defaultOutputAdapterFactory.d.ts.map