import type { DocumentSchema } from '@dpml/core';
import { describe, test, expect } from 'vitest';

// 待测试的模块将在未来实现
// schema会在 /packages/agent/src/config/schema.ts 实现
// 但为了TDD先编写测试

describe('CT-Schema', () => {
  test('CT-Schema-01: Schema应符合DocumentSchema接口', async () => {
    // 动态导入待测试的模块
    const { schema } = await import('../../../config/schema');

    // 验证schema符合DocumentSchema接口的基本结构
    expect(schema).toHaveProperty('root');
    expect(schema).toHaveProperty('types');

    // 验证具体属性
    const schemaTyped = schema as DocumentSchema;

    expect(typeof schemaTyped.root).toBe('object');
    expect(Array.isArray(schemaTyped.types)).toBe(true);
  });

  test('CT-Schema-02: Schema应定义agent作为根元素', async () => {
    // 动态导入待测试的模块
    const { schema } = await import('../../../config/schema');

    // 验证根元素为agent
    expect(schema.root.element).toBe('agent');

    // 验证根元素有children定义
    expect(schema.root).toHaveProperty('children');
    expect(schema.root.children).toHaveProperty('elements');
  });

  test('CT-Schema-03: Schema应支持llm子元素', async () => {
    // 动态导入待测试的模块
    const { schema } = await import('../../../config/schema');

    // 验证types中包含llm元素定义
    const llmType = schema.types?.find(type => type.element === 'llm');

    expect(llmType).toBeDefined();

    // 验证llm元素有必要的属性定义
    expect(llmType).toHaveProperty('attributes');
    expect(Array.isArray(llmType?.attributes)).toBe(true);

    // 验证必要的属性
    const attributes = llmType?.attributes || [];

    expect(attributes.some(attr => attr.name === 'api-type' && attr.required === true)).toBe(true);
    expect(attributes.some(attr => attr.name === 'model' && attr.required === true)).toBe(true);
  });

  test('CT-Schema-04: Schema应支持prompt子元素', async () => {
    // 动态导入待测试的模块
    const { schema } = await import('../../../config/schema');

    // 验证types中包含prompt元素定义
    const promptType = schema.types?.find(type => type.element === 'prompt');

    expect(promptType).toBeDefined();

    // 验证prompt元素有内容定义
    expect(promptType).toHaveProperty('content');
    expect(promptType?.content?.type).toBe('text');
    expect(promptType?.content?.required).toBe(true);
  });

  test('CT-Schema-05: Schema应支持experimental子元素', async () => {
    // 动态导入待测试的模块
    const { schema } = await import('../../../config/schema');

    // 验证types中包含experimental元素定义
    const experimentalType = schema.types?.find(type => type.element === 'experimental');

    expect(experimentalType).toBeDefined();

    // 验证experimental元素有children定义
    expect(experimentalType).toHaveProperty('children');
    expect(experimentalType?.children).toHaveProperty('elements');
  });
});
