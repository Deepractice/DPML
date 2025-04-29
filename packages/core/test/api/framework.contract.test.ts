/**
 * Framework API 契约测试
 * 验证API接口符合预期的输入输出契约
 */

import { createDomainDPML, createTransformerDefiner } from '../../src/api/framework';
import type { DomainConfig, Schema, CollectorConfig, RelationConfig, SemanticExtractor } from '../../src/types';
import { describe, it, expect } from 'vitest';

describe('Framework API 契约测试', () => {
  describe('createDomainDPML()', () => {
    it('CT-API-Framework-01: 应该返回一个包含compile方法的领域编译器', async () => {
      // 准备
      const mockSchema: Schema = {
        element: 'root'
      };
      
      const mockConfig: DomainConfig = {
        schema: mockSchema,
        transformers: []
      };

      // 执行
      const compiler = createDomainDPML<unknown>(mockConfig);

      // 验证
      expect(compiler).toBeDefined();
      expect(typeof compiler.compile).toBe('function');
    });

    it('CT-API-Framework-02: 应该接受泛型参数T并返回类型为DomainCompiler<T>的实例', () => {
      // 准备
      interface TestUser {
        id: string;
        name: string;
      }
      
      const mockSchema: Schema = {
        element: 'user'
      };
      
      const mockConfig: DomainConfig = {
        schema: mockSchema,
        transformers: []
      };

      // 执行
      const compiler = createDomainDPML<TestUser>(mockConfig);

      // 验证 - 类型验证通过编译时检查
      expect(compiler).toBeDefined();
    });
  });

  describe('createTransformerDefiner()', () => {
    it('CT-API-Framework-03: 应该返回一个实现TransformerDefiner接口的实例', () => {
      // 执行
      const definer = createTransformerDefiner();

      // 验证
      expect(definer).toBeDefined();
      expect(typeof definer.defineStructuralMapper).toBe('function');
      expect(typeof definer.defineAggregator).toBe('function');
      expect(typeof definer.defineTemplateTransformer).toBe('function');
      expect(typeof definer.defineRelationProcessor).toBe('function');
      expect(typeof definer.defineSemanticExtractor).toBe('function');
      expect(typeof definer.defineResultCollector).toBe('function');
    });

    it('CT-API-Framework-04: defineStructuralMapper方法应该返回一个Transformer实例', () => {
      // 准备
      const definer = createTransformerDefiner();
      
      // 执行
      const transformer = definer.defineStructuralMapper([
        { selector: 'test', targetPath: 'result' }
      ]);

      // 验证
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });

    it('CT-API-Framework-05: defineTemplateTransformer方法应该返回一个Transformer实例', () => {
      // 准备
      const definer = createTransformerDefiner();
      
      // 执行
      const transformer = definer.defineTemplateTransformer('Hello, {{name}}!');

      // 验证
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });

    it('CT-API-Framework-06: defineAggregator方法应该返回一个Transformer实例', () => {
      // 准备
      const definer = createTransformerDefiner();
      
      // 执行
      const collectorConfig: CollectorConfig = {
        selector: 'items'
      };
      
      const transformer = definer.defineAggregator(collectorConfig);

      // 验证
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });

    it('CT-API-Framework-07: defineRelationProcessor方法应该返回一个Transformer实例', () => {
      // 准备
      const definer = createTransformerDefiner();
      
      // 执行
      const relationConfig: RelationConfig = {
        source: 'parent',
        target: 'child'
      };
      
      const transformer = definer.defineRelationProcessor('node', relationConfig);

      // 验证
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });

    it('CT-API-Framework-08: defineSemanticExtractor方法应该返回一个Transformer实例', () => {
      // 准备
      const definer = createTransformerDefiner();
      
      // 执行
      const extractor: SemanticExtractor<unknown, unknown> = {
        name: 'testExtractor',
        selector: 'element',
        processor: (data) => ({ result: data })
      };
      
      const transformer = definer.defineSemanticExtractor([extractor]);

      // 验证
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });

    it('CT-API-Framework-09: defineResultCollector方法应该返回一个Transformer实例', () => {
      // 准备
      const definer = createTransformerDefiner();
      
      // 执行
      const transformer = definer.defineResultCollector();

      // 验证
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });
  });
}); 