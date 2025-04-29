/**
 * TemplateTransformer单元测试
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { TemplateTransformer } from '../../../../core/framework/transformer/TemplateTransformer';
import type { TransformContext } from '../../../../types';

describe('TemplateTransformer', () => {
  // 测试数据
  const testData = {
    name: 'Test User',
    age: 30,
    info: {
      role: 'Admin',
      level: 5
    }
  };

  // 用于所有测试的模拟上下文
  let mockContext: TransformContext;
  let mockWarnings: any[] = [];

  // 每个测试前的设置
  beforeEach(() => {
    mockWarnings = [];
    mockContext = {
      set: vi.fn(),
      get: vi.fn((key) => key === 'warnings' ? mockWarnings : undefined),
      has: vi.fn(),
      getDocument: vi.fn(),
      getReferences: vi.fn(),
      isDocumentValid: vi.fn().mockReturnValue(true),
      getAllResults: vi.fn()
    } as unknown as TransformContext;
  });

  test('UT-TEMPLATE-01: transform应使用字符串模板渲染数据', () => {
    // 准备
    const template = 'Hello, {{name}}! You are {{age}} years old.';
    const transformer = new TemplateTransformer<typeof testData>(template);

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('Hello, Test User! You are 30 years old.');
  });

  test('UT-TEMPLATE-02: transform应使用函数模板渲染数据', () => {
    // 准备
    const templateFn = (data: unknown) => {
      const typedData = data as typeof testData;

      return `Welcome, ${typedData.name}! Your level is ${typedData.info.level}.`;
    };

    const transformer = new TemplateTransformer<typeof testData>(templateFn);

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('Welcome, Test User! Your level is 5.');
  });

  test('UT-TEMPLATE-03: transform应应用预处理函数', () => {
    // 准备
    const template = 'Processed: {{data}}';
    const preprocessor = (input: typeof testData) => {
      return { data: `${input.name} (${input.info.role})` };
    };

    const transformer = new TemplateTransformer<typeof testData>(template, preprocessor);

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('Processed: Test User (Admin)');
  });

  test('UT-TEMPLATE-04: transform应将结果存储到上下文', () => {
    // 准备
    const template = 'Simple Template';
    const transformer = new TemplateTransformer<typeof testData>(template);

    transformer.name = 'customTemplate';

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('Simple Template');
    expect(mockContext.set).toHaveBeenCalledWith('customTemplate', 'Simple Template');
  });

  test('UT-TEMPLATE-NEG-01: transform应处理模板函数抛出异常的情况', () => {
    // 准备
    const templateFn = () => {
      throw new Error('模板错误');
    };

    const transformer = new TemplateTransformer<typeof testData>(templateFn);

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('');
    expect(mockContext.set).toHaveBeenCalledWith('warnings', expect.arrayContaining([
      expect.objectContaining({
        code: 'template_render_error',
        message: '模板错误',
        transformer: 'templateTransformer',
        severity: 'medium'
      })
    ]));
  });

  test('应处理嵌套属性访问', () => {
    // 准备
    const template = 'Role: {{info.role}}, Level: {{info.level}}';
    const transformer = new TemplateTransformer<typeof testData>(template);

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('Role: Admin, Level: 5');
  });

  test('应优雅处理不存在的属性', () => {
    // 准备
    const template = 'Missing: {{nonexistent.property}}';
    const transformer = new TemplateTransformer<typeof testData>(template);

    // 执行
    const result = transformer.transform(testData, mockContext);

    // 断言
    expect(result).toBe('Missing: ');
  });
});
