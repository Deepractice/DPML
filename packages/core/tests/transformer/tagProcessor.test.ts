import { describe, it, expect } from 'vitest';
import { TagProcessor } from '../../src/transformer/interfaces/tagProcessor';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';
import { ProcessedDocument } from '../../src/processor/interfaces/processor';
import { Element, NodeType } from '../../src/types/node';
import { TransformOptions } from '../../src/transformer/interfaces/transformOptions';

describe('TagProcessor', () => {
  // 创建模拟数据
  const mockDocument: ProcessedDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };

  const mockOptions: TransformOptions = {
    format: 'json'
  };

  const mockContext: TransformContext = {
    output: {},
    document: mockDocument,
    options: mockOptions,
    variables: {},
    path: [],
    parentResults: []
  };

  const createMockElement = (tagName: string, attributes = {}): Element => ({
    type: NodeType.ELEMENT,
    tagName,
    attributes,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });

  it('应该能创建基本的标签处理器', () => {
    const processor: TagProcessor = {
      canProcess: (element) => element.tagName === 'test',
      process: (element, context) => ({
        type: 'processed',
        tagName: element.tagName
      })
    };

    expect(processor.canProcess).toBeDefined();
    expect(processor.process).toBeDefined();
    
    // 测试能否处理判断
    const testElement = createMockElement('test');
    const otherElement = createMockElement('other');
    
    expect(processor.canProcess(testElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
    
    // 测试处理结果
    const result = processor.process(testElement, mockContext);
    expect(result).toEqual({
      type: 'processed',
      tagName: 'test'
    });
  });

  it('应该能创建基于属性判断的处理器', () => {
    const processor: TagProcessor = {
      canProcess: (element) => 
        element.tagName === 'element' && 
        element.attributes.type === 'special',
      process: (element, context) => ({
        type: 'special-element',
        attributes: element.attributes
      })
    };
    
    const specialElement = createMockElement('element', { type: 'special' });
    const normalElement = createMockElement('element', { type: 'normal' });
    
    expect(processor.canProcess(specialElement)).toBe(true);
    expect(processor.canProcess(normalElement)).toBe(false);
    
    const result = processor.process(specialElement, mockContext);
    expect(result).toEqual({
      type: 'special-element',
      attributes: { type: 'special' }
    });
  });

  it('应该能创建修改上下文的处理器', () => {
    const processor: TagProcessor = {
      canProcess: (element) => element.tagName === 'config',
      process: (element, context) => {
        // 将配置元素的属性添加到上下文变量中
        Object.assign(context.variables, element.attributes);
        return { type: 'config-processed' };
      }
    };
    
    const configElement = createMockElement('config', { 
      theme: 'dark', 
      fontSize: 14 
    });
    
    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: {},
      path: [],
      parentResults: []
    };
    
    expect(processor.canProcess(configElement)).toBe(true);
    
    const result = processor.process(configElement, context);
    expect(result).toEqual({ type: 'config-processed' });
    expect(context.variables.theme).toBe('dark');
    expect(context.variables.fontSize).toBe(14);
  });

  it('应该能基于上下文条件处理标签', () => {
    const processor: TagProcessor = {
      canProcess: (element) => element.tagName === 'conditional',
      process: (element, context) => {
        if (context.variables.condition === true) {
          return { type: 'condition-met' };
        } else {
          return { type: 'condition-not-met' };
        }
      }
    };
    
    const conditionalElement = createMockElement('conditional');
    
    const trueContext: TransformContext = {
      ...mockContext,
      variables: { condition: true }
    };
    
    const falseContext: TransformContext = {
      ...mockContext,
      variables: { condition: false }
    };
    
    expect(processor.canProcess(conditionalElement)).toBe(true);
    
    const trueResult = processor.process(conditionalElement, trueContext);
    expect(trueResult).toEqual({ type: 'condition-met' });
    
    const falseResult = processor.process(conditionalElement, falseContext);
    expect(falseResult).toEqual({ type: 'condition-not-met' });
  });
}); 