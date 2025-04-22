import * as xml2js from 'xml2js';
import type { IXMLParser, XMLNode, XMLPosition } from './types';

/**
 * XML解析器实现
 * 底层使用xml2js库实现XML解析功能
 */
export class XMLParser implements IXMLParser {
  /**
   * 底层XML解析器实例
   */
  private parser: xml2js.Parser;

  /**
   * 解析器选项
   */
  private parserOptions: xml2js.ParserOptions = {
    explicitArray: true,     // 使用数组表示所有子元素，确保一致处理
    explicitChildren: false, // 不需要额外的子节点结构
    mergeAttrs: false,       // 保持属性在$对象中
    attrkey: '$',            // 指定属性对象名
    charkey: '_',            // 指定文本内容的键名
    includeWhiteChars: false, // 不包含空白
    trim: true,              // 裁剪值的空白
    explicitRoot: true,      // 保留根元素
    preserveChildrenOrder: true, // 保持子元素顺序
    charsAsChildren: true,    // 将字符作为子节点，确保能捕获文本内容
    normalizeTags: false,     // 不标准化标签名
    normalize: true,          // 标准化数据，便于处理
    xmlns: false,             // 不处理命名空间
    // @ts-expect-error - 类型定义中可能没有这个属性，但实际支持
    emptyTag: null,           // 空标签处理
  };

  /**
   * 创建XML解析器
   */
  constructor() {
    this.parser = new xml2js.Parser(this.parserOptions);
  }

  /**
   * 同步解析XML内容
   * @param content XML内容字符串
   * @returns 解析结果
   */
  public parse(content: string): XMLNode {
    try {
      // xml2js只提供异步API，但我们需要同步版本
      // 使用一个简单的同步XML解析作为后备
      let result;
      xml2js.parseString(content, this.parserOptions, (err, parsed) => {
        if (err) throw err;
        result = parsed;
      });

      if (!result) {
        throw new Error('XML解析失败');
      }

      return this.transformToXMLNode(result, content);
    } catch (error) {
      // 捕获并增强错误信息
      throw this.enhanceError(error, content);
    }
  }

  /**
   * 异步解析XML内容
   * @param content XML内容字符串
   * @returns 解析结果Promise
   */
  public async parseAsync(content: string): Promise<XMLNode> {
    try {
      const result = await this.parser.parseStringPromise(content);
      return this.transformToXMLNode(result, content);
    } catch (error) {
      // 捕获并增强错误信息
      throw this.enhanceError(error, content);
    }
  }

  /**
   * 配置解析器行为
   * @param options 配置选项
   */
  public configure(options: Record<string, unknown>): void {
    // 将外部配置转换为xml2js配置
    const xml2jsOptions: xml2js.ParserOptions = {};

    // 处理常见选项
    if (options.trimValues !== undefined) {
      xml2jsOptions.trim = options.trimValues as boolean;
    }

    if (options.ignoreAttributes !== undefined) {
      // 反转ignoreAttributes，因为xml2js使用相反的逻辑
      xml2jsOptions.ignoreAttrs = options.ignoreAttributes as boolean;
    }

    if (options.parseTagValue !== undefined) {
      xml2jsOptions.explicitChildren = !(options.parseTagValue as boolean);
    }

    if (options.processEntities !== undefined) {
      xml2jsOptions.normalize = options.processEntities as boolean;
    }

    // 更新解析器选项
    this.parserOptions = {
      ...this.parserOptions,
      ...xml2jsOptions
    };

    // 重新创建解析器实例以应用新配置
    this.parser = new xml2js.Parser(this.parserOptions);
  }

  /**
   * 将xml2js解析结果转换为统一的XMLNode格式
   * @param parseResult xml2js解析结果
   * @param originalContent 原始XML内容（用于位置计算）
   * @returns XMLNode格式的解析结果
   */
  private transformToXMLNode(parseResult: Record<string, unknown>, originalContent: string): XMLNode {
    // 获取根元素名称和内容
    const rootTagName = Object.keys(parseResult)[0];
    const rootContent = parseResult[rootTagName];
    
    // 处理根节点
    return this.processNode(rootTagName, rootContent, originalContent);
  }

  /**
   * 处理单个节点及其子节点
   * @param tagName 标签名
   * @param nodeContent 节点内容
   * @param originalContent 原始XML内容
   * @returns 处理后的XMLNode
   */
  private processNode(tagName: string, nodeContent: unknown, originalContent: string): XMLNode {
    // 初始化节点属性
    const attributes: Record<string, string> = {};
    let text = '';
    const children: XMLNode[] = [];
    
    // 特殊情况处理 - 如果nodeContent是数组，取第一个元素
    const content = Array.isArray(nodeContent) ? nodeContent[0] : nodeContent;
    
    if (!content) {
      // 处理空节点
      return {
        type: 'element',
        name: tagName,
        attributes,
        children: [],
        text: '',
        position: this.calculatePosition(tagName, originalContent)
      };
    }
    
    // 处理属性（在$对象中）
    if (content && typeof content === 'object' && '$' in content) {
      const attrs = content.$;
      if (attrs && typeof attrs === 'object') {
        Object.entries(attrs).forEach(([key, value]) => {
          attributes[key] = String(value);
        });
      }
    }
    
    // 处理文本内容（在_键中）
    if (content && typeof content === 'object' && '_' in content) {
      text = String(content._);
    } else if (typeof content === 'string') {
      // 直接字符串内容
      text = content;
    }
    
    // 文本内容可能在数组的第一个元素中（如<title>文本</title>）
    if (!text && Array.isArray(content) && content.length > 0) {
      const firstItem = content[0];
      if (typeof firstItem === 'string') {
        text = firstItem;
      } else if (firstItem && typeof firstItem === 'object' && '_' in firstItem) {
        text = String(firstItem._);
      }
    }
    
    // 处理子节点
    // 遍历所有键，跳过$和_，它们分别表示属性和文本内容
    if (content && typeof content === 'object') {
      Object.keys(content).forEach(key => {
        if (key === '$' || key === '_') return;
        
        // 子节点始终是数组（由于explicitArray设置为true）
        const childItems = (content as Record<string, unknown>)[key];
        if (Array.isArray(childItems)) {
          childItems.forEach(childItem => {
            // 递归处理每个子节点
            const childNode = this.processNode(key, [childItem], originalContent);
            children.push(childNode);
          });
        }
      });
    }
    
    // 返回完整的节点结构
    return {
      type: 'element',
      name: tagName,
      attributes,
      children,
      text,
      position: this.calculatePosition(tagName, originalContent)
    };
  }

  /**
   * 计算节点位置
   * @param nodeName 节点名称
   * @param content 原始内容
   * @returns 位置信息
   */
  private calculatePosition(nodeName: string, content: string): XMLPosition | undefined {
    try {
      // 简单查找开始和结束标签
      const startPos = content.indexOf(`<${nodeName}`);
      if (startPos === -1) return undefined;
      
      const closePos = content.indexOf(`</${nodeName}>`, startPos);
      const endPos = closePos !== -1 ? closePos + `</${nodeName}>`.length : content.indexOf('>', startPos) + 1;
      
      // 计算行列信息
      const contentBeforeStart = content.substring(0, startPos);
      const startLine = (contentBeforeStart.match(/\n/g) || []).length + 1;
      const startColumn = startPos - (contentBeforeStart.lastIndexOf('\n') > -1 ? contentBeforeStart.lastIndexOf('\n') : 0);
      
      const contentBeforeEnd = content.substring(0, endPos);
      const endLine = (contentBeforeEnd.match(/\n/g) || []).length + 1;
      const endColumn = endPos - (contentBeforeEnd.lastIndexOf('\n') > -1 ? contentBeforeEnd.lastIndexOf('\n') : 0);
      
      return {
        start: {
          line: startLine,
          column: Math.max(1, startColumn),
          offset: startPos
        },
        end: {
          line: endLine,
          column: Math.max(1, endColumn),
          offset: endPos
        }
      };
    } catch {
      // 位置计算失败
      return undefined;
    }
  }

  /**
   * 提取错误上下文
   * @param content 原始内容
   * @param errorPos 错误位置
   * @returns 错误上下文字符串
   */
  private extractErrorContext(content: string, errorPos: number): string {
    try {
      // 计算上下文范围
      const start = Math.max(0, errorPos - 40);
      const end = Math.min(content.length, errorPos + 40);
      
      // 提取上下文片段
      return content.substring(start, end);
    } catch {
      // 提取上下文失败
      return '';
    }
  }

  /**
   * 增强错误信息
   * @param error 原始错误
   * @param content 原始内容
   * @returns 增强后的错误
   */
  private enhanceError(error: unknown, content: string): Error {
    if (error instanceof Error) {
      // 尝试提取位置信息
      const lineMatch = error.message.match(/line\s*(\d+)(?:,|\s+column\s+)(\d+)/i);
      if (lineMatch) {
        const line = parseInt(lineMatch[1], 10);
        const column = parseInt(lineMatch[2], 10);
        
        // 计算内容中的实际位置
        let errorPos = 0;
        const lines = content.split('\n');
        for (let i = 0; i < Math.min(line - 1, lines.length); i++) {
          errorPos += lines[i].length + 1; // +1 for the newline character
        }
        errorPos += Math.min(column, lines[Math.min(line - 1, lines.length - 1)].length);
        
        // 提取上下文
        const errorContext = this.extractErrorContext(content, errorPos);
        
        // 创建包含详细位置信息的新错误
        const enhancedError = new Error(
          `XML解析错误: ${error.message}\n位置: 行 ${line}, 列 ${column}\n上下文: ${errorContext}`
        );
        enhancedError.stack = error.stack;
        return enhancedError;
      }
    }
    
    // 无法增强时返回原始错误，确保始终返回Error类型
    return error instanceof Error ? error : new Error(String(error));
  }
}