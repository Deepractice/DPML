import { 
  Content,
  Node,
  NodeType,
  Reference,
  SourcePosition 
} from '../../types/node';
import { ErrorCode } from '../../errors/types';
import { ParseError } from '../../errors';

/**
 * 引用解析器，负责识别和提取文本中的引用
 */
export class ReferenceParser {
  /**
   * DPML引用正则表达式
   * 匹配模式：
   * 1. @符号前必须是空白字符或行首
   * 2. 协议部分可选，如http:、file:等
   * 3. 路径部分可以包含字母、数字、下划线、连字符、点、斜杠、问号、等号、&符号等
   * 4. 支持#fragment片段
   * 5. 结尾必须是空白字符、标点符号或行尾
   */
  private readonly REFERENCE_REGEX = /(?<=^|\s)@(?:([a-zA-Z][a-zA-Z0-9+.-]*)(?::|\/\/)|)([a-zA-Z0-9_\-./#?=&]+(?:#[a-zA-Z0-9_\-.]+)?)(?=\s|$|[,.;:!?)])/g;

  /**
   * 从文本中查找所有引用
   * @param text 要分析的文本
   * @param position 文本在源文档中的位置
   * @returns 找到的引用节点数组
   */
  findReferences(text: string, position: SourcePosition): Reference[] {
    if (!text) {
      return [];
    }

    const references: Reference[] = [];
    let match;

    // 重置正则表达式的lastIndex
    this.REFERENCE_REGEX.lastIndex = 0;

    // 查找所有匹配项
    while ((match = this.REFERENCE_REGEX.exec(text)) !== null) {
      const fullMatch = match[0];
      const protocol = match[1] || 'id'; // 如果没有指定协议，默认为id
      const path = match[2];
      
      // 计算引用的位置
      const refPosition = this.calculateReferencePosition(position, match.index, fullMatch.length);
      
      // 创建引用节点
      const reference: Reference = {
        type: NodeType.REFERENCE,
        protocol,
        path,
        position: refPosition
      };
      
      references.push(reference);
    }

    return references;
  }

  /**
   * 将文本内容提取为文本节点和引用节点的混合数组
   * @param text 要处理的文本
   * @param position 文本在源文档中的位置
   * @returns 处理后的节点数组
   */
  extractReferenceNodes(text: string, position: SourcePosition): Node[] {
    if (!text) {
      return [this.createContentNode('', position)];
    }

    // 查找所有引用
    const references = this.findReferences(text, position);
    
    // 如果没有找到引用，直接返回原始内容节点
    if (references.length === 0) {
      return [this.createContentNode(text, position)];
    }

    const result: Node[] = [];
    let lastIndex = 0;
    
    // 重置正则表达式的lastIndex
    this.REFERENCE_REGEX.lastIndex = 0;
    
    // 查找所有匹配项并拆分文本
    let match;
    while ((match = this.REFERENCE_REGEX.exec(text)) !== null) {
      const matchIndex = match.index;
      const fullMatch = match[0];
      
      // 添加引用前的文本
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        const textPosition = this.calculateContentPosition(position, lastIndex, textBefore.length);
        result.push(this.createContentNode(textBefore, textPosition));
      }
      
      // 查找对应的引用节点并添加
      const refIndex = references.findIndex(ref => 
        ref.position.start.offset === position.start.offset + matchIndex
      );
      
      if (refIndex !== -1) {
        result.push(references[refIndex]);
      } else {
        // 异常情况：找不到对应的引用节点
        throw new ParseError({
          code: ErrorCode.INVALID_REFERENCE,
          message: `引用解析错误: 无法匹配引用 "${fullMatch}"`
        });
      }
      
      lastIndex = matchIndex + fullMatch.length;
    }
    
    // 添加最后一段文本
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      const textPosition = this.calculateContentPosition(position, lastIndex, textAfter.length);
      result.push(this.createContentNode(textAfter, textPosition));
    }
    
    return result;
  }

  /**
   * 创建内容节点
   * @param text 文本内容
   * @param position 位置信息
   * @returns 内容节点
   */
  private createContentNode(text: string, position: SourcePosition): Content {
    return {
      type: NodeType.CONTENT,
      value: text,
      position
    };
  }

  /**
   * 计算引用节点的位置
   * @param basePosition 基础位置
   * @param startOffset 相对于基础位置的起始偏移量
   * @param length 引用的长度
   * @returns 引用节点的位置
   */
  private calculateReferencePosition(
    basePosition: SourcePosition,
    startOffset: number,
    length: number
  ): SourcePosition {
    // 简化实现：只调整偏移量，不计算行号和列号
    return {
      start: {
        line: basePosition.start.line,
        column: basePosition.start.column + startOffset,
        offset: basePosition.start.offset + startOffset
      },
      end: {
        line: basePosition.start.line,
        column: basePosition.start.column + startOffset + length,
        offset: basePosition.start.offset + startOffset + length
      }
    };
  }

  /**
   * 计算内容节点的位置
   * @param basePosition 基础位置
   * @param startOffset 相对于基础位置的起始偏移量
   * @param length 内容的长度
   * @returns 内容节点的位置
   */
  private calculateContentPosition(
    basePosition: SourcePosition,
    startOffset: number,
    length: number
  ): SourcePosition {
    // 简化实现：只调整偏移量，不计算行号和列号
    return {
      start: {
        line: basePosition.start.line,
        column: basePosition.start.column + startOffset,
        offset: basePosition.start.offset + startOffset
      },
      end: {
        line: basePosition.start.line,
        column: basePosition.start.column + startOffset + length,
        offset: basePosition.start.offset + startOffset + length
      }
    };
  }
} 