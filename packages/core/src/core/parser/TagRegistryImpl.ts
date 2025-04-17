/**
 * 标签注册表实现
 * 管理DPML标签定义的注册和查询
 */

import type { TagDefinition, TagRegistry } from '../../types';

/**
 * 标签注册表实现类
 * 管理DPML标签定义的注册和查询
 */
export class TagRegistryImpl implements TagRegistry {
  /**
   * 存储标签定义的映射表
   * 键为标签名（小写），值为标签定义
   */
  private definitions: Map<string, TagDefinition>;

  /**
   * 构造函数
   */
  constructor() {
    this.definitions = new Map<string, TagDefinition>();
  }

  /**
   * 注册标签定义
   * @param definition 标签定义
   */
  register(definition: TagDefinition): void {
    if (!definition.name) {
      throw new Error('标签定义必须包含名称');
    }

    // 标准化标签名称（小写）
    const normalizedName = definition.name.toLowerCase();

    // 存储标签定义
    this.definitions.set(normalizedName, { ...definition });
  }

  /**
   * 批量注册多个标签定义
   * @param definitions 标签定义数组
   */
  registerAll(definitions: TagDefinition[]): void {
    for (const definition of definitions) {
      this.register(definition);
    }
  }

  /**
   * 获取标签定义
   * @param tagName 标签名称
   * @returns 标签定义或null（找不到时）
   */
  getDefinition(tagName: string): TagDefinition | null {
    if (!tagName) {
      return null;
    }

    // 标准化标签名称（小写）
    const normalizedName = tagName.toLowerCase();

    // 获取标签定义
    const definition = this.definitions.get(normalizedName);

    return definition || null;
  }

  /**
   * 检查标签是否已注册
   * @param tagName 标签名称
   * @returns 是否已注册
   */
  hasTag(tagName: string): boolean {
    if (!tagName) {
      return false;
    }

    // 标准化标签名称（小写）
    const normalizedName = tagName.toLowerCase();

    // 检查标签是否存在
    return this.definitions.has(normalizedName);
  }

  /**
   * 获取所有已注册的标签名称
   * @returns 标签名称数组
   */
  getAllTagNames(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * 创建标签注册表的克隆
   * @returns 新的标签注册表实例（包含相同的定义）
   */
  clone(): TagRegistry {
    const clonedRegistry = new TagRegistryImpl();

    // 复制所有标签定义
    for (const [name, definition] of this.definitions.entries()) {
      clonedRegistry.definitions.set(name, { ...definition });
    }

    return clonedRegistry;
  }
}
