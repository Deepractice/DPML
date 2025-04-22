import { describe, test, expect, vi, beforeEach } from 'vitest';

import { processDocument } from '../../../api/processing';
import type { DPMLDocument, ProcessingResult, ProcessedSchema } from '../../../types';

// 在测试文件顶部进行模拟
vi.mock('../../../core/processing/processingService', () => ({
  processDocument: vi.fn()
}));

// 导入被模拟的模块
import { processDocument as processDocumentService } from '../../../core/processing/processingService';

/**
 * API层处理模块契约测试
 * 验证processDocument API接口保持稳定，符合公开契约
 */
describe('Processing API Contract', () => {
  // 在每个测试前重置模拟
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // CT-API-PROC-01: processDocument API 应维持类型签名
  test('processDocument API 应维持类型签名', () => {
    // 执行类型检查 - 这不会在运行时执行，但对TS类型检查有效

    const processor: <T extends ProcessingResult = ProcessingResult>(
      document: DPMLDocument,
      schema: ProcessedSchema<any>
    ) => T = processDocument;

    // 确保函数存在
    expect(typeof processDocument).toBe('function');
  });

  // CT-API-PROC-02: processDocument API 应返回符合 ProcessingResult 接口的结果
  test('processDocument API 应返回符合 ProcessingResult 接口的结果', () => {
    // Mock依赖
    const mockDocument = {} as DPMLDocument;
    const mockSchema = {} as ProcessedSchema<any>;

    // 设置模拟返回值
    vi.mocked(processDocumentService).mockReturnValue({
      context: {
        document: mockDocument,
        schema: mockSchema
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      references: {
        idMap: new Map()
      }
    });

    // 调用API
    const result = processDocument(mockDocument, mockSchema);

    // 验证结果符合契约
    expect(result).toBeDefined();
    expect(result.context).toBeDefined();
    expect(result.validation).toBeDefined();
    expect(result.validation.isValid).toBeDefined();
    expect(Array.isArray(result.validation.errors)).toBe(true);
    expect(Array.isArray(result.validation.warnings)).toBe(true);
    expect(result.references).toBeDefined();
    expect(result.references?.idMap).toBeDefined();
  });

  // CT-API-PROC-03: processDocument API 应支持自定义结果类型
  test('processDocument API 应支持自定义结果类型', () => {
    // 定义扩展的ProcessingResult接口
    interface ExtendedProcessingResult extends ProcessingResult {
      customData: {
        processed: boolean;
        timestamp: number;
      };
    }

    // Mock依赖
    const mockDocument = {} as DPMLDocument;
    const mockSchema = {} as ProcessedSchema<any>;

    // 设置模拟返回值
    vi.mocked(processDocumentService).mockReturnValue({
      context: {
        document: mockDocument,
        schema: mockSchema
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      references: {
        idMap: new Map()
      },
      customData: {
        processed: true,
        timestamp: Date.now()
      }
    } as ExtendedProcessingResult);

    // 调用API并指定返回类型
    const result = processDocument<ExtendedProcessingResult>(mockDocument, mockSchema);

    // 验证基本契约
    expect(result).toBeDefined();
    expect(result.context).toBeDefined();
    expect(result.validation).toBeDefined();

    // 验证扩展属性
    expect(result.customData).toBeDefined();
    expect(result.customData.processed).toBe(true);
    expect(typeof result.customData.timestamp).toBe('number');
  });
});
