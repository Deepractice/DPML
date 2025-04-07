/**
 * 节点类型枚举
 */
export var NodeType;
(function (NodeType) {
    NodeType["DOCUMENT"] = "document";
    NodeType["ELEMENT"] = "element";
    NodeType["CONTENT"] = "content";
    NodeType["REFERENCE"] = "reference";
})(NodeType || (NodeType = {}));
/**
 * 检查一个值是否为节点
 */
export function isNode(value) {
    return value !== null &&
        typeof value === 'object' &&
        typeof value.type === 'string' &&
        (value.type === NodeType.DOCUMENT ||
            value.type === NodeType.ELEMENT ||
            value.type === NodeType.CONTENT ||
            value.type === NodeType.REFERENCE) &&
        value.position !== undefined;
}
/**
 * 检查一个值是否为文档节点
 */
export function isDocument(value) {
    return isNode(value) &&
        value.type === NodeType.DOCUMENT &&
        Array.isArray(value.children);
}
/**
 * 检查一个值是否为元素节点
 */
export function isElement(value) {
    return isNode(value) &&
        value.type === NodeType.ELEMENT &&
        typeof value.tagName === 'string' &&
        typeof value.attributes === 'object' &&
        Array.isArray(value.children) &&
        (value.metadata === undefined ||
            typeof value.metadata === 'object');
}
/**
 * 检查一个值是否为内容节点
 */
export function isContent(value) {
    return isNode(value) &&
        value.type === NodeType.CONTENT &&
        typeof value.value === 'string';
}
/**
 * 检查一个值是否为引用节点
 */
export function isReference(value) {
    return isNode(value) &&
        value.type === NodeType.REFERENCE &&
        typeof value.protocol === 'string' &&
        typeof value.path === 'string';
}
//# sourceMappingURL=node.js.map