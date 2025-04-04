import { Element, SourcePosition } from '../../types/node';
import { ErrorCode } from '../../errors/types';

/**
 * 解析上下文接口
 */
export interface ParseContext {
  /**
   * 解析模式
   */
  parserMode?: string;
  
  /**
   * 文档语言
   */
  documentLang?: string;
  
  /**
   * ID注册表
   */
  idRegistry?: Map<string, Element>;
  
  /**
   * 当前节点
   */
  currentNode?: Element;
  
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
 * 核心属性处理器
 * 处理id、version、lang等核心属性
 */
export class CoreAttributeProcessor {
  /**
   * 验证ID属性的格式
   * @param id ID属性值
   * @returns 如果ID格式有效返回true，否则返回false
   */
  validateId(id: string): boolean {
    if (!id) {
      return false;
    }
    
    // ID格式：字母开头，允许字母、数字、下划线、连字符
    return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id);
  }
  
  /**
   * 验证版本格式
   * @param version 版本字符串
   * @returns 如果版本格式有效返回true，否则返回false
   */
  validateVersion(version: string): boolean {
    if (!version) {
      return false;
    }
    
    // 版本格式：主版本.次版本，如"1.0"
    return /^\d+\.\d+$/.test(version);
  }
  
  /**
   * 验证语言代码格式
   * @param lang 语言代码
   * @returns 如果语言代码格式有效返回true，否则返回false
   */
  validateLang(lang: string): boolean {
    if (!lang) {
      return false;
    }
    
    // 语言代码格式：ISO语言代码，如"zh-CN"
    // 符合ISO 639-1（语言）和ISO 3166-1（国家/地区）规范
    // 例如：en, en-US, zh-CN, fr-FR
    return /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?$/.test(lang);
  }
  
  /**
   * 处理根标签特殊属性
   * @param element 根元素
   * @param context 处理上下文
   */
  processRootAttributes(element: Element, context: ParseContext): void {
    // 处理version属性
    if (element.attributes.version) {
      if (!this.validateVersion(element.attributes.version)) {
        context.addWarning(
          'invalid-version',
          `无效的版本格式: "${element.attributes.version}"，应为"主版本.次版本"格式`,
          element.position
        );
      } else {
        // 设置解析器版本模式
        // 这里可以根据版本设置不同的解析行为
      }
    }
    
    // 处理lang属性
    if (element.attributes.lang) {
      if (!this.validateLang(element.attributes.lang)) {
        context.addWarning(
          'invalid-lang',
          `无效的语言代码: "${element.attributes.lang}"，应为ISO语言代码格式`,
          element.position
        );
      } else {
        // 设置文档语言
        context.documentLang = element.attributes.lang;
      }
    }
    
    // 处理mode属性
    if (element.attributes.mode) {
      this.processMode(element.attributes.mode, context);
    }
  }
  
  /**
   * 处理元素ID属性
   * @param element 元素
   * @param context 处理上下文
   */
  processElementId(element: Element, context: ParseContext): void {
    if (!element.attributes.id) {
      return;
    }
    
    const id = element.attributes.id;
    
    // 验证ID格式
    if (!this.validateId(id)) {
      context.addWarning(
        'invalid-id',
        `无效的ID格式: "${id}"，ID必须以字母开头，只能包含字母、数字、下划线和连字符`,
        element.position
      );
      return;
    }
    
    // 确保idRegistry存在
    if (!context.idRegistry) {
      context.idRegistry = new Map();
    }
    
    // 检查ID是否已存在
    if (context.idRegistry.has(id)) {
      if (context.addError) {
        context.addError(
          'duplicate-id',
          `重复的ID: "${id}" 已在文档中定义`,
          element.position
        );
      }
      return;
    }
    
    // 注册ID
    context.idRegistry.set(id, element);
  }
  
  /**
   * 处理mode属性
   * @param mode 模式值
   * @param context 处理上下文
   */
  private processMode(mode: string, context: ParseContext): void {
    if (mode !== 'strict' && mode !== 'loose') {
      context.addWarning(
        'invalid-mode',
        `无效的mode值: "${mode}"，使用默认值'loose'`,
        context.currentNode?.position
      );
      mode = 'loose';
    }
    
    context.parserMode = mode;
  }
  
  /**
   * 处理元素的所有核心属性
   * @param element 元素
   * @param context 处理上下文
   * @param isRoot 是否为根元素
   */
  processAttributes(element: Element, context: ParseContext, isRoot: boolean = false): void {
    // 设置当前节点
    const previousNode = context.currentNode;
    context.currentNode = element;
    
    try {
      // 处理ID属性
      this.processElementId(element, context);
      
      // 对根元素特殊处理
      if (isRoot) {
        this.processRootAttributes(element, context);
      }
    } finally {
      // 恢复先前的当前节点
      context.currentNode = previousNode;
    }
  }
} 