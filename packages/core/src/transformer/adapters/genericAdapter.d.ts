import { OutputAdapter } from '../interfaces/outputAdapter';
import { TransformContext } from '../interfaces/transformContext';
/**
 * 通用适配器选项
 */
export interface GenericAdapterOptions {
    /**
     * 自定义适配逻辑
     */
    customAdapter?: (result: any, context: TransformContext) => any;
}
/**
 * 通用输出适配器
 *
 * 保持输入结果结构不变，仅提供接口一致性
 */
export declare class GenericAdapter implements OutputAdapter {
    /**
     * 适配器选项
     * @private
     */
    private options;
    /**
     * 构造函数
     * @param options 适配器选项
     */
    constructor(options?: GenericAdapterOptions);
    /**
     * 适配方法
     *
     * 对于通用适配器，默认保持输入结果结构不变
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果
     */
    adapt(result: any, context: TransformContext): any;
}
//# sourceMappingURL=genericAdapter.d.ts.map