import { XMLParser } from 'fast-xml-parser';

import { ParseError } from '../../types/ParseError';
import type { SourceLocation } from '../../types/SourceLocation';

import type { XMLNode, XMLParserOptions } from './types';

/**
 * XML解析适配器
 * 使用fast-xml-parser库解析XML文本
 */
export class XmlParserAdapter {
  /**
   * 底层XML解析器实例
   */
  private parser: XMLParser;

  /**
   * 位置跟踪选项
   */
  private trackPosition: boolean;

  /**
   * 构造函数
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
      alwaysCreateTextNode: true,
    };

    this.parser = new XMLParser(parserOptions);
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
              offset: xml.length,
            },
          };
        }

        // 递归为子元素添加位置信息
        this.addPositionToChildren(result.children, xml, lineOffsets);
      }

      return result;
    } catch (error) {
      // 创建源位置信息
      const location: SourceLocation = {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 1,
        getLineSnippet: () => xml.split('\n')[0] || ''
      };

      // 如果错误中包含位置信息，使用它
      if (error instanceof Error && 'line' in error && 'column' in error) {
        const errorWithPos = error as Error & { line: number; column: number };

        location.startLine = errorWithPos.line;
        location.startColumn = errorWithPos.column;
        location.endLine = errorWithPos.line;
        location.endColumn = errorWithPos.column + 1;

        // 更新行片段
        if (errorWithPos.line > 0 && errorWithPos.line <= xml.split('\n').length) {
          const errorLine = xml.split('\n')[errorWithPos.line - 1];

          location.getLineSnippet = () => errorLine || '';
        }
      }

      throw new ParseError(`XML解析错误: ${(error as Error).message}`, location, {
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

    try {
      // 处理CDATA部分，暂时替换为特殊标记，以避免影响标签匹配检查
      const cdataPattern = /<\!\[CDATA\[(.*?)\]\]>/gs;
      const xmlWithoutCdata = xml.replace(cdataPattern, '__CDATA_CONTENT__');

      // 处理注释
      const commentPattern = /<!--(.*?)-->/gs;
      const xmlWithoutComments = xmlWithoutCdata.replace(commentPattern, '');

      // 检查标签匹配
      const stack: string[] = [];
      const regex = /<\/?([^\s>]+)[^>]*?>/g;
      let match;

      while ((match = regex.exec(xmlWithoutComments))) {
        const [fullTag, tagName] = match;

        // 自闭合标签跳过
        if (fullTag.endsWith('/>')) {
          continue;
        }

        // 忽略XML声明和DOCTYPE
        if (fullTag.startsWith('<?') || fullTag.startsWith('<!DOCTYPE')) {
          continue;
        }

        // 结束标签
        if (fullTag.startsWith('</')) {
          if (stack.length === 0 || stack.pop() !== tagName) {
            throw new Error(`标签不匹配: ${tagName}`);
          }
        } else {
          // 开始标签
          stack.push(tagName);
        }
      }

      // 检查是否所有标签都已闭合
      if (stack.length > 0) {
        throw new Error(`未闭合的标签: ${stack.join(', ')}`);
      }
    } catch (error) {
      // 如果是我们抛出的错误，直接重新抛出
      if (error instanceof Error) {
        throw error;
      }
      // 其他错误包装一下
      throw new Error(`XML格式验证失败: ${String(error)}`);
    }
  }

  /**
   * 处理根元素
   * @param rootElement 解析后的根元素对象
   * @param xmlText 原始XML文本
   * @param lineOffsets 行偏移量数组
   * @returns XMLNode结构的根节点
   */
  private processRootElement(
    rootElement: Record<string, unknown>,
    xmlText: string,
    lineOffsets: number[]
  ): XMLNode {
    // 获取根标签名（排除特殊属性键）
    const rootTagName = Object.keys(rootElement).find(key => key !== ':@');

    if (!rootTagName) {
      // 创建源位置信息
      const location: SourceLocation = {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 1,
        getLineSnippet: () => xmlText.split('\n')[0] || ''
      };

      throw new ParseError('无法识别根元素标签名', location);
    }

    // 创建根节点
    const rootNode: XMLNode = {
      name: rootTagName,
      children: [],
    };

    // 处理根元素属性
    if (rootElement[':@'] && (rootElement[':@'] as Record<string, unknown>).attributes) {
      rootNode.attributes = { ...(rootElement[':@'] as Record<string, Record<string, unknown>>).attributes };
    }

    // 处理子元素
    const childElements = rootElement[rootTagName];

    if (Array.isArray(childElements)) {
      for (const element of childElements) {
        // 处理文本内容
        if ('textContent' in element) {
          rootNode.textContent = element.textContent as string;
        } else if ('__cdata' in element) { // 处理CDATA内容
          rootNode.textContent = element.__cdata as string;
        } else { // 处理子元素
          const childName = Object.keys(element).find(key => key !== ':@');

          if (childName) {
            const childNode = this.processChildElement(
              childName,
              element as Record<string, unknown>,
              xmlText,
              lineOffsets
            );

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
  private processChildElement(
    tagName: string,
    element: Record<string, unknown>,
    xmlText: string,
    lineOffsets: number[]
  ): XMLNode {
    const childNode: XMLNode = {
      name: tagName,
      children: [],
    };

    // 处理属性
    if (element[':@']) {
      if ((element[':@'] as Record<string, unknown>).attributes) {
        childNode.attributes = { ...(element[':@'] as Record<string, Record<string, unknown>>).attributes };
      }

      // 处理位置信息
      const posData = (element[':@'] as Record<string, unknown>)['@_vp'] ||
        (element[':@'] as Record<string, unknown>)['@position'];

      // 如果启用了位置跟踪，添加位置信息
      if (this.trackPosition && posData) {
        childNode.position = this.convertPosition(posData as Record<string, number>);
      }
    }

    // 处理子元素内容
    const content = element[tagName];

    if (Array.isArray(content)) {
      for (const item of content) {
        // 处理文本内容
        if ('textContent' in item) {
          childNode.textContent = item.textContent as string;
        } else if ('__cdata' in item) { // 处理CDATA内容
          childNode.textContent = item.__cdata as string;
        } else { // 处理嵌套子元素
          const nestedName = Object.keys(item).find(key => key !== ':@');

          if (nestedName) {
            const nestedNode = this.processChildElement(
              nestedName,
              item as Record<string, unknown>,
              xmlText,
              lineOffsets
            );

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
   * 递归为子元素添加位置信息
   * @param children 子元素数组
   * @param xmlText 原始XML文本
   * @param lineOffsets 行偏移量数组
   */
  private addPositionToChildren(
    children: XMLNode[],
    xmlText: string,
    lineOffsets: number[]
  ): void {
    for (const child of children) {
      if (!child.position) {
        // 尝试从XML文本中查找标签位置
        const tagPattern = new RegExp(
          `<${child.name}[^>]*>|<${child.name}[^>]*/>`,
          'g'
        );
        let match;
        let found = false;

        while ((match = tagPattern.exec(xmlText)) && !found) {
          // 计算位置
          const startOffset = match.index;
          const endOffset = startOffset + match[0].length;

          // 计算行列
          const startLine = this.getLineFromOffset(startOffset, lineOffsets);
          const startColumn = startOffset - lineOffsets[startLine - 1] + 1;
          const endLine = this.getLineFromOffset(endOffset, lineOffsets);
          const endColumn = endOffset - lineOffsets[endLine - 1] + 1;

          child.position = {
            start: { line: startLine, column: startColumn, offset: startOffset },
            end: { line: endLine, column: endColumn, offset: endOffset },
          };

          found = true;
        }
      }

      // 递归处理子元素
      if (child.children && child.children.length > 0) {
        this.addPositionToChildren(child.children, xmlText, lineOffsets);
      }
    }
  }

  /**
   * 根据偏移量获取行号
   * @param offset 字符偏移量
   * @param lineOffsets 行偏移量数组
   * @returns 行号（1-indexed）
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
   * @param posData 位置数据
   * @returns 转换后的位置信息
   */
  private convertPosition(posData: Record<string, number>): {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  } {
    // 处理不同格式的位置数据
    if (posData.startLine !== undefined) {
      return {
        start: {
          line: posData.startLine,
          column: posData.startCol || 1,
          offset: posData.startOffset || 0,
        },
        end: {
          line: posData.endLine || posData.startLine,
          column: posData.endCol || posData.startCol || 1,
          offset: posData.endOffset || posData.startOffset || 0,
        },
      };
    } else if (posData.line !== undefined) {
      return {
        start: {
          line: posData.line,
          column: posData.col || 1,
          offset: posData.offset || 0,
        },
        end: {
          line: posData.line,
          column: (posData.col || 1) + 1,
          offset: (posData.offset || 0) + 1,
        },
      };
    }

    // 默认位置
    return {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
    };
  }
}
