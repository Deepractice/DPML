/**
 * DocumentMetadataVisitor
 *
 * 用于收集文档元数据
 */

import type { Document } from '@core/types/node';
import type {
  NodeVisitor,
  ProcessingContext,
} from '@core/types/processor';

/**
 * 支持的文档模式
 */
export enum DocumentMode {
  /**
   * 严格模式 - 所有验证错误都会导致处理失败
   */
  STRICT = 'strict',

  /**
   * 宽松模式 - 非致命错误会被记录为警告，不会中断处理
   */
  LOOSE = 'loose',
}

/**
 * 文档元数据访问者选项
 */
export interface DocumentMetadataVisitorOptions {
  /**
   * 默认文档模式
   */
  defaultMode?: DocumentMode;
}

/**
 * 文档元数据
 */
export interface DocumentMetadata {
  /**
   * 文档模式
   */
  mode: DocumentMode;

  /**
   * 文档语言
   */
  lang?: string;

  /**
   * 文档验证模式
   */
  schema?: string;

  /**
   * 文档版本
   */
  version?: string;
}

/**
 * 文档元数据访问者
 * 收集文档的元数据信息
 */
export class DocumentMetadataVisitor implements NodeVisitor {
  /**
   * 访问者优先级
   * 最高优先级，在所有其他访问者之前执行
   */
  priority = 100;

  /**
   * 默认文档模式
   */
  private defaultMode: DocumentMode;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options?: DocumentMetadataVisitorOptions) {
    this.defaultMode = options?.defaultMode ?? DocumentMode.LOOSE;
  }

  /**
   * 处理文档节点
   * @param document 文档节点
   * @param context 处理上下文
   * @returns 处理后的文档节点
   */
  async visitDocument(
    document: Document,
    context: ProcessingContext
  ): Promise<Document> {
    // 查找根元素
    const rootElement = document.children.find(
      child => child.type === 'element'
    );

    if (!rootElement) {
      // 没有根元素，使用默认元数据
      context.variables.metadata = this.getDefaultMetadata();

      return document;
    }

    // 从根元素的属性中提取元数据
    const attributes = (rootElement as any).attributes || {};

    // 收集元数据
    const metadata: DocumentMetadata = {
      mode: this.parseMode(attributes.mode),
      lang: attributes.lang,
      schema: attributes.schema,
      version: attributes.version,
    };

    // 存储元数据到上下文变量
    context.variables.metadata = metadata;

    return document;
  }

  /**
   * 解析文档模式
   * @param modeValue 模式值
   * @returns 解析后的文档模式
   */
  private parseMode(modeValue?: string): DocumentMode {
    if (!modeValue) {
      return this.defaultMode;
    }

    const mode = modeValue.toLowerCase();

    if (mode === DocumentMode.STRICT) {
      return DocumentMode.STRICT;
    }

    return DocumentMode.LOOSE;
  }

  /**
   * 获取默认元数据
   * @returns 默认文档元数据
   */
  private getDefaultMetadata(): DocumentMetadata {
    return {
      mode: this.defaultMode,
    };
  }
}
