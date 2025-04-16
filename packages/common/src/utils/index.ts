/**
 * 通用工具函数模块
 * 
 * 提供字符串处理、数组操作、对象处理、异步操作和路径处理等通用工具。
 */

// 字符串工具
export const stringUtils = {
  /**
   * 检查字符串是否为空或仅包含空白字符
   */
  isEmpty: (str: string): boolean => {
    return str === undefined || str === null || str.trim() === '';
  },
  
  /**
   * 确保字符串以特定字符结尾
   */
  ensureEndsWith: (str: string, char: string): string => {
    return str.endsWith(char) ? str : `${str}${char}`;
  },
  
  /**
   * 截断字符串到指定长度，并添加省略号
   */
  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
};

// 数组工具
export const arrayUtils = {
  /**
   * 按指定属性对数组进行分组
   */
  groupBy: <T extends Record<K, PropertyKey>, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      result[groupKey] = result[groupKey] || [];
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  },
  
  /**
   * 从数组中移除重复项
   */
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },
  
  /**
   * 将数组拆分为指定大小的块
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(array.length / size) }, 
      (_, index) => array.slice(index * size, index * size + size));
  }
};

// 对象工具
export const objectUtils = {
  /**
   * 深度合并两个对象
   */
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
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
};

// 辅助函数
function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return objectUtils.deepMerge(target, source);
}

// 异步工具
export const asyncUtils = {
  /**
   * 延迟执行一段时间
   */
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * 重试函数，直到成功或达到最大尝试次数
   */
  retry: async <T>(
    fn: () => Promise<T>,
    options: { maxAttempts: number; delay: number }
  ): Promise<T> => {
    const { maxAttempts, delay } = options;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await asyncUtils.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }
}; 