/**
 * SelectorEngine单元测试
 */
import { describe, test, expect } from 'vitest';

import { SelectorEngine } from '../../../../core/parser/SelectorEngine';
import type { DPMLNode, SourceLocation } from '../../../../types';

describe('UT-Parser-Selectors', () => {
  // 创建测试用的DPMLNode
  function createMockNode(
    tagName: string,
    id: string | null = null,
    content: string = '',
    attributes: Map<string, string> = new Map(),
    children: DPMLNode[] = []
  ): DPMLNode {
    const sourceLocation: SourceLocation = {
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 1,
      getLineSnippet: () => ''
    };

    const node: DPMLNode = {
      tagName,
      id,
      attributes: new Map(attributes),
      children: [...children],
      content,
      parent: null,
      sourceLocation,

      setId(newId: string): void {
        this.id = newId;
      },

      getId(): string | null {
        return this.id;
      },

      hasId(): boolean {
        return this.id !== null;
      },

      getAttributeValue(name: string): string | null {
        return this.attributes.get(name) || null;
      },

      hasAttribute(name: string): boolean {
        return this.attributes.has(name);
      },

      setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
      },

      appendChild(childNode: DPMLNode): void {
        this.children.push(childNode);
        childNode.parent = this;
      },

      removeChild(childNode: DPMLNode): void {
        const index = this.children.indexOf(childNode);

        if (index !== -1) {
          this.children.splice(index, 1);
          childNode.parent = null;
        }
      },

      hasChildren(): boolean {
        return this.children.length > 0;
      },

      hasContent(): boolean {
        return this.content !== '';
      }
    };

    // 设置子节点的父节点引用
    for (const child of children) {
      child.parent = node;
    }

    return node;
  }

  test('should select nodes by tag name', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div');
    const child2 = createMockNode('div');
    const child3 = createMockNode('span');
    const rootNode = createMockNode('root', null, '', new Map(), [child1, child2, child3]);

    const divNodes = engine.querySelectorAll(rootNode, 'div');

    expect(divNodes).toHaveLength(2);
    expect(divNodes).toContain(child1);
    expect(divNodes).toContain(child2);

    const spanNodes = engine.querySelectorAll(rootNode, 'span');

    expect(spanNodes).toHaveLength(1);
    expect(spanNodes[0]).toBe(child3);

    const rootNodes = engine.querySelectorAll(rootNode, 'root');

    expect(rootNodes).toHaveLength(1);
    expect(rootNodes[0]).toBe(rootNode);
  });

  test('should select nodes by ID', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1');
    const child2 = createMockNode('div', 'div2');
    const child3 = createMockNode('span', 'span1');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const div1Node = engine.querySelector(rootNode, '#div1');

    expect(div1Node).toBe(child1);

    const div2Node = engine.querySelector(rootNode, '#div2');

    expect(div2Node).toBe(child2);

    const span1Node = engine.querySelector(rootNode, '#span1');

    expect(span1Node).toBe(child3);

    const rootNode2 = engine.querySelector(rootNode, '#root1');

    expect(rootNode2).toBe(rootNode);

    const nonexistentNode = engine.querySelector(rootNode, '#nonexistent');

    expect(nonexistentNode).toBeNull();
  });

  test('should select nodes by class', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1', '', new Map([['class', 'item active']]));
    const child2 = createMockNode('div', 'div2', '', new Map([['class', 'item']]));
    const child3 = createMockNode('span', 'span1', '', new Map([['class', 'active']]));
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const itemNodes = engine.querySelectorAll(rootNode, '.item');

    expect(itemNodes).toHaveLength(2);
    expect(itemNodes).toContain(child1);
    expect(itemNodes).toContain(child2);

    const activeNodes = engine.querySelectorAll(rootNode, '.active');

    expect(activeNodes).toHaveLength(2);
    expect(activeNodes).toContain(child1);
    expect(activeNodes).toContain(child3);
  });

  test('should select nodes by attribute existence', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1', '', new Map([['data-test', 'value']]));
    const child2 = createMockNode('div', 'div2');
    const child3 = createMockNode('span', 'span1', '', new Map([['data-test', 'other']]));
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const dataTestNodes = engine.querySelectorAll(rootNode, '[data-test]');

    expect(dataTestNodes).toHaveLength(2);
    expect(dataTestNodes).toContain(child1);
    expect(dataTestNodes).toContain(child3);
  });

  test('should select nodes by attribute value', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1', '', new Map([['data-test', 'value']]));
    const child2 = createMockNode('div', 'div2', '', new Map([['data-test', 'other']]));
    const child3 = createMockNode('span', 'span1', '', new Map([['data-test', 'value']]));
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const valueNodes = engine.querySelectorAll(rootNode, '[data-test=value]');

    expect(valueNodes).toHaveLength(2);
    expect(valueNodes).toContain(child1);
    expect(valueNodes).toContain(child3);

    const otherNodes = engine.querySelectorAll(rootNode, '[data-test=other]');

    expect(otherNodes).toHaveLength(1);
    expect(otherNodes[0]).toBe(child2);
  });

  test('should select nodes by attribute prefix', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1', '', new Map([['data-test', 'value-1']]));
    const child2 = createMockNode('div', 'div2', '', new Map([['data-test', 'other']]));
    const child3 = createMockNode('span', 'span1', '', new Map([['data-test', 'value-2']]));
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const valueNodes = engine.querySelectorAll(rootNode, '[data-test^=value]');

    expect(valueNodes).toHaveLength(2);
    expect(valueNodes).toContain(child1);
    expect(valueNodes).toContain(child3);
  });

  test('should select nodes by attribute suffix', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1', '', new Map([['data-test', 'prefix-1']]));
    const child2 = createMockNode('div', 'div2', '', new Map([['data-test', 'other']]));
    const child3 = createMockNode('span', 'span1', '', new Map([['data-test', 'prefix-2']]));
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const valueNodes = engine.querySelectorAll(rootNode, '[data-test$=-1]');

    expect(valueNodes).toHaveLength(1);
    expect(valueNodes[0]).toBe(child1);

    const otherNodes = engine.querySelectorAll(rootNode, '[data-test$=-2]');

    expect(otherNodes).toHaveLength(1);
    expect(otherNodes[0]).toBe(child3);
  });

  test('should select nodes by attribute contains', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1', '', new Map([['data-test', 'abc-xyz-123']]));
    const child2 = createMockNode('div', 'div2', '', new Map([['data-test', 'other']]));
    const child3 = createMockNode('span', 'span1', '', new Map([['data-test', 'xyz-abc']]));
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const xyzNodes = engine.querySelectorAll(rootNode, '[data-test*=xyz]');

    expect(xyzNodes).toHaveLength(2);
    expect(xyzNodes).toContain(child1);
    expect(xyzNodes).toContain(child3);

    const abcNodes = engine.querySelectorAll(rootNode, '[data-test*=abc]');

    expect(abcNodes).toHaveLength(2);
    expect(abcNodes).toContain(child1);
    expect(abcNodes).toContain(child3);

    const otherNodes = engine.querySelectorAll(rootNode, '[data-test*=other]');

    expect(otherNodes).toHaveLength(1);
    expect(otherNodes[0]).toBe(child2);
  });

  test('should select nodes by wildcard', () => {
    const engine = new SelectorEngine();

    const child1 = createMockNode('div', 'div1');
    const child2 = createMockNode('div', 'div2');
    const child3 = createMockNode('span', 'span1');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, child3]);

    const allNodes = engine.querySelectorAll(rootNode, '*');

    expect(allNodes).toHaveLength(4); // root + 3 children
    expect(allNodes).toContain(rootNode);
    expect(allNodes).toContain(child1);
    expect(allNodes).toContain(child2);
    expect(allNodes).toContain(child3);
  });
});
