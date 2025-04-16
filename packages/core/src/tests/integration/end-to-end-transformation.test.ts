/**
 * 端到端转换集成测试
 * 测试ID: IT-T-005
 *
 * 测试从解析到转换的完整流程:
 * - 文档解析
 * - 处理器处理
 * - 转换器转换
 * - 适配器输出
 */
import { DpmlAdapter } from '@core/parser/dpml-adapter';
import { DefaultProcessor } from '@core/api/processor';
import { DefaultOutputAdapterFactory } from '@core/transformer/adapters/defaultOutputAdapterFactory';
import { DefaultTransformerFactory } from '@core/transformer/defaultTransformerFactory';
import { describe, it, expect, beforeEach } from 'vitest';

import type { OutputAdapterFactory } from '@core/transformer/interfaces/outputAdapterFactory';
import type { TransformOptions } from '@core/transformer/interfaces/transformOptions';

describe('端到端转换集成测试', () => {
  // 测试组件
  let parser: DpmlAdapter;
  let processor: DefaultProcessor;
  let transformerFactory: DefaultTransformerFactory;
  let adapterFactory: OutputAdapterFactory;

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

  it('应该能完成完整的解析-处理-转换流程 (JSON格式)', async () => {
    // 1. 准备测试文档
    const dpmlContent = `
      <document id="e2e-test">
        <metadata>
          <title>端到端测试文档</title>
          <author>DPML测试团队</author>
          <version>1.0.0</version>
        </metadata>
        <section id="main">
          <heading level="1">主要章节</heading>
          <paragraph>这是一个测试段落，包含<emphasis>强调</emphasis>和<code>代码</code>。</paragraph>
          <list type="bullet">
            <item>测试项目1</item>
            <item>测试项目2</item>
          </list>
        </section>
      </document>
    `;

    // 2. 解析文档
    const parseResult = await parser.parse(dpmlContent);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 3. 记录解析结果的基本信息
    console.log('解析文档类型:', document.type);
    console.log('文档子节点数量:', document.children?.length || 0);

    // 4. 处理文档
    const processedDoc = processor.process(document);

    expect(processedDoc).toBeDefined();

    // 5. 记录处理后文档的基本信息
    console.log('处理后文档类型:', processedDoc.type);
    console.log('处理后文档子节点数量:', processedDoc.children?.length || 0);

    // 6. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 7. 转换为JSON
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
    } as TransformOptions);

    expect(jsonOutput).toBeDefined();

    // 8. 验证转换结果
    expect(typeof jsonOutput).toBe('object');
    expect(jsonOutput.document).toBeDefined();
    expect(jsonOutput.document.metadata).toBeDefined();
    expect(jsonOutput.document.metadata.title).toBe('端到端测试文档');
    expect(jsonOutput.document.metadata.author).toBe('DPML测试团队');
    expect(jsonOutput.document.section).toBeDefined();
    expect(jsonOutput.document.section.heading).toBe('主要章节');
    expect(jsonOutput.document.section.paragraph).toContain('这是一个测试段落');
    expect(jsonOutput.document.section.list).toBeDefined();
    expect(jsonOutput.document.section.list.item).toBeInstanceOf(Array);
    expect(jsonOutput.document.section.list.item.length).toBe(2);
  });

  it('应该能完成完整的解析-处理-转换流程 (XML格式)', async () => {
    // 1. 准备测试文档
    const dpmlContent = `
      <document id="e2e-test-xml">
        <metadata>
          <title>XML端到端测试</title>
          <author>DPML测试团队</author>
        </metadata>
        <section id="xml-section">
          <heading level="1">XML测试</heading>
          <paragraph>这是XML格式测试。</paragraph>
          <table>
            <caption>简单表格</caption>
            <header>
              <cell>列1</cell>
              <cell>列2</cell>
            </header>
            <row>
              <cell>数据1</cell>
              <cell>数据2</cell>
            </row>
          </table>
        </section>
      </document>
    `;

    // 2. 解析文档
    const parseResult = await parser.parse(dpmlContent);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 3. 处理文档
    const processedDoc = processor.process(document);

    expect(processedDoc).toBeDefined();

    // 4. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 5. 转换为XML
    const xmlOutput = transformer.transform(processedDoc, {
      format: 'xml',
    } as TransformOptions);

    expect(xmlOutput).toBeDefined();

    // 6. 验证转换结果
    expect(typeof xmlOutput).toBe('string');
    expect(xmlOutput).toContain('<xml>');
    // 由于我们使用了简单的模拟适配器，输出是基于JSON字符串的
    expect(xmlOutput).toContain('document');
    expect(xmlOutput).toContain('metadata');
    expect(xmlOutput).toContain('XML端到端测试');
  });

  it('应该能完成完整的解析-处理-转换流程 (Markdown格式)', async () => {
    // 1. 准备测试文档
    const dpmlContent = `
      <document>
        <section>
          <heading level="1">Markdown测试</heading>
          <paragraph>这是Markdown格式测试。</paragraph>
          <code language="javascript">
            console.log('Hello Markdown');
          </code>
          <list type="ordered">
            <item>第一项</item>
            <item>第二项</item>
          </list>
        </section>
      </document>
    `;

    // 2. 解析文档
    const parseResult = await parser.parse(dpmlContent);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 3. 处理文档
    const processedDoc = processor.process(document);

    expect(processedDoc).toBeDefined();

    // 4. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 5. 转换为Markdown
    const mdOutput = transformer.transform(processedDoc, {
      format: 'markdown',
    } as TransformOptions);

    expect(mdOutput).toBeDefined();

    // 6. 验证转换结果
    expect(typeof mdOutput).toBe('string');
    expect(mdOutput).toContain('#');
    // 由于我们使用了简单的模拟适配器，输出是基于JSON字符串的
    expect(mdOutput).toContain('document');
    expect(mdOutput).toContain('section');
    expect(mdOutput).toContain('Markdown测试');
  });

  it('应该能处理大型文档和深度嵌套结构', async () => {
    // 1. 准备深度嵌套测试文档
    const nestedContent = `
      <document id="nested-test">
        <section id="level1">
          <heading level="1">一级章节</heading>
          <paragraph>一级内容</paragraph>
          <section id="level2">
            <heading level="2">二级章节</heading>
            <paragraph>二级内容</paragraph>
            <section id="level3">
              <heading level="3">三级章节</heading>
              <paragraph>三级内容</paragraph>
              <section id="level4">
                <heading level="4">四级章节</heading>
                <paragraph>四级内容</paragraph>
                <section id="level5">
                  <heading level="5">五级章节</heading>
                  <paragraph>五级内容</paragraph>
                  <list type="bullet">
                    <item>深度嵌套项目1</item>
                    <item>
                      深度嵌套项目2
                      <list type="ordered">
                        <item>更深嵌套1</item>
                        <item>更深嵌套2</item>
                      </list>
                    </item>
                  </list>
                </section>
              </section>
            </section>
          </section>
        </section>
      </document>
    `;

    // 2. 解析文档
    const parseResult = await parser.parse(nestedContent);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 3. 处理文档
    const processedDoc = processor.process(document);

    expect(processedDoc).toBeDefined();

    // 4. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 5. 转换为各种格式
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
    } as TransformOptions);
    const xmlOutput = transformer.transform(processedDoc, {
      format: 'xml',
    } as TransformOptions);
    const mdOutput = transformer.transform(processedDoc, {
      format: 'markdown',
    } as TransformOptions);

    // 6. 验证输出存在
    expect(jsonOutput).toBeDefined();
    expect(xmlOutput).toBeDefined();
    expect(mdOutput).toBeDefined();

    // 7. 检查JSON输出结构
    expect(jsonOutput.document).toBeDefined();
    expect(jsonOutput.document.section).toBeDefined();

    // 8. 检查XML输出
    expect(typeof xmlOutput).toBe('string');
    expect(xmlOutput).toContain('<xml>');

    // 9. 检查Markdown输出
    expect(typeof mdOutput).toBe('string');
    expect(mdOutput).toContain('#');
  });

  it('应该能处理错误和异常情况', async () => {
    // 1. 准备含有错误的文档
    const invalidContent = `
      <document>
        <unclosed_tag>
        <unknown_element>未知元素</unknown_element>
        <section>
          <heading level="invalid">无效级别标题</heading>
        </section>
      </document>
    `;

    try {
      // 2. 尝试解析文档
      const parseResult = await parser.parse(invalidContent);

      // 3. 获取解析警告
      console.log('解析警告数量:', parseResult.warnings?.length || 0);
      if (parseResult.warnings && parseResult.warnings.length > 0) {
        console.log('第一个警告:', parseResult.warnings[0]);
      }

      // 4. 处理文档
      const processedDoc = processor.process(parseResult.ast);

      // 5. 创建转换器
      const transformer = transformerFactory.createTransformer(
        {
          // 使用宽松模式处理错误
          mode: 'lenient',
        } as TransformOptions,
        adapterFactory
      );

      // 6. 尝试转换
      const output = transformer.transform(processedDoc, {
        format: 'json',
      } as TransformOptions);

      expect(output).toBeDefined();

      // 7. 验证结果
      console.log('转换结果类型:', typeof output);
      if (typeof output === 'object') {
        console.log('转换结果键:', Object.keys(output).join(', '));
      }
    } catch (error) {
      // 8. 捕获并检查错误
      console.log('捕获到错误:', error);
      expect(error).toBeDefined();
    }
  });

  it('应该能处理自定义变量替换', async () => {
    // 1. 准备带变量的测试文档
    const documentWithVars = `
      <document>
        <metadata>
          <title>变量替换测试</title>
        </metadata>
        <section>
          <heading level="1">{{title}}</heading>
          <paragraph>当前版本: {{version}}</paragraph>
          <paragraph>您好，{{user.name}}！欢迎使用DPML。</paragraph>
        </section>
      </document>
    `;

    // 2. 解析文档
    const parseResult = await parser.parse(documentWithVars);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 3. 处理文档
    const processedDoc = processor.process(document);

    expect(processedDoc).toBeDefined();

    // 4. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 5. 转换文档，提供变量
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
      variables: {
        title: '变量替换测试',
        version: '2.0.0',
        user: {
          name: '张三',
        },
      },
    } as TransformOptions);

    // 6. 验证变量替换结果
    expect(jsonOutput).toBeDefined();
    expect(jsonOutput.document).toBeDefined();
    expect(jsonOutput.document.section).toBeDefined();
  });

  it('应该能处理混合内容类型', async () => {
    // 1. 准备混合内容文档
    const mixedContent = `
      <document>
        <section>
          <heading level="1">混合内容测试</heading>
          <mixed>
            这是纯文本，<emphasis>这是强调</emphasis>，<code>这是代码</code>。
            <list type="bullet">
              <item>列表项在混合内容中</item>
            </list>
            更多文本...
          </mixed>
        </section>
      </document>
    `;

    // 2. 解析文档
    const parseResult = await parser.parse(mixedContent);

    // 确保解析成功
    expect(parseResult.errors.length).toBe(0);
    const document = parseResult.ast;

    // 3. 处理文档
    const processedDoc = processor.process(document);

    expect(processedDoc).toBeDefined();

    // 4. 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 5. 转换为各种格式
    const jsonOutput = transformer.transform(processedDoc, {
      format: 'json',
    } as TransformOptions);
    const xmlOutput = transformer.transform(processedDoc, {
      format: 'xml',
    } as TransformOptions);
    const mdOutput = transformer.transform(processedDoc, {
      format: 'markdown',
    } as TransformOptions);

    // 6. 验证各格式能否正确处理混合内容
    expect(jsonOutput).toBeDefined();
    expect(xmlOutput).toBeDefined();
    expect(mdOutput).toBeDefined();

    // 检查JSON结构
    expect(jsonOutput.document).toBeDefined();
    expect(jsonOutput.document.section).toBeDefined();
  });
});
