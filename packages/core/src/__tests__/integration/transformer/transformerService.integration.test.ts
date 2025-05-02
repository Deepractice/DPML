/**
 * transformerService集成测试
 * 测试模块服务如何协调Pipeline、Registry和转换器
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import { createStructuralMapper, createAggregator } from '../../../core/framework/transformer/transformerFactory';
import { registerTransformer, transform } from '../../../core/transformer/transformerService';
import type { Transformer, CollectorConfig } from '../../../types';
import { createProcessingResultFixture, createMappingRulesFixture } from '../../fixtures/transformer/transformerFixtures';

// 清除测试夹具中可能注册了的转换器
beforeEach(() => {
  // 由于TransformerRegistry是单例，我们需要在每个测试开始前确保是干净的状态
  // 但在集成测试中，我们需要让真实的注册过程发生，不应该mock
  // 这里只做一些必要的准备工作
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('transformerService集成测试', () => {
  /**
   * ID: IT-TRANSVC-01
   * 描述: transform应创建Pipeline并执行转换流程
   */
  test('transform应创建Pipeline并执行转换流程', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建测试转换器
    const testTransformer: Transformer<unknown, unknown> = {
      name: 'testTransformer',
      transform: vi.fn().mockImplementation((input, context) => {
        // 模拟转换器操作：添加处理结果到上下文
        context.set('testTransformer', { processed: true, data: 'test' });

        return { processed: true, data: 'test' };
      })
    };

    // 注册测试转换器
    registerTransformer(testTransformer);

    // 执行
    const result = transform(processingResult);

    // 断言
    expect(result).toBeDefined();
    expect(testTransformer.transform).toHaveBeenCalled();
    expect(result.merged).toHaveProperty('processed', true);
    expect(result.merged).toHaveProperty('data', 'test');
  });

  /**
   * ID: IT-TRANSVC-02
   * 描述: transform应支持full结果模式
   */
  test('transform应支持full结果模式', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建两个测试转换器
    const transformer1: Transformer<unknown, unknown> = {
      name: 'transformer1',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer1', { value1: 'one' });

        return { value1: 'one' };
      })
    };

    const transformer2: Transformer<unknown, unknown> = {
      name: 'transformer2',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer2', { value2: 'two' });

        return { value2: 'two' };
      })
    };

    // 注册测试转换器
    registerTransformer(transformer1);
    registerTransformer(transformer2);

    // 执行
    const result = transform(processingResult, { resultMode: 'full' });

    // 断言
    expect(result).toBeDefined();
    expect(result).toHaveProperty('transformers');
    expect(result.transformers).toHaveProperty('transformer1');
    expect(result.transformers).toHaveProperty('transformer2');
    expect(result).toHaveProperty('merged');
    expect(result.merged).toHaveProperty('value1', 'one');
    expect(result.merged).toHaveProperty('value2', 'two');
    expect(result).toHaveProperty('raw');
    expect(result).toHaveProperty('metadata');
  });

  /**
   * ID: IT-TRANSVC-03
   * 描述: transform应支持merged结果模式
   */
  test('transform应支持merged结果模式', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建两个测试转换器
    const transformer1: Transformer<unknown, unknown> = {
      name: 'transformer1',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer1', { value1: 'one' });

        return { value1: 'one' };
      })
    };

    const transformer2: Transformer<unknown, unknown> = {
      name: 'transformer2',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer2', { value2: 'two' });

        return { value2: 'two' };
      })
    };

    // 注册测试转换器
    registerTransformer(transformer1);
    registerTransformer(transformer2);

    // 执行
    const result = transform(processingResult, { resultMode: 'merged' });

    // 断言
    expect(result).toBeDefined();
    expect(result).toHaveProperty('merged');
    expect(result.merged).toHaveProperty('value1', 'one');
    expect(result.merged).toHaveProperty('value2', 'two');
    expect(result).not.toHaveProperty('raw');
    expect(result.transformers).toEqual({});
  });

  /**
   * ID: IT-TRANSVC-04
   * 描述: transform应支持raw结果模式
   */
  test('transform应支持raw结果模式', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建测试转换器
    const transformer: Transformer<unknown, unknown> = {
      name: 'rawTransformer',
      transform: vi.fn().mockReturnValue({ rawValue: 'raw result' })
    };

    // 注册测试转换器
    registerTransformer(transformer);

    // 执行
    const result = transform(processingResult, { resultMode: 'raw' });

    // 断言
    expect(result).toBeDefined();
    expect(result).toHaveProperty('raw');
    expect(result.raw).toEqual({ rawValue: 'raw result' });
    expect(result.transformers).toEqual({});
    expect(result.merged).toEqual({});
  });

  /**
   * ID: IT-TRANSVC-05
   * 描述: transform应支持include过滤
   */
  test('transform应支持include过滤', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建三个测试转换器
    const transformer1: Transformer<unknown, unknown> = {
      name: 'transformer1',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer1', { value1: 'one' });

        return { value1: 'one' };
      })
    };

    const transformer2: Transformer<unknown, unknown> = {
      name: 'transformer2',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer2', { value2: 'two' });

        return { value2: 'two' };
      })
    };

    const transformer3: Transformer<unknown, unknown> = {
      name: 'transformer3',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer3', { value3: 'three' });

        return { value3: 'three' };
      })
    };

    // 注册测试转换器
    registerTransformer(transformer1);
    registerTransformer(transformer2);
    registerTransformer(transformer3);

    // 执行，只包含transformer1和transformer3
    const result = transform(processingResult, {
      include: ['transformer1', 'transformer3'],
      resultMode: 'full'
    });

    // 断言
    expect(transformer1.transform).toHaveBeenCalled();
    expect(transformer3.transform).toHaveBeenCalled();
    expect(transformer2.transform).not.toHaveBeenCalled();

    expect(result.transformers).toHaveProperty('transformer1');
    expect(result.transformers).toHaveProperty('transformer3');
    expect(result.transformers).not.toHaveProperty('transformer2');

    expect(result.merged).toHaveProperty('value1', 'one');
    expect(result.merged).toHaveProperty('value3', 'three');
    expect(result.merged).not.toHaveProperty('value2');
  });

  /**
   * ID: IT-TRANSVC-06
   * 描述: transform应支持exclude过滤
   */
  test('transform应支持exclude过滤', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建三个测试转换器
    const transformer1: Transformer<unknown, unknown> = {
      name: 'transformer1',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer1', { value1: 'one' });

        return { value1: 'one' };
      })
    };

    const transformer2: Transformer<unknown, unknown> = {
      name: 'transformer2',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer2', { value2: 'two' });

        return { value2: 'two' };
      })
    };

    const transformer3: Transformer<unknown, unknown> = {
      name: 'transformer3',
      transform: vi.fn().mockImplementation((input, context) => {
        context.set('transformer3', { value3: 'three' });

        return { value3: 'three' };
      })
    };

    // 注册测试转换器
    registerTransformer(transformer1);
    registerTransformer(transformer2);
    registerTransformer(transformer3);

    // 执行，排除transformer2
    const result = transform(processingResult, {
      exclude: ['transformer2'],
      resultMode: 'full'
    });

    // 断言
    expect(transformer1.transform).toHaveBeenCalled();
    expect(transformer3.transform).toHaveBeenCalled();
    expect(transformer2.transform).not.toHaveBeenCalled();

    expect(result.transformers).toHaveProperty('transformer1');
    expect(result.transformers).toHaveProperty('transformer3');
    expect(result.transformers).not.toHaveProperty('transformer2');

    expect(result.merged).toHaveProperty('value1', 'one');
    expect(result.merged).toHaveProperty('value3', 'three');
    expect(result.merged).not.toHaveProperty('value2');
  });

  /**
   * ID: IT-TRANSVC-07
   * 描述: registerTransformer应注册转换器到注册表
   */
  test('registerTransformer应注册转换器到注册表', () => {
    // 准备
    const processingResult = createProcessingResultFixture();
    const transformer: Transformer<unknown, unknown> = {
      name: 'customTransformer',
      transform: vi.fn().mockReturnValue({ custom: 'result' })
    };

    // 执行
    registerTransformer(transformer);
    const result = transform(processingResult);

    // 断言
    expect(transformer.transform).toHaveBeenCalled();
    expect(result.transformers).toHaveProperty('customTransformer');
    expect(result.merged).toHaveProperty('custom', 'result');
  });

  /**
   * ID: IT-TRANSVC-08
   * 描述: 使用StructuralMapperTransformer进行测试
   */
  test('可以直接创建和注册StructuralMapperTransformer', () => {
    // 准备
    const processingResult = createProcessingResultFixture();
    const mappingRules = createMappingRulesFixture();

    // 创建转换器
    const structuralMapper = createStructuralMapper('structuralMapper', mappingRules);

    // 注册转换器
    registerTransformer(structuralMapper);

    // 执行
    const result = transform(processingResult);

    // 断言
    expect(result.transformers).toHaveProperty('structuralMapper');
    // 断言映射结果，具体值取决于createMappingRulesFixture的实现
    expect(result.merged).toBeDefined();
  });

  /**
   * 额外测试：直接创建和注册聚合转换器
   */
  test('可以直接创建和注册AggregatorTransformer', () => {
    // 准备
    const processingResult = createProcessingResultFixture();
    const config: CollectorConfig = {
      selector: 'prompt'
    };

    // 创建转换器
    const aggregator = createAggregator('aggregator', config);

    // 注册转换器
    registerTransformer(aggregator);

    // 执行
    const result = transform(processingResult);

    // 断言
    expect(result.transformers).toHaveProperty('aggregator');
    expect(result.merged).toBeDefined();
  });

  /**
   * ID: IT-TRANSVC-09
   * 描述: 测试深度合并和数组属性处理
   */
  test('应正确深度合并转换器结果，特别是数组属性', () => {
    // 准备
    const processingResult = createProcessingResultFixture();

    // 创建模拟工作流处理的转换器
    const baseTransformer: Transformer<unknown, unknown> = {
      name: 'baseTransformer',
      transform: vi.fn().mockImplementation((input, context) => {
        const result = {
          name: "测试工作流",
          version: "1.0.0",
          variables: [],
          steps: [],
          transitions: []
        };

        context.set('baseTransformer', result);

        return result;
      })
    };

    const variablesTransformer: Transformer<unknown, unknown> = {
      name: 'variablesTransformer',
      transform: vi.fn().mockImplementation((input, context) => {
        const result = {
          variables: [
            { name: "var1", type: "string", value: "test1" },
            { name: "var2", type: "number", value: "123" }
          ]
        };

        context.set('variablesTransformer', result);

        return result;
      })
    };

    const stepsTransformer: Transformer<unknown, unknown> = {
      name: 'stepsTransformer',
      transform: vi.fn().mockImplementation((input, context) => {
        const result = {
          steps: [
            { id: "step1", type: "start", description: "开始" },
            { id: "step2", type: "process", description: "处理" }
          ]
        };

        context.set('stepsTransformer', result);

        return result;
      })
    };

    const transitionsTransformer: Transformer<unknown, unknown> = {
      name: 'transitionsTransformer',
      transform: vi.fn().mockImplementation((input, context) => {
        const result = {
          transitions: [
            { from: "step1", to: "step2" }
          ]
        };

        context.set('transitionsTransformer', result);

        return result;
      })
    };

    // 注册所有转换器
    registerTransformer(baseTransformer);
    registerTransformer(variablesTransformer);
    registerTransformer(stepsTransformer);
    registerTransformer(transitionsTransformer);

    // 执行转换
    const result = transform(processingResult);

    // 断言 - 类型断言确保类型安全
    const merged = result.merged as Record<string, any>;

    // 验证基本属性
    expect(merged).toHaveProperty('name', '测试工作流');
    expect(merged).toHaveProperty('version', '1.0.0');

    // 验证数组属性被正确合并
    expect(merged).toHaveProperty('variables');
    expect(Array.isArray(merged.variables)).toBe(true);
    expect(merged.variables).toHaveLength(2);
    expect(merged.variables[0]).toHaveProperty('name', 'var1');
    expect(merged.variables[1]).toHaveProperty('name', 'var2');

    expect(merged).toHaveProperty('steps');
    expect(Array.isArray(merged.steps)).toBe(true);
    expect(merged.steps).toHaveLength(2);
    expect(merged.steps[0]).toHaveProperty('id', 'step1');
    expect(merged.steps[1]).toHaveProperty('id', 'step2');

    expect(merged).toHaveProperty('transitions');
    expect(Array.isArray(merged.transitions)).toBe(true);
    expect(merged.transitions).toHaveLength(1);
    expect(merged.transitions[0]).toHaveProperty('from', 'step1');
    expect(merged.transitions[0]).toHaveProperty('to', 'step2');

    // 验证结果中包含所有转换器的结果
    expect(result.transformers).toHaveProperty('baseTransformer');
    expect(result.transformers).toHaveProperty('variablesTransformer');
    expect(result.transformers).toHaveProperty('stepsTransformer');
    expect(result.transformers).toHaveProperty('transitionsTransformer');
  });
});
