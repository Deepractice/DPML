/**
 * 数组操作工具模块
 * 
 * 提供数组分组、过滤、转换等处理函数。
 */

/**
 * 按指定属性对数组进行分组
 * @param array 要分组的数组
 * @param key 用于分组的属性名
 * @returns 分组后的对象，键为属性值，值为原数组中具有相同属性值的元素数组
 */
export function groupBy<T extends Record<K, PropertyKey>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * 从数组中移除重复项
 * @param array 包含重复项的数组
 * @returns 无重复项的新数组
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 将数组拆分为指定大小的块
 * @param array 要拆分的数组
 * @param size 每个块的大小
 * @returns 包含原数组拆分块的二维数组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from(
    { length: Math.ceil(array.length / size) },
    (_, index) => array.slice(index * size, index * size + size)
  );
}

/**
 * 查找数组中的最小值
 * @param array 数字数组
 * @returns 数组中的最小值
 */
export function min(array: number[]): number {
  return Math.min(...array);
}

/**
 * 查找数组中的最大值
 * @param array 数字数组
 * @returns 数组中的最大值
 */
export function max(array: number[]): number {
  return Math.max(...array);
}

/**
 * 计算数组中所有数字的总和
 * @param array 数字数组
 * @returns 数组元素之和
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * 计算数组中所有数字的平均值
 * @param array 数字数组
 * @returns 数组元素的平均值
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * 随机打乱数组元素顺序
 * @param array 要打乱的数组
 * @returns 元素顺序随机打乱后的新数组
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 返回两个数组的交集
 * @param a 第一个数组
 * @param b 第二个数组
 * @returns 包含同时存在于两个数组中的元素的新数组
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return [...new Set(a)].filter(x => setB.has(x));
}

/**
 * 返回两个数组的并集
 * @param a 第一个数组
 * @param b 第二个数组
 * @returns 包含存在于任一数组中的元素的新数组（无重复）
 */
export function union<T>(a: T[], b: T[]): T[] {
  return unique([...a, ...b]);
}

/**
 * 返回第一个数组中存在但第二个数组中不存在的元素
 * @param a 第一个数组
 * @param b 第二个数组
 * @returns 差集数组
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter(x => !setB.has(x));
}

/**
 * 导出arrayUtils对象，保持向后兼容
 */
export const arrayUtils = {
  groupBy,
  unique,
  chunk,
  min,
  max,
  sum,
  average,
  shuffle,
  intersection,
  union,
  difference
}; 