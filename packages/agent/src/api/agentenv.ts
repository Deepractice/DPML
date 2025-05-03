import { replaceEnvVars as replaceEnvVarsCore } from '../core/agentenv/agentenvCore';

/**
 * 替换值中的环境变量引用
 *
 * 识别并替换字符串、数组或对象中的所有 @agentenv:ENV_NAME 格式的环境变量引用。
 * 支持任意嵌套的数据结构。
 *
 * @param value 包含环境变量引用的值（字符串、数组或对象）
 * @returns 替换后的值，保持原始类型
 * @example
 * // 替换字符串
 * const apiKey = replaceEnvVars('@agentenv:API_KEY');
 *
 * // 替换对象中的值
 * const config = replaceEnvVars({
 *   apiKey: '@agentenv:API_KEY',
 *   endpoint: '@agentenv:API_ENDPOINT'
 * });
 */
export function replaceEnvVars<T>(value: T): T {
  return replaceEnvVarsCore(value);
}
