/**
 * 增强版标签注册表
 * 扩展了TagRegistry的功能，集成了标签验证器
 */
import { TagRegistry } from '@dpml/core';
import { TagValidator } from './validator';

/**
 * Element 接口简化版
 */
interface Element {
  type: string;
  tagName: string;
  attributes: Record<string, any>;
  children: any[];
  content?: string;
}

/**
 * 增强版标签注册表
 * 扩展核心TagRegistry，提供嵌套规则验证、ID唯一性检查等功能
 */
export class EnhancedTagRegistry extends TagRegistry {
  /**
   * 标签验证器实例
   */
  private validator: TagValidator;
  
  /**
   * 构造函数
   */
  constructor() {
    // 调用父类构造函数
    super();
    
    // 创建验证器实例
    this.validator = new TagValidator(this);
  }
  
  /**
   * 验证标签嵌套规则
   * @param parentTagName 父标签名
   * @param childTagName 子标签名
   * @returns 如果嵌套有效则返回true，否则返回false
   */
  validateNesting(parentTagName: string, childTagName: string): boolean {
    return this.validator.validateNesting(parentTagName, childTagName);
  }
  
  /**
   * 验证标签ID唯一性
   * @param document 标签节点文档
   * @throws 如果存在重复ID，则抛出TagValidationError
   * @returns 如果ID唯一性验证通过则返回true
   */
  validateIdUniqueness(document: Element): boolean {
    return this.validator.validateIdUniqueness(document);
  }
  
  /**
   * 验证标签内容格式
   * @param tagName 标签名
   * @param content 标签内容
   * @throws 如果标签不存在，则抛出TagValidationError
   * @returns 如果内容格式验证通过则返回true
   */
  validateContent(tagName: string, content: string): boolean {
    return this.validator.validateContent(tagName, content);
  }
  
  /**
   * 验证标签属性
   * @param tagName 标签名
   * @param attrName 属性名
   * @param attrValue 属性值
   * @throws 如果标签或属性不存在，或属性值类型不匹配，则抛出TagValidationError
   * @returns 如果属性验证通过则返回true
   */
  validateAttribute(tagName: string, attrName: string, attrValue: any): boolean {
    return this.validator.validateAttribute(tagName, attrName, attrValue);
  }
  
  /**
   * 验证标签的必需属性
   * @param tagName 标签名
   * @param attributes 属性对象
   * @throws 如果缺少必需属性，则抛出TagValidationError
   * @returns 如果必需属性验证通过则返回true
   */
  validateRequiredAttributes(tagName: string, attributes: Record<string, any>): boolean {
    return this.validator.validateRequiredAttributes(tagName, attributes);
  }
  
  /**
   * 验证整个标签结构
   * @param document 标签节点文档
   * @throws 如果结构验证失败，则抛出TagValidationError
   * @returns 如果结构验证通过则返回true
   */
  validateStructure(document: Element): boolean {
    return this.validator.validateStructure(document);
  }
} 