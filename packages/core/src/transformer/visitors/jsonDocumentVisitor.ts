import { TransformerVisitor } from '../interfaces/transformerVisitor';
import { TransformContext } from '../interfaces/transformContext';
import { Document, Element, Content, NodeType, Node } from '../../types/node';
import { ProcessedDocument } from '../../processor/interfaces/processor';

/**
 * JSON文档访问器
 * 
 * 负责将DPML文档结构转换为JSON格式
 */
export class JSONDocumentVisitor implements TransformerVisitor {
  /**
   * 访问者名称
   */
  name = 'JSONDocumentVisitor';
  
  /**
   * 访问者优先级
   */
  priority = 100;
  
  /**
   * 访问文档节点
   * @param document 文档节点
   * @param context 转换上下文
   * @returns JSON结构
   */
  visitDocument(document: ProcessedDocument, context: TransformContext): any {
    if (!document) {
      return null;
    }
    
    const result: any = {
      document: {}
    };
    
    // 处理子节点
    if (document.children && document.children.length > 0) {
      for (const child of document.children) {
        // 特殊处理：处理后的文档可能包含嵌套的document节点
        if (child.type === NodeType.DOCUMENT) {
          // 递归处理嵌套的document
          const docChild = child as Document;
          if (docChild.children) {
            this.processDocumentChildren(docChild.children, result.document, context);
          }
        } else if (child.type === NodeType.ELEMENT) {
          const elementChild = child as Element;
          const processedElement = this.processElement(elementChild, context);
          
          if (processedElement) {
            if (elementChild.tagName === 'section') {
              // 处理多个section的情况
              if (result.document.section) {
                if (Array.isArray(result.document.section)) {
                  result.document.section.push(processedElement.section);
                } else {
                  result.document.section = [result.document.section, processedElement.section];
                }
              } else {
                result.document.section = processedElement.section;
              }
            } else {
              // 其他元素类型
              Object.assign(result.document, processedElement);
            }
          }
        } else if (child.type === NodeType.CONTENT) {
          // 处理文本内容
          const content = (child as Content).value;
          if (content && content.trim()) {
            result.document.content = content.trim();
          }
        }
      }
    }
    
    // 处理元数据
    if (document.metadata) {
      result.document.metadata = document.metadata;
    }
    
    return result;
  }
  
  /**
   * 处理文档子节点
   * @param children 子节点数组
   * @param target 目标对象
   * @param context 转换上下文
   */
  private processDocumentChildren(children: Node[], target: any, context: TransformContext): void {
    if (!children || children.length === 0) {
      return;
    }
    
    for (const child of children) {
      // 确保子节点有type属性
      if ('type' in child) {
        if (child.type === NodeType.ELEMENT) {
          const elementChild = child as Element;
          const processedElement = this.processElement(elementChild, context);
          
          if (processedElement) {
            if (elementChild.tagName === 'section') {
              // 处理多个section的情况
              if (target.section) {
                if (Array.isArray(target.section)) {
                  target.section.push(processedElement.section);
                } else {
                  target.section = [target.section, processedElement.section];
                }
              } else {
                target.section = processedElement.section;
              }
            } else {
              // 其他元素类型
              Object.assign(target, processedElement);
            }
          }
        } else if (child.type === NodeType.CONTENT) {
          // 处理文本内容
          const contentChild = child as Content;
          if (contentChild.value && contentChild.value.trim()) {
            target.content = contentChild.value.trim();
          }
        } else if (child.type === NodeType.DOCUMENT) {
          // 递归处理嵌套文档
          const docChild = child as Document;
          if (docChild.children) {
            this.processDocumentChildren(docChild.children, target, context);
          }
        }
      }
    }
  }
  
  /**
   * 处理元素节点
   * @param element 元素节点
   * @param context 转换上下文
   * @returns 处理后的元素对象
   */
  private processElement(element: Element, context: TransformContext): any {
    if (!element || !element.tagName) {
      return null;
    }
    
    const result: any = {};
    const tagName = element.tagName;
    
    // 创建元素容器
    result[tagName] = {};
    
    // 处理属性
    if (element.attributes) {
      Object.keys(element.attributes).forEach(attrName => {
        result[tagName][attrName] = element.attributes[attrName];
      });
    }
    
    // 处理子元素
    if (element.children && element.children.length > 0) {
      // 检查是否只有文本内容
      if (element.children.length === 1 && element.children[0].type === NodeType.CONTENT) {
        const content = (element.children[0] as Content).value;
        // 如果元素只包含单一文本节点，直接使用文本值
        result[tagName] = content;
      } else {
        // 处理复杂子元素
        for (const child of element.children) {
          if (child.type === NodeType.ELEMENT) {
            const childElement = child as Element;
            const childResult = this.processElement(childElement, context);
            
            if (childResult) {
              const childTagName = childElement.tagName;
              
              // 处理重复元素（如列表项），将它们聚合为数组
              if (result[tagName][childTagName]) {
                if (!Array.isArray(result[tagName][childTagName])) {
                  result[tagName][childTagName] = [result[tagName][childTagName]];
                }
                result[tagName][childTagName].push(childResult[childTagName]);
              } else {
                result[tagName][childTagName] = childResult[childTagName];
              }
            }
          } else if (child.type === NodeType.CONTENT) {
            // 处理混合内容
            const textContent = (child as Content).value;
            if (textContent && textContent.trim()) {
              if (!result[tagName].text) {
                result[tagName].text = [];
              }
              result[tagName].text.push(textContent.trim());
            }
          }
        }
      }
    }
    
    return result;
  }
} 