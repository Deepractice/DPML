/**
 * LLMTagProcessor 测试
 *
 * 测试ID:
 * - UT-LP-001: 基本LLM配置处理
 * - UT-LP-002: api-type检验
 * - UT-LP-003: api-url验证
 * - UT-LP-004: key-env安全处理
 * - UT-LP-005: 模型验证
 * - UT-LP-006: extends属性处理
 */

import { NodeType } from '@dpml/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { Element, Content } from '@dpml/core';

import { LLMTagProcessor } from '../../../tags/processors/LLMTagProcessor';

// 禁用整个文件的类型检查
// @ts-nocheck

describe('LLMTagProcessor', () => {
  // 备份原始环境变量
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // 设置测试环境变量
    process.env.TEST_API_KEY = 'sk-test-key-12345';
  });

  afterEach(() => {
    // 恢复原始环境变量
    process.env = { ...originalEnv };
  });

  // 创建处理上下文的简化版本，仅用于测试
  function createContext() {
    // @ts-ignore - 简化测试上下文，忽略类型检查错误
    return {
      variables: {},
      ids: new Map(),
      validationErrors: [],
      warnings: [],
      getVariable: (name: string) => null,
      setVariable: (name: string, value: any) => {},
      addError: (error: any) => {},
      addWarning: (warning: any) => {},
    };
  }

  // 创建内容节点辅助函数
  function createContentNode(text: string): Content {
    return {
      type: NodeType.CONTENT,
      value: text,
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
    };
  }

  // 创建LLM元素辅助函数
  function createLLMElement(
    attributes: Record<string, any> = {},
    children: any[] = []
  ): Element {
    // 确保元素至少有model属性和api-url属性
    if (!attributes.model && !attributes['model']) {
      attributes.model = 'gpt-4-turbo';
    }

    if (!attributes['api-url'] && !attributes.apiUrl) {
      attributes['api-url'] = 'https://api.openai.com/v1';
    }

    // 设置默认的key-env属性，除非明确指定为不同的值或null
    if (
      attributes['key-env'] === undefined &&
      attributes.keyEnv === undefined
    ) {
      attributes['key-env'] = 'TEST_API_KEY';
    }

    return {
      type: NodeType.ELEMENT,
      tagName: 'llm',
      attributes,
      children,
      position: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      },
      metadata: {},
    };
  }

  it('UT-LP-001: 应正确处理基本LLM配置', async () => {
    // 创建处理器
    const processor = new LLMTagProcessor();

    // 创建LLM元素
    const element = createLLMElement({
      'api-type': 'openai',
      'api-url': 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
    });

    // 创建处理上下文
    const context = createContext();

    // 处理元素
    const result = await processor.process(element, context);

    // 验证元数据
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.llm).toBeDefined();
    expect(result.metadata?.llm.apiType).toBe('openai');
    expect(result.metadata?.llm.apiUrl).toBe('https://api.openai.com/v1');
    expect(result.metadata?.llm.model).toBe('gpt-4-turbo');
    expect(result.metadata?.llm.keyEnv).toBe('TEST_API_KEY');

    // 验证处理标记
    expect(result.metadata?.processed).toBe(true);
    expect(result.metadata?.processorName).toBe('LLMTagProcessor');
  });

  it('UT-LP-002: 应正确验证api-type属性', async () => {
    // 创建处理器
    const processor = new LLMTagProcessor();

    // 创建有效api-type的元素
    const validElement = createLLMElement({
      'api-type': 'openai',
      'api-url': 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
    });

    // 创建无效api-type的元素
    const invalidElement = createLLMElement({
      'api-type': 'unsupported-api',
      'api-url': 'https://api.example.com',
      model: 'some-model',
    });

    // 创建处理上下文
    const context = createContext();

    // 处理有效元素
    const validResult = await processor.process(validElement, context);

    // 验证有效元素处理结果
    expect(validResult.metadata?.llm.apiType).toBe('openai');
    expect(validResult.metadata?.validationWarnings).toBeUndefined();

    // 处理无效元素
    const invalidResult = await processor.process(invalidElement, context);

    // 验证无效元素处理结果，应该有警告但不报错
    expect(invalidResult.metadata?.llm.apiType).toBe('unsupported-api');
    expect(invalidResult.metadata?.validationWarnings).toBeDefined();
    expect(invalidResult.metadata?.validationWarnings?.length).toBeGreaterThan(
      0
    );
    expect(invalidResult.metadata?.validationWarnings?.[0].code).toBe(
      'UNSUPPORTED_API_TYPE'
    );
  });

  it('UT-LP-003: 应正确验证api-url属性', async () => {
    // 创建处理器
    const processor = new LLMTagProcessor();

    // 创建有效URL的元素
    const validElement = createLLMElement({
      'api-type': 'openai',
      'api-url': 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
    });

    // 创建无效URL的元素
    const invalidElement = createLLMElement({
      'api-type': 'openai',
      'api-url': 'invalid-url',
      model: 'gpt-4-turbo',
    });

    // 创建缺少URL的元素
    const missingUrlElement = createLLMElement({
      'api-type': 'openai',
      model: 'gpt-4-turbo',
    });

    delete missingUrlElement.attributes['api-url'];

    // 创建处理上下文
    const context = createContext();

    // 处理有效元素
    const validResult = await processor.process(validElement, context);

    // 验证有效元素处理结果
    expect(validResult.metadata?.llm.apiUrl).toBe('https://api.openai.com/v1');
    expect(validResult.metadata?.validationErrors).toBeUndefined();

    // 处理无效元素
    const invalidResult = await processor.process(invalidElement, context);

    // 验证无效元素处理结果，应该有错误
    expect(invalidResult.metadata?.llm.apiUrl).toBe('invalid-url');
    expect(invalidResult.metadata?.validationErrors).toBeDefined();
    expect(invalidResult.metadata?.validationErrors?.length).toBeGreaterThan(0);
    expect(invalidResult.metadata?.validationErrors?.[0].code).toBe(
      'INVALID_API_URL'
    );

    // 处理缺少URL的元素
    const missingUrlResult = await processor.process(
      missingUrlElement,
      context
    );

    // 验证缺少URL的处理结果，应该有错误
    expect(missingUrlResult.metadata?.validationErrors).toBeDefined();
    expect(missingUrlResult.metadata?.validationErrors?.length).toBeGreaterThan(
      0
    );
    expect(missingUrlResult.metadata?.validationErrors?.[0].code).toBe(
      'MISSING_REQUIRED_ATTRIBUTE'
    );
  });

  it('UT-LP-004: 应安全处理key-env属性', async () => {
    // 创建处理器
    const processor = new LLMTagProcessor();

    // 创建带有key-env的元素
    const element = createLLMElement({
      'api-type': 'openai',
      'api-url': 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
      'key-env': 'TEST_API_KEY',
    });

    // 创建处理上下文
    const context = createContext();

    // 处理元素
    const result = await processor.process(element, context);

    // 验证元数据中只存储了环境变量名，而不是实际的密钥值
    expect(result.metadata?.llm.keyEnv).toBe('TEST_API_KEY');
    expect(result.metadata?.llm.apiKey).toBeUndefined();

    // 验证环境变量存在性检查
    // 创建带有不存在环境变量的元素
    const missingEnvElement = createLLMElement({
      'api-type': 'openai',
      'api-url': 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
      'key-env': 'NON_EXISTENT_KEY',
    });

    // 处理元素
    const missingEnvResult = await processor.process(
      missingEnvElement,
      context
    );

    // 应该有警告但不报错
    expect(missingEnvResult.metadata?.llm.keyEnv).toBe('NON_EXISTENT_KEY');
    expect(missingEnvResult.metadata?.validationWarnings).toBeDefined();
    expect(
      missingEnvResult.metadata?.validationWarnings?.length
    ).toBeGreaterThan(0);
    expect(missingEnvResult.metadata?.validationWarnings?.[0].code).toBe(
      'MISSING_ENV_VARIABLE'
    );
  });

  it('UT-LP-005: 应正确验证model属性', async () => {
    // 创建处理器
    const processor = new LLMTagProcessor();

    // 创建带有model的元素
    const element = createLLMElement({
      'api-type': 'openai',
      'api-url': 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
    });

    // 创建处理上下文
    const context = createContext();

    // 处理元素
    const result = await processor.process(element, context);

    // 验证模型属性
    expect(result.metadata?.llm.model).toBe('gpt-4-turbo');

    // 创建缺少model的元素 - 通过显式设置为null/undefined来覆盖默认值
    const missingModelElement = createLLMElement(
      {
        'api-type': 'openai',
        'api-url': 'https://api.openai.com/v1',
        model: null,
      },
      []
    );

    // 处理缺少model的元素前，删除model属性确保它真的不存在
    delete missingModelElement.attributes.model;

    // 处理缺少model的元素
    const missingModelResult = await processor.process(
      missingModelElement,
      context
    );

    // 验证错误
    expect(missingModelResult.metadata?.validationErrors).toBeDefined();
    expect(
      missingModelResult.metadata?.validationErrors?.length
    ).toBeGreaterThan(0);

    // 验证包含MISSING_REQUIRED_ATTRIBUTE错误
    const hasMissingModelError =
      missingModelResult.metadata?.validationErrors?.some(
        (error: any) => error.code === 'MISSING_REQUIRED_ATTRIBUTE'
      );

    expect(hasMissingModelError).toBe(true);
  });

  it('UT-LP-006: 应正确处理extends属性', async () => {
    // 创建处理器
    const processor = new LLMTagProcessor();

    // 创建带有extends属性的元素
    const element = createLLMElement({
      extends: 'base-llm',
      model: 'gpt-4-turbo',
    });

    // 创建处理上下文
    const context = createContext();

    // 处理元素
    const result = await processor.process(element, context);

    // 验证extends属性已被AbstractTagProcessor处理
    expect(result.metadata?.llm.extends).toBe('base-llm');
  });
});
