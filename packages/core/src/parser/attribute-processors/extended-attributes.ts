import { Element, SourcePosition } from '../../types/node';

/**
 * 扩展属性上下文接口
 */
export interface ExtendedContext {
  /**
   * 扩展属性表
   */
  extendedAttributes?: Map<Element, Record<string, any>>;
  
  /**
   * 添加警告
   */
  addWarning: (code: string, message: string, position?: SourcePosition) => void;
  
  /**
   * 添加错误
   */
  addError?: (code: string, message: string, position?: SourcePosition) => void;
}

/**
 * 属性值类型
 */
export interface AttributeValue {
  /**
   * 属性值
   */
  value: any;
  
  /**
   * 是否为条件表达式
   */
  conditional: boolean;
  
  /**
   * 条件表达式 (如果是条件属性)
   */
  expression?: string;
}

/**
 * 扩展属性处理器
 * 处理disabled、hidden等UI相关属性
 */
export class ExtendedAttributeProcessor {
  /**
   * 验证布尔属性值
   * @param value 属性值
   * @returns 如果值是有效的布尔值表示返回true
   */
  validateBoolean(value: string): boolean {
    // 有效的布尔值：true/false, 1/0, yes/no
    return /^(true|false|1|0|yes|no)$/i.test(value);
  }
  
  /**
   * 验证条件表达式
   * @param value 条件表达式
   * @returns 如果是有效的条件表达式返回true
   */
  validateConditional(value: string): boolean {
    // 条件表达式格式：${...}
    return /^\$\{.+\}$/.test(value);
  }
  
  /**
   * 解析布尔值字符串
   * @param value 布尔值字符串
   * @returns 解析后的布尔值
   */
  parseBoolean(value: string): boolean {
    return /^(true|1|yes)$/i.test(value);
  }
  
  /**
   * 解析条件表达式
   * @param value 条件表达式
   * @returns 表达式内容
   */
  parseConditional(value: string): string {
    // 提取${...}中的表达式内容
    const match = value.match(/^\$\{(.*)\}$/);
    return match ? match[1] : '';
  }
  
  /**
   * 处理disabled属性
   * @param element 元素
   * @param context 处理上下文
   */
  processDisabled(element: Element, context: ExtendedContext): void {
    if (!element.attributes.disabled) {
      return;
    }
    
    const value = element.attributes.disabled;
    
    // 确保extendedAttributes存在
    if (!context.extendedAttributes) {
      context.extendedAttributes = new Map();
    }
    
    // 获取或创建元素的扩展属性对象
    let attrs = context.extendedAttributes.get(element);
    if (!attrs) {
      attrs = {};
      context.extendedAttributes.set(element, attrs);
    }
    
    // 检查是否是条件表达式
    if (this.validateConditional(value)) {
      attrs.disabled = {
        value: value,
        conditional: true,
        expression: this.parseConditional(value)
      };
      return;
    }
    
    // 检查是否是有效的布尔值
    if (this.validateBoolean(value)) {
      attrs.disabled = {
        value: this.parseBoolean(value),
        conditional: false
      };
      return;
    }
    
    // 无效的属性值
    context.addWarning(
      'invalid-attribute',
      `无效的disabled属性值: "${value}"，应为布尔值或条件表达式`,
      element.position
    );
  }
  
  /**
   * 处理hidden属性
   * @param element 元素
   * @param context 处理上下文
   */
  processHidden(element: Element, context: ExtendedContext): void {
    if (!element.attributes.hidden) {
      return;
    }
    
    const value = element.attributes.hidden;
    
    // 确保extendedAttributes存在
    if (!context.extendedAttributes) {
      context.extendedAttributes = new Map();
    }
    
    // 获取或创建元素的扩展属性对象
    let attrs = context.extendedAttributes.get(element);
    if (!attrs) {
      attrs = {};
      context.extendedAttributes.set(element, attrs);
    }
    
    // 检查是否是条件表达式
    if (this.validateConditional(value)) {
      attrs.hidden = {
        value: value,
        conditional: true,
        expression: this.parseConditional(value)
      };
      return;
    }
    
    // 检查是否是有效的布尔值
    if (this.validateBoolean(value)) {
      attrs.hidden = {
        value: this.parseBoolean(value),
        conditional: false
      };
      return;
    }
    
    // 无效的属性值
    context.addWarning(
      'invalid-attribute',
      `无效的hidden属性值: "${value}"，应为布尔值或条件表达式`,
      element.position
    );
  }
  
  /**
   * 处理元素的所有扩展属性
   * @param element 元素
   * @param context 处理上下文
   */
  processAttributes(element: Element, context: ExtendedContext): void {
    // 处理disabled属性
    this.processDisabled(element, context);
    
    // 处理hidden属性
    this.processHidden(element, context);
    
    // 这里可以添加其他扩展属性的处理
  }
} 