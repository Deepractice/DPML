import { expect, describe, it, beforeEach } from 'vitest';
import { DpmlAdapter } from '../../src/parser/dpml-adapter';
import { XMLParserAdapter } from '../../src/parser/xml/xml-parser-adapter';
import { XMLToNodeConverter } from '../../src/parser/xml/xml-to-node-converter';
import { NodeType, Element, Content, isElement, isContent } from '../../src/types/node';
import { XMLNode } from '../../src/parser/xml/types';

describe('DpmlAdapter', () => {
  let dpmlAdapter: DpmlAdapter;
  
  beforeEach(() => {
    dpmlAdapter = new DpmlAdapter();
  });
  
  describe('基本功能', () => {
    it('应该成功处理简单的DPML内容', async () => {
      const dpml = `<prompt>这是一个简单的提示</prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      expect(result.ast).toBeDefined();
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      
      const rootElement = result.ast.children[0];
      expect(isElement(rootElement)).toBe(true);
      expect((rootElement as Element).tagName).toBe('prompt');
      
      const contentNode = (rootElement as Element).children[0];
      expect(isContent(contentNode)).toBe(true);
      expect((contentNode as Content).value).toBe('这是一个简单的提示');
    });
    
    it('应该正确处理嵌套的标签结构', async () => {
      const dpml = `
      <prompt>
        <context>
          这是一个上下文
        </context>
        <role name="user">
          这是用户输入
        </role>
      </prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      expect(result.errors).toHaveLength(0);
      
      const rootElement = result.ast.children[0] as Element;
      expect(rootElement.tagName).toBe('prompt');
      expect(rootElement.children).toHaveLength(2);
      
      const contextElement = rootElement.children[0] as Element;
      expect(contextElement.tagName).toBe('context');
      
      const roleElement = rootElement.children[1] as Element;
      expect(roleElement.tagName).toBe('role');
      expect(roleElement.attributes.name).toBe('user');
    });
  });
  
  describe('Element处理', () => {
    it('应该正确保留元素的属性', async () => {
      const dpml = `<prompt version="1.0" lang="zh-CN">内容</prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      const promptElement = result.ast.children[0] as Element;
      expect(promptElement.attributes).toEqual(expect.objectContaining({
        version: '1.0',
        lang: 'zh-CN'
      }));
    });
    
    it('应该正确处理自闭合标签', async () => {
      const dpml = `<prompt><hr/><br /></prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      const promptElement = result.ast.children[0] as Element;
      expect(promptElement.children).toHaveLength(2);
      
      const hrElement = promptElement.children[0] as Element;
      expect(hrElement.tagName).toBe('hr');
      expect(hrElement.children).toHaveLength(0);
      
      const brElement = promptElement.children[1] as Element;
      expect(brElement.tagName).toBe('br');
      expect(brElement.children).toHaveLength(0);
    });
  });
  
  describe('Content处理', () => {
    it('应该正确处理纯文本内容', async () => {
      const dpml = `<prompt>这是纯文本内容</prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      const promptElement = result.ast.children[0] as Element;
      const contentNode = promptElement.children[0] as Content;
      
      expect(contentNode.type).toBe(NodeType.CONTENT);
      expect(contentNode.value).toBe('这是纯文本内容');
    });
    
    it('应该正确处理混合内容', async () => {
      const dpml = `
      <prompt>
        这是一些文本
        <emphasis>这是强调的文本</emphasis>
        这是更多的文本
      </prompt>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      const promptElement = result.ast.children[0] as Element;
      
      // 检查子节点数量，可能因解析方式不同而有所不同 
      expect(promptElement.children.length).toBeGreaterThan(0);
      
      // 至少应该有一个ELEMENT类型的子节点（emphasis）
      const emphasisElement = promptElement.children.find(child => 
        child.type === NodeType.ELEMENT && (child as Element).tagName === 'emphasis'
      ) as Element;
      
      expect(emphasisElement).toBeDefined();
      expect(emphasisElement.tagName).toBe('emphasis');
      expect(emphasisElement.children[0].type).toBe(NodeType.CONTENT);
      expect((emphasisElement.children[0] as Content).value).toBe('这是强调的文本');
    });
  });
}); 