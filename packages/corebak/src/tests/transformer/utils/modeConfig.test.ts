import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  getModeConfig,
  handleModeError,
  DEFAULT_STRICT_MODE,
  DEFAULT_LOOSE_MODE,
} from '../../../transformer/utils/modeConfig';

import type { TransformOptions } from '../../../transformer/interfaces/transformOptions';
import type { ModeConfigOptions } from '../../../transformer/utils/modeConfig';

describe('ModeConfig', () => {
  describe('getModeConfig', () => {
    it('应该返回默认宽松模式配置（未提供选项时）', () => {
      const config = getModeConfig();

      expect(config).toEqual(DEFAULT_LOOSE_MODE);
      expect(config.errorHandling).toBe('warn');
      expect(config.errorThreshold).toBe(5);
    });

    it('应该返回严格模式配置（mode为strict时）', () => {
      const options: TransformOptions = {
        mode: 'strict',
      };

      const config = getModeConfig(options);

      expect(config).toEqual(DEFAULT_STRICT_MODE);
      expect(config.errorHandling).toBe('throw');
      expect(config.errorThreshold).toBe(0);
    });

    it('应该返回宽松模式配置（mode为loose时）', () => {
      const options: TransformOptions = {
        mode: 'loose',
      };

      const config = getModeConfig(options);

      expect(config).toEqual(DEFAULT_LOOSE_MODE);
      expect(config.errorHandling).toBe('warn');
      expect(config.errorThreshold).toBe(5);
    });

    it('应该允许自定义错误阈值', () => {
      const options: TransformOptions = {
        mode: 'strict',
        errorThreshold: 3,
      };

      const config = getModeConfig(options);

      // 基础为严格模式，但使用自定义的错误阈值
      expect(config.errorHandling).toBe('throw');
      expect(config.errorThreshold).toBe(3);
    });
  });

  describe('handleModeError', () => {
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
      console.warn = vi.fn();
    });

    afterEach(() => {
      console.warn = originalConsoleWarn;
    });

    it('应该在抛出模式下抛出错误', () => {
      const error = new Error('测试错误');
      const config = { ...DEFAULT_STRICT_MODE };

      expect(() => handleModeError(error, config, 0)).toThrow('测试错误');
    });

    it('应该在警告模式下输出警告并继续', () => {
      const error = new Error('测试错误');
      const config = { ...DEFAULT_LOOSE_MODE };

      const result = handleModeError(error, config, 0);

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('测试错误')
      );
    });

    it('应该在错误超出阈值时中止处理（thresholdExceededAction=abort-transform）', () => {
      const error = new Error('测试错误');
      const config: ModeConfigOptions = {
        ...DEFAULT_LOOSE_MODE,
        errorThreshold: 3,
        thresholdExceededAction: 'abort-transform',
      };

      // 错误数超过阈值，应该中止
      const result = handleModeError(error, config, 4);

      expect(result).toBe(false);
    });

    it('应该在错误超出阈值但配置为禁用访问者时继续处理', () => {
      const error = new Error('测试错误');
      const config: ModeConfigOptions = {
        ...DEFAULT_LOOSE_MODE,
        errorThreshold: 3,
        thresholdExceededAction: 'disable-visitor',
      };

      // 错误数超过阈值，但仅禁用访问者，因此应该继续
      const result = handleModeError(error, config, 4);

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('测试错误')
      );
    });
  });
});
