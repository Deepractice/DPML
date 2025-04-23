import { describe, test, expect } from 'vitest';

import { parse } from '../../../api/parser';
import { processDocument } from '../../../api/processing';
import { processSchema } from '../../../api/schema';
import type {
  DPMLDocument,
  DPMLNode,
  ProcessingResult,
  ValidationResult,
  ParseResult,
  ProcessingError
} from '../../../types';

/**
 * 处理模块端到端测试
 * 测试从API调用到结果返回的完整处理流程
 */
describe('文档处理端到端测试', () => {
  // 辅助函数：处理parse函数的返回值
  function ensureDPMLDocument(result: DPMLDocument | ParseResult<DPMLDocument>): DPMLDocument {
    if ('document' in result && result.document) {
      return result.document as DPMLDocument;
    }

    return result as DPMLDocument;
  }

  // E2E-PROC-01: 完整处理流程应验证符合Schema的文档
  test('E2E-PROC-01: 完整处理流程应验证符合Schema的文档', () => {
    // 定义DPML文档和Schema
    const dpmlContent = `
      <product id="p-123" category="electronics">
        <name>高性能笔记本电脑</name>
        <price currency="CNY">8999.00</price>
        <description>
          <para>最新一代处理器，高速SSD存储，提供卓越的性能体验。</para>
          <para>轻薄金属机身，长效电池续航，随时随地高效工作。</para>
        </description>
        <specifications>
          <spec name="屏幕">15.6英寸 4K OLED</spec>
          <spec name="CPU">11代酷睿i7</spec>
          <spec name="内存">16GB DDR4</spec>
          <spec name="存储">1TB NVMe SSD</spec>
        </specifications>
      </product>
    `;

    const schemaContent = {
      root: {
        element: 'product',
        attributes: [
          { name: 'id', required: true },
          { name: 'category', enum: ['electronics', 'furniture', 'clothing'] }
        ],
        children: {
          elements: [
            { element: 'name' },
            { element: 'price' },
            { element: 'description' },
            { element: 'specifications' }
          ]
        }
      },
      types: [
        {
          element: 'name',
          content: { type: 'text', required: true }
        },
        {
          element: 'price',
          attributes: [
            { name: 'currency', enum: ['USD', 'EUR', 'CNY'], required: true }
          ],
          content: { type: 'text', required: true }
        },
        {
          element: 'description',
          children: {
            elements: [{ element: 'para' }],
            min: 1
          }
        },
        {
          element: 'para',
          content: { type: 'text', required: true }
        },
        {
          element: 'specifications',
          children: {
            elements: [{ element: 'spec' }],
            min: 1
          }
        },
        {
          element: 'spec',
          attributes: [
            { name: 'name', required: true }
          ],
          content: { type: 'text', required: true }
        }
      ]
    };

    // 步骤1: 解析DPML内容
    const document = ensureDPMLDocument(parse(dpmlContent));

    // 步骤2: 处理Schema
    const schema = processSchema(schemaContent);

    // 步骤3: 处理文档
    console.log('开始处理符合Schema的文档...');
    const startTime = performance.now();
    const result = processDocument(document, schema);
    const endTime = performance.now();

    console.log(`文档处理完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);

    // 断言1: 验证结果应为有效
    expect(result.validation).toBeDefined();
    expect(result.validation!.isValid).toBe(true);
    expect(result.validation!.errors.length).toBe(0);

    // 断言2: 引用映射应包含所有ID节点
    expect(result.references).toBeDefined();
    expect(result.references?.idMap.has('p-123')).toBe(true);

    // 断言3: 应能通过ID访问到正确节点
    const productNode = result.references?.idMap.get('p-123');

    expect(productNode?.tagName).toBe('product');
    expect(productNode?.attributes.get('category')).toBe('electronics');

    // 断言4: 上下文信息应正确
    expect(result.document).toBe(document);
    expect(result.schema).toBe(schema);

    console.log('E2E-PROC-01测试通过: 成功验证了符合Schema的文档');
  });

  // E2E-PROC-02: 完整处理流程应检测不符合Schema的文档
  test('E2E-PROC-02: 完整处理流程应检测不符合Schema的文档', () => {
    // 定义DPML文档和Schema（文档缺少必需的属性和元素）
    const dpmlContent = `
      <product category="unknown">
        <price>8999.00</price>
        <specifications>
          <spec>不完整的规格</spec>
        </specifications>
      </product>
    `;

    const schemaContent = {
      root: {
        element: 'product',
        attributes: [
          { name: 'id', required: true },
          { name: 'category', enum: ['electronics', 'furniture', 'clothing'] }
        ],
        children: {
          elements: [
            { element: 'name' },
            { element: 'price' },
            { element: 'description' }
          ],
          min: 3
        }
      },
      types: [
        {
          element: 'name',
          content: { type: 'text', required: true }
        },
        {
          element: 'price',
          attributes: [
            { name: 'currency', required: true }
          ],
          content: { type: 'text', required: true }
        },
        {
          element: 'spec',
          attributes: [
            { name: 'name', required: true }
          ]
        }
      ]
    };

    // 步骤1: 解析DPML内容
    const document = ensureDPMLDocument(parse(dpmlContent));

    // 步骤2: 处理Schema
    const schema = processSchema(schemaContent);

    // 步骤3: 处理文档
    console.log('开始处理不符合Schema的文档...');
    const result = processDocument(document, schema);

    console.log(`找到 ${result.validation.errors.length} 个错误`);

    // 断言1: 验证结果应为无效
    expect(result.validation).toBeDefined();
    expect(result.validation!.isValid).toBe(false);
    expect(result.validation!.errors.length).toBeGreaterThan(0);

    // 断言2: 应该有特定的错误类型
    const errorCodes = result.validation!.errors.map(error => error.code);
    const errorPaths = result.validation!.errors.map(error => error.path);

    // 记录错误信息，便于调试
    result.validation!.errors.forEach(error => {
      console.log(`错误 [${error.code}]: ${error.message} (${error.path})`);
    });

    // 断言3: 检查特定错误
    // 产品ID缺失错误
    expect(errorCodes).toContain('MISSING_REQUIRED_ATTRIBUTE');
    expect(errorPaths.some(path => path.includes('id'))).toBe(true);

    // 类别值无效错误
    expect(errorCodes).toContain('INVALID_ATTRIBUTE_VALUE');
    expect(errorPaths.some(path => path.includes('category'))).toBe(true);

    // 缺少必需元素错误
    expect(errorCodes).toContain('TOO_FEW_CHILDREN');

    // 规格缺少name属性错误
    expect(errorPaths.some(path => path.includes('spec'))).toBe(true);

    // 性能指标检查
    expect(typeof result.validation!.errors.length).toBe('number');
    expect(typeof result.validation!.warnings.length).toBe('number');

    console.log('E2E-PROC-02测试通过: 成功检测出不符合Schema的文档');
  });

  // E2E-PROC-03: 完整处理流程应支持引用查找
  test('E2E-PROC-03: 完整处理流程应支持引用查找', () => {
    // 定义带有复杂引用关系的文档
    const dpmlContent = `
      <document id="doc-001">
        <section id="section-1">
          <title id="title-1">第一章</title>
          <content id="content-1">
            <reference target="section-2">参见第二章</reference>
            <paragraph id="para-1-1">这是第一章的内容。</paragraph>
            <paragraph id="para-1-2">更多内容请参考<reference target="section-3">第三章</reference>。</paragraph>
          </content>
        </section>
        <section id="section-2">
          <title id="title-2">第二章</title>
          <content id="content-2">
            <paragraph id="para-2-1">这是<emphasis id="em-1">第二章</emphasis>的内容。</paragraph>
            <paragraph id="para-2-2">参考<reference target="para-1-1">第一章内容</reference>。</paragraph>
          </content>
        </section>
        <section id="section-3">
          <title id="title-3">第三章</title>
          <content id="content-3">
            <paragraph id="para-3-1">这是第三章的内容。</paragraph>
          </content>
        </section>
      </document>
    `;

    // 使用简单Schema，专注于引用测试
    const schemaContent = { root: { element: 'document' } };

    // 步骤1: 解析和处理
    const document = ensureDPMLDocument(parse(dpmlContent));
    const schema = processSchema(schemaContent);
    const result = processDocument(document, schema);

    console.log('开始测试引用查找功能...');

    // 断言1: 引用映射应包含所有ID
    expect(result.references).toBeDefined();
    const { idMap } = result.references!;

    console.log(`引用映射包含 ${idMap.size} 个ID节点`);
    const allIds = Array.from(idMap.keys());

    console.log(`所有ID: ${allIds.join(', ')}`);

    // 断言2: 模拟引用解析 - 检查引用目标是否存在
    // 获取所有reference元素
    const allReferences = new Array<DPMLNode>();

    function findReferenceElements(node: DPMLNode): void {
      if (node.tagName === 'reference') {
        allReferences.push(node);
      }

      for (const child of node.children) {
        findReferenceElements(child);
      }
    }

    findReferenceElements(document.rootNode);
    console.log(`找到 ${allReferences.length} 个引用元素`);

    // 检查每个引用的目标是否在ID映射中
    let validReferences = 0;

    for (const refNode of allReferences) {
      const targetId = refNode.attributes.get('target');

      if (targetId && idMap.has(targetId)) {
        validReferences++;

        // 获取目标节点
        const targetNode = idMap.get(targetId);

        console.log(`引用 "${refNode.content}" 指向 ${targetNode?.tagName} [${targetId}]`);
      }
    }

    expect(validReferences).toBe(allReferences.length);
    console.log(`所有 ${validReferences} 个引用都有效`);

    // 断言3: 检查复杂引用关系
    // 获取所有需要的节点
    const section1 = idMap.get('section-1');
    const section2 = idMap.get('section-2');
    const para11 = idMap.get('para-1-1');

    expect(section1).toBeDefined();
    expect(section2).toBeDefined();
    expect(para11).toBeDefined();

    // 检查节点层次结构 - 调试版本
    console.log('para-1-1节点的层次结构:');
    let current: DPMLNode | null = para11 || null;
    let depth = 0;

    while (current) {
      console.log(`  层级${depth}: ${current.tagName}${current.attributes.has('id') ? ` (id=${current.attributes.get('id')})` : ''}`);
      current = current.parent;
      depth++;
    }

    // 直接检查父子关系
    expect(para11?.parent?.tagName).toBe('content');
    expect(para11?.parent?.parent?.tagName).toBe('section');
    expect(para11?.parent?.parent?.attributes.get('id')).toBe('section-1');

    console.log('E2E-PROC-03测试通过: 成功验证引用查找功能');
  });

  // E2E-PROC-04: 完整处理流程应支持自定义结果类型
  test('E2E-PROC-04: 完整处理流程应支持自定义结果类型', () => {
    // 定义自定义处理结果类型
    interface EnhancedProcessingResult extends ProcessingResult {
      performance: {
        parseTime: number;
        validationTime: number;
        referenceMapTime: number;
        totalTime: number;
      };
      metrics: {
        nodeCount: number;
        maxDepth: number;
        withIdCount: number;
        errorCount: number;
        warningCount: number;
      };
      debug?: {
        idList: string[];
        errorDetails: ProcessingError[];
      };
    }

    // 解析和处理简单文档
    const dpmlContent = '<root id="root1"><child id="child1">测试</child></root>';
    const schemaContent = { root: { element: 'root' } };

    console.log('开始测试自定义结果类型...');

    // 模拟计时
    const startTime = performance.now();

    // 解析和处理
    const document = ensureDPMLDocument(parse(dpmlContent));
    const parseTime = performance.now() - startTime;

    const schema = processSchema(schemaContent);
    const schemaTime = performance.now() - startTime - parseTime;

    // 处理文档，获取基本结果
    const baseResult = processDocument(document, schema);
    const processingTime = performance.now() - startTime - parseTime - schemaTime;

    // 创建增强的结果对象
    const result = baseResult as EnhancedProcessingResult;

    // 计算节点数量和最大深度
    let nodeCount = 0;
    let withIdCount = 0;
    let maxDepth = 0;

    function countNodes(node: DPMLNode, depth: number = 0): void {
      nodeCount++;

      if (node.attributes.has('id')) {
        withIdCount++;
      }

      maxDepth = Math.max(maxDepth, depth);

      for (const child of node.children) {
        countNodes(child, depth + 1);
      }
    }

    countNodes(document.rootNode);

    // 添加性能和指标信息
    result.performance = {
      parseTime,
      validationTime: processingTime * 0.6, // 估算
      referenceMapTime: processingTime * 0.4, // 估算
      totalTime: performance.now() - startTime
    };

    result.metrics = {
      nodeCount,
      maxDepth,
      withIdCount,
      errorCount: result.validation.errors.length,
      warningCount: result.validation.warnings.length
    };

    // 添加调试信息
    result.debug = {
      idList: Array.from(result.references?.idMap.keys() || []),
      errorDetails: [...result.validation.errors]
    };

    // 打印增强的结果信息
    console.log('增强的处理结果:');
    console.log(`- 性能: 解析=${result.performance.parseTime.toFixed(2)}ms, 总计=${result.performance.totalTime.toFixed(2)}ms`);
    console.log(`- 指标: ${result.metrics.nodeCount}个节点, ${result.metrics.withIdCount}个带ID节点, 深度=${result.metrics.maxDepth}`);

    // 断言基本功能正常
    expect(result.validation.isValid).toBe(true);
    expect(result.references?.idMap.size).toBe(2);

    // 断言增强的功能
    expect(result.performance).toBeDefined();
    expect(result.performance.totalTime).toBeGreaterThan(0);

    expect(result.metrics).toBeDefined();
    expect(result.metrics.nodeCount).toBe(2); // root + child
    expect(result.metrics.withIdCount).toBe(2); // root和child都有id

    expect(result.debug).toBeDefined();
    expect(result.debug?.idList).toContain('root1');
    expect(result.debug?.idList).toContain('child1');

    console.log('E2E-PROC-04测试通过: 成功验证自定义结果类型支持');
  });

  // 性能测试: 大型文档处理
  test('性能测试: 大型文档处理', () => {
    // 生成大型文档
    let dpmlContent = '<root id="root">\n';
    const itemCount = 1000; // 生成1000个条目

    for (let i = 1; i <= itemCount; i++) {
      dpmlContent += `  <item id="item-${i}" index="${i}">\n`;
      dpmlContent += `    <name>Item ${i}</name>\n`;
      dpmlContent += `    <description>This is description for item ${i}</description>\n`;
      dpmlContent += `    <properties>\n`;

      // 每个条目添加5个属性
      for (let j = 1; j <= 5; j++) {
        dpmlContent += `      <property name="prop-${j}">Property ${j} value for item ${i}</property>\n`;
      }

      dpmlContent += `    </properties>\n`;
      dpmlContent += `  </item>\n`;
    }

    dpmlContent += '</root>';

    const largeDocSize = dpmlContent.length;

    console.log(`生成了 ${largeDocSize / 1024} KB 大小的文档，包含 ${itemCount} 个条目`);

    // 简单Schema
    const schemaContent = { root: { element: 'root' } };

    // 测量性能
    console.log('开始处理大型文档...');
    const startTime = performance.now();

    // 解析
    const parseStartTime = performance.now();
    const document = ensureDPMLDocument(parse(dpmlContent));
    const parseEndTime = performance.now();

    // 解析Schema
    const schema = processSchema(schemaContent);

    // 处理
    const processStartTime = performance.now();
    const result = processDocument(document, schema);
    const processEndTime = performance.now();

    const totalTime = performance.now() - startTime;
    const parseTime = parseEndTime - parseStartTime;
    const processTime = processEndTime - processStartTime;

    console.log(`大型文档处理完成:`);
    console.log(`- 总耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`- 解析耗时: ${parseTime.toFixed(2)}ms (${(parseTime / totalTime * 100).toFixed(1)}%)`);
    console.log(`- 处理耗时: ${processTime.toFixed(2)}ms (${(processTime / totalTime * 100).toFixed(1)}%)`);
    console.log(`- 处理速度: ${(largeDocSize / 1024 / (totalTime / 1000)).toFixed(2)} KB/s`);

    // ID映射统计
    const idMapSize = result.references?.idMap.size || 0;

    console.log(`- ID映射大小: ${idMapSize} 个条目`);

    // 性能断言
    expect(result.validation.isValid).toBe(true);
    expect(idMapSize).toBe(itemCount + 1); // items + root

    // 内存使用可以通过 Node.js 的 process.memoryUsage() 获取，但在浏览器环境中不可用
    // 这里我们只断言处理成功，不进行内存使用断言

    // 如果在合理时间内完成处理，测试通过
    expect(totalTime).toBeLessThan(5000); // 大文档处理应在5秒内完成

    console.log('性能测试通过: 成功处理大型文档');
  });
});
