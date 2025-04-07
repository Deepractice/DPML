/**
 * DomainTagVisitor
 * 
 * 用于处理领域特定的标签语义
 */

import { Element } from '@core/types/node';
import { NodeVisitor, ProcessingContext, TagProcessorRegistry } from '@core/processor/interfaces';

/**
 * 领域标签访问者
 * 
 * 根据标签名查找相应的处理器，应用语义处理
 * 是实现领域特定语义处理的核心组件
 */
export class DomainTagVisitor implements NodeVisitor {
  /**
   * 访问者优先级
   * 应该在基础处理（如继承、引用）之后执行，但在其他后处理之前
   */
  priority = 60;
  
  /**
   * 标签处理器注册表
   */
  private registry: TagProcessorRegistry;
  
  /**
   * 构造函数
   * @param registry 标签处理器注册表
   */
  constructor(registry: TagProcessorRegistry) {
    this.registry = registry;
  }
  
  /**
   * 处理元素节点
   * @param element 元素节点
   * @param context 处理上下文
   * @returns 处理后的元素节点
   */
  async visitElement(element: Element, context: ProcessingContext): Promise<Element> {
    try {
      // 获取该标签的所有处理器
      const processors = this.registry.getProcessors(element.tagName);
      
      // 如果没有处理器，直接返回元素
      if (processors.length === 0) {
        return element;
      }
      
      // 按优先级排序处理器（高到低）
      const sortedProcessors = [...processors].sort((a, b) => 
        (b.priority || 0) - (a.priority || 0)
      );
      
      // 依次应用处理器
      let processedElement = element;
      for (const processor of sortedProcessors) {
        // 检查处理器是否可以处理该元素
        if (processor.canProcess(processedElement)) {
          // 应用处理器
          processedElement = await processor.process(processedElement, context);
        }
      }
      
      return processedElement;
    } catch (error) {
      // 出错时记录错误并返回原始元素
      console.error(`Error processing tag ${element.tagName}:`, error);
      // 这里可以添加到context中的错误收集器
      return element;
    }
  }
} 