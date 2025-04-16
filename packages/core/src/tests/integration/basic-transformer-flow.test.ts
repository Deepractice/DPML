import { DpmlAdapter } from '@core/parser/dpml-adapter';
import { createProcessor } from '@core/processor/factory';
import { DefaultOutputAdapterFactory } from '@core/transformer/adapters/defaultOutputAdapterFactory';
import { JSONAdapter } from '@core/transformer/adapters/jsonAdapter';
import { MarkdownAdapter } from '@core/transformer/adapters/markdownAdapter';
import { XMLAdapter } from '@core/transformer/adapters/xmlAdapter';
import { DefaultTransformerFactory } from '@core/transformer/defaultTransformerFactory';
import { describe, it, expect } from 'vitest';

import type { OutputAdapterFactory } from '@core/transformer/interfaces/outputAdapterFactory';

describe('转换器基础流程集成测试', () => {
  // 创建基础组件
  const parser = new DpmlAdapter();
  const processor = createProcessor();
  const transformerFactory = new DefaultTransformerFactory();
  const adapterFactory: OutputAdapterFactory =
    new DefaultOutputAdapterFactory();

  // 注册适配器
  adapterFactory.register('json', new JSONAdapter());
  adapterFactory.register('xml', new XMLAdapter());
  adapterFactory.register('md', new MarkdownAdapter());

  // 设置默认适配器
  adapterFactory.setDefaultAdapter('json');

  it('应该能解析并转换简单文档为JSON', async () => {
    // 1. 解析文档
    const dpmlContent = `
      <document>
        <section id="section1">
          <heading>测试标题</heading>
          <paragraph>这是一个测试段落</paragraph>
        </section>
      </document>
    `;

    const parseResult = await parser.parse(dpmlContent);
    const document = parseResult.ast;

    // 2. 处理文档 - 使用await等待异步操作完成
    const processedDoc = await processor.process(document, 'test-file.dpml');

    // 调试输出
    console.log('处理后的文档对象类型:', typeof processedDoc);
    console.log(
      '处理后的文档键:',
      processedDoc ? Object.keys(processedDoc).join(', ') : '无'
    );
    console.log(
      '处理后的文档内容:',
      JSON.stringify(processedDoc, null, 2).substring(0, 500)
    );

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为JSON
    const jsonOutput = transformer.transform(processedDoc, { format: 'json' });

    // 额外调试输出
    console.log('JSON输出对象:', jsonOutput);
    console.log('JSON输出类型:', typeof jsonOutput);
    console.log(
      'JSON输出键:',
      jsonOutput ? Object.keys(jsonOutput).join(', ') : '无'
    );

    // 5. 验证结果
    expect(jsonOutput).toBeDefined();
    expect(typeof jsonOutput).toBe('object');
    expect(jsonOutput.document).toBeDefined();
    expect(jsonOutput.document.section).toBeDefined();
    expect(jsonOutput.document.section.heading).toBe('测试标题');
    expect(jsonOutput.document.section.paragraph).toBe('这是一个测试段落');
  });

  it('应该支持处理嵌套复杂元素', async () => {
    // 1. 解析文档
    const dpmlContent = `
      <document>
        <section>
          <heading>复杂嵌套</heading>
          <container>
            <paragraph>第一段落</paragraph>
            <list type="bullet">
              <item>列表项1</item>
              <item>列表项2</item>
              <item>
                <paragraph>嵌套段落</paragraph>
                <code language="javascript">console.log('Hello');</code>
              </item>
            </list>
          </container>
        </section>
      </document>
    `;

    const parseResult = await parser.parse(dpmlContent);
    const document = parseResult.ast;

    // 2. 处理文档 - 使用await等待异步操作完成
    const processedDoc = await processor.process(document, 'test-file.dpml');

    // 调试输出
    console.log('处理后的文档对象类型:', typeof processedDoc);
    console.log(
      '处理后的文档键:',
      processedDoc ? Object.keys(processedDoc).join(', ') : '无'
    );
    console.log(
      '处理后的文档内容:',
      JSON.stringify(processedDoc, null, 2).substring(0, 500)
    );

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为JSON
    const jsonOutput = transformer.transform(processedDoc, { format: 'json' });

    // 5. 验证结果
    expect(jsonOutput).toBeDefined();
    expect(jsonOutput.document.section.heading).toBe('复杂嵌套');
    expect(jsonOutput.document.section.container.paragraph).toBe('第一段落');
    expect(jsonOutput.document.section.container.list.item).toBeInstanceOf(
      Array
    );
    expect(jsonOutput.document.section.container.list.item.length).toBe(3);
    expect(jsonOutput.document.section.container.list.item[2].paragraph).toBe(
      '嵌套段落'
    );
    expect(jsonOutput.document.section.container.list.item[2].code).toBe(
      "console.log('Hello');"
    );
  });

  it('应该支持转换为多种输出格式', async () => {
    // 1. 解析文档
    const dpmlContent = `
      <document>
        <section id="main">
          <heading>多格式输出</heading>
          <paragraph>支持JSON和XML格式输出</paragraph>
        </section>
      </document>
    `;

    const parseResult = await parser.parse(dpmlContent);
    const document = parseResult.ast;

    // 2. 处理文档 - 使用await等待异步操作完成
    const processedDoc = await processor.process(document, 'test-file.dpml');

    // 调试输出
    console.log('处理后的文档对象类型:', typeof processedDoc);
    console.log(
      '处理后的文档键:',
      processedDoc ? Object.keys(processedDoc).join(', ') : '无'
    );
    console.log(
      '处理后的文档内容:',
      JSON.stringify(processedDoc, null, 2).substring(0, 500)
    );

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为JSON
    const jsonOutput = transformer.transform(processedDoc, { format: 'json' });

    // 5. 转换为XML
    const xmlOutput = transformer.transform(processedDoc, { format: 'xml' });

    // 6. 验证JSON结果
    expect(jsonOutput).toBeDefined();
    expect(typeof jsonOutput).toBe('object');
    expect(jsonOutput.document.section.heading).toBe('多格式输出');

    // 7. 验证XML结果
    expect(xmlOutput).toBeDefined();
    expect(typeof xmlOutput).toBe('string');
    expect(xmlOutput).toContain('<document>');
    expect(xmlOutput).toContain('<section id="main">');
    expect(xmlOutput).toContain('<heading>多格式输出</heading>');
    expect(xmlOutput).toContain('<paragraph>支持JSON和XML格式输出</paragraph>');
  });
});
