/**
 * @dpml/common 集成测试索引文件
 * 
 * 本文件作为集成测试的入口点，导出测试报告和辅助函数
 */

import { expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 获取当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 测试报告相关
export interface TestResultSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: string;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

// 生成测试报告
export function generateTestReport(results: any): TestResultSummary {
  const summary: TestResultSummary = {
    total: results.numTotalTests || 0,
    passed: results.numPassedTests || 0,
    failed: results.numFailedTests || 0,
    skipped: results.numPendingTests || 0,
    duration: results.startTime ? Date.now() - results.startTime : 0,
    timestamp: new Date().toISOString(),
  };
  
  if (results.coverageMap) {
    const coverage = results.coverageMap.getCoverageSummary();
    summary.coverage = {
      statements: coverage.statements.pct,
      branches: coverage.branches.pct,
      functions: coverage.functions.pct,
      lines: coverage.lines.pct
    };
  }
  
  return summary;
}

// 保存测试报告到文件
export async function saveTestReport(report: TestResultSummary, fileName: string = 'integration-test-report.json'): Promise<string> {
  const reportPath = path.join(__dirname, '../../reports', fileName);
  
  // 确保目录存在
  await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
  
  // 写入报告
  await fs.promises.writeFile(
    reportPath,
    JSON.stringify(report, null, 2),
    'utf8'
  );
  
  return reportPath;
}

// 测试环境相关工具
export interface IntegrationEnvironment {
  cleanup: () => Promise<void>;
  tempDir: string;
  mockTime: boolean;
}

// 创建集成测试环境
export async function setupIntegrationEnvironment(options: {
  name: string;
  mockTime?: boolean;
} = { name: 'integration-test' }): Promise<IntegrationEnvironment> {
  // 创建临时目录
  const tempDir = path.join(__dirname, '../../temp', options.name, Date.now().toString());
  await fs.promises.mkdir(tempDir, { recursive: true });
  
  // 时间模拟
  let originalDateNow: typeof Date.now | undefined;
  let currentTime = Date.now();
  
  if (options.mockTime) {
    originalDateNow = Date.now;
    Date.now = vi.fn(() => currentTime);
  }
  
  // 返回环境对象
  return {
    tempDir,
    mockTime: !!options.mockTime,
    cleanup: async () => {
      // 恢复时间模拟
      if (options.mockTime && originalDateNow) {
        Date.now = originalDateNow;
      }
      
      // 清理临时目录
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`无法清理临时目录 ${tempDir}:`, error);
      }
    }
  };
}

// 导出辅助函数
export function expectToBeWithinRange(actual: number, lower: number, upper: number) {
  expect(actual).toBeGreaterThanOrEqual(lower);
  expect(actual).toBeLessThanOrEqual(upper);
  return true;
}

// 导出类型定义
export type PerformanceTestResult = {
  name: string;
  iterations: number;
  average: number;
  min: number;
  max: number;
  median: number;
}; 