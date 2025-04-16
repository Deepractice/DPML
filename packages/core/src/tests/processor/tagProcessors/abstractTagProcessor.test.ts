/**
 * AbstractTagProcessor单元测试
 *
 * 测试抽象标签处理器的基本功能和钩子方法
 */

import { ProcessingContext as ProcessingContextImpl } from '@core/processor/processingContext';
import { AbstractTagProcessor } from '@core/processor/tagProcessors/abstractTagProcessor';
import { NodeType, Node } from '@core/types/node';
import { describe, it, expect, vi } from 'vitest';

import type { ValidationError, ValidationWarning } from '@core/errors/types';
import type { ProcessingContext } from '@core/processor/interfaces';
import type { Element, Content, Document } from '@core/types/node';

// 创建一个具体的标签处理器实现，用于测试
class TestTagProcessor extends AbstractTagProcessor {
  readonly processorName = 'TestTagProcessor';
  readonly tagName = 'test';

  // 覆盖优先级进行测试
  priority = 5;

  protected processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Record<string, any> {
    // 简单地将属性复制到元数据
    return {
      testAttrs: attributes,
    };
  }

  // 覆盖验证方法进行测试
  protected validate(
    element: Element,
    context: ProcessingContext
  ): {
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 模拟验证逻辑 - 如果有required属性但值为空，添加错误
    if ('required' in element.attributes && !element.attributes.required) {
      errors.push({
        code: 'EMPTY_REQUIRED',
        message: 'required属性不能为空',
      });
    }

    // 模拟验证逻辑 - 如果有deprecated属性，添加警告
    if ('deprecated' in element.attributes) {
      warnings.push({
        code: 'DEPRECATED_ATTR',
        message: `${element.attributes.deprecated}属性已废弃`,
      });
    }

    return { errors, warnings };
  }

  // 覆盖后处理方法进行测试
  protected async postProcess(
    element: Element,
    context: ProcessingContext
  ): Promise<void> {
    // 在元数据中添加后处理标记
    element.metadata!.postProcessed = true;
  }
}

describe('AbstractTagProcessor', () => {
  // 创建基础的测试元素
  const createElement = (attributes: Record<string, any> = {}): Element => ({
    type: NodeType.ELEMENT,
    tagName: 'test',
    attributes,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 10, offset: 9 },
    },
  });

  // 创建模拟的处理上下文
  const createContext = (): ProcessingContext => {
    const document: Document = {
      type: NodeType.DOCUMENT,
      children: [],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 10, column: 1, offset: 100 },
      },
    };

    return new ProcessingContextImpl(document, '/test/path');
  };

  it('应该正确检测可处理的元素', () => {
    const processor = new TestTagProcessor();

    // 创建可处理的元素
    const testElement = createElement();

    // 创建不可处理的元素
    const otherElement: Element = {
      ...createElement(),
      tagName: 'other',
    };

    expect(processor.canProcess(testElement)).toBe(true);
    expect(processor.canProcess(otherElement)).toBe(false);
  });

  it('应该设置正确的优先级', () => {
    const processor = new TestTagProcessor();

    expect(processor.priority).toBe(5); // 测试子类是否正确设置优先级
  });

  it('应该处理基本属性并生成元数据', async () => {
    const processor = new TestTagProcessor();
    const element = createElement({
      id: 'test1',
      extends: 'id:base',
      name: 'Test Element',
      value: '42',
    });
    const context = createContext();

    const result = await processor.process(element, context);

    // 验证元数据是否正确生成
    expect(result.metadata).toBeDefined();
    expect(result.metadata!.test.id).toBe('test1');
    expect(result.metadata!.test.extends).toBe('id:base');
    expect(result.metadata!.test.testAttrs).toEqual({
      name: 'Test Element',
      value: '42',
    });
    expect(result.metadata!.processed).toBe(true);
    expect(result.metadata!.processorName).toBe('TestTagProcessor');
  });

  it('应该正确处理验证错误和警告', async () => {
    const processor = new TestTagProcessor();
    const element = createElement({
      required: '',
      deprecated: 'old-feature',
    });
    const context = createContext();

    const result = await processor.process(element, context);

    // 验证错误和警告是否正确添加到元数据
    expect(result.metadata!.validationErrors).toBeDefined();
    expect(result.metadata!.validationErrors!.length).toBe(1);
    expect(result.metadata!.validationErrors![0].code).toBe('EMPTY_REQUIRED');

    expect(result.metadata!.validationWarnings).toBeDefined();
    expect(result.metadata!.validationWarnings!.length).toBe(1);
    expect(result.metadata!.validationWarnings![0].code).toBe(
      'DEPRECATED_ATTR'
    );
  });

  it('应该调用后处理钩子', async () => {
    const processor = new TestTagProcessor();
    const element = createElement();
    const context = createContext();

    const result = await processor.process(element, context);

    // 验证后处理是否被调用
    expect(result.metadata!.postProcessed).toBe(true);
  });

  it('应该提取文本内容', () => {
    const processor = new TestTagProcessor();

    // 创建带内容的元素
    const element: Element = {
      ...createElement(),
      children: [
        {
          type: NodeType.CONTENT,
          value: 'Hello ',
          position: {
            start: { line: 1, column: 6, offset: 5 },
            end: { line: 1, column: 12, offset: 11 },
          },
        } as Content,
        {
          type: NodeType.CONTENT,
          value: 'World!',
          position: {
            start: { line: 1, column: 12, offset: 11 },
            end: { line: 1, column: 18, offset: 17 },
          },
        } as Content,
      ],
    };

    // 通过调用private方法测试
    const content = (processor as any).extractTextContent(element);

    expect(content).toBe('Hello World!');
  });

  it('应该查找子元素', () => {
    const processor = new TestTagProcessor();

    // 创建带子元素的元素
    const element: Element = {
      ...createElement(),
      children: [
        {
          type: NodeType.ELEMENT,
          tagName: 'child1',
          attributes: { id: 'first' },
          children: [],
          position: {
            start: { line: 2, column: 1, offset: 10 },
            end: { line: 2, column: 20, offset: 29 },
          },
        } as Element,
        {
          type: NodeType.ELEMENT,
          tagName: 'child2',
          attributes: {},
          children: [],
          position: {
            start: { line: 3, column: 1, offset: 30 },
            end: { line: 3, column: 20, offset: 49 },
          },
        } as Element,
        {
          type: NodeType.ELEMENT,
          tagName: 'child1',
          attributes: { id: 'second' },
          children: [],
          position: {
            start: { line: 4, column: 1, offset: 50 },
            end: { line: 4, column: 20, offset: 69 },
          },
        } as Element,
      ],
    };

    // 测试查找第一个子元素
    const firstChild = (processor as any).findFirstChildByTagName(
      element,
      'child1'
    );

    expect(firstChild).toBeDefined();
    expect(firstChild.tagName).toBe('child1');
    expect(firstChild.attributes.id).toBe('first');

    // 测试查找所有子元素
    const allChildren = (processor as any).findChildrenByTagName(
      element,
      'child1'
    );

    expect(allChildren.length).toBe(2);
    expect(allChildren[0].attributes.id).toBe('first');
    expect(allChildren[1].attributes.id).toBe('second');

    // 测试未找到的情况
    const notFound = (processor as any).findFirstChildByTagName(
      element,
      'notexist'
    );

    expect(notFound).toBeUndefined();

    const emptyList = (processor as any).findChildrenByTagName(
      element,
      'notexist'
    );

    expect(emptyList.length).toBe(0);
  });
});
