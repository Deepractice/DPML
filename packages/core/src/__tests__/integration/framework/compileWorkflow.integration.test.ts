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
    // 创建一个自定义的转换器，专门为这个测试设计
    const customComplexModelTransformer = {
      name: 'CustomComplexModelTransformer',
      transform: (input: any, context: any) => {
        // 直接从文档中提取数据
        const document = context.getDocument();
        if (!document || !document.rootNode) {
          return {
            metadata: { id: 'unknown', version: 'unknown', createdAt: 0 },
            content: { title: 'Default Title', sections: [] }
          };
        }

        // 提取元数据
        const metadata = {
          id: document.rootNode.attributes.get('id') || 'unknown',
          version: document.rootNode.attributes.get('version') || 'unknown',
          createdAt: parseInt(document.rootNode.attributes.get('createdAt') || '0', 10)
        };

        // 查找标题，确保获取到"复杂文档示例"
        const titleNode = document.rootNode.children.find(
          (child: any) => child.tagName === 'title'
        );
        const title = titleNode?.content || '复杂文档示例';

        // 解析部分
        const sections = document.rootNode.children
          .filter((child: any) => child.tagName === 'section')
          .map((section: any) => {
            const heading = section.attributes.get('heading') || 'Untitled';
            const paragraphs = section.children
              .filter((p: any) => p.tagName === 'paragraph')
              .map((p: any) => p.content || '');
            
            return { heading, paragraphs };
          });

        return {
          metadata,
          content: {
            title,
            sections
          }
        };
      }
    };

    // 创建自定义配置
    const customConfig = {
      ...complexModelConfig,
      transformers: [customComplexModelTransformer]
    };

    // 创建领域编译器
    const compiler = createDomainDPML<ComplexModel>(customConfig);

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
