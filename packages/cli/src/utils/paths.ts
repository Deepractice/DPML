import fs from 'fs';
import os from 'os';
import path from 'path';
import { URL } from 'url';

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

/**
 * 获取用户数据目录
 * @param appName 可选的应用名称
 * @returns 用户数据目录路径
 */
export function getUserDataDir(appName?: string): string {
  const dataDir = path.join(getDpmlConfigDir(), 'data');

  return appName ? path.join(dataDir, appName) : dataDir;
}

/**
 * 检查路径是否安全（不包含路径遍历等）
 * @param baseDir 基础目录
 * @param targetPath 目标路径
 * @returns 是否安全
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  // 标准化路径
  const normalizedBase = normalizePath(baseDir);
  const normalizedTarget = normalizePath(targetPath);

  // 解析为绝对路径
  const resolvedBase = path.resolve(normalizedBase);
  const resolvedTarget = path.resolve(normalizedTarget);

  // 检查目标路径是否在基础目录内
  return resolvedTarget.startsWith(resolvedBase);
}

/**
 * 标准化路径，处理不同平台的路径分隔符
 * @param filePath 文件路径
 * @returns 标准化的路径
 */
export function normalizePath(filePath: string): string {
  if (!filePath) return filePath;

  // 处理URL格式的路径
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // 处理file:// 协议的URL
  if (filePath.startsWith('file://')) {
    try {
      // 使用URL API解析文件URL
      const fileUrl = new URL(filePath);

      return fileUrl.pathname;
    } catch (error) {
      // 如果解析失败，尝试直接移除协议部分
      filePath = filePath.substring(7);
    }
  }

  // 根据平台进行不同处理
  if (os.platform() === 'win32') {
    // Windows平台，保留原始格式或转换为反斜杠
    if (filePath.includes('/')) {
      // 如果包含正斜杠，转换为反斜杠
      return filePath.replace(/\//g, '\\');
    }

    return filePath;
  } else {
    // Unix平台，将反斜杠转换为正斜杠
    return filePath.replace(/\\/g, '/');
  }
}

/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 文件扩展名（包含.）
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * 获取文件名
 * @param filePath 文件路径
 * @returns 文件名
 */
export function getFileName(filePath: string): string {
  // 处理路径以斜杠结尾的情况
  if (filePath.endsWith('/') || filePath.endsWith('\\')) {
    return '';
  }

  return path.basename(filePath);
}

/**
 * 获取目录名
 * @param filePath 文件路径
 * @returns 目录名
 */
export function getDirName(filePath: string): string {
  // 如果路径以斜杠结尾，则返回路径本身
  if (filePath.endsWith('/') || filePath.endsWith('\\')) {
    return filePath.slice(0, -1);
  }

  return path.dirname(filePath);
}

/**
 * 连接多个路径段
 * @param paths 路径段
 * @returns 连接后的路径
 */
export function joinPaths(...paths: string[]): string {
  const joined = path.join(...paths);

  // 如果是Windows平台，返回使用反斜杠的路径
  if (os.platform() === 'win32') {
    return joined.replace(/\//g, '\\');
  }

  return joined;
}
