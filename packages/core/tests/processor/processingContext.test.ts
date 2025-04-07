/**
 * ProcessingContext测试
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NodeType, Document, Element, Reference } from '../../src/types/node';
import { ResolvedReference } from '../../src/processor/interfaces';
import { ProcessingContext } from '../../src/processor/processingContext';

describe('ProcessingContext', () => {
  let context: ProcessingContext;
  let mockDocument: Document;
  
  beforeEach(() => {
    // 创建测试用的文档
    mockDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    };
    
    // 创建新的上下文实例
    context = new ProcessingContext(mockDocument, '/test/path');
  });

  describe('上下文创建与存取', () => {
    it('应该能够正确初始化上下文', () => {
      expect(context.document).toBe(mockDocument);
      expect(context.currentPath).toBe('/test/path');
      expect(context.resolvedReferences.size).toBe(0);
      expect(context.parentElements).toEqual([]);
      expect(context.variables).toEqual({});
    });
    
    it('应该能够跟踪父元素', () => {
      const element1: Element = {
        type: NodeType.ELEMENT,
        tagName: 'parent1',
        attributes: {},
        children: [],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      const element2: Element = {
        type: NodeType.ELEMENT,
        tagName: 'parent2',
        attributes: {},
        children: [],
        position: {
          start: { line: 2, column: 1, offset: 0 },
          end: { line: 2, column: 1, offset: 0 }
        }
      };
      
      // 添加父元素
      context.parentElements.push(element1);
      context.parentElements.push(element2);
      
      expect(context.parentElements.length).toBe(2);
      expect(context.parentElements[0]).toBe(element1);
      expect(context.parentElements[1]).toBe(element2);
      
      // 移除父元素
      const removed = context.parentElements.pop();
      expect(removed).toBe(element2);
      expect(context.parentElements.length).toBe(1);
    });
  });
  
  describe('引用缓存机制', () => {
    it('应该能够缓存和检索已解析的引用', () => {
      // 创建测试引用
      const reference: Reference = {
        type: NodeType.REFERENCE,
        protocol: 'test',
        path: 'test/path',
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 1, offset: 0 }
        }
      };
      
      // 创建解析结果
      const resolvedValue = { content: 'test content' };
      const resolvedReference: ResolvedReference = {
        reference,
        value: resolvedValue
      };
      
      // 测试引用缓存
      const cacheKey = `${reference.protocol}:${reference.path}`;
      context.resolvedReferences.set(cacheKey, resolvedReference);
      
      // 检查缓存是否工作
      expect(context.resolvedReferences.has(cacheKey)).toBe(true);
      expect(context.resolvedReferences.get(cacheKey)).toBe(resolvedReference);
      
      // 测试获取不存在的引用
      expect(context.resolvedReferences.has('nonexistent')).toBe(false);
      expect(context.resolvedReferences.get('nonexistent')).toBeUndefined();
    });
    
    it('应该能够清除引用缓存', () => {
      // 添加一些测试引用
      context.resolvedReferences.set('test:path1', { 
        reference: { 
          type: NodeType.REFERENCE, 
          protocol: 'test', 
          path: 'path1',
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
          }
        }, 
        value: {} 
      });
      
      context.resolvedReferences.set('test:path2', { 
        reference: { 
          type: NodeType.REFERENCE, 
          protocol: 'test', 
          path: 'path2',
          position: {
            start: { line: 2, column: 1, offset: 0 },
            end: { line: 2, column: 1, offset: 0 }
          }
        }, 
        value: {} 
      });
      
      expect(context.resolvedReferences.size).toBe(2);
      
      // 清除缓存
      context.resolvedReferences.clear();
      expect(context.resolvedReferences.size).toBe(0);
    });
  });
  
  describe('变量管理功能', () => {
    it('应该能够设置和获取变量', () => {
      // 初始状态下没有变量
      expect(context.variables).toEqual({});
      
      // 设置变量
      context.variables.testVar = 'test value';
      context.variables.numVar = 42;
      context.variables.objVar = { key: 'value' };
      
      // 检查变量
      expect(context.variables.testVar).toBe('test value');
      expect(context.variables.numVar).toBe(42);
      expect(context.variables.objVar).toEqual({ key: 'value' });
      
      // 修改变量
      context.variables.testVar = 'new value';
      expect(context.variables.testVar).toBe('new value');
      
      // 删除变量
      delete context.variables.numVar;
      expect(context.variables.numVar).toBeUndefined();
    });
    
    it('应该能够处理嵌套变量', () => {
      // 设置嵌套变量
      context.variables.user = {
        name: 'Test User',
        settings: {
          theme: 'dark',
          notifications: true
        }
      };
      
      // 检查嵌套变量
      expect(context.variables.user.name).toBe('Test User');
      expect(context.variables.user.settings.theme).toBe('dark');
      
      // 修改嵌套变量
      context.variables.user.settings.theme = 'light';
      expect(context.variables.user.settings.theme).toBe('light');
    });
  });
}); 