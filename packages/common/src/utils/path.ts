/**
 * 路径操作工具模块
 *
 * 提供路径规范化、合并、安全检查等功能。
 * 设计为在Node.js和浏览器环境都可用。
 */

import { isRunningInNode } from './platform';

// 懒加载Node.js模块
let nodePath: typeof import('path') | undefined;
let nodeFS: typeof import('fs') | undefined;
let nodeOS: typeof import('os') | undefined;
let nodeURL: typeof import('url').URL | undefined;

// 在Node.js环境中初始化模块
if (isRunningInNode()) {
  try {
    // 动态导入Node.js内置模块
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    nodePath = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    nodeFS = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    nodeOS = require('os');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const urlModule = require('url');
    nodeURL = urlModule.URL;
  } catch (error) {
    console.warn('Unable to load Node.js path modules:', error);
  }
}

/**
 * 路径分隔符
 */
export const separator = isRunningInNode()
  ? nodePath?.sep || '/'
  : '/';

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
    if (nodeURL) {
      try {
        // 使用URL API解析文件URL
        const fileUrl = new nodeURL(filePath);
        return fileUrl.pathname;
      } catch (error) {
        // 如果解析失败，尝试直接移除协议部分
        filePath = filePath.substring(7);
      }
    } else {
      // 浏览器环境或URL模块加载失败
      filePath = filePath.substring(7);
    }
  }

  // 根据平台进行不同处理
  if (isRunningInNode() && nodeOS?.platform() === 'win32') {
    // Windows平台，保留原始格式或转换为反斜杠
    if (filePath.includes('/')) {
      // 如果包含正斜杠，转换为反斜杠
      return filePath.replace(/\//g, '\\');
    }
    return filePath;
  } else {
    // Unix平台或浏览器环境，将反斜杠转换为正斜杠
    return filePath.replace(/\\/g, '/');
  }
}

/**
 * 连接路径片段
 * @param paths 路径片段数组
 * @returns 连接后的路径
 */
export function join(...paths: string[]): string {
  if (isRunningInNode() && nodePath) {
    return nodePath.join(...paths);
  }

  // 浏览器环境的简单实现
  return paths
    .filter(Boolean)
    .map((part, i) => {
      // 处理开头和结尾的斜杠
      if (i === 0) {
        return part.endsWith('/') ? part.slice(0, -1) : part;
      }
      part = part.startsWith('/') ? part.slice(1) : part;
      return part.endsWith('/') ? part.slice(0, -1) : part;
    })
    .join('/');
}

/**
 * 解析相对路径为绝对路径
 * @param relativePath 相对路径
 * @returns 绝对路径
 */
export function resolve(relativePath: string): string {
  if (isRunningInNode() && nodePath) {
    return nodePath.resolve(relativePath);
  }

  // 浏览器环境下，无法真正获取文件系统绝对路径
  // 可以考虑基于当前URL进行处理
  if (typeof window !== 'undefined' && window.location) {
    const base = new URL('.', window.location.href).pathname;
    return join(base, relativePath);
  }

  return relativePath; // 浏览器环境下的兜底返回
}

/**
 * 获取路径的目录部分
 * @param filePath 文件路径
 * @returns 目录路径
 */
export function dirname(filePath: string): string {
  if (isRunningInNode() && nodePath) {
    return nodePath.dirname(filePath);
  }

  // 如果路径以斜杠结尾，则返回路径本身
  if (filePath.endsWith('/') || filePath.endsWith('\\')) {
    return filePath.slice(0, -1);
  }

  // 浏览器环境的简单实现
  const lastSlashIndex = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\')
  );

  if (lastSlashIndex === -1) {
    return '.';
  }

  return filePath.slice(0, lastSlashIndex);
}

/**
 * 获取路径的文件名部分(包含扩展名)
 * @param filePath 文件路径
 * @returns 文件名
 */
export function basename(filePath: string): string {
  if (isRunningInNode() && nodePath) {
    return nodePath.basename(filePath);
  }

  // 浏览器环境的简单实现
  const lastSlashIndex = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\')
  );

  if (lastSlashIndex === -1) {
    return filePath;
  }

  return filePath.slice(lastSlashIndex + 1);
}

/**
 * 获取文件的扩展名
 * @param filePath 文件路径
 * @returns 扩展名(包含前导点)
 */
export function extname(filePath: string): string {
  if (isRunningInNode() && nodePath) {
    return nodePath.extname(filePath);
  }

  // 浏览器环境的简单实现
  const fileName = basename(filePath);
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return '';
  }

  return fileName.slice(lastDotIndex);
}

/**
 * 判断路径是否是绝对路径
 * @param filePath 文件路径
 * @returns 是否是绝对路径
 */
export function isAbsolute(filePath: string): boolean {
  if (isRunningInNode() && nodePath) {
    return nodePath.isAbsolute(filePath);
  }

  // 浏览器环境的简单实现
  // Unix风格的绝对路径
  if (filePath.startsWith('/')) {
    return true;
  }

  // Windows风格的绝对路径
  // 驱动器字母后跟冒号，如 C:
  if (/^[a-zA-Z]:[/\\]/.test(filePath)) {
    return true;
  }

  // URL格式
  if (filePath.startsWith('http://') ||
      filePath.startsWith('https://') ||
      filePath.startsWith('file://')) {
    return true;
  }

  return false;
}

/**
 * 检查路径是否超出指定的基础目录(防止路径遍历攻击)
 * @param basePath 基础目录
 * @param targetPath 目标路径
 * @returns 如果路径未超出基础目录则返回true
 */
export function isPathWithinDirectory(basePath: string, targetPath: string): boolean {
  let resolvedBase: string;
  let resolvedTarget: string;

  if (isRunningInNode() && nodePath) {
    // Node.js环境下使用path.resolve
    resolvedBase = nodePath.resolve(basePath);
    resolvedTarget = nodePath.resolve(targetPath);

    // 确保以目录分隔符结尾，防止部分匹配（如/app匹配/appdata）
    if (!resolvedBase.endsWith(nodePath.sep)) {
      resolvedBase += nodePath.sep;
    }

    return resolvedTarget.startsWith(resolvedBase);
  } else {
    // 浏览器环境下的简单实现
    resolvedBase = normalizePath(basePath);
    resolvedTarget = normalizePath(targetPath);

    // 确保以斜杠结尾
    if (!resolvedBase.endsWith('/')) {
      resolvedBase += '/';
    }

    return resolvedTarget.startsWith(resolvedBase);
  }
}

/**
 * normalize 函数，作为 normalizePath 的别名
 * @param filePath 文件路径
 * @returns 标准化的路径
 */
export const normalize = normalizePath;

/**
 * 导出pathUtils对象，保持向后兼容
 */
export const pathUtils = {
  separator,
  normalizePath,
  normalize,  // 添加 normalize 别名
  join,
  resolve,
  dirname,
  basename,
  extname,
  isAbsolute,
  isPathWithinDirectory
};