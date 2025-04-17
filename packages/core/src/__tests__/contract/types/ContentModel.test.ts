/**
 * ContentModel枚举契约测试
 */
import { describe, test, expect } from 'vitest';

import { ContentModel } from '../../../types';

describe('CT-ContentModel-Structure', () => {
  test('should have all required enum values', () => {
    // 验证枚举存在
    expect(ContentModel).toBeDefined();

    // 验证所有必要的枚举值都存在
    expect(ContentModel.EMPTY).toBeDefined();
    expect(ContentModel.CONTENT_ONLY).toBeDefined();
    expect(ContentModel.CHILDREN_ONLY).toBeDefined();
    expect(ContentModel.MIXED).toBeDefined();

    // 验证枚举值的类型
    expect(typeof ContentModel.EMPTY).toBe('string');
    expect(typeof ContentModel.CONTENT_ONLY).toBe('string');
    expect(typeof ContentModel.CHILDREN_ONLY).toBe('string');
    expect(typeof ContentModel.MIXED).toBe('string');

    // 验证枚举值的实际值
    expect(ContentModel.EMPTY).toBe('EMPTY');
    expect(ContentModel.CONTENT_ONLY).toBe('CONTENT_ONLY');
    expect(ContentModel.CHILDREN_ONLY).toBe('CHILDREN_ONLY');
    expect(ContentModel.MIXED).toBe('MIXED');
  });
});
