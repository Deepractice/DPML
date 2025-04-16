/**
 * 环境帮助工具
 * 
 * 用于兼容性测试的环境检测辅助函数
 */

/**
 * 获取当前Node.js版本
 * @returns {string} 当前Node.js版本
 */
export function getNodeVersion(): string {
  return process.version.substring(1); // 移除开头的'v'字符
}

/**
 * 检查是否在ESM环境中运行
 * @returns {boolean} 是否是ESM环境
 */
export function isESMEnvironment(): boolean {
  try {
    // 在ESM环境中，require不是全局可用的
    return typeof require === 'undefined';
  } catch (e) {
    return true;
  }
}

/**
 * 检查TypeScript版本
 * 注意：此函数需要TypeScript作为依赖
 * @returns {string|null} TypeScript版本或null（如果不可用）
 */
export function getTypeScriptVersion(): string | null {
  try {
    // 这是一个动态导入，实际使用时可能需要适配项目的导入方式
    const ts = require('typescript');
    return ts.version;
  } catch (e) {
    return null;
  }
} 