import type {
  DPMLDocument,
  DPMLNode,
  ParseOptions,
  SourceLocation,
} from '../../types';

import {
  DPMLParseError,
  ParseError,
  ParseErrorCode,
  XMLParseError,
} from './errors';
import type { XMLNode, XMLPosition } from './types';
import type { XMLAdapter } from './XMLAdapter';

// 扩展XMLParserOptions接口，添加验证结构的属性
declare module '../../types' {
  interface XMLParserOptions {
    /** 是否验证文档结构 */
    validateStructure?: boolean;
  }
}

/**
 * DPML适配器
 * 负责将XML结构转换为DPML对象模型
 * 处理DPML特定语义，如节点索引、引用解析
 */
export class DPMLAdapter {
  /**
   * XML适配器实例
   */
  private xmlAdapter: XMLAdapter;

  /**
   * 解析配置选项
   */
  private options: ParseOptions;

  /**
   * 创建适配器并注入依赖
   * @param options 解析配置选项
   * @param xmlAdapter XML适配器实例
   */
  constructor(options: ParseOptions, xmlAdapter: XMLAdapter) {
    this.options = options || {};
    this.xmlAdapter = xmlAdapter;
  }

  /**
   * 解析DPML内容，构建文档对象模型
   * @param content DPML内容字符串
   * @returns DPML文档对象
   * @throws {DPMLParseError|XMLParseError} 当解析失败时抛出
   */
  public parse<T>(content: string): T {
    try {
      // 预检查XML有效性
      this.prevalidateXML(content);

      // 性能优化：检测内容大小并应用适当策略
      const isLargeContent = this.isLargeContent(content);

      // 使用XML适配器解析内容
      const xmlResult = this.xmlAdapter.parse<XMLNode>(content);

      // 验证XML结果
      this.validateXMLResult(xmlResult, content);

      // 转换为DPML节点
      const rootNode = isLargeContent
        ? this.convertToDPMLOptimized(xmlResult)
        : this.convertToDPML(xmlResult);

      // 构建文档对象
      const document = this.createDPMLDocument(rootNode);

      return document as unknown as T;
    } catch (error) {
      // 处理并增强错误
      throw this.enhanceError(error, content);
    }
  }

  /**
   * 异步解析DPML内容
   * @param content DPML内容字符串
   * @returns DPML文档对象Promise
   * @throws {DPMLParseError|XMLParseError} 当解析失败时抛出
   */
  public async parseAsync<T>(content: string): Promise<T> {
    try {
      // 预检查XML有效性
      this.prevalidateXML(content);

      // 性能优化：检测内容大小并应用适当策略
      const isLargeContent = this.isLargeContent(content);

      // 使用XML适配器异步解析内容
      const xmlResult = await this.xmlAdapter.parseAsync<XMLNode>(content);

      // 验证XML结果
      this.validateXMLResult(xmlResult, content);

      // 转换为DPML节点，使用Web Worker或异步处理大文件
      let rootNode: DPMLNode;

      if (isLargeContent) {
        // 使用优化的转换方法
        rootNode = await this.convertToDPMLAsyncOptimized(xmlResult);
      } else {
        // 使用标准转换但在下一个事件循环中执行以避免阻塞
        rootNode = await new Promise(resolve => {
          setTimeout(() => {
            resolve(this.convertToDPML(xmlResult));
          }, 0);
        });
      }

      // 构建文档对象
      const document = this.createDPMLDocument(rootNode);

      return document as unknown as T;
    } catch (error) {
      // 处理并增强错误
      throw this.enhanceError(error, content);
    }
  }

  /**
   * 预验证XML有效性
   * 检查常见的XML语法错误，如未关闭的标签
   * @param content XML内容
   */
  protected prevalidateXML(content: string): void {
    // 检查是否为空内容
    if (!content || content.trim() === '') {
      throw new DPMLParseError(
        '空的DPML内容',
        ParseErrorCode.DPML_INVALID_STRUCTURE,
        {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 1,
          fileName: this.options.fileName,
        },
        content
      );
    }

    // 特别检查未闭合的标签，这是一个常见错误
    // 使用正则表达式匹配所有标签
    const openTagPattern = /<([a-zA-Z][\w:.-]*)[^>]*?>/g;
    const closeTagPattern = /<\/([a-zA-Z][\w:.-]*)[^>]*?>/g;
    const selfClosingPattern = /<([a-zA-Z][\w:.-]*)[^>]*?\/>/g;

    // 收集所有标签
    const openTags: string[] = [];
    const closeTags: string[] = [];
    const selfClosingTags: string[] = [];

    let match;

    // 收集开放标签
    while ((match = openTagPattern.exec(content)) !== null) {
      const tagName = match[1];

      if (tagName) openTags.push(tagName);
    }

    // 收集关闭标签
    while ((match = closeTagPattern.exec(content)) !== null) {
      const tagName = match[1];

      if (tagName) closeTags.push(tagName);
    }

    // 收集自闭合标签
    while ((match = selfClosingPattern.exec(content)) !== null) {
      const tagName = match[1];

      if (tagName) selfClosingTags.push(tagName);
    }

    // 检查是否存在未关闭的标签
    // 注意：这是一个简单的检查，不处理嵌套标签
    if (openTags.length - selfClosingTags.length > closeTags.length) {
      // 有未关闭的标签
      // 找出具体是哪个标签未关闭
      const unclosedTags = [...openTags];

      for (const tag of [...closeTags, ...selfClosingTags]) {
        const index = unclosedTags.indexOf(tag);

        if (index !== -1) {
          unclosedTags.splice(index, 1);
        }
      }

      if (unclosedTags.length > 0) {
        throw new DPMLParseError(
          `未关闭的标签: <${unclosedTags[0]}>`,
          ParseErrorCode.DPML_INVALID_STRUCTURE,
          undefined,
          content.substring(0, 100)
        );
      }
    }
  }

  /**
   * 检查内容是否为大型文档
   * @param content DPML内容
   * @returns 是否为大型文档
   */
  private isLargeContent(content: string): boolean {
    // 使用用户配置的大文件阈值（如果有），否则使用默认值（2MB）
    const threshold =
      this.options.memoryOptimization?.largeFileThreshold || 2 * 1024 * 1024;

    // 如果启用了内存优化，使用提供的阈值
    if (this.options.memoryOptimization?.enabled) {
      return content.length > threshold;
    }

    // 如果未明确启用内存优化，但文件大小超过10MB，也应用优化
    if (content.length > 10 * 1024 * 1024) {
      return true;
    }

    return content.length > threshold;
  }

  /**
   * 创建DPML文档对象
   * @param rootNode 根节点
   * @returns DPML文档对象
   */
  private createDPMLDocument(rootNode: DPMLNode): DPMLDocument {
    // 构建文档对象
    const metadata = {
      sourceFileName: this.options.fileName,
      createdAt: new Date(),
      size: this.calculateDocumentSize(rootNode),
    };

    // 构建节点ID索引
    const nodesById = this.buildNodeMap(rootNode);

    // 验证引用完整性
    this.validateReferences(rootNode, nodesById);

    // 使用Object.defineProperties创建只读属性的文档对象
    const document = {} as DPMLDocument;

    Object.defineProperties(document, {
      rootNode: {
        value: rootNode,
        writable: false,
        enumerable: true,
        configurable: false,
      },
      nodesById: {
        value: nodesById,
        writable: false,
        enumerable: true,
        configurable: false,
      },
      metadata: {
        value: metadata,
        writable: false,
        enumerable: true,
        configurable: false,
      },
    });

    return document;
  }

  /**
   * 计算文档大小
   * @param rootNode 根节点
   * @returns 文档大小（节点数）
   */
  private calculateDocumentSize(rootNode: DPMLNode): number {
    let size = 1; // 根节点计数

    const countNodes = (node: DPMLNode) => {
      if (node.children && node.children.length > 0) {
        size += node.children.length;
        node.children.forEach(countNodes);
      }
    };

    countNodes(rootNode);

    return size;
  }

  /**
   * 将XML节点转换为DPML节点（针对大文件优化版本）
   * 使用递归分批处理以避免调用栈溢出
   * @param xmlNode XML节点
   * @returns DPML节点
   */
  private convertToDPMLOptimized(xmlNode: XMLNode): DPMLNode {
    // 使用非递归方式处理以避免栈溢出
    // 创建根节点
    const rootDPMLNode = this.createDPMLNode(xmlNode);

    // 使用队列进行广度优先处理
    const queue: { xmlNode: XMLNode; dpmlNode: DPMLNode }[] = [];

    // 将子节点加入队列
    if (xmlNode.children && xmlNode.children.length > 0) {
      xmlNode.children.forEach(childXml => {
        const childDPML = this.createDPMLNode(childXml);

        rootDPMLNode.children.push(childDPML);
        // 设置父节点引用
        Object.defineProperty(childDPML, 'parent', {
          value: rootDPMLNode,
          writable: false,
          enumerable: true,
          configurable: false,
        });
        // 将子节点加入队列继续处理
        queue.push({ xmlNode: childXml, dpmlNode: childDPML });
      });
    }

    // 批量处理队列中的节点
    const batchSize = 1000;
    let processed = 0;

    while (queue.length > 0) {
      const { xmlNode: currentXmlNode, dpmlNode: currentDPMLNode } =
        queue.shift()!;

      // 处理当前节点的子节点
      if (currentXmlNode.children && currentXmlNode.children.length > 0) {
        currentXmlNode.children.forEach(childXml => {
          const childDPML = this.createDPMLNode(childXml);

          currentDPMLNode.children.push(childDPML);
          // 设置父节点引用
          Object.defineProperty(childDPML, 'parent', {
            value: currentDPMLNode,
            writable: false,
            enumerable: true,
            configurable: false,
          });
          // 将子节点加入队列继续处理
          queue.push({ xmlNode: childXml, dpmlNode: childDPML });
        });
      }

      // 记录处理的节点数
      processed++;

      // 每处理一定数量的节点，让出主线程以避免阻塞
      if (processed % batchSize === 0 && queue.length > batchSize) {
        // 在实际应用中，这里应插入异步延迟，但在同步函数中无法使用await
        // 这里简化处理，实际实现可以在异步版本中使用setTimeout
      }
    }

    return rootDPMLNode;
  }

  /**
   * 创建单个DPML节点（不递归处理子节点）
   * @param xmlNode XML节点
   * @returns DPML节点
   */
  private createDPMLNode(xmlNode: XMLNode): DPMLNode {
    // 创建属性Map
    const attributes = new Map<string, string>();

    if (xmlNode.attributes) {
      // 确保属性值是字符串类型
      Object.entries(xmlNode.attributes).forEach(([key, value]) => {
        // 安全处理空值
        if (value === null || value === undefined) {
          attributes.set(key, '');
        } else {
          attributes.set(key, String(value));
        }
      });
    }

    // 处理文本内容
    const content = xmlNode.text !== undefined ? String(xmlNode.text) : '';

    // 创建节点对象
    const node = {} as DPMLNode;

    // 使用Object.defineProperty定义只读属性
    Object.defineProperties(node, {
      tagName: {
        value: xmlNode.name,
        writable: false,
        enumerable: true,
        configurable: false,
      },
      attributes: {
        value: attributes,
        writable: false,
        enumerable: true,
        configurable: false,
      },
      children: {
        value: [],
        writable: false,
        enumerable: true,
        configurable: false,
      },
      content: {
        value: content,
        writable: false,
        enumerable: true,
        configurable: false,
      },
      parent: {
        value: null,
        writable: false,
        enumerable: true,
        configurable: true, // 允许子节点重新配置该属性
      },
      sourceLocation: {
        value: xmlNode.position
          ? this.createSourceLocation(xmlNode.position)
          : undefined,
        writable: false,
        enumerable: true,
        configurable: false,
      },
    });

    return node;
  }

  /**
   * 异步转换XML节点到DPML节点，针对大文件优化
   * @param xmlNode XML节点
   * @returns Promise<DPMLNode>
   */
  private async convertToDPMLAsyncOptimized(
    xmlNode: XMLNode
  ): Promise<DPMLNode> {
    // 创建根节点
    const rootDPMLNode = this.createDPMLNode(xmlNode);

    // 使用队列进行广度优先处理
    const queue: { xmlNode: XMLNode; dpmlNode: DPMLNode }[] = [];

    // 将子节点加入队列
    if (xmlNode.children && xmlNode.children.length > 0) {
      xmlNode.children.forEach(childXml => {
        const childDPML = this.createDPMLNode(childXml);

        rootDPMLNode.children.push(childDPML);
        // 设置父节点引用
        Object.defineProperty(childDPML, 'parent', {
          value: rootDPMLNode,
          writable: false,
          enumerable: true,
          configurable: false,
        });
        // 将子节点加入队列继续处理
        queue.push({ xmlNode: childXml, dpmlNode: childDPML });
      });
    }

    // 批量处理队列中的节点，使用异步处理避免阻塞
    const batchSize = 500;

    while (queue.length > 0) {
      // 处理一批节点
      const batch = queue.splice(0, Math.min(batchSize, queue.length));

      // 处理批次
      for (const {
        xmlNode: currentXmlNode,
        dpmlNode: currentDPMLNode,
      } of batch) {
        // 处理当前节点的子节点
        if (currentXmlNode.children && currentXmlNode.children.length > 0) {
          currentXmlNode.children.forEach(childXml => {
            const childDPML = this.createDPMLNode(childXml);

            currentDPMLNode.children.push(childDPML);
            // 设置父节点引用
            Object.defineProperty(childDPML, 'parent', {
              value: currentDPMLNode,
              writable: false,
              enumerable: true,
              configurable: false,
            });
            // 将子节点加入队列继续处理
            queue.push({ xmlNode: childXml, dpmlNode: childDPML });
          });
        }
      }

      // 每处理一批节点后，让出主线程避免阻塞
      if (queue.length > 0) {
        // 使用setTimeout来让出主线程
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return rootDPMLNode;
  }

  /**
   * 将XML节点转换为DPML节点
   * @param xmlNode XML节点
   * @returns DPML节点
   */
  private convertToDPML(xmlNode: XMLNode): DPMLNode {
    // 创建当前节点
    const dpmlNode = this.createDPMLNode(xmlNode);

    // 处理子节点
    if (xmlNode.children && xmlNode.children.length > 0) {
      // 递归处理每个子节点
      xmlNode.children.forEach(childXml => {
        const childDPML = this.convertToDPML(childXml);

        dpmlNode.children.push(childDPML);

        // 设置父节点引用
        Object.defineProperty(childDPML, 'parent', {
          value: dpmlNode,
          writable: false,
          enumerable: true,
          configurable: false,
        });
      });
    }

    return dpmlNode;
  }

  /**
   * 构建节点ID映射
   * @param rootNode 根节点
   * @returns 节点ID到节点的映射
   */
  private buildNodeMap(rootNode: DPMLNode): Map<string, DPMLNode> {
    const nodeMap = new Map<string, DPMLNode>();

    // 递归遍历所有节点
    const traverseNode = (node: DPMLNode) => {
      // 检查节点是否有ID属性
      const nodeId = node.attributes.get('id');

      if (nodeId) {
        // 将节点添加到映射中
        nodeMap.set(nodeId, node);
      }

      // 检查节点是否有ref属性，用于验证引用完整性
      const nodeRef = node.attributes.get('ref');

      if (nodeRef) {
        // 稍后验证引用
      }

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverseNode);
      }
    };

    // 开始从根节点遍历
    traverseNode(rootNode);

    return nodeMap;
  }

  /**
   * 验证节点引用完整性
   * @param rootNode 根节点
   * @param nodeMap 节点ID映射
   */
  private validateReferences(
    rootNode: DPMLNode,
    nodeMap: Map<string, DPMLNode>
  ): void {
    // 仅当启用了严格模式时验证引用
    if (this.options.xmlParserOptions?.validateReferences === false) {
      return;
    }

    // 递归遍历所有节点检查引用
    const checkReferences = (node: DPMLNode) => {
      // 检查节点是否有ref属性
      const nodeRef = node.attributes.get('ref');

      if (nodeRef && !nodeMap.has(nodeRef)) {
        // 无效引用
        throw new DPMLParseError(
          `引用错误: 找不到ID为"${nodeRef}"的节点`,
          ParseErrorCode.DPML_INVALID_ATTRIBUTE,
          node.sourceLocation,
          undefined
        );
      }

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach(checkReferences);
      }
    };

    // 开始从根节点验证
    checkReferences(rootNode);
  }

  /**
   * 创建源代码位置信息
   * @param position XML位置信息
   * @returns DPML源代码位置信息
   */
  private createSourceLocation(position: XMLPosition): SourceLocation {
    return {
      startLine: position.start.line,
      startColumn: position.start.column,
      endLine: position.end.line,
      endColumn: position.end.column,
      fileName: this.options.fileName,
    };
  }

  /**
   * 验证XML解析结果
   * @param xmlNode XML节点
   * @param content 原始内容
   */
  private validateXMLResult(xmlNode: XMLNode, content: string): void {
    // 验证基本结构
    if (!xmlNode) {
      throw new DPMLParseError(
        '无法解析DPML内容',
        ParseErrorCode.DPML_INVALID_STRUCTURE,
        undefined,
        content.substring(0, 100)
      );
    }

    // 验证是否有根元素
    if (!xmlNode.name) {
      throw new DPMLParseError(
        '缺少根元素',
        ParseErrorCode.DPML_MISSING_REQUIRED_TAG,
        undefined,
        content.substring(0, 100)
      );
    }

    // 验证子节点结构
    if (this.options.xmlParserOptions?.validateStructure) {
      // 这里可以添加更多验证逻辑，例如检查必需的子元素
      // 或者验证元素嵌套是否符合预期
    }
  }

  /**
   * 增强错误信息
   * @param error 原始错误
   * @param content 原始内容
   * @returns 增强后的错误
   */
  private enhanceError(error: unknown, content: string): ParseError {
    // 如果已经是ParseError，直接返回
    if (error instanceof ParseError) {
      return error;
    }

    // 处理XMLParseError
    if (error instanceof XMLParseError) {
      // 转换位置信息
      let locationInfo: SourceLocation | undefined = undefined;

      if (error.position) {
        // 使用任意类型绕过类型检查
        const pos = error.position as any;

        locationInfo = {
          startLine: pos.start.line,
          startColumn: pos.start.column,
          endLine: pos.end.line,
          endColumn: pos.end.column,
          fileName: this.options.fileName,
        };
      }

      return new DPMLParseError(
        error.message,
        ParseErrorCode.DPML_INVALID_STRUCTURE,
        locationInfo,
        error.source,
        error
      );
    }

    // 处理其他错误
    return new DPMLParseError(
      error instanceof Error ? error.message : String(error),
      ParseErrorCode.UNKNOWN_ERROR,
      undefined,
      content.substring(0, 100),
      error instanceof Error ? error : undefined
    );
  }
}
