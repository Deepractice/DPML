/**
 * Framework闭包状态管理集成测试
 * 验证Framework模块的闭包状态管理特性
 */

import { describe, test, expect } from 'vitest';

import { createDomainDPML } from '../../../api/framework';
import type {
  SimpleModel } from '../../fixtures/framework/frameworkFixtures';
import {
  simpleModelConfig,
  simpleModelSchema
} from '../../fixtures/framework/frameworkFixtures';

describe('Framework闭包状态管理集成测试', () => {
  // IT-CLSR-01: 不同编译器实例应维护独立状态
  test('IT-CLSR-01: 不同编译器实例应维护独立状态', () => {
    // 创建两个独立的编译器实例
    const dpml1 = createDomainDPML<SimpleModel>(simpleModelConfig);
    const dpml2 = createDomainDPML<SimpleModel>({
      ...simpleModelConfig,
      options: {
        strictMode: false
      }
    });

    // 扩展第一个实例的配置
    dpml1.compiler.extend({
      options: {
        errorHandling: 'warn'
      }
    });

    // 获取两个实例的schema和transformers
    const schema1 = dpml1.compiler.getSchema();
    const schema2 = dpml2.compiler.getSchema();
    const transformers1 = dpml1.compiler.getTransformers();
    const transformers2 = dpml2.compiler.getTransformers();

    // 验证两个实例是相同的schema（引用相等）
    expect(schema1).toEqual(schema2);

    // 验证transformers是相互独立的数组（不是引用相等）
    expect(transformers1).not.toBe(transformers2);
    // 但内容应该相同
    expect(transformers1).toEqual(transformers2);

    // 修改第一个实例的transformers数组
    const originalLength = transformers1.length;

    transformers1.push({
      name: 'TestTransformer',
      transform: (data) => data
    });

    // 验证第一个实例中的transformers已被修改
    expect(transformers1.length).toBe(originalLength + 1);
    // 但第二个实例的transformers应保持不变
    expect(transformers2.length).toBe(originalLength);
  });

  // IT-CLSR-02: 扩展操作应正确更新实例状态
  test('IT-CLSR-02: 扩展操作应正确更新实例状态', () => {
    // 创建一个编译器实例
    const dpml = createDomainDPML<SimpleModel>(simpleModelConfig);

    // 记录初始状态
    const initialTransformers = dpml.compiler.getTransformers();
    const initialTransformersCount = initialTransformers.length;

    // 执行扩展操作
    dpml.compiler.extend({
      transformers: [
        {
          name: 'AdditionalTransformer',
          transform: (data) => data
        }
      ]
    });

    // 验证状态已更新
    const updatedTransformers = dpml.compiler.getTransformers();

    // 验证transformers数量已增加
    expect(updatedTransformers.length).toBe(initialTransformersCount + 1);
    // 验证新transformer已添加
    expect(updatedTransformers.some(t => t.name === 'AdditionalTransformer')).toBe(true);
  });

  // IT-CLSR-03: 扩展操作应保持原有transformers
  test('IT-CLSR-03: 扩展操作应保持原有transformers', () => {
    // 创建一个编译器实例
    const dpml = createDomainDPML<SimpleModel>({
      domain: 'test-domain',
      schema: simpleModelSchema,
      transformers: [
        {
          name: 'FirstTransformer',
          transform: (data) => data
        }
      ]
    });

    // 执行扩展操作
    dpml.compiler.extend({
      transformers: [
        {
          name: 'SecondTransformer',
          transform: (data) => data
        }
      ]
    });

    // 获取更新后的转换器列表
    const transformers = dpml.compiler.getTransformers();

    // 验证两个转换器都存在
    expect(transformers.some(t => t.name === 'FirstTransformer')).toBe(true);
    expect(transformers.some(t => t.name === 'SecondTransformer')).toBe(true);
    expect(transformers.length).toBe(2);
  });

  // IT-CLSR-04: getTransformers应返回转换器副本
  test('IT-CLSR-04: getTransformers应返回转换器副本', () => {
    // 创建一个编译器实例
    const dpml = createDomainDPML<SimpleModel>(simpleModelConfig);

    // 获取转换器列表
    const transformers1 = dpml.compiler.getTransformers();
    const transformers2 = dpml.compiler.getTransformers();

    // 验证每次调用返回的是不同的数组实例（副本）
    expect(transformers1).not.toBe(transformers2);
    // 但内容应该相同
    expect(transformers1).toEqual(transformers2);

    // 修改第一个数组不应影响第二个数组
    transformers1.push({
      name: 'TestTransformer',
      transform: (data) => data
    });

    expect(transformers1.length).not.toBe(transformers2.length);

    // 修改返回的数组不应影响内部状态
    const transformers3 = dpml.compiler.getTransformers();

    expect(transformers3.length).toBe(transformers2.length);
    expect(transformers3.length).not.toBe(transformers1.length);
  });
});
