import { describe, test, expect, vi, beforeEach } from 'vitest';

import { DPMLAdapter } from '../../../../core/parsing/DPMLAdapter';
import type { XMLNode } from '../../../../core/parsing/types';
import type { XMLAdapter } from '../../../../core/parsing/XMLAdapter';
import type { DPMLDocument } from '../../../../types/DPMLDocument';
import { createBasicDPMLFixture, createComplexDPMLFixture } from '../../../fixtures/parsing/dpmlFixtures';

describe('DPMLAdapter', () => {
  // 模拟XML适配器
  const mockXMLAdapter = {
    parse: vi.fn(),
    parseAsync: vi.fn()
  } as unknown as XMLAdapter;

  let adapter: DPMLAdapter;

  beforeEach(() => {
    // 重置模拟
    vi.resetAllMocks();
    // 创建适配器实例
    adapter = new DPMLAdapter({ throwOnError: true }, mockXMLAdapter);
  });

  test('UT-DPMLAdapter-01: parse方法应将XML转换为DPML结构', () => {
    // 准备 - 模拟XML节点
    const mockXMLNode: XMLNode = {
      type: 'element',
      name: 'root',
      attributes: {},
      children: [{
        type: 'element',
        name: 'child',
        attributes: { id: 'child1' },
        children: [],
        text: '内容'
      }]
    };

    (mockXMLAdapter.parse as any).mockReturnValue(mockXMLNode);

    // 执行
    const result = adapter.parse<DPMLDocument>(createBasicDPMLFixture());

    // 断言
    expect(result).toBeDefined();
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.tagName).toBe('root');
    expect(result.rootNode.children).toHaveLength(1);
    expect(result.rootNode.children[0].tagName).toBe('child');
    expect(result.rootNode.children[0].attributes.get('id')).toBe('child1');
    expect(result.rootNode.children[0].content).toBe('内容');
    expect(mockXMLAdapter.parse).toHaveBeenCalledWith(createBasicDPMLFixture());
  });

  test('UT-DPMLAdapter-02: parse方法应正确构建节点ID索引', () => {
    // 准备 - 模拟带ID的XML节点
    const mockXMLNode: XMLNode = {
      type: 'element',
      name: 'root',
      attributes: { id: 'root1' },
      children: [
        {
          type: 'element',
          name: 'child',
          attributes: { id: 'child1' },
          children: [],
          text: '子节点1'
        },
        {
          type: 'element',
          name: 'child',
          attributes: { id: 'child2' },
          children: [],
          text: '子节点2'
        }
      ]
    };

    (mockXMLAdapter.parse as any).mockReturnValue(mockXMLNode);

    // 执行
    const result = adapter.parse<DPMLDocument>(createBasicDPMLFixture());

    // 断言
    expect(result.nodesById).toBeDefined();
    expect(result.nodesById!.size).toBe(3);
    expect(result.nodesById!.has('root1')).toBe(true);
    expect(result.nodesById!.has('child1')).toBe(true);
    expect(result.nodesById!.has('child2')).toBe(true);
    expect(result.nodesById!.get('child1')!.content).toBe('子节点1');
    expect(result.nodesById!.get('child2')!.content).toBe('子节点2');
  });

  test('UT-DPMLAdapter-03: parse方法应处理嵌套节点', () => {
    // 准备 - 模拟嵌套XML结构
    const mockXMLNode: XMLNode = {
      type: 'element',
      name: 'root',
      attributes: {},
      children: [
        {
          type: 'element',
          name: 'parent',
          attributes: { id: 'parent1' },
          children: [
            {
              type: 'element',
              name: 'child',
              attributes: { id: 'child1' },
              children: [],
              text: '嵌套子节点'
            }
          ],
          text: ''
        }
      ]
    };

    (mockXMLAdapter.parse as any).mockReturnValue(mockXMLNode);

    // 执行
    const result = adapter.parse<DPMLDocument>(createComplexDPMLFixture());

    // 断言
    expect(result.rootNode.children).toHaveLength(1);
    expect(result.rootNode.children[0].tagName).toBe('parent');
    expect(result.rootNode.children[0].children).toHaveLength(1);
    expect(result.rootNode.children[0].children[0].tagName).toBe('child');
    expect(result.rootNode.children[0].children[0].content).toBe('嵌套子节点');

    // 验证父子关系
    const parent = result.rootNode.children[0];
    const child = parent.children[0];

    expect(child.parent).toBe(parent);
    expect(parent.parent).toBe(result.rootNode);
  });

  test('UT-DPMLAdapter-04: parseAsync方法应异步转换DPML', async () => {
    // 准备 - 模拟XML节点
    const mockXMLNode: XMLNode = {
      type: 'element',
      name: 'root',
      attributes: {},
      children: [{
        type: 'element',
        name: 'child',
        attributes: { id: 'child1' },
        children: [],
        text: '内容'
      }]
    };

    (mockXMLAdapter.parseAsync as any).mockResolvedValue(mockXMLNode);

    // 执行
    const result = await adapter.parseAsync<DPMLDocument>(createBasicDPMLFixture());

    // 断言
    expect(result).toBeDefined();
    expect(result.rootNode).toBeDefined();
    expect(result.rootNode.tagName).toBe('root');
    expect(result.rootNode.children).toHaveLength(1);
    expect(mockXMLAdapter.parseAsync).toHaveBeenCalledWith(createBasicDPMLFixture());
  });
});
