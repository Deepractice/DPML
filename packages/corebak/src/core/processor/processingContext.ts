/**
 * 处理上下文实现
 */
import type { Document, Element } from 'packages/corebak/src/types/node';
import type {
  ProcessingContext as ProcessingContextInterface,
  ResolvedReference,
} from 'packages/corebak/src/types/processor';

/**
 * 处理上下文类
 *
 * 提供处理过程中所需的状态和上下文信息
 */
export class ProcessingContext implements ProcessingContextInterface {
  /** 当前正在处理的文档 */
  public document: Document;

  /** 当前文档的路径 */
  public currentPath: string;

  /** 当前文件路径（与currentPath相同，为了保持API一致性） */
  public filePath: string;

  /** 文档处理模式 */
  public documentMode?: 'strict' | 'loose';

  /** 已解析的引用缓存 */
  public resolvedReferences: Map<string, ResolvedReference>;

  /** 元素处理过程中的父元素栈 */
  public parentElements: Element[];

  /** 处理过程中的变量存储 */
  public variables: Record<string, any>;

  /** ID到元素的映射 */
  public idMap: Map<string, Element>;

  /**
   * 创建新的处理上下文
   *
   * @param document 要处理的文档
   * @param currentPath 文档的路径
   */
  constructor(document: Document, currentPath: string) {
    this.document = document;
    this.currentPath = currentPath;
    this.filePath = currentPath;
    this.resolvedReferences = new Map<string, ResolvedReference>();
    this.parentElements = [];
    this.variables = {};
    this.idMap = new Map<string, Element>();

    // 尝试从文档的根元素获取mode属性
    if (document.children && document.children.length > 0) {
      const rootElement = document.children[0] as Element;

      if (
        rootElement &&
        rootElement.attributes &&
        rootElement.attributes.mode
      ) {
        this.documentMode =
          rootElement.attributes.mode === 'strict' ? 'strict' : 'loose';
      }
    }
  }
}
