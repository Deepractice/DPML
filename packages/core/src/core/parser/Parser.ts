/**
 * 解析器实现类
 * 整合适配器、注册表和验证器，实现完整解析流程
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';

import type { DPMLDocument, DPMLNode, ParserOptions, TagRegistry } from '../../types';
import { ParseError } from '../../types/ParseError';

import { DPMLDocumentImpl } from './DPMLDocumentImpl';
import { getGlobalTagRegistry } from './TagRegistryManager';
import { Validator } from './Validator';
import { XmlParserAdapter } from './XmlParserAdapter';
import { XmlToNodeConverter } from './XmlToNodeConverter';


/**
 * 解析器类
 */
export class Parser {
  /**
   * XML解析适配器
   */
  private xmlParser: XmlParserAdapter;

  /**
   * XML到DPML节点转换器
   */
  private nodeConverter: XmlToNodeConverter;

  /**
   * 标签注册表
   */
  private tagRegistry: TagRegistry;

  /**
   * 验证器
   */
  private validator: Validator;

  /**
   * 构造函数
   * @param tagRegistry 标签注册表（可选，默认使用全局注册表）
   */
  constructor(tagRegistry?: TagRegistry) {
    // 使用提供的标签注册表或全局注册表
    this.tagRegistry = tagRegistry || getGlobalTagRegistry();

    // 创建XML解析适配器，启用位置跟踪
    this.xmlParser = new XmlParserAdapter({
      trackPosition: true,
      preserveOrder: true
    });

    // 创建XML到DPML节点转换器
    this.nodeConverter = new XmlToNodeConverter();

    // 创建验证器
    this.validator = new Validator(this.tagRegistry);
  }

  /**
   * 解析DPML文本内容
   * @param content DPML文本内容
   * @param options 解析选项
   * @returns 解析后的文档对象
   */
  parse(content: string, options?: ParserOptions): DPMLDocument {
    try {
      // 解析XML文本
      const xmlNode = this.xmlParser.parse(content);

      // 将XML节点转换为DPML节点
      const dpmlNode = this.nodeConverter.convert(xmlNode);

      // 创建文档对象
      const document = new DPMLDocumentImpl(dpmlNode, options?.fileName);

      // 如果启用了验证，验证文档
      if (options?.validateOnParse !== false) {
        const validationResult = this.validator.validateDocument(document);

        // 如果验证失败且配置为抛出错误，则抛出异常
        if (!validationResult.valid && options?.throwOnError !== false) {
          throw new ParseError(
            `文档验证失败: ${validationResult.errors[0]?.message}`,
            validationResult.errors[0]?.location || dpmlNode.sourceLocation
          );
        }
      }

      return document;
    } catch (error) {
      // 如果是ParseError，直接抛出
      if (error instanceof ParseError) {
        throw error;
      }

      // 其他错误包装为ParseError
      throw new ParseError(
        `解析DPML内容失败: ${(error as Error).message}`,
        {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 1,
          getLineSnippet: () => content.split('\n')[0] || ''
        }
      );
    }
  }

  /**
   * 异步解析DPML文件
   * @param filePath 文件路径
   * @param options 解析选项
   * @returns Promise，解析后的文档对象
   */
  async parseFile(filePath: string, options?: ParserOptions): Promise<DPMLDocument> {
    try {
      // 读取文件内容
      const content = await readFile(filePath, {
        encoding: options?.encoding || 'utf-8'
      });

      // 合并选项，添加文件名
      const mergedOptions: ParserOptions = {
        ...options,
        fileName: basename(filePath)
      };

      // 解析内容
      return this.parse(content, mergedOptions);
    } catch (error) {
      // 如果是ParseError，直接抛出
      if (error instanceof ParseError) {
        throw error;
      }

      // 其他错误包装为ParseError
      throw new ParseError(
        `解析文件 ${filePath} 失败: ${(error as Error).message}`,
        {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 1,
          getLineSnippet: () => ''
        }
      );
    }
  }

  /**
   * 验证DPML节点
   * @param node DPML节点
   * @returns 验证结果
   */
  validateNode(node: DPMLNode): boolean {
    const result = this.validator.validateNode(node);

    return result.valid;
  }

  /**
   * 验证DPML文档
   * @param document DPML文档
   * @returns 验证结果
   */
  validateDocument(document: DPMLDocument): boolean {
    const result = this.validator.validateDocument(document);

    return result.valid;
  }
}
