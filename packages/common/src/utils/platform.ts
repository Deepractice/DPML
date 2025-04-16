/**
 * 平台检测工具模块
 *
 * 提供运行环境检测、平台特性探测等功能。
 */

import {
  _overrideNodeEnv,
  _overrideBrowserEnv,
} from '../logger/core/environment';

/**
 * 检查代码是否运行在Node.js环境中
 * @returns 如果在Node.js环境中运行则返回true
 */
export function isRunningInNode(): boolean {
  // 优先使用环境覆盖设置
  if (_overrideNodeEnv !== null) {
    return _overrideNodeEnv;
  }

  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * 检查代码是否运行在浏览器环境中
 * @returns 如果在浏览器环境中运行则返回true
 */
export function isRunningInBrowser(): boolean {
  // 优先使用环境覆盖设置
  if (_overrideBrowserEnv !== null) {
    return _overrideBrowserEnv;
  }

  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 检查代码是否运行在Web Worker环境中
 * @returns 如果在Web Worker环境中运行则返回true
 */
export function isRunningInWebWorker(): boolean {
  // 优先使用环境覆盖设置
  if (_overrideBrowserEnv !== null) {
    return false; // 如果明确设置为浏览器环境，则不是Worker
  }

  return (
    typeof self !== 'undefined' &&
    typeof window === 'undefined' &&
    typeof importScripts === 'function'
  );
}

/**
 * 检查是否运行在Windows平台上
 * @returns 如果在Windows平台上运行则返回true
 */
export function isWindowsPlatform(): boolean {
  if (isRunningInNode()) {
    return process.platform === 'win32';
  }

  // 浏览器环境下的粗略检测
  if (isRunningInBrowser() && navigator && navigator.platform) {
    return navigator.platform.indexOf('Win') !== -1;
  }

  return false;
}

/**
 * 检查是否运行在macOS平台上
 * @returns 如果在macOS平台上运行则返回true
 */
export function isMacOSPlatform(): boolean {
  if (isRunningInNode()) {
    return process.platform === 'darwin';
  }

  // 浏览器环境下的粗略检测
  if (isRunningInBrowser() && navigator && navigator.platform) {
    return navigator.platform.indexOf('Mac') !== -1;
  }

  return false;
}

/**
 * 检查是否运行在Linux平台上
 * @returns 如果在Linux平台上运行则返回true
 */
export function isLinuxPlatform(): boolean {
  if (isRunningInNode()) {
    return process.platform === 'linux';
  }

  // 浏览器环境下的粗略检测
  if (isRunningInBrowser() && navigator && navigator.platform) {
    return navigator.platform.indexOf('Linux') !== -1;
  }

  return false;
}

/**
 * 获取当前Node.js版本
 * @returns Node.js版本字符串，如果不在Node.js环境中则返回null
 */
export function getNodeVersion(): string | null {
  if (isRunningInNode()) {
    return process.versions.node;
  }

  return null;
}

/**
 * 检查当前环境是否支持某个特性
 * @param featureName 特性名称
 * @returns 是否支持该特性
 */
export function hasFeatureSupport(featureName: string): boolean {
  switch (featureName) {
    case 'Promise':
      return typeof Promise !== 'undefined';
    case 'Set':
      return typeof Set !== 'undefined';
    case 'Map':
      return typeof Map !== 'undefined';
    case 'Symbol':
      return typeof Symbol !== 'undefined';
    case 'Proxy':
      return typeof Proxy !== 'undefined';
    case 'BigInt':
      return typeof BigInt !== 'undefined';
    case 'AbortController':
      return typeof AbortController !== 'undefined';
    case 'globalThis':
      return typeof globalThis !== 'undefined';
    case 'fetch':
      return isRunningInBrowser() && typeof fetch !== 'undefined';
    case 'Intl':
      return typeof Intl !== 'undefined';
    default:
      return false;
  }
}

/**
 * 检查是否在IE浏览器中运行
 * @returns 如果在IE浏览器中运行则返回true
 */
export function isIE(): boolean {
  if (!isRunningInBrowser()) {
    return false;
  }

  if (typeof navigator === 'undefined') {
    return false;
  }

  // 检测IE
  const ua = navigator.userAgent;

  return (
    ua.indexOf('MSIE ') > -1 ||
    ua.indexOf('Trident/') > -1 ||
    ua.indexOf('Edge/') > -1
  );
}

/**
 * isNode函数，作为isRunningInNode的别名
 * @returns 如果在Node.js环境中运行则返回true
 */
export const isNode = isRunningInNode;

/**
 * isBrowser函数，作为isRunningInBrowser的别名
 * @returns 如果在浏览器环境中运行则返回true
 */
export const isBrowser = isRunningInBrowser;

/**
 * 导出platformUtils对象
 */
export const platformUtils = {
  isRunningInNode,
  isRunningInBrowser,
  isRunningInWebWorker,
  isWindowsPlatform,
  isMacOSPlatform,
  isLinuxPlatform,
  isIE,
  getNodeVersion,
  hasFeatureSupport,
  // 别名
  isNode,
  isBrowser,
};
