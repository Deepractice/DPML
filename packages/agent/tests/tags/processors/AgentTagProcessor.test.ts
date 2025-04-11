import { describe, it, expect } from 'vitest';
import { Element, ProcessingContext, Document, NodeType } from '@dpml/core';
import { AgentTagProcessor } from '../../../src/tags/processors/AgentTagProcessor';

describe('AgentTagProcessor', () => {
  // 创建一个简单的处理上下文
  const createContext = (): ProcessingContext => {
    const mockDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: { start: 0, end: 0, line: 0, column: 0 }
    } as unknown as Document;
    
    return {
      document: mockDocument,
      currentPath: '/test',
      filePath: '/test',
      parentElements: [] as Element[],
      variables: {},
      idMap: new Map<string, Element>(),
      resolvedReferences: new Map()
    } as ProcessingContext;
  };

  // 创建一个基本的agent元素
  const createAgentElement = (attributes = {}, children: Element[] = []): Element => {
    return {
      type: NodeType.ELEMENT,
      tagName: 'agent',
      attributes: { id: 'test-agent', ...attributes },
      children,
      metadata: {},
      position: { start: 0, end: 0, line: 0, column: 0 }
    } as unknown as Element;
  };

  // 创建子元素
  const createChildElement = (tagName: string): Element => {
    return {
      type: NodeType.ELEMENT,
      tagName,
      attributes: {},
      children: [],
      metadata: {},
      position: { start: 0, end: 0, line: 0, column: 0 }
    } as unknown as Element;
  };

  it('UT-AP-001: 应正确处理基本属性(id, version)', async () => {
    // 创建处理器
    const processor = new AgentTagProcessor();
    
    // 创建一个agent元素
    const element = createAgentElement({
      id: 'test-agent',
      version: '2.0'
    });
    
    // 创建处理上下文
    const context = createContext();
    
    // 处理元素
    const result = await processor.process(element, context);
    
    // 验证元数据中包含正确的属性
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.agent).toBeDefined();
    expect(result.metadata?.agent.id).toBe('test-agent');
    expect(result.metadata?.agent.version).toBe('2.0');
    
    // 验证默认值
    const elementWithoutVersion = createAgentElement({ id: 'test-agent' });
    const resultWithoutVersion = await processor.process(elementWithoutVersion, context);
    expect(resultWithoutVersion.metadata?.agent.version).toBe('1.0');
  });

  it('UT-AP-002: 应正确收集和验证子标签', async () => {
    // 创建处理器
    const processor = new AgentTagProcessor();
    
    // 创建必要的子标签
    const llmElement = createChildElement('llm');
    const promptElement = createChildElement('prompt');
    
    // 创建有完整子标签的agent元素
    const completeElement = createAgentElement(
      { id: 'complete-agent' },
      [llmElement, promptElement]
    );
    
    // 创建缺少子标签的agent元素
    const incompleteElement = createAgentElement(
      { id: 'incomplete-agent' },
      [llmElement] // 只有llm标签，缺少prompt标签
    );
    
    // 创建处理上下文
    const context = createContext();
    
    // 处理完整元素
    const completeResult = await processor.process(completeElement, context);
    expect(completeResult.metadata?.agent.hasLLM).toBe(true);
    expect(completeResult.metadata?.agent.hasPrompt).toBe(true);
    expect(completeResult.metadata?.validationErrors).toBeUndefined();
    
    // 处理不完整元素
    const incompleteResult = await processor.process(incompleteElement, context);
    expect(incompleteResult.metadata?.agent.hasLLM).toBe(true);
    expect(incompleteResult.metadata?.agent.hasPrompt).toBe(false);
    expect(incompleteResult.metadata?.validationErrors).toBeDefined();
    expect(incompleteResult.metadata?.validationErrors?.length).toBe(1);
    expect(incompleteResult.metadata?.validationErrors?.[0].code).toBe('MISSING_REQUIRED_CHILD');
  });

  it('UT-AP-003: 应正确处理extends属性', async () => {
    // 创建处理器
    const processor = new AgentTagProcessor();
    
    // 创建带有extends属性的agent元素
    const element = createAgentElement({
      id: 'extending-agent',
      extends: './base-agent.dpml'
    });
    
    // 创建处理上下文
    const context = createContext();
    
    // 处理元素
    const result = await processor.process(element, context);
    
    // 验证extends属性被正确提取
    expect(result.metadata?.agent.extends).toBe('./base-agent.dpml');
  });
}); 