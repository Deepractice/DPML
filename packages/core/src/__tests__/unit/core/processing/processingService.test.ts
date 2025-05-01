import { describe, test, expect } from 'vitest';

import { buildIdMap, processDocument } from '../../../../core/processing/processingService';
import type { DPMLDocument, DPMLNode, ProcessingResult, ProcessedSchema } from '../../../../types';

describe('UT-PROCSRV', () => {
  // 测试用例UT-PROCSRV-01: processDocument应返回正确结构的结果
  describe('UT-PROCSRV-01: processDocument应返回正确结构的结果', () => {
    test('应返回包含所有必需属性的结果', () => {
      // 创建测试节点
      const childNode: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child1']]),
        children: [],
        content: '子节点',
        parent: null, // 临时设置
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 15
        }
      };

      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map([]),
        children: [childNode],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 3,
          endColumn: 10
        }
      };

      // 设置父子关系
      Object.defineProperty(childNode, 'parent', { value: rootNode, writable: false });

      // 创建文档和Schema
      const document: DPMLDocument = {
        rootNode,
        metadata: { title: '测试文档' }
      };

      const schema: ProcessedSchema<any> = {
        schema: {
          root: { element: 'root' },
          types: [
            {
              element: 'child',
              attributes: [
                { name: 'id', required: true }
              ]
            }
          ]
        },
        isValid: true
      };

      // 处理文档
      const result = processDocument(document, schema);

      // 验证结果结构
      expect(result).toBeDefined();

      // 验证基本属性
      expect(result.document).toBe(document);
      expect(result.schema).toBe(schema);

      // 验证验证结果
      expect(result.validation).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.validation!.errors)).toBe(true);
      expect(Array.isArray(result.validation!.warnings)).toBe(true);

      // 验证引用映射
      expect(result.references).toBeDefined();
      expect(result.references?.idMap instanceof Map).toBe(true);
      expect(result.references?.idMap.get('child1')).toBe(childNode);
    });
  });

  // 测试用例UT-PROCSRV-02: processDocument应正确构建ID引用映射
  describe('UT-PROCSRV-02: processDocument应正确构建ID引用映射', () => {
    test('应在处理结果中包含正确的ID引用映射', () => {
      // 创建测试节点
      const child1: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child1']]),
        children: [],
        content: '子节点1',
        parent: null,
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 15
        }
      };

      const child2: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child2']]),
        children: [],
        content: '子节点2',
        parent: null,
        sourceLocation: {
          startLine: 3,
          startColumn: 1,
          endLine: 3,
          endColumn: 15
        }
      };

      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map([['id', 'root1']]),
        children: [child1, child2],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 4,
          endColumn: 10
        }
      };

      // 设置父子关系
      Object.defineProperty(child1, 'parent', { value: rootNode, writable: false });
      Object.defineProperty(child2, 'parent', { value: rootNode, writable: false });

      // 创建文档和Schema
      const document: DPMLDocument = {
        rootNode,
        metadata: {}
      };

      const schema: ProcessedSchema<any> = {
        schema: { root: { element: 'root' } },
        isValid: true
      };

      // 处理文档
      const result = processDocument(document, schema);

      // 验证引用映射
      expect(result.references).toBeDefined();
      expect(result.references?.idMap.size).toBe(3);
      expect(result.references?.idMap.get('root1')).toBe(rootNode);
      expect(result.references?.idMap.get('child1')).toBe(child1);
      expect(result.references?.idMap.get('child2')).toBe(child2);
    });
  });

  // 测试用例UT-PROCSRV-03: processDocument应支持自定义结果类型
  describe('UT-PROCSRV-03: processDocument应支持自定义结果类型', () => {
    test('应支持使用泛型扩展结果类型', () => {
      // 定义自定义结果类型
      interface CustomProcessingResult extends ProcessingResult {
        readonly custom: {
          readonly processTime: number;
          readonly processedNodes: number;
        };
      }

      // 创建简单文档和Schema
      const document: DPMLDocument = {
        rootNode: {
          tagName: 'root',
          attributes: new Map([]),
          children: [],
          content: '',
          parent: null,
          sourceLocation: {
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 10
          }
        },
        metadata: {}
      };

      const schema: ProcessedSchema<any> = {
        schema: { root: { element: 'root' } },
        isValid: true
      };

      // 处理文档，使用自定义类型和类型转换
      const result = processDocument(document, schema) as CustomProcessingResult & {
        custom: {
          processTime: number;
          processedNodes: number;
        };
      };

      // 添加自定义字段
      result.custom = {
        processTime: 123,
        processedNodes: 1
      };

      // 验证标准字段
      expect(result.document).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.references).toBeDefined();

      // 验证自定义字段
      expect(result.custom).toBeDefined();
      expect(result.custom.processTime).toBe(123);
      expect(result.custom.processedNodes).toBe(1);
    });
  });

  // 测试用例UT-PROCSRV-04: buildIdMap应正确构建ID到节点的映射
  describe('UT-PROCSRV-04: buildIdMap应正确构建ID到节点的映射', () => {
    test('应为带ID的节点创建映射', () => {
      // 创建测试节点
      const child1: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child1']]),
        children: [],
        content: '子节点1',
        parent: null, // 临时设置，后面会正确关联
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 15
        }
      };

      const child2: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child2']]),
        children: [],
        content: '子节点2',
        parent: null, // 临时设置，后面会正确关联
        sourceLocation: {
          startLine: 3,
          startColumn: 1,
          endLine: 3,
          endColumn: 15
        }
      };

      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map([['id', 'root1']]),
        children: [child1, child2],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 4,
          endColumn: 10
        }
      };

      // 设置父子关系
      Object.defineProperty(child1, 'parent', { value: rootNode, writable: false });
      Object.defineProperty(child2, 'parent', { value: rootNode, writable: false });

      // 创建文档
      const document: DPMLDocument = {
        rootNode,
        metadata: {}
      };

      // 构建ID映射
      const idMap = buildIdMap(document);

      // 验证映射结果
      expect(idMap.size).toBe(3);
      expect(idMap.get('root1')).toBe(rootNode);
      expect(idMap.get('child1')).toBe(child1);
      expect(idMap.get('child2')).toBe(child2);
    });
  });

  // 测试用例UT-PROCSRV-05: buildIdMap应处理重复ID
  describe('UT-PROCSRV-05: buildIdMap应处理重复ID', () => {
    test('当存在重复ID时，应保留第一个出现的节点', () => {
      // 创建测试节点，包含重复ID
      const child1: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'duplicate']]),
        children: [],
        content: '第一个节点',
        parent: null, // 临时设置
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 15
        }
      };

      const child2: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'duplicate']]), // 重复ID
        children: [],
        content: '第二个节点',
        parent: null, // 临时设置
        sourceLocation: {
          startLine: 3,
          startColumn: 1,
          endLine: 3,
          endColumn: 15
        }
      };

      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map([]),
        children: [child1, child2],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 4,
          endColumn: 10
        }
      };

      // 设置父子关系
      Object.defineProperty(child1, 'parent', { value: rootNode, writable: false });
      Object.defineProperty(child2, 'parent', { value: rootNode, writable: false });

      // 创建文档
      const document: DPMLDocument = {
        rootNode,
        metadata: {}
      };

      // 构建ID映射
      const idMap = buildIdMap(document);

      // 验证映射结果 - 只应包含第一个重复ID的节点
      expect(idMap.size).toBe(1);
      expect(idMap.get('duplicate')).toBe(child1); // 应返回第一个出现的节点
      expect(idMap.get('duplicate')).not.toBe(child2);

      // 验证映射的节点内容
      const mappedNode = idMap.get('duplicate');

      expect(mappedNode?.content).toBe('第一个节点');
    });
  });

  // 测试用例UT-PROCSRV-06: buildIdMap应忽略无ID节点
  describe('UT-PROCSRV-06: buildIdMap应忽略无ID节点', () => {
    test('应忽略没有ID属性的节点', () => {
      // 创建测试节点，包含带ID和无ID的节点
      const childWithId: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['id', 'child1']]),
        children: [],
        content: '带ID节点',
        parent: null, // 临时设置
        sourceLocation: {
          startLine: 2,
          startColumn: 1,
          endLine: 2,
          endColumn: 15
        }
      };

      const childWithoutId: DPMLNode = {
        tagName: 'child',
        attributes: new Map([['class', 'test']]), // 没有ID属性
        children: [],
        content: '无ID节点',
        parent: null, // 临时设置
        sourceLocation: {
          startLine: 3,
          startColumn: 1,
          endLine: 3,
          endColumn: 15
        }
      };

      const rootNode: DPMLNode = {
        tagName: 'root',
        attributes: new Map([]), // 根节点无ID
        children: [childWithId, childWithoutId],
        content: '',
        parent: null,
        sourceLocation: {
          startLine: 1,
          startColumn: 1,
          endLine: 4,
          endColumn: 10
        }
      };

      // 设置父子关系
      Object.defineProperty(childWithId, 'parent', { value: rootNode, writable: false });
      Object.defineProperty(childWithoutId, 'parent', { value: rootNode, writable: false });

      // 创建文档
      const document: DPMLDocument = {
        rootNode,
        metadata: {}
      };

      // 构建ID映射
      const idMap = buildIdMap(document);

      // 验证映射结果 - 只应包含带ID的节点
      expect(idMap.size).toBe(1);
      expect(idMap.get('child1')).toBe(childWithId);

      // 验证无ID节点未被包含
      const allValues = Array.from(idMap.values());

      expect(allValues).not.toContain(childWithoutId);
      expect(allValues).not.toContain(rootNode);
    });
  });
});
