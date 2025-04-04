import { expect, describe, it, beforeEach, vi } from 'vitest';
import { ExtendedAttributeProcessor } from '../../../src/parser/attribute-processors/extended-attributes';
import { Element, NodeType } from '../../../src/types/node';

describe('ExtendedAttributeProcessor', () => {
  let processor: ExtendedAttributeProcessor;
  
  beforeEach(() => {
    processor = new ExtendedAttributeProcessor();
  });
  
  describe('validateBoolean', () => {
    it('应该验证布尔属性的有效值', () => {
      expect(processor.validateBoolean('true')).toBe(true);
      expect(processor.validateBoolean('false')).toBe(true);
      expect(processor.validateBoolean('1')).toBe(true);
      expect(processor.validateBoolean('0')).toBe(true);
      expect(processor.validateBoolean('yes')).toBe(true);
      expect(processor.validateBoolean('no')).toBe(true);
    });
    
    it('应该拒绝布尔属性的无效值', () => {
      expect(processor.validateBoolean('')).toBe(false);
      expect(processor.validateBoolean('maybe')).toBe(false);
      expect(processor.validateBoolean('truthy')).toBe(false);
      expect(processor.validateBoolean('2')).toBe(false);
    });
  });
  
  describe('validateConditional', () => {
    it('应该验证条件表达式的有效值', () => {
      expect(processor.validateConditional('${user.role == "admin"}')).toBe(true);
      expect(processor.validateConditional('${count > 5}')).toBe(true);
      expect(processor.validateConditional('${isEnabled}')).toBe(true);
    });
    
    it('应该拒绝条件表达式的无效值', () => {
      expect(processor.validateConditional('user.role == "admin"')).toBe(false); // 缺少${}
      expect(processor.validateConditional('${}')).toBe(false); // 空表达式
      expect(processor.validateConditional('')).toBe(false); // 空字符串
    });
  });
  
  describe('processDisabled', () => {
    it('应该处理有效的disabled属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { disabled: 'true' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: vi.fn()
      };
      
      processor.processDisabled(element, context);
      
      // 应该记录扩展属性，不添加警告
      expect(context.extendedAttributes.has(element)).toBe(true);
      expect(context.extendedAttributes.get(element)).toMatchObject({
        disabled: { value: true, conditional: false }
      });
      expect(context.addWarning).not.toHaveBeenCalled();
    });
    
    it('应该处理条件disabled属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { disabled: '${isAdmin}' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: vi.fn()
      };
      
      processor.processDisabled(element, context);
      
      // 应该记录为条件属性
      expect(context.extendedAttributes.has(element)).toBe(true);
      expect(context.extendedAttributes.get(element)).toMatchObject({
        disabled: { 
          value: '${isAdmin}',
          conditional: true,
          expression: 'isAdmin'
        }
      });
    });
    
    it('应该为无效的disabled属性添加警告', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { disabled: 'invalid' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: vi.fn()
      };
      
      processor.processDisabled(element, context);
      
      // 应该添加警告
      expect(context.addWarning).toHaveBeenCalledWith(
        expect.stringContaining('invalid-attribute'),
        expect.stringContaining('disabled'),
        element.position
      );
    });
  });
  
  describe('processHidden', () => {
    it('应该处理有效的hidden属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'div',
        attributes: { hidden: 'true' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: vi.fn()
      };
      
      processor.processHidden(element, context);
      
      // 应该记录扩展属性，不添加警告
      expect(context.extendedAttributes.has(element)).toBe(true);
      expect(context.extendedAttributes.get(element)).toMatchObject({
        hidden: { value: true, conditional: false }
      });
      expect(context.addWarning).not.toHaveBeenCalled();
    });
    
    it('应该处理条件hidden属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'div',
        attributes: { hidden: '${isSecret}' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: vi.fn()
      };
      
      processor.processHidden(element, context);
      
      // 应该记录为条件属性
      expect(context.extendedAttributes.has(element)).toBe(true);
      expect(context.extendedAttributes.get(element)).toMatchObject({
        hidden: { 
          value: '${isSecret}',
          conditional: true,
          expression: 'isSecret'
        }
      });
    });
  });
  
  describe('processAttributes', () => {
    it('应该处理所有扩展属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { 
          disabled: 'true',
          hidden: '${isAdmin}' 
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      const context = {
        extendedAttributes: new Map(),
        addWarning: vi.fn()
      };
      
      processor.processAttributes(element, context);
      
      // 应该处理所有属性
      expect(context.extendedAttributes.has(element)).toBe(true);
      expect(context.extendedAttributes.get(element)).toMatchObject({
        disabled: { value: true, conditional: false },
        hidden: { 
          value: '${isAdmin}',
          conditional: true,
          expression: 'isAdmin'
        }
      });
    });
  });
}); 