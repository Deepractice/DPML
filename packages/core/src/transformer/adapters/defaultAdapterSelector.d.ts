import { OutputAdapter } from '../interfaces/outputAdapter';
import { TransformContext } from '../interfaces/transformContext';
import { AdapterSelector, AdapterSelectorOptions } from '../interfaces/adapterSelector';
import { OutputAdapterFactory } from '../interfaces/outputAdapterFactory';
/**
 * 默认适配器选择器
 *
 * 基于格式、上下文和结果选择合适的适配器
 */
export declare class DefaultAdapterSelector implements AdapterSelector {
    /**
     * 适配器工厂
     * @private
     */
    private factory;
    /**
     * 配置选项
     * @private
     */
    private options;
    /**
     * 构造函数
     *
     * @param factory 适配器工厂
     * @param options 选择器配置选项
     */
    constructor(factory: OutputAdapterFactory, options?: AdapterSelectorOptions);
    /**
     * 选择适配器
     *
     * 根据指定的格式、上下文和结果选择合适的适配器
     *
     * @param format 请求的格式，可以为null
     * @param context 转换上下文
     * @param result 可选的转换结果，用于根据内容推断格式
     * @returns 选择的适配器，如果找不到则返回默认适配器或null
     */
    selectAdapter(format: string | null, context: TransformContext, result?: any): OutputAdapter | null;
    /**
     * 设置配置选项
     *
     * @param options 选择器配置选项
     */
    configure(options: AdapterSelectorOptions): void;
    /**
     * 从上下文变量中获取格式
     *
     * @param context 转换上下文
     * @returns 格式或null
     * @protected
     */
    protected getFormatFromContext(context: TransformContext): string | null;
    /**
     * 从文档元数据中获取格式
     *
     * @param context 转换上下文
     * @returns 格式或null
     * @protected
     */
    protected getFormatFromMeta(context: TransformContext): string | null;
    /**
     * 从结果推断格式
     *
     * @param result 转换结果
     * @returns 推断的格式或null
     * @protected
     */
    protected inferFormatFromResult(result: any): string | null;
}
//# sourceMappingURL=defaultAdapterSelector.d.ts.map