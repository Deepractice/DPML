import { describe, test, expect } from 'vitest';
import { runCLIProcess } from '../../helpers/cli-process-runner';

/**
 * CLI命令解析问题回归测试
 * 
 * 这些测试精确验证CLI模块中发现的命令行解析问题。
 * 注意：这些测试预期会失败，直到问题修复完成。
 * 
 * 相关issue: cli-command-parsing-issues.md
 */
describe('CLI Command Parsing Issues', () => {
  
  describe('Issue 1: --list选项要求提供domain参数', () => {
    test('--list应作为独立命令运行，不需要domain参数', async () => {
      const result = await runCLIProcess(['--list']);
      
      // 当前预期会失败 - 应返回域列表而非要求参数
      // 测试失败说明问题存在，修复后应通过
      expect(result.exitCode).toBe(0);
      expect(result.stderr).not.toContain('missing required argument');
      expect(result.stdout).toContain('Available DPML domains');
    });
    
    test('list应作为子命令可用（可能的修复方式）', async () => {
      const result = await runCLIProcess(['list']);
      
      // 测试可能的修复方案 - 将list作为子命令
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Available DPML domains');
    });
  });
  
  describe('Issue 2: 版本显示问题', () => {
    test('--version应显示实际版本号而非[object Promise]', async () => {
      const result = await runCLIProcess(['--version']);
      
      // 当前预期会失败 - 显示了Promise对象而非版本号
      // 测试失败说明问题存在，修复后应通过
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/);
      expect(result.stdout).not.toContain('[object Promise]');
    });
    
    test('-v简写应显示实际版本号', async () => {
      const result = await runCLIProcess(['-v']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+$/);
      expect(result.stdout).not.toContain('[object Promise]');
    });
  });
  
  describe('Issue 3: 命令解析顺序问题', () => {
    test('所有全局选项都应不需要domain参数', async () => {
      const versionResult = await runCLIProcess(['--version']);
      const helpResult = await runCLIProcess(['--help']);
      const listResult = await runCLIProcess(['--list']);
      
      // 所有全局选项都应成功执行，不要求domain参数
      expect(versionResult.exitCode).toBe(0);
      expect(helpResult.exitCode).toBe(0);
      expect(listResult.exitCode).toBe(0);
      
      // 不应包含"missing required argument"错误
      expect(versionResult.stderr).not.toContain('missing required argument');
      expect(helpResult.stderr).not.toContain('missing required argument');
      expect(listResult.stderr).not.toContain('missing required argument');
    });
  });
  
  describe('Issue 4: 域名识别问题和错误信息不完善', () => {
    test('无效域名错误应提供可用域列表', async () => {
      const result = await runCLIProcess(['nonexistent-domain']);
      
      // 当前预期会失败 - 错误信息不包含可用域列表
      // 测试失败说明问题存在，修复后应通过
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Domain not found: nonexistent-domain');
      expect(result.stderr).toMatch(/Available domains|Available DPML domains/);
      
      // 应列出至少一个可用域名
      const output = result.stderr + result.stdout;
      expect(output).toMatch(/(core|agent)/);
    });
  });
  
  describe('整体命令行用户体验', () => {
    test('帮助信息应包含所有可用命令和示例', async () => {
      const result = await runCLIProcess(['--help']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Options:');
      expect(result.stdout).toContain('Example:');
      expect(result.stdout).toContain('--list');
      expect(result.stdout).toContain('--version');
    });
    
    test('不带参数执行应显示帮助信息', async () => {
      const result = await runCLIProcess([]);
      
      expect(result.exitCode).not.toBe(0); // 当前可能失败，因为需要domain
      expect(result.stderr + result.stdout).toMatch(/(Usage|Options|help)/i);
    });
  });
}); 