/**
 * 环境检测工具
 */

/**
 * 检测当前是否为Node.js环境
 * @returns 如果是Node.js环境则返回true，否则返回false
 */
export const isNodeEnvironment = (): boolean => {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
};

/**
 * 检测当前是否为浏览器环境
 * @returns 如果是浏览器环境则返回true，否则返回false
 */
export const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined';
};

/**
 * 获取当前环境名称
 * @returns 环境名称: 'node', 'browser', 或 'unknown'
 */
export const getEnvironmentName = (): 'node' | 'browser' | 'unknown' => {
  if (isNodeEnvironment()) return 'node';
  if (isBrowserEnvironment()) return 'browser';
  return 'unknown';
}; 