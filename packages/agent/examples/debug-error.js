#!/usr/bin/env node

/**
 * 本脚本用于调试和修复"this.mappingRules is not iterable"错误
 */

const fs = require('fs');
const path = require('path');

// 脚本功能: 临时复制一个有效的映射规则结构到core包的缓存中
// 原因: 当前构建可能存在映射规则未正确初始化的问题

// 目标文件路径
const targetFilePath = path.resolve(__dirname, '../dist/config/transformers.js');

// 备份原始文件
const backupFilePath = `${targetFilePath}.bak`;

console.log('正在备份原始文件...');
try {
  fs.copyFileSync(targetFilePath, backupFilePath);
  console.log(`备份文件已创建: ${backupFilePath}`);
} catch (err) {
  console.error('备份文件失败:', err.message);
  process.exit(1);
}

// 读取原始文件
console.log('读取原始文件...');
let content;
try {
  content = fs.readFileSync(targetFilePath, 'utf8');
} catch (err) {
  console.error('读取文件失败:', err.message);
  process.exit(1);
}

// 修复mappingRules属性确保其是一个数组
console.log('修改文件内容...');
const fixedContent = content.replace(
  /const\s+_mcpTransformer\s*=\s*definer\.defineStructuralMapper/g,
  'const _mcpTransformer = Object.assign({}, definer.defineStructuralMapper'
).replace(
  /const\s+mcpTransformer\s*=\s*\{/g,
  'const mcpTransformer = {\n  mappingRules: [],'
);

// 写入修复后的文件
console.log('写入修复后的文件...');
try {
  fs.writeFileSync(targetFilePath, fixedContent);
  console.log(`文件已修复: ${targetFilePath}`);
} catch (err) {
  console.error('写入文件失败:', err.message);
  process.exit(1);
}

console.log('完成! 请尝试重新运行agent chat命令'); 