import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigManager } from '../../core/config';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 模拟fs模块
vi.mock('fs');

// 模拟path模块
vi.mock('path');

// 模拟os模块
vi.mock('os');

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const mockConfigDir = '/mock/home/.dpml';
  const mockConfigPath = '/mock/home/.dpml/config.json';
  const mockMappingPath = '/mock/home/.dpml/domain-mapping.json';

  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟os.homedir
    os.homedir = vi.fn().mockReturnValue('/mock/home');

    // 模拟path.join
    path.join = vi.fn().mockImplementation((...args) => args.join('/'));

    // 模拟fs方法
    fs.existsSync = vi.fn().mockReturnValue(false);
    fs.mkdirSync = vi.fn();
    fs.readFileSync = vi.fn();
    fs.writeFileSync = vi.fn();

    // 初始化测试对象
    configManager = new ConfigManager();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // UT-CF-001: 配置加载
  describe('配置加载', () => {
    it('当配置文件不存在时应返回false', () => {
      fs.existsSync = vi.fn().mockReturnValue(false);

      const result = configManager.load();

      expect(result).toBe(false);
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    it('应该能成功加载配置文件', () => {
      // 模拟配置文件存在
      fs.existsSync = vi.fn().mockReturnValue(true);

      // 模拟配置文件内容
      const mockConfig = { version: '1.0.0', setting: 'value' };
      fs.readFileSync = vi.fn().mockReturnValue(JSON.stringify(mockConfig));

      const result = configManager.load();

      expect(result).toBe(true);
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf-8');

      // 验证配置已加载
      expect(configManager.get('version')).toBe('1.0.0');
      expect(configManager.get('setting')).toBe('value');
    });

    it('当配置文件格式无效时应返回false', () => {
      // 模拟配置文件存在但内容无效
      fs.existsSync = vi.fn().mockReturnValue(true);
      fs.readFileSync = vi.fn().mockReturnValue('invalid json');

      const result = configManager.load();

      expect(result).toBe(false);
    });
  });

  // UT-CF-002: 配置保存
  describe('配置保存', () => {
    it('应该能成功保存配置', () => {
      // 模拟ensureConfigDir成功
      configManager.ensureConfigDir = vi.fn().mockReturnValue(true);

      // 设置一些配置项
      configManager.set('version', '1.0.0');
      configManager.set('setting', 'value');

      const result = configManager.save();

      expect(result).toBe(true);
      expect(configManager.ensureConfigDir).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'utf-8'
      );

      // Verify the content contains our expected values
      const writeCall = fs.writeFileSync.mock.calls[0];
      const content = writeCall[1];
      expect(content).toContain('"version"');
      expect(content).toContain('"1.0.0"');
    });

    it('当写入文件失败时应返回false', () => {
      // 模拟ensureConfigDir成功
      configManager.ensureConfigDir = vi.fn().mockReturnValue(true);

      // 模拟写入失败
      fs.writeFileSync = vi.fn().mockImplementation(() => {
        throw new Error('Write error');
      });

      const result = configManager.save();

      expect(result).toBe(false);
    });
  });

  // UT-CF-003: 配置项访问
  describe('配置项访问', () => {
    it('应该能获取已设置的配置项', () => {
      // 设置配置项
      configManager.set('testKey', 'testValue');

      // 获取配置项
      const value = configManager.get('testKey');

      expect(value).toBe('testValue');
    });

    it('当配置项不存在时应返回默认值', () => {
      const value = configManager.get('nonExistent', 'defaultValue');

      expect(value).toBe('defaultValue');
    });

    it('当配置项不存在且未提供默认值时应返回null', () => {
      const value = configManager.get('nonExistent');

      expect(value).toBeNull();
    });

    it('应该能设置和更新配置项', () => {
      // 设置配置项
      configManager.set('testKey', 'initialValue');
      expect(configManager.get('testKey')).toBe('initialValue');

      // 更新配置项
      configManager.set('testKey', 'updatedValue');
      expect(configManager.get('testKey')).toBe('updatedValue');
    });
  });

  // UT-CF-004: 目录创建
  describe('目录创建', () => {
    it('当目录不存在时应创建目录', () => {
      // 模拟目录不存在
      fs.existsSync = vi.fn().mockReturnValue(false);

      const result = configManager.ensureConfigDir();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('当目录已存在时不应创建目录', () => {
      // 模拟目录已存在
      fs.existsSync = vi.fn().mockReturnValue(true);

      const result = configManager.ensureConfigDir();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('当创建目录失败时应返回false', () => {
      // 模拟目录不存在
      fs.existsSync = vi.fn().mockReturnValue(false);

      // 模拟创建失败
      fs.mkdirSync = vi.fn().mockImplementation(() => {
        throw new Error('Create directory error');
      });

      const result = configManager.ensureConfigDir();

      expect(result).toBe(false);
    });
  });

  // UT-CF-005: 配置默认值
  describe('配置默认值', () => {
    it('应该使用默认配置目录', () => {
      expect(configManager.getConfigFilePath()).toContain('.dpml');
      expect(configManager.getMappingFilePath()).toContain('.dpml');
    });

    it('应该能使用自定义配置选项', () => {
      const customConfigManager = new ConfigManager({
        configDir: '/custom/config/dir',
        configFileName: 'custom-config.json',
        mappingFileName: 'custom-mapping.json'
      });

      expect(customConfigManager.getConfigFilePath()).toContain('custom-config.json');
      expect(customConfigManager.getMappingFilePath()).toContain('custom-mapping.json');
    });
  });
});
