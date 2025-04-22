import { describe, test, expect, vi, beforeEach } from 'vitest';

import { Pipeline } from '../../../core/transformer/Pipeline';
import { createStructuralMapper, createAggregator, createTemplateTransformer } from '../../../core/transformer/transformerFactory';
import { transformerRegistryFactory } from '../../../core/transformer/TransformerRegistry';
import { transform, registerTransformer, registerStructuralMapper, registerAggregator, registerTemplateTransformer } from '../../../core/transformer/transformerService';
import type { Transformer } from '../../../types';
import { createProcessingResultFixture } from '../../fixtures/transformer/transformerFixtures';

// 模拟依赖
vi.mock('../../../core/transformer/Pipeline', () => {
  return {
    Pipeline: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      execute: vi.fn().mockReturnValue({ testResult: 'raw result' })
    }))
  };
});

vi.mock('../../../core/transformer/TransformerRegistry', () => {
  return {
    transformerRegistryFactory: vi.fn().mockReturnValue({
      register: vi.fn(),
      getTransformers: vi.fn().mockReturnValue([
        { name: 'transformer1', transform: vi.fn() },
        { name: 'transformer2', transform: vi.fn() }
      ])
    })
  };
});

// 模拟transformerFactory
vi.mock('../../../core/transformer/transformerFactory', () => {
  return {
    createStructuralMapper: vi.fn().mockReturnValue({ name: 'structuralMapper' }),
    createAggregator: vi.fn().mockReturnValue({ name: 'aggregator' }),
    createTemplateTransformer: vi.fn().mockReturnValue({ name: 'templateTransformer' }),
    createRelationProcessor: vi.fn().mockReturnValue({ name: 'relationProcessor' }),
    createSemanticExtractor: vi.fn().mockReturnValue({ name: 'semanticExtractor' }),
    createResultCollector: vi.fn().mockReturnValue({ name: 'resultCollector' })
  };
});

// 模拟上下文
const mockContext = {
  set: vi.fn(),
  get: vi.fn(),
  has: vi.fn(),
  getAllResults: vi.fn().mockReturnValue({
    transformer1: { value1: 'test1' },
    transformer2: { value2: 'test2' }
  })
};

// 模拟TransformContext
vi.mock('../../../types', async () => {
  const actual = await vi.importActual('../../../types');

  return {
    ...actual as object,
    TransformContext: vi.fn().mockImplementation(() => mockContext)
  };
});

// 在每个测试前重置模拟
beforeEach(() => {
  vi.clearAllMocks();
});

describe('transformerService', () => {
  describe('transform', () => {
    test('应使用默认选项创建上下文', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      // 执行
      transform(processingResult);

      // 断言
      expect(Pipeline).toHaveBeenCalled();
      expect(transformerRegistryFactory().getTransformers).toHaveBeenCalled();
    });

    test('应支持full结果模式', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      // 执行
      const result = transform(processingResult, { resultMode: 'full' });

      // 断言
      expect(result).toHaveProperty('transformers');
      expect(result).toHaveProperty('merged');
      expect(result).toHaveProperty('raw');
      expect(result).toHaveProperty('metadata');
    });

    test('应支持merged结果模式', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      // 执行
      const result = transform(processingResult, { resultMode: 'merged' });

      // 断言
      expect(result).toHaveProperty('merged');
      expect(result).not.toHaveProperty('raw');
      expect(result.transformers).toEqual({});
    });

    test('应支持raw结果模式', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      // 执行
      const result = transform(processingResult, { resultMode: 'raw' });

      // 断言
      expect(result).toHaveProperty('raw');
      expect(result.transformers).toEqual({});
      expect(result.merged).toEqual({});
    });

    test('应支持include过滤', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      // 执行
      transform(processingResult, { include: ['transformer1'] });

      // 我们不能直接测试内部函数，但可以通过Pipeline.add被调用的次数来验证过滤效果
      const piplineInstance = (Pipeline as any).mock.results[0].value;

      // 断言
      expect(piplineInstance.add).toHaveBeenCalled();
      // 加上ResultCollector，应该总共有2个调用
      expect(piplineInstance.add).toHaveBeenCalledTimes(2);
    });

    test('应支持exclude过滤', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      // 执行
      transform(processingResult, { exclude: ['transformer2'] });

      // 我们不能直接测试内部函数，但可以通过Pipeline.add被调用的次数来验证过滤效果
      const piplineInstance = (Pipeline as any).mock.results[0].value;

      // 断言
      expect(piplineInstance.add).toHaveBeenCalled();
      // 加上ResultCollector，应该总共有2个调用
      expect(piplineInstance.add).toHaveBeenCalledTimes(2);
    });

    test('应收集和合并转换器结果', () => {
      // 准备
      const processingResult = createProcessingResultFixture();

      mockContext.getAllResults.mockReturnValue({
        transformer1: { prop1: 'value1' },
        transformer2: { prop2: 'value2' }
      });

      // 执行
      const result = transform(processingResult);

      // 断言 - 由于我们模拟了Pipeline执行，这里我们只能验证transformers字段包含了getAllResults的返回值
      expect(result.transformers).toEqual({
        transformer1: { prop1: 'value1' },
        transformer2: { prop2: 'value2' }
      });
    });
  });

  describe('registerTransformer', () => {
    test('应将转换器注册到注册表', () => {
      // 准备
      const mockTransformer: Transformer<unknown, unknown> = {
        name: 'testTransformer',
        transform: vi.fn()
      };

      // 执行
      registerTransformer(mockTransformer);

      // 断言
      expect(transformerRegistryFactory().register).toHaveBeenCalledWith(mockTransformer);
    });
  });

  describe('便捷注册方法', () => {
    test('registerStructuralMapper应创建并注册结构映射转换器', () => {
      // 准备
      const rules = [{ selector: 'test', targetPath: 'target' }];

      // 执行
      registerStructuralMapper(rules);

      // 断言
      expect(createStructuralMapper).toHaveBeenCalledWith(rules);
      expect(transformerRegistryFactory().register).toHaveBeenCalled();
    });

    test('registerAggregator应创建并注册聚合转换器', () => {
      // 准备
      const config = { selector: 'test' };

      // 执行
      registerAggregator(config);

      // 断言
      expect(createAggregator).toHaveBeenCalledWith(config);
      expect(transformerRegistryFactory().register).toHaveBeenCalled();
    });

    test('registerTemplateTransformer应创建并注册模板转换器', () => {
      // 准备
      const template = 'template';
      const preprocessor = vi.fn();

      // 执行
      registerTemplateTransformer(template, preprocessor);

      // 断言
      expect(createTemplateTransformer).toHaveBeenCalledWith(template, preprocessor);
      expect(transformerRegistryFactory().register).toHaveBeenCalled();
    });
  });
});
