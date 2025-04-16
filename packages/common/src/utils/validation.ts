/**
 * 验证工具模块
 * 
 * 提供数据验证、类型检查等功能。
 */

/**
 * 检查值是否为null或undefined
 * @param value 要检查的值
 * @returns 如果值为null或undefined则返回true
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 检查值是否为数字
 * @param value 要检查的值
 * @returns 如果是数字则返回true
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查值是否为字符串
 * @param value 要检查的值
 * @returns 如果是字符串则返回true
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 检查值是否为布尔值
 * @param value 要检查的值
 * @returns 如果是布尔值则返回true
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查值是否为函数
 * @param value 要检查的值
 * @returns 如果是函数则返回true
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * 检查值是否为日期对象
 * @param value 要检查的值
 * @returns 如果是日期对象则返回true
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查值是否为数组
 * @param value 要检查的值
 * @returns 如果是数组则返回true
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 检查字符串是否为有效的电子邮件格式
 * @param value 要检查的字符串
 * @returns 如果是有效的电子邮件格式则返回true
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 检查字符串是否为有效的URL格式
 * @param value 要检查的字符串
 * @returns 如果是有效的URL格式则返回true
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查字符串是否为有效的IP地址(v4或v6)
 * @param value 要检查的字符串
 * @returns 如果是有效的IP地址则返回true
 */
export function isIpAddress(value: string): boolean {
  // IPv4正则表达式
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6正则表达式(简化版)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^([0-9a-fA-F]{1,4}:){0,6}::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(value) || ipv6Regex.test(value);
}

/**
 * 检查值是否在指定范围内
 * @param value 要检查的数值
 * @param min 最小值
 * @param max 最大值
 * @returns 如果值在范围内则返回true
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 检查对象是否有指定的属性
 * @param obj 要检查的对象
 * @param prop 属性名
 * @returns 如果对象有该属性则返回true
 */
export function hasProperty<T>(obj: T, prop: PropertyKey): prop is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * 断言条件为true，否则抛出错误
 * @param condition 条件表达式
 * @param message 错误消息
 * @throws 如果条件为false则抛出错误
 */
export function assert(condition: boolean, message = 'Assertion failed'): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * 检查字符串是否只包含字母和数字
 * @param value 要检查的字符串
 * @returns 如果字符串只包含字母和数字则返回true
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * 导出validationUtils对象
 */
export const validationUtils = {
  isNil,
  isNumber,
  isString,
  isBoolean,
  isFunction,
  isDate,
  isArray,
  isEmail,
  isUrl,
  isIpAddress,
  inRange,
  hasProperty,
  assert,
  isAlphanumeric
}; 