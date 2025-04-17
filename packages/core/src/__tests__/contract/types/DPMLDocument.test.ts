/**
 * DPMLDocument接口契约测试
 */
import { describe, test, expect } from 'vitest';

import type { DPMLDocument, DPMLNode } from '../../../types';

// 为了测试而创建的模拟实现
function createMockDocument(): DPMLDocument {
  const node: DPMLNode = {
    tagName: 'root',
    id: null,
    attributes: new Map(),
    children: [],
    content: '',
    parent: null,
    sourceLocation: {
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 12,
      getLineSnippet: () => ''
    },
    setId: () => {},
    getId: () => null,
    hasId: () => false,
    getAttributeValue: () => null,
    hasAttribute: () => false,
    setAttribute: () => {},
    appendChild: () => {},
    removeChild: () => {},
    hasChildren: () => false,
    hasContent: () => false
  };

  return {
    rootNode: node,
    nodesById: new Map(),
    getNodeById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    toString: () => ''
  };
}

describe('CT-DPMLDocument-Structure', () => {
  // CP-04: 文档对象结构验证
  test('should have all required properties and methods', () => {
    const document = createMockDocument();

    // 验证必要属性
    expect(document).toHaveProperty('rootNode');
    expect(document).toHaveProperty('nodesById');

    // 验证必要方法
    expect(typeof document.getNodeById).toBe('function');
    expect(typeof document.querySelector).toBe('function');
    expect(typeof document.querySelectorAll).toBe('function');
    expect(typeof document.toString).toBe('function');

    // 验证方法返回类型
    expect(document.querySelectorAll('*')).toBeInstanceOf(Array);
  });

  test('should have methods with correct signatures', () => {
    const document = createMockDocument();

    // getNodeById(id: string): DPMLNode | null
    const nodeById = document.getNodeById('test');

    expect(nodeById === null || typeof nodeById === 'object').toBe(true);

    // querySelector(selector: string): DPMLNode | null
    const selectedNode = document.querySelector('test');

    expect(selectedNode === null || typeof selectedNode === 'object').toBe(true);

    // querySelectorAll(selector: string): DPMLNode[]
    const selectedNodes = document.querySelectorAll('test');

    expect(Array.isArray(selectedNodes)).toBe(true);

    // toString(): string
    const docString = document.toString();

    expect(typeof docString).toBe('string');
  });
});
