import { describe, test, expect, vi } from 'vitest';

import { TransformerRegistry, transformerRegistryFactory } from '../../../core/transformer/TransformerRegistry';
import type { Transformer } from '../../../types/Transformer';

describe('TransformerRegistry', () => {
  // 创建一个基本的Transformer模拟对象
  const createMockTransformer = (name: string): Transformer<unknown, unknown> => {
    return {
      name,
      transform: vi.fn().mockReturnValue({ result: `transformed by ${name}` })
    };
  };

  // UT-REG-01: register应添加转换器到注册表
  test('register应添加转换器到注册表', () => {
    // 准备
    const registry = new TransformerRegistry();
    const transformer = createMockTransformer('transformer1');

    // 执行
    registry.register(transformer);

    // 断言
    const transformers = registry.getTransformers();

    expect(transformers.length).toBe(1);
    expect(transformers[0]).toBe(transformer);
  });

  // UT-REG-02: register应支持多次注册不同转换器
  test('register应支持多次注册不同转换器', () => {
    // 准备
    const registry = new TransformerRegistry();
    const transformer1 = createMockTransformer('transformer1');
    const transformer2 = createMockTransformer('transformer2');
    const transformer3 = createMockTransformer('transformer3');

    // 执行
    registry.register(transformer1);
    registry.register(transformer2);
    registry.register(transformer3);

    // 断言
    const transformers = registry.getTransformers();

    expect(transformers.length).toBe(3);
    expect(transformers[0]).toBe(transformer1);
    expect(transformers[1]).toBe(transformer2);
    expect(transformers[2]).toBe(transformer3);
  });

  // UT-REG-03: getTransformers应返回所有已注册转换器
  test('getTransformers应返回所有已注册转换器', () => {
    // 准备
    const registry = new TransformerRegistry();
    const transformer1 = createMockTransformer('transformer1');
    const transformer2 = createMockTransformer('transformer2');

    // 执行
    registry.register(transformer1);
    registry.register(transformer2);
    const transformers = registry.getTransformers();

    // 断言
    expect(transformers).toEqual([transformer1, transformer2]);
  });

  // UT-REG-NEG-01: getTransformers在无注册转换器时应返回空数组
  test('getTransformers在无注册转换器时应返回空数组', () => {
    // 准备
    const registry = new TransformerRegistry();

    // 执行
    const transformers = registry.getTransformers();

    // 断言
    expect(transformers).toEqual([]);
    expect(transformers.length).toBe(0);
  });

  // 附加测试：getTransformers应返回副本而非原始数组引用
  test('getTransformers应返回副本而非原始数组引用', () => {
    // 准备
    const registry = new TransformerRegistry();
    const transformer = createMockTransformer('transformer');

    registry.register(transformer);

    // 执行
    const transformers1 = registry.getTransformers();
    const transformers2 = registry.getTransformers();

    // 断言
    expect(transformers1).not.toBe(transformers2); // 不应是同一引用
    expect(transformers1).toEqual(transformers2); // 但内容应相同

    // 修改获取的数组不应影响内部状态
    transformers1.push(createMockTransformer('additional'));
    const transformers3 = registry.getTransformers();

    expect(transformers3.length).toBe(1); // 仍然只有一个注册的转换器
  });

  // 测试工厂函数
  test('transformerRegistryFactory应返回单例实例', () => {
    // 执行
    const registry1 = transformerRegistryFactory();
    const registry2 = transformerRegistryFactory();

    // 断言
    expect(registry1).toBe(registry2); // 应是同一个实例

    // 验证单例状态共享
    const transformer = createMockTransformer('singleton-test');

    registry1.register(transformer);

    expect(registry2.getTransformers().length).toBe(1);
    expect(registry2.getTransformers()[0]).toBe(transformer);
  });
});
