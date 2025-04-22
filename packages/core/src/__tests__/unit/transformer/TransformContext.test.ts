import { describe, test, expect, vi } from 'vitest';

import { TransformContext } from '../../../core/transformer/TransformContext';
import type { ProcessingResult } from '../../../types/ProcessingResult';
import { createProcessingResultFixture } from '../../fixtures/transformer/transformerFixtures';

describe('TransformContext', () => {
  // UT-CTX-01: set应存储数据到内部Map
  test('set应存储数据到内部Map', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const context = new TransformContext(processingResult);
    const testKey = 'testKey';
    const testValue = { data: 'value' };

    // 执行
    context.set(testKey, testValue);

    // 断言
    expect(context.has(testKey)).toBe(true);
    expect(context.get(testKey)).toEqual(testValue);
  });

  // UT-CTX-02: get应返回之前存储的数据
  test('get应返回之前存储的数据', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const context = new TransformContext(processingResult);
    const testKey = 'testKey';
    const testValue = 'testValue';

    // 执行
    context.set(testKey, testValue);
    const result = context.get(testKey);

    // 断言
    expect(result).toBe(testValue);
  });

  // UT-CTX-03: has应检查键是否存在
  test('has应检查键是否存在', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const context = new TransformContext(processingResult);
    const existingKey = 'existingKey';
    const nonExistingKey = 'nonExistingKey';

    // 执行
    context.set(existingKey, 'value');

    // 断言
    expect(context.has(existingKey)).toBe(true);
    expect(context.has(nonExistingKey)).toBe(false);
  });

  // UT-CTX-04: getDocument应返回处理结果中的文档
  test('getDocument应返回处理结果中的文档', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const context = new TransformContext(processingResult);

    // 执行
    const document = context.getDocument();

    // 断言
    expect(document).toBe(processingResult.document);
  });

  // UT-CTX-05: getAllResults应返回所有存储的数据
  test('getAllResults应返回所有存储的数据', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const context = new TransformContext(processingResult);
    const data = {
      key1: 'value1',
      key2: 'value2',
      key3: { nested: 'value3' }
    };

    // 执行
    Object.entries(data).forEach(([key, value]) => {
      context.set(key, value);
    });
    const results = context.getAllResults();

    // 断言
    expect(results).toEqual(data);
    expect(Object.keys(results).length).toBe(Object.keys(data).length);
  });

  // UT-CTX-TYPE-01: set和get应保持类型安全
  test('set和get应保持类型安全', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const context = new TransformContext(processingResult);

    // 执行和断言 - 字符串类型
    const stringKey = 'stringKey';
    const stringValue = 'string value';

    context.set(stringKey, stringValue);
    const retrievedString = context.get<string>(stringKey);

    expect(typeof retrievedString).toBe('string');
    expect(retrievedString).toBe(stringValue);

    // 执行和断言 - 对象类型
    interface TestObject {
      id: number;
      name: string;
    }
    const objectKey = 'objectKey';
    const objectValue: TestObject = { id: 1, name: 'test' };

    context.set<TestObject>(objectKey, objectValue);
    const retrievedObject = context.get<TestObject>(objectKey);

    expect(retrievedObject).toBeDefined();
    expect(retrievedObject?.id).toBe(1);
    expect(retrievedObject?.name).toBe('test');

    // 执行和断言 - 数组类型
    const arrayKey = 'arrayKey';
    const arrayValue = [1, 2, 3];

    context.set<number[]>(arrayKey, arrayValue);
    const retrievedArray = context.get<number[]>(arrayKey);

    expect(Array.isArray(retrievedArray)).toBe(true);
    expect(retrievedArray).toEqual(arrayValue);
  });

  // 测试构造函数的initialData参数
  test('构造函数应接受initialData参数并正确初始化', () => {
    // 准备
    const processingResult = createProcessingResultFixture() as ProcessingResult;
    const initialData = {
      key1: 'value1',
      key2: 42
    };

    // 执行
    const context = new TransformContext(processingResult, initialData);

    // 断言
    expect(context.get('key1')).toBe('value1');
    expect(context.get('key2')).toBe(42);
  });
});
