/**
 * TagDefinition集成测试
 * 
 * 验证TagDefinition在各种使用场景下的一致性
 */

import { expect, describe, it, beforeEach } from 'vitest';
import { TagRegistry } from '@core/parser/tag-registry';
import { TagDefinition } from '@core/parser/tag-definition';
import { Validator } from '@core/parser/validator';
import { NodeType, Element, Node } from '@core/types/node';

describe('TagDefinition集成测试', () => {
  let registry: TagRegistry;
  let validator: Validator;
  
  beforeEach(() => {
    registry = new TagRegistry();
    validator = new Validator(registry);
  });
  
  describe('数组格式属性定义', () => {
    it('应该能正确验证使用数组格式的标签', () => {
      // 使用数组格式注册标签
      registry.registerTagDefinition('button', {
        attributes: ['id', 'type', 'disabled'],
        requiredAttributes: ['id'],
        allowedChildren: ['icon', 'text']
      });
      
      // 创建有效的元素
      const validElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { 
          id: 'submit-btn',
          type: 'submit' 
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      // 创建缺少必需属性的元素
      const invalidElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { 
          type: 'submit' 
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      // 验证有效元素
      const validResult = validator.validateElement(validElement);
      expect(validResult.valid).toBe(true);
      
      // 验证无效元素
      const invalidResult = validator.validateElement(invalidElement);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors?.[0].code).toBe('missing-required-attribute');
    });
  });
  
  describe('对象格式属性定义', () => {
    it('应该能正确验证使用对象格式的标签', () => {
      // 使用对象格式注册标签
      registry.registerTagDefinition('input', {
        attributes: {
          id: {
            type: 'string',
            required: true
          },
          type: {
            type: 'string',
            required: false,
            default: 'text'
          },
          value: {
            type: 'string',
            required: false
          },
          readonly: {
            type: 'boolean',
            required: false
          }
        },
        selfClosing: true
      });
      
      // 创建有效的元素
      const validElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'input',
        attributes: { 
          id: 'username',
          type: 'email'
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      // 创建缺少必需属性的元素
      const invalidElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'input',
        attributes: { 
          type: 'email'  
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      // 验证有效元素
      const validResult = validator.validateElement(validElement);
      expect(validResult.valid).toBe(true);
      
      // 验证无效元素
      const invalidResult = validator.validateElement(invalidElement);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors?.[0].code).toBe('missing-required-attribute');
    });
    
    it('应该能正确处理简化的布尔属性定义', () => {
      // 使用布尔值简化定义
      registry.registerTagDefinition('option', {
        attributes: {
          value: true, // 必需
          selected: false // 可选
        }
      });
      
      // 创建有效的元素
      const validElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'option',
        attributes: { 
          value: '1',
          selected: 'true'
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      // 创建缺少必需属性的元素
      const invalidElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'option',
        attributes: { 
          selected: 'true'
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 20, offset: 19 }
        }
      };
      
      // 验证有效元素
      const validResult = validator.validateElement(validElement);
      expect(validResult.valid).toBe(true);
      
      // 验证无效元素 - 这里可能需要修复验证器，确保它能处理简化的布尔属性定义
      const invalidResult = validator.validateElement(invalidElement);
      expect(invalidResult.valid).toBe(false);
    });
  });
  
  describe('混合使用格式', () => {
    it('应该支持同时使用两种格式', () => {
      // 使用对象格式
      registry.registerTagDefinition('form', {
        attributes: {
          id: {
            type: 'string',
            required: true
          },
          method: {
            type: 'string',
            required: false,
            default: 'post'
          }
        },
        allowedChildren: ['input', 'button', 'select']
      });
      
      // 使用数组格式
      registry.registerTagDefinition('select', {
        attributes: ['name', 'multiple'],
        requiredAttributes: ['name'],
        allowedChildren: ['option']
      });
      
      // 注册button标签
      registry.registerTagDefinition('button', {
        attributes: ['id', 'type'],
        requiredAttributes: ['id'],
        allowedChildren: []
      });
      
      // 定义子元素
      const selectElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'select',
        attributes: { 
          name: 'user-type'
        },
        children: [],
        position: {
          start: { line: 2, column: 2, offset: 30 },
          end: { line: 2, column: 25, offset: 53 }
        }
      };
      
      const buttonElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'button',
        attributes: { 
          id: 'submit'
        },
        children: [],
        position: {
          start: { line: 3, column: 2, offset: 55 },
          end: { line: 3, column: 20, offset: 73 }
        }
      };
      
      // 嵌套元素验证
      const formElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'form',
        attributes: { 
          id: 'login-form',
          method: 'post'
        },
        children: [
          selectElement,
          buttonElement
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 4, column: 1, offset: 74 }
        }
      };
      
      // 验证表单元素
      const formResult = validator.validateElement(formElement);
      expect(formResult.valid).toBe(true);
      
      // 注册div标签以处理测试
      registry.registerTagDefinition('div', {
        attributes: [],
        allowedChildren: []
      });
      
      // 创建无效子标签
      const divElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'div', // 已注册，但不允许作为form的子元素
        attributes: {},
        children: [],
        position: {
          start: { line: 4, column: 2, offset: 76 },
          end: { line: 4, column: 15, offset: 89 }
        }
      };
      
      // 创建带无效子标签的表单
      const childrenWithDiv: Node[] = [
        selectElement,
        buttonElement,
        divElement
      ];
      
      const invalidFormElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'form',
        attributes: { 
          id: 'login-form',
          method: 'post'
        },
        children: childrenWithDiv,
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 4, column: 1, offset: 74 }
        }
      };
      
      const invalidFormResult = validator.validateElement(invalidFormElement);
      expect(invalidFormResult.valid).toBe(false);
    });
  });
}); 