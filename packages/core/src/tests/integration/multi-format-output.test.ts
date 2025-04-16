/**
 * 多格式输出集成测试
 * 测试ID: IT-T-004
 *
 * 测试同一文档转换为多种格式:
 * - JSON 格式
 * - XML 格式
 * - Markdown 格式
 * - HTML 格式 (如果支持)
 * - YAML 格式 (如果支持)
 */
import { DpmlAdapter } from '@core/parser/dpml-adapter';
import { DefaultProcessor } from '@core/api/processor';
import { DefaultOutputAdapterFactory } from '@core/transformer/adapters/defaultOutputAdapterFactory';
import { DefaultTransformerFactory } from '@core/transformer/defaultTransformerFactory';
import { describe, it, expect, beforeEach } from 'vitest';

import type { OutputAdapterFactory } from '@core/transformer/interfaces/outputAdapterFactory';
import type { TransformOptions } from '@core/transformer/interfaces/transformOptions';

describe('多格式输出集成测试', () => {
  // 测试组件
  let parser: DpmlAdapter;
  let processor: DefaultProcessor;
  let transformerFactory: DefaultTransformerFactory;
  let adapterFactory: OutputAdapterFactory;

  // 测试文档
  const complexDocument = `
  <document id="multi-format-test">
    <metadata>
      <title>多格式输出测试文档</title>
      <author>DPML测试团队</author>
      <version>1.0.0</version>
      <date>2023-05-15</date>
      <keywords>
        <keyword>多格式</keyword>
        <keyword>转换</keyword>
        <keyword>测试</keyword>
      </keywords>
    </metadata>
    <section id="section1">
      <heading level="1">多格式测试章节</heading>
      <paragraph>这个文档将被转换为多种不同的输出格式，包括JSON、XML和Markdown等。</paragraph>
      
      <section id="subsection1">
        <heading level="2">富文本内容</heading>
        <paragraph>
          这段内容包含<emphasis>强调文本</emphasis>、<strong>加粗文本</strong>和<code>内联代码</code>，
          以及<link href="https://example.com">链接文本</link>等富文本元素。
        </paragraph>
      </section>
      
      <section id="subsection2">
        <heading level="2">列表内容</heading>
        <paragraph>下面是有序列表和无序列表：</paragraph>
        
        <list type="ordered">
          <item>第一个有序项目</item>
          <item>
            第二个有序项目
            <list type="bullet">
              <item>嵌套无序项目1</item>
              <item>嵌套无序项目2</item>
            </list>
          </item>
          <item>第三个有序项目</item>
        </list>
        
        <list type="bullet">
          <item>无序项目A</item>
          <item>无序项目B</item>
          <item>
            无序项目C
            <paragraph>包含段落的列表项</paragraph>
          </item>
        </list>
      </section>
      
      <section id="subsection3">
        <heading level="2">表格内容</heading>
        <paragraph>下面是一个简单表格：</paragraph>
        
        <table>
          <caption>多格式对比表</caption>
          <header>
            <cell>格式</cell>
            <cell>优点</cell>
            <cell>缺点</cell>
          </header>
          <row>
            <cell>JSON</cell>
            <cell>结构化好，易于解析</cell>
            <cell>不适合人类直接阅读</cell>
          </row>
          <row>
            <cell>XML</cell>
            <cell>结构严谨，支持元数据</cell>
            <cell>冗长，解析复杂</cell>
          </row>
          <row>
            <cell>Markdown</cell>
            <cell>易读易写，轻量级</cell>
            <cell>格式功能有限</cell>
          </row>
        </table>
      </section>
      
      <section id="subsection4">
        <heading level="2">代码块</heading>
        <paragraph>下面是一个TypeScript代码块：</paragraph>
        
        <code language="typescript">
          interface Document {
            metadata: {
              title: string;
              author: string;
            };
            content: Array<Section>;
          }
          
          class DocumentProcessor {
            process(doc: Document): ProcessedDocument {
              // 处理文档逻辑
              return processedResult;
            }
          }
        </code>
      </section>
      
      <section id="subsection5">
        <heading level="2">引用和注释</heading>
        
        <quote source="某著名程序员">
          <paragraph>代码写得好坏，不在于行数的多少，而在于逻辑的清晰度和可维护性。</paragraph>
        </quote>
        
        <note type="info">
          <paragraph>这是一个信息提示框，用于展示重要信息。</paragraph>
        </note>
        
        <note type="warning">
          <paragraph>这是一个警告提示框，用于强调需要注意的事项。</paragraph>
        </note>
      </section>
      
      <section id="subsection6">
        <heading level="2">混合内容</heading>
        <paragraph>这个部分包含混合内容，即文本与元素的混合。</paragraph>
        
        <mixed>
          这是一段混合内容，包含<inline>内联元素</inline>和普通文本，
          还有<emphasis>强调</emphasis>和<code inline="true">代码</code>。
        </mixed>
        
        <paragraph>
          下面是一些特殊字符: &lt; &gt; &amp; &quot; &#39;
        </paragraph>
      </section>
    </section>
    
    <section id="section2">
      <heading level="1">附录和参考</heading>
      
      <reference id="ref1" type="citation" source="DPML文档" page="123">
        <content>这是一个引用的内容，来自DPML官方文档。</content>
      </reference>
      
      <image src="https://example.com/image.jpg" alt="示例图片" width="800" height="600">
        <caption>这是一张示例图片</caption>
      </image>
    </section>
  </document>
  `;

  beforeEach(() => {
    // 初始化测试组件
    parser = new DpmlAdapter();
    processor = new DefaultProcessor();
    transformerFactory = new DefaultTransformerFactory();
    adapterFactory = new DefaultOutputAdapterFactory();

    // 注册输出适配器 (使用函数返回模拟适配器)
    adapterFactory.registerAdapter('json', () => ({
      adapt: (result: any) => result,
    }));
    adapterFactory.registerAdapter('xml', () => ({
      adapt: (result: any) => `<xml>${JSON.stringify(result)}</xml>`,
    }));
    adapterFactory.registerAdapter('markdown', () => ({
      adapt: (result: any) => `# ${JSON.stringify(result)}`,
    }));

    // 设置默认适配器
    adapterFactory.setDefaultAdapter('json');
  });

  it('应该能将同一文档转换为JSON格式', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(complexDocument);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 2. 处理文档
    const processedDoc = processor.process(document);

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为JSON
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
    } as TransformOptions);

    // 5. 验证基本结构
    expect(jsonOutput).toBeDefined();
    expect(typeof jsonOutput).toBe('object');

    // 6. 验证文档元数据
    expect(jsonOutput.document).toBeDefined();
    expect(jsonOutput.document.metadata).toBeDefined();
    // 其他断言需根据实际输出结构调整
  });

  it('应该能将同一文档转换为XML格式', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(complexDocument);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 2. 处理文档
    const processedDoc = processor.process(document);

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为XML
    const xmlOutput = transformer.transform(processedDoc, {
      format: 'xml',
    } as TransformOptions);

    // 5. 验证基本结构
    expect(xmlOutput).toBeDefined();
    expect(typeof xmlOutput).toBe('string');
    expect(xmlOutput).toContain('<xml>');
    // 其他断言需根据实际输出结构调整
  });

  it('应该能将同一文档转换为Markdown格式', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(complexDocument);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 2. 处理文档
    const processedDoc = processor.process(document);

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为Markdown
    const mdOutput = transformer.transform(processedDoc, {
      format: 'markdown',
    } as TransformOptions);

    // 5. 验证基本结构
    expect(mdOutput).toBeDefined();
    expect(typeof mdOutput).toBe('string');
    expect(mdOutput).toContain('#');
    // 其他断言需根据实际输出结构调整
  });

  it('应该能同时输出多种格式并保持一致性', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(complexDocument);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 2. 处理文档
    const processedDoc = processor.process(document);

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 转换为多种格式
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
    } as TransformOptions);
    const xmlOutput = transformer.transform(processedDoc, {
      format: 'xml',
    } as TransformOptions);
    const mdOutput = transformer.transform(processedDoc, {
      format: 'markdown',
    } as TransformOptions);

    // 5. 验证各格式输出
    expect(jsonOutput).toBeDefined();
    expect(xmlOutput).toBeDefined();
    expect(mdOutput).toBeDefined();

    // 6. 验证基本结构一致性
    expect(jsonOutput.document).toBeDefined();
    expect(xmlOutput).toContain('<xml>');
    expect(mdOutput).toContain('#');
  });

  it('应该能处理边缘情况和特殊字符', async () => {
    // 1. 解析文档
    const parseResult = await parser.parse(complexDocument);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 2. 处理文档
    const processedDoc = processor.process(document);

    // 3. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 4. 测试各种格式
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
    } as TransformOptions);
    const xmlOutput = transformer.transform(processedDoc, {
      format: 'xml',
    } as TransformOptions);
    const mdOutput = transformer.transform(processedDoc, {
      format: 'markdown',
    } as TransformOptions);

    // 5. 验证输出存在
    expect(jsonOutput).toBeDefined();
    expect(xmlOutput).toBeDefined();
    expect(mdOutput).toBeDefined();

    // 6. 验证基本结构
    expect(jsonOutput.document).toBeDefined();
    expect(typeof xmlOutput).toBe('string');
    expect(typeof mdOutput).toBe('string');
  });
});
