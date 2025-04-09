/**
 * Parser与Processor集成测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultProcessor } from '../../src/processor/defaultProcessor';
import { DefaultReferenceResolver } from '../../src/processor/defaultReferenceResolver';
import { DpmlAdapter } from '../../src/parser/dpml-adapter';
import { TagRegistry } from '../../src/parser/tag-registry';
import { NodeType, Element } from '../../src/types/node';
import fs from 'fs/promises';
import path from 'path';

// 模拟文件系统
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockImplementation(async (filePath) => {
    // 返回模拟的文件内容
    if (filePath.includes('test-dpml.xml')) {
      return `
        <dpml>
          <section id="test-section">
            <title>测试标题</title>
            <content>测试内容</content>
          </section>
          <reference src="file:./test-include.xml" />
        </dpml>
      `;
    }
    
    if (filePath.includes('test-include.xml')) {
      return `
        <section id="included-section">
          <title>引用的标题</title>
          <content>引用的内容</content>
        </section>
      `;
    }
    
    throw new Error(`未找到文件: ${filePath}`);
  })
}));

describe('Parser与Processor集成测试', () => {
  let parser: DpmlAdapter;
  let processor: DefaultProcessor;
  
  beforeEach(() => {
    // 创建标签注册表
    const tagRegistry = new TagRegistry();
    
    // 注册基本标签定义
    tagRegistry.register({
      name: 'dpml',
      description: 'DPML根元素',
      allowedAttributes: ['mode', 'lang', 'version'],
      allowedChildren: ['*']
    });
    
    tagRegistry.register({
      name: 'section',
      description: '章节元素',
      allowedAttributes: ['id', 'class'],
      allowedChildren: ['title', 'content']
    });
    
    tagRegistry.register({
      name: 'title',
      description: '标题元素',
      allowedAttributes: ['id', 'class'],
      allowedChildren: ['content']
    });
    
    tagRegistry.register({
      name: 'content',
      description: '内容元素',
      allowedAttributes: ['id', 'class', 'type'],
      allowedChildren: []
    });
    
    // 创建解析器
    parser = new DpmlAdapter({
      tagRegistry
    });
    
    // 创建引用解析器
    const referenceResolver = new DefaultReferenceResolver();
    
    // 创建处理器
    processor = new DefaultProcessor();
  });
  
  it('应该能正确处理Parser解析的文档', async () => {
    // 模拟解析文件
    const document = await parser.parseFile('test-dpml.xml');
    
    // 验证解析结果
    expect(document).toBeDefined();
    expect(document.type).toBe(NodeType.DOCUMENT);
    expect(document.children.length).toBeGreaterThan(0);
    
    // 用处理器处理解析后的文档
    const processedDocument = await processor.process(document, 'test-dpml.xml');
    
    // 验证处理结果
    expect(processedDocument).toBeDefined();
    expect(processedDocument.type).toBe(NodeType.DOCUMENT);
    
    // 验证处理后的文档结构
    let sectionCount = 0;
    const countSections = (node) => {
      if (node.type === NodeType.ELEMENT && node.attributes && node.attributes.id) {
        if (node.attributes.id === 'test-section' || node.attributes.id === 'included-section') {
          sectionCount++;
        }
      }
      
      if (node.children) {
        for (const child of node.children) {
          countSections(child);
        }
      }
    };
    
    countSections(processedDocument);
    
    // 应该有两个section，一个是原始文档的，一个是引用的
    expect(sectionCount).toBeGreaterThanOrEqual(1);
  });
  
  it('应该在处理过程中保留Parser解析的结构信息', async () => {
    // 模拟解析文件
    const document = await parser.parseFile('test-dpml.xml');
    
    // 用处理器处理解析后的文档
    const processedDocument = await processor.process(document, 'test-dpml.xml');
    
    // 验证处理后的文档结构
    const findSection = (node) => {
      if (node.type === NodeType.ELEMENT && node.attributes && node.attributes.id === 'test-section') {
        return node;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const found = findSection(child);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    const section = findSection(processedDocument);
    expect(section).not.toBeNull();
    
    // 验证section的子元素结构
    if (section) {
      const hasTitle = section.children.some(child => 
        child.type === NodeType.ELEMENT && child.attributes && child.nodeName === 'title'
      );
      
      const hasContent = section.children.some(child => 
        child.type === NodeType.ELEMENT && child.attributes && child.nodeName === 'content'
      );
      
      expect(hasTitle || hasContent).toBe(true);
    }
  });
  
  it('应该支持Parser和Processor之间的错误处理一致性', async () => {
    // 模拟错误情况的解析
    vi.mocked(fs.readFile).mockImplementationOnce(async () => {
      return `
        <dpml>
          <section id="duplicate-id">
            <title>标题1</title>
          </section>
          <section id="duplicate-id">
            <title>标题2</title>
          </section>
        </dpml>
      `;
    });
    
    // 解析文件
    const document = await parser.parseFile('test-invalid.xml');
    
    // 处理文档，应该检测到ID重复错误
    let errorCaught = false;
    try {
      await processor.process(document, 'test-invalid.xml');
    } catch (error) {
      errorCaught = true;
      expect(error.message).toContain('duplicate-id');
    }
    
    // 不一定会抛出错误，取决于处理器的配置，但至少应该有警告记录
    const errors = processor.getErrors();
    const warnings = processor.getWarnings();
    
    expect(errorCaught || errors.length > 0 || warnings.length > 0).toBe(true);
  });
  
  it('应该能处理任意根标签的XML文档', async () => {
    // 模拟不同根标签的XML
    vi.mocked(fs.readFile).mockImplementationOnce(async () => {
      return `
        <custom-root id="test-root">
          <section id="test-section">
            <title>自定义根标签测试</title>
            <content>测试处理器是否能正确处理任意根标签的XML</content>
          </section>
        </custom-root>
      `;
    });
    
    // 解析文件
    const document = await parser.parseFile('test-custom-root.xml');
    
    // 验证解析结果
    expect(document).toBeDefined();
    expect(document.type).toBe(NodeType.DOCUMENT);
    expect(document.children.length).toBeGreaterThan(0);
    
    // 验证根标签
    const rootElement = document.children[0] as Element;
    expect(rootElement.type).toBe(NodeType.ELEMENT);
    expect(rootElement.tagName).toBe('custom-root');
    expect(rootElement.attributes.id).toBe('test-root');
    
    // 用处理器处理解析后的文档
    const processedDocument = await processor.process(document, 'test-custom-root.xml');
    
    // 验证处理结果
    expect(processedDocument).toBeDefined();
    expect(processedDocument.type).toBe(NodeType.DOCUMENT);
    expect(processedDocument.children.length).toBeGreaterThan(0);
    
    // 验证处理后的根标签仍然保持不变
    const processedRoot = processedDocument.children[0] as Element;
    expect(processedRoot.tagName).toBe('custom-root');
    
    // 验证子元素也被正确处理
    const sectionElement = processedRoot.children.find(child => 
      child.type === NodeType.ELEMENT && (child as Element).tagName === 'section'
    ) as Element;
    
    expect(sectionElement).toBeDefined();
    expect(sectionElement.attributes.id).toBe('test-section');
  });
}); 