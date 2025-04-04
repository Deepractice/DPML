import { XMLParserAdapter } from './xml/xml-parser-adapter';
import { XMLToNodeConverter } from './xml/xml-to-node-converter';
import { ParseOptions, ParseResult } from './interfaces';
import { Document, NodeType } from '../types/node';
import { ParseError } from '../errors';
import { ErrorCode } from '../errors/types';

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
   * 构造函数
   * @param options 解析选项
   */
  constructor(options?: ParseOptions) {
    // 创建XML解析适配器，启用位置跟踪
    this.xmlParser = new XMLParserAdapter({
      trackPosition: true,
      preserveOrder: true
    });
    
    // 创建XML到DPML节点转换器
    this.nodeConverter = new XMLToNodeConverter();
  }
  
  /**
   * 解析DPML文本
   * @param input DPML文本
   * @param options 解析选项
   * @returns 解析结果
   */
  async parse(input: string, options?: ParseOptions): Promise<ParseResult> {
    try {
      // 步骤1: 使用XML解析适配器解析文本
      const xmlNode = this.xmlParser.parse(input);
      
      // 步骤2: 将XML节点转换为DPML节点
      const dpmlNode = this.nodeConverter.convert(xmlNode);
      
      // 步骤3: 创建Document节点作为根节点
      const document: Document = {
        type: NodeType.DOCUMENT,
        position: dpmlNode.position,
        children: [dpmlNode]
      };
      
      // 步骤4: 处理元素节点，执行额外的DPML特定处理
      if (document.children.length > 0) {
        this.processElements(document);
      }
      
      // 返回解析结果
      return {
        ast: document,
        errors: [],
        warnings: []
      };
    } catch (error) {
      // 处理解析错误
      if (error instanceof ParseError) {
        return {
          ast: this.createEmptyDocument(),
          errors: [error],
          warnings: []
        };
      } else {
        const parseError = new ParseError({
          code: ErrorCode.UNKNOWN_ERROR,
          message: `DPML解析错误: ${(error as Error).message}`,
          cause: error as Error
        });
        
        return {
          ast: this.createEmptyDocument(),
          errors: [parseError],
          warnings: []
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
    // 例如，处理继承属性、控制属性等
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
        end: { line: 1, column: 1, offset: 0 }
      },
      children: []
    };
  }
} 