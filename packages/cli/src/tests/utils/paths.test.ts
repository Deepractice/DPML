import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  getUserHome,
  getDpmlConfigDir,
  getMappingFilePath,
  getConfigFilePath,
  ensureDir,
  findNodeModules,
  pathExists,
  resolveRelativePath,
  getUserDataDir,
  isPathSafe,
  normalizePath,
  getFileExtension,
  getFileName,
  getDirName,
  joinPaths,
} from '../../utils/paths';

// 模拟模块
vi.mock('os');
vi.mock('fs');
vi.mock('child_process');
vi.mock('path');

describe('路径工具测试', () => {
  // 在每个测试前重置模拟
  beforeEach(() => {
    vi.resetAllMocks();

    // 设置默认模拟返回值
    vi.mocked(os.homedir).mockReturnValue('/home/user');
    vi.mocked(os.platform).mockReturnValue('darwin');
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  // 在每个测试后清理模拟
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserHome', () => {
    it('应返回用户主目录', () => {
      // 模拟os.homedir返回值
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      // 测试函数
      const result = getUserHome();

      // 验证结果
      expect(result).toBe('/home/user');
      expect(os.homedir).toHaveBeenCalled();
    });
  });

  describe('getDpmlConfigDir', () => {
    it('应返回DPML配置目录', () => {
      // 模拟os.homedir返回值
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      // 测试函数
      const result = getDpmlConfigDir();

      // 验证结果
      expect(result).toBe('/home/user/.dpml');
    });
  });

  describe('getMappingFilePath', () => {
    it('应返回映射文件路径', () => {
      // 模拟os.homedir返回值
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      // 测试函数
      const result = getMappingFilePath();

      // 验证结果
      expect(result).toBe('/home/user/.dpml/domain-mapping.json');
    });
  });

  describe('getConfigFilePath', () => {
    it('应返回配置文件路径', () => {
      // 模拟os.homedir返回值
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      // 测试函数
      const result = getConfigFilePath();

      // 验证结果
      expect(result).toBe('/home/user/.dpml/config.json');
    });
  });

  describe('ensureDir', () => {
    it('当目录不存在时应创建目录', () => {
      // 模拟fs.existsSync返回值
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // 测试函数
      const result = ensureDir('/path/to/dir');

      // 验证结果
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/dir');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to/dir', {
        recursive: true,
      });
    });

    it('当目录已存在时不应创建目录', () => {
      // 模拟fs.existsSync返回值
      vi.mocked(fs.existsSync).mockReturnValue(true);

      // 测试函数
      const result = ensureDir('/path/to/dir');

      // 验证结果
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/dir');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('当创建目录失败时应返回false', () => {
      // 模拟fs.existsSync返回值
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // 模拟fs.mkdirSync抛出错误
      vi.mocked(fs.mkdirSync).mockImplementation(() => {
        throw new Error('创建目录失败');
      });

      // 测试函数
      const result = ensureDir('/path/to/dir');

      // 验证结果
      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/dir');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to/dir', {
        recursive: true,
      });
    });
  });

  describe('pathExists', () => {
    it('当路径存在时应返回true', () => {
      // 模拟fs.existsSync返回值
      vi.mocked(fs.existsSync).mockReturnValue(true);

      // 测试函数
      const result = pathExists('/path/to/file');

      // 验证结果
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file');
    });

    it('当路径不存在时应返回false', () => {
      // 模拟fs.existsSync返回值
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // 测试函数
      const result = pathExists('/path/to/file');

      // 验证结果
      expect(result).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file');
    });
  });

  describe('resolveRelativePath', () => {
    it('应将相对路径解析为绝对路径', () => {
      // 保存原始process.cwd
      const originalCwd = process.cwd;

      // 模拟process.cwd
      process.cwd = vi.fn().mockReturnValue('/current/dir');

      // 测试函数
      const result = resolveRelativePath('relative/path');

      // 验证结果
      expect(result).toBe('/current/dir/relative/path');

      // 恢复原始process.cwd
      process.cwd = originalCwd;
    });
  });

  describe('getUserDataDir', () => {
    it('应返回用户数据目录', () => {
      // 模拟os.homedir返回值
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      // 测试函数
      const result = getUserDataDir();

      // 验证结果
      expect(result).toBe('/home/user/.dpml/data');
    });

    it('应返回指定应用的用户数据目录', () => {
      // 模拟os.homedir返回值
      vi.mocked(os.homedir).mockReturnValue('/home/user');

      // 测试函数
      const result = getUserDataDir('myapp');

      // 验证结果
      expect(result).toBe('/home/user/.dpml/data/myapp');
    });
  });

  describe('isPathSafe', () => {
    it('应拒绝包含路径遍历的路径', () => {
      expect(isPathSafe('/base/dir', '/base/dir/file.txt')).toBe(true);
      expect(isPathSafe('/base/dir', '/base/dir/../file.txt')).toBe(false);
      expect(isPathSafe('/base/dir', '/base/dir/subdir/../../file.txt')).toBe(
        false
      );
      expect(isPathSafe('/base/dir', '/other/dir/file.txt')).toBe(false);
    });

    it('应正确处理Windows路径', () => {
      vi.mocked(os.platform).mockReturnValue('win32');

      expect(isPathSafe('C:\\base\\dir', 'C:\\base\\dir\\file.txt')).toBe(true);
      expect(isPathSafe('C:\\base\\dir', 'C:\\base\\dir\\..\\file.txt')).toBe(
        false
      );
      expect(isPathSafe('C:\\base\\dir', 'D:\\base\\dir\\file.txt')).toBe(
        false
      );
    });
  });

  describe('normalizePath', () => {
    it('应标准化不同平台的路径', () => {
      // 测试Unix路径
      vi.mocked(os.platform).mockReturnValue('darwin');
      expect(normalizePath('/path/to/file')).toBe('/path/to/file');
      expect(normalizePath('path/to/file')).toBe('path/to/file');

      // 测试Windows路径
      vi.mocked(os.platform).mockReturnValue('win32');
      expect(normalizePath('C:\\path\\to\\file')).toBe('C:\\path\\to\\file');
      expect(normalizePath('/path/to/file')).toBe('\\path\\to\\file');
    });
  });

  describe('getFileExtension', () => {
    it('应返回文件扩展名', () => {
      expect(getFileExtension('file.txt')).toBe('.txt');
      expect(getFileExtension('file.tar.gz')).toBe('.gz');
      expect(getFileExtension('file')).toBe('');
      expect(getFileExtension('.gitignore')).toBe('');
    });
  });

  describe('getFileName', () => {
    it('应返回文件名', () => {
      expect(getFileName('/path/to/file.txt')).toBe('file.txt');
      expect(getFileName('file.txt')).toBe('file.txt');
      expect(getFileName('/path/to/')).toBe('');
    });
  });

  describe('getDirName', () => {
    it('应返回目录名', () => {
      expect(getDirName('/path/to/file.txt')).toBe('/path/to');
      expect(getDirName('file.txt')).toBe('.');
      expect(getDirName('/path/to/')).toBe('/path/to');
    });
  });

  describe('joinPaths', () => {
    it('应连接多个路径段', () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      expect(joinPaths('path', 'to', 'file.txt')).toBe('path/to/file.txt');
      expect(joinPaths('/path', 'to', 'file.txt')).toBe('/path/to/file.txt');
      expect(joinPaths('', 'to', 'file.txt')).toBe('to/file.txt');
    });

    it('应处理不同平台的路径分隔符', () => {
      vi.mocked(os.platform).mockReturnValue('win32');
      expect(joinPaths('path', 'to', 'file.txt')).toBe('path\\to\\file.txt');
    });
  });
});
