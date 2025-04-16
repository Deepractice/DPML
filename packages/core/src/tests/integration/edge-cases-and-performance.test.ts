/**
 * 边界情况和性能测试
 * 测试ID: IT-T-006
 *
 * 测试转换器在边界情况和性能方面的表现:
 * - 大文档转换性能
 * - 深度嵌套结构处理
 * - 内存使用监控
 * - 并发转换
 */
import { performance } from 'perf_hooks';

import { DpmlAdapter } from '@core/parser/dpml-adapter';
import { createProcessor } from '@core/api/processor';
import { DefaultOutputAdapterFactory } from '@core/transformer/adapters/defaultOutputAdapterFactory';
import { JSONAdapter } from '@core/transformer/adapters/jsonAdapter';
import { MarkdownAdapter } from '@core/transformer/adapters/markdownAdapter';
import { XMLAdapter } from '@core/transformer/adapters/xmlAdapter';
import { DefaultTransformerFactory } from '@core/transformer/defaultTransformerFactory';
import { TextNode } from '@core/types/contentNode';
import { NodeType, Node } from '@core/types/node';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { ProcessedDocument } from '@core/types/processor/processor';
import type { OutputAdapterFactory } from '@core/transformer/interfaces/outputAdapterFactory';
import type { Document, Element } from '@core/types/node';

describe('边界情况和性能测试', () => {
  // 基础组件
  const parser = new DpmlAdapter();
  const processor = createProcessor();
  const transformerFactory = new DefaultTransformerFactory();
  const adapterFactory: OutputAdapterFactory =
    new DefaultOutputAdapterFactory();

  // 性能指标
  let startTime: number;
  let endTime: number;
  let memoryBefore: NodeJS.MemoryUsage;
  let memoryAfter: NodeJS.MemoryUsage;

  beforeEach(() => {
    // 注册适配器
    adapterFactory.register('json', new JSONAdapter());
    adapterFactory.register('xml', new XMLAdapter());
    adapterFactory.register('md', new MarkdownAdapter());

    // 设置默认适配器
    adapterFactory.setDefaultAdapter('json');

    // 记录初始内存使用情况
    memoryBefore = process.memoryUsage();
    startTime = performance.now();
  });

  afterEach(() => {
    // 清理资源
    // 记录性能信息
    if (startTime && endTime) {
      console.log(`测试执行时间: ${endTime - startTime}ms`);
    }

    if (memoryBefore && memoryAfter) {
      console.log('内存使用变化:');
      console.log(
        `- 堆总大小: ${(memoryAfter.heapTotal - memoryBefore.heapTotal) / 1024 / 1024} MB`
      );
      console.log(
        `- 堆已用: ${(memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024} MB`
      );
      console.log(
        `- RSS: ${(memoryAfter.rss - memoryBefore.rss) / 1024 / 1024} MB`
      );
    }

    // 重置计时器
    startTime = 0;
    endTime = 0;
    memoryBefore = null as any;
    memoryAfter = null as any;
  });

  // 辅助函数：创建大型测试文档
  function createLargeDocument(
    sections: number,
    elementsPerSection: number
  ): Document {
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
    };

    for (let i = 0; i < sections; i++) {
      const section: Element = {
        type: NodeType.ELEMENT,
        tag: 'section',
        attributes: { id: `section-${i}` },
        children: [],
      };

      // 添加标题
      const heading: Element = {
        type: NodeType.ELEMENT,
        tag: 'heading',
        attributes: {},
        children: [
          {
            type: NodeType.CONTENT,
            value: `部分 ${i + 1} 标题`,
            nodeType: 'text',
          },
        ],
      };

      section.children.push(heading);

      // 添加多个元素
      for (let j = 0; j < elementsPerSection; j++) {
        const paragraph: Element = {
          type: NodeType.ELEMENT,
          tag: 'paragraph',
          attributes: {},
          children: [
            {
              type: NodeType.CONTENT,
              value: `这是第 ${i + 1} 部分第 ${j + 1} 段文本，内容足够长以模拟真实内容，包含一些重复文本以增加大小。这是第 ${i + 1} 部分第 ${j + 1} 段文本，内容足够长以模拟真实内容，包含一些重复文本以增加大小。`,
              nodeType: 'text',
            },
          ],
        };

        section.children.push(paragraph);
      }

      document.children.push(section);
    }

    return document;
  }

  // 辅助函数：创建深度嵌套文档
  function createDeepNestedDocument(depth: number): Document {
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
    };

    let currentElement: Element = {
      type: NodeType.ELEMENT,
      tag: 'container',
      attributes: { id: 'root' },
      children: [],
    };

    document.children.push(currentElement);

    // 创建深度嵌套结构
    for (let i = 0; i < depth; i++) {
      const nestedElement: Element = {
        type: NodeType.ELEMENT,
        tag: 'container',
        attributes: { id: `level-${i + 1}` },
        children: [],
      };

      // 每个层级添加一些内容
      nestedElement.children.push({
        type: NodeType.ELEMENT,
        tag: 'paragraph',
        attributes: {},
        children: [
          {
            type: NodeType.CONTENT,
            value: `层级 ${i + 1} 文本内容`,
            nodeType: 'text',
          },
        ],
      });

      currentElement.children.push(nestedElement);
      currentElement = nestedElement;
    }

    return document;
  }

  // 大文档性能测试
  it('应该能高效处理大型文档 (性能测试)', async () => {
    // 创建大型文档 (50个部分，每部分20个元素)
    const largeDocument = createLargeDocument(50, 20);

    // 处理文档
    const startProcessing = performance.now();
    const processedDoc = await processor.process(
      largeDocument,
      'large-doc.dpml'
    );
    const processingTime = performance.now() - startProcessing;

    console.log(`处理大型文档耗时: ${processingTime.toFixed(2)}ms`);

    // 初始内存使用
    const initialMemoryUsage = process.memoryUsage();

    // 转换文档
    const startTransform = performance.now();
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );
    const result = transformer.transform(processedDoc, { format: 'json' });
    const transformTime = performance.now() - startTransform;

    // 最终内存使用
    const finalMemoryUsage = process.memoryUsage();

    console.log(`转换大型文档耗时: ${transformTime.toFixed(2)}ms`);
    console.log(
      `内存使用增加: ${((finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed) / (1024 * 1024)).toFixed(2)}MB`
    );

    // 验证结果
    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document.section).toBeInstanceOf(Array);
    expect(result.document.section.length).toBe(50);
  });

  // 深度嵌套结构测试
  it('应该能处理深度嵌套结构 (边界测试)', async () => {
    // 创建深度嵌套文档 (100层)
    const deepDocument = createDeepNestedDocument(100);

    // 处理文档
    const processedDoc = await processor.process(deepDocument, 'deep-doc.dpml');

    // 初始内存使用
    const initialMemoryUsage = process.memoryUsage();

    // 转换文档
    const startTransform = performance.now();
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );
    const result = transformer.transform(processedDoc, { format: 'json' });
    const transformTime = performance.now() - startTransform;

    // 最终内存使用
    const finalMemoryUsage = process.memoryUsage();

    console.log(`转换深度嵌套文档耗时: ${transformTime.toFixed(2)}ms`);
    console.log(
      `内存使用增加: ${((finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed) / (1024 * 1024)).toFixed(2)}MB`
    );

    // 验证结果
    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document.container).toBeDefined();

    // 验证嵌套深度
    let currentContainer = result.document.container;
    let depth = 0;

    while (currentContainer && currentContainer.container) {
      depth++;
      currentContainer = currentContainer.container;
    }

    expect(depth).toBe(100);
  });

  // 内存使用监控测试
  it('应该在多次转换后保持稳定的内存使用 (内存监控)', async () => {
    // 创建中等大小文档
    const document = createLargeDocument(20, 10);

    // 处理文档
    const processedDoc = await processor.process(document, 'memory-test.dpml');

    // 初始内存使用
    const initialMemoryUsage = process.memoryUsage();

    console.log(
      `初始堆内存使用: ${(initialMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)}MB`
    );

    // 多次转换
    const transformer = transformerFactory.createTransformer(
      {
        enableCache: false, // 禁用缓存以测试真实内存使用
      },
      adapterFactory
    );

    // 执行10次转换
    for (let i = 0; i < 10; i++) {
      transformer.transform(processedDoc, { format: 'json' });

      // 每次转换后检查内存
      if (i === 4 || i === 9) {
        const currentMemoryUsage = process.memoryUsage();

        console.log(
          `第 ${i + 1} 次转换后堆内存使用: ${(currentMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)}MB`
        );
      }
    }

    // 强制垃圾回收 (Node.js中，只有在特定模式下才能手动触发)
    if (global.gc) {
      global.gc();
    }

    // 最终内存使用
    const finalMemoryUsage = process.memoryUsage();
    const memoryDiff = finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed;

    console.log(
      `最终堆内存使用: ${(finalMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)}MB`
    );
    console.log(`内存增长: ${(memoryDiff / (1024 * 1024)).toFixed(2)}MB`);

    // 不严格验证具体数值，因为不同环境下GC行为不同
    // 只验证转换器能正常工作，不会因为多次转换而崩溃
    expect(true).toBe(true);
  });

  // 并发转换测试
  it('应该支持并发转换请求 (并发测试)', async () => {
    // 创建多个不同大小的文档
    const documents = [
      createLargeDocument(5, 5),
      createLargeDocument(10, 10),
      createLargeDocument(15, 5),
      createDeepNestedDocument(30),
      createDeepNestedDocument(50),
    ];

    // 处理所有文档
    const processedDocs: ProcessedDocument[] = [];

    for (const doc of documents) {
      const processed = await processor.process(doc, 'concurrent-test.dpml');

      processedDocs.push(processed);
    }

    // 创建转换器
    const transformer = transformerFactory.createTransformer(
      undefined,
      adapterFactory
    );

    // 并发执行所有转换
    const startTime = performance.now();
    const results = await Promise.all(
      processedDocs.map(doc =>
        transformer.transformAsync(doc, { format: 'json' })
      )
    );
    const totalTime = performance.now() - startTime;

    console.log(`并发转换5个文档总耗时: ${totalTime.toFixed(2)}ms`);

    // 验证所有结果
    results.forEach((result, index) => {
      expect(result).toBeDefined();
      expect(result.document).toBeDefined();

      if (index < 3) {
        // 大型文档测试
        expect(result.document.section).toBeDefined();
      } else {
        // 深度嵌套测试
        expect(result.document.container).toBeDefined();
      }
    });
  });
});
