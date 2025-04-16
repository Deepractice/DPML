import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  LLMConnectorFactory,
  OpenAIConnector,
  AnthropicConnector,
  LLMErrorType,
  LLMConnectorError,
} from '../../../connector';

import type { LLMConfig } from '../../../connector';

describe('LLMConnectorFactory', () => {
  // 保存原始环境变量
  const originalEnv = process.env;

  beforeEach(() => {
    // 模拟环境变量
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'test-openai-key',
      ANTHROPIC_API_KEY: 'test-anthropic-key',
    };

    // 清除工厂缓存
    LLMConnectorFactory.clearCache();

    // 模拟连接器构造函数
    vi.mock('../../connector/providers/OpenAIConnector', () => ({
      OpenAIConnector: vi.fn().mockImplementation((apiKey, apiUrl) => ({
        getType: () => 'openai',
        apiKey,
        apiUrl,
      })),
    }));

    vi.mock('../../connector/providers/AnthropicConnector', () => ({
      AnthropicConnector: vi
        .fn()
        .mockImplementation((apiKey, apiUrl, apiVersion) => ({
          getType: () => 'anthropic',
          apiKey,
          apiUrl,
          apiVersion,
        })),
    }));
  });

  afterEach(() => {
    // 恢复原始环境变量
    process.env = originalEnv;

    // 清除所有模拟
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('createConnector方法', () => {
    it('应创建OpenAI连接器', () => {
      const config: LLMConfig = {
        apiType: 'openai',
        apiUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY',
      };

      const connector = LLMConnectorFactory.createConnector(config);

      expect(connector).toBeDefined();
      expect(connector.getType()).toBe('openai');
      expect(OpenAIConnector).toHaveBeenCalledWith(
        'test-openai-key',
        'https://api.openai.com/v1'
      );
    });

    it('应创建Anthropic连接器', () => {
      const config: LLMConfig = {
        apiType: 'anthropic',
        apiUrl: 'https://api.anthropic.com',
        keyEnv: 'ANTHROPIC_API_KEY',
        apiVersion: '2023-06-01',
      };

      const connector = LLMConnectorFactory.createConnector(config);

      expect(connector).toBeDefined();
      expect(connector.getType()).toBe('anthropic');
      expect(AnthropicConnector).toHaveBeenCalledWith(
        'test-anthropic-key',
        'https://api.anthropic.com',
        '2023-06-01'
      );
    });

    it('应创建使用默认版本的Anthropic连接器', () => {
      const config: LLMConfig = {
        apiType: 'anthropic',
        apiUrl: 'https://api.anthropic.com',
        keyEnv: 'ANTHROPIC_API_KEY',
      };

      const connector = LLMConnectorFactory.createConnector(config);

      expect(connector).toBeDefined();
      expect(connector.getType()).toBe('anthropic');
      expect(AnthropicConnector).toHaveBeenCalledWith(
        'test-anthropic-key',
        'https://api.anthropic.com',
        '2023-06-01'
      );
    });

    it('应对不支持的API类型抛出错误', () => {
      const config: LLMConfig = {
        apiType: 'unsupported',
        apiUrl: 'https://api.example.com',
        keyEnv: 'API_KEY',
      };

      expect(() => LLMConnectorFactory.createConnector(config)).toThrow(
        LLMConnectorError
      );
      try {
        LLMConnectorFactory.createConnector(config);
      } catch (error) {
        expect((error as LLMConnectorError).type).toBe(
          LLMErrorType.BAD_REQUEST
        );
        expect((error as LLMConnectorError).message).toContain(
          '不支持的API类型'
        );
      }
    });

    it('应在环境变量缺失时抛出错误', () => {
      // 清除环境变量
      delete process.env.OPENAI_API_KEY;

      const config: LLMConfig = {
        apiType: 'openai',
        apiUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY',
      };

      expect(() => LLMConnectorFactory.createConnector(config)).toThrow(
        LLMConnectorError
      );
      try {
        LLMConnectorFactory.createConnector(config);
      } catch (error) {
        expect((error as LLMConnectorError).type).toBe(
          LLMErrorType.AUTHENTICATION
        );
        expect((error as LLMConnectorError).message).toContain(
          'OPENAI_API_KEY'
        );
      }
    });

    it('应支持无需认证的本地模型', () => {
      const config: LLMConfig = {
        apiType: 'openai',
        apiUrl: 'http://localhost:1234/v1',
        // 不提供keyEnv
      };

      const connector = LLMConnectorFactory.createConnector(config);

      expect(connector).toBeDefined();
      expect(connector.getType()).toBe('openai');
      expect(OpenAIConnector).toHaveBeenCalledWith(
        '',
        'http://localhost:1234/v1'
      );
    });

    it('应缓存相同配置的连接器实例', () => {
      const config: LLMConfig = {
        apiType: 'openai',
        apiUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY',
      };

      // 首次创建
      const connector1 = LLMConnectorFactory.createConnector(config);

      expect(OpenAIConnector).toHaveBeenCalledTimes(1);

      // 再次创建相同配置
      const connector2 = LLMConnectorFactory.createConnector(config);

      // 应返回缓存的实例，不会调用构造函数
      expect(OpenAIConnector).toHaveBeenCalledTimes(1);
      expect(connector1).toBe(connector2); // 引用相同
    });
  });

  describe('clearCache方法', () => {
    it('应清除所有缓存连接器', () => {
      // 创建两个不同的连接器
      const config1: LLMConfig = {
        apiType: 'openai',
        apiUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY',
      };

      const config2: LLMConfig = {
        apiType: 'anthropic',
        apiUrl: 'https://api.anthropic.com',
        keyEnv: 'ANTHROPIC_API_KEY',
      };

      // 创建连接器
      LLMConnectorFactory.createConnector(config1);
      LLMConnectorFactory.createConnector(config2);

      // 各1次调用
      expect(OpenAIConnector).toHaveBeenCalledTimes(1);
      expect(AnthropicConnector).toHaveBeenCalledTimes(1);

      // 清除所有缓存
      LLMConnectorFactory.clearCache();

      // 再次创建，调用次数应增加
      LLMConnectorFactory.createConnector(config1);
      LLMConnectorFactory.createConnector(config2);

      // 各2次调用
      expect(OpenAIConnector).toHaveBeenCalledTimes(2);
      expect(AnthropicConnector).toHaveBeenCalledTimes(2);
    });

    it('应清除特定类型的缓存连接器', () => {
      // 创建两个不同的连接器
      const config1: LLMConfig = {
        apiType: 'openai',
        apiUrl: 'https://api.openai.com/v1',
        keyEnv: 'OPENAI_API_KEY',
      };

      const config2: LLMConfig = {
        apiType: 'anthropic',
        apiUrl: 'https://api.anthropic.com',
        keyEnv: 'ANTHROPIC_API_KEY',
      };

      // 创建连接器
      LLMConnectorFactory.createConnector(config1);
      LLMConnectorFactory.createConnector(config2);

      // 各1次调用
      expect(OpenAIConnector).toHaveBeenCalledTimes(1);
      expect(AnthropicConnector).toHaveBeenCalledTimes(1);

      // 只清除openai类型的缓存
      LLMConnectorFactory.clearCache('openai');

      // 再次创建
      LLMConnectorFactory.createConnector(config1);
      LLMConnectorFactory.createConnector(config2);

      // OpenAI调用2次，Anthropic还是1次(使用缓存)
      expect(OpenAIConnector).toHaveBeenCalledTimes(2);
      expect(AnthropicConnector).toHaveBeenCalledTimes(1);
    });
  });
});
