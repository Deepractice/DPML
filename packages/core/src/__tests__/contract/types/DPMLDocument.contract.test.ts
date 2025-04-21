import { describe, test, expect } from 'vitest';
import { DPMLDocument, DocumentMetadata } from '../../../types/DPMLDocument';
import { DPMLNode } from '../../../types/DPMLNode';

describe('DPMLDocument类型契约测试', () => {
  test('CT-Type-Doc-01: DPMLDocument类型结构应符合契约', () => {
    // 准备 - 创建符合类型定义的文档对象
    const document: DPMLDocument = {
      rootNode: {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null
      },
      nodesById: new Map(),
      metadata: {}
    };
    
    // 断言 - 验证类型定义包含所有规定属性
    expect(document).toHaveProperty('rootNode');
    expect(document).toHaveProperty('metadata');
    expect(document).toHaveProperty('nodesById');
    
    // 验证属性类型
    expect(document.rootNode).toMatchObject({
      tagName: expect.any(String),
      attributes: expect.any(Map),
      children: expect.any(Array)
    });
    
    expect(document.nodesById).toBeInstanceOf(Map);
    expect(document.metadata).toBeInstanceOf(Object);
  });
  
  test('CT-Type-Doc-02: DPMLDocument属性应为只读', () => {
    // 准备 - 创建符合类型定义的文档对象和节点
    const rootNode: DPMLNode = {
      tagName: 'root',
      attributes: new Map(),
      children: [],
      content: '',
      parent: null
    };
    
    const metadata: DocumentMetadata = {
      title: '测试文档',
      description: '用于测试的DPML文档'
    };
    
    const nodesById = new Map<string, DPMLNode>();
    
    const document: DPMLDocument = {
      rootNode,
      metadata,
      nodesById
    };
    
    // 执行 & 断言 - TypeScript编译器会阻止属性重新赋值
    // 这些操作在运行时不会被执行，但会在编译时检查
    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { document.rootNode = {} as DPMLNode; }).toThrow();
    
    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { document.metadata = {}; }).toThrow();
    
    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { document.nodesById = new Map(); }).toThrow();
  });
  
  test('CT-Type-Doc-03: DocumentMetadata类型结构应符合契约', () => {
    // 准备 - 创建符合类型定义的元数据对象
    const metadata: DocumentMetadata = {
      title: '文档标题',
      description: '文档描述',
      createdAt: new Date(),
      modifiedAt: new Date(),
      sourceFileName: 'test.dpml',
      custom: {
        author: '测试人员',
        version: '1.0.0'
      }
    };
    
    // 断言 - 验证类型定义包含所有规定属性及其类型
    expect(metadata).toHaveProperty('title');
    expect(metadata.title).toBeTypeOf('string');
    
    expect(metadata).toHaveProperty('description');
    expect(metadata.description).toBeTypeOf('string');
    
    expect(metadata).toHaveProperty('createdAt');
    expect(metadata.createdAt).toBeInstanceOf(Date);
    
    expect(metadata).toHaveProperty('modifiedAt');
    expect(metadata.modifiedAt).toBeInstanceOf(Date);
    
    expect(metadata).toHaveProperty('sourceFileName');
    expect(metadata.sourceFileName).toBeTypeOf('string');
    
    expect(metadata).toHaveProperty('custom');
    expect(metadata.custom).toBeTypeOf('object');
  });
}); 