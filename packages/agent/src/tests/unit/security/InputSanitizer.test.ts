/**
 * InputSanitizer单元测试
 */
import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '../../../security/InputSanitizer';
import { SecurityError } from '../../../errors/types';

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    // UT-SEC-003: 测试输入验证与过滤
    it('should sanitize input with default strategy (UT-SEC-003)', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      const sanitized = InputSanitizer.sanitizeString(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });
    
    it('should apply strict strategy correctly', () => {
      const input = 'Hello @#$%^&* World!';
      const sanitized = InputSanitizer.sanitizeString(input, { strategy: 'strict' });
      
      expect(sanitized).not.toContain('@#$%^&*');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World!');
    });
    
    it('should apply permissive strategy correctly', () => {
      const input = 'Hello @#$%^&* World <script>';
      const sanitized = InputSanitizer.sanitizeString(input, { strategy: 'permissive' });
      
      expect(sanitized).toContain('@#$%^&*');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });
    
    it('should apply custom pattern correctly', () => {
      const input = 'Hello 123 World';
      const sanitized = InputSanitizer.sanitizeString(input, { pattern: /\d+/g });
      
      expect(sanitized).not.toContain('123');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });
    
    it('should check for maximum length', () => {
      const input = 'A'.repeat(100);
      
      expect(() => {
        InputSanitizer.sanitizeString(input, { maxLength: 50 });
      }).toThrow(SecurityError);
    });
    
    it('should handle empty input based on options', () => {
      expect(() => {
        InputSanitizer.sanitizeString('', { allowEmpty: false });
      }).toThrow(SecurityError);
      
      expect(InputSanitizer.sanitizeString('', { allowEmpty: true })).toBe('');
    });
  });
  
  describe('sanitizeFilePath', () => {
    // UT-SEC-007: 测试路径遍历防护
    it('should sanitize file paths correctly (UT-SEC-007)', () => {
      const path = '../../../etc/passwd';
      const sanitized = InputSanitizer.sanitizeFilePath(path);
      
      expect(sanitized).not.toContain('../');
      // InputSanitizer只移除路径遍历尝试，不移除具体文件路径
      expect(sanitized).toContain('etc/passwd');
    });
    
    it('should normalize path separators', () => {
      const path = 'folder\\subfolder\\file.txt';
      const sanitized = InputSanitizer.sanitizeFilePath(path);
      
      expect(sanitized).not.toContain('\\');
      expect(sanitized).toContain('/');
    });
  });
  
  describe('sanitizeIdentifier', () => {
    // UT-SEC-003: 测试输入验证与过滤
    it('should sanitize identifiers (UT-SEC-003)', () => {
      const id = 'user@example.com;drop table users;';
      const sanitized = InputSanitizer.sanitizeIdentifier(id);
      
      expect(sanitized).not.toContain('@');
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain(' ');
      expect(sanitized).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });
  
  // UT-SEC-004: 测试敏感信息处理
  describe('containsSensitiveData', () => {
    it('should detect API keys (UT-SEC-004)', () => {
      const text = 'My API key is sk-1234567890abcdef';
      expect(InputSanitizer.containsSensitiveData(text)).toBe(true);
      
      const safe = 'This is safe text with no sensitive data';
      expect(InputSanitizer.containsSensitiveData(safe)).toBe(false);
    });
    
    it('should detect passwords', () => {
      const text = 'password: mysecretpassword123';
      expect(InputSanitizer.containsSensitiveData(text)).toBe(true);
    });
  });
  
  // UT-SEC-004: 测试敏感信息处理
  describe('removeSensitiveData', () => {
    it('should mask API keys (UT-SEC-004)', () => {
      const text = 'My API key is sk-1234567890abcdef';
      const safe = InputSanitizer.removeSensitiveData(text);
      
      expect(safe).toContain('sk-12345');
      expect(safe).toContain('********');
      expect(safe).not.toContain('1234567890abcdef');
    });
    
    it('should mask passwords', () => {
      const text = 'password: mysecretpassword123';
      const safe = InputSanitizer.removeSensitiveData(text);
      
      expect(safe).toContain('password:');
      expect(safe).toContain('********');
      expect(safe).not.toContain('mysecretpassword123');
    });
    
    it('should handle multiple sensitive data in one string', () => {
      const text = 'API key: sk-1234567890abcdef, password: mysecretpassword123';
      const safe = InputSanitizer.removeSensitiveData(text);
      
      expect(safe).toContain('sk-12345');
      expect(safe).toContain('password:');
      expect(safe).not.toContain('1234567890abcdef');
      expect(safe).not.toContain('mysecretpassword123');
    });
  });
}); 