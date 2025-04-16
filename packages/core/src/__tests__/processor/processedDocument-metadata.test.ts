import { NodeType } from '../../types/node';

import type { ProcessedDocument } from '../../processor/interfaces/processor';

describe('ProcessedDocument with metadata', () => {
  it('should maintain document metadata', () => {
    // 创建一个带有元数据的ProcessedDocument
    const doc: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      metadata: {
        documentType: 'prompt',
        version: '1.0',
        processedAt: new Date().toISOString(),
      },
    };

    // 验证元数据是否存在
    expect(doc.metadata).toBeDefined();
    expect(doc.metadata!.documentType).toBe('prompt');
    expect(doc.metadata!.version).toBe('1.0');
  });

  it('should allow adding metadata fields after creation', () => {
    // 创建一个带有元数据的ProcessedDocument
    const doc: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      metadata: {},
    };

    // 添加元数据
    doc.metadata!.semanticSchema = 'agent';
    doc.metadata!.stats = {
      elementCount: 10,
      processingTime: 150,
    };

    // 验证元数据是否正确添加
    expect(doc.metadata!.semanticSchema).toBe('agent');
    expect(doc.metadata!.stats.elementCount).toBe(10);
    expect(doc.metadata!.stats.processingTime).toBe(150);
  });

  it('should support complex nested metadata structure', () => {
    // 创建一个带有复杂嵌套元数据的ProcessedDocument
    const doc: ProcessedDocument = {
      type: NodeType.DOCUMENT,
      children: [],
      metadata: {
        schema: {
          type: 'agent',
          version: '2.0',
        },
        semantics: {
          prompt: {
            model: 'gpt-4',
            parameters: {
              temperature: 0.7,
              topP: 1.0,
            },
          },
          tools: [
            { name: 'search', parameters: ['query'] },
            { name: 'calculate', parameters: ['expression'] },
          ],
        },
        processing: {
          duration: 120,
          warnings: 2,
          elements: 15,
        },
      },
    };

    // 验证复杂嵌套元数据
    expect(doc.metadata!.schema.type).toBe('agent');
    expect(doc.metadata!.semantics.prompt.model).toBe('gpt-4');
    expect(doc.metadata!.semantics.prompt.parameters.temperature).toBe(0.7);
    expect(doc.metadata!.semantics.tools.length).toBe(2);
    expect(doc.metadata!.semantics.tools[0].name).toBe('search');
    expect(doc.metadata!.processing.warnings).toBe(2);
  });
});
