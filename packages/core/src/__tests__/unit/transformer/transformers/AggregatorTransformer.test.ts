/**
 * AggregatorTransformer单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { AggregatorTransformer } from '../../../../core/transformer/transformers/AggregatorTransformer';
import type { DPMLNode } from '../../../../types';
import type { CollectorConfig } from '../../../../types/CollectorConfig';
import type { TransformContext } from '../../../../types/TransformContext';

describe('AggregatorTransformer', () => {
  // 模拟文档节点
  const mockNodes: DPMLNode[] = [
    {
      tagName: 'item',
      attributes: new Map([
        ['category', 'fruit'],
        ['value', '10']
      ]),
      content: 'Apple',
      children: [],
      parent: null
    },
    {
      tagName: 'item',
      attributes: new Map([
        ['category', 'vegetable'],
        ['value', '5']
      ]),
      content: 'Carrot',
      children: [],
      parent: null
    },
    {
      tagName: 'item',
      attributes: new Map([
        ['category', 'fruit'],
        ['value', '8']
      ]),
      content: 'Banana',
      children: [],
      parent: null
    },
    {
      tagName: 'other',
      attributes: new Map(),
      content: 'Something else',
      children: [],
      parent: null
    }
  ];

  // 用于所有测试的模拟上下文
  let mockContext: TransformContext;

  // 模拟选择器函数
  const mockSelector = vi.fn().mockImplementation((selector: string) => {
    if (selector === 'item') {
      return mockNodes.filter(node => node.tagName === 'item');
    }

    if (selector === 'nonexistent') {
      return [];
    }

    return mockNodes;
  });

  // 每个测试前的设置
  beforeEach(() => {
    mockContext = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      getDocument: vi.fn().mockReturnValue({
        querySelectorAll: mockSelector
      }),
      getReferences: vi.fn(),
      isDocumentValid: vi.fn().mockReturnValue(true),
      getAllResults: vi.fn()
    } as unknown as TransformContext;
  });

  test('UT-AGGRE-01: transform应收集匹配选择器的元素', () => {
    // 准备
    const config: CollectorConfig = {
      selector: 'item'
    };
    const transformer = new AggregatorTransformer<unknown, DPMLNode[]>(config);

    // 执行
    const result = transformer.transform({}, mockContext) as DPMLNode[];

    // 断言
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ content: 'Apple' }),
      expect.objectContaining({ content: 'Carrot' }),
      expect.objectContaining({ content: 'Banana' })
    ]));
    expect(mockContext.getDocument).toHaveBeenCalled();
    expect(mockSelector).toHaveBeenCalledWith('item');
  });

  test('UT-AGGRE-02: transform应基于groupBy字段分组元素', () => {
    // 准备
    const config: CollectorConfig = {
      selector: 'item',
      groupBy: 'category'
    };
    const transformer = new AggregatorTransformer<unknown, Record<string, DPMLNode[]>>({
      ...config,
      groupBy: 'category'
    });

    // 执行
    const result = transformer.transform({}, mockContext) as Record<string, DPMLNode[]>;

    // 断言
    expect(result).toEqual({
      fruit: [
        expect.objectContaining({ content: 'Apple' }),
        expect.objectContaining({ content: 'Banana' })
      ],
      vegetable: [
        expect.objectContaining({ content: 'Carrot' })
      ]
    });
  });

  test('UT-AGGRE-03: transform应基于sortBy字段排序元素', () => {
    // 准备
    const config: CollectorConfig = {
      selector: 'item',
      sortBy: 'value'
    };
    const transformer = new AggregatorTransformer<unknown, DPMLNode[]>(config);

    // 执行
    const result = transformer.transform({}, mockContext) as DPMLNode[];

    // 断言
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    // 由于value是字符串，期望按字符串排序: "10", "5", "8" -> "10", "5", "8"
    expect(result[0]).toEqual(expect.objectContaining({ content: 'Apple' })); // value="10"
    expect(result[1]).toEqual(expect.objectContaining({ content: 'Carrot' })); // value="5"
    expect(result[2]).toEqual(expect.objectContaining({ content: 'Banana' })); // value="8"
  });

  test('UT-AGGRE-04: transform应将结果存储到上下文', () => {
    // 准备
    const config: CollectorConfig = {
      selector: 'item'
    };
    const transformer = new AggregatorTransformer<unknown, DPMLNode[]>(config);

    transformer.name = 'customAggregator';

    // 执行
    const result = transformer.transform({}, mockContext) as DPMLNode[];

    // 断言
    expect(mockContext.set).toHaveBeenCalledWith('customAggregator', result);
  });

  test('UT-AGGRE-NEG-01: transform应处理选择器无匹配的情况', () => {
    // 准备
    const config: CollectorConfig = {
      selector: 'nonexistent'
    };
    const transformer = new AggregatorTransformer<unknown, DPMLNode[]>(config);

    // 执行
    const result = transformer.transform({}, mockContext) as DPMLNode[];

    // 断言
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);

    // 检查分组情况下的空结果
    const groupingTransformer = new AggregatorTransformer<unknown, Record<string, DPMLNode[]>>({
      ...config,
      groupBy: 'category'
    });
    const groupResult = groupingTransformer.transform({}, mockContext) as Record<string, DPMLNode[]>;

    expect(groupResult).toEqual({});
  });
});
