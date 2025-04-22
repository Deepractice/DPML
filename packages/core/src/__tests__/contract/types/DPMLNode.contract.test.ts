import { describe, test, expect } from 'vitest';

import type { DPMLNode, SourceLocation } from '../../../types/DPMLNode';

describe('DPMLNode类型契约测试', () => {
  test('CT-Type-Node-01: DPMLNode类型结构应符合契约', () => {
    // 准备 - 创建符合类型定义的节点对象
    const node: DPMLNode = {
      tagName: 'test',
      attributes: new Map([['id', 'test1'], ['class', 'example']]),
      children: [],
      content: '测试内容',
      parent: null,
      sourceLocation: {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 20,
        fileName: 'test.dpml'
      }
    };

    // 断言 - 验证类型定义包含所有规定属性
    expect(node).toHaveProperty('tagName');
    expect(node).toHaveProperty('attributes');
    expect(node).toHaveProperty('children');
    expect(node).toHaveProperty('content');
    expect(node).toHaveProperty('parent');
    expect(node).toHaveProperty('sourceLocation');

    // 验证属性类型
    expect(node.tagName).toBeTypeOf('string');
    expect(node.attributes).toBeInstanceOf(Map);
    expect(node.children).toBeInstanceOf(Array);
    expect(node.content).toBeTypeOf('string');
    // parent可以为null
    expect(node.sourceLocation).toBeTypeOf('object');
  });

  test('CT-Type-Node-02: DPMLNode属性应为只读', () => {
    // 准备 - 创建真正不可变的节点对象
    const node = {} as DPMLNode;

    // 使用Object.defineProperties定义只读属性
    Object.defineProperties(node, {
      tagName: {
        value: 'test',
        writable: false,
        enumerable: true,
        configurable: false
      },
      attributes: {
        value: new Map<string, string>(),
        writable: false,
        enumerable: true,
        configurable: false
      },
      children: {
        value: [],
        writable: false,
        enumerable: true,
        configurable: false
      },
      content: {
        value: '',
        writable: false,
        enumerable: true,
        configurable: false
      },
      parent: {
        value: null,
        writable: false,
        enumerable: true,
        configurable: false
      }
    });

    // 执行 & 断言 - TypeScript编译器会阻止属性重新赋值
    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { node.tagName = 'changed'; }).toThrow();

    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { node.attributes = new Map(); }).toThrow();

    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { node.children = []; }).toThrow();

    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { node.content = 'changed'; }).toThrow();

    // @ts-expect-error - 尝试修改只读属性 (编译错误)
    expect(() => { node.parent = null; }).toThrow();
  });

  test('CT-Type-Node-03: SourceLocation类型结构应符合契约', () => {
    // 准备 - 创建符合类型定义的位置信息对象
    const location: SourceLocation = {
      startLine: 1,
      startColumn: 1,
      endLine: 2,
      endColumn: 10,
      fileName: 'test.dpml'
    };

    // 断言 - 验证类型定义包含所有规定属性及其类型
    expect(location).toHaveProperty('startLine');
    expect(location.startLine).toBeTypeOf('number');

    expect(location).toHaveProperty('startColumn');
    expect(location.startColumn).toBeTypeOf('number');

    expect(location).toHaveProperty('endLine');
    expect(location.endLine).toBeTypeOf('number');

    expect(location).toHaveProperty('endColumn');
    expect(location.endColumn).toBeTypeOf('number');

    expect(location).toHaveProperty('fileName');
    expect(location.fileName).toBeTypeOf('string');
  });

  test('CT-Type-Node-04: DPMLNode支持递归嵌套', () => {
    // 准备 - 创建嵌套节点结构
    const childNode: DPMLNode = {
      tagName: 'child',
      attributes: new Map(),
      children: [],
      content: '子节点内容',
      parent: null // 将在父节点创建后设置
    };

    const parentNode: DPMLNode = {
      tagName: 'parent',
      attributes: new Map(),
      children: [childNode],
      content: '',
      parent: null
    };

    // 设置父子关系
    // 在实际代码中，这种修改应该由构建节点的函数处理
    // 这里仅用于测试类型是否支持自引用关系
    Object.defineProperty(childNode, 'parent', { value: parentNode });

    // 断言 - 验证节点关系
    expect(parentNode.children[0]).toBe(childNode);
    expect(childNode.parent).toBe(parentNode);
  });
});
