import { describe, it, expect } from 'vitest';

import {
  NodeType,
  isNode,
  isDocument,
  isElement,
  isContent,
  isReference,
} from '../../types/node';

import type {
  Node,
  Document,
  Element,
  Content,
  Reference,
} from '../../types/node';

describe('节点类型系统', () => {
  describe('节点类型枚举', () => {
    it('应该定义了所有必需的节点类型', () => {
      expect(NodeType.DOCUMENT).toBe('document');
      expect(NodeType.ELEMENT).toBe('element');
      expect(NodeType.CONTENT).toBe('content');
      expect(NodeType.REFERENCE).toBe('reference');
    });
  });

  describe('基础节点类型', () => {
    it('应该具有正确的结构', () => {
      const node: Node = {
        type: NodeType.ELEMENT,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 },
        },
      };

      expect(isNode(node)).toBe(true);
      expect(node.type).toBe(NodeType.ELEMENT);
      expect(node.position.start.line).toBe(1);
      expect(node.position.start.column).toBe(1);
      expect(node.position.start.offset).toBe(0);
      expect(node.position.end.line).toBe(1);
      expect(node.position.end.column).toBe(10);
      expect(node.position.end.offset).toBe(9);
    });

    it('应该可以区分不同类型的节点', () => {
      const node: Node = {
        type: NodeType.ELEMENT,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 },
        },
      };

      expect(isNode(node)).toBe(true);
      expect(isNode(null)).toBe(false);
      expect(isNode({})).toBe(false);
      expect(isNode({ type: 'unknown' })).toBe(false);
    });
  });

  describe('Document节点', () => {
    it('应该具有正确的结构', () => {
      const doc: Document = {
        type: NodeType.DOCUMENT,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 10, column: 1, offset: 100 },
        },
        children: [],
      };

      expect(isDocument(doc)).toBe(true);
      expect(doc.type).toBe(NodeType.DOCUMENT);
      expect(Array.isArray(doc.children)).toBe(true);
    });
  });

  describe('Element节点', () => {
    it('应该具有正确的结构', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        position: {
          start: { line: 2, column: 1, offset: 10 },
          end: { line: 2, column: 20, offset: 30 },
        },
        tagName: 'test-tag',
        attributes: { id: 'test', 'x-custom': 'value' },
        children: [],
      };

      expect(isElement(element)).toBe(true);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.tagName).toBe('test-tag');
      expect(element.attributes.id).toBe('test');
      expect(element.attributes['x-custom']).toBe('value');
      expect(Array.isArray(element.children)).toBe(true);
    });
  });

  describe('Content节点', () => {
    it('应该具有正确的结构', () => {
      const content: Content = {
        type: NodeType.CONTENT,
        position: {
          start: { line: 3, column: 1, offset: 40 },
          end: { line: 3, column: 15, offset: 55 },
        },
        value: 'This is content',
      };

      expect(isContent(content)).toBe(true);
      expect(content.type).toBe(NodeType.CONTENT);
      expect(content.value).toBe('This is content');
    });
  });

  describe('Reference节点', () => {
    it('应该具有正确的结构', () => {
      const reference: Reference = {
        type: NodeType.REFERENCE,
        position: {
          start: { line: 4, column: 1, offset: 60 },
          end: { line: 4, column: 20, offset: 80 },
        },
        protocol: 'http',
        path: 'example.com/resource',
      };

      expect(isReference(reference)).toBe(true);
      expect(reference.type).toBe(NodeType.REFERENCE);
      expect(reference.protocol).toBe('http');
      expect(reference.path).toBe('example.com/resource');

      // 测试可选的resolved字段
      const resolvedReference: Reference = {
        ...reference,
        resolved: { content: 'resolved content' },
      };

      expect(isReference(resolvedReference)).toBe(true);
      expect(resolvedReference.resolved).toEqual({
        content: 'resolved content',
      });
    });
  });

  describe('序列化与反序列化', () => {
    it('应该能够正确序列化和反序列化节点', () => {
      const doc: Document = {
        type: NodeType.DOCUMENT,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 10, column: 1, offset: 100 },
        },
        children: [
          {
            type: NodeType.ELEMENT,
            position: {
              start: { line: 2, column: 1, offset: 10 },
              end: { line: 2, column: 20, offset: 30 },
            },
            tagName: 'test-tag',
            attributes: { id: 'test' },
            children: [
              {
                type: NodeType.CONTENT,
                position: {
                  start: { line: 3, column: 1, offset: 40 },
                  end: { line: 3, column: 15, offset: 55 },
                },
                value: 'This is content',
              },
            ],
          },
        ],
      };

      const serialized = JSON.stringify(doc);
      const deserialized = JSON.parse(serialized) as Document;

      expect(isDocument(deserialized)).toBe(true);
      expect(deserialized.children.length).toBe(1);
      expect(isElement(deserialized.children[0])).toBe(true);

      const element = deserialized.children[0] as Element;

      expect(element.tagName).toBe('test-tag');
      expect(element.children.length).toBe(1);
      expect(isContent(element.children[0])).toBe(true);

      const content = element.children[0] as Content;

      expect(content.value).toBe('This is content');
    });
  });
});
