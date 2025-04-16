import type { ValidationResult } from '../../errors/types';

/**
 * 属性定义接口
 * 定义单个属性的类型、是否必需等元数据
 */
export interface AttributeDefinition {
  /**
   * 属性类型
   */
  type?: string;

  /**
   * 是否必需
   */
  required?: boolean;

  /**
   * 默认值
   */
  default?: any;

  /**
   * 属性验证函数
   */
  validate?: (value: any) => boolean | string;
}

/**
 * 标签定义接口
 * 定义标签的属性规范、嵌套规则和验证规则
 */
export interface TagDefinition {
  /**
   * 标签名称
   * 通常在注册时提供，但也可以作为定义的一部分
   */
  name?: string;

  /**
   * 允许的属性
   * 可以是以下几种形式：
   * 1. 字符串数组（旧版本兼容）：attributes: ['id', 'class']
   * 2. 对象形式（推荐）：attributes: { id: { type: 'string', required: true } }
   * 3. 简化布尔对象：attributes: { id: true } 等同于 { id: { required: false } }
   */
  attributes?:
    | string[]
    | {
        [attributeName: string]: AttributeDefinition | boolean;
      };

  /**
   * 必需的属性列表
   * 为兼容旧版本而保留，建议使用attributes对象形式并设置required: true
   * @deprecated 推荐在attributes对象中设置required: true
   */
  requiredAttributes?: string[];

  /**
   * 允许的子标签列表
   * 如果未定义或为空数组，则标签不允许有子标签
   */
  allowedChildren?: string[];

  /**
   * 是否是自闭合标签（如<hr/>）
   * 默认为false
   */
  selfClosing?: boolean;

  /**
   * 内容格式，如markdown、html等
   */
  contentFormat?: string;

  /**
   * 标签验证器函数
   * 可用于实现更复杂的验证逻辑
   */
  validate?: (element: any, context: any) => ValidationResult;
} 