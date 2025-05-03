/**
 * Content Types契约测试
 *
 * 验证Content和ContentItem类型的结构稳定性。
 */
import { describe, test, expect } from 'vitest';

import type { Content, ContentItem } from '../../../src/types';

describe('CT-Type-Content', () => {
  test('CT-Type-Content-01: ContentItem类型应符合公开契约', () => {
    // 创建不同类型的ContentItem
    const textItem: ContentItem = {
      type: 'text',
      value: '文本内容'
    };

    const imageItem: ContentItem = {
      type: 'image',
      value: new Uint8Array([1, 2, 3]),
      mimeType: 'image/jpeg'
    };

    const audioItem: ContentItem = {
      type: 'audio',
      value: new Uint8Array([4, 5, 6]),
      mimeType: 'audio/mp3'
    };

    const videoItem: ContentItem = {
      type: 'video',
      value: new Uint8Array([7, 8, 9]),
      mimeType: 'video/mp4'
    };

    const fileItem: ContentItem = {
      type: 'file',
      value: new Uint8Array([10, 11, 12]),
      mimeType: 'application/pdf'
    };

    // 验证公共属性
    [textItem, imageItem, audioItem, videoItem, fileItem].forEach(item => {
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('value');
    });

    // 验证可选属性
    expect(textItem.mimeType).toBeUndefined();
    expect(imageItem.mimeType).toBeDefined();

    // 验证类型兼容性
    const items: ContentItem[] = [textItem, imageItem, audioItem, videoItem, fileItem];

    expect(items.length).toBe(5);
  });

  test('CT-Type-Content-02: Content类型应支持单个ContentItem', () => {
    // 创建单个ContentItem作为Content
    const textContent: Content = {
      type: 'text',
      value: '单个内容项'
    };

    // 验证能够赋值给Content类型
    const content: Content = textContent;

    expect(content).toBe(textContent);

    // 验证不是数组
    expect(Array.isArray(content)).toBe(false);

    // 访问单个ContentItem的属性
    if (!Array.isArray(content)) {
      expect(content.type).toBe('text');
      expect(content.value).toBe('单个内容项');
    }
  });

  test('CT-Type-Content-03: Content类型应支持ContentItem数组', () => {
    // 创建ContentItem数组作为Content
    const contentArray: Content = [
      {
        type: 'text',
        value: '第一项'
      },
      {
        type: 'image',
        value: new Uint8Array([1, 2, 3]),
        mimeType: 'image/png'
      }
    ];

    // 验证是数组
    expect(Array.isArray(contentArray)).toBe(true);

    // 验证数组内容
    if (Array.isArray(contentArray)) {
      expect(contentArray.length).toBe(2);
      expect(contentArray[0].type).toBe('text');
      expect(contentArray[1].type).toBe('image');
    }
  });

  test('CT-Type-Content-04: ContentType应支持所有内容类型', () => {
    // 测试所有可能的内容类型
    const types = ['text', 'image', 'audio', 'video', 'file'];

    // 创建不同类型的内容项
    const items = types.map(type => ({
      type,
      value: type === 'text' ? '内容' : new Uint8Array([1, 2, 3]),
      mimeType: type !== 'text' ? `${type}/test` : undefined
    } as ContentItem));

    // 验证所有类型都是有效的ContentItem
    items.forEach(item => {
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('value');
    });

    // 验证可以组合为Content数组
    const combinedContent: Content = items;

    expect(Array.isArray(combinedContent)).toBe(true);
    if (Array.isArray(combinedContent)) {
      expect(combinedContent.length).toBe(types.length);
    }
  });

  test('CT-Type-Content-05: ContentItem应支持不同类型的值', () => {
    // 文本内容使用字符串值
    const textItem: ContentItem = {
      type: 'text',
      value: '字符串值'
    };

    expect(typeof textItem.value).toBe('string');

    // 二进制内容使用Uint8Array
    const binaryItem: ContentItem = {
      type: 'image',
      value: new Uint8Array([1, 2, 3]),
      mimeType: 'image/jpeg'
    };

    expect(binaryItem.value instanceof Uint8Array).toBe(true);

    // 验证值的类型兼容性
    const items: ContentItem[] = [textItem, binaryItem];

    expect(items.length).toBe(2);
  });
});
