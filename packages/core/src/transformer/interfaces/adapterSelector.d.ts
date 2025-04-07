import { OutputAdapter } from './outputAdapter';
import { TransformContext } from './transformContext';
/**
 * 适配器选择器配置选项
 */
export interface AdapterSelectorOptions {
    /**
     * 上下文变量名，用于从上下文中获取格式
     */
    formatVariableName?: string;
    /**
     * 元数据属性名，用于从文档元数据中获取格式
     */
    metaFormatProperty?: string;
    /**
     * 是否启用格式推断
     */
    enableFormatInference?: boolean;
    /**
     * 严格匹配：如果为true，找不到适配器时返回null
     */
    strictMatching?: boolean;
}
/**
 * 适配器选择器
 *
 * 负责基于格式、上下文和结果选择合适的适配器
 */
export interface AdapterSelector {
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
}
//# sourceMappingURL=adapterSelector.d.ts.map