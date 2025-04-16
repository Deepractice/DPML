import { describe, test, expect } from 'vitest';
import { stringUtils, arrayUtils } from '../../src/utils';

describe('UT-UTIL-001: stringUtils', () => {
  describe('isEmpty方法', () => {
    test('应正确检测空字符串', () => {
      expect(stringUtils.isEmpty('')).toBe(true);
      expect(stringUtils.isEmpty('  ')).toBe(true);
      expect(stringUtils.isEmpty('hello')).toBe(false);
    });
  });

  describe('ensureEndsWith方法', () => {
    test('应确保字符串以指定字符结尾', () => {
      expect(stringUtils.ensureEndsWith('path', '/')).toBe('path/');
      expect(stringUtils.ensureEndsWith('path/', '/')).toBe('path/');
    });
  });

  describe('truncate方法', () => {
    test('应截断超过指定长度的字符串', () => {
      expect(stringUtils.truncate('hello world', 5)).toBe('he...');
      expect(stringUtils.truncate('hello', 10)).toBe('hello');
    });
  });
});

describe('UT-UTIL-002: arrayUtils', () => {
  describe('unique方法', () => {
    test('应移除数组中的重复项', () => {
      expect(arrayUtils.unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
      expect(arrayUtils.unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
  });

  describe('chunk方法', () => {
    test('应将数组拆分为指定大小的块', () => {
      expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(arrayUtils.chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });
}); 