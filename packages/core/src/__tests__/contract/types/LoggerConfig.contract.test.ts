/**
 * LoggerConfig接口契约测试
 *
 * 这些测试确保LoggerConfig接口的结构稳定性，防止意外的破坏性变更。
 */
import { describe, it, expect } from 'vitest';

import type { LoggerConfig, LogFormatter, LogTransport, LogEntry } from '../../../types/log';
import { LogLevel } from '../../../types/log';

describe('LoggerConfig接口契约测试', () => {
  // CT-TYPE-LCFG-01: LoggerConfig接口应维持结构稳定性
  it('CT-TYPE-LCFG-01: LoggerConfig接口应维持结构稳定性', () => {
    // 创建一个符合LoggerConfig接口的对象
    const mockFormatter: LogFormatter = {
      format: (entry: LogEntry) => `[${LogLevel[entry.level]}] ${entry.message}`
    };

    const mockTransport: LogTransport = {
      write: (entry: LogEntry) => {}
    };

    const config: LoggerConfig = {
      minLevel: LogLevel.INFO,
      formatter: mockFormatter,
      transports: [mockTransport],
      callSiteCapture: {
        enabled: true,
        forLevels: [LogLevel.ERROR, LogLevel.FATAL]
      }
    };

    // 验证LoggerConfig接口包含所有必需的属性
    expect(config).toHaveProperty('minLevel');
    expect(config).toHaveProperty('formatter');
    expect(config).toHaveProperty('transports');
    expect(config).toHaveProperty('callSiteCapture');

    // 验证属性类型
    expect(typeof config.minLevel).toBe('number');
    expect(typeof config.formatter?.format).toBe('function');
    expect(Array.isArray(config.transports)).toBe(true);
    expect(typeof config.callSiteCapture?.enabled).toBe('boolean');
  });

  // CT-TYPE-LCFG-02: LoggerConfig中formatter和transports字段应为可选
  it('CT-TYPE-LCFG-02: LoggerConfig中formatter和transports字段应为可选', () => {
    // 创建一个只有必需字段的LoggerConfig对象
    const minimalConfig: LoggerConfig = {
      minLevel: LogLevel.WARN
    };

    // 验证对象符合LoggerConfig接口
    expect(minimalConfig).toHaveProperty('minLevel');
    expect(minimalConfig.formatter).toBeUndefined();
    expect(minimalConfig.transports).toBeUndefined();

    // 验证可以单独设置formatter
    const formatterOnlyConfig: LoggerConfig = {
      minLevel: LogLevel.DEBUG,
      formatter: {
        format: (entry: LogEntry) => entry.message
      }
    };

    expect(formatterOnlyConfig.formatter).toBeDefined();
    expect(formatterOnlyConfig.transports).toBeUndefined();

    // 验证可以单独设置transports
    const transportsOnlyConfig: LoggerConfig = {
      minLevel: LogLevel.ERROR,
      transports: [{
        write: (entry: LogEntry) => {}
      }]
    };

    expect(transportsOnlyConfig.formatter).toBeUndefined();
    expect(transportsOnlyConfig.transports).toBeDefined();
  });

  // CT-TYPE-LCFG-03: LoggerConfig中callSiteCapture字段应为可选
  it('CT-TYPE-LCFG-03: LoggerConfig中callSiteCapture字段应为可选', () => {
    // 创建一个没有callSiteCapture字段的LoggerConfig对象
    const configWithoutCallSite: LoggerConfig = {
      minLevel: LogLevel.INFO
    };

    // 验证对象符合LoggerConfig接口
    expect(configWithoutCallSite).toHaveProperty('minLevel');
    expect(configWithoutCallSite.callSiteCapture).toBeUndefined();

    // 验证可以设置callSiteCapture
    const configWithCallSite: LoggerConfig = {
      minLevel: LogLevel.WARN,
      callSiteCapture: {
        enabled: true
      }
    };

    expect(configWithCallSite.callSiteCapture).toBeDefined();
    expect(configWithCallSite.callSiteCapture?.enabled).toBe(true);
    expect(configWithCallSite.callSiteCapture?.forLevels).toBeUndefined();

    // 验证可以设置callSiteCapture.forLevels
    const configWithCallSiteLevels: LoggerConfig = {
      minLevel: LogLevel.ERROR,
      callSiteCapture: {
        enabled: true,
        forLevels: [LogLevel.ERROR, LogLevel.FATAL]
      }
    };

    expect(configWithCallSiteLevels.callSiteCapture?.forLevels).toBeDefined();
    expect(configWithCallSiteLevels.callSiteCapture?.forLevels?.length).toBe(2);
  });
});
