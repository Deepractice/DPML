/**
 * Parser、Processor 与 Transformer 集成测试
 *
 * 这个测试文件验证从解析到处理再到转换的完整流程
 */
import fs from 'fs/promises';
import path from 'path';

import { DefaultProcessor } from '@core/api/processor';
import { DpmlAdapter } from '@core/parser/dpml-adapter';
import { DefaultOutputAdapterFactory } from '@core/transformer/adapters/defaultOutputAdapterFactory';
import { JSONAdapter } from '@core/transformer/adapters/jsonAdapter';
import { XMLAdapter } from '@core/transformer/adapters/xmlAdapter';
import { DefaultTransformerFactory } from '@core/transformer/defaultTransformerFactory';
import { NodeType } from '@core/types/node';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// 模拟文件系统
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockImplementation(async (filePath: string) => {
    // 返回模拟的文件内容
    if (filePath.includes('integration-test.xml')) {
      return `
        <dpml>
          <section id="main-section">
            <title>集成测试</title>
            <content>Parser、Processor与Transformer的集成测试</content>
          </section>
          <reference src="file:./included-content.xml" />
        </dpml>
      `;
    }

    if (filePath.includes('included-content.xml')) {
      return `
        <section id="included-section">
          <title>引用的内容</title>
          <list type="bullet">
            <item>引用项1</item>
            <item>引用项2</item>
          </list>
        </section>
      `;
    }

    throw new Error(`未找到文件: ${filePath}`);
  }),
}));

describe('Parser、Processor与Transformer集成测试', () => {
  let parser: DpmlAdapter;
  let processor: DefaultProcessor;
  let transformerFactory: DefaultTransformerFactory;
  let adapterFactory: DefaultOutputAdapterFactory;

  beforeEach(() => {
    // 初始化组件
    parser = new DpmlAdapter();
    processor = new DefaultProcessor();
    transformerFactory = new DefaultTransformerFactory();
    adapterFactory = new DefaultOutputAdapterFactory();

    // 注册适配器
    adapterFactory.register('json', new JSONAdapter());
    adapterFactory.register('xml', new XMLAdapter());

    // 设置默认适配器
    adapterFactory.setDefaultAdapter('json');
  });

  it('应该能完成从解析到转换的完整流程', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(`
      <dpml>
        <section id="simple">
          <title>简单测试</title>
          <content>这是一个简单的测试内容</content>
        </section>
      </dpml>
    `);

    // 验证解析结果
    expect(parseResult.ast).toBeDefined();
    expect(parseResult.ast.type).toBe(NodeType.DOCUMENT);

    // 2. 处理文档
    const processedDoc = await processor.process(
      parseResult.ast,
      'virtual-file.xml'
    );

    // 验证处理结果
    expect(processedDoc).toBeDefined();
    expect(processedDoc.type).toBe(NodeType.DOCUMENT);

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer();

    // 4. 转换为JSON
    const jsonOutput = transformer.transform(processedDoc);

    // 5. 验证JSON结果
    expect(jsonOutput).toBeDefined();

    // 输出结果供检查
    console.log('JSON Output 类型:', typeof jsonOutput);
  });

  it('应该支持转换为不同输出格式', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(`
      <dpml>
        <section id="format-test">
          <title>格式测试</title>
          <content>测试不同的输出格式</content>
        </section>
      </dpml>
    `);

    // 2. 处理文档
    const processedDoc = await processor.process(
      parseResult.ast,
      'virtual-format-test.xml'
    );

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为不同格式
    const jsonOutput = transformer.transform(processedDoc, { format: 'json' });
    const xmlOutput = transformer.transform(processedDoc, { format: 'xml' });

    // 5. 验证结果
    expect(jsonOutput).toBeDefined();
    expect(xmlOutput).toBeDefined();

    // 输出结果供检查
    console.log('JSON Output 类型:', typeof jsonOutput);
    console.log('XML Output 类型:', typeof xmlOutput);

    // 对于字符串类型的 XML 输出，验证其包含预期内容
    if (typeof xmlOutput === 'string') {
      expect(xmlOutput).toContain('<section id="format-test">');
      expect(xmlOutput).toContain('<title>格式测试</title>');
    }
  });
});
