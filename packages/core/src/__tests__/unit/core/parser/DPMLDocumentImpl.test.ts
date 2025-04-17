/**
 * DPMLDocumentImpl单元测试
 */
import { describe, test, expect } from 'vitest';

import { DPMLDocumentImpl } from '../../../../core/parser/DPMLDocumentImpl';
import type { DPMLNode, SourceLocation } from '../../../../types';

describe('UT-Parser-DocRoot', () => {
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

  test('should create document with root node', () => {
    const rootNode = createMockNode('root');
    const document = new DPMLDocumentImpl(rootNode);

    expect(document.rootNode).toBe(rootNode);
    expect(document.nodesById.size).toBe(0);
  });

  test('should build node index for nodes with IDs', () => {
    const child1 = createMockNode('child', 'child1');
    const child2 = createMockNode('child', 'child2');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2]);

    const document = new DPMLDocumentImpl(rootNode);

    expect(document.nodesById.size).toBe(3);
    expect(document.getNodeById('root1')).toBe(rootNode);
    expect(document.getNodeById('child1')).toBe(child1);
    expect(document.getNodeById('child2')).toBe(child2);
    expect(document.getNodeById('nonexistent')).toBeNull();
  });

  test('should query nodes by tag name', () => {
    const child1 = createMockNode('child', 'child1');
    const child2 = createMockNode('child', 'child2');
    const div = createMockNode('div', 'div1');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, div]);

    const document = new DPMLDocumentImpl(rootNode);

    const rootNodes = document.querySelectorAll('root');

    expect(rootNodes).toHaveLength(1);
    expect(rootNodes[0]).toBe(rootNode);

    const childNodes = document.querySelectorAll('child');

    expect(childNodes).toHaveLength(2);
    expect(childNodes).toContain(child1);
    expect(childNodes).toContain(child2);

    const divNodes = document.querySelectorAll('div');

    expect(divNodes).toHaveLength(1);
    expect(divNodes[0]).toBe(div);

    const nonexistentNodes = document.querySelectorAll('nonexistent');

    expect(nonexistentNodes).toHaveLength(0);
  });

  test('should query nodes by ID selector', () => {
    const child1 = createMockNode('child', 'child1');
    const child2 = createMockNode('child', 'child2');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2]);

    const document = new DPMLDocumentImpl(rootNode);

    const rootNode2 = document.querySelector('#root1');

    expect(rootNode2).toBe(rootNode);

    const child1Node = document.querySelector('#child1');

    expect(child1Node).toBe(child1);

    const nonexistentNode = document.querySelector('#nonexistent');

    expect(nonexistentNode).toBeNull();
  });

  test('should serialize document to string', () => {
    const child = createMockNode('child', 'child1', 'Child content');
    const attributes = new Map([
      ['id', 'root1'],
      ['class', 'container']
    ]);
    const rootNode = createMockNode('root', 'root1', '', attributes, [child]);

    const document = new DPMLDocumentImpl(rootNode);
    const xml = document.toString();

    // 验证序列化结果包含预期的标签和属性
    expect(xml).toContain('<root');
    expect(xml).toContain('id="root1"');
    expect(xml).toContain('class="container"');
    expect(xml).toContain('<child');
    expect(xml).toContain('Child content');
    expect(xml).toContain('</child>');
    expect(xml).toContain('</root>');
  });

  test('should handle self-closing tags', () => {
    const emptyNode = createMockNode('empty', 'empty1');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [emptyNode]);

    const document = new DPMLDocumentImpl(rootNode);
    const xml = document.toString();

    // 验证空节点使用自闭合标签
    expect(xml).toContain('<empty');
    expect(xml).toContain('/>');
  });

  test('should escape XML special characters', () => {
    const child = createMockNode('child', 'child1', 'Content with <special> & "characters"');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child]);

    const document = new DPMLDocumentImpl(rootNode);
    const xml = document.toString();

    // 验证特殊字符被正确转义
    expect(xml).toContain('Content with &lt;special&gt; &amp; &quot;characters&quot;');
    expect(xml).not.toContain('<special>');
  });

  test('should handle multi-line content', () => {
    const child = createMockNode('child', 'child1', 'Line 1\nLine 2\nLine 3');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child]);

    const document = new DPMLDocumentImpl(rootNode);
    const xml = document.toString();

    // 验证多行内容被正确处理
    expect(xml).toContain('Line 1');
    expect(xml).toContain('Line 2');
    expect(xml).toContain('Line 3');
  });

  test('should query all nodes with wildcard selector', () => {
    const child1 = createMockNode('child', 'child1');
    const child2 = createMockNode('child', 'child2');
    const div = createMockNode('div', 'div1');
    const rootNode = createMockNode('root', 'root1', '', new Map(), [child1, child2, div]);

    const document = new DPMLDocumentImpl(rootNode);

    const allNodes = document.querySelectorAll('*');

    // 应该包含所有节点（根节点 + 3个子节点）
    expect(allNodes).toHaveLength(4);
    expect(allNodes).toContain(rootNode);
    expect(allNodes).toContain(child1);
    expect(allNodes).toContain(child2);
    expect(allNodes).toContain(div);
  });
});
