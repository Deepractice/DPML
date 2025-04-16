/**
 * 对象处理工具模块
 * 
 * 提供对象深拷贝、合并、路径访问等工具函数。
 */

/**
 * 检查值是否为对象(不包括数组或null)
 * @param item 要检查的值
 * @returns 如果是对象则返回true
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的新对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof typeof source;
      const targetKey = key as keyof typeof target;
      
      if (isObject(source[sourceKey])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[sourceKey] });
        } else {
          output[targetKey] = deepMerge(target[targetKey] as any, source[sourceKey] as any);
        }
      } else {
        Object.assign(output, { [key]: source[sourceKey] });
      }
    });
  }
  
  return output;
}

/**
 * 创建对象的深拷贝
 * @param obj 要拷贝的对象
 * @returns 对象的深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (isObject(obj)) {
    return Object.keys(obj).reduce((result, key) => {
      return {
        ...result,
        [key]: deepClone((obj as Record<string, any>)[key])
      };
    }, {}) as T;
  }

  return obj;
}

/**
 * 根据路径获取对象中的值
 * @param obj 目标对象
 * @param path 属性路径，如 "user.address.city" 或 ["user", "address", "city"]
 * @param defaultValue 默认值，当路径不存在时返回
 * @returns 路径指向的值或默认值
 */
export function get(
  obj: Record<string, any>, 
  path: string | string[], 
  defaultValue?: any
): any {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

/**
 * 根据路径设置对象中的值
 * @param obj 目标对象
 * @param path 属性路径，如 "user.address.city" 或 ["user", "address", "city"]
 * @param value 要设置的值
 * @returns 修改后的对象
 */
export function set<T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  value: any
): T {
  const keys = Array.isArray(path) ? path : path.split('.');
  const result = { ...obj };
  let current: any = result;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLast = i === keys.length - 1;

    if (isLast) {
      current[key] = value;
    } else {
      if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }
  }

  return result;
}

/**
 * 从对象中选择指定的属性创建新对象
 * @param obj 源对象
 * @param keys 要选择的属性数组
 * @returns 包含选择属性的新对象
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * a从对象中排除指定的属性创建新对象
 * @param obj 源对象
 * @param keys 要排除的属性数组
 * @returns 排除指定属性后的新对象
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * 检查对象是否为空(没有自有可枚举属性)
 * @param obj 要检查的对象
 * @returns 如果对象为空则返回true
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 导出objectUtils对象，保持向后兼容
 */
export const objectUtils = {
  isObject,
  deepMerge,
  deepClone,
  get,
  set,
  pick,
  omit,
  isEmpty
}; 