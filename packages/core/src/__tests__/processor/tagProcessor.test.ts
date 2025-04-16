import { NodeType } from '../../types/node';

import type { ProcessingContext } from '../../processor/interfaces';
import type { TagProcessor } from '../../processor/interfaces/tagProcessor';
import type { Element } from '../../types/node';

// 模拟一个ProcessingContext
const createMockContext = (): ProcessingContext => {
  return {
    document: { type: NodeType.DOCUMENT, children: [] },
    currentPath: '/test/path',
    filePath: '/test/path',
    resolvedReferences: new Map(),
    parentElements: [],
    variables: {},
    idMap: new Map(),
  };
};

describe('TagProcessor Interface', () => {
  // 创建一个简单的TagProcessor实现
  class TestTagProcessor implements TagProcessor {
    canProcess(element: Element): boolean {
      return element.tagName === 'test-tag';
    }

    async process(
      element: Element,
      context: ProcessingContext
    ): Promise<Element> {
      if (!element.metadata) {
        element.metadata = {};
      }

      element.metadata.processed = true;
      element.metadata.processorName = 'TestTagProcessor';

      return element;
    }
  }

  it('should determine if it can process an element', () => {
    const processor = new TestTagProcessor();

    // 可以处理的元素
    const validElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: {},
      children: [],
    };

    // 不可处理的元素
    const invalidElement: Element = {
      type: NodeType.ELEMENT,
      tagName: 'other-tag',
      attributes: {},
      children: [],
    };

    expect(processor.canProcess(validElement)).toBe(true);
    expect(processor.canProcess(invalidElement)).toBe(false);
  });

  it('should process an element and add metadata', async () => {
    const processor = new TestTagProcessor();
    const context = createMockContext();

    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: {},
      children: [],
    };

    const processedElement = await processor.process(element, context);

    expect(processedElement.metadata).toBeDefined();
    expect(processedElement.metadata!.processed).toBe(true);
    expect(processedElement.metadata!.processorName).toBe('TestTagProcessor');
  });

  it('should add metadata to existing metadata object', async () => {
    const processor = new TestTagProcessor();
    const context = createMockContext();

    const element: Element = {
      type: NodeType.ELEMENT,
      tagName: 'test-tag',
      attributes: {},
      children: [],
      metadata: {
        existingData: 'value',
      },
    };

    const processedElement = await processor.process(element, context);

    expect(processedElement.metadata!.existingData).toBe('value');
    expect(processedElement.metadata!.processed).toBe(true);
    expect(processedElement.metadata!.processorName).toBe('TestTagProcessor');
  });
});
