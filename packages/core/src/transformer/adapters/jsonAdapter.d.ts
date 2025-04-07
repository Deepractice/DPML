import { OutputAdapter } from '../interfaces/outputAdapter';
import { TransformContext } from '../interfaces/transformContext';
/**
 * JSON适配器选项
 */
export interface JSONAdapterOptions {
    /**
     * 缩进空格数，默认为0（不缩进）
     */
    indent?: number;
    /**
     * 自定义替换函数，用于控制哪些属性会被序列化
     */
    replacer?: (string | number)[] | ((key: string, value: any) => any);
}
/**
 * JSON输出适配器
 *
 * 将结果转换为JSON字符串
 */
export declare class JSONAdapter implements OutputAdapter {
    /**
     * 适配器选项
     * @private
     */
    private options;
    /**
     * 构造函数
     * @param options 适配器选项
     */
    constructor(options?: JSONAdapterOptions);
    /**
     * 适配方法
     *
     * 将结果转换为JSON字符串
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果，JSON字符串
     */
    adapt(result: any, context: TransformContext): string;
}
//# sourceMappingURL=jsonAdapter.d.ts.map