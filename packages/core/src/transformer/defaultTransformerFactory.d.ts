import { Transformer } from './interfaces/transformer';
import { TransformerFactory } from './interfaces/transformerFactory';
import { TransformOptions } from './interfaces/transformOptions';
/**
 * 默认转换器工厂实现
 */
export declare class DefaultTransformerFactory implements TransformerFactory {
    /**
     * 创建转换器实例
     *
     * @param options 可选的转换选项，用于配置创建的转换器
     * @returns 转换器实例
     */
    createTransformer(options?: TransformOptions): Transformer;
}
//# sourceMappingURL=defaultTransformerFactory.d.ts.map