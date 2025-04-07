import { XMLNode } from './types';
import { Node } from '../../types/node';
/**
 * XML节点到DPML节点转换器
 */
export declare class XMLToNodeConverter {
    /**
     * 构造函数
     */
    constructor();
    /**
     * 将XML节点转换为DPML节点
     * @param xmlNode XML节点
     * @returns DPML节点
     */
    convert(xmlNode: XMLNode): Node;
    /**
     * 将XML节点转换为Document节点
     * @param xmlNode XML节点
     * @returns Document节点
     */
    private convertToDocument;
    /**
     * 将XML节点转换为Element节点
     * @param xmlNode XML节点
     * @returns Element节点
     */
    private convertToElement;
    /**
     * 创建Content节点
     * @param text 文本内容
     * @param position 位置信息
     * @returns Content节点
     */
    private createContentNode;
    /**
     * 转换位置信息
     * @param position XML位置信息
     * @returns DPML位置信息
     */
    private convertPosition;
}
//# sourceMappingURL=xml-to-node-converter.d.ts.map