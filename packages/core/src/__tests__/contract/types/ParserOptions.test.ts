/**
 * ParserOptions接口契约测试
 */
import { describe, test, expect } from 'vitest';

import type { ParserOptions } from '../../../types';

describe('CT-ParserOptions-Structure', () => {
  test('should have correct structure when created', () => {
    // 创建符合ParserOptions接口的对象
    const options: ParserOptions = {
      preserveWhitespace: true,
      encoding: 'utf-8',
      validateOnParse: false,
      throwOnError: true,
      fileName: 'test.dpml'
    };

    // 验证属性存在性和类型
    expect(options).toHaveProperty('preserveWhitespace');
    expect(typeof options.preserveWhitespace).toBe('boolean');

    expect(options).toHaveProperty('encoding');
    expect(typeof options.encoding).toBe('string');

    expect(options).toHaveProperty('validateOnParse');
    expect(typeof options.validateOnParse).toBe('boolean');

    expect(options).toHaveProperty('throwOnError');
    expect(typeof options.throwOnError).toBe('boolean');

    expect(options).toHaveProperty('fileName');
    expect(typeof options.fileName).toBe('string');
  });

  test('should support optional properties', () => {
    // 验证所有属性都是可选的
    const minimalOptions: ParserOptions = {};

    // 不包含任何属性也是有效的ParserOptions
    expect(minimalOptions).toBeDefined();

    // 验证只设置部分属性也是有效的
    const partialOptions: ParserOptions = {
      preserveWhitespace: true
    };

    expect(partialOptions.preserveWhitespace).toBe(true);
    expect(partialOptions.encoding).toBeUndefined();
  });
});
