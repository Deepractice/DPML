import { describe, test, expect, vi } from 'vitest';

import { AggregatorTransformer } from '../../../../core/framework/transformer/AggregatorTransformer';
import { RelationProcessorTransformer } from '../../../../core/framework/transformer/RelationProcessorTransformer';
import { ResultCollectorTransformer } from '../../../../core/framework/transformer/ResultCollectorTransformer';
import { SemanticExtractorTransformer } from '../../../../core/framework/transformer/SemanticExtractorTransformer';
import { StructuralMapperTransformer } from '../../../../core/framework/transformer/StructuralMapperTransformer';
import { TemplateTransformer } from '../../../../core/framework/transformer/TemplateTransformer';
import { createStructuralMapper, createAggregator, createTemplateTransformer, createResultCollector, createRelationProcessor, createSemanticExtractor } from '../../../../core/framework/transformer/transformerFactory';

// 模拟转换器实现，这些模拟将返回对象添加了可设置的name属性
vi.mock('../../../../core/framework/transformer/StructuralMapperTransformer', () => {
  return {
    StructuralMapperTransformer: vi.fn().mockImplementation(() => ({
      name: '',
      type: 'mapper'
    }))
  };
});

vi.mock('../../../../core/framework/transformer/AggregatorTransformer', () => {
  return {
    AggregatorTransformer: vi.fn().mockImplementation(() => ({
      name: '',
      type: 'collector'
    }))
  };
});

vi.mock('../../../../core/framework/transformer/TemplateTransformer', () => {
  return {
    TemplateTransformer: vi.fn().mockImplementation(() => ({
      name: '',
      type: 'template'
    }))
  };
});

vi.mock('../../../../core/framework/transformer/ResultCollectorTransformer', () => {
  return {
    ResultCollectorTransformer: vi.fn().mockImplementation(() => ({
      name: '',
      type: 'collector'
    }))
  };
});

vi.mock('../../../../core/framework/transformer/RelationProcessorTransformer', () => {
  return {
    RelationProcessorTransformer: vi.fn().mockImplementation(() => ({
      name: '',
      type: 'processor'
    }))
  };
});

vi.mock('../../../../core/framework/transformer/SemanticExtractorTransformer', () => {
  return {
    SemanticExtractorTransformer: vi.fn().mockImplementation(() => ({
      name: '',
      type: 'extractor'
    }))
  };
});

describe('transformerFactory', () => {
  describe('createStructuralMapper', () => {
    test('应创建结构映射转换器实例', () => {
      // 准备
      const name = 'testMapper';
      const rules = [{ selector: 'test', targetPath: 'target' }];

      // 执行
      const transformer = createStructuralMapper(name, rules);

      // 断言
      expect(StructuralMapperTransformer).toHaveBeenCalledWith(rules);
      expect(transformer.name).toBe(name);
      expect(transformer).toHaveProperty('type', 'mapper');
    });
  });

  describe('createAggregator', () => {
    test('应创建聚合转换器实例', () => {
      // 准备
      const name = 'testAggregator';
      const config = { selector: 'test', groupBy: 'type' };

      // 执行
      const transformer = createAggregator(name, config);

      // 断言
      expect(AggregatorTransformer).toHaveBeenCalledWith(config);
      expect(transformer.name).toBe(name);
      expect(transformer).toHaveProperty('type', 'collector');
    });
  });

  describe('createTemplateTransformer', () => {
    test('应创建模板转换器实例，使用字符串模板', () => {
      // 准备
      const name = 'testTemplate';
      const template = 'Hello, {{name}}!';

      // 执行
      const transformer = createTemplateTransformer(name, template);

      // 断言
      expect(TemplateTransformer).toHaveBeenCalledWith(template, undefined);
      expect(transformer.name).toBe(name);
      expect(transformer).toHaveProperty('type', 'template');
    });

    test('应创建模板转换器实例，使用函数模板和预处理器', () => {
      // 准备
      const name = 'testFunctionTemplate';
      const template = (data: any) => `Hello, ${data.name}!`;
      const preprocessor = (input: any) => ({ name: input.username });

      // 执行
      const transformer = createTemplateTransformer(name, template, preprocessor);

      // 断言
      expect(TemplateTransformer).toHaveBeenCalledWith(template, preprocessor);
      expect(transformer.name).toBe(name);
    });
  });

  describe('createResultCollector', () => {
    test('应创建结果收集转换器实例，无指定转换器名称', () => {
      // 准备
      const name = 'testResultCollector';

      // 执行
      const transformer = createResultCollector(name);

      // 断言
      expect(ResultCollectorTransformer).toHaveBeenCalledWith(undefined);
      expect(transformer.name).toBe(name);
    });

    test('应创建结果收集转换器实例，指定转换器名称', () => {
      // 准备
      const name = 'testNamedResultCollector';
      const transformerNames = ['transformer1', 'transformer2'];

      // 执行
      const transformer = createResultCollector(name, transformerNames);

      // 断言
      expect(ResultCollectorTransformer).toHaveBeenCalledWith(transformerNames);
      expect(transformer.name).toBe(name);
    });
  });

  describe('createRelationProcessor', () => {
    test('应创建关系处理转换器实例', () => {
      // 准备
      const name = 'testRelationProcessor';
      const nodeSelector = 'node';
      const config = { source: 'src', target: 'tgt' };

      // 执行
      const transformer = createRelationProcessor(name, nodeSelector, config);

      // 断言
      expect(RelationProcessorTransformer).toHaveBeenCalledWith(nodeSelector, config);
      expect(transformer.name).toBe(name);
    });
  });

  describe('createSemanticExtractor', () => {
    test('应创建语义提取转换器实例', () => {
      // 准备
      const name = 'testSemanticExtractor';
      const extractors = [{ name: 'ext1', selector: 'sel1', processor: vi.fn() }];

      // 执行
      const transformer = createSemanticExtractor(name, extractors);

      // 断言
      expect(SemanticExtractorTransformer).toHaveBeenCalledWith(extractors);
      expect(transformer.name).toBe(name);
    });
  });
});
