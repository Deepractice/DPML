/**
 * 转换器合并工具
 * 
 * 提供用于合并访问者返回值的实用函数
 */

/**
 * 合并选项接口
 */
export interface MergeOptions {
  /**
   * 是否进行深度合并
   * - true: 递归合并所有嵌套对象
   * - false: 只合并顶层属性
   */
  deepMerge?: boolean;
  
  /**
   * 是否合并数组
   * - true: 连接不同访问者返回的数组
   * - false: 覆盖先前返回的数组
   */
  mergeArrays?: boolean;
  
  /**
   * 冲突解决策略
   * - 'first-wins': 第一个返回值优先
   * - 'last-wins': 最后一个返回值优先
   */
  conflictStrategy?: 'first-wins' | 'last-wins';
  
  /**
   * 自定义合并函数
   * 用于自定义处理不同访问者返回值的合并逻辑
   */
  customMergeFn?: (key: string, value1: any, value2: any) => any;
}

/**
 * 合并多个访问者的返回值
 * 
 * @param results 访问者返回值数组
 * @param options 合并选项
 * @returns 合并后的结果
 */
export function mergeVisitorResults(results: any[], options: MergeOptions = {}): any {
  // 过滤掉null和undefined
  const validResults = results.filter(result => result != null);
  
  // 如果没有有效结果，返回null
  if (validResults.length === 0) {
    return null;
  }
  
  // 如果只有一个结果，直接返回
  if (validResults.length === 1) {
    return validResults[0];
  }
  
  // 如果提供了自定义合并函数，直接对整个结果进行特殊处理
  if (options.customMergeFn && typeof options.customMergeFn === 'function') {
    // 先尝试让自定义函数处理整个合并操作
    const firstResult = validResults[0];
    let mergedResult = firstResult;
    
    for (let i = 1; i < validResults.length; i++) {
      const currentResult = validResults[i];
      
      // 对两两结果应用合并
      for (const key in currentResult) {
        if (Object.prototype.hasOwnProperty.call(currentResult, key)) {
          // 在键级别应用自定义合并函数
          const value1 = key in mergedResult ? mergedResult[key] : undefined;
          const value2 = currentResult[key];
          const customResult = options.customMergeFn(key, value1, value2);
          
          if (customResult !== undefined) {
            // 如果是新对象，确保创建一个副本
            if (mergedResult === firstResult) {
              mergedResult = { ...firstResult };
            }
            mergedResult[key] = customResult;
          }
        }
      }
    }
    
    // 如果有任何自定义合并结果，返回合并后的对象
    if (mergedResult !== firstResult) {
      return mergedResult;
    }
  }
  
  // 回退到标准合并逻辑
  return validResults.reduce((acc, result) => {
    return mergeValues(acc, result, '', options);
  });
}

/**
 * 合并两个值（可能是对象、数组或原始值）
 * 
 * @param value1 第一个值
 * @param value2 第二个值
 * @param key 当前处理的键（用于自定义合并函数）
 * @param options 合并选项
 * @returns 合并后的值
 */
export function mergeValues(value1: any, value2: any, key: string = '', options: MergeOptions = {}): any {
  // 使用自定义合并函数（如果提供）
  if (options.customMergeFn) {
    const customResult = options.customMergeFn(key, value1, value2);
    // 如果自定义函数返回undefined，表示使用默认合并逻辑
    if (customResult !== undefined) {
      return customResult;
    }
  }
  
  // 处理数组
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return mergeArrays(value1, value2, key, options);
  }
  
  // 处理对象
  if (isObject(value1) && isObject(value2)) {
    return mergeObjects(value1, value2, options);
  }
  
  // 处理原始值冲突
  return resolveConflict(value1, value2, options, key);
}

/**
 * 合并两个数组
 * 
 * @param array1 第一个数组
 * @param array2 第二个数组
 * @param key 当前处理的键（用于自定义合并函数）
 * @param options 合并选项
 * @returns 合并后的数组
 */
export function mergeArrays(array1: any[], array2: any[], key: string = '', options: MergeOptions = {}): any[] {
  // 先尝试使用自定义合并函数
  if (options.customMergeFn) {
    const customResult = options.customMergeFn(key, array1, array2);
    if (customResult !== undefined) {
      return customResult;
    }
  }
  
  // 如果启用了数组合并，连接数组
  if (options.mergeArrays) {
    return [...array1, ...array2];
  }
  
  // 否则根据冲突策略选择
  return resolveConflict(array1, array2, options, key);
}

/**
 * 深度合并两个对象
 * 
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @param options 合并选项
 * @returns 合并后的对象
 */
export function mergeObjects(obj1: Record<string, any>, obj2: Record<string, any>, options: MergeOptions = {}): Record<string, any> {
  // 先尝试使用自定义合并函数处理整个对象
  if (options.customMergeFn) {
    const customResult = options.customMergeFn('', obj1, obj2);
    if (customResult !== undefined) {
      return customResult;
    }
  }
  
  const result = { ...obj1 };
  
  // 遍历obj2的所有属性
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      // 如果结果中不存在此键，直接添加
      if (!Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] = obj2[key];
        continue;
      }
      
      // 先尝试使用自定义合并函数
      if (options.customMergeFn) {
        const customResult = options.customMergeFn(key, result[key], obj2[key]);
        if (customResult !== undefined) {
          result[key] = customResult;
          continue;
        }
      }
      
      // 如果两个值都是对象且启用了深度合并
      if (isObject(result[key]) && isObject(obj2[key]) && options.deepMerge) {
        result[key] = mergeObjects(result[key], obj2[key], options);
      } 
      // 如果两个值都是数组
      else if (Array.isArray(result[key]) && Array.isArray(obj2[key])) {
        result[key] = mergeArrays(result[key], obj2[key], key, options);
      } 
      // 其他情况，处理冲突
      else {
        result[key] = resolveConflict(result[key], obj2[key], options, key);
      }
    }
  }
  
  return result;
}

/**
 * 根据冲突策略解决值冲突
 * 
 * @param value1 第一个值
 * @param value2 第二个值
 * @param options 合并选项
 * @param key 发生冲突的键（可选，用于调试）
 * @returns 解决冲突后的值
 */
export function resolveConflict(value1: any, value2: any, options: MergeOptions = {}, key: string = ''): any {
  // 如果提供了自定义合并函数，优先使用
  if (options.customMergeFn) {
    const customResult = options.customMergeFn(key, value1, value2);
    if (customResult !== undefined) {
      return customResult;
    }
  }
  
  // 根据冲突策略返回适当的值
  switch (options.conflictStrategy) {
    case 'first-wins':
      return value1;
    case 'last-wins':
      return value2;
    default:
      // 默认为last-wins
      return value2;
  }
}

/**
 * 检查是否为对象（不包括null和数组）
 * 
 * @param value 要检查的值
 * @returns 是否为对象
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
} 