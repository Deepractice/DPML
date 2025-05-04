#!/usr/bin/env node

/**
 * Script to automatically create an empty changeset for CI
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 动态查找所有包
const getPackages = () => {
  try {
    // 获取packages目录下的所有子目录
    const packagesDir = path.join(process.cwd(), 'packages');
    const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // 读取每个子目录中的package.json获取包名
    const packages = [];
    for (const dir of packageDirs) {
      const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        // 确保包名与package.json中完全一致
        if (pkgJson.name && !pkgJson.private) {
          packages.push(pkgJson.name);
        }
      }
    }
    
    console.log(`找到了 ${packages.length} 个包: ${packages.join(', ')}`);
    return packages;
  } catch (error) {
    console.error('读取包时出错:', error);
    // 如果动态发现失败，返回已知包作为备份方案
    return [
      '@dpml/agent',
      '@dpml/cli', 
      '@dpml/core',
      'dpml'
    ];
  }
};

// Create empty changeset
const createChangeset = (packages) => {
  // Generate a unique ID - 保持简短且只包含安全字符
  const timestamp = Math.floor(Date.now() / 1000);
  const changesetId = `ci-${timestamp}`;
  const changesetDir = '.changeset';
  
  // Ensure directory exists
  if (!fs.existsSync(changesetDir)) {
    fs.mkdirSync(changesetDir, { recursive: true });
  }
  
  // 按照changesets期望的格式创建内容
  const frontmatter = {
    // 不要使用"summary"键，这可能引起混淆
    // 而是直接在frontmatter中列出包
  };
  
  packages.forEach(pkgName => {
    frontmatter[pkgName] = "patch"; // 使用字符串而不是对象
  });
  
  const filePath = path.join(changesetDir, `${changesetId}.md`);
  
  const mdContent = `---
${JSON.stringify(frontmatter, null, 2)}
---

CI auto-generated snapshot release
`;
  
  fs.writeFileSync(filePath, mdContent, 'utf-8');
  console.log(`Created changeset: ${filePath}`);
  
  // 输出生成的内容以便调试
  console.log("Changeset content:");
  console.log(mdContent);
};

// Main function
const main = () => {
  try {
    const packages = getPackages();
    if (packages.length === 0) {
      console.log('No packages found in workspace');
      return;
    }
    
    createChangeset(packages);
  } catch (error) {
    console.error('Error creating changeset:', error);
    process.exit(1);
  }
};

main();