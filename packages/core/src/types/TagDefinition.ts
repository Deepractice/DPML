import type { ContentModel } from './ContentModel';
import type { DPMLNode } from './DPMLNode';

/**
 * 标签定义接口
 * 用于配置DPML标签的行为和约束
 */
export interface TagDefinition {
  /**
   * 标签名称
   */
  name: string;

  /**
   * 内容模型，定义标签可以包含的内容类型
   */
  contentModel: ContentModel;

  /**
   * 允许的属性列表
   */
  allowedAttributes?: string[];

  /**
   * 必需的属性列表
   */
  requiredAttributes?: string[];

  /**
   * 允许的子标签列表
   */
  allowedChildren?: string[];

  /**
   * 禁止的子标签列表
   */
  forbiddenChildren?: string[];

  /**
   * 标签是否允许自闭合
   * @default true for EMPTY, false for others
   */
  selfClosing?: boolean;

  /**
   * 自定义验证函数
   * @param node 要验证的节点
   * @returns 验证成功返回true，失败返回string错误消息
   */
  validateFn?: (node: DPMLNode) => true | string;
}
