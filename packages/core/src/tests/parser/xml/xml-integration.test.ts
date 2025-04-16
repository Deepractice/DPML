import { describe, it, expect } from 'vitest';
import { XMLParserAdapter, XMLToNodeConverter } from '../../../parser/xml';
import { NodeType, Element, Content, Document } from '../../../types/node';

describe('XML解析与转换集成测试', () => {
  it('应该能从原始XML文本解析并转换为DPML节点', () => {
    const xmlText = `<document>
  <section id="intro">
    <heading>DPML简介</heading>
    <paragraph>DPML是一种用于定义提示的标记语言</paragraph>
  </section>
</document>`;

    // 创建解析适配器和转换器
    const parser = new XMLParserAdapter({ trackPosition: true });
    const converter = new XMLToNodeConverter();

    // 先解析XML
    const xmlNode = parser.parse(xmlText);
    
    // 再转换为DPML节点
    const dpmlNode = converter.convert(xmlNode);

    // 验证结果
    expect(dpmlNode.type).toBe(NodeType.DOCUMENT);
    
    const document = dpmlNode as Document;
    expect(document.children).toHaveLength(1);
    
    const section = document.children[0] as Element;
    expect(section.tagName).toBe('section');
    expect(section.attributes.id).toBe('intro');
    expect(section.children).toHaveLength(2);
    
    const heading = section.children[0] as Element;
    expect(heading.tagName).toBe('heading');
    expect(heading.children).toHaveLength(1);
    expect((heading.children[0] as Content).value).toBe('DPML简介');
    
    const paragraph = section.children[1] as Element;
    expect(paragraph.tagName).toBe('paragraph');
    expect(paragraph.children).toHaveLength(1);
    expect((paragraph.children[0] as Content).value).toBe('DPML是一种用于定义提示的标记语言');
  });

  it('应该正确处理空标签和自闭合标签', () => {
    const xmlText = `<document>
  <prompt>
    <system-message />
    <user-message></user-message>
  </prompt>
</document>`;

    const parser = new XMLParserAdapter();
    const converter = new XMLToNodeConverter();

    const xmlNode = parser.parse(xmlText);
    const dpmlNode = converter.convert(xmlNode) as Document;

    expect(dpmlNode.children).toHaveLength(1);
    
    const prompt = dpmlNode.children[0] as Element;
    expect(prompt.tagName).toBe('prompt');
    expect(prompt.children).toHaveLength(2);
    
    const systemMsg = prompt.children[0] as Element;
    expect(systemMsg.tagName).toBe('system-message');
    expect(systemMsg.children).toHaveLength(0);
    
    const userMsg = prompt.children[1] as Element;
    expect(userMsg.tagName).toBe('user-message');
    expect(userMsg.children).toHaveLength(0);
  });

  it('应该处理属性和命名空间', () => {
    const xmlText = `<document xmlns:dp="http://example.com/dpml">
  <dp:prompt id="main-prompt" type="chat">
    <dp:message role="system">你是一个助手</dp:message>
  </dp:prompt>
</document>`;

    const parser = new XMLParserAdapter();
    const converter = new XMLToNodeConverter();

    const xmlNode = parser.parse(xmlText);
    const dpmlNode = converter.convert(xmlNode) as Document;

    expect(dpmlNode.children).toHaveLength(1);
    
    const prompt = dpmlNode.children[0] as Element;
    expect(prompt.tagName).toBe('dp:prompt');
    expect(prompt.attributes.id).toBe('main-prompt');
    expect(prompt.attributes.type).toBe('chat');
    
    const message = prompt.children[0] as Element;
    expect(message.tagName).toBe('dp:message');
    expect(message.attributes.role).toBe('system');
    expect(message.children).toHaveLength(1);
    expect((message.children[0] as Content).value).toBe('你是一个助手');
  });

  it('应该保留位置信息', () => {
    const xmlText = `<document>
  <section>
    <heading>位置测试</heading>
  </section>
</document>`;

    const parser = new XMLParserAdapter({ trackPosition: true });
    const converter = new XMLToNodeConverter();

    const xmlNode = parser.parse(xmlText);
    const dpmlNode = converter.convert(xmlNode) as Document;

    // 验证位置信息
    expect(dpmlNode.position).toBeDefined();
    expect(dpmlNode.position.start.line).toBe(1);
    
    const section = dpmlNode.children[0] as Element;
    expect(section.position).toBeDefined();
    expect(section.position.start.line).toBe(2);
    
    const heading = section.children[0] as Element;
    expect(heading.position).toBeDefined();
    expect(heading.position.start.line).toBe(3);
  });
}); 