import { describe, it, expect } from 'vitest';
import { TransformContext } from '../../src/transformer/interfaces/transformContext';
import { ProcessedDocument } from '../../src/processor/interfaces/processor';
import { NodeType } from '../../src/types/node';

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
}); 