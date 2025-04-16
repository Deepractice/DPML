import { describe, it, expect } from 'vitest';
import { TagProcessorRegistry } from '../../transformer/interfaces/tagProcessorRegistry';
import { TagProcessor } from '../../transformer/interfaces/tagProcessor';
import { Element, NodeType } from '../../types/node';
import { TransformContext } from '../../transformer/interfaces/transformContext';

describe('TagProcessorRegistry', () => {
  // 创建模拟元素和处理器
  const createMockElement = (tagName: string): Element => ({
    type: NodeType.ELEMENT,
    tagName,
    attributes: {},
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  });

  const mockRoleProcessor: TagProcessor = {
    canProcess: (element) => element.tagName === 'role',
    process: (element, context) => ({ type: 'role-processed' })
  };

  const mockPromptProcessor: TagProcessor = {
    canProcess: (element) => element.tagName === 'prompt',
    process: (element, context) => ({ type: 'prompt-processed' })
  };

  // TransformContext类型声明为'any'，因为这里不需要实际实现
  const mockContext = {} as TransformContext;

  it('应该能注册和获取处理器', () => {
    const registry: TagProcessorRegistry = {
      processors: new Map(),
      
      registerProcessor(tagName, processor) {
        this.processors.set(tagName, processor);
      },
      
      getProcessor(tagName) {
        return this.processors.get(tagName);
      }
    };
    
    // 注册处理器
    registry.registerProcessor('role', mockRoleProcessor);
    registry.registerProcessor('prompt', mockPromptProcessor);
    
    // 测试获取处理器
    const roleProcessor = registry.getProcessor('role');
    const promptProcessor = registry.getProcessor('prompt');
    const unknownProcessor = registry.getProcessor('unknown');
    
    expect(roleProcessor).toBe(mockRoleProcessor);
    expect(promptProcessor).toBe(mockPromptProcessor);
    expect(unknownProcessor).toBeUndefined();
    
    // 测试处理器功能
    const roleElement = createMockElement('role');
    const promptElement = createMockElement('prompt');
    
    expect(roleProcessor?.canProcess(roleElement)).toBe(true);
    expect(roleProcessor?.process(roleElement, mockContext)).toEqual({ type: 'role-processed' });
    
    expect(promptProcessor?.canProcess(promptElement)).toBe(true);
    expect(promptProcessor?.process(promptElement, mockContext)).toEqual({ type: 'prompt-processed' });
  });

  it('应该能处理重复注册', () => {
    const registry: TagProcessorRegistry = {
      processors: new Map(),
      
      registerProcessor(tagName, processor) {
        this.processors.set(tagName, processor);
      },
      
      getProcessor(tagName) {
        return this.processors.get(tagName);
      }
    };
    
    // 首次注册
    registry.registerProcessor('role', mockRoleProcessor);
    
    // 重复注册
    const newRoleProcessor: TagProcessor = {
      canProcess: (element) => element.tagName === 'role',
      process: (element, context) => ({ type: 'new-role-processed' })
    };
    
    registry.registerProcessor('role', newRoleProcessor);
    
    // 测试获取处理器
    const roleProcessor = registry.getProcessor('role');
    
    expect(roleProcessor).toBe(newRoleProcessor);
    expect(roleProcessor).not.toBe(mockRoleProcessor);
    
    // 测试处理器功能
    const roleElement = createMockElement('role');
    
    expect(roleProcessor?.process(roleElement, mockContext)).toEqual({ type: 'new-role-processed' });
  });

  it('应该能检查处理器是否存在', () => {
    const registry: TagProcessorRegistry = {
      processors: new Map(),
      
      registerProcessor(tagName, processor) {
        this.processors.set(tagName, processor);
      },
      
      getProcessor(tagName) {
        return this.processors.get(tagName);
      },
      
      hasProcessor(tagName) {
        return this.processors.has(tagName);
      }
    };
    
    registry.registerProcessor('role', mockRoleProcessor);
    
    expect(registry.hasProcessor('role')).toBe(true);
    expect(registry.hasProcessor('prompt')).toBe(false);
  });
}); 