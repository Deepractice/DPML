import { expect, describe, it, beforeEach } from 'vitest';
import { DpmlAdapter } from '../../src/parser/dpml-adapter';
import { NodeType, Element, Content, Reference, isElement, isContent, isReference } from '../../src/types/node';

describe('引用解析集成测试', () => {
  let dpmlAdapter: DpmlAdapter;
  
  beforeEach(() => {
    dpmlAdapter = new DpmlAdapter();
  });
  
  it('应该正确解析文本中的简单引用', async () => {
    const dpml = `<prompt>请参考 @example 文档</prompt>`;
    
    const result = await dpmlAdapter.parse(dpml);
    
    expect(result.errors).toHaveLength(0);
    
    const rootElement = result.ast.children[0] as Element;
    expect(rootElement.tagName).toBe('prompt');
    
    // 应该有三个子节点：文本、引用、文本
    expect(rootElement.children).toHaveLength(3);
    
    // 第一个子节点应该是"请参考 "文本
    const textBefore = rootElement.children[0] as Content;
    expect(isContent(textBefore)).toBe(true);
    expect(textBefore.value).toBe('请参考 ');
    
    // 第二个子节点应该是对example的引用
    const reference = rootElement.children[1] as Reference;
    expect(isReference(reference)).toBe(true);
    expect(reference.protocol).toBe('id');
    expect(reference.path).toBe('example');
    
    // 第三个子节点应该是" 文档"文本
    const textAfter = rootElement.children[2] as Content;
    expect(isContent(textAfter)).toBe(true);
    expect(textAfter.value).toBe(' 文档');
  });
  
  it('应该正确解析带协议的引用', async () => {
    const dpml = `<prompt>请查看 @http://example.com/doc.pdf 文档</prompt>`;
    
    const result = await dpmlAdapter.parse(dpml);
    
    expect(result.errors).toHaveLength(0);
    
    const rootElement = result.ast.children[0] as Element;
    const reference = rootElement.children[1] as Reference;
    
    expect(isReference(reference)).toBe(true);
    expect(reference.protocol).toBe('http');
    expect(reference.path).toBe('//example.com/doc.pdf');
  });
  
  it('应该正确解析多个引用', async () => {
    const dpml = `<prompt>请对比 @doc1 和 @doc2 两个文档</prompt>`;
    
    const result = await dpmlAdapter.parse(dpml);
    
    expect(result.errors).toHaveLength(0);
    
    const rootElement = result.ast.children[0] as Element;
    
    // 应该有5个子节点：文本、引用、文本、引用、文本
    expect(rootElement.children).toHaveLength(5);
    
    // 第二个子节点应该是对doc1的引用
    const reference1 = rootElement.children[1] as Reference;
    expect(isReference(reference1)).toBe(true);
    expect(reference1.path).toBe('doc1');
    
    // 第四个子节点应该是对doc2的引用
    const reference2 = rootElement.children[3] as Reference;
    expect(isReference(reference2)).toBe(true);
    expect(reference2.path).toBe('doc2');
  });
  
  it('应该正确解析嵌套标签中的引用', async () => {
    const dpml = `
    <prompt>
      <role name="user">
        请分析 @document#section1 部分
      </role>
    </prompt>`;
    
    const result = await dpmlAdapter.parse(dpml);
    
    expect(result.errors).toHaveLength(0);
    
    const promptElement = result.ast.children[0] as Element;
    const roleElement = promptElement.children[0] as Element;
    
    expect(roleElement.tagName).toBe('role');
    expect(roleElement.attributes.name).toBe('user');
    
    // 查找引用节点
    const reference = roleElement.children.find(node => 
      node.type === NodeType.REFERENCE
    ) as Reference;
    
    expect(reference).toBeDefined();
    expect(reference.protocol).toBe('id');
    expect(reference.path).toBe('document#section1');
  });
  
  it('不应该错误解析电子邮件地址为引用', async () => {
    const dpml = `<prompt>请联系 user@example.com 获取帮助</prompt>`;
    
    const result = await dpmlAdapter.parse(dpml);
    
    expect(result.errors).toHaveLength(0);
    
    const rootElement = result.ast.children[0] as Element;
    
    // 应该只有一个文本子节点，而不是引用节点
    expect(rootElement.children).toHaveLength(1);
    expect(isContent(rootElement.children[0])).toBe(true);
    expect((rootElement.children[0] as Content).value).toBe('请联系 user@example.com 获取帮助');
  });
}); 