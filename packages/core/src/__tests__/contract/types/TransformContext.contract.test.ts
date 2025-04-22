/**
 * TransformContext类契约测试
 * 验证TransformContext类的结构和类型安全性
 */

import { describe, test, expect } from 'vitest';

import type { ProcessingResult, DPMLDocument } from '../../../types';
import { TransformContext } from '../../../types';

describe('TransformContext Class Contract', () => {
  // CT-TYPE-CTXT-01
  test('TransformContext class should maintain structural stability', () => {
    // 验证类存在
    expect(typeof TransformContext).toBe('function');

    // 验证原型上的方法存在
    expect(typeof TransformContext.prototype.set).toBe('function');
    expect(typeof TransformContext.prototype.get).toBe('function');
    expect(typeof TransformContext.prototype.has).toBe('function');
    expect(typeof TransformContext.prototype.getDocument).toBe('function');
    expect(typeof TransformContext.prototype.getReferences).toBe('function');
    expect(typeof TransformContext.prototype.getValidation).toBe('function');
    expect(typeof TransformContext.prototype.isDocumentValid).toBe('function');
    expect(typeof TransformContext.prototype.getAllResults).toBe('function');
  });

  // CT-TYPE-CTXT-02
  test('TransformContext should be instantiable with proper parameters', () => {
    // 创建一个模拟的DPMLDocument
    const mockDocument: DPMLDocument = {
      rootNode: {
        tagName: 'root',
        attributes: new Map(),
        children: [],
        content: '',
        parent: null
      },
      metadata: {
        title: 'Test Document',
        description: 'Test Description',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sourceFileName: 'test.dpml',
        custom: { test: true }
      }
    };

    // 创建一个模拟的ProcessingResult
    const mockProcessingResult: ProcessingResult = {
      isValid: true,
      document: mockDocument,
      references: new Map()
    };

    // 验证能够创建实例
    const context = new TransformContext(mockProcessingResult);

    expect(context).toBeInstanceOf(TransformContext);

    // 验证实例方法
    expect(typeof context.set).toBe('function');
    expect(typeof context.get).toBe('function');

    // 使用带有泛型的方法进行基本操作
    context.set('testKey', 'testValue');
    expect(context.get('testKey')).toBe('testValue');
    expect(context.has('testKey')).toBe(true);

    // 测试数字类型
    context.set('numKey', 123);
    expect(context.get('numKey')).toBe(123);

    // 测试对象类型
    const testObj = { id: 'test', values: [1, 2, 3] };

    context.set('objKey', testObj);
    expect(context.get('objKey')).toBe(testObj);

    // 获取所有结果
    const results = context.getAllResults();

    expect(results).toHaveProperty('testKey', 'testValue');
    expect(results).toHaveProperty('numKey', 123);
    expect(results).toHaveProperty('objKey', testObj);
  });
});
