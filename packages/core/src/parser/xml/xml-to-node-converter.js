import { NodeType } from '../../types/node';
import { ParseError } from '../../errors';
import { ErrorCode } from '../../errors/types';
/**
 * XML节点到DPML节点转换器
 */
export class XMLToNodeConverter {
    /**
     * 构造函数
     */
    constructor() {
        // 移除引用解析器初始化
    }
    /**
     * 将XML节点转换为DPML节点
     * @param xmlNode XML节点
     * @returns DPML节点
     */
    convert(xmlNode) {
        if (!xmlNode) {
            throw new ParseError({
                code: ErrorCode.UNKNOWN_ERROR,
                message: 'XML节点不能为空'
            });
        }
        // 根据XML节点名称决定转换为哪种DPML节点
        if (xmlNode.name.toLowerCase() === 'document') {
            return this.convertToDocument(xmlNode);
        }
        else {
            return this.convertToElement(xmlNode);
        }
    }
    /**
     * 将XML节点转换为Document节点
     * @param xmlNode XML节点
     * @returns Document节点
     */
    convertToDocument(xmlNode) {
        const document = {
            type: NodeType.DOCUMENT,
            position: this.convertPosition(xmlNode.position),
            children: []
        };
        // 转换子节点
        if (xmlNode.children && xmlNode.children.length > 0) {
            document.children = xmlNode.children.map(child => this.convertToElement(child));
        }
        return document;
    }
    /**
     * 将XML节点转换为Element节点
     * @param xmlNode XML节点
     * @returns Element节点
     */
    convertToElement(xmlNode) {
        const element = {
            type: NodeType.ELEMENT,
            tagName: xmlNode.name,
            position: this.convertPosition(xmlNode.position),
            attributes: xmlNode.attributes || {},
            children: []
        };
        // 处理XML节点的文本内容
        if (xmlNode.textContent !== undefined) {
            // 简化处理，直接创建文本内容节点
            const position = this.convertPosition(xmlNode.position);
            element.children.push(this.createContentNode(xmlNode.textContent, xmlNode.position));
        }
        // 处理子节点
        if (xmlNode.children && xmlNode.children.length > 0) {
            const childElements = xmlNode.children.map(child => this.convertToElement(child));
            element.children.push(...childElements);
        }
        return element;
    }
    /**
     * 创建Content节点
     * @param text 文本内容
     * @param position 位置信息
     * @returns Content节点
     */
    createContentNode(text, position) {
        return {
            type: NodeType.CONTENT,
            value: text,
            position: this.convertPosition(position)
        };
    }
    /**
     * 转换位置信息
     * @param position XML位置信息
     * @returns DPML位置信息
     */
    convertPosition(position) {
        if (!position) {
            // 默认位置信息
            return {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 1, offset: 0 }
            };
        }
        return {
            start: {
                line: position.start.line,
                column: position.start.column,
                offset: position.start.offset
            },
            end: {
                line: position.end.line,
                column: position.end.column,
                offset: position.end.offset
            }
        };
    }
}
//# sourceMappingURL=xml-to-node-converter.js.map