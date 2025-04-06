/**
 * ProcessorFactory
 * 
 * 提供创建处理器实例的工厂函数
 */

import { ProcessorOptions } from './interfaces';
import { DefaultProcessor } from './defaultProcessor';
import { DefaultReferenceResolver } from './defaultReferenceResolver';
import { 
  createIdValidationVisitor, 
  createReferenceVisitor,
  createDocumentMetadataVisitor,
  DocumentMode
} from './visitors';
import { createHttpProtocolHandler, createIdProtocolHandler, createFileProtocolHandler } from './protocols';

/**
 * 处理器工厂选项
 */
export interface ProcessorFactoryOptions extends ProcessorOptions {
  /**
   * 是否注册基础访问者
   */
  registerBaseVisitors?: boolean;
  
  /**
   * 是否注册基础协议处理器
   */
  registerBaseProtocolHandlers?: boolean;
  
  /**
   * 是否使用严格模式
   */
  strictMode?: boolean;
}

/**
 * 创建默认处理器
 * @param options 处理器选项
 * @returns 处理器实例
 */
export function createProcessor(options?: ProcessorFactoryOptions): DefaultProcessor {
  const processor = new DefaultProcessor(options);
  
  // 创建默认引用解析器
  const referenceResolver = new DefaultReferenceResolver();
  
  // 设置引用解析器
  processor.setReferenceResolver(referenceResolver);
  
  // 注册基础访问者
  if (options?.registerBaseVisitors !== false) {
    // 注册文档元数据访问者
    processor.registerVisitor(createDocumentMetadataVisitor({
      defaultMode: options?.strictMode ? DocumentMode.STRICT : DocumentMode.LOOSE
    }));
    
    // 注册ID验证访问者
    processor.registerVisitor(createIdValidationVisitor({
      strictMode: options?.strictMode
    }));
    
    // 注册引用访问者
    processor.registerVisitor(createReferenceVisitor({
      referenceResolver
    }));
  }
  
  // 注册基础协议处理器
  if (options?.registerBaseProtocolHandlers !== false) {
    // 注册HTTP协议处理器
    referenceResolver.registerProtocolHandler(createHttpProtocolHandler());
    
    // 注册文件协议处理器
    referenceResolver.registerProtocolHandler(createFileProtocolHandler());
    
    // 创建ID协议处理器，在process方法中设置上下文
    const idHandler = createIdProtocolHandler();
    referenceResolver.registerProtocolHandler(idHandler);
    
    // 重写原始process方法，添加对ID协议处理器的上下文设置
    const originalProcess = processor.process.bind(processor);
    processor.process = async (document, path) => {
      // 创建处理上下文
      const context = {
        document,
        currentPath: path || '',
        resolvedReferences: new Map(),
        parentElements: [],
        variables: {},
        idMap: new Map()
      };
      
      // 设置ID协议处理器上下文
      idHandler.setContext({
        processingContext: context
      });
      
      // 调用原始process方法
      return originalProcess(document, path);
    };
  }
  
  return processor;
} 