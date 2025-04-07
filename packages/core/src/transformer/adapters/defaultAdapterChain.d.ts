import { OutputAdapter } from '../interfaces/outputAdapter';
import { AdapterChain, AdapterChainOptions } from '../interfaces/adapterChain';
import { TransformContext } from '../interfaces/transformContext';
/**
 * 默认的适配器链实现
 *
 * 提供按顺序执行多个适配器的功能，支持多种链式模式和错误处理策略
 */
export declare class DefaultAdapterChain implements AdapterChain {
    /**
     * 适配器数组
     * @private
     */
    private adapters;
    /**
     * 链选项
     * @private
     */
    private options;
    /**
     * 构造函数
     * @param options 链配置选项
     */
    constructor(options?: AdapterChainOptions);
    /**
     * 添加适配器到链尾部
     *
     * @param adapter 要添加的适配器
     * @returns 适配器链本身，用于链式调用
     */
    add(adapter: OutputAdapter): AdapterChain;
    /**
     * 在指定索引位置插入适配器
     *
     * @param index 要插入的位置
     * @param adapter 要插入的适配器
     * @returns 适配器链本身，用于链式调用
     */
    insert(index: number, adapter: OutputAdapter): AdapterChain;
    /**
     * 移除指定索引位置的适配器
     *
     * @param index 要移除的适配器索引
     * @returns 被移除的适配器，如果索引无效则返回null
     */
    remove(index: number): OutputAdapter | null;
    /**
     * 获取链中的适配器数量
     *
     * @returns 适配器数量
     */
    getSize(): number;
    /**
     * 清空适配器链
     */
    clear(): void;
    /**
     * 获取链中的所有适配器
     *
     * @returns 适配器数组
     */
    getAdapters(): OutputAdapter[];
    /**
     * 适配结果
     *
     * 执行链中的所有适配器，根据配置的链式策略处理结果
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果
     */
    adapt(result: any, context: TransformContext): any;
    /**
     * 执行适配器链
     *
     * 这是对adapt方法的包装，但提供了更详细的控制和结果信息
     *
     * @param result 要适配的结果
     * @param context 转换上下文
     * @returns 链中每个适配器的结果数组
     */
    execute(result: any, context: TransformContext): any[];
}
//# sourceMappingURL=defaultAdapterChain.d.ts.map