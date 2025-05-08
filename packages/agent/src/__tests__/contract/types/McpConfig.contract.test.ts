/**
 * McpConfig Types契约测试
 *
 * 验证McpConfig类型和McpError类型的结构稳定性。
 */
import { describe, test, expect } from 'vitest';

import type { McpConfig, HttpConfig, StdioConfig } from '../../../types/McpConfig';
import { McpError, McpErrorType } from '../../../types/McpError';

describe('CT-Type-McpConfig', () => {
  test('CT-Type-McpConfig-01: McpConfig接口应符合预期结构', () => {
    // 创建完整的HTTP类型配置
    const httpConfig: McpConfig = {
      name: 'http-mcp',
      enabled: true,
      type: 'http',
      http: {
        url: 'http://localhost:3000'
      }
    };

    // 验证必需字段
    expect(httpConfig).toHaveProperty('name');
    expect(httpConfig).toHaveProperty('enabled');
    expect(httpConfig).toHaveProperty('type');

    // 验证HTTP配置字段
    expect(httpConfig.type).toBe('http');
    expect(httpConfig.http).toBeDefined();
    expect(httpConfig.http).toHaveProperty('url');

    // 创建完整的STDIO类型配置
    const stdioConfig: McpConfig = {
      name: 'stdio-mcp',
      enabled: true,
      type: 'stdio',
      stdio: {
        command: 'python',
        args: ['-m', 'mcp_server']
      }
    };

    // 验证STDIO配置字段
    expect(stdioConfig.type).toBe('stdio');
    expect(stdioConfig.stdio).toBeDefined();
    expect(stdioConfig.stdio).toHaveProperty('command');
    expect(stdioConfig.stdio).toHaveProperty('args');
  });

  test('CT-Type-McpConfig-02: HttpConfig接口应符合预期结构', () => {
    // 创建HttpConfig对象
    const httpConfig: HttpConfig = {
      url: 'http://localhost:3000'
    };

    // 验证结构
    expect(httpConfig).toHaveProperty('url');
    expect(typeof httpConfig.url).toBe('string');
  });

  test('CT-Type-McpConfig-03: StdioConfig接口应符合预期结构', () => {
    // 创建最小化StdioConfig对象
    const minStdioConfig: StdioConfig = {
      command: 'python'
    };

    // 验证必需字段
    expect(minStdioConfig).toHaveProperty('command');
    expect(typeof minStdioConfig.command).toBe('string');

    // 创建完整StdioConfig对象
    const fullStdioConfig: StdioConfig = {
      command: 'python',
      args: ['-m', 'mcp_server']
    };

    // 验证可选字段
    expect(fullStdioConfig).toHaveProperty('args');
    expect(Array.isArray(fullStdioConfig.args)).toBe(true);
  });
});

describe('CT-Type-McpError', () => {
  test('CT-Type-McpError-01: McpError类应符合预期结构', () => {
    // 创建McpError实例
    const error = new McpError('TEST_ERROR', 'Test error message');

    // 验证属性
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(McpError);
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('name');

    // 验证方法
    expect(typeof error.toString).toBe('function');

    // 验证值
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.name).toBe('McpError');
  });

  test('CT-Type-McpError-02: McpErrorType枚举应包含所有错误类型', () => {
    // 验证所有预期的错误类型存在
    expect(McpErrorType).toHaveProperty('TOOL_NOT_FOUND');
    expect(McpErrorType).toHaveProperty('TOOL_EXECUTION_FAILED');
    expect(McpErrorType).toHaveProperty('RESOURCE_NOT_FOUND');
    expect(McpErrorType).toHaveProperty('PROMPT_NOT_FOUND');
    expect(McpErrorType).toHaveProperty('MODEL_ERROR');
    expect(McpErrorType).toHaveProperty('NETWORK_ERROR');
    expect(McpErrorType).toHaveProperty('PERMISSION_DENIED');
    expect(McpErrorType).toHaveProperty('UNKNOWN_ERROR');

    // 验证值为字符串
    Object.values(McpErrorType).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  test('CT-Type-McpError-03: McpError应支持详细信息', () => {
    // 创建带详细信息的McpError
    const details = { requestId: '123', status: 404 };
    const error = new McpError('RESOURCE_NOT_FOUND', 'Resource not found', details);

    // 验证详细信息存在
    expect(error).toHaveProperty('details');
    expect(error.details).toEqual(details);
  });
});
