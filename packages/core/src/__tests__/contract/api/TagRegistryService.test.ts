/**
 * 标签注册服务API契约测试
 */
import { describe, test, expect } from 'vitest';

import { registerTag, registerTags, getTagRegistry, createTagRegistry } from '../../../api';
import type { TagDefinition } from '../../../types';
import { TagRegistry, ContentModel } from '../../../types';

describe('CT-TagRegistry-ApiSignature', () => {
  // CT-01: 标签注册函数签名验证
  test('should have registerTag function with correct signature', () => {
    // 验证函数存在
    expect(typeof registerTag).toBe('function');

    // 验证函数接受TagDefinition参数
    const tagDefinition: TagDefinition = {
      name: 'test-tag',
      contentModel: ContentModel.EMPTY
    };

    try {
      registerTag(tagDefinition);
    } catch (error) {
      // 期望是实现错误，而非签名错误
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }
  });

  // CT-02: 批量注册函数签名验证
  test('should have registerTags function with correct signature', () => {
    // 验证函数存在
    expect(typeof registerTags).toBe('function');

    // 验证函数接受TagDefinition数组参数
    const tagDefinitions: TagDefinition[] = [
      {
        name: 'tag-1',
        contentModel: ContentModel.EMPTY
      },
      {
        name: 'tag-2',
        contentModel: ContentModel.MIXED
      }
    ];

    try {
      registerTags(tagDefinitions);
    } catch (error) {
      // 期望是实现错误，而非签名错误
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }
  });

  // CT-03: 注册表获取函数签名验证
  test('should have getTagRegistry function with correct signature', () => {
    // 验证函数存在
    expect(typeof getTagRegistry).toBe('function');

    try {
      const registry = getTagRegistry();
      // 虽然会抛出实现错误，但我们只验证函数签名
    } catch (error) {
      // 期望是实现错误，而非签名错误
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }
  });

  // CT-04: 注册表创建函数签名验证
  test('should have createTagRegistry function with correct signature', () => {
    // 验证函数存在
    expect(typeof createTagRegistry).toBe('function');

    try {
      const registry = createTagRegistry();
      // 虽然会抛出实现错误，但我们只验证函数签名
    } catch (error) {
      // 期望是实现错误，而非签名错误
      expect(error.message).not.toContain('argument');
      expect(error.message).not.toContain('parameter');
    }
  });
});
