import { NodeType, isElement } from '../../types/node';

import type { Element } from '../../types/node';

describe('Element with metadata', () => {
  it('should allow adding metadata to an element', () => {
    // 创建一个带有metadata字段的元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test',
      attributes: {},
      children: [],
      metadata: {}, // 初始为空对象
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
    };

    // 测试添加元数据
    element.metadata!.semanticType = 'prompt';
    element.metadata!.processed = true;

    // 验证元数据是否正确添加
    expect(element.metadata!.semanticType).toBe('prompt');
    expect(element.metadata!.processed).toBe(true);
  });

  it('should not break existing isElement function with metadata field', () => {
    // 创建一个带有metadata字段的元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test',
      attributes: {},
      children: [],
      metadata: {
        semanticType: 'prompt',
      },
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
    };

    // 验证isElement函数仍然能正确识别带有metadata的元素
    expect(isElement(element)).toBe(true);
  });

  it('should allow nested metadata objects', () => {
    // 创建一个带有嵌套元数据的元素
    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test',
      attributes: {},
      children: [],
      metadata: {
        semantic: {
          type: 'prompt',
          model: {
            name: 'gpt-4',
            temperature: 0.7,
          },
        },
      },
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 10, offset: 9 },
      },
    };

    // 验证嵌套元数据是否正确
    expect(element.metadata!.semantic.type).toBe('prompt');
    expect(element.metadata!.semantic.model.name).toBe('gpt-4');
    expect(element.metadata!.semantic.model.temperature).toBe(0.7);
  });
});
