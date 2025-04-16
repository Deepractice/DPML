import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * 获取用户主目录
 * @returns 用户主目录路径
 */
export function getUserHome(): string {
  return os.homedir();
}

/**
 * 获取DPML配置目录
 * @returns DPML配置目录路径
 */
export function getDpmlConfigDir(): string {
  return path.join(getUserHome(), '.dpml');
}

/**
 * 获取映射文件路径
 * @returns 映射文件路径
 */
export function getMappingFilePath(): string {
  return path.join(getDpmlConfigDir(), 'domain-mapping.json');
}

/**
 * 获取配置文件路径
 * @returns 配置文件路径
 */
export function getConfigFilePath(): string {
  return path.join(getDpmlConfigDir(), 'config.json');
}

/**
 * 确保目录存在
 * @param dirPath 目录路径
 * @returns 是否成功确保目录存在
 */
export function ensureDir(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 查找node_modules目录
 * @returns node_modules目录列表
 */
export function findNodeModules(): string[] {
  const paths: string[] = [];

  // 添加当前工作目录下的node_modules
  const cwdNodeModules = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(cwdNodeModules)) {
    paths.push(cwdNodeModules);
  }

  // 添加全局node_modules目录
  try {
    // 使用npm root -g命令获取全局node_modules路径
    const { execSync } = require('child_process');
    const globalNodeModules = execSync('npm root -g').toString().trim();
    if (fs.existsSync(globalNodeModules)) {
      paths.push(globalNodeModules);
    }
  } catch (error) {
    // 忽略错误，继续使用已找到的路径
  }

  // 添加可能的其他位置
  const homeNodeModules = path.join(os.homedir(), 'node_modules');
  if (fs.existsSync(homeNodeModules)) {
    paths.push(homeNodeModules);
  }

  return paths;
}

/**
 * 检查路径是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export function pathExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 解析相对路径为绝对路径
 * @param relativePath 相对路径
 * @returns 绝对路径
 */
export function resolveRelativePath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}
