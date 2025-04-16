import { describe, it, expect, beforeEach } from 'vitest';
import { XMLParserAdapter } from '../../../parser/xml/xml-parser-adapter';

describe('XML解析适配器', () => {
  let parser: XMLParserAdapter;

  beforeEach(() => {
    parser = new XMLParserAdapter();
  });

  describe('基础功能', () => {
    it('应该能解析简单的XML', () => {
      const xml = '<root><child>内容</child></root>';
      const result = parser.parse(xml);

      expect(result).toBeDefined();
      expect(result.name).toBe('root');
      expect(result.children).toHaveLength(1);
      expect(result.children[0].name).toBe('child');
      expect(result.children[0].textContent).toBe('内容');
    });

    it('应该支持带属性的XML解析', () => {
      const xml = '<root id="root-id"><child name="child-name">内容</child></root>';
      const result = parser.parse(xml);

      expect(result).toBeDefined();
      expect(result.attributes).toBeDefined();
      expect(result.attributes.id).toBe('root-id');
      expect(result.children[0].attributes.name).toBe('child-name');
    });

    it('应该支持自闭合标签', () => {
      const xml = '<root><empty-tag /></root>';
      const result = parser.parse(xml);

      expect(result).toBeDefined();
      expect(result.children).toHaveLength(1);
      expect(result.children[0].name).toBe('empty-tag');
      expect(result.children[0].children).toHaveLength(0);
    });

    it('应该能正确处理命名空间', () => {
      const xml = '<root xmlns:ns="http://example.com/ns"><ns:child>内容</ns:child></root>';
      const result = parser.parse(xml);

      expect(result).toBeDefined();
      expect(result.children).toHaveLength(1);
      expect(result.children[0].name).toBe('ns:child');
      expect(result.children[0].textContent).toBe('内容');
    });
  });

  describe('错误处理', () => {
    it('应该在处理格式错误的XML时抛出异常', () => {
      const xml = '<root><child>内容</wrongtag></root>';
      expect(() => parser.parse(xml)).toThrow();
    });
  });

  describe('解析选项', () => {
    it('应该支持自定义解析选项', () => {
      const customParser = new XMLParserAdapter({
        preserveOrder: true,
        ignoreAttributes: false,
        parseAttributeValue: true
      });

      const xml = '<root id="1"><child>内容</child></root>';
      const result = customParser.parse(xml);

      expect(result).toBeDefined();
      expect(result.attributes.id).toBe(1); // 数字类型因为parseAttributeValue为true
    });
  });

  describe('位置跟踪', () => {
    it('默认情况下应该不包含位置信息', () => {
      const xml = '<root><child>内容</child></root>';
      const result = parser.parse(xml);

      expect(result.position).toBeUndefined();
    });

    it('启用位置跟踪后应该包含位置信息', () => {
      const positionParser = new XMLParserAdapter({
        trackPosition: true
      });
      
      const xml = '<root>\n  <child>内容</child>\n</root>';
      const result = positionParser.parse(xml);

      expect(result.position).toBeDefined();
      expect(result.position.start).toBeDefined();
      expect(result.position.end).toBeDefined();
      expect(result.children[0].position).toBeDefined();
    });
  });
}); 