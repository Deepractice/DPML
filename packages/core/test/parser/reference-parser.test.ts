import { expect, describe, it } from 'vitest';
import { ReferenceParser } from '../../src/parser/reference/reference-parser';
import { NodeType, Reference, SourcePosition } from '../../src/types/node';

describe('ReferenceParser', () => {
  // 创建一个位置对象用于测试
  const createTestPosition = (): SourcePosition => ({
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 }
  });

  describe('findReferences', () => {
    it('应该能识别简单的@引用', () => {
      const parser = new ReferenceParser();
      const text = '这里有一个引用 @example 需要被识别';
      
      const references = parser.findReferences(text, createTestPosition());
      
      expect(references).toHaveLength(1);
      expect(references[0].protocol).toBe('id');
      expect(references[0].path).toBe('example');
    });

    it('应该能识别带有协议的@引用', () => {
      const parser = new ReferenceParser();
      const text = '这里有一个引用 @http://example.com/doc.pdf 需要被识别';
      
      const references = parser.findReferences(text, createTestPosition());
      
      expect(references).toHaveLength(1);
      expect(references[0].protocol).toBe('http');
      expect(references[0].path).toBe('//example.com/doc.pdf');
    });

    it('应该能识别多个@引用', () => {
      const parser = new ReferenceParser();
      const text = '这里有多个引用 @example1 和 @http://example.com 以及 @file:///path/to/file.txt 需要被识别';
      
      const references = parser.findReferences(text, createTestPosition());
      
      expect(references).toHaveLength(3);
      
      expect(references[0].protocol).toBe('id');
      expect(references[0].path).toBe('example1');
      
      expect(references[1].protocol).toBe('http');
      expect(references[1].path).toBe('//example.com');
      
      expect(references[2].protocol).toBe('file');
      expect(references[2].path).toBe('///path/to/file.txt');
    });

    it('应该正确处理复合引用（带有#段落标识）', () => {
      const parser = new ReferenceParser();
      const text = '这里有一个复合引用 @document#section 需要被识别';
      
      const references = parser.findReferences(text, createTestPosition());
      
      expect(references).toHaveLength(1);
      expect(references[0].protocol).toBe('id');
      expect(references[0].path).toBe('document#section');
    });

    it('应该忽略不符合格式的@符号', () => {
      const parser = new ReferenceParser();
      const text = '这里有一个电子邮件 user@example.com 不应该被识别为引用';
      
      const references = parser.findReferences(text, createTestPosition());
      
      expect(references).toHaveLength(0);
    });

    it('应该能处理引用前后有空格的情况', () => {
      const parser = new ReferenceParser();
      const text = '引用前后有空格 @example.com ，应该被正确识别';
      
      const references = parser.findReferences(text, createTestPosition());
      
      expect(references).toHaveLength(1);
      expect(references[0].protocol).toBe('id');
      expect(references[0].path).toBe('example.com');
    });
  });

  describe('extractReferenceNodes', () => {
    it('应该将文本内容中的引用提取为Reference节点', () => {
      const parser = new ReferenceParser();
      const text = '这里有一个引用 @example 在文本中';
      const position = createTestPosition();
      
      const result = parser.extractReferenceNodes(text, position);
      
      // 应该拆分为3个节点：文本、引用、文本
      expect(result).toHaveLength(3);
      
      // 第一个节点是文本
      expect(result[0].type).toBe(NodeType.CONTENT);
      expect(result[0].value).toBe('这里有一个引用 ');
      
      // 第二个节点是引用
      expect(result[1].type).toBe(NodeType.REFERENCE);
      expect((result[1] as Reference).protocol).toBe('id');
      expect((result[1] as Reference).path).toBe('example');
      
      // 第三个节点是文本
      expect(result[2].type).toBe(NodeType.CONTENT);
      expect(result[2].value).toBe(' 在文本中');
    });

    it('应该正确处理多个引用', () => {
      const parser = new ReferenceParser();
      const text = '文本中有 @ref1 和 @ref2 两个引用';
      const position = createTestPosition();
      
      const result = parser.extractReferenceNodes(text, position);
      
      // 应该拆分为5个节点：文本、引用、文本、引用、文本
      expect(result).toHaveLength(5);
      
      // 检查第一个引用
      expect(result[1].type).toBe(NodeType.REFERENCE);
      expect((result[1] as Reference).path).toBe('ref1');
      
      // 检查第二个引用
      expect(result[3].type).toBe(NodeType.REFERENCE);
      expect((result[3] as Reference).path).toBe('ref2');
    });

    it('当没有引用时应该返回原始内容节点', () => {
      const parser = new ReferenceParser();
      const text = '这个文本中没有任何引用';
      const position = createTestPosition();
      
      const result = parser.extractReferenceNodes(text, position);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NodeType.CONTENT);
      expect(result[0].value).toBe(text);
    });
  });
}); 