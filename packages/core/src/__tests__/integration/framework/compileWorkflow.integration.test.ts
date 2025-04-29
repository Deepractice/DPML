/**
 * Framework编译工作流集成测试
 * 验证Framework模块的完整编译流程
 */

import { describe, test, expect, vi } from 'vitest';

import { createDomainDPML } from '../../../api/framework';
import type {
  SimpleModel,
  ComplexModel } from '../../fixtures/framework/frameworkFixtures';
import {
  simpleModelConfig,
  simpleModelDPML,
  complexModelConfig,
  complexModelDPML,
  invalidDPMLContent,
  createInvalidConfig,
  createInvalidTransformerConfig
} from '../../fixtures/framework/frameworkFixtures';

describe('Framework编译工作流集成测试', () => {
  // IT-FRMW-01: 应成功编译简单DPML内容
  test('IT-FRMW-01: 应成功编译简单DPML内容', async () => {
    // 创建领域编译器
    const compiler = createDomainDPML<SimpleModel>(simpleModelConfig);

    // 编译DPML内容
    const result = await compiler.compile(simpleModelDPML);

    // 验证编译结果
    expect(result).toBeDefined();
    expect(result.id).toBe('test-123');
    expect(result.name).toBe('测试模型');
    expect(result.description).toBe('这是一个测试模型');
    expect(Array.isArray(result.tags)).toBe(true);
  });

  // IT-FRMW-02: 应成功编译复杂DPML内容
  test('IT-FRMW-02: 应成功编译复杂DPML内容', async () => {
    // 创建领域编译器
    const compiler = createDomainDPML<ComplexModel>(complexModelConfig);

    // 编译DPML内容
    const result = await compiler.compile(complexModelDPML);

    // 验证编译结果
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata.id).toBe('doc-456');
    expect(result.metadata.version).toBe('2.1');
    expect(result.content).toBeDefined();
    expect(result.content.title).toBe('复杂文档示例');
    expect(Array.isArray(result.content.sections)).toBe(true);
    expect(result.content.sections.length).toBeGreaterThan(0);
  });

  // IT-FRMW-03: 应正确处理无效DPML内容
  test('IT-FRMW-03: 应正确处理无效DPML内容', async () => {
    // 创建领域编译器
    const compiler = createDomainDPML<SimpleModel>(simpleModelConfig);

    // 尝试编译无效DPML内容
    await expect(compiler.compile(invalidDPMLContent)).rejects.toThrow();
  });

  // IT-FRMW-04: 应拒绝无效配置
  test('IT-FRMW-04: 应拒绝无效配置', () => {
    // 尝试使用无效配置创建编译器
    expect(() => createDomainDPML(createInvalidConfig())).toThrow();
    expect(() => createDomainDPML(createInvalidTransformerConfig())).toThrow();
  });

  // IT-FRMW-05: 应正确处理转换过程中的错误
  test('IT-FRMW-05: 应正确处理转换过程中的错误', async () => {
    // 创建带有故意失败的转换器的编译器
    const config = {
      ...simpleModelConfig,
      transformers: [
        {
          name: 'FailingTransformer',
          transform: () => {
            throw new Error('转换器故意失败');
          }
        }
      ]
    };

    const compiler = createDomainDPML(config);

    // 尝试编译，应该在转换过程中失败
    await expect(compiler.compile(simpleModelDPML)).rejects.toThrow('转换器故意失败');
  });
});
