/**
 * ReferenceVisitor
 * 
 * 用于处理引用节点和内容中的引用
 */

import { Content, Reference, NodeType } from '../../types/node';
import { NodeVisitor, ProcessingContext, ReferenceResolver } from '../interfaces';

/**
 * 引用访问者选项
 */
export interface ReferenceVisitorOptions {
  /**
   * 引用解析器
   */
  referenceResolver: ReferenceResolver;
  
  /**
   * 是否在内容中解析引用
   */
  resolveInContent?: boolean;
}

/**
 * 引用访问者
 * 处理引用节点和内容中的引用
 */
export class ReferenceVisitor implements NodeVisitor {
  /**
   * 访问者优先级
   */
  priority = 80;
  
  /**
   * 引用解析器
   */
  private referenceResolver: ReferenceResolver;
  
  /**
   * 是否在内容中解析引用
   */
  private resolveInContent: boolean;
  
  /**
   * 引用正则表达式
   * 匹配@开头的引用，支持以下格式：
   * - @id:some-id
   * - @file:./path/to/file.dpml
   * - @http://example.com/resource.dpml
   * - @https://example.com/resource.dpml
   */
  private readonly referenceRegex = /@((?:[a-zA-Z0-9._\-]+:)?[a-zA-Z0-9._\-\/\?=&%:]+(?:\.[a-zA-Z0-9]+)?(?:#[a-zA-Z0-9_\-]+)?)/g;
  
  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options: ReferenceVisitorOptions) {
    this.referenceResolver = options.referenceResolver;
    this.resolveInContent = options.resolveInContent ?? true;
  }
  
  /**
   * 处理引用节点
   * @param reference 引用节点
   * @param context 处理上下文
   * @returns 处理后的引用节点
   */
  async visitReference(reference: Reference, context: ProcessingContext): Promise<Reference> {
    // 解析引用
    const resolved = await this.referenceResolver.resolve(reference, context);
    
    // 设置resolved属性
    return {
      ...reference,
      resolved: resolved.value
    };
  }
  
  /**
   * 处理内容节点
   * @param content 内容节点
   * @param context 处理上下文
   * @returns 处理后的内容节点
   */
  async visitContent(content: Content, context: ProcessingContext): Promise<Content> {
    if (!this.resolveInContent) {
      return content;
    }
    
    // 查找内容中的引用
    const matches = [...content.value.matchAll(this.referenceRegex)];
    
    if (matches.length === 0) {
      return content;
    }
    
    let newValue = content.value;
    
    // 处理每个引用
    for (const match of matches) {
      const fullMatch = match[0]; // 完整匹配，如 @id:path
      const reference = match[1]; // 引用部分，如 id:path
      
      try {
        // 解析协议和路径
        let protocol = 'id'; // 默认为id协议
        let path = reference;
        
        // 处理URL类型引用 (http://, https://)
        if (reference.startsWith('http://') || reference.startsWith('https://')) {
          protocol = 'http';
          path = reference;
        }
        // 处理带有协议前缀的引用 (file:, id:)
        else if (reference.includes(':')) {
          const colonIndex = reference.indexOf(':');
          protocol = reference.substring(0, colonIndex);
          path = reference.substring(colonIndex + 1);
        }
        
        // 创建引用节点
        const refNode: Reference = {
          type: NodeType.REFERENCE,
          protocol,
          path,
          position: content.position // 使用内容节点的位置
        };
        
        // 解析引用
        const resolved = await this.referenceResolver.resolve(refNode, context);
        
        // 替换引用
        newValue = newValue.replace(fullMatch, this.formatResolvedValue(resolved.value));
      } catch (error) {
        // 引用解析失败，保留原始引用
        console.warn(`无法解析引用 ${fullMatch}: ${(error as Error).message}`);
      }
    }
    
    return {
      ...content,
      value: newValue
    };
  }
  
  /**
   * 格式化解析后的值
   * @param value 解析后的值
   * @returns 格式化后的字符串
   */
  private formatResolvedValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return Object.prototype.toString.call(value);
      }
    }
    
    return String(value);
  }
} 