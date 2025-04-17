import type { TagDefinition } from './TagDefinition';

/**
 * 标签注册表接口
 * 用于管理DPML标签定义的注册和查询
 */
export interface TagRegistry {
  /**
   * 注册标签定义
   * @param definition 标签定义
   */
  register(definition: TagDefinition): void;

  /**
   * 批量注册多个标签定义
   * @param definitions 标签定义数组
   */
  registerAll(definitions: TagDefinition[]): void;

  /**
   * 获取标签定义
   * @param tagName 标签名称
   * @returns 标签定义或null（找不到时）
   */
  getDefinition(tagName: string): TagDefinition | null;

  /**
   * 检查标签是否已注册
   * @param tagName 标签名称
   * @returns 是否已注册
   */
  hasTag(tagName: string): boolean;

  /**
   * 获取所有已注册的标签名称
   * @returns 标签名称数组
   */
  getAllTagNames(): string[];

  /**
   * 创建标签注册表的克隆
   * @returns 新的标签注册表实例（包含相同的定义）
   */
  clone(): TagRegistry;
}
