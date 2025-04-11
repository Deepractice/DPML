/**
 * Security Utils单元测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecurityUtils, SecurityConstants } from '../../../src/security';

describe('SecurityUtils', () => {
  // 保存原始环境变量
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // 设置测试环境变量
    process.env.API_KEY = 'test-api-key';
    process.env.SECRET_TOKEN = 'test-secret-token';
    process.env.NORMAL_VAR = 'normal-value';
  });
  
  afterEach(() => {
    // 恢复原始环境变量
    process.env = { ...originalEnv };
  });
  
  // UT-SEC-001: 测试API密钥保护
  describe('isSensitiveEnvName', () => {
    it('should identify sensitive environment variable names (UT-SEC-001)', () => {
      expect(SecurityUtils.isSensitiveEnvName('API_KEY')).toBe(true);
      expect(SecurityUtils.isSensitiveEnvName('SECRET_TOKEN')).toBe(true);
      expect(SecurityUtils.isSensitiveEnvName('PASSWORD')).toBe(true);
      expect(SecurityUtils.isSensitiveEnvName('NORMAL_VAR')).toBe(false);
      expect(SecurityUtils.isSensitiveEnvName('DEBUG')).toBe(false);
    });
    
    it('should handle case insensitivity', () => {
      expect(SecurityUtils.isSensitiveEnvName('api_key')).toBe(true);
      expect(SecurityUtils.isSensitiveEnvName('Secret_Token')).toBe(true);
    });
  });
  
  // UT-SEC-002: 测试环境变量验证
  describe('envExists and getExistingEnvs', () => {
    it('should check if environment variables exist (UT-SEC-002)', () => {
      expect(SecurityUtils.envExists('API_KEY')).toBe(true);
      expect(SecurityUtils.envExists('NON_EXISTENT_VAR')).toBe(false);
    });
    
    it('should get a list of existing environment variables', () => {
      const envs = ['API_KEY', 'SECRET_TOKEN', 'NON_EXISTENT_VAR'];
      const existing = SecurityUtils.getExistingEnvs(envs);
      
      expect(existing).toContain('API_KEY');
      expect(existing).toContain('SECRET_TOKEN');
      expect(existing).not.toContain('NON_EXISTENT_VAR');
      expect(existing.length).toBe(2);
    });
  });
  
  describe('safeGetEnv', () => {
    // UT-SEC-001: 测试API密钥保护
    it('should safely get environment variables (UT-SEC-001)', () => {
      expect(SecurityUtils.safeGetEnv('NORMAL_VAR')).toBe('normal-value');
      expect(SecurityUtils.safeGetEnv('NON_EXISTENT_VAR', 'default')).toBe('default');
    });
  });
  
  describe('isSafeFileExtension', () => {
    // UT-SEC-007: 测试路径遍历防护
    it('should validate file extensions (UT-SEC-007)', () => {
      expect(SecurityUtils.isSafeFileExtension('file.txt')).toBe(true);
      expect(SecurityUtils.isSafeFileExtension('file.json')).toBe(true);
      expect(SecurityUtils.isSafeFileExtension('file.exe')).toBe(false);
      expect(SecurityUtils.isSafeFileExtension('file.bat')).toBe(false);
    });
    
    it('should support custom safe extensions', () => {
      const customExtensions = ['.xml', '.yaml'];
      expect(SecurityUtils.isSafeFileExtension('file.xml', customExtensions)).toBe(true);
      expect(SecurityUtils.isSafeFileExtension('file.yaml', customExtensions)).toBe(true);
      expect(SecurityUtils.isSafeFileExtension('file.txt', customExtensions)).toBe(false);
    });
    
    it('should handle files without extensions', () => {
      expect(SecurityUtils.isSafeFileExtension('noextension')).toBe(false);
    });
  });
  
  describe('SecurityConstants', () => {
    it('should define common sensitive patterns', () => {
      expect(SecurityConstants.SENSITIVE_ENV_PATTERNS.length).toBeGreaterThan(0);
      expect(SecurityConstants.SENSITIVE_LOG_FIELDS.length).toBeGreaterThan(0);
      expect(SecurityConstants.SAFE_FILE_EXTENSIONS.length).toBeGreaterThan(0);
    });
  });
}); 