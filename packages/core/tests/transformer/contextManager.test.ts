import { describe, it, expect } from 'vitest';
import { ContextManager } from '../../src/transformer/context/contextManager';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';
import { NodeType } from '../../src/types/node';

describe('ContextManager', () => {
  // 创建一个模拟文档用于测试
  const mockDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    }
  };
  
  // 创建模拟选项用于测试
  const mockOptions = {
    format: 'json',
    mode: 'strict' as const,
    variables: {
      title: '测试文档',
      version: 1
    }
  };
  
  describe('创建上下文', () => {
    it('应该能创建根上下文', () => {
      const contextManager = new ContextManager();
      
      const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
      
      // 验证根上下文的属性
      expect(rootContext.document).toBe(mockDocument);
      expect(rootContext.options).toBe(mockOptions);
      expect(rootContext.path).toEqual([]);
      expect(rootContext.variables).toEqual(mockOptions.variables);
      expect(rootContext.parentResults).toEqual([]);
    });
    
    it('应该能创建子上下文', () => {
      const contextManager = new ContextManager();
      
      // 创建根上下文
      const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
      
      // 创建子上下文
      const childContext = contextManager.createChildContext(
        rootContext,
        'section',
        { sectionTitle: '第一章' }
      );
      
      // 验证子上下文属性
      expect(childContext.document).toBe(mockDocument);
      expect(childContext.options).toBe(mockOptions);
      expect(childContext.path).toEqual(['section']);
      expect(childContext.variables).toEqual({
        ...mockOptions.variables,
        sectionTitle: '第一章'
      });
      expect(childContext.parentResults).toEqual([]);
    });
    
    it('应该能嵌套创建多级上下文', () => {
      const contextManager = new ContextManager();
      
      // 创建根上下文
      const rootContext = contextManager.createRootContext(mockDocument, mockOptions);
      
      // 创建第一级子上下文
      const level1Context = contextManager.createChildContext(
        rootContext,
        'section[1]',
        { sectionTitle: '第一章' }
      );
      
      // 创建第二级子上下文
      const level2Context = contextManager.createChildContext(
        level1Context,
        'paragraph[1]',
        { paragraphStyle: 'normal' }
      );
      
      // 验证层级关系
      expect(level2Context.path).toEqual(['section[1]', 'paragraph[1]']);
      expect(level2Context.variables).toEqual({
        ...mockOptions.variables,
        sectionTitle: '第一章',
        paragraphStyle: 'normal'
      });
    });
  });
  
  describe('路径处理', () => {
    it('应该能获取当前路径元素', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      const context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: {},
        path: ['document', 'section', 'paragraph'],
        parentResults: []
      };
      
      // 获取当前路径元素
      const currentElement = contextManager.getCurrentPathElement(context);
      expect(currentElement).toBe('paragraph');
    });
    
    it('应该能获取父路径元素', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      const context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: {},
        path: ['document', 'section', 'paragraph'],
        parentResults: []
      };
      
      // 获取父路径元素
      const parentElement = contextManager.getParentPathElement(context);
      expect(parentElement).toBe('section');
    });
    
    it('空路径应该处理正确', () => {
      const contextManager = new ContextManager();
      
      // 创建空路径上下文
      const emptyContext: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: {},
        path: [],
        parentResults: []
      };
      
      // 获取当前和父路径元素
      const currentElement = contextManager.getCurrentPathElement(emptyContext);
      const parentElement = contextManager.getParentPathElement(emptyContext);
      
      expect(currentElement).toBeUndefined();
      expect(parentElement).toBeUndefined();
    });
    
    it('应该能检查路径是否包含指定元素', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      const context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: {},
        path: ['document', 'section[1]', 'paragraph'],
        parentResults: []
      };
      
      // 检查路径包含
      expect(contextManager.pathContains(context, 'section[1]')).toBe(true);
      expect(contextManager.pathContains(context, 'table')).toBe(false);
    });
    
    it('应该能生成路径标识符', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      const context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: {},
        path: ['document', 'section[1]', 'paragraph[2]'],
        parentResults: []
      };
      
      // 生成路径标识符
      const defaultSeparator = contextManager.getPathIdentifier(context);
      const customSeparator = contextManager.getPathIdentifier(context, '.');
      
      expect(defaultSeparator).toBe('document/section[1]/paragraph[2]');
      expect(customSeparator).toBe('document.section[1].paragraph[2]');
    });
    
    it('应该能解析路径元素的索引', () => {
      const contextManager = new ContextManager();
      
      // 解析索引
      expect(contextManager.getElementIndex('section[1]')).toBe(1);
      expect(contextManager.getElementIndex('paragraph[42]')).toBe(42);
      expect(contextManager.getElementIndex('element')).toBeUndefined();
      expect(contextManager.getElementIndex('list[ordered]')).toBeUndefined();
    });
    
    it('应该能解析路径元素的名称', () => {
      const contextManager = new ContextManager();
      
      // 解析名称
      expect(contextManager.getElementName('section[1]')).toBe('section');
      expect(contextManager.getElementName('list[ordered]')).toBe('list');
      expect(contextManager.getElementName('paragraph')).toBe('paragraph');
    });
    
    it('应该能解析路径元素的标识符', () => {
      const contextManager = new ContextManager();
      
      // 解析标识符
      expect(contextManager.getElementIdentifier('list[ordered]')).toBe('ordered');
      expect(contextManager.getElementIdentifier('section[1]')).toBeUndefined();
      expect(contextManager.getElementIdentifier('paragraph')).toBeUndefined();
    });
  });
  
  describe('变量处理', () => {
    it('应该能获取和设置单个变量', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      let context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: { existing: 'value' },
        path: [],
        parentResults: []
      };
      
      // 获取现有变量
      expect(contextManager.getVariable(context, 'existing')).toBe('value');
      expect(contextManager.getVariable(context, 'nonexisting')).toBeUndefined();
      expect(contextManager.getVariable(context, 'nonexisting', 'default')).toBe('default');
      
      // 设置变量
      context = contextManager.setVariable(context, 'newVar', 42);
      expect(context.variables.newVar).toBe(42);
      expect(context.variables.existing).toBe('value');
    });
    
    it('应该能批量设置变量', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      let context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: { existing: 'value' },
        path: [],
        parentResults: []
      };
      
      // 批量设置变量
      context = contextManager.setVariables(context, {
        newVar1: 'one',
        newVar2: 'two',
        existing: 'updated'
      });
      
      // 验证变量
      expect(context.variables.existing).toBe('updated');
      expect(context.variables.newVar1).toBe('one');
      expect(context.variables.newVar2).toBe('two');
    });
  });
  
  describe('上下文管理', () => {
    it('应该能添加结果到上下文', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      let context: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: {},
        variables: {},
        path: [],
        parentResults: []
      };
      
      // 添加结果
      const result1 = { type: 'section', id: 1 };
      context = contextManager.addResult(context, result1);
      
      // 验证结果
      expect(context.parentResults).toEqual([result1]);
      
      // 添加第二个结果
      const result2 = { type: 'paragraph', id: 2 };
      context = contextManager.addResult(context, result2);
      
      // 验证结果链
      expect(context.parentResults).toEqual([result1, result2]);
    });
    
    it('应该能克隆上下文', () => {
      const contextManager = new ContextManager();
      
      // 创建测试上下文
      const originalContext: TransformContext = {
        document: mockDocument,
        options: mockOptions,
        output: { key: 'value' },
        variables: { var1: 'val1', var2: 'val2' },
        path: ['document', 'section'],
        parentResults: [{ type: 'result' }]
      };
      
      // 克隆上下文
      const clonedContext = contextManager.cloneContext(originalContext);
      
      // 验证是新对象
      expect(clonedContext).not.toBe(originalContext);
      
      // 验证内容相同
      expect(clonedContext.document).toBe(originalContext.document);
      expect(clonedContext.options).toBe(originalContext.options);
      expect(clonedContext.variables).toEqual(originalContext.variables);
      expect(clonedContext.path).toEqual(originalContext.path);
      expect(clonedContext.parentResults).toEqual(originalContext.parentResults);
      expect(clonedContext.output).toEqual(originalContext.output);
      
      // 验证深拷贝（修改不影响原对象）
      clonedContext.variables.var1 = 'modified';
      clonedContext.path.push('paragraph');
      clonedContext.parentResults.push({ type: 'newResult' });
      clonedContext.output.newKey = 'newValue';
      
      expect(originalContext.variables.var1).toBe('val1');
      expect(originalContext.path).toEqual(['document', 'section']);
      expect(originalContext.parentResults).toEqual([{ type: 'result' }]);
      expect(originalContext.output).toEqual({ key: 'value' });
    });
  });
}); 