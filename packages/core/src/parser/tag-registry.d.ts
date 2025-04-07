import { TagDefinition } from './tag-definition';
/**
 * 标签注册表
 * 管理所有标签定义的注册和获取
 */
export declare class TagRegistry {
    /**
     * 存储标签定义的映射表
     * 键为标签名，值为标签定义
     */
    private tags;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 注册标签定义
     * @param tagName 标签名称
     * @param definition 标签定义
     */
    registerTagDefinition(tagName: string, definition: TagDefinition): void;
    /**
     * 获取标签定义
     * @param tagName 标签名称
     * @returns 标签定义，如果不存在则返回undefined
     */
    getTagDefinition(tagName: string): TagDefinition | undefined;
    /**
     * 检查标签是否已注册
     * @param tagName 标签名称
     * @returns 如果标签已注册则返回true，否则返回false
     */
    isTagRegistered(tagName: string): boolean;
    /**
     * 获取所有已注册的标签名称
     * @returns 标签名称数组
     */
    getAllTagNames(): string[];
    /**
     * 移除标签定义
     * @param tagName 标签名称
     * @returns 如果标签存在并被移除则返回true，否则返回false
     */
    removeTagDefinition(tagName: string): boolean;
    /**
     * 清空所有标签定义
     */
    clear(): void;
}
//# sourceMappingURL=tag-registry.d.ts.map