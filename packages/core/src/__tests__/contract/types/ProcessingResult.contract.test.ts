import { describe, test, expect } from 'vitest';

import type { ProcessingResult, ProcessingContext, ValidationResult, ReferenceMap, DPMLDocument, ProcessedSchema } from '../../../types';

/**
 * ProcessingResult接口契约测试
 * 验证处理结果接口结构的稳定性和扩展能力
 */
describe('ProcessingResult Interface Contract', () => {
  // CT-TYPE-PRES-01: ProcessingResult 接口应维持结构稳定性
  test('ProcessingResult 接口应维持结构稳定性', () => {
    // 创建符合接口的对象
    const result: ProcessingResult = {
      context: {} as ProcessingContext,
      validation: {} as ValidationResult,
      references: {} as ReferenceMap
    };

    // 验证基本结构
    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('validation');
    expect(result).toHaveProperty('references');

    // 类型验证（仅在编译时有效，运行时不执行）
    type HasRequiredProps =
      'context' extends keyof ProcessingResult ?
      'validation' extends keyof ProcessingResult ?
      true : false : false;


    const hasProps: HasRequiredProps = true;
  });

  // CT-TYPE-PRES-02: ProcessingResult 接口应支持扩展
  test('ProcessingResult 接口应支持扩展', () => {
    // 定义扩展的接口
    interface CustomProcessingResult extends ProcessingResult {
      customData: {
        version: string;
        processedAt: Date;
      };
    }

    // 创建符合扩展接口的对象
    const result: CustomProcessingResult = {
      context: {
        document: {} as DPMLDocument,
        schema: {} as ProcessedSchema<any>
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
        version: '1.0.0',
        processedAt: new Date()
      }
    };

    // 验证基本和扩展结构
    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('validation');
    expect(result).toHaveProperty('references');
    expect(result).toHaveProperty('customData');
    expect(result.customData).toHaveProperty('version');
    expect(result.customData).toHaveProperty('processedAt');

    // 使用公开的extensions字段
    const resultWithExtensions: ProcessingResult = {
      context: {
        document: {} as DPMLDocument,
        schema: {} as ProcessedSchema<any>
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      },
      extensions: {
        customMetadata: {
          source: 'test',
          timestamp: Date.now()
        }
      }
    };

    expect(resultWithExtensions).toHaveProperty('extensions');
    expect(resultWithExtensions.extensions).toHaveProperty('customMetadata');
  });
});
