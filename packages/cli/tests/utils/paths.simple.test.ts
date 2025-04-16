import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {
  getUserHome,
  getDpmlConfigDir,
  getMappingFilePath,
  getConfigFilePath,
  ensureDir,
  pathExists,
  resolveRelativePath,
  getUserDataDir,
  isPathSafe,
  normalizePath,
  getFileExtension,
  getFileName,
  getDirName,
  joinPaths
} from '../../src/utils/paths';

// 使用真实的函数进行测试，而不是模拟
describe('路径工具测试 (简化版)', () => {
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
      // 使用path.sep来确保测试在不同平台上都能通过
      const expected = ['path', 'to', 'file.txt'].join(path.sep);
      expect(joinPaths('path', 'to', 'file.txt')).toBe(expected);
    });
  });

  describe('isPathSafe', () => {
    it('应拒绝包含路径遍历的路径', () => {
      expect(isPathSafe('/base/dir', '/base/dir/file.txt')).toBe(true);
      expect(isPathSafe('/base/dir', '/base/dir/../file.txt')).toBe(false);
      expect(isPathSafe('/base/dir', '/base/dir/subdir/../../file.txt')).toBe(false);
      expect(isPathSafe('/base/dir', '/other/dir/file.txt')).toBe(false);
    });
  });

  describe('resolveRelativePath', () => {
    it('应将相对路径解析为绝对路径', () => {
      const cwd = process.cwd();
      expect(resolveRelativePath('relative/path')).toBe(path.resolve(cwd, 'relative/path'));
    });
  });
});
