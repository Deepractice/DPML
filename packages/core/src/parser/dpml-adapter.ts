import { ParseError } from '@core/errors';
import { ErrorCode, ErrorPosition } from '@core/errors/types';
import { NodeType, SourcePosition, Node } from '@core/types/node';

import type { Document, Element } from '@core/types/node';

import { TagRegistry } from './tag-registry';
import { Validator } from './validator';
import { XMLParserAdapter } from './xml/xml-parser-adapter';
import { XMLToNodeConverter } from './xml/xml-to-node-converter';

import type { ParseOptions, ParseResult, ParseWarning } from './interfaces';

/**
 * DPML适配器核心类
 * 负责将DPML文本解析为DPML节点树
 */
export class DpmlAdapter {
  /**
   * XML解析适配器
   */
  private xmlParser: XMLParserAdapter;

  /**
   * XML到DPML节点转换器
   */
  private nodeConverter: XMLToNodeConverter;

  /**
   * 标签注册表
   */
  private tagRegistry: TagRegistry;

  /**
   * 验证器
   */
  private validator: Validator | null = null;

  private errors: Array<ParseError> = [];
  private warnings: Array<ParseWarning> = [];

  /**
   * 构造函数
   * @param options 解析选项
   */
  constructor(options?: ParseOptions) {
    // 创建XML解析适配器，启用位置跟踪
    this.xmlParser = new XMLParserAdapter({
      trackPosition: true,
      preserveOrder: true,
    });

    // 创建XML到DPML节点转换器
    this.nodeConverter = new XMLToNodeConverter();

    // 创建标签注册表
    this.tagRegistry = new TagRegistry();

    // 如果提供了验证选项且启用了验证，创建验证器
    if (options?.validate) {
      this.validator = new Validator(this.tagRegistry);
    }
  }

  /**
   * 获取标签注册表
   * @returns 标签注册表
   */
  getTagRegistry(): TagRegistry {
    return this.tagRegistry;
  }

  /**
   * 解析DPML文本
   * @param input DPML文本
   * @param options 解析选项
   * @returns 解析结果
   */
  async parse(input: string, options?: ParseOptions): Promise<ParseResult> {
    try {
      // 重置状态
      this.errors = [];
      this.warnings = [];

      // 步骤1: 使用XML解析适配器解析文本
      const xmlNode = this.xmlParser.parse(input);

      // 步骤2: 将XML节点转换为DPML节点
      const dpmlNode = this.nodeConverter.convert(xmlNode);

      // 步骤3: 确保生成正确的Document结构
      let document: Document;

      if (dpmlNode.type === NodeType.DOCUMENT) {
        document = dpmlNode as Document;

        // 如果Document没有子节点，但原始XML是有效的，则添加为子节点
        if ((!document.children || document.children.length === 0) && xmlNode) {
          const element = this.nodeConverter.convert(xmlNode);

          document.children = [element];
        }
      } else {
        // 如果返回的不是Document，创建一个包含它的Document
        document = {
          type: NodeType.DOCUMENT,
          position: dpmlNode.position,
          children: [dpmlNode],
        };
      }

      // 步骤4: 处理元素节点，执行额外的DPML特定处理
      if (document.children && document.children.length > 0) {
        this.processElements(document);
      }

      // 输出调试信息，帮助分析
      console.log(
        'DEBUG: 解析后的文档结构:',
        JSON.stringify(
          {
            type: document.type,
            childCount: document.children.length,
            firstChild:
              document.children.length > 0
                ? {
                    type: document.children[0].type,
                    tagName: (document.children[0] as Element).tagName,
                  }
                : null,
          },
          null,
          2
        )
      );

      // 步骤5: 如果启用了验证，执行验证
      if (
        (options?.validate || this.validator) &&
        document.children.length > 0
      ) {
        // 如果未创建验证器，但启用了验证，创建验证器
        if (!this.validator) {
          this.validator = new Validator(this.tagRegistry);
        }

        // 执行验证
        const validationResult = this.validator.validateDocument(document);

        // 处理验证错误
        if (!validationResult.valid && validationResult.errors) {
          for (const error of validationResult.errors) {
            this.errors.push(
              new ParseError({
                code: error.code,
                message: error.message,
                position: error.position,
              })
            );
          }
        }

        // 处理验证警告
        if (validationResult.warnings) {
          for (const warning of validationResult.warnings) {
            this.warnings.push({
              code: warning.code,
              message: warning.message,
              position: warning.position,
            });
          }
        }
      }

      // 返回解析结果
      return {
        ast: document,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      // 处理解析错误
      if (error instanceof ParseError) {
        return {
          ast: this.createEmptyDocument(),
          errors: [error],
          warnings: [],
        };
      } else {
        const parseError = new ParseError({
          code: ErrorCode.UNKNOWN_ERROR,
          message: `DPML解析错误: ${(error as Error).message}`,
          cause: error as Error,
        });

        return {
          ast: this.createEmptyDocument(),
          errors: [parseError],
          warnings: [],
        };
      }
    }
  }

  /**
   * 处理DPML元素节点
   * @param document 文档节点
   */
  private processElements(document: Document): void {
    // 遍历所有节点，执行DPML特定处理
    // 这里暂时不做任何处理，只是保持节点结构
  }

  /**
   * 创建空文档节点
   * @returns 空的Document节点
   */
  private createEmptyDocument(): Document {
    return {
      type: NodeType.DOCUMENT,
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 },
      },
      children: [],
    };
  }
}
