/**
 * 默认的输出适配器工厂实现
 *
 * 管理适配器注册和获取
 */
export class DefaultOutputAdapterFactory {
    /**
     * 构造函数
     * @param options 工厂配置选项
     */
    constructor(options) {
        this.adapters = new Map();
        this.defaultAdapterName = options?.defaultAdapter || null;
        this.strictMatching = options?.strictMatching || false;
    }
    /**
     * 注册适配器
     *
     * @param name 适配器名称/类型
     * @param adapter 适配器实例或工厂函数
     */
    register(name, adapter) {
        // 转换为小写，确保不区分大小写
        const normalizedName = name.toLowerCase();
        this.adapters.set(normalizedName, adapter);
    }
    /**
     * 获取适配器
     *
     * @param format 输出格式名称
     * @returns 对应的适配器，如果未找到则返回默认适配器或null
     */
    getAdapter(format) {
        // 转换为小写，确保不区分大小写
        const normalizedFormat = format.toLowerCase();
        const adapter = this.adapters.get(normalizedFormat);
        if (adapter) {
            // 如果是适配器实例，直接返回
            if (typeof adapter !== 'function') {
                return adapter;
            }
            // 如果是工厂函数，调用工厂函数创建实例
            return adapter();
        }
        // 如果未找到匹配的适配器
        if (this.strictMatching) {
            return null;
        }
        // 尝试使用默认适配器
        if (this.defaultAdapterName) {
            const defaultAdapter = this.adapters.get(this.defaultAdapterName.toLowerCase());
            if (defaultAdapter) {
                // 如果是适配器实例，直接返回
                if (typeof defaultAdapter !== 'function') {
                    return defaultAdapter;
                }
                // 如果是工厂函数，调用工厂函数创建实例
                return defaultAdapter();
            }
        }
        return null;
    }
    /**
     * 检查是否支持指定格式
     *
     * @param format 输出格式名称
     * @returns 是否支持该格式
     */
    supportsFormat(format) {
        // 转换为小写，确保不区分大小写
        const normalizedFormat = format.toLowerCase();
        return this.adapters.has(normalizedFormat);
    }
    /**
     * 获取所有已注册的适配器名称
     *
     * @returns 适配器名称数组
     */
    getRegisteredFormats() {
        return Array.from(this.adapters.keys());
    }
    /**
     * 设置默认适配器
     *
     * @param name 适配器名称
     */
    setDefaultAdapter(name) {
        this.defaultAdapterName = name;
    }
}
//# sourceMappingURL=defaultOutputAdapterFactory.js.map