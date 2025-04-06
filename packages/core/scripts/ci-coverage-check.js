#!/usr/bin/env node

/**
 * CI环境测试覆盖率检查脚本
 * 
 * 用于在CI流程中检查测试覆盖率是否达到要求
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 覆盖率报告路径
  coverageJsonPath: path.resolve(__dirname, '../coverage/coverage-final.json'),
  // 覆盖率阈值
  thresholds: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  },
  // 重点关注的文件或目录（需要达到100%覆盖率）
  criticalPaths: [
    'src/processor/defaultProcessor.ts',
    'src/processor/defaultReferenceResolver.ts',
    'src/processor/interfaces'
  ]
};

/**
 * 计算覆盖率摘要
 * @param {Object} coverage 覆盖率数据
 * @returns {Object} 覆盖率摘要
 */
function calculateSummary(coverage) {
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;

  // 遍历所有文件的覆盖率数据
  Object.values(coverage).forEach(file => {
    // 语句覆盖率
    if (file.s) {
      totalStatements += Object.keys(file.s).length;
      coveredStatements += Object.values(file.s).filter(v => v > 0).length;
    }

    // 分支覆盖率
    if (file.b) {
      Object.values(file.b).forEach(branches => {
        totalBranches += branches.length;
        coveredBranches += branches.filter(v => v > 0).length;
      });
    }

    // 函数覆盖率
    if (file.f) {
      totalFunctions += Object.keys(file.f).length;
      coveredFunctions += Object.values(file.f).filter(v => v > 0).length;
    }

    // 行覆盖率
    if (file.l) {
      totalLines += Object.keys(file.l).length;
      coveredLines += Object.values(file.l).filter(v => v > 0).length;
    }
  });

  return {
    statements: {
      total: totalStatements,
      covered: coveredStatements,
      pct: totalStatements ? (coveredStatements / totalStatements) * 100 : 100
    },
    branches: {
      total: totalBranches,
      covered: coveredBranches,
      pct: totalBranches ? (coveredBranches / totalBranches) * 100 : 100
    },
    functions: {
      total: totalFunctions,
      covered: coveredFunctions,
      pct: totalFunctions ? (coveredFunctions / totalFunctions) * 100 : 100
    },
    lines: {
      total: totalLines,
      covered: coveredLines,
      pct: totalLines ? (coveredLines / totalLines) * 100 : 100
    }
  };
}

/**
 * 检查关键路径覆盖率
 * @param {Object} coverage 覆盖率数据
 * @returns {Object} 关键路径覆盖率信息
 */
function checkCriticalPaths(coverage) {
  const critical = {};
  const results = {};

  // 筛选关键路径文件
  Object.entries(coverage).forEach(([filePath, data]) => {
    const relativePath = filePath.replace(/^[^/]*\//, ''); // 移除前面的路径前缀
    
    CONFIG.criticalPaths.forEach(criticalPath => {
      if (relativePath.startsWith(criticalPath)) {
        critical[filePath] = data;
      }
    });
  });

  // 计算关键路径覆盖率
  const summary = calculateSummary(critical);
  
  // 检查是否所有关键路径都达到了100%覆盖
  const isFullCoverage = 
    summary.statements.pct === 100 && 
    summary.branches.pct === 100 && 
    summary.functions.pct === 100 && 
    summary.lines.pct === 100;
  
  results.summary = summary;
  results.isFullCoverage = isFullCoverage;
  
  // 找出覆盖率不足的关键文件
  results.uncoveredFiles = [];
  
  Object.entries(critical).forEach(([filePath, data]) => {
    const fileSummary = calculateSummary({ [filePath]: data });
    
    if (
      fileSummary.statements.pct < 100 || 
      fileSummary.branches.pct < 100 ||
      fileSummary.functions.pct < 100 ||
      fileSummary.lines.pct < 100
    ) {
      results.uncoveredFiles.push({
        file: filePath.replace(/^[^/]*\//, ''),
        summary: fileSummary
      });
    }
  });
  
  return results;
}

/**
 * 主函数
 */
async function main() {
  try {
    // 运行测试并生成覆盖率报告
    console.log('🧪 运行测试并生成覆盖率报告...');
    execSync('npm run test:coverage', { stdio: 'inherit' });
    
    // 读取当前覆盖率报告
    console.log('📊 读取覆盖率报告...');
    const coverageData = JSON.parse(fs.readFileSync(CONFIG.coverageJsonPath, 'utf8'));
    
    // 计算覆盖率摘要
    const summary = calculateSummary(coverageData);
    console.log('\n📝 总体覆盖率摘要:');
    console.log(`语句覆盖率: ${summary.statements.pct.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`);
    console.log(`分支覆盖率: ${summary.branches.pct.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`);
    console.log(`函数覆盖率: ${summary.functions.pct.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`);
    console.log(`行覆盖率: ${summary.lines.pct.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`);
    
    // 检查关键路径覆盖率
    console.log('\n🔍 检查关键路径覆盖率...');
    const criticalResults = checkCriticalPaths(coverageData);
    
    console.log('\n🚨 关键路径覆盖率摘要:');
    console.log(`语句覆盖率: ${criticalResults.summary.statements.pct.toFixed(2)}% (${criticalResults.summary.statements.covered}/${criticalResults.summary.statements.total})`);
    console.log(`分支覆盖率: ${criticalResults.summary.branches.pct.toFixed(2)}% (${criticalResults.summary.branches.covered}/${criticalResults.summary.branches.total})`);
    console.log(`函数覆盖率: ${criticalResults.summary.functions.pct.toFixed(2)}% (${criticalResults.summary.functions.covered}/${criticalResults.summary.functions.total})`);
    console.log(`行覆盖率: ${criticalResults.summary.lines.pct.toFixed(2)}% (${criticalResults.summary.lines.covered}/${criticalResults.summary.lines.total})`);
    
    // 输出未完全覆盖的关键文件
    if (criticalResults.uncoveredFiles.length > 0) {
      console.log('\n⚠️ 以下关键文件未达到100%覆盖率:');
      criticalResults.uncoveredFiles.forEach(file => {
        console.log(`- ${file.file}`);
        console.log(`  语句: ${file.summary.statements.pct.toFixed(2)}%, 分支: ${file.summary.branches.pct.toFixed(2)}%, 函数: ${file.summary.functions.pct.toFixed(2)}%, 行: ${file.summary.lines.pct.toFixed(2)}%`);
      });
    } else {
      console.log('\n✅ 所有关键文件均已达到100%覆盖率！');
    }
    
    // 检查是否达到阈值
    let thresholdsPassed = true;
    console.log('\n🎯 检查覆盖率阈值:');
    
    if (summary.statements.pct < CONFIG.thresholds.statements) {
      console.log(`❌ 语句覆盖率 ${summary.statements.pct.toFixed(2)}% 未达到阈值 ${CONFIG.thresholds.statements}%`);
      thresholdsPassed = false;
    } else {
      console.log(`✅ 语句覆盖率 ${summary.statements.pct.toFixed(2)}% 达到阈值 ${CONFIG.thresholds.statements}%`);
    }
    
    if (summary.branches.pct < CONFIG.thresholds.branches) {
      console.log(`❌ 分支覆盖率 ${summary.branches.pct.toFixed(2)}% 未达到阈值 ${CONFIG.thresholds.branches}%`);
      thresholdsPassed = false;
    } else {
      console.log(`✅ 分支覆盖率 ${summary.branches.pct.toFixed(2)}% 达到阈值 ${CONFIG.thresholds.branches}%`);
    }
    
    if (summary.functions.pct < CONFIG.thresholds.functions) {
      console.log(`❌ 函数覆盖率 ${summary.functions.pct.toFixed(2)}% 未达到阈值 ${CONFIG.thresholds.functions}%`);
      thresholdsPassed = false;
    } else {
      console.log(`✅ 函数覆盖率 ${summary.functions.pct.toFixed(2)}% 达到阈值 ${CONFIG.thresholds.functions}%`);
    }
    
    if (summary.lines.pct < CONFIG.thresholds.lines) {
      console.log(`❌ 行覆盖率 ${summary.lines.pct.toFixed(2)}% 未达到阈值 ${CONFIG.thresholds.lines}%`);
      thresholdsPassed = false;
    } else {
      console.log(`✅ 行覆盖率 ${summary.lines.pct.toFixed(2)}% 达到阈值 ${CONFIG.thresholds.lines}%`);
    }
    
    // 检查重要路径是否完全覆盖
    const criticalCoverage = criticalResults.isFullCoverage;
    
    // 输出总结
    console.log('\n📋 测试覆盖率检查结果:');
    
    if (thresholdsPassed) {
      console.log('✅ 所有覆盖率指标均已达到阈值');
    } else {
      console.log('❌ 部分覆盖率指标未达到阈值');
      process.exitCode = 1;
    }
    
    if (criticalCoverage) {
      console.log('✅ 所有关键路径均已达到100%覆盖率');
    } else {
      console.log('❌ 部分关键路径未达到100%覆盖率');
      process.exitCode = 1;
    }
    
    // 如果有任何检查失败，退出码设为1
    if (!thresholdsPassed || !criticalCoverage) {
      console.log('\n❌ 覆盖率检查失败 - 请增加测试以提高覆盖率');
      process.exit(1);
    } else {
      console.log('\n✅ 覆盖率检查通过！');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 