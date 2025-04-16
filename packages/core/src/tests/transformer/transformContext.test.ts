import { describe, it, expect } from 'vitest';
import { TransformContext } from '../../transformer/interfaces/transformContext';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { NodeType } from '../../types/node';

describe('TransformContext', () => {
  // 模拟一个简单的ProcessedDocument
  const mockDocument: ProcessedDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 }
    },
    metadata: {
      version: '1.0'
    }
  };

  // 模拟选项
  const mockOptions = {
    format: 'json',
    mode: 'strict' as 'strict',
    variables: {
      testVar: 'testValue'
    }
  };

  it('应该能创建具有指定属性的上下文', () => {
    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: { localVar: 'localValue' },
      path: [],
      parentResults: []
    };

    expect(context.output).toEqual({});
    expect(context.document).toBe(mockDocument);
    expect(context.options).toBe(mockOptions);
    expect(context.variables).toEqual({ localVar: 'localValue' });
    expect(context.path).toEqual([]);
    expect(context.parentResults).toEqual([]);
  });

  it('应该能访问文档元数据', () => {
    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: {},
      path: [],
      parentResults: []
    };

    expect(context.document.metadata?.version).toBe('1.0');
  });

  it('应该能从选项中获取变量', () => {
    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: {},
      path: [],
      parentResults: []
    };

    expect(context.options.variables?.testVar).toBe('testValue');
  });

  it('应该能通过路径追踪当前位置', () => {
    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: {},
      path: ['document', 'element[0]', 'content'],
      parentResults: []
    };

    expect(context.path).toHaveLength(3);
    expect(context.path[0]).toBe('document');
    expect(context.path[1]).toBe('element[0]');
    expect(context.path[2]).toBe('content');
  });

  it('应该能通过parentResults追踪父节点结果', () => {
    const parentResult1 = { type: 'document' };
    const parentResult2 = { type: 'element', name: 'test' };
    
    const context: TransformContext = {
      output: {},
      document: mockDocument,
      options: mockOptions,
      variables: {},
      path: [],
      parentResults: [parentResult1, parentResult2]
    };

    expect(context.parentResults).toHaveLength(2);
    expect(context.parentResults[0]).toBe(parentResult1);
    expect(context.parentResults[1]).toBe(parentResult2);
  });

  // 创建基本上下文对象进行测试
  const createBaseContext = (): TransformContext => ({
    document: {
      type: 'document',
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 1, offset: 0 }
      }
    },
    output: {},
    options: {},
    variables: {},
    path: [],
    parentResults: []
  });

  describe('变量机制', () => {
    it('应该能存储和获取变量', () => {
      const context = createBaseContext();
      
      // 设置变量
      context.variables = {
        title: '测试文档',
        version: 1,
        author: {
          name: '张三',
          email: 'zhangsan@example.com'
        }
      };
      
      // 验证变量能正确获取
      expect(context.variables.title).toBe('测试文档');
      expect(context.variables.version).toBe(1);
      expect(context.variables.author.name).toBe('张三');
      expect(context.variables.author.email).toBe('zhangsan@example.com');
    });
    
    it('应该能合并和继承变量', () => {
      const parentContext = createBaseContext();
      parentContext.variables = {
        title: '父文档',
        version: 1,
        shared: true
      };
      
      // 创建子上下文，继承父上下文的变量
      const childContext: TransformContext = {
        ...parentContext,
        variables: {
          ...parentContext.variables,
          title: '子文档', // 覆盖父变量
          childOnly: 'unique' // 子特有变量
        }
      };
      
      // 验证子上下文正确继承和覆盖变量
      expect(childContext.variables.title).toBe('子文档'); // 被覆盖
      expect(childContext.variables.version).toBe(1); // 继承
      expect(childContext.variables.shared).toBe(true); // 继承
      expect(childContext.variables.childOnly).toBe('unique'); // 子特有
      
      // 验证父上下文变量不受影响
      expect(parentContext.variables.title).toBe('父文档');
      expect('childOnly' in parentContext.variables).toBe(false);
    });
    
    it('应该支持在嵌套处理中传递变量', () => {
      const rootContext = createBaseContext();
      rootContext.variables = {
        global: 'rootValue',
        level: 0
      };
      
      // 模拟嵌套上下文创建
      const level1Context: TransformContext = {
        ...rootContext,
        variables: {
          ...rootContext.variables,
          level: 1,
          level1Var: 'level1Value'
        }
      };
      
      const level2Context: TransformContext = {
        ...level1Context,
        variables: {
          ...level1Context.variables,
          level: 2,
          level2Var: 'level2Value'
        }
      };
      
      // 验证变量传递和继承
      expect(level2Context.variables.global).toBe('rootValue'); // 从根继承
      expect(level2Context.variables.level).toBe(2); // 被覆盖
      expect(level2Context.variables.level1Var).toBe('level1Value'); // 从level1继承
      expect(level2Context.variables.level2Var).toBe('level2Value'); // 自己的变量
      
      // 验证父级上下文不受影响
      expect(level1Context.variables.level).toBe(1);
      expect('level2Var' in level1Context.variables).toBe(false);
      
      expect(rootContext.variables.level).toBe(0);
      expect('level1Var' in rootContext.variables).toBe(false);
    });
  });
  
  describe('路径机制', () => {
    it('应该能正确存储路径信息', () => {
      const context = createBaseContext();
      
      // 设置路径
      context.path = ['document', 'section', 'paragraph'];
      
      // 验证路径
      expect(context.path).toEqual(['document', 'section', 'paragraph']);
      expect(context.path.length).toBe(3);
      expect(context.path[0]).toBe('document');
      expect(context.path[1]).toBe('section');
      expect(context.path[2]).toBe('paragraph');
    });
    
    it('应该支持路径的扩展和复制', () => {
      const parentContext = createBaseContext();
      parentContext.path = ['document', 'section'];
      
      // 创建子上下文，扩展路径
      const childContext: TransformContext = {
        ...parentContext,
        path: [...parentContext.path, 'paragraph']
      };
      
      // 验证子上下文的路径
      expect(childContext.path).toEqual(['document', 'section', 'paragraph']);
      expect(childContext.path.length).toBe(3);
      
      // 验证父上下文的路径不受影响
      expect(parentContext.path).toEqual(['document', 'section']);
      expect(parentContext.path.length).toBe(2);
    });
    
    it('应该支持路径中带有索引或标识符', () => {
      const context = createBaseContext();
      
      // 设置包含索引的路径
      context.path = [
        'document',
        'section[1]',
        'list[ordered]',
        'item[0]',
        'paragraph'
      ];
      
      // 验证路径
      expect(context.path).toEqual([
        'document',
        'section[1]',
        'list[ordered]',
        'item[0]',
        'paragraph'
      ]);
      expect(context.path.length).toBe(5);
    });
    
    it('应该支持根据路径获取当前位置信息', () => {
      const context = createBaseContext();
      context.path = ['document', 'section', 'paragraph'];
      
      // 验证路径信息
      const currentElement = context.path[context.path.length - 1];
      expect(currentElement).toBe('paragraph');
      
      const parentElement = context.path[context.path.length - 2];
      expect(parentElement).toBe('section');
      
      const isInSection = context.path.includes('section');
      expect(isInSection).toBe(true);
      
      const isInTable = context.path.includes('table');
      expect(isInTable).toBe(false);
    });
    
    it('应该支持路径组合作为标识符使用', () => {
      const context1 = createBaseContext();
      context1.path = ['document', 'section[1]', 'paragraph[2]'];
      
      const context2 = createBaseContext();
      context2.path = ['document', 'section[1]', 'paragraph[3]'];
      
      const context3 = createBaseContext();
      context3.path = ['document', 'section[1]', 'paragraph[2]'];
      
      // 生成路径标识符
      const pathId1 = context1.path.join('/');
      const pathId2 = context2.path.join('/');
      const pathId3 = context3.path.join('/');
      
      // 验证标识符
      expect(pathId1).toBe('document/section[1]/paragraph[2]');
      expect(pathId2).toBe('document/section[1]/paragraph[3]');
      expect(pathId3).toBe('document/section[1]/paragraph[2]');
      
      // 相同路径应该有相同标识符
      expect(pathId1).toBe(pathId3);
      // 不同路径应该有不同标识符
      expect(pathId1).not.toBe(pathId2);
    });
  });
  
  describe('路径与变量的结合使用', () => {
    it('应该支持基于路径设置变量作用域', () => {
      const rootContext = createBaseContext();
      rootContext.variables = { global: 'value' };
      rootContext.path = ['document'];
      
      // 为section创建上下文
      const sectionContext: TransformContext = {
        ...rootContext,
        path: [...rootContext.path, 'section[1]'],
        variables: {
          ...rootContext.variables,
          sectionTitle: 'Section 1'
        }
      };
      
      // 为段落创建上下文
      const paragraphContext: TransformContext = {
        ...sectionContext,
        path: [...sectionContext.path, 'paragraph[1]'],
        variables: {
          ...sectionContext.variables,
          paragraphStyle: 'normal'
        }
      };
      
      // 验证变量和路径
      expect(paragraphContext.path).toEqual(['document', 'section[1]', 'paragraph[1]']);
      expect(paragraphContext.variables.global).toBe('value'); // 从根继承
      expect(paragraphContext.variables.sectionTitle).toBe('Section 1'); // 从section继承
      expect(paragraphContext.variables.paragraphStyle).toBe('normal'); // 自己的变量
      
      // 验证父级上下文不受影响
      expect(sectionContext.path).toEqual(['document', 'section[1]']);
      expect('paragraphStyle' in sectionContext.variables).toBe(false);
      
      expect(rootContext.path).toEqual(['document']);
      expect('sectionTitle' in rootContext.variables).toBe(false);
    });
  });
}); 