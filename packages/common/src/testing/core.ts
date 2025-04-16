/**
 * 测试工具核心功能
 */

/**
 * Mock函数类型
 */
export type MockFunction<T extends (...args: any[]) => any> = T & {
  mock: {
    calls: Parameters<T>[];
    results: { type: 'return' | 'throw', value: any }[];
  };
};

/**
 * 创建mock函数
 * 
 * @param implementation 可选的实现函数
 * @returns 带有跟踪功能的mock函数
 */
export function createMockFunction<T extends (...args: any[]) => any>(
  implementation?: T
): MockFunction<T> {
  const calls: Parameters<T>[] = [];
  const results: { type: 'return' | 'throw', value: any }[] = [];
  
  const mockFn = ((...args: Parameters<T>) => {
    calls.push(args);
    try {
      const result = implementation?.(...args);
      results.push({ type: 'return', value: result });
      return result;
    } catch (error) {
      results.push({ type: 'throw', value: error });
      throw error;
    }
  }) as MockFunction<T>;
  
  mockFn.mock = { calls, results };
  
  return mockFn;
}

/**
 * Mock选项接口
 */
export interface MockOptions {
  returnValue?: any;
  implementation?: (...args: any[]) => any;
}

/**
 * 根据选项创建mock函数
 * 
 * @param options Mock选项
 * @returns Mock函数
 */
export function createMockWithOptions<T extends (...args: any[]) => any>(
  options: MockOptions = {}
): MockFunction<T> {
  if (options.implementation) {
    return createMockFunction(options.implementation as T);
  }
  
  // 使用返回固定值的实现
  return createMockFunction((() => options.returnValue) as T);
}

/**
 * 创建一个解析为指定值的Promise的mock函数
 * 
 * @param value 要解析的值
 * @returns 返回解析Promise的mock函数
 */
export function createResolvedPromiseMock<T>(value: T): MockFunction<() => Promise<T>> {
  return createMockFunction(async () => value);
}

/**
 * 创建一个拒绝为指定错误的Promise的mock函数
 * 
 * @param error 要拒绝的错误
 * @returns 返回拒绝Promise的mock函数
 */
export function createRejectedPromiseMock<E = Error>(error: E): MockFunction<() => Promise<never>> {
  return createMockFunction(async () => { throw error; });
}

/**
 * 等待指定时间
 * 
 * @param ms 毫秒数
 * @returns 一个在指定时间后解决的Promise
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建一个值的深拷贝
 * 
 * @param value 要拷贝的值
 * @returns 深拷贝后的值
 */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * 检测两个值是否深度相等
 * 
 * @param a 第一个值
 * @param b 第二个值
 * @returns 如果两个值深度相等则为true
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a.entries()) {
        if (!b.has(key) || !deepEqual(value, b.get(key))) return false;
      }
      return true;
    }
    
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (const item of a) {
        if (!b.has(item)) return false;
      }
      return true;
    }
    
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    
    if (a instanceof RegExp && b instanceof RegExp) {
      return a.toString() === b.toString();
    }
    
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  // Handle NaN
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  
  return false;
} 