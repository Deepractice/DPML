import { describe, it, expect } from 'vitest';
import { XMLNode } from '../../../src/parser/xml/types';
import { XMLToNodeConverter } from '../../../src/parser/xml/xml-to-node-converter';
import { NodeType, Element, Content, Document } from '../../../src/types/node';

describe('XML到DPML节点转换器', () => {
  describe('基础转换', () => {
    it('应该将XML根节点转换为Document节点', () => {
      // 创建一个简单的XML节点
      const xmlNode: XMLNode = {
        name: 'document',
        children: []
      };

      const converter = new XMLToNodeConverter();
      const result = converter.convert(xmlNode);

      expect(result).toBeDefined();
      expect(result.type).toBe(NodeType.DOCUMENT);
    });

    it('应该将XML子节点转换为Element节点', () => {
      // 创建带有子节点的XML节点
      const xmlNode: XMLNode = {
        name: 'document',
        children: [
          {
            name: 'prompt',
            children: []
          }
        ]
      };

      const converter = new XMLToNodeConverter();
      const result = converter.convert(xmlNode) as Document;

      expect(result.children).toHaveLength(1);
      expect(result.children[0].type).toBe(NodeType.ELEMENT);
      
      const elementNode = result.children[0] as Element;
      expect(elementNode.tagName).toBe('prompt');
    });

    it('应该将XML文本内容转换为Content节点', () => {
      // 创建带有文本内容的XML节点
      const xmlNode: XMLNode = {
        name: 'document',
        children: [
          {
            name: 'prompt',
            children: [],
            textContent: '这是一段提示文本'
          }
        ]
      };

      const converter = new XMLToNodeConverter();
      const result = converter.convert(xmlNode) as Document;
      
      const elementNode = result.children[0] as Element;
      expect(elementNode.children).toHaveLength(1);
      expect(elementNode.children[0].type).toBe(NodeType.CONTENT);
      
      const contentNode = elementNode.children[0] as Content;
      expect(contentNode.value).toBe('这是一段提示文本');
    });
  });

  describe('属性处理', () => {
    it('应该将XML属性转换为Element的attributes', () => {
      // 创建带有属性的XML节点
      const xmlNode: XMLNode = {
        name: 'document',
        children: [
          {
            name: 'prompt',
            children: [],
            attributes: {
              id: 'test-prompt',
              type: 'text'
            }
          }
        ]
      };

      const converter = new XMLToNodeConverter();
      const result = converter.convert(xmlNode) as Document;
      
      const elementNode = result.children[0] as Element;
      expect(elementNode.attributes).toBeDefined();
      expect(elementNode.attributes.id).toBe('test-prompt');
      expect(elementNode.attributes.type).toBe('text');
    });
  });

  describe('位置信息', () => {
    it('应该保留源码位置信息', () => {
      // 创建带有位置信息的XML节点
      const xmlNode: XMLNode = {
        name: 'document',
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 11, offset: 35 }
        }
      };

      const converter = new XMLToNodeConverter();
      const result = converter.convert(xmlNode);

      expect(result.position).toBeDefined();
      expect(result.position.start.line).toBe(1);
      expect(result.position.start.column).toBe(1);
      expect(result.position.end.line).toBe(3);
      expect(result.position.end.column).toBe(11);
    });
  });

  describe('嵌套结构', () => {
    it('应该正确处理深层嵌套结构', () => {
      // 创建嵌套多层的XML节点
      const xmlNode: XMLNode = {
        name: 'document',
        children: [
          {
            name: 'section',
            children: [
              {
                name: 'heading',
                children: [],
                textContent: '标题'
              },
              {
                name: 'paragraph',
                children: [],
                textContent: '段落内容'
              }
            ]
          }
        ]
      };

      const converter = new XMLToNodeConverter();
      const result = converter.convert(xmlNode) as Document;
      
      expect(result.children).toHaveLength(1);
      
      const sectionNode = result.children[0] as Element;
      expect(sectionNode.tagName).toBe('section');
      expect(sectionNode.children).toHaveLength(2);
      
      const headingNode = sectionNode.children[0] as Element;
      expect(headingNode.tagName).toBe('heading');
      expect(headingNode.children).toHaveLength(1);
      expect((headingNode.children[0] as Content).value).toBe('标题');
      
      const paragraphNode = sectionNode.children[1] as Element;
      expect(paragraphNode.tagName).toBe('paragraph');
      expect(paragraphNode.children).toHaveLength(1);
      expect((paragraphNode.children[0] as Content).value).toBe('段落内容');
    });
  });
}); 