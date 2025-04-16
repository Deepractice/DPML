#!/usr/bin/env node

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * 运行barrelsby命令
 * @param {string} directory 目录路径
 */
async function runBarrelsby(directory) {
  if (!(await dirExists(directory))) {
    return;
  }

  console.log(`为 ${directory} 生成barrel文件...`);
  const command = `npx barrelsby --directory ${directory} --delete --location top --structure flat --singleQuotes --exportDefault`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行错误: ${error.message}`);

        return reject(error);
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      console.log(stdout);
      resolve();
    });
  });
}

/**
 * 检查目录是否存在
 * @param {string} dir 目录路径
 */
async function dirExists(dir) {
  try {
    const stats = await fs.stat(dir);

    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 获取所有包名称
 */
async function getPackages() {
  const packagesDir = path.join(rootDir, 'packages');
  const items = await fs.readdir(packagesDir, { withFileTypes: true });

  return items
    .filter(
      item =>
        item.isDirectory() && !item.name.startsWith('.') && item.name !== 'dist'
    )
    .map(item => item.name);
}

/**
 * 主函数
 */
async function main() {
  try {
    const packages = await getPackages();

    console.log(
      '注意: 包级别的index.ts文件(src/index.ts)需要手动维护，以便更好地控制API边界和使用命名空间导出'
    );

    // 要处理的所有目录类型 - 移除空字符串，不再生成包级别barrel
    const folderTypes = [
      // 移除 '', // 包根目录
      'utils',
      'types',
      'components',
      'hooks',
      'api',
      'parser',
      'processor',
      'transformer',
      'errors',
    ];

    // 为每个包的每种目录类型生成barrel文件
    for (const pkg of packages) {
      for (const folderType of folderTypes) {
        const dirPath = path.join(rootDir, 'packages', pkg, 'src', folderType);

        await runBarrelsby(dirPath).catch(() => {
          // 忽略不存在的目录错误
          console.log(`跳过不存在的目录: ${dirPath}`);
        });
      }
    }

    console.log('所有barrel文件生成完成！');
  } catch (error) {
    console.error('生成barrel文件时出错:', error);
    process.exit(1);
  }
}

main();
