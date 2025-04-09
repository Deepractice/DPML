import { expect, describe, it, beforeEach, vi } from 'vitest';
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
  
  describe('根标签处理', () => {
    it('应该正确处理任意根标签的XML', async () => {
      // 测试各种根标签
      const testCases = [
        { xml: '<prompt>测试内容</prompt>', expectedTagName: 'prompt' },
        { xml: '<custom-root>自定义内容</custom-root>', expectedTagName: 'custom-root' },
        { xml: '<workflow id="test">工作流内容</workflow>', expectedTagName: 'workflow' },
      ];
      
      for (const { xml, expectedTagName } of testCases) {
        const result = await dpmlAdapter.parse(xml);
        
        // 验证Document结构
        expect(result.ast).toBeDefined();
        expect(result.ast.type).toBe(NodeType.DOCUMENT);
        expect(result.errors).toHaveLength(0);
        
        // 确保Document有子节点
        expect(result.ast.children).toBeDefined();
        expect(result.ast.children.length).toBeGreaterThan(0);
        
        // 验证原始根标签被保留为Document的子节点
        const rootElement = result.ast.children[0] as Element;
        expect(rootElement.type).toBe(NodeType.ELEMENT);
        expect(rootElement.tagName).toBe(expectedTagName);
      }
    });
    
    it('应该确保Document总是有子节点', async () => {
      // 这个测试验证即使解析器内部逻辑尝试创建空Document，
      // 我们的修复也能确保最终的Document包含原始XML节点
      
      // 创建一个复杂的XML，包含嵌套结构
      const dpml = `
        <root>
          <nested>
            <element>内容</element>
          </nested>
        </root>
      `;
      
      const result = await dpmlAdapter.parse(dpml);
      
      // 验证Document及其子结构
      expect(result.ast.type).toBe(NodeType.DOCUMENT);
      expect(result.ast.children.length).toBeGreaterThan(0);
      
      // 验证完整的文档树结构
      const rootElement = result.ast.children[0] as Element;
      expect(rootElement.tagName).toBe('root');
      
      // 验证嵌套元素
      expect(rootElement.children.length).toBeGreaterThan(0);
      const nestedElement = rootElement.children.find(child => 
        isElement(child) && (child as Element).tagName === 'nested'
      ) as Element;
      
      expect(nestedElement).toBeDefined();
      expect(nestedElement.children.length).toBeGreaterThan(0);
    });
    
    it('应该处理XML中的属性并保留在Document结构中', async () => {
      const dpml = `<custom-element id="test-id" version="1.0" custom-attr="value">属性测试</custom-element>`;
      
      const result = await dpmlAdapter.parse(dpml);
      
      // 验证Document结构
      expect(result.ast.type).toBe(NodeType.DOCUMENT);
      expect(result.ast.children.length).toBe(1);
      
      // 验证元素及其属性
      const element = result.ast.children[0] as Element;
      expect(element.tagName).toBe('custom-element');
      expect(element.attributes).toBeDefined();
      expect(element.attributes.id).toBe('test-id');
      expect(element.attributes.version).toBe('1.0');
      expect(element.attributes['custom-attr']).toBe('value');
    });
  });
}); 