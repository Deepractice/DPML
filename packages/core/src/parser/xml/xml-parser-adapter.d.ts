import { XMLNode, XMLParserOptions } from './types';
/**
 * XML解析适配器，使用fast-xml-parser库
 */
export declare class XMLParserAdapter {
    /**
     * 底层XML解析器实例
     */
    private parser;
    /**
     * 位置跟踪选项
     */
    private trackPosition;
    /**
     * 构造函数，创建一个适配器实例
     * @param options 解析选项
     */
    constructor(options?: XMLParserOptions);
    /**
     * 解析XML文本
     * @param xml XML文本
     * @returns 解析后的XML节点树
     */
    parse(xml: string): XMLNode;
    /**
     * 计算每行的起始偏移量
     * @param lines 文本行数组
     * @returns 每行的起始偏移量数组
     */
    private calculateLineOffsets;
    /**
     * 验证XML格式
     * @param xml XML文本
     * @throws 格式错误时抛出异常
     */
    private validateXML;
    /**
     * 处理根元素
     * @param rootElement 解析后的根元素对象
     * @param xmlText 原始XML文本
     * @param lineOffsets 行偏移量数组
     * @returns XMLNode结构的根节点
     */
    private processRootElement;
    /**
     * 处理子元素
     * @param tagName 标签名
     * @param element 元素数据
     * @param xmlText 原始XML文本
     * @param lineOffsets 行偏移量数组
     * @returns 创建的子节点
     */
    private processChildElement;
    /**
     * 从偏移量获取行号
     * @param offset 字符偏移量
     * @param lineOffsets 行偏移量数组
     * @returns 行号（从1开始）
     */
    private getLineFromOffset;
    /**
     * 转换位置信息
     * @param positionData 位置数据
     * @returns 标准化的位置信息
     */
    private convertPosition;
    /**
     * 递归为子元素添加位置信息
     * @param children 子元素数组
     * @param xmlText 原始XML文本
     * @param lineOffsets 行偏移量数组
     */
    private addPositionToChildren;
}
//# sourceMappingURL=xml-parser-adapter.d.ts.map