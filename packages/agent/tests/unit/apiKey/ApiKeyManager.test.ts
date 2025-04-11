/**
 * API密钥管理器单元测试
 * 
 * 测试从环境变量获取API密钥、密钥格式验证、环境变量缺失处理等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiKeyManager } from '../../../src/apiKey/ApiKeyManager';
import { ApiKeyError } from '../../../src/apiKey/ApiKeyError';

describe('ApiKeyManager', () => {
  // 备份原始环境变量
  const originalEnv = { ...process.env };
  
  // 每个测试前设置测试环境变量
  beforeEach(() => {
    process.env.TEST_API_KEY = 'sk-test12345abcdef';
    process.env.TEST_BACKUP_KEY = 'sk-backup67890ghijkl';
    process.env.INVALID_FORMAT_KEY = 'invalid-key-format';
    // 清除模拟函数
    vi.clearAllMocks();
  });
  
  // 每个测试后恢复原始环境变量
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  
  // UT-KEY-001: 测试从环境变量获取API密钥
  it('should retrieve API key from environment variable', async () => {
    const keyManager = new ApiKeyManager('openai');
    const apiKey = await keyManager.getApiKey('TEST_API_KEY');
    
    expect(apiKey).toBe('sk-test12345abcdef');
  });
  
  // UT-KEY-002: 测试API密钥格式验证
  it('should validate API key format', async () => {
    const keyManager = new ApiKeyManager('openai');
    
    // 有效密钥
    expect(await keyManager.validateApiKey('sk-test12345abcdef')).toBe(true);
    
    // 无效密钥
    expect(await keyManager.validateApiKey('invalid-key')).toBe(false);
  });
  
  // UT-KEY-003: 测试环境变量不存在情况
  it('should throw error when environment variable does not exist', async () => {
    const keyManager = new ApiKeyManager('openai');
    
    await expect(keyManager.getApiKey('NON_EXISTENT_KEY'))
      .rejects
      .toThrow(ApiKeyError);
    
    await expect(keyManager.getApiKey('NON_EXISTENT_KEY'))
      .rejects
      .toThrow('环境变量NON_EXISTENT_KEY不存在或未设置');
  });
  
  // UT-KEY-004: 测试密钥值的安全处理
  it('should handle API key securely, not exposing in error messages', async () => {
    const keyManager = new ApiKeyManager('openai');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      // 使用无效格式的密钥
      await keyManager.getApiKey('INVALID_FORMAT_KEY', true); // 开启验证
    } catch (error) {
      if (error instanceof ApiKeyError) {
        // 错误消息中不应包含密钥值
        expect(error.message).not.toContain(process.env.INVALID_FORMAT_KEY);
        expect(error.message).toContain('密钥格式无效');
      }
    }
    
    // 检查日志中不包含密钥
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining(process.env.INVALID_FORMAT_KEY || '')
    );
  });
  
  // UT-KEY-005: 测试运行时更新API密钥
  it('should allow updating API key at runtime', async () => {
    const keyManager = new ApiKeyManager('openai');
    const initialKey = await keyManager.getApiKey('TEST_API_KEY');
    
    // 更新环境变量
    process.env.TEST_API_KEY = 'sk-newkey12345abcdef';
    
    // 使用新值刷新
    await keyManager.refreshApiKey('TEST_API_KEY');
    const updatedKey = await keyManager.getApiKey('TEST_API_KEY');
    
    expect(initialKey).toBe('sk-test12345abcdef');
    expect(updatedKey).toBe('sk-newkey12345abcdef');
  });
  
  // UT-KEY-006: 测试支持多个环境变量轮换调用
  it('should try backup key when primary key fails', async () => {
    const keyManager = new ApiKeyManager('openai');
    
    // 设置环境变量优先级
    const keyEnvList = ['PRIMARY_KEY_ENV', 'TEST_BACKUP_KEY'];
    
    // 模拟第一个环境变量不存在
    const apiKey = await keyManager.getApiKeyWithFallback(keyEnvList);
    
    expect(apiKey).toBe('sk-backup67890ghijkl');
  });
  
  // UT-KEY-007: 测试密钥加载优先级
  it('should respect priority order when loading keys', async () => {
    const keyManager = new ApiKeyManager('openai');
    
    // 配置不同来源的密钥：环境变量、配置文件、默认值
    const result = await keyManager.getApiKeyFromSources({
      envVariables: ['NON_EXISTENT_ENV', 'TEST_API_KEY'],
      configFile: 'path/to/config.json', // 假设这个文件不存在
      defaultValue: 'sk-default12345'
    });
    
    // 应该按照环境变量>配置文件>默认值的优先级
    expect(result).toBe('sk-test12345abcdef');
    
    // 测试回退到默认值
    const fallbackResult = await keyManager.getApiKeyFromSources({
      envVariables: ['NON_EXISTENT_ENV'],
      defaultValue: 'sk-default12345'
    });
    
    expect(fallbackResult).toBe('sk-default12345');
  });
  
  // 测试不同API提供商的密钥格式
  it('should validate different API provider key formats', async () => {
    // OpenAI
    const openaiManager = new ApiKeyManager('openai');
    expect(await openaiManager.validateApiKey('sk-test12345abcdef')).toBe(true);
    expect(await openaiManager.validateApiKey('invalid')).toBe(false);
    
    // Anthropic
    const anthropicManager = new ApiKeyManager('anthropic');
    expect(await anthropicManager.validateApiKey('sk-ant-test123')).toBe(true);
    expect(await anthropicManager.validateApiKey('invalid')).toBe(false);
    
    // 其他提供商
    const customManager = new ApiKeyManager('custom');
    // 自定义提供商应该有宽松的验证
    expect(await customManager.validateApiKey('any-api-key')).toBe(true);
  });
}); 