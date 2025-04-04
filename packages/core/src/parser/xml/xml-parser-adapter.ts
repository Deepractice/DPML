import { XMLParser as FastXMLParser } from 'fast-xml-parser';
import { XMLNode, XMLParserOptions } from './types';
import { ParseError } from '../../errors';
import { ErrorCode } from '../../errors/types';

/**
 * XML解析适配器，使用fast-xml-parser库
 */
export class XMLParserAdapter {
  /**
   * 底层XML解析器实例
   */
  private parser: FastXMLParser;
  
  /**
   * 位置跟踪选项
   */
  private trackPosition: boolean;
  
  /**
   * 构造函数，创建一个适配器实例
   * @param options 解析选项
   */
  constructor(options?: XMLParserOptions) {
    // 确保合理的默认选项
    this.trackPosition = options?.trackPosition ?? false;
    
    const parserOptions = {
      ignoreAttributes: options?.ignoreAttributes ?? false,
      attributeNamePrefix: '',
      attributesGroupName: 'attributes',
      textNodeName: 'textContent',
      preserveOrder: options?.preserveOrder ?? true,
      parseAttributeValue: options?.parseAttributeValue ?? false,
      cdataTagName: '__cdata',
      trimValues: true,
      parseTagValue: true,
      isArray: () => false, // 不自动转换为数组
      // 启用位置跟踪
      localeRange: true, // 始终启用内部位置跟踪，但根据选项决定是否在结果中包含
      // 严格模式，遇到解析错误时抛出异常
      stopNodes: [],
      allowBooleanAttributes: true,
      alwaysCreateTextNode: true
    };
    
    this.parser = new FastXMLParser(parserOptions);
  }
  
  /**
   * 解析XML文本
   * @param xml XML文本
   * @returns 解析后的XML节点树
   */
  parse(xml: string): XMLNode {
    try {
      // 预检查XML格式
      this.validateXML(xml);
      
      // 使用fast-xml-parser解析XML文本
      const parsedObj = this.parser.parse(xml);
      
      // 解析文本的行信息，用于手动计算位置
      const lines = xml.split('\n');
      const lineOffsets = this.calculateLineOffsets(lines);
      
      // 转换成我们的XML节点结构
      const result = this.processRootElement(parsedObj[0], xml, lineOffsets);
      
      // 手动添加位置信息（如果启用）
      if (this.trackPosition) {
        // 为根元素添加位置信息
        if (!result.position) {
          result.position = {
            start: { line: 1, column: 1, offset: 0 },
            end: { 
              line: lineOffsets.length, 
              column: xml.length - lineOffsets[lineOffsets.length - 1] + 1, 
              offset: xml.length 
            }
          };
        }
        
        // 递归为子元素添加位置信息
        this.addPositionToChildren(result.children, xml, lineOffsets);
      }
      
      return result;
    } catch (error) {
      throw new ParseError({
        code: ErrorCode.INVALID_XML,
        message: `XML解析错误: ${(error as Error).message}`,
        cause: error as Error
      });
    }
  }
  
  /**
   * 计算每行的起始偏移量
   * @param lines 文本行数组
   * @returns 每行的起始偏移量数组
   */
  private calculateLineOffsets(lines: string[]): number[] {
    const offsets: number[] = [0]; // 第一行从0开始
    
    for (let i = 0; i < lines.length - 1; i++) {
      offsets.push(offsets[i] + lines[i].length + 1); // +1 是换行符
    }
    
    return offsets;
  }
  
  /**
   * 验证XML格式
   * @param xml XML文本
   * @throws 格式错误时抛出异常
   */
  private validateXML(xml: string): void {
    // 简单格式检查
    if (!xml || typeof xml !== 'string') {
      throw new Error('XML内容不能为空');
    }
    
    // 检查标签匹配
    const stack: string[] = [];
    const regex = /<\/?([^\s/>]+)[^>]*?>/g;
    let match;
    
    while ((match = regex.exec(xml))) {
      const [fullTag, tagName] = match;
      
      // 自闭合标签跳过
      if (fullTag.endsWith('/>')) {
        continue;
      }
      
      // 结束标签
      if (fullTag.startsWith('</')) {
        if (stack.length === 0 || stack.pop() !== tagName) {
          throw new Error(`标签不匹配: ${tagName}`);
        }
      } 
      // 开始标签
      else if (!fullTag.startsWith('<?') && !fullTag.startsWith('<!')) {
        stack.push(tagName);
      }
    }
    
    // 检查是否所有标签都已闭合
    if (stack.length > 0) {
      throw new Error(`未闭合的标签: ${stack.join(', ')}`);
    }
  }
  
  /**
   * 处理根元素
   * @param rootElement 解析后的根元素对象
   * @param xmlText 原始XML文本
   * @param lineOffsets 行偏移量数组
   * @returns XMLNode结构的根节点
   */
  private processRootElement(rootElement: any, xmlText: string, lineOffsets: number[]): XMLNode {
    // 获取根标签名（排除特殊属性键）
    const rootTagName = Object.keys(rootElement).find(key => key !== ':@');
    
    if (!rootTagName) {
      throw new ParseError({
        code: ErrorCode.INVALID_XML,
        message: '无法识别根元素标签名'
      });
    }
    
    // 创建根节点
    const rootNode: XMLNode = {
      name: rootTagName,
      children: []
    };
    
    // 处理根节点的属性
    if (rootElement[':@']) {
      if (rootElement[':@'].attributes) {
        rootNode.attributes = { ...rootElement[':@'].attributes };
      }
      
      // 处理位置信息
      const posData = rootElement[':@']['@_vp'] || rootElement[':@']['@position'];
      
      // 如果启用了位置跟踪，添加位置信息
      if (this.trackPosition) {
        if (posData) {
          rootNode.position = this.convertPosition(posData);
        } else {
          // 手动添加位置信息
          rootNode.position = {
            start: { line: 1, column: 1, offset: 0 },
            end: { 
              line: lineOffsets.length, 
              column: xmlText.length - lineOffsets[lineOffsets.length - 1], 
              offset: xmlText.length 
            }
          };
        }
      }
    }
    
    // 处理子元素
    const childElements = rootElement[rootTagName];
    if (Array.isArray(childElements)) {
      for (const element of childElements) {
        // 处理文本内容
        if ('textContent' in element) {
          rootNode.textContent = element.textContent;
        }
        // 处理CDATA内容
        else if ('__cdata' in element) {
          rootNode.textContent = element.__cdata;
        }
        // 处理子元素
        else {
          const childName = Object.keys(element).find(key => key !== ':@');
          if (childName) {
            const childNode = this.processChildElement(childName, element, xmlText, lineOffsets);
            rootNode.children.push(childNode);
          }
        }
      }
    }
    
    return rootNode;
  }
  
  /**
   * 处理子元素
   * @param tagName 标签名
   * @param element 元素数据
   * @param xmlText 原始XML文本
   * @param lineOffsets 行偏移量数组
   * @returns 创建的子节点
   */
  private processChildElement(tagName: string, element: any, xmlText: string, lineOffsets: number[]): XMLNode {
    const childNode: XMLNode = {
      name: tagName,
      children: []
    };
    
    // 处理属性
    if (element[':@']) {
      if (element[':@'].attributes) {
        childNode.attributes = { ...element[':@'].attributes };
      }
      
      // 处理位置信息
      const posData = element[':@']['@_vp'] || element[':@']['@position'];
      
      // 如果启用了位置跟踪，添加位置信息
      if (this.trackPosition) {
        if (posData) {
          childNode.position = this.convertPosition(posData);
        } else {
          // 查找标签在XML中的位置
          const tagPattern = new RegExp(`<${tagName}[^>]*>|<${tagName}[^>]*/>`, 'g');
          let match;
          let found = false;
          
          while ((match = tagPattern.exec(xmlText)) !== null && !found) {
            const startOffset = match.index;
            const tagLength = match[0].length;
            
            // 根据偏移量计算行列号
            const startLine = this.getLineFromOffset(startOffset, lineOffsets);
            const startColumn = startOffset - lineOffsets[startLine - 1] + 1;
            
            // 找到对应的结束标签
            const closeTagPattern = new RegExp(`</${tagName}>`, 'g');
            closeTagPattern.lastIndex = startOffset + tagLength;
            const closeMatch = closeTagPattern.exec(xmlText);
            
            let endOffset, endLine, endColumn;
            
            if (closeMatch) {
              endOffset = closeMatch.index + closeMatch[0].length;
              endLine = this.getLineFromOffset(endOffset, lineOffsets);
              endColumn = endOffset - lineOffsets[endLine - 1] + 1;
            } else {
              // 自闭合标签
              endOffset = startOffset + tagLength;
              endLine = startLine;
              endColumn = startColumn + tagLength;
            }
            
            childNode.position = {
              start: { line: startLine, column: startColumn, offset: startOffset },
              end: { line: endLine, column: endColumn, offset: endOffset }
            };
            
            found = true;
          }
          
          // 如果没有找到位置，使用默认位置
          if (!childNode.position) {
            childNode.position = {
              start: { line: 1, column: 1, offset: 0 },
              end: { line: 1, column: 1, offset: 0 }
            };
          }
        }
      }
    }
    
    // 处理子元素内容
    const content = element[tagName];
    if (Array.isArray(content)) {
      for (const item of content) {
        // 处理文本内容
        if ('textContent' in item) {
          childNode.textContent = item.textContent;
        }
        // 处理CDATA内容
        else if ('__cdata' in item) {
          childNode.textContent = item.__cdata;
        }
        // 处理嵌套子元素
        else {
          const nestedName = Object.keys(item).find(key => key !== ':@');
          if (nestedName) {
            const nestedNode = this.processChildElement(nestedName, item, xmlText, lineOffsets);
            childNode.children.push(nestedNode);
          }
        }
      }
    } else if (typeof content === 'string') {
      // 处理简单文本内容的情况
      childNode.textContent = content;
    }
    
    return childNode;
  }
  
  /**
   * 从偏移量获取行号
   * @param offset 字符偏移量
   * @param lineOffsets 行偏移量数组
   * @returns 行号（从1开始）
   */
  private getLineFromOffset(offset: number, lineOffsets: number[]): number {
    for (let i = lineOffsets.length - 1; i >= 0; i--) {
      if (offset >= lineOffsets[i]) {
        return i + 1;
      }
    }
    return 1;
  }
  
  /**
   * 转换位置信息
   * @param positionData 位置数据
   * @returns 标准化的位置信息
   */
  private convertPosition(positionData: any): any {
    if (!positionData) return undefined;
    
    return {
      start: {
        line: positionData.startLine || 1,
        column: positionData.startCol || 1,
        offset: positionData.startOffset || 0
      },
      end: {
        line: positionData.endLine || 1,
        column: positionData.endCol || 1,
        offset: positionData.endOffset || 0
      }
    };
  }
  
  /**
   * 递归为子元素添加位置信息
   * @param children 子元素数组
   * @param xmlText 原始XML文本
   * @param lineOffsets 行偏移量数组
   */
  private addPositionToChildren(children: XMLNode[], xmlText: string, lineOffsets: number[]): void {
    if (!children || children.length === 0) return;
    
    for (const child of children) {
      if (!child.position) {
        // 查找标签在XML中的位置
        const tagPattern = new RegExp(`<${child.name}[^>]*>|<${child.name}[^>]*/>`, 'g');
        let match;
        let found = false;
        
        while ((match = tagPattern.exec(xmlText)) !== null && !found) {
          const startOffset = match.index;
          const tagLength = match[0].length;
          
          // 根据偏移量计算行列号
          const startLine = this.getLineFromOffset(startOffset, lineOffsets);
          const startColumn = startOffset - lineOffsets[startLine - 1] + 1;
          
          // 找到对应的结束标签
          const closeTagPattern = new RegExp(`</${child.name}>`, 'g');
          closeTagPattern.lastIndex = startOffset + tagLength;
          const closeMatch = closeTagPattern.exec(xmlText);
          
          let endOffset, endLine, endColumn;
          
          if (closeMatch) {
            endOffset = closeMatch.index + closeMatch[0].length;
            endLine = this.getLineFromOffset(endOffset, lineOffsets);
            endColumn = endOffset - lineOffsets[endLine - 1] + 1;
          } else {
            // 自闭合标签
            endOffset = startOffset + tagLength;
            endLine = startLine;
            endColumn = startColumn + tagLength;
          }
          
          child.position = {
            start: { line: startLine, column: startColumn, offset: startOffset },
            end: { line: endLine, column: endColumn, offset: endOffset }
          };
          
          found = true;
        }
        
        // 如果没有找到位置，使用默认位置
        if (!child.position) {
          child.position = {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
          };
        }
      }
      
      // 递归处理子元素的子元素
      this.addPositionToChildren(child.children, xmlText, lineOffsets);
    }
  }
} 