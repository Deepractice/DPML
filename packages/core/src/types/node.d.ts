/**
 * 节点类型枚举
 */
export declare enum NodeType {
    DOCUMENT = "document",
    ELEMENT = "element",
    CONTENT = "content",
    REFERENCE = "reference"
}
/**
 * 源码位置信息
 */
export interface SourcePosition {
    start: {
        line: number;
        column: number;
        offset: number;
    };
    end: {
        line: number;
        column: number;
        offset: number;
    };
}
/**
 * 基础节点接口
 */
export interface Node {
    type: string;
    position: SourcePosition;
}
/**
 * 文档节点接口
 */
export interface Document extends Node {
    type: NodeType.DOCUMENT;
    children: Node[];
}
/**
 * 元素节点接口
 */
export interface Element extends Node {
    type: NodeType.ELEMENT;
    tagName: string;
    attributes: Record<string, any>;
    children: Node[];
    /**
     * 元素元数据
     * 用于存储处理过程中生成的语义信息和其他元数据
     */
    metadata?: Record<string, any>;
}
/**
 * 内容节点接口
 */
export interface Content extends Node {
    type: NodeType.CONTENT;
    value: string;
}
/**
 * 引用节点接口
 */
export interface Reference extends Node {
    type: NodeType.REFERENCE;
    protocol: string;
    path: string;
    resolved?: any;
}
/**
 * 检查一个值是否为节点
 */
export declare function isNode(value: any): value is Node;
/**
 * 检查一个值是否为文档节点
 */
export declare function isDocument(value: any): value is Document;
/**
 * 检查一个值是否为元素节点
 */
export declare function isElement(value: any): value is Element;
/**
 * 检查一个值是否为内容节点
 */
export declare function isContent(value: any): value is Content;
/**
 * 检查一个值是否为引用节点
 */
export declare function isReference(value: any): value is Reference;
//# sourceMappingURL=node.d.ts.map