import { describe, test, expect } from 'vitest';

import { parse } from '../../../api/parser';
import { processDocument } from '../../../api/processing';
import { processSchema } from '../../../api/schema';
import type { DPMLDocument, ProcessingResult, ValidationResult, ParseResult } from '../../../types';

/**
 * 处理流程集成测试
 * 测试处理模块的完整流程，包括验证和引用映射构建
 */
describe('Processing Flow Integration Tests', () => {
  // 辅助函数：处理parse函数的返回值
  function ensureDPMLDocument(result: DPMLDocument | ParseResult<DPMLDocument>): DPMLDocument {
    if ('document' in result && result.document) {
      return result.document as DPMLDocument;
    }

    return result as DPMLDocument;
  }

  // IT-PROC-01: 处理服务应协调验证器处理有效文档
  test('IT-PROC-01: 处理服务应协调验证器处理有效文档', () => {
    // 步骤1: 解析有效DPML文档
    const dpmlContent = `
      <button type="submit" id="submit-btn">提交</button>
    `;
    const parseResult = parse(dpmlContent);
    const document = ensureDPMLDocument(parseResult);

    // 步骤2: 解析有效Schema
    const schemaContent = {
      root: {
        element: 'button',
        attributes: [
          { name: 'type', enum: ['submit', 'reset', 'button'] },
          { name: 'id', required: true }
        ],
        content: { type: 'text', required: false }
      }
    };
    const schema = processSchema(schemaContent);

    // 步骤3: 处理文档
    const result = processDocument(document, schema);

    // 验证结果
    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document).toBe(document);
    expect(result.schema).toBe(schema);

    // 验证验证结果
    expect(result.validation).toBeDefined();
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.errors.length).toBe(0);

    // 验证引用映射
    expect(result.references).toBeDefined();
    expect(result.references?.idMap.size).toBe(1);
    expect(result.references?.idMap.has('submit-btn')).toBe(true);

    // 验证映射的节点
    const buttonNode = result.references?.idMap.get('submit-btn');

    expect(buttonNode).toBeDefined();
    expect(buttonNode?.tagName).toBe('button');
    expect(buttonNode?.attributes.get('type')).toBe('submit');
  });

  // IT-PROC-02: 处理服务应协调验证器处理无效文档
  test('IT-PROC-02: 处理服务应协调验证器处理无效文档', () => {
    // 步骤1: 解析无效DPML文档（缺少必需的属性）
    const dpmlContent = `
      <button>提交</button>
    `;
    const parseResult = parse(dpmlContent);
    const document = ensureDPMLDocument(parseResult);

    // 步骤2: 解析Schema（要求button必须有id和type属性）
    const schemaContent = {
      root: {
        element: 'button',
        attributes: [
          { name: 'type', required: true, enum: ['submit', 'reset', 'button'] },
          { name: 'id', required: true }
        ],
        content: { type: 'text', required: false }
      }
    };
    const schema = processSchema(schemaContent);

    // 步骤3: 处理文档
    const result = processDocument(document, schema);

    // 验证验证结果
    expect(result.validation).toBeDefined();
    expect(result.validation.isValid).toBe(false);
    expect(result.validation.errors.length).toBeGreaterThan(0);

    // 验证包含正确的错误信息
    const hasTypeError = result.validation.errors.some(
      error => error.path.includes('type') && error.code === 'MISSING_REQUIRED_ATTRIBUTE'
    );
    const hasIdError = result.validation.errors.some(
      error => error.path.includes('id') && error.code === 'MISSING_REQUIRED_ATTRIBUTE'
    );

    expect(hasTypeError).toBe(true);
    expect(hasIdError).toBe(true);

    // 验证引用映射（应为空，因为文档中没有ID）
    expect(result.references).toBeDefined();
    expect(result.references?.idMap.size).toBe(0);
  });

  // IT-PROC-03: 处理服务应处理复杂文档结构
  test('IT-PROC-03: 处理服务应处理复杂文档结构', () => {
    // 步骤1: 解析复杂DPML文档
    const dpmlContent = `
      <form id="contact-form">
        <input type="text" id="name" label="姓名" />
        <input type="email" id="email" label="邮箱" />
        <textarea id="message" rows="5">留言内容</textarea>
        <button type="submit" id="submit-btn">提交</button>
      </form>
    `;
    const parseResult = parse(dpmlContent);
    const document = ensureDPMLDocument(parseResult);

    // 步骤2: 解析对应的Schema
    const schemaContent = {
      root: {
        element: 'form',
        attributes: [
          { name: 'id', required: true }
        ],
        children: {
          elements: [
            { element: 'input' },
            { element: 'textarea' },
            { element: 'button' }
          ]
        }
      },
      types: [
        {
          element: 'input',
          attributes: [
            { name: 'type', required: true },
            { name: 'id', required: true },
            { name: 'label', required: false }
          ]
        },
        {
          element: 'textarea',
          attributes: [
            { name: 'id', required: true },
            { name: 'rows', required: false }
          ],
          content: { type: 'text', required: false }
        },
        {
          element: 'button',
          attributes: [
            { name: 'type', enum: ['submit', 'reset', 'button'] },
            { name: 'id', required: true }
          ],
          content: { type: 'text', required: false }
        }
      ]
    };
    const schema = processSchema(schemaContent);

    // 步骤3: 处理文档
    const result = processDocument(document, schema);

    // 验证验证结果
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.errors.length).toBe(0);

    // 验证引用映射
    expect(result.references).toBeDefined();
    expect(result.references?.idMap.size).toBe(5); // form, name, email, message, submit-btn

    // 验证可以通过ID访问节点
    const formNode = result.references?.idMap.get('contact-form');
    const nameNode = result.references?.idMap.get('name');
    const emailNode = result.references?.idMap.get('email');
    const messageNode = result.references?.idMap.get('message');
    const submitNode = result.references?.idMap.get('submit-btn');

    expect(formNode?.tagName).toBe('form');
    expect(nameNode?.tagName).toBe('input');
    expect(nameNode?.attributes.get('label')).toBe('姓名');
    expect(emailNode?.tagName).toBe('input');
    expect(emailNode?.attributes.get('type')).toBe('email');
    expect(messageNode?.tagName).toBe('textarea');
    expect(messageNode?.content).toBe('留言内容');
    expect(submitNode?.tagName).toBe('button');
    expect(submitNode?.attributes.get('type')).toBe('submit');

    // 验证层次结构
    expect(nameNode?.parent).toBe(formNode);
    expect(emailNode?.parent).toBe(formNode);
    expect(messageNode?.parent).toBe(formNode);
    expect(submitNode?.parent).toBe(formNode);
  });

  // IT-PROC-04: 处理服务应正确构建引用映射
  test('IT-PROC-04: 处理服务应正确构建引用映射', () => {
    // 步骤1: 解析带有多个ID的DPML文档
    const dpmlContent = `
      <root id="root-node">
        <section id="section-1">
          <heading id="heading-1">第一部分</heading>
          <paragraph id="para-1">这是第一段。</paragraph>
        </section>
        <section id="section-2">
          <heading id="heading-2">第二部分</heading>
          <paragraph id="para-2">这是第二段。</paragraph>
          <list id="list-1">
            <item id="item-1">项目1</item>
            <item id="item-2">项目2</item>
          </list>
        </section>
      </root>
    `;
    const parseResult = parse(dpmlContent);
    const document = ensureDPMLDocument(parseResult);

    // 步骤2: 使用简单Schema
    const schemaContent = {
      root: { element: 'root' }
    };
    const schema = processSchema(schemaContent);

    // 步骤3: 处理文档
    const result = processDocument(document, schema);

    // 验证引用映射
    expect(result.references).toBeDefined();
    expect(result.references?.idMap.size).toBe(10); // 所有带ID的节点

    // 验证所有ID都被正确映射
    const expectedIds = [
      'root-node', 'section-1', 'heading-1', 'para-1',
      'section-2', 'heading-2', 'para-2', 'list-1',
      'item-1', 'item-2'
    ];

    expectedIds.forEach(id => {
      expect(result.references?.idMap.has(id)).toBe(true);
      const node = result.references?.idMap.get(id);

      expect(node?.attributes.get('id')).toBe(id);
    });

    // 验证特定节点的内容和属性
    expect(result.references?.idMap.get('heading-1')?.content).toBe('第一部分');
    expect(result.references?.idMap.get('para-2')?.content).toBe('这是第二段。');
    expect(result.references?.idMap.get('item-1')?.content).toBe('项目1');

    // 验证节点层次结构
    const rootNode = result.references?.idMap.get('root-node');
    const section1 = result.references?.idMap.get('section-1');
    const section2 = result.references?.idMap.get('section-2');
    const list1 = result.references?.idMap.get('list-1');
    const item1 = result.references?.idMap.get('item-1');

    expect(section1?.parent).toBe(rootNode);
    expect(section2?.parent).toBe(rootNode);
    expect(list1?.parent).toBe(section2);
    expect(item1?.parent).toBe(list1);
  });

  // 测试自定义结果类型
  test('处理服务应支持自定义结果类型', () => {
    // 定义扩展的ProcessingResult接口
    interface ExtendedProcessingResult extends ProcessingResult {
      custom: {
        timestamp: number;
        processingInfo: {
          processedDate: string;
          nodeCount: number;
        };
      };
    }

    // 解析简单文档
    const parseResult = parse('<root id="root1"></root>');
    const document = ensureDPMLDocument(parseResult);
    const schema = processSchema({ root: { element: 'root' } });

    // 处理文档并使用类型转换添加自定义属性
    const baseResult = processDocument(document, schema);
    const result = baseResult as ExtendedProcessingResult;

    // 添加自定义属性
    result.custom = {
      timestamp: Date.now(),
      processingInfo: {
        processedDate: new Date().toISOString(),
        nodeCount: 1
      }
    };

    // 验证基本属性
    expect(result.validation.isValid).toBe(true);
    expect(result.references?.idMap.size).toBe(1);

    // 验证自定义属性
    expect(result.custom).toBeDefined();
    expect(typeof result.custom.timestamp).toBe('number');
    expect(result.custom.processingInfo.nodeCount).toBe(1);
    expect(typeof result.custom.processingInfo.processedDate).toBe('string');
  });
});
