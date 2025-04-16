import { describe, test, expect, vi } from 'vitest';

import * as arrayUtils from '../../utils/array';
import * as asyncUtils from '../../utils/async';
import * as errorUtils from '../../utils/error';
import * as objectUtils from '../../utils/object';
import * as stringUtils from '../../utils/string';
import * as validationUtils from '../../utils/validation';

// 字符串工具测试
describe('UT-UTIL-STRING: 字符串工具', () => {
  describe('isEmpty方法', () => {
    test('应正确检测空字符串', () => {
      expect(stringUtils.isEmpty('')).toBe(true);
      expect(stringUtils.isEmpty('  ')).toBe(true);
      expect(stringUtils.isEmpty('hello')).toBe(false);
      expect(stringUtils.isEmpty(null as any)).toBe(true);
      expect(stringUtils.isEmpty(undefined as any)).toBe(true);
    });
  });

  describe('ensureEndsWith方法', () => {
    test('应确保字符串以指定字符结尾', () => {
      expect(stringUtils.ensureEndsWith('path', '/')).toBe('path/');
      expect(stringUtils.ensureEndsWith('path/', '/')).toBe('path/');
    });
  });

  describe('ensureStartsWith方法', () => {
    test('应确保字符串以指定字符开头', () => {
      expect(stringUtils.ensureStartsWith('path', '/')).toBe('/path');
      expect(stringUtils.ensureStartsWith('/path', '/')).toBe('/path');
    });
  });

  describe('truncate方法', () => {
    test('应截断超过指定长度的字符串', () => {
      expect(stringUtils.truncate('hello world', 5)).toBe('he...');
      expect(stringUtils.truncate('hello', 10)).toBe('hello');
    });
  });

  describe('toCamelCase方法', () => {
    test('应将字符串转换为驼峰命名', () => {
      expect(stringUtils.toCamelCase('hello-world')).toBe('helloWorld');
      expect(stringUtils.toCamelCase('foo_bar')).toBe('fooBar');
      expect(stringUtils.toCamelCase('HelloWorld')).toBe('helloWorld');
    });
  });

  describe('format方法', () => {
    test('应正确替换模板中的占位符', () => {
      expect(stringUtils.format('Hello, {name}!', { name: 'World' })).toBe(
        'Hello, World!'
      );
      expect(stringUtils.format('{a} + {b} = {c}', { a: 1, b: 2, c: 3 })).toBe(
        '1 + 2 = 3'
      );
    });
  });
});

// 数组工具测试
describe('UT-UTIL-ARRAY: 数组工具', () => {
  describe('unique方法', () => {
    test('应移除数组中的重复项', () => {
      expect(arrayUtils.unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
      expect(arrayUtils.unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
  });

  describe('chunk方法', () => {
    test('应将数组拆分为指定大小的块', () => {
      expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([
        [1, 2],
        [3, 4],
        [5],
      ]);
      expect(arrayUtils.chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });

  describe('groupBy方法', () => {
    test('应按指定属性对数组进行分组', () => {
      const data = [
        { id: 1, category: 'a' },
        { id: 2, category: 'b' },
        { id: 3, category: 'a' },
      ];
      const result = arrayUtils.groupBy(data, 'category');

      expect(result).toEqual({
        a: [
          { id: 1, category: 'a' },
          { id: 3, category: 'a' },
        ],
        b: [{ id: 2, category: 'b' }],
      });
    });
  });

  describe('sum方法', () => {
    test('应计算数组中所有数字的总和', () => {
      expect(arrayUtils.sum([1, 2, 3, 4])).toBe(10);
      expect(arrayUtils.sum([])).toBe(0);
    });
  });

  describe('intersection方法', () => {
    test('应返回两个数组的交集', () => {
      expect(arrayUtils.intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
      expect(arrayUtils.intersection(['a', 'b'], ['b', 'c'])).toEqual(['b']);
    });
  });
});

// 对象工具测试
describe('UT-UTIL-OBJECT: 对象工具', () => {
  describe('isObject方法', () => {
    test('应正确检测对象类型', () => {
      expect(objectUtils.isObject({})).toBe(true);
      expect(objectUtils.isObject([])).toBe(false);
      expect(objectUtils.isObject(null)).toBe(false);
      expect(objectUtils.isObject(() => {})).toBe(false);
    });
  });

  describe('deepMerge方法', () => {
    test('应深度合并两个对象', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const result = objectUtils.deepMerge(obj1 as any, obj2 as any);

      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4,
      });
    });
  });

  describe('get方法', () => {
    test('应根据路径获取对象中的值', () => {
      const obj = { a: { b: { c: 42 } } };

      expect(objectUtils.get(obj, 'a.b.c')).toBe(42);
      expect(objectUtils.get(obj, ['a', 'b', 'c'])).toBe(42);
      expect(objectUtils.get(obj, 'a.b.d')).toBeUndefined();
      expect(objectUtils.get(obj, 'a.b.d', 'default')).toBe('default');
    });
  });

  describe('pick方法', () => {
    test('应从对象中选择指定的属性创建新对象', () => {
      const obj = { a: 1, b: 2, c: 3 };

      expect(objectUtils.pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });
});

// 异步工具测试
describe('UT-UTIL-ASYNC: 异步工具', () => {
  describe('sleep方法', () => {
    test('应延迟指定时间', async () => {
      const start = Date.now();

      await asyncUtils.sleep(50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(40); // 允许一些误差
    });
  });

  describe('retry方法', () => {
    test('应重试函数直到成功', async () => {
      let attempts = 0;
      const testFn = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }

        return Promise.resolve('success');
      };

      const result = await asyncUtils.retry(testFn, {
        maxAttempts: 5,
        delay: 10,
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    test('应在达到最大尝试次数后抛出错误', async () => {
      const testFn = () => Promise.reject(new Error('Failed'));

      await expect(
        asyncUtils.retry(testFn, {
          maxAttempts: 3,
          delay: 10,
        })
      ).rejects.toThrow('Failed');
    });
  });
});

// 验证工具测试
describe('UT-UTIL-VALIDATION: 验证工具', () => {
  describe('isNil方法', () => {
    test('应正确检测null和undefined', () => {
      expect(validationUtils.isNil(null)).toBe(true);
      expect(validationUtils.isNil(undefined)).toBe(true);
      expect(validationUtils.isNil('')).toBe(false);
      expect(validationUtils.isNil(0)).toBe(false);
    });
  });

  describe('isEmail方法', () => {
    test('应正确验证电子邮件格式', () => {
      expect(validationUtils.isEmail('user@example.com')).toBe(true);
      expect(validationUtils.isEmail('invalid')).toBe(false);
    });
  });

  describe('isUrl方法', () => {
    test('应正确验证URL格式', () => {
      expect(validationUtils.isUrl('https://example.com')).toBe(true);
      expect(validationUtils.isUrl('invalid')).toBe(false);
    });
  });

  describe('inRange方法', () => {
    test('应正确检查值是否在指定范围内', () => {
      expect(validationUtils.inRange(5, 1, 10)).toBe(true);
      expect(validationUtils.inRange(0, 1, 10)).toBe(false);
    });
  });
});

// 错误工具测试
describe('UT-UTIL-ERROR: 错误工具', () => {
  describe('DpmlError类', () => {
    test('应正确创建和格式化错误', () => {
      const error = new errorUtils.DpmlError('Test error', 'TEST_ERROR');

      expect(error.code).toBe('TEST_ERROR');
      expect(error.format()).toContain('[TEST_ERROR] Test error');
    });

    test('应包含上下文和原因', () => {
      const cause = new Error('Original error');
      const error = new errorUtils.DpmlError(
        'Test error',
        'TEST_ERROR',
        { foo: 'bar' },
        cause
      );

      const formatted = error.format();

      expect(formatted).toContain('[TEST_ERROR] Test error');
      expect(formatted).toContain('Context: {"foo":"bar"}');
      expect(formatted).toContain('Caused by: Original error');
    });
  });

  describe('tryCatch方法', () => {
    test('应捕获并处理同步函数的错误', () => {
      const result = errorUtils.tryCatch(
        () => {
          throw new Error('Test error');
        },
        error => 'Caught: ' + (error as Error).message
      );

      expect(result).toBe('Caught: Test error');
    });
  });

  describe('tryCatchAsync方法', () => {
    test('应捕获并处理异步函数的错误', async () => {
      const result = await errorUtils.tryCatchAsync(
        async () => {
          throw new Error('Test error');
        },
        error => 'Caught: ' + (error as Error).message
      );

      expect(result).toBe('Caught: Test error');
    });
  });
});
