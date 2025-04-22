import { describe, test, expect, vi } from 'vitest';

import { createStructuralMapper, createAggregator, createTemplateTransformer, createResultCollector, createRelationProcessor, createSemanticExtractor } from '../../../core/transformer/transformerFactory';
import { AggregatorTransformer } from '../../../core/transformer/transformers/AggregatorTransformer';
import { RelationProcessorTransformer } from '../../../core/transformer/transformers/RelationProcessorTransformer';
import { ResultCollectorTransformer } from '../../../core/transformer/transformers/ResultCollectorTransformer';
import { SemanticExtractorTransformer } from '../../../core/transformer/transformers/SemanticExtractorTransformer';
import { StructuralMapperTransformer } from '../../../core/transformer/transformers/StructuralMapperTransformer';
import { TemplateTransformer } from '../../../core/transformer/transformers/TemplateTransformer';

// 模拟转换器构造函数
vi.mock('../../../core/transformer/transformers/StructuralMapperTransformer', () => {
  return {
    StructuralMapperTransformer: vi.fn().mockImplementation(() => ({
      name: 'structuralMapper',
      type: 'mapper'
    }))
  };
});

vi.mock('../../../core/transformer/transformers/AggregatorTransformer', () => {
  return {
    AggregatorTransformer: vi.fn().mockImplementation(() => ({
      name: 'aggregator',
      type: 'collector'
    }))
  };
});

vi.mock('../../../core/transformer/transformers/TemplateTransformer', () => {
  return {
    TemplateTransformer: vi.fn().mockImplementation(() => ({
      name: 'templateTransformer',
      type: 'template'
    }))
  };
});

vi.mock('../../../core/transformer/transformers/ResultCollectorTransformer', () => {
  return {
    ResultCollectorTransformer: vi.fn().mockImplementation(() => ({
      name: 'resultCollector',
      type: 'collector'
    }))
  };
});

vi.mock('../../../core/transformer/transformers/RelationProcessorTransformer', () => {
  return {
    RelationProcessorTransformer: vi.fn().mockImplementation(() => ({
      name: 'relationProcessor',
      type: 'processor'
    }))
  };
});

vi.mock('../../../core/transformer/transformers/SemanticExtractorTransformer', () => {
  return {
    SemanticExtractorTransformer: vi.fn().mockImplementation(() => ({
      name: 'semanticExtractor',
      type: 'extractor'
    }))
  };
});

describe('transformerFactory', () => {
  describe('createStructuralMapper', () => {
    test('应创建结构映射转换器实例', () => {
      // 准备
      const rules = [{ selector: 'test', targetPath: 'target' }];

      // 执行
      const transformer = createStructuralMapper(rules);

      // 断言
      expect(StructuralMapperTransformer).toHaveBeenCalledWith(rules);
      expect(transformer).toHaveProperty('name', 'structuralMapper');
      expect(transformer).toHaveProperty('type', 'mapper');
    });
  });

  describe('createAggregator', () => {
    test('应创建聚合转换器实例', () => {
      // 准备
      const config = { selector: 'test', groupBy: 'type' };

      // 执行
      const transformer = createAggregator(config);

      // 断言
      expect(AggregatorTransformer).toHaveBeenCalledWith(config);
      expect(transformer).toHaveProperty('name', 'aggregator');
      expect(transformer).toHaveProperty('type', 'collector');
    });
  });

  describe('createTemplateTransformer', () => {
    test('应创建模板转换器实例，使用字符串模板', () => {
      // 准备
      const template = 'Hello, {{name}}!';

      // 执行
      const transformer = createTemplateTransformer(template);

      // 断言
      expect(TemplateTransformer).toHaveBeenCalledWith(template, undefined);
      expect(transformer).toHaveProperty('name', 'templateTransformer');
      expect(transformer).toHaveProperty('type', 'template');
    });

    test('应创建模板转换器实例，使用函数模板和预处理器', () => {
      // 准备
      const template = (data: any) => `Hello, ${data.name}!`;
      const preprocessor = (input: any) => ({ name: input.username });

      // 执行
      const transformer = createTemplateTransformer(template, preprocessor);

      // 断言
      expect(TemplateTransformer).toHaveBeenCalledWith(template, preprocessor);
      expect(transformer).toHaveProperty('name', 'templateTransformer');
    });
  });

  describe('createResultCollector', () => {
    test('应创建结果收集转换器实例，无指定转换器名称', () => {
      // 执行
      const transformer = createResultCollector();

      // 断言
      expect(ResultCollectorTransformer).toHaveBeenCalledWith(undefined);
      expect(transformer).toHaveProperty('name', 'resultCollector');
    });

    test('应创建结果收集转换器实例，指定转换器名称', () => {
      // 准备
      const transformerNames = ['transformer1', 'transformer2'];

      // 执行
      const transformer = createResultCollector(transformerNames);

      // 断言
      expect(ResultCollectorTransformer).toHaveBeenCalledWith(transformerNames);
    });
  });

  describe('createRelationProcessor', () => {
    test('应创建关系处理转换器实例', () => {
      // 准备
      const nodeSelector = 'node';
      const config = { source: 'src', target: 'tgt' };

      // 执行
      const transformer = createRelationProcessor(nodeSelector, config);

      // 断言
      expect(RelationProcessorTransformer).toHaveBeenCalledWith(nodeSelector, config);
      expect(transformer).toHaveProperty('name', 'relationProcessor');
    });
  });

  describe('createSemanticExtractor', () => {
    test('应创建语义提取转换器实例', () => {
      // 准备
      const extractors = [{ name: 'ext1', selector: 'sel1', processor: vi.fn() }];

      // 执行
      const transformer = createSemanticExtractor(extractors);

      // 断言
      expect(SemanticExtractorTransformer).toHaveBeenCalledWith(extractors);
      expect(transformer).toHaveProperty('name', 'semanticExtractor');
    });
  });
});
