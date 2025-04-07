import { DefaultTransformer } from './defaultTransformer';
/**
 * 默认转换器工厂实现
 */
export class DefaultTransformerFactory {
    /**
     * 创建转换器实例
     *
     * @param options 可选的转换选项，用于配置创建的转换器
     * @returns 转换器实例
     */
    createTransformer(options) {
        const transformer = new DefaultTransformer();
        if (options) {
            transformer.configure(options);
        }
        return transformer;
    }
}
//# sourceMappingURL=defaultTransformerFactory.js.map