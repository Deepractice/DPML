import { expect, describe, it, beforeEach } from 'vitest';
import { Validator } from '../../src/parser/validator';
import { TagRegistry } from '../../src/parser/tag-registry';
import { TagDefinition } from '../../src/parser/tag-definition';
import { NodeType, Element, Document } from '../../src/types/node';
import { ErrorCode } from '../../src/errors/types';

describe('Validator', () => {
  let registry: TagRegistry;
  let validator: Validator;
  
  beforeEach(() => {
    registry = new TagRegistry();
    
    // 注册一些测试标签
    registry.registerTagDefinition('role', {
      attributes: ['name', 'id'],
      requiredAttributes: ['name'],
      allowedChildren: ['content']
    });
    
    registry.registerTagDefinition('prompt', {
      attributes: ['id', 'version'],
      allowedChildren: ['role', 'context']
    });
    
    registry.registerTagDefinition('context', {
      attributes: ['id'],
      allowedChildren: []
    });
    
    registry.registerTagDefinition('br', {
      selfClosing: true
    });
    
    validator = new Validator(registry);
  });
  
  describe('validateElement', () => {
    it('应该验证有效的标签', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { name: 'user' },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 }
        }
      };
      
      const result = validator.validateElement(element);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    
    it('应该检测缺少必需属性的情况', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { id: 'user-role' }, // 缺少必需的name属性
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 }
        }
      };
      
      const result = validator.validateElement(element);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].code).toBe(ErrorCode.MISSING_REQUIRED_ATTRIBUTE);
    });
    
    it('应该检测未知属性', () => {
      const element: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { 
          name: 'user',
          unknown: 'value' // 未定义的属性
        },
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 10, offset: 9 }
        }
      };
      
      const result = validator.validateElement(element);
      
      // 未知属性应该生成警告而非错误
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });
  });
  
  describe('validateChildren', () => {
    it('应该验证有效的子标签', () => {
      const promptElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'prompt',
        attributes: {},
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'role',
            attributes: { name: 'user' },
            children: [],
            position: {
              start: { line: 2, column: 1, offset: 10 },
              end: { line: 2, column: 10, offset: 19 }
            }
          },
          {
            type: NodeType.ELEMENT,
            tagName: 'context',
            attributes: {},
            children: [],
            position: {
              start: { line: 3, column: 1, offset: 20 },
              end: { line: 3, column: 10, offset: 29 }
            }
          }
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 4, column: 1, offset: 30 }
        }
      };
      
      const result = validator.validateChildren(promptElement);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    
    it('应该检测无效的子标签', () => {
      const roleElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'role',
        attributes: { name: 'user' },
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'prompt', // role标签不允许prompt子标签
            attributes: {},
            children: [],
            position: {
              start: { line: 2, column: 1, offset: 10 },
              end: { line: 2, column: 10, offset: 19 }
            }
          }
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 1, offset: 20 }
        }
      };
      
      const result = validator.validateChildren(roleElement);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].code).toBe(ErrorCode.INVALID_NESTING);
    });
    
    it('应该处理自闭合标签', () => {
      const selfClosingElement: Element = {
        type: NodeType.ELEMENT,
        tagName: 'br',
        attributes: {},
        children: [], // 自闭合标签不应该有子节点
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 5, offset: 4 }
        }
      };
      
      const result = validator.validateElement(selfClosingElement);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('validateDocument', () => {
    it('应该验证完整文档', () => {
      const document: Document = {
        type: NodeType.DOCUMENT,
        children: [
          {
            type: NodeType.ELEMENT,
            tagName: 'prompt',
            attributes: { version: '1.0' },
            children: [
              {
                type: NodeType.ELEMENT,
                tagName: 'role',
                attributes: { name: 'user' },
                children: [],
                position: {
                  start: { line: 2, column: 1, offset: 10 },
                  end: { line: 2, column: 10, offset: 19 }
                }
              }
            ],
            position: {
              start: { line: 1, column: 1, offset: 0 },
              end: { line: 3, column: 1, offset: 20 }
            }
          }
        ],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 3, column: 1, offset: 20 }
        }
      };
      
      const result = validator.validateDocument(document);
      
      expect(result.valid).toBe(true);
    });
  });
}); 