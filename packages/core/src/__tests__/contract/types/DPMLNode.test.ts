/**
 * DPMLNode接口契约测试
 */
import { describe, test, expect } from 'vitest';

import type { DPMLNode } from '../../../types';

// 为了测试而创建的模拟实现
function createMockNode(): DPMLNode {
  return {
    tagName: 'test',
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
    setId: (id) => {},
    getId: () => null,
    hasId: () => false,
    getAttributeValue: (name) => null,
    hasAttribute: (name) => false,
    setAttribute: (name, value) => {},
    appendChild: (node) => {},
    removeChild: (node) => {},
    hasChildren: () => false,
    hasContent: () => false
  };
}

describe('CT-DPMLNode-Structure', () => {
  // CP-05: 节点对象结构验证
  test('should have all required properties', () => {
    const node = createMockNode();

    // 验证属性存在性
    expect(node).toHaveProperty('tagName');
    expect(node).toHaveProperty('id');
    expect(node).toHaveProperty('attributes');
    expect(node).toHaveProperty('children');
    expect(node).toHaveProperty('content');
    expect(node).toHaveProperty('parent');
    expect(node).toHaveProperty('sourceLocation');

    // 验证属性类型
    expect(typeof node.tagName).toBe('string');
    expect(node.id === null || typeof node.id === 'string').toBe(true);
    expect(node.attributes instanceof Map).toBe(true);
    expect(Array.isArray(node.children)).toBe(true);
    expect(typeof node.content).toBe('string');
    expect(node.parent === null || typeof node.parent === 'object').toBe(true);
    expect(typeof node.sourceLocation).toBe('object');
    expect(typeof node.sourceLocation.startLine).toBe('number');
  });

  test('should have all required methods', () => {
    const node = createMockNode();

    // 验证方法存在性和类型
    expect(typeof node.setId).toBe('function');
    expect(typeof node.getId).toBe('function');
    expect(typeof node.hasId).toBe('function');
    expect(typeof node.getAttributeValue).toBe('function');
    expect(typeof node.hasAttribute).toBe('function');
    expect(typeof node.setAttribute).toBe('function');
    expect(typeof node.appendChild).toBe('function');
    expect(typeof node.removeChild).toBe('function');
    expect(typeof node.hasChildren).toBe('function');
    expect(typeof node.hasContent).toBe('function');
  });

  test('should have methods with correct signatures', () => {
    const node = createMockNode();

    // 验证方法返回类型
    expect(typeof node.hasId()).toBe('boolean');
    expect(node.getId() === null || typeof node.getId() === 'string').toBe(true);
    expect(node.getAttributeValue('test') === null || typeof node.getAttributeValue('test') === 'string').toBe(true);
    expect(typeof node.hasAttribute('test')).toBe('boolean');
    expect(typeof node.hasChildren()).toBe('boolean');
    expect(typeof node.hasContent()).toBe('boolean');

    // 验证方法行为 (可以用不会引起实际副作用的方式)
    node.setId('test-id');
    node.setAttribute('attr', 'value');
    node.appendChild(createMockNode());
    node.removeChild(createMockNode());
  });
});
