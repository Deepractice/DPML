import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DPMLError, ErrorCode } from '../../../errors';
import { NodeVisitor, ResolvedReference } from '../../../processor/interfaces';
import { ProcessingContext } from '../../../processor/processingContext';
import { InheritanceVisitor } from '../../../processor/visitors/inheritanceVisitor';
import { NodeType } from '../../../types/node';

import type { ReferenceResolver } from '../../../processor/interfaces';
import type {
  Element,
  Document,
  SourcePosition,
  Content,
} from '../../../types/node';

describe('InheritanceVisitor', () => {
  let visitor: InheritanceVisitor;
  let context: ProcessingContext;
  let mockReferenceResolver: ReferenceResolver;
  const mockPosition: SourcePosition = {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 },
  };

  beforeEach(() => {
    // 创建模拟引用解析器
    mockReferenceResolver = {
      resolve: vi.fn(),
      getProtocolHandler: vi.fn(),
    };

    // 创建带有引用解析器的访问者
    visitor = new InheritanceVisitor(mockReferenceResolver);

    // 创建基础文档
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: mockPosition,
    };

    // 创建处理上下文
    context = new ProcessingContext(document, '/test/path');
    // 手动添加idMap，因为这是测试中需要的，但在接口中是可选的
    (context as any).idMap = new Map<string, Element>();
  });

  it('不应修改没有extends属性的元素', async () => {
    // 准备没有extends属性的测试元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test',
      attributes: { id: 'test1' },
      children: [],
      position: mockPosition,
    };

    // 执行访问方法
    const result = await visitor.visitElement(element, context);

    // 验证元素没有被修改
    expect(result).toEqual(element);
  });

  it('应该从给定ID继承属性', async () => {
    // 准备基础元素和继承元素
    const baseElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'base',
      attributes: {
        id: 'baseEl',
        color: 'red',
        size: 'large',
      },
      children: [],
      position: mockPosition,
    };

    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: {
        extends: 'id:baseEl',
        size: 'small', // 覆盖基础元素的属性
        weight: 'bold', // 新增属性
      },
      children: [],
      position: mockPosition,
    };

    // 将基础元素添加到ID映射中
    (context as any).idMap.set('baseEl', baseElement);

    // 执行访问方法
    const result = await visitor.visitElement(childElement, context);

    // 验证属性合并结果
    expect(result.attributes).toEqual({
      extends: 'id:baseEl',
      color: 'red', // 从基础元素继承
      size: 'small', // 子元素覆盖
      weight: 'bold', // 子元素新增
    });
    expect(result.tagName).toBe('child'); // 标签名不变
  });

  it('应该从相对路径文件继承', async () => {
    // 模拟相对路径继承的元素
    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: {
        extends: 'file:./base.dpml#baseElement',
      },
      children: [],
      position: mockPosition,
    };

    // 模拟外部元素
    const baseElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'base',
      attributes: { id: 'baseElement', color: 'blue' },
      children: [],
      position: mockPosition,
    };

    // 配置引用解析器的mock返回
    (mockReferenceResolver.resolve as any).mockResolvedValue({
      reference: {
        type: NodeType.REFERENCE,
        protocol: 'file',
        path: './base.dpml',
        position: mockPosition,
      },
      value: {
        type: NodeType.DOCUMENT,
        children: [baseElement],
        position: mockPosition,
      },
    });

    // 执行访问方法
    const result = await visitor.visitElement(childElement, context);

    // 验证属性继承
    expect(result.attributes).toEqual({
      extends: 'file:./base.dpml#baseElement',
      color: 'blue',
    });
  });

  it('应该从HTTP远程资源继承', async () => {
    // 模拟HTTP继承的元素
    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: {
        extends: 'http://example.com/base.dpml#remoteBase',
      },
      children: [],
      position: mockPosition,
    };

    // 模拟远程元素
    const remoteElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'remoteBase',
      attributes: { id: 'remoteBase', theme: 'dark' },
      children: [],
      position: mockPosition,
    };

    // 配置引用解析器的mock返回
    (mockReferenceResolver.resolve as any).mockResolvedValue({
      reference: {
        type: NodeType.REFERENCE,
        protocol: 'http',
        path: 'http://example.com/base.dpml',
        position: mockPosition,
      },
      value: {
        type: NodeType.DOCUMENT,
        children: [remoteElement],
        position: mockPosition,
      },
    });

    // 执行访问方法
    const result = await visitor.visitElement(childElement, context);

    // 验证属性继承
    expect(result.attributes).toEqual({
      extends: 'http://example.com/base.dpml#remoteBase',
      theme: 'dark',
    });
  });

  it('应该正确合并继承属性', async () => {
    // 准备基础元素和继承元素
    const baseElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'base',
      attributes: {
        id: 'baseEl',
        color: 'red',
        size: 'large',
        shared: 'original',
        meta: { key1: 'value1', key2: 'value2' },
      },
      children: [],
      position: mockPosition,
    };

    const childElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: {
        extends: 'id:baseEl',
        color: 'blue', // 覆盖简单属性
        meta: { key2: 'newValue', key3: 'value3' }, // 部分覆盖对象属性
        newAttr: 'value', // 新增属性
      },
      children: [],
      position: mockPosition,
    };

    // 将基础元素添加到ID映射中
    (context as any).idMap.set('baseEl', baseElement);

    // 执行访问方法
    const result = await visitor.visitElement(childElement, context);

    // 验证属性合并结果
    expect(result.attributes).toEqual({
      extends: 'id:baseEl',
      color: 'blue', // 子元素覆盖
      size: 'large', // 从基础元素继承
      shared: 'original', // 从基础元素继承
      meta: { key2: 'newValue', key3: 'value3' }, // 对象合并策略以子元素为主
      newAttr: 'value', // 子元素新增
    });
  });

  it('应该正确处理继承内容', async () => {
    // 准备带内容的基础元素
    const baseElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'base',
      attributes: { id: 'baseEl' },
      children: [
        {
          type: NodeType.CONTENT,
          value: 'Base content',
          position: mockPosition,
        } as Content,
      ],
      position: mockPosition,
    };

    // 情况1: 子元素没有内容，应继承基础元素内容
    const emptyChildElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: { extends: 'id:baseEl' },
      children: [],
      position: mockPosition,
    };

    // 情况2: 子元素有自己的内容，不应继承基础元素内容
    const contentChildElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: { extends: 'id:baseEl' },
      children: [
        {
          type: NodeType.CONTENT,
          value: 'Child content',
          position: mockPosition,
        } as Content,
      ],
      position: mockPosition,
    };

    // 将基础元素添加到ID映射中
    (context as any).idMap.set('baseEl', baseElement);

    // 测试无内容子元素
    const emptyResult = await visitor.visitElement(emptyChildElement, context);

    expect(emptyResult.children).toEqual(baseElement.children); // 应继承基础内容

    // 测试有内容子元素
    const contentResult = await visitor.visitElement(
      contentChildElement,
      context
    );

    expect(contentResult.children).toEqual(contentChildElement.children); // 应保留自身内容
  });

  it('应该处理继承错误情况', async () => {
    // 测试继承不存在的ID
    const nonExistentElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'child',
      attributes: { extends: 'id:nonExistent' },
      children: [],
      position: mockPosition,
    };

    // 执行访问方法，应该抛出错误
    await expect(
      visitor.visitElement(nonExistentElement, context)
    ).rejects.toThrow(DPMLError);

    // 验证错误代码
    await expect(
      visitor.visitElement(nonExistentElement, context)
    ).rejects.toMatchObject({
      code: ErrorCode.REFERENCE_NOT_FOUND,
    });

    // 测试循环继承
    const element1: Element = {
      type: NodeType.ELEMENT,
      tagName: 'el1',
      attributes: { id: 'el1', extends: 'id:el2' },
      children: [],
      position: mockPosition,
    };

    const element2: Element = {
      type: NodeType.ELEMENT,
      tagName: 'el2',
      attributes: { id: 'el2', extends: 'id:el1' },
      children: [],
      position: mockPosition,
    };

    // 将元素添加到ID映射中
    (context as any).idMap.set('el1', element1);
    (context as any).idMap.set('el2', element2);

    // 设置继承链以模拟第一次引用已处理
    // 这是因为循环检测是在处理第二个元素时触发的
    context.variables.inheritanceChain = ['id:el1'];

    // 循环继承应抛出错误
    await expect(visitor.visitElement(element2, context)).rejects.toThrow(
      DPMLError
    );

    // 验证循环引用错误代码
    await expect(visitor.visitElement(element2, context)).rejects.toMatchObject(
      {
        code: ErrorCode.CIRCULAR_REFERENCE,
      }
    );
  });
});
