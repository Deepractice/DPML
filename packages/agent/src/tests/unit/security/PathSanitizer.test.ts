/**
 * PathSanitizer单元测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { PathSanitizer } from '../../../security/PathSanitizer';
import { SecurityError } from '../../../errors/types';

describe('PathSanitizer', () => {
  let testDir: string;
  
  beforeEach(() => {
    // 创建临时测试目录
    testDir = path.join(__dirname, 'test-dir');
    fs.mkdirSync(testDir, { recursive: true });
  });
  
  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  // UT-SEC-007: 测试路径遍历防护
  describe('sanitizeFilePath', () => {
    it('should reject parent traversal attempts (UT-SEC-007)', () => {
      const maliciousPath = '../../../etc/passwd';
      
      expect(() => {
        PathSanitizer.sanitizeFilePath(maliciousPath);
      }).toThrow(SecurityError);
    });
    
    it('should reject absolute paths by default', () => {
      const absolutePath = '/etc/passwd';
      
      expect(() => {
        PathSanitizer.sanitizeFilePath(absolutePath);
      }).toThrow(SecurityError);
    });
    
    it('should allow absolute paths when configured', () => {
      const absolutePath = '/etc/passwd';
      
      const result = PathSanitizer.sanitizeFilePath(absolutePath, {
        allowAbsolutePath: true
      });
      
      expect(result).toBe(path.resolve(absolutePath));
    });
    
    it('should reject invalid file extensions', () => {
      const filePath = 'config.exe';
      
      expect(() => {
        PathSanitizer.sanitizeFilePath(filePath, {
          allowedExtensions: ['.txt', '.json']
        });
      }).toThrow(SecurityError);
    });
    
    it('should allow valid file extensions', () => {
      const filePath = 'config.json';
      
      const result = PathSanitizer.sanitizeFilePath(filePath, {
        allowedExtensions: ['.txt', '.json']
      });
      
      expect(result).toBe(path.resolve(filePath));
    });
    
    it('should enforce base directory restriction', () => {
      const filePath = '../config.json';
      
      expect(() => {
        PathSanitizer.sanitizeFilePath(filePath, {
          baseDir: testDir
        });
      }).toThrow(SecurityError);
      
      // 正常路径应该成功
      const validPath = 'config.json';
      const result = PathSanitizer.sanitizeFilePath(validPath, {
        baseDir: testDir
      });
      
      expect(result).toBe(path.resolve(testDir, validPath));
    });
  });
  
  describe('createSafeFileName', () => {
    it('should remove unsafe characters', () => {
      const unsafeName = 'file<>:"/\\|?*name.txt';
      const safeName = PathSanitizer.createSafeFileName(unsafeName);
      
      expect(safeName).not.toContain('<');
      expect(safeName).not.toContain('>');
      expect(safeName).not.toContain(':');
      expect(safeName).not.toContain('"');
      expect(safeName).not.toContain('/');
      expect(safeName).not.toContain('\\');
      expect(safeName).not.toContain('|');
      expect(safeName).not.toContain('?');
      expect(safeName).not.toContain('*');
      expect(safeName).toMatch(/^[a-zA-Z0-9_\-.]+$/);
    });
    
    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const safeName = PathSanitizer.createSafeFileName(longName);
      
      expect(safeName.length).toBeLessThanOrEqual(255);
    });
  });
  
  describe('safeCreateDirectory', () => {
    it('should create directory safely', () => {
      const dirPath = path.join(testDir, 'safe-dir');
      
      const result = PathSanitizer.safeCreateDirectory(dirPath, {
        allowAbsolutePath: true
      });
      
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      expect(result).toBe(path.resolve(dirPath));
    });
    
    it('should reject unsafe directory paths', () => {
      const unsafePath = path.join(testDir, '../unsafe-dir');
      
      expect(() => {
        PathSanitizer.safeCreateDirectory(unsafePath, {
          baseDir: testDir,
          allowAbsolutePath: true
        });
      }).toThrow(SecurityError);
    });
  });
  
  describe('safeReadFile and safeWriteFile', () => {
    it('should safely write and read files', () => {
      const filePath = path.join(testDir, 'test.txt');
      const content = 'Test content';
      
      // 写入文件
      PathSanitizer.safeWriteFile(filePath, content, {
        allowAbsolutePath: true
      });
      
      // 读取文件
      const readContent = PathSanitizer.safeReadFile(filePath, {
        allowAbsolutePath: true
      });
      
      expect(readContent).toBe(content);
    });
    
    it('should reject unsafe file operations', () => {
      const unsafePath = path.join(testDir, '../test.txt');
      
      expect(() => {
        PathSanitizer.safeWriteFile(unsafePath, 'test', {
          baseDir: testDir,
          allowAbsolutePath: true
        });
      }).toThrow(SecurityError);
      
      // 创建一个文件
      const filePath = path.join(testDir, 'test.txt');
      fs.writeFileSync(filePath, 'test');
      
      // 尝试读取目录作为文件
      expect(() => {
        PathSanitizer.safeReadFile(testDir, {
          allowAbsolutePath: true
        });
      }).toThrow(SecurityError);
    });
  });
}); 