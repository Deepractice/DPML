import { describe, test, expect, vi } from 'vitest';

import { registerMcp } from '../../../api/mcp';
import { registerEnhancer } from '../../../core/mcpService';

vi.mock('../../../core/mcpService', () => ({
  registerEnhancer: vi.fn()
}));

describe('MCP API契约测试', () => {
  test('registerMcp应具有正确的函数签名', () => {
    // 确认函数存在
    expect(registerMcp).toBeDefined();

    // 确认是一个函数
    expect(typeof registerMcp).toBe('function');
  });

  test('registerMcp应委托给mcpService.registerEnhancer', () => {
    // 准备测试数据
    const config = {
      name: 'test-mcp',
      enabled: true,
      type: 'http' as const,
      http: {
        url: 'http://localhost:3000'
      }
    };

    // 调用API
    registerMcp(config);

    // 验证委托调用
    expect(registerEnhancer).toHaveBeenCalledTimes(1);
    expect(registerEnhancer).toHaveBeenCalledWith(config);
  });
});
