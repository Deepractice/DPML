import { OutputAdapter } from '../interfaces/outputAdapter';
import { TransformContext } from '../interfaces/transformContext';
/**
 * XML适配器选项
 */
export interface XMLAdapterOptions {
    /**
     * 是否包含XML声明
     */
    xmlDeclaration?: boolean;
    /**
     * XML版本
     */
    xmlVersion?: string;
    /**
     * XML编码
     */
    xmlEncoding?: string;
    /**
     * 根元素名称
     */
    rootName?: string;
    /**
     * 是否美化输出
     */
    pretty?: boolean;
    /**
     * 缩进字符串
     */
    indent?: string;
    /**
     * 数组项名称
     */
    itemName?: string;
}
/**
 * XML输出适配器
 *
 * 将结果转换为XML字符串
 */
export declare class XMLAdapter implements OutputAdapter {
    /**
     * 适配器选项
     * @private
     */
    private options;
    /**
     * 构造函数
     * @param options 适配器选项
     */
    constructor(options?: XMLAdapterOptions);
    /**
     * 适配方法
     *
     * 将结果转换为XML字符串
     *
     * @param result 待适配的结果
     * @param context 转换上下文
     * @returns 适配后的结果，XML字符串
     */
    adapt(result: any, context: TransformContext): string;
    /**
     * 将值转换为XML字符串
     * @param value 待转换的值
     * @param nodeName 节点名称
     * @param level 当前缩进级别
     * @returns XML字符串
     * @private
     */
    private convertToXml;
    /**
     * 获取根元素名称
     * @param value 要转换的值
     * @returns 根元素名称
     * @private
     */
    private getRootElementName;
    /**
     * 获取指定级别的缩进字符串
     * @param level 缩进级别
     * @returns 缩进字符串
     * @private
     */
    private getIndent;
    /**
     * 转义XML特殊字符
     * @param str 要转义的字符串
     * @returns 转义后的字符串
     * @private
     */
    private escapeXml;
}
//# sourceMappingURL=xmlAdapter.d.ts.map