/**
 * 环境检测工具
 */

/**
 * 测试环境变量覆盖
 */
export let _overrideNodeEnv: boolean | null = null; 
export let _overrideBrowserEnv: boolean | null = null;

/**
 * 检测当前是否为Node.js环境
 * @returns 如果是Node.js环境则返回true，否则返回false
 */
export const isNodeEnvironment = (): boolean => {
  // 优先使用环境覆盖
  if (_overrideNodeEnv !== null) {
    return _overrideNodeEnv;
  }
  
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
};

/**
 * 检测当前是否为浏览器环境
 * @returns 如果是浏览器环境则返回true，否则返回false
 */
export const isBrowserEnvironment = (): boolean => {
  // 优先使用环境覆盖
  if (_overrideBrowserEnv !== null) {
    return _overrideBrowserEnv;
  }
  
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined';
};

/**
 * 设置环境覆盖标志，仅用于测试
 * @param isNode 是否为Node环境
 * @param isBrowser 是否为浏览器环境
 */
export const _setEnvironmentOverrides = (isNode: boolean | null, isBrowser: boolean | null): void => {
  _overrideNodeEnv = isNode;
  _overrideBrowserEnv = isBrowser;
};

/**
 * 重置环境覆盖标志，仅用于测试
 */
export const _resetEnvironmentOverrides = (): void => {
  _overrideNodeEnv = null;
  _overrideBrowserEnv = null;
};

/**
 * 获取当前环境名称
 * @returns 环境名称: 'node', 'browser', 或 'unknown'
 */
export const getEnvironmentName = (): 'node' | 'browser' | 'unknown' => {
  if (_overrideNodeEnv === true) return 'node';
  if (_overrideBrowserEnv === true) return 'browser';
  if (isNodeEnvironment()) return 'node';
  if (isBrowserEnvironment()) return 'browser';
  return 'unknown';
}; 