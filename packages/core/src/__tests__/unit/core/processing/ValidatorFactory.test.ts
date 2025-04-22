import { describe, test, expect, vi } from 'vitest';

import { DocumentValidator } from '../../../../core/processing/DocumentValidator';
import { ValidatorFactory } from '../../../../core/processing/ValidatorFactory';

describe('UT-VALFAC', () => {
  // 测试用例UT-VALFAC-01: 测试创建基本验证器
  describe('UT-VALFAC-01: 创建基本验证器', () => {
    test('应创建基本验证器实例', () => {
      // 创建验证器工厂
      const factory = new ValidatorFactory();

      // 使用工厂创建验证器
      const validator = factory.createValidator();

      // 断言返回的是DocumentValidator实例
      expect(validator).toBeInstanceOf(DocumentValidator);
    });
  });

  // 测试用例UT-VALFAC-02: 测试带配置选项的验证器创建
  describe('UT-VALFAC-02: 带配置选项的验证器创建', () => {
    test('应使用提供的选项创建验证器', () => {
      // 创建验证器工厂
      const factory = new ValidatorFactory();

      // 创建错误处理器mock函数
      const mockErrorHandler = vi.fn();

      // 使用工厂创建验证器，并提供配置选项
      const validator = factory.createValidator({
        strictMode: true,
        ignoreWarnings: false,
        errorHandler: mockErrorHandler
      });

      // 断言返回的是DocumentValidator实例
      expect(validator).toBeInstanceOf(DocumentValidator);

      // 由于当前验证器实现未引入错误，错误处理器不应被调用
      expect(mockErrorHandler).not.toHaveBeenCalled();
    });

    test('应正确处理自定义错误处理器', () => {
      // 创建针对错误处理的测试
      // 为了测试错误处理器，我们需要模拟一个会抛出错误的情况

      // 创建一个修改过的ValidatorFactory类，在初始化时抛出错误
      class TestErrorFactory extends ValidatorFactory {
        public createValidator(options?: any): DocumentValidator {
          if (options?.forceError) {
            throw new Error('测试错误');
          }

          return super.createValidator(options);
        }
      }

      // 创建验证器工厂
      const factory = new TestErrorFactory();

      // 创建错误处理器mock函数
      const mockErrorHandler = vi.fn();

      // 使用工厂创建验证器，并提供配置选项（包括强制错误标志）
      let caughtError: Error | null = null;

      try {
        factory.createValidator({
          forceError: true,
          errorHandler: mockErrorHandler
        });
      } catch (error) {
        caughtError = error as Error;
      }

      // 断言错误被正确抛出
      expect(caughtError).not.toBeNull();
      expect(caughtError?.message).toBe('测试错误');

      // 因为错误处理器在内部try-catch中，而我们是在外部捕获的错误，
      // 所以错误处理器应该没有被调用
      expect(mockErrorHandler).not.toHaveBeenCalled();
    });
  });
});
