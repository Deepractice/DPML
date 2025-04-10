/**
 * 标签验证器
 * 提供对标签的嵌套规则、ID唯一性和结构验证功能
 */
import { TagRegistry } from '@dpml/core';

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
 * 标签验证器异常类
 */
export class TagValidationError extends Error {
  /**
   * 相关的标签名
   */
  tagName: string;
  
  /**
   * 相关的属性名
   */
  attribute: string | null;
  
  /**
   * 相关的属性值
   */
  value: any;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param info 错误相关信息
   */
  constructor(message: string, info: { tagName: string, attribute: string | null, value: any }) {
    super(message);
    this.name = 'TagValidationError';
    this.tagName = info.tagName;
    this.attribute = info.attribute;
    this.value = info.value;
  }
}

/**
 * 扩展TagRegistry的验证功能
 */
export class TagValidator {
  /**
   * 标签注册表实例
   */
  private registry: TagRegistry;
  
  /**
   * 构造函数
   * @param registry 标签注册表实例
   */
  constructor(registry: TagRegistry) {
    this.registry = registry;
  }
  
  /**
   * 验证标签的嵌套规则
   * @param parentTagName 父标签名
   * @param childTagName 子标签名
   * @returns 如果嵌套有效则返回true，否则返回false
   */
  validateNesting(parentTagName: string, childTagName: string): boolean {
    // 获取父标签定义
    const parentDef = this.registry.getTagDefinition(parentTagName);
    
    // 如果父标签不存在，则嵌套无效
    if (!parentDef) {
      return false;
    }
    
    // 如果子标签不存在，则嵌套无效
    if (!this.registry.isTagRegistered(childTagName)) {
      return false;
    }
    
    // 检查子标签是否在父标签的允许子标签列表中
    return parentDef.allowedChildren?.includes(childTagName) || false;
  }
  
  /**
   * 验证标签ID唯一性
   * @param document 标签节点文档
   * @throws 如果存在重复ID，则抛出TagValidationError
   * @returns 如果ID唯一性验证通过则返回true
   */
  validateIdUniqueness(document: Element): boolean {
    const idSet = new Set<string>();
    
    // 递归收集并验证所有ID
    const collectIds = (node: Element) => {
      // 如果节点有ID属性，则检查并添加到集合
      if (node.attributes && node.attributes.id) {
        const id = node.attributes.id as string;
        
        // 如果ID已经存在，则抛出错误
        if (idSet.has(id)) {
          throw new TagValidationError(`重复的ID: ${id}`, {
            tagName: node.tagName,
            attribute: 'id',
            value: id
          });
        }
        
        // 添加ID到集合
        idSet.add(id);
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          // 只检查元素节点
          if (child.type === 'element') {
            collectIds(child as Element);
          }
        }
      }
    };
    
    // 开始收集和验证ID
    collectIds(document);
    
    // 如果没有抛出错误，则验证通过
    return true;
  }
  
  /**
   * 验证标签内容格式
   * @param tagName 标签名
   * @param content 标签内容
   * @throws 如果标签不存在，则抛出TagValidationError
   * @returns 如果内容格式验证通过则返回true
   */
  validateContent(tagName: string, content: string): boolean {
    // 获取标签定义
    const tagDef = this.registry.getTagDefinition(tagName);
    
    // 如果标签不存在，则抛出错误
    if (!tagDef) {
      throw new TagValidationError(`未知标签: ${tagName}`, {
        tagName,
        attribute: null,
        value: null
      });
    }
    
    // 目前我们只支持markdown格式，后续可以添加更多的内容格式验证
    return true;
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
    // 获取标签定义
    const tagDef = this.registry.getTagDefinition(tagName);
    
    // 如果标签不存在，则抛出错误
    if (!tagDef) {
      throw new TagValidationError(`未知标签: ${tagName}`, {
        tagName,
        attribute: attrName,
        value: attrValue
      });
    }
    
    // 检查属性是否存在
    if (!tagDef.attributes || (typeof tagDef.attributes === 'object' && !Object.keys(tagDef.attributes).includes(attrName))) {
      throw new TagValidationError(`未知属性: ${attrName}`, {
        tagName,
        attribute: attrName,
        value: attrValue
      });
    }
    
    // 获取属性定义
    const attributes = tagDef.attributes;
    if (typeof attributes !== 'object' || Array.isArray(attributes)) {
      return true; // 如果属性是字符串数组形式，我们不做类型验证
    }
    
    const attrDef = attributes[attrName];
    if (!attrDef || typeof attrDef !== 'object') {
      return true; // 如果属性定义是简化形式，我们不做类型验证
    }
    
    // 验证属性值类型
    if ('type' in attrDef) {
      const attrType = attrDef.type || 'string';
      
      switch (attrType) {
        case 'string':
          if (typeof attrValue !== 'string') {
            throw new TagValidationError(`属性类型错误: ${attrName} 应为字符串`, {
              tagName,
              attribute: attrName,
              value: attrValue
            });
          }
          break;
        case 'number':
          if (typeof attrValue !== 'number') {
            throw new TagValidationError(`属性类型错误: ${attrName} 应为数字`, {
              tagName,
              attribute: attrName,
              value: attrValue
            });
          }
          break;
        case 'boolean':
          if (typeof attrValue !== 'boolean') {
            throw new TagValidationError(`属性类型错误: ${attrName} 应为布尔值`, {
              tagName,
              attribute: attrName,
              value: attrValue
            });
          }
          break;
        // 可以添加其他类型的验证
      }
    }
    
    // 如果没有抛出错误，则验证通过
    return true;
  }
  
  /**
   * 验证标签的必需属性
   * @param tagName 标签名
   * @param attributes 属性对象
   * @throws 如果缺少必需属性，则抛出TagValidationError
   * @returns 如果必需属性验证通过则返回true
   */
  validateRequiredAttributes(tagName: string, attributes: Record<string, any>): boolean {
    // 获取标签定义
    const tagDef = this.registry.getTagDefinition(tagName);
    
    // 如果标签不存在，则抛出错误
    if (!tagDef) {
      throw new TagValidationError(`未知标签: ${tagName}`, {
        tagName,
        attribute: null,
        value: null
      });
    }
    
    // 处理requiredAttributes数组
    if (tagDef.requiredAttributes && Array.isArray(tagDef.requiredAttributes)) {
      for (const attrName of tagDef.requiredAttributes) {
        if (!attributes || !(attrName in attributes)) {
          throw new TagValidationError(`缺少必需属性: ${attrName}`, {
            tagName,
            attribute: attrName,
            value: null
          });
        }
      }
    }
    
    // 处理attributes对象
    if (tagDef.attributes && typeof tagDef.attributes === 'object' && !Array.isArray(tagDef.attributes)) {
      for (const [attrName, attrDef] of Object.entries(tagDef.attributes)) {
        const isRequired = 
          (typeof attrDef === 'object' && 'required' in attrDef && attrDef.required === true);
          
        if (isRequired && (!attributes || !(attrName in attributes))) {
          throw new TagValidationError(`缺少必需属性: ${attrName}`, {
            tagName,
            attribute: attrName,
            value: null
          });
        }
      }
    }
    
    // 如果没有抛出错误，则验证通过
    return true;
  }
  
  /**
   * 验证整个标签结构
   * @param document 标签节点文档
   * @throws 如果结构验证失败，则抛出TagValidationError
   * @returns 如果结构验证通过则返回true
   */
  validateStructure(document: Element): boolean {
    // 验证ID唯一性
    this.validateIdUniqueness(document);
    
    // 递归验证标签嵌套和属性
    const validateNode = (node: Element) => {
      // 验证标签是否存在
      if (!this.registry.isTagRegistered(node.tagName)) {
        throw new TagValidationError(`未知标签: ${node.tagName}`, {
          tagName: node.tagName,
          attribute: null,
          value: null
        });
      }
      
      // 验证必需属性
      this.validateRequiredAttributes(node.tagName, node.attributes || {});
      
      // 验证所有属性
      if (node.attributes) {
        for (const [attrName, attrValue] of Object.entries(node.attributes)) {
          this.validateAttribute(node.tagName, attrName, attrValue);
        }
      }
      
      // 递归验证子标签
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          // 只验证元素节点
          if (child.type === 'element') {
            const childElement = child as Element;
            
            // 验证嵌套规则
            if (!this.validateNesting(node.tagName, childElement.tagName)) {
              throw new TagValidationError(`无效的标签嵌套: ${node.tagName} 不允许包含 ${childElement.tagName}`, {
                tagName: node.tagName,
                attribute: null,
                value: null
              });
            }
            
            // 递归验证子标签
            validateNode(childElement);
          }
        }
      }
    };
    
    // 开始验证
    validateNode(document);
    
    // 如果没有抛出错误，则验证通过
    return true;
  }
} 