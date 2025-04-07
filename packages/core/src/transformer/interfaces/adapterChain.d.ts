import { OutputAdapter } from './outputAdapter';
import { TransformContext } from './transformContext';
/**
 * 适配器链配置选项
 */
export interface AdapterChainOptions {
    /**
     * 是否在链中的一个适配器返回null或undefined时停止执行
     */
    stopOnEmpty?: boolean;
    /**
     * 是否在链中的一个适配器抛出异常时停止执行
     */
    stopOnError?: boolean;
    /**
     * 每个适配器的输出是否作为下一个适配器的输入
     * 如果为true，则以链式方式处理结果
     * 如果为false，则每个适配器都处理原始输入
     */
    chainResults?: boolean;
}
/**
 * 适配器链接口
 *
 * 按顺序执行多个适配器，可以配置链式行为和错误处理
 */
export interface AdapterChain extends OutputAdapter {
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
//# sourceMappingURL=adapterChain.d.ts.map