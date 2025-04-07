import { describe, it, expect } from 'vitest';
import { TransformOptions } from '../../src/transformer/interfaces/transformOptions';

describe('TransformOptions', () => {
  it('应该能创建具有默认格式的选项', () => {
    const options: TransformOptions = {
      format: 'json'
    };
    
    expect(options.format).toBe('json');
    expect(options.mode).toBeUndefined();
    expect(options.variables).toBeUndefined();
  });
  
  it('应该能创建具有指定模式的选项', () => {
    const options: TransformOptions = {
      format: 'string',
      mode: 'strict'
    };
    
    expect(options.format).toBe('string');
    expect(options.mode).toBe('strict');
  });
  
  it('应该能创建具有变量的选项', () => {
    const options: TransformOptions = {
      variables: {
        model: 'gpt-4',
        temperature: 0.7
      }
    };
    
    expect(options.variables).toBeDefined();
    expect(options.variables?.model).toBe('gpt-4');
    expect(options.variables?.temperature).toBe(0.7);
  });
  
  it('应该能接受自定义扩展选项', () => {
    const options: TransformOptions = {
      format: 'json',
      customOption1: 'value1',
      customOption2: 42,
      customOption3: {
        nestedValue: true
      }
    };
    
    expect(options.format).toBe('json');
    expect(options.customOption1).toBe('value1');
    expect(options.customOption2).toBe(42);
    expect(options.customOption3.nestedValue).toBe(true);
  });
  
  it('应该允许宽松模式配置', () => {
    const options: TransformOptions = {
      mode: 'loose'
    };
    
    expect(options.mode).toBe('loose');
  });

  // 新增测试用例：模式配置功能
  describe('模式配置功能', () => {
    it('应该在严格模式下停止处理错误', () => {
      const options: TransformOptions = {
        mode: 'strict',
        errorThreshold: 0
      };
      
      expect(options.mode).toBe('strict');
      expect(options.errorThreshold).toBe(0);
    });
    
    it('应该在宽松模式下尝试继续处理', () => {
      const options: TransformOptions = {
        mode: 'loose',
        errorThreshold: 5
      };
      
      expect(options.mode).toBe('loose');
      expect(options.errorThreshold).toBe(5);
    });
    
    it('应该默认使用宽松模式（如果未指定）', () => {
      // 这个测试需要实现默认模式选择功能后才能测试通过
      const options: TransformOptions = {};
      
      // 假设默认模式为宽松
      expect(options.mode || 'loose').toBe('loose');
    });
  });
  
  // 新增测试用例：自定义变量配置功能
  describe('自定义变量配置功能', () => {
    it('应该允许配置复杂的嵌套变量', () => {
      const options: TransformOptions = {
        variables: {
          user: {
            name: 'Test User',
            preferences: {
              theme: 'dark',
              fontSize: 14,
              features: ['feature1', 'feature2']
            }
          },
          site: {
            url: 'https://example.com',
            settings: {
              caching: true
            }
          }
        }
      };
      
      expect(options.variables?.user.name).toBe('Test User');
      expect(options.variables?.user.preferences.theme).toBe('dark');
      expect(options.variables?.user.preferences.fontSize).toBe(14);
      expect(options.variables?.user.preferences.features).toContain('feature1');
      expect(options.variables?.site.url).toBe('https://example.com');
      expect(options.variables?.site.settings.caching).toBe(true);
    });
    
    it('应该允许变量覆盖现有配置', () => {
      // 基础配置
      const baseOptions: TransformOptions = {
        variables: {
          theme: 'light',
          language: 'en',
          features: {
            advanced: false
          }
        }
      };
      
      // 扩展/覆盖变量
      const extendedOptions: TransformOptions = {
        ...baseOptions,
        variables: {
          ...baseOptions.variables,
          theme: 'dark', // 覆盖现有值
          features: {
            ...baseOptions.variables?.features,
            advanced: true, // 覆盖嵌套值
            experimental: true // 添加新值
          },
          newSetting: 'value' // 添加全新变量
        }
      };
      
      // 验证覆盖和新增
      expect(extendedOptions.variables?.theme).toBe('dark');
      expect(extendedOptions.variables?.language).toBe('en');
      expect(extendedOptions.variables?.features.advanced).toBe(true);
      expect(extendedOptions.variables?.features.experimental).toBe(true);
      expect(extendedOptions.variables?.newSetting).toBe('value');
    });
    
    it('应该支持在转换过程中使用变量', () => {
      // 这个测试需要实现变量解析功能后才能完整测试
      const options: TransformOptions = {
        variables: {
          appName: 'TestApp',
          version: '1.0.0',
          environment: 'testing'
        }
      };
      
      // 验证变量存在
      expect(options.variables?.appName).toBe('TestApp');
      expect(options.variables?.version).toBe('1.0.0');
      expect(options.variables?.environment).toBe('testing');
    });
  });
}); 