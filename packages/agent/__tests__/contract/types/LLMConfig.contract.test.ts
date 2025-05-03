/**
 * LLMConfig Types契约测试
 * 
 * 验证LLMConfig类型的结构稳定性。
 */
import { describe, test, expect } from 'vitest';
import { LLMConfig } from '../../../src/types';

describe('CT-Type-LLMConfig', () => {
  test('CT-Type-LLMConfig-01: LLMConfig类型应符合公开契约', () => {
    // 创建完整的LLMConfig对象
    const fullConfig: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4',
      apiKey: 'sk-test123',
      apiUrl: 'https://custom-api.example.com/v1'
    };
    
    // 验证必需字段
    expect(fullConfig).toHaveProperty('apiType');
    expect(fullConfig).toHaveProperty('model');
    
    // 验证可选字段
    expect(fullConfig).toHaveProperty('apiKey');
    expect(fullConfig).toHaveProperty('apiUrl');
  });
  
  test('CT-Type-LLMConfig-02: LLMConfig应支持最小化配置', () => {
    // 创建最小化配置（仅必需字段）
    const minimalConfig: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4'
    };
    
    // 验证结构
    expect(minimalConfig).toHaveProperty('apiType');
    expect(minimalConfig).toHaveProperty('model');
    
    // 验证可选字段可以省略
    expect(minimalConfig.apiKey).toBeUndefined();
    expect(minimalConfig.apiUrl).toBeUndefined();
  });
  
  test('CT-Type-LLMConfig-03: LLMConfig应支持不同的API类型', () => {
    // 创建不同API类型的配置
    const openaiConfig: LLMConfig = {
      apiType: 'openai',
      model: 'gpt-4'
    };
    
    const anthropicConfig: LLMConfig = {
      apiType: 'anthropic',
      model: 'claude-3'
    };
    
    const customConfig: LLMConfig = {
      apiType: 'custom',
      model: 'custom-model'
    };
    
    // 验证所有配置都符合LLMConfig类型
    const configs: LLMConfig[] = [openaiConfig, anthropicConfig, customConfig];
    expect(configs.length).toBe(3);
    
    // 验证apiType字段值的灵活性
    configs.forEach(config => {
      expect(config).toHaveProperty('apiType');
      expect(typeof config.apiType).toBe('string');
    });
  });
}); 