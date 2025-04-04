import { XMLParserAdapter } from './xml/xml-parser-adapter';
import { XMLToNodeConverter } from './xml/xml-to-node-converter';
import { ParseOptions, ParseResult, ParseWarning } from './interfaces';
import { Document, NodeType, SourcePosition, Element, Node } from '../types/node';
import { ParseError } from '../errors';
import { ErrorCode, ErrorPosition } from '../errors/types';
import { TagRegistry } from './tag-registry';
import { Validator } from './validator';
import { CoreAttributeProcessor } from './attribute-processors/core-attributes';

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
  
  private coreAttributeProcessor: CoreAttributeProcessor;
  private idRegistry: Map<string, Element> = new Map();
  private errors: Array<ParseError> = [];
  private warnings: Array<ParseWarning> = [];
  private parserMode: string = 'strict';
  private documentLang: string = 'en';
  
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
    
    // 创建标签注册表
    this.tagRegistry = new TagRegistry();
    
    // 如果提供了验证选项且启用了验证，创建验证器
    if (options?.validate) {
      this.validator = new Validator(this.tagRegistry);
    }
    
    // 初始化属性处理器
    this.coreAttributeProcessor = new CoreAttributeProcessor();
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
      this.idRegistry.clear();
      this.errors = [];
      this.warnings = [];
      this.parserMode = 'strict';
      this.documentLang = 'en';

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
      
      // 步骤5: 如果启用了验证，执行验证
      if ((options?.validate || this.validator) && document.children.length > 0) {
        // 如果未创建验证器，但启用了验证，创建验证器
        if (!this.validator) {
          this.validator = new Validator(this.tagRegistry);
        }
        
        // 执行验证
        const validationResult = this.validator.validateDocument(document);
        
        // 处理验证错误
        if (!validationResult.valid && validationResult.errors) {
          for (const error of validationResult.errors) {
            this.errors.push(new ParseError({
              code: error.code,
              message: error.message,
              position: error.position
            }));
          }
        }
        
        // 处理验证警告
        if (validationResult.warnings) {
          for (const warning of validationResult.warnings) {
            this.warnings.push({
              code: warning.code,
              message: warning.message,
              position: warning.position
            });
          }
        }
      }
      
      // 处理核心属性
      this.processAttributes(document);
      
      // 返回解析结果
      return {
        ast: document,
        errors: this.errors,
        warnings: this.warnings
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
  
  /**
   * 处理文档中的属性
   * @param document 文档节点
   */
  private processAttributes(document: Document): void {
    // 处理根元素属性
    if (document.children.length > 0 && document.children[0].type === 'element') {
      const rootElement = document.children[0] as Element;
      this.processElementAttributes(rootElement, true);
    }
    
    // 递归处理所有其他元素
    this.processNodeAttributes(document);
  }
  
  /**
   * 递归处理节点及其子节点的属性
   * @param node 节点
   */
  private processNodeAttributes(node: Node): void {
    if (node.type === 'element') {
      this.processElementAttributes(node as Element);
      
      // 处理子节点
      (node as Element).children.forEach(child => {
        this.processNodeAttributes(child);
      });
    }
  }
  
  /**
   * 处理元素属性
   * @param element 元素节点
   * @param isRoot 是否为根元素
   */
  private processElementAttributes(element: Element, isRoot: boolean = false): void {
    // 处理核心属性
    const coreContext = {
      parserMode: this.parserMode,
      documentLang: this.documentLang,
      idRegistry: this.idRegistry,
      currentNode: element,
      addWarning: (code: string, message?: string, position?: SourcePosition) => {
        this.warnings.push({
          code,
          message: message || code,
          position: position ? {
            line: position.start.line,
            column: position.start.column,
            offset: position.start.offset
          } : undefined
        });
      },
      addError: (code: string, message?: string, position?: SourcePosition) => {
        this.errors.push(new ParseError({
          code,
          message: message || code,
          position: position ? {
            line: position.start.line,
            column: position.start.column,
            offset: position.start.offset
          } : undefined
        }));
      }
    };
    
    // 使用核心属性处理器处理属性
    this.coreAttributeProcessor.processAttributes(element, coreContext, isRoot);
    
    // 更新解析器状态
    this.parserMode = coreContext.parserMode;
    this.documentLang = coreContext.documentLang;
  }
} 