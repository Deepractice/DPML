/**
 * XMLToNodeConverter单元测试
 */
import { describe, test, expect } from 'vitest';

import type { XMLNode } from '../../../../core/parser/types';
import { XmlToNodeConverter } from '../../../../core/parser/XmlToNodeConverter';
import { ParseError } from '../../../../types/ParseError';


describe('UT-Parser-XMLToNodeConverter', () => {
  // 创建转换器实例
  let converter: XmlToNodeConverter;

  beforeEach(() => {
    converter = new XmlToNodeConverter();
  });

  test('should convert simple XML node to DPML node', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      children: [],
    };

    const result = converter.convert(xmlNode);

    expect(result).toBeDefined();
    expect(result.tagName).toBe('root');
    expect(result.children).toHaveLength(0);
    expect(result.content).toBe('');
    expect(result.parent).toBeNull();
    expect(result.id).toBeNull();
  });

  test('should convert XML node with attributes to DPML node', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      attributes: {
        id: 'root-id',
        class: 'container',
      },
      children: [],
    };

    const result = converter.convert(xmlNode);

    expect(result).toBeDefined();
    expect(result.tagName).toBe('root');
    expect(result.hasAttribute('id')).toBe(true);
    expect(result.getAttributeValue('id')).toBe('root-id');
    expect(result.hasAttribute('class')).toBe(true);
    expect(result.getAttributeValue('class')).toBe('container');
  });

  test('should convert XML node with text content to DPML node', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      textContent: '这是内容',
      children: [],
    };

    const result = converter.convert(xmlNode);

    expect(result).toBeDefined();
    expect(result.tagName).toBe('root');
    expect(result.content).toBe('这是内容');
    expect(result.hasContent()).toBe(true);
  });

  test('should convert XML node with children to DPML node', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      children: [
        {
          name: 'child1',
          textContent: '子节点1',
          children: [],
        },
        {
          name: 'child2',
          textContent: '子节点2',
          children: [],
        },
      ],
    };

    const result = converter.convert(xmlNode);

    expect(result).toBeDefined();
    expect(result.tagName).toBe('root');
    expect(result.children).toHaveLength(2);
    expect(result.hasChildren()).toBe(true);

    expect(result.children[0].tagName).toBe('child1');
    expect(result.children[0].content).toBe('子节点1');
    expect(result.children[0].parent).toBe(result);

    expect(result.children[1].tagName).toBe('child2');
    expect(result.children[1].content).toBe('子节点2');
    expect(result.children[1].parent).toBe(result);
  });

  test('should convert XML node with nested children to DPML node', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      children: [
        {
          name: 'parent',
          children: [
            {
              name: 'child',
              textContent: '嵌套子节点',
              children: [],
            },
          ],
        },
      ],
    };

    const result = converter.convert(xmlNode);

    expect(result).toBeDefined();
    expect(result.tagName).toBe('root');
    expect(result.children).toHaveLength(1);

    const parent = result.children[0];

    expect(parent.tagName).toBe('parent');
    expect(parent.children).toHaveLength(1);
    expect(parent.parent).toBe(result);

    const child = parent.children[0];

    expect(child.tagName).toBe('child');
    expect(child.content).toBe('嵌套子节点');
    expect(child.parent).toBe(parent);
  });

  test('should throw ParseError for null XML node', () => {
    expect(() => converter.convert(null as unknown as XMLNode)).toThrow(ParseError);
    expect(() => converter.convert(null as unknown as XMLNode)).toThrow(/XML节点不能为空/);
  });

  test('should handle position information', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 3, column: 7, offset: 30 },
      },
      children: [],
    };

    const result = converter.convert(xmlNode);

    expect(result).toBeDefined();
    expect(result.sourceLocation).toBeDefined();
    expect(result.sourceLocation.startLine).toBe(1);
    expect(result.sourceLocation.startColumn).toBe(1);
    expect(result.sourceLocation.endLine).toBe(3);
    expect(result.sourceLocation.endColumn).toBe(7);
  });

  test('should handle node manipulation methods', () => {
    const xmlNode: XMLNode = {
      name: 'root',
      children: [],
    };

    const result = converter.convert(xmlNode);

    // 测试ID操作
    expect(result.hasId()).toBe(false);
    result.setId('test-id');
    expect(result.hasId()).toBe(true);
    expect(result.getId()).toBe('test-id');

    // 测试属性操作
    expect(result.hasAttribute('test')).toBe(false);
    result.setAttribute('test', 'value');
    expect(result.hasAttribute('test')).toBe(true);
    expect(result.getAttributeValue('test')).toBe('value');

    // 测试子节点操作
    const childXmlNode: XMLNode = {
      name: 'child',
      children: [],
    };

    const childNode = converter.convert(childXmlNode);

    expect(result.hasChildren()).toBe(false);

    result.appendChild(childNode);
    expect(result.hasChildren()).toBe(true);
    expect(result.children).toHaveLength(1);
    expect(childNode.parent).toBe(result);

    result.removeChild(childNode);
    expect(result.hasChildren()).toBe(false);
    expect(result.children).toHaveLength(0);
    expect(childNode.parent).toBeNull();
  });
});
