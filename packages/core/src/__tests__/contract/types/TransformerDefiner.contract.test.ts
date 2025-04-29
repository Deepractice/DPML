/**
 * TransformerDefiner类型契约测试
 * 验证TransformerDefiner接口符合预期的类型定义
 */

import type { TransformerDefiner, MappingRule, CollectorConfig, RelationConfig, SemanticExtractor, Transformer } from '../../../types';
import { describe, it, expect } from 'vitest';

describe('TransformerDefiner类型契约测试', () => {
  // 创建一个符合TransformerDefiner接口的模拟实现
  const createMockDefiner = (): TransformerDefiner => {
    return {
      defineStructuralMapper: <TInput, TOutput>(
        rules: Array<MappingRule<unknown, unknown>>
      ): Transformer<TInput, TOutput> => ({
        transform: (input: TInput) => ({} as TOutput),
        name: 'mockMapper'
      }),

      defineAggregator: <TInput, TOutput>(
        config: CollectorConfig
      ): Transformer<TInput, TOutput> => ({
        transform: (input: TInput) => ({} as TOutput),
        name: 'mockAggregator'
      }),

      defineTemplateTransformer: <TInput>(
        template: string | ((data: unknown) => string),
        preprocessor?: (input: TInput) => unknown
      ): Transformer<TInput, string> => ({
        transform: (input: TInput) => '',
        name: 'mockTemplate'
      }),

      defineRelationProcessor: <TInput, TOutput>(
        nodeSelector: string,
        config: RelationConfig
      ): Transformer<TInput, TOutput> => ({
        transform: (input: TInput) => ({} as TOutput),
        name: 'mockRelationProcessor'
      }),

      defineSemanticExtractor: <TInput, TOutput>(
        extractors: Array<SemanticExtractor<unknown, unknown>>
      ): Transformer<TInput, TOutput> => ({
        transform: (input: TInput) => ({} as TOutput),
        name: 'mockSemanticExtractor'
      }),

      defineResultCollector: <TOutput>(
        transformerNames?: string[]
      ): Transformer<unknown, TOutput> => ({
        transform: (input: unknown) => ({} as TOutput),
        name: 'mockResultCollector'
      })
    };
  };

  it('CT-Type-TransformerDefiner-01: 接口应包含所有必需的方法', () => {
    const definer = createMockDefiner();

    // 验证接口中的所有方法
    expect(typeof definer.defineStructuralMapper).toBe('function');
    expect(typeof definer.defineAggregator).toBe('function');
    expect(typeof definer.defineTemplateTransformer).toBe('function');
    expect(typeof definer.defineRelationProcessor).toBe('function');
    expect(typeof definer.defineSemanticExtractor).toBe('function');
    expect(typeof definer.defineResultCollector).toBe('function');
  });

  it('CT-Type-TransformerDefiner-02: defineStructuralMapper方法应接受规则数组并返回Transformer', () => {
    const definer = createMockDefiner();

    // 类型验证（编译时检查）
    const rules: Array<MappingRule<unknown, unknown>> = [
      { selector: 'test', targetPath: 'result' }
    ];

    const transformer = definer.defineStructuralMapper<{ data: string }, { result: number }>(rules);

    // 运行时验证
    expect(transformer).toHaveProperty('transform');
    expect(transformer).toHaveProperty('name');
    expect(typeof transformer.transform).toBe('function');
  });

  it('CT-Type-TransformerDefiner-03: defineTemplateTransformer方法应接受模板并返回Transformer', () => {
    const definer = createMockDefiner();

    // 字符串模板
    const stringTemplate = 'Hello, {{name}}!';
    const transformer1 = definer.defineTemplateTransformer<{ name: string }>(stringTemplate);

    // 函数模板
    const functionTemplate = (data: unknown) => `Hello, ${(data as any).name}!`;
    const transformer2 = definer.defineTemplateTransformer<{ name: string }>(functionTemplate);

    // 带预处理函数
    const preprocess = (input: { user: { name: string } }) => ({ name: input.user.name });
    const transformer3 = definer.defineTemplateTransformer<{ user: { name: string } }>(
      stringTemplate,
      preprocess
    );

    // 验证
    expect(transformer1).toHaveProperty('transform');
    expect(transformer2).toHaveProperty('transform');
    expect(transformer3).toHaveProperty('transform');
  });

  it('CT-Type-TransformerDefiner-04: defineAggregator方法应接受配置并返回Transformer', () => {
    const definer = createMockDefiner();

    const config: CollectorConfig = {
      selector: 'items',
      groupBy: 'category',
      sortBy: 'name'
    };

    const transformer = definer.defineAggregator<{ items: any[] }, { groups: Record<string, any[]> }>(config);

    expect(transformer).toHaveProperty('transform');
    expect(typeof transformer.transform).toBe('function');
  });

  it('CT-Type-TransformerDefiner-05: 所有定义方法的泛型参数应正确传递', () => {
    const definer = createMockDefiner();

    // 此测试主要通过TypeScript编译时检查验证泛型参数传递

    // 结构映射
    const mapper = definer.defineStructuralMapper<{ source: string }, { target: number }>([]);
    // 验证transform方法的参数和返回值类型（仅类型检查，不需运行）
    const mapperTransform = mapper.transform;

    // 模板转换
    const template = definer.defineTemplateTransformer<{ name: string }>('template');
    const templateTransform = template.transform;

    // 聚合转换
    const aggregator = definer.defineAggregator<{ items: any[] }, { result: any[] }>({ selector: 'sel' });
    const aggregatorTransform = aggregator.transform;

    // 关系处理
    const relation = definer.defineRelationProcessor<{ nodes: any[] }, { relations: any[] }>(
      'node',
      { source: 'src', target: 'tgt' }
    );
    const relationTransform = relation.transform;

    // 语义提取
    const semantic = definer.defineSemanticExtractor<{ doc: any }, { concepts: string[] }>([]);
    const semanticTransform = semantic.transform;

    // 结果收集
    const collector = definer.defineResultCollector<{ all: Record<string, any> }>();
    const collectorTransform = collector.transform;

    // 验证所有转换器都存在
    expect(mapperTransform).toBeDefined();
    expect(templateTransform).toBeDefined();
    expect(aggregatorTransform).toBeDefined();
    expect(relationTransform).toBeDefined();
    expect(semanticTransform).toBeDefined();
    expect(collectorTransform).toBeDefined();
  });
});
