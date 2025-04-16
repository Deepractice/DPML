import { describe, it, expect } from 'vitest';
import { createDPMLError, ValidationError, FileSystemError, NetworkError } from '../../types';
import { utilsTypes } from '../../types';

describe('类型定义测试', () => {
  describe('错误类型', () => {
    it('应正确创建DPMLError', () => {
      const error = createDPMLError('测试错误', 'TEST_ERROR', { id: 123 });
      expect(error.message).toBe('测试错误');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ id: 123 });
    });

    it('应正确创建ValidationError', () => {
      const fields = { name: ['不能为空'] };
      const error = new ValidationError('验证失败', {
        fields,
        code: 'VALIDATION_FAILED',
        details: { formId: 'user-form' }
      });
      
      expect(error.message).toBe('验证失败');
      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.details).toEqual({ formId: 'user-form' });
      expect(error.fields).toEqual(fields);
      expect(error.name).toBe('ValidationError');
    });

    it('应正确创建FileSystemError', () => {
      const error = new FileSystemError('文件不存在', {
        path: '/tmp/test.txt',
        code: 'FILE_NOT_FOUND'
      });
      
      expect(error.message).toBe('文件不存在');
      expect(error.code).toBe('FILE_NOT_FOUND');
      expect(error.path).toBe('/tmp/test.txt');
      expect(error.details).toHaveProperty('path', '/tmp/test.txt');
    });

    it('应正确创建NetworkError', () => {
      const error = new NetworkError('请求失败', {
        statusCode: 404,
        code: 'NOT_FOUND'
      });
      
      expect(error.message).toBe('请求失败');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('工具类型', () => {
    it('应支持Result类型', () => {
      // 定义函数返回Result类型
      function divide(a: number, b: number): utilsTypes.Result<number, Error> {
        if (b === 0) {
          return { success: false, error: new Error('除数不能为零') };
        }
        return { success: true, value: a / b };
      }

      const successResult = divide(10, 2);
      const failureResult = divide(10, 0);

      if (successResult.success) {
        expect(successResult.value).toBe(5);
      } else {
        expect.fail('应该是成功结果');
      }

      if (failureResult.success) {
        expect.fail('应该是失败结果');
      } else {
        expect(failureResult.error.message).toBe('除数不能为零');
      }
    });

    it('应支持DeepPartial类型', () => {
      interface User {
        id: number;
        name: string;
        profile: {
          email: string;
          phone: string;
          address: {
            city: string;
            street: string;
          };
        };
      }

      // 使用DeepPartial可以部分定义嵌套对象
      const partialUser: utilsTypes.DeepPartial<User> = {
        name: '张三',
        profile: {
          email: 'zhangsan@example.com',
          address: {
            city: '北京'
          }
        }
      };

      expect(partialUser.name).toBe('张三');
      expect(partialUser.profile?.email).toBe('zhangsan@example.com');
      expect(partialUser.profile?.address?.city).toBe('北京');
    });
  });
}); 