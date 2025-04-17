/**
 * XMLParserAdapter单元测试
 */
import { describe, test, expect } from 'vitest';

import { XmlParserAdapter } from '../../../../core/parser/XmlParserAdapter';
import { ParseError } from '../../../../types/ParseError';

describe('UT-Parser-XMLAdapter', () => {
  // 创建解析适配器实例
  let parser: XmlParserAdapter;

  beforeEach(() => {
    parser = new XmlParserAdapter();
  });

  test('should parse simple XML correctly', () => {
    const xml = '<root><child>内容</child></root>';
    const result = parser.parse(xml);

    expect(result).toBeDefined();
    expect(result.name).toBe('root');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('child');
    expect(result.children[0].textContent).toBe('内容');
  });

  test('should parse XML with attributes correctly', () => {
    const xml = '<root id="root-id"><child name="child-name">内容</child></root>';
    const result = parser.parse(xml);

    expect(result).toBeDefined();
    expect(result.attributes).toBeDefined();
    expect(result.attributes?.id).toBe('root-id');
    expect(result.children[0].attributes?.name).toBe('child-name');
  });

  test('should support self-closing tags', () => {
    const xml = '<root><empty-tag /></root>';
    const result = parser.parse(xml);

    expect(result).toBeDefined();
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('empty-tag');
    expect(result.children[0].children).toHaveLength(0);
  });

  test('should handle namespaces correctly', () => {
    const xml = '<root xmlns:ns="http://example.com/ns"><ns:child>内容</ns:child></root>';
    const result = parser.parse(xml);

    expect(result).toBeDefined();
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe('ns:child');
    expect(result.children[0].textContent).toBe('内容');
  });

  test('should track position information when enabled', () => {
    const positionParser = new XmlParserAdapter({
      trackPosition: true,
    });

    const xml = '<root>\n  <child>内容</child>\n</root>';
    const result = positionParser.parse(xml);

    expect(result.position).toBeDefined();
    expect(result.position?.start).toBeDefined();
    expect(result.position?.end).toBeDefined();
    expect(result.children[0].position).toBeDefined();
  });

  test('should throw ParseError for invalid XML', () => {
    const xml = '<root><child>内容</wrongtag></root>';

    expect(() => parser.parse(xml)).toThrow(ParseError);
  });

  test('should throw ParseError for unclosed tags', () => {
    const xml = '<root><child>内容</child>';

    expect(() => parser.parse(xml)).toThrow(ParseError);
    expect(() => parser.parse(xml)).toThrow(/未闭合的标签/);
  });

  test('should throw ParseError for empty input', () => {
    expect(() => parser.parse('')).toThrow(ParseError);
    expect(() => parser.parse('')).toThrow(/XML内容不能为空/);
  });

  test('should handle nested elements correctly', () => {
    const xml = `
      <root>
        <parent>
          <child>第一个子元素</child>
          <child>第二个子元素</child>
        </parent>
      </root>
    `;

    const result = parser.parse(xml);

    expect(result.name).toBe('root');
    expect(result.children).toHaveLength(1);

    const parent = result.children[0];

    expect(parent.name).toBe('parent');
    expect(parent.children).toHaveLength(2);

    expect(parent.children[0].name).toBe('child');
    expect(parent.children[0].textContent).toBe('第一个子元素');
    expect(parent.children[1].name).toBe('child');
    expect(parent.children[1].textContent).toBe('第二个子元素');
  });

  test('should handle CDATA sections', () => {
    const xml = '<root><![CDATA[<不会被解析的XML>]]></root>';
    const result = parser.parse(xml);

    expect(result.name).toBe('root');
    expect(result.textContent).toBe('<不会被解析的XML>');
  });
});
