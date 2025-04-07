import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { TransformContext } from '../interfaces/transformContext';
import { cloneDeep } from 'lodash';
import { NodeType, Reference } from '../../types/node';

/**
 * 引用内联访问者配置
 */
export interface ReferenceInlineOptions {
  /**
   * 引用内联模式
   * - reference: 直接使用引用的内容（默认）
   * - clone: 创建引用内容的深拷贝
   */
  mode?: 'reference' | 'clone';

  /**
   * 是否在内联内容中添加来源信息
   */
  addSourceInfo?: boolean;
}

/**
 * 引用解析和内联访问者
 * 
 * 这个访问者负责处理引用节点，将引用的内容内联到当前文档中。
 * 支持以下功能：
 * 1. 处理已解析的引用，将引用内容内联
 * 2. 支持引用/克隆两种模式
 * 3. 递归处理引用内容中的引用
 * 4. 可选添加引用来源信息
 */
export class ReferenceInlineVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  readonly name: string = 'reference-inline';
  
  /**
   * 访问者优先级
   */
  priority: number;
  
  /**
   * 内联选项
   */
  private options: ReferenceInlineOptions;

  /**
   * 创建引用内联访问者
   * @param priority 优先级
   * @param options 内联选项
   */
  constructor(priority: number = 30, options: ReferenceInlineOptions = {}) {
    this.priority = priority;
    this.options = {
      mode: 'reference',
      addSourceInfo: false,
      ...options
    };
  }
  
  /**
   * 获取访问者优先级
   * @returns 优先级数值
   */
  getPriority(): number {
    return this.priority;
  }
  
  /**
   * 访问节点（通用）
   * @param node 节点
   * @param context 上下文
   * @returns 处理结果
   */
  visit(node: any, context: TransformContext): any {
    if (!node) {
      return null;
    }
    
    // 只处理引用节点
    if (node.type === NodeType.REFERENCE) {
      return this.visitReference(node, context);
    }
    
    // 其他类型节点原样返回
    return node;
  }

  /**
   * 访问引用节点
   * @param node 引用节点
   * @param context 转换上下文
   * @returns 转换后的内容
   */
  visitReference(node: Reference, context: TransformContext): any {
    // 如果引用未解析，返回原始节点
    if (!node.resolved) {
      return node;
    }

    // 获取引用内容（根据模式决定是引用还是克隆）
    let content = this.getResolvedContent(node);

    // 递归处理引用内容中的引用
    content = this.processResolvedContent(content, context);

    // 添加来源信息（如果配置了）
    if (this.options.addSourceInfo) {
      this.addSourceInfo(content, node);
    }

    return content;
  }

  /**
   * 获取解析后的内容
   * @param node 引用节点
   * @returns 解析后的内容
   */
  private getResolvedContent(node: Reference): any {
    if (this.options.mode === 'clone') {
      return cloneDeep(node.resolved);
    }
    return node.resolved;
  }

  /**
   * 处理解析后的内容，递归处理内部引用
   * @param content 解析后的内容
   * @param context 转换上下文
   * @returns 处理后的内容
   */
  private processResolvedContent(content: any, context: TransformContext): any {
    // 处理内容中的引用节点
    if (content && typeof content === 'object') {
      // 检查是否是引用节点
      if (content.type === NodeType.REFERENCE) {
        return this.visitReference(content, context);
      }

      // 处理对象的子节点
      if (Array.isArray(content.children)) {
        content.children = content.children.map((child: any) => 
          this.processResolvedContent(child, context)
        );
      }

      // 处理对象的其他属性
      for (const key in content) {
        if (key !== 'children' && typeof content[key] === 'object' && content[key] !== null) {
          content[key] = this.processResolvedContent(content[key], context);
        }
      }
    }

    return content;
  }

  /**
   * 添加引用来源信息
   * @param content 引用内容
   * @param reference 引用节点
   */
  private addSourceInfo(content: any, reference: Reference): void {
    if (content && typeof content === 'object') {
      // 初始化meta属性
      if (!content.meta) {
        content.meta = {};
      }

      // 添加来源信息
      content.meta.source = {
        protocol: reference.protocol,
        path: reference.path,
        reference: true
      };
    }
  }
} 