import type { ParseOptions } from '../../types';

import { XMLParseError } from './errors';
import type { IXMLParser, XMLNode } from './types';

/**
 * XML适配器
 * 封装底层XML解析库细节，提供统一接口
 */
export class XMLAdapter {
  /**
   * 底层XML解析器实例
   */
  private xmlParser: IXMLParser;

  /**
   * 解析配置选项
   */
  private options: ParseOptions;

  /**
   * 创建适配器并配置选项
   * @param options 解析配置选项
   * @param xmlParser XML解析器实例
   */
  constructor(options: ParseOptions, xmlParser: IXMLParser) {
    this.options = options;
    this.xmlParser = xmlParser;
    this.configureParser();
  }

  /**
   * 同步解析XML内容
   * @param content XML内容字符串
   * @returns 解析结果
   * @throws {XMLParseError} 当解析失败时抛出
   */
  public parse<T>(content: string): T {
    try {
      // 检查内容大小并应用性能优化
      if (this.shouldApplyLargeContentOptimization(content)) {
        this.applyLargeContentOptimization();
      }

      const xmlNode = this.xmlParser.parse(content);

      return this.processResult<T>(xmlNode);
    } catch (error) {
      // 捕获并增强错误信息
      throw this.enhanceError(error, content);
    }
  }

  /**
   * 异步解析XML内容
   * @param content XML内容字符串
   * @returns 解析结果Promise
   * @throws {XMLParseError} 当解析失败时抛出
   */
  public async parseAsync<T>(content: string): Promise<T> {
    try {
      // 检查内容大小并应用性能优化
      if (this.shouldApplyLargeContentOptimization(content)) {
        this.applyLargeContentOptimization();
      }

      const xmlNode = await this.xmlParser.parseAsync(content);

      return this.processResult<T>(xmlNode);
    } catch (error) {
      // 捕获并增强错误信息
      throw this.enhanceError(error, content);
    }
  }

  /**
   * 检查是否应该应用大文件优化
   * @param content XML内容
   * @returns 是否应用优化
   */
  private shouldApplyLargeContentOptimization(content: string): boolean {
    // 获取用户配置的阈值，默认为1MB
    const contentSizeThreshold =
      this.options.memoryOptimization?.largeFileThreshold || 1024 * 1024;

    return content.length > contentSizeThreshold;
  }

  /**
   * 应用大文件处理优化
   */
  private applyLargeContentOptimization(): void {
    const optimizationOptions: Record<string, unknown> = {
      // xml2js优化选项
      explicitArray: true, // 使用数组保存子节点，简化遍历
      normalizeTags: false, // 不标准化标签名，保持原始命名
      trim: true, // 裁剪值的空白，减少内存占用
      explicitRoot: true, // 保留根元素
      explicitChildren: true, // 显式子节点结构，提高导航效率
      preserveChildrenOrder: true, // 保持子元素顺序
      mergeAttrs: false, // 不合并属性
      charsAsChildren: false, // 不将字符作为子节点
      includeWhiteChars: false, // 不包含空白
    };

    // 应用用户自定义的内存优化选项
    if (this.options.memoryOptimization) {
      const { useStreaming } = this.options.memoryOptimization;

      // 如果启用了流式处理，进一步优化
      if (useStreaming) {
        optimizationOptions.preserveChildrenOrder = false; // 流式处理不需要保持顺序
        optimizationOptions.charsAsChildren = false; // 避免创建不必要的文本节点
      }
    }

    // 应用优化配置
    this.xmlParser.configure(optimizationOptions);

    // 回收内存
    if (typeof global !== 'undefined' && global.gc) {
      try {
        global.gc();
      } catch {
        // 忽略GC错误
      }
    }
  }

  /**
   * 配置底层解析器行为
   */
  private configureParser(): void {
    // 根据options配置底层解析器
    const xmlOptions: Record<string, unknown> = {};

    if (this.options.xmlParserOptions) {
      const { preserveWhitespace, parseComments, enableNamespaces } =
        this.options.xmlParserOptions;

      // 转换选项格式为xml2js接受的格式
      if (preserveWhitespace !== undefined) {
        xmlOptions.trim = !preserveWhitespace;
        xmlOptions.includeWhiteChars = preserveWhitespace;
      }

      if (parseComments !== undefined) {
        xmlOptions.includeWhiteChars = parseComments;
      }

      if (enableNamespaces !== undefined) {
        xmlOptions.xmlns = enableNamespaces;
      }
    }

    this.xmlParser.configure(xmlOptions);
  }

  /**
   * 处理解析结果
   * @param xmlNode XML节点结果
   * @returns 处理后的结果
   */
  private processResult<T>(xmlNode: XMLNode): T {
    try {
      // 验证XML节点结构
      this.validateNode(xmlNode);

      // 执行后处理逻辑
      const processedNode = this.postProcessNode(xmlNode);

      return processedNode as unknown as T;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 验证XML节点
   * @param node XML节点
   */
  private validateNode(node: XMLNode): void {
    if (!node) {
      throw new Error('解析结果为空');
    }

    if (node.type !== 'element') {
      throw new Error(`无效的XML节点类型：${node.type}`);
    }
  }

  /**
   * 后处理XML节点
   * @param node XML节点
   * @returns 处理后的节点
   */
  private postProcessNode(node: XMLNode): XMLNode {
    // 深度克隆以避免修改原始对象
    const clone = this.cloneNode(node);

    // 应用后处理逻辑，例如自动纠正常见问题
    this.normalizeAttributes(clone);
    this.normalizeTextContent(clone);

    return clone;
  }

  /**
   * 深度克隆XML节点
   * @param node 原始节点
   * @returns 克隆的节点
   */
  private cloneNode(node: XMLNode): XMLNode {
    if (!node) return node;

    const clone: XMLNode = {
      type: node.type,
      name: node.name,
      attributes: { ...node.attributes },
      children: node.children
        ? node.children.map(child => this.cloneNode(child))
        : [],
      text: node.text,
      position: node.position
        ? {
            start: { ...node.position.start },
            end: { ...node.position.end },
          }
        : undefined,
    };

    return clone;
  }

  /**
   * 规范化属性值
   * @param node XML节点
   */
  private normalizeAttributes(node: XMLNode): void {
    if (!node.attributes) node.attributes = {};

    // 确保所有属性值为字符串
    Object.keys(node.attributes).forEach(key => {
      if (node.attributes[key] === null || node.attributes[key] === undefined) {
        node.attributes[key] = '';
      } else if (typeof node.attributes[key] !== 'string') {
        node.attributes[key] = String(node.attributes[key]);
      }
    });

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.normalizeAttributes(child));
    }
  }

  /**
   * 规范化文本内容
   * @param node XML节点
   */
  private normalizeTextContent(node: XMLNode): void {
    // 确保文本内容为字符串或undefined
    if (
      node.text !== undefined &&
      node.text !== null &&
      typeof node.text !== 'string'
    ) {
      node.text = String(node.text);
    }

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.normalizeTextContent(child));
    }
  }

  /**
   * 增强错误信息
   * @param error 原始错误
   * @param content XML内容
   * @returns 增强后的错误
   */
  private enhanceError(error: unknown, content: string): XMLParseError {
    // 如果已经是XMLParseError，直接返回
    if (error instanceof XMLParseError) {
      return error;
    }

    // 创建增强的XML解析错误
    const enhancedError = XMLParseError.fromError(
      error,
      content,
      this.options.fileName
    );

    // 增强错误信息，添加更多上下文
    if (content && content.length > 0) {
      // 尝试提取错误位置附近的内容片段
      try {
        let errorPosition = 0;

        // 尝试从错误消息提取位置信息
        if (error instanceof Error) {
          const posMatch = error.message.match(
            /line\s*(\d+)(?:,|\s+column\s+)(\d+)/i
          );

          if (posMatch) {
            const line = parseInt(posMatch[1], 10);
            const column = parseInt(posMatch[2], 10);

            // 计算近似位置
            const lines = content.split('\n');
            let offset = 0;

            for (let i = 0; i < Math.min(line - 1, lines.length); i++) {
              offset += lines[i].length + 1;
            }

            errorPosition =
              offset +
              Math.min(
                column,
                lines[Math.min(line - 1, lines.length - 1)].length
              );
          }
        }

        // 提取错误位置附近的内容
        const start = Math.max(0, errorPosition - 40);
        const end = Math.min(content.length, errorPosition + 40);
        const snippet = content.substring(start, end);

        // 将内容片段添加到错误消息中
        enhancedError.contextFragment = snippet;
      } catch {
        // 提取上下文失败，忽略
      }
    }

    return enhancedError;
  }
}
