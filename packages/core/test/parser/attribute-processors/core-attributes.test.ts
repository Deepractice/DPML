import { expect, describe, it, beforeEach, vi } from 'vitest';
import { CoreAttributeProcessor } from '../../../src/parser/attribute-processors/core-attributes';
import { Element, NodeType } from '../../../src/types/node';

describe('CoreAttributeProcessor', () => {
  let processor: CoreAttributeProcessor;
  
  beforeEach(() => {
    processor = new CoreAttributeProcessor();
  });
  
  describe('validateId', () => {
    it('有效的ID属性应该通过验证', () => {
      expect(processor.validateId('valid-id')).toBe(true);
      expect(processor.validateId('validId')).toBe(true);
      expect(processor.validateId('valid_id')).toBe(true);
      expect(processor.validateId('valid123')).toBe(true);
    });
    
    it('无效的ID属性应该失败验证', () => {
      expect(processor.validateId('1invalid')).toBe(false); // 不能以数字开头
      expect(processor.validateId('')).toBe(false); // 不能为空
      expect(processor.validateId('invalid$id')).toBe(false); // 不能包含特殊字符
      expect(processor.validateId('invalid id')).toBe(false); // 不能包含空格
    });
  });
  
  describe('validateVersion', () => {
    it('有效的版本格式应该通过验证', () => {
      expect(processor.validateVersion('1.0')).toBe(true);
      expect(processor.validateVersion('2.1')).toBe(true);
      expect(processor.validateVersion('0.9')).toBe(true);
      expect(processor.validateVersion('10.20')).toBe(true);
    });
    
    it('无效的版本格式应该失败验证', () => {
      expect(processor.validateVersion('1')).toBe(false); // 缺少小版本号
      expect(processor.validateVersion('1.0.1')).toBe(false); // 格式错误
      expect(processor.validateVersion('v1.0')).toBe(false); // 不能包含字母
      expect(processor.validateVersion('1,0')).toBe(false); // 格式错误
      expect(processor.validateVersion('')).toBe(false); // 不能为空
    });
  });
  
  describe('validateLang', () => {
    it('有效的语言代码应该通过验证', () => {
      expect(processor.validateLang('zh-CN')).toBe(true);
      expect(processor.validateLang('en-US')).toBe(true);
      expect(processor.validateLang('fr')).toBe(true);
      expect(processor.validateLang('de-DE')).toBe(true);
    });
    
    it('无效的语言代码应该失败验证', () => {
      expect(processor.validateLang('')).toBe(false); // 不能为空
      expect(processor.validateLang('123')).toBe(false); // 不能全是数字
      expect(processor.validateLang('zh_CN')).toBe(false); // 格式错误
    });
  });
  
  describe('processRootAttributes', () => {
    it('应该处理根元素的version属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'prompt',
        attributes: { version: '1.0' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        parserMode: 'loose',
        addWarning: vi.fn()
      };
      
      processor.processRootAttributes(element, context);
      
      // 验证模式应该被设置
      expect(context.parserMode).toBe('loose');
      expect(context.addWarning).not.toHaveBeenCalled();
    });
    
    it('应该为无效的version属性添加警告', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'prompt',
        attributes: { version: 'invalid' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        parserMode: 'loose',
        addWarning: vi.fn()
      };
      
      processor.processRootAttributes(element, context);
      
      // 应该添加警告
      expect(context.addWarning).toHaveBeenCalledWith(
        expect.stringContaining('invalid-version'),
        expect.stringContaining('invalid'),
        element.position
      );
    });
    
    it('应该处理根元素的lang属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'prompt',
        attributes: { lang: 'zh-CN' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        documentLang: undefined,
        addWarning: vi.fn()
      };
      
      processor.processRootAttributes(element, context);
      
      // 文档语言应该被设置
      expect(context.documentLang).toBe('zh-CN');
      expect(context.addWarning).not.toHaveBeenCalled();
    });
    
    it('应该为无效的lang属性添加警告', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'prompt',
        attributes: { lang: 'invalid' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        documentLang: undefined,
        addWarning: vi.fn()
      };
      
      processor.processRootAttributes(element, context);
      
      // 应该添加警告
      expect(context.addWarning).toHaveBeenCalledWith(
        expect.stringContaining('invalid-lang'),
        expect.stringContaining('invalid'),
        element.position
      );
    });
  });
  
  describe('processElementId', () => {
    it('应该为每个带有id属性的元素注册ID', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { id: 'user-role' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        idRegistry: new Map(),
        addWarning: vi.fn(),
        addError: vi.fn()
      };
      
      processor.processElementId(element, context);
      
      // ID应该被注册
      expect(context.idRegistry.has('user-role')).toBe(true);
      expect(context.idRegistry.get('user-role')).toBe(element);
      expect(context.addWarning).not.toHaveBeenCalled();
      expect(context.addError).not.toHaveBeenCalled();
    });
    
    it('应该为无效的id属性添加警告', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { id: '1invalid' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        idRegistry: new Map(),
        addWarning: vi.fn(),
        addError: vi.fn()
      };
      
      processor.processElementId(element, context);
      
      // 应该添加警告
      expect(context.addWarning).toHaveBeenCalledWith(
        expect.stringContaining('invalid-id'),
        expect.stringContaining('1invalid'),
        element.position
      );
      
      // ID不应该被注册
      expect(context.idRegistry.has('1invalid')).toBe(false);
    });
    
    it('应该为重复的id属性添加错误', () => {
      const element1: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { id: 'duplicate-id' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const element2: Element = {
        type: NodeType.ELEMENT,
        tagName: 'context',
        attributes: { id: 'duplicate-id' },
        children: [],
        position: {
          start: { line: 2, column: 1, offset: 21 },
          end: { line: 2, column: 20, offset: 40 }
        }
      };
      
      const context = {
        idRegistry: new Map(),
        addWarning: vi.fn(),
        addError: vi.fn()
      };
      
      // 注册第一个元素
      processor.processElementId(element1, context);
      
      // 尝试注册具有相同ID的第二个元素
      processor.processElementId(element2, context);
      
      // 应该添加错误
      expect(context.addError).toHaveBeenCalledWith(
        expect.stringContaining('duplicate-id'),
        expect.stringContaining('duplicate-id'),
        element2.position
      );
    });
  });
}); 