/**
 * StructuralMapperTransformer单元测试
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

import { StructuralMapperTransformer } from '../../../../core/transformer/transformers/StructuralMapperTransformer';
import type { TransformContext, MappingRule } from '../../../../types';
import {
  createProcessingResultFixture,
  createMappingRulesFixture
} from '../../../fixtures/transformer/transformerFixtures';

describe('StructuralMapperTransformer', () => {
  let mockContext: TransformContext;
  let mockWarnings: any[];
  let processingResult: any;
  let transformer: StructuralMapperTransformer<any, any>;

  beforeEach(() => {
    mockWarnings = [];
    processingResult = createProcessingResultFixture();

    // 模拟TransformContext
    mockContext = {
      set: vi.fn(),
      get: vi.fn((key) => key === 'warnings' ? mockWarnings : undefined),
      has: vi.fn(),
      getDocument: vi.fn().mockReturnValue(processingResult.document),
      getReferences: vi.fn(),
      isDocumentValid: vi.fn().mockReturnValue(true)
    } as unknown as TransformContext;

    // 创建转换器实例
    transformer = new StructuralMapperTransformer(createMappingRulesFixture());
  });

  // UT-STRUCTMAP-01: transform应基于选择器提取数据
  test('应基于选择器提取数据', () => {
    // 添加直接查询方法到document
    const document = processingResult.document;

    document.querySelector = (selector: string) => {
      // 在测试环境中模拟querySelector行为
      // 简单标签选择器
      if (selector === 'agent') {
        return document.rootNode.children[0];
      }

      // 带属性的选择器
      if (selector.startsWith('agent[')) {
        return document.rootNode.children[0];
      }

      // 带属性值的选择器
      if (selector === 'prompt[type="system"]') {
        return document.rootNode.children[1];
      }

      return undefined;
    };

    // 执行转换
    const result = transformer.transform(processingResult, mockContext);

    // 验证结果
    expect(result).toHaveProperty('parameters');
    expect(result.parameters).toHaveProperty('temperature', 0.7);
    expect(result.parameters).toHaveProperty('maxTokens', 2048);
    expect(result).toHaveProperty('systemPrompt', '你是一个有用的助手');

    // 验证结果被存储到上下文
    expect(mockContext.set).toHaveBeenCalledWith('structuralMapper', result);
  });

  // UT-STRUCTMAP-02: transform应处理嵌套路径映射
  test('应处理嵌套路径映射', () => {
    // 添加直接查询方法到document
    const document = processingResult.document;

    document.querySelector = (selector: string) => {
      if (selector === 'agent[temperature]') {
        return document.rootNode.children[0];
      }

      if (selector === 'agent[max-tokens]') {
        return document.rootNode.children[0];
      }

      return undefined;
    };

    // 创建测试嵌套路径的映射规则
    const nestedRules: Array<MappingRule<unknown, unknown>> = [
      {
        selector: 'agent[temperature]',
        targetPath: 'config.parameters.temperature',
        transform: (value: unknown) => parseFloat(value as string)
      },
      {
        selector: 'agent[max-tokens]',
        targetPath: 'config.parameters.maxTokens',
        transform: (value: unknown) => parseInt(value as string, 10)
      }
    ];

    // 创建转换器
    const nestedTransformer = new StructuralMapperTransformer(nestedRules);

    // 执行转换
    const result = nestedTransformer.transform(processingResult, mockContext);

    // 验证结果
    expect(result).toHaveProperty('config');
    expect(result.config).toHaveProperty('parameters');
    expect((result as any).config.parameters).toHaveProperty('temperature', 0.7);
    expect((result as any).config.parameters).toHaveProperty('maxTokens', 2048);
  });

  // UT-STRUCTMAP-03: transform应应用转换函数
  test('应应用转换函数', () => {
    // 添加直接查询方法到document
    const document = processingResult.document;

    document.querySelector = (selector: string) => {
      if (selector === 'agent[temperature]') {
        return document.rootNode.children[0];
      }

      return undefined;
    };

    // 创建自定义转换函数的映射规则
    const transformRules: Array<MappingRule<unknown, unknown>> = [
      {
        selector: 'agent[temperature]',
        targetPath: 'customTransform',
        transform: (value: unknown) => `转换后: ${value as string}`
      }
    ];

    // 创建转换器
    const customTransformer = new StructuralMapperTransformer(transformRules);

    // 执行转换
    const result = customTransformer.transform(processingResult, mockContext);

    // 验证结果
    expect((result as any)).toHaveProperty('customTransform', '转换后: 0.7');
  });

  // UT-STRUCTMAP-04: transform应将结果存储到上下文
  test('应将结果存储到上下文', () => {
    // 添加直接查询方法到document
    const document = processingResult.document;

    document.querySelector = (selector: string) => {
      if (selector === 'agent') {
        return document.rootNode.children[0];
      }

      return undefined;
    };

    // 创建简单的映射规则
    const simpleRules: Array<MappingRule<unknown, unknown>> = [
      { selector: 'agent', targetPath: 'simple' }
    ];

    // 创建自定义名称的转换器
    const namedTransformer = new StructuralMapperTransformer(simpleRules);

    namedTransformer.name = 'customName';

    // 执行转换
    const result = namedTransformer.transform(processingResult, mockContext);

    // 验证结果被存储到上下文，使用自定义名称
    expect(mockContext.set).toHaveBeenCalledWith('customName', result);
  });

  // UT-STRUCTMAP-NEG-01: transform应处理选择器无匹配的情况
  test('应处理选择器无匹配的情况', () => {
    // 添加直接查询方法到document，总是返回undefined
    const document = processingResult.document;

    document.querySelector = () => undefined;
    document.querySelectorAll = () => []; // 确保 querySelectorAll 也返回空数组

    // 执行转换
    const result = transformer.transform(processingResult, mockContext);

    // 验证结果是空对象
    expect(result).toEqual({});

    // 验证添加了警告
    expect(mockContext.set).toHaveBeenCalledWith('warnings', expect.arrayContaining([
      expect.objectContaining({
        code: 'selector_no_match',
        transformer: 'structuralMapper'
      })
    ]));
  });

  // UT-STRUCTMAP-NEG-02: transform应处理转换函数抛出异常的情况
  test('应处理转换函数抛出异常的情况', () => {
    // 添加直接查询方法到document
    const document = processingResult.document;

    document.querySelector = (selector: string) => {
      if (selector === 'agent[temperature]') {
        return document.rootNode.children[0];
      }

      return undefined;
    };

    // 创建会抛出异常的转换函数的映射规则
    const errorRules: Array<MappingRule<unknown, unknown>> = [
      {
        selector: 'agent[temperature]',
        targetPath: 'error',
        transform: () => { throw new Error('测试异常'); }
      }
    ];

    // 创建转换器
    const errorTransformer = new StructuralMapperTransformer(errorRules);

    // 执行转换
    const result = errorTransformer.transform(processingResult, mockContext);

    // 验证结果不包含错误的映射
    expect(result).not.toHaveProperty('error');

    // 验证添加了警告
    expect(mockContext.set).toHaveBeenCalledWith('warnings', expect.arrayContaining([
      expect.objectContaining({
        code: 'transform_error',
        message: expect.stringContaining('测试异常'),
        transformer: 'structuralMapper'
      })
    ]));
  });

  // 测试文档无效的情况
  test('文档无效时应返回空对象并添加警告', () => {
    // 模拟文档无效
    mockContext.isDocumentValid = vi.fn().mockReturnValue(false);

    // 执行转换
    const result = transformer.transform(processingResult, mockContext);

    // 验证结果是空对象
    expect(result).toEqual({});

    // 验证添加了警告
    expect(mockContext.set).toHaveBeenCalledWith('warnings', expect.arrayContaining([
      expect.objectContaining({
        code: 'invalid_document',
        message: '文档无效，无法执行结构映射',
        transformer: 'structuralMapper'
      })
    ]));
  });
});
