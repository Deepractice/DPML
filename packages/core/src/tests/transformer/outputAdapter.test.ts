import { describe, it, expect } from 'vitest';

import { NodeType } from '../../types/node';

import type { ProcessedDocument } from '../../processor/interfaces/processor';
import type { OutputAdapter } from '../../transformer/interfaces/outputAdapter';
import type { TransformContext } from '../../transformer/interfaces/transformContext';
import type { TransformOptions } from '../../transformer/interfaces/transformOptions';

describe('OutputAdapter', () => {
  // 创建模拟数据
  const mockDocument: ProcessedDocument = {
    type: NodeType.DOCUMENT,
    children: [],
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
    },
  };

  const mockOptions: TransformOptions = {
    format: 'json',
  };

  const mockContext: TransformContext = {
    output: {},
    document: mockDocument,
    options: mockOptions,
    variables: {},
    path: [],
    parentResults: [],
  };

  it('应该能创建基本的输出适配器', () => {
    const adapter: OutputAdapter = {
      adapt: (result, context) => result,
    };

    expect(adapter.adapt).toBeDefined();

    // 测试基本适配
    const result = { type: 'document', children: [] };

    expect(adapter.adapt(result, mockContext)).toBe(result);
  });

  it('应该能创建修改输出的适配器', () => {
    const adapter: OutputAdapter = {
      adapt: (result, context) => {
        if (typeof result === 'object' && result !== null) {
          return {
            ...result,
            format: context.options.format,
            modified: true,
          };
        }

        return result;
      },
    };

    const result = { type: 'document', children: [] };
    const adapted = adapter.adapt(result, mockContext);

    expect(adapted).toEqual({
      type: 'document',
      children: [],
      format: 'json',
      modified: true,
    });
  });

  it('应该能创建字符串化输出的适配器', () => {
    const adapter: OutputAdapter = {
      adapt: (result, context) => {
        return JSON.stringify(result, null, 2);
      },
    };

    const result = { type: 'document', children: [] };
    const adapted = adapter.adapt(result, mockContext);

    expect(typeof adapted).toBe('string');
    expect(adapted).toBe(JSON.stringify(result, null, 2));
  });

  it('应该能访问上下文中的信息', () => {
    const contextWithMetadata: TransformContext = {
      ...mockContext,
      document: {
        ...mockDocument,
        metadata: {
          version: '1.0',
          author: 'Test',
        },
      },
    };

    const adapter: OutputAdapter = {
      adapt: (result, context) => {
        return {
          ...result,
          metadata: context.document.metadata,
        };
      },
    };

    const result = { type: 'document', children: [] };
    const adapted = adapter.adapt(result, contextWithMetadata);

    expect(adapted.metadata).toEqual({
      version: '1.0',
      author: 'Test',
    });
  });
});
