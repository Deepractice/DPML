/**
 * DPML标签内容模型枚举
 * 定义标签可以包含的内容类型
 */
export enum ContentModel {
  /**
   * 空标签，不允许有内容或子标签
   * 示例: <empty-tag />
   */
  EMPTY = 'EMPTY',

  /**
   * 仅允许文本内容，不允许子标签
   * 示例: <text-tag>纯文本内容</text-tag>
   */
  CONTENT_ONLY = 'CONTENT_ONLY',

  /**
   * 仅允许子标签，不允许文本内容
   * 示例: <parent-tag><child-tag /></parent-tag>
   */
  CHILDREN_ONLY = 'CHILDREN_ONLY',

  /**
   * 允许混合内容，文本和子标签均可
   * 示例: <mixed-tag>文本<child-tag />更多文本</mixed-tag>
   */
  MIXED = 'MIXED'
}
