import { ENV_VAR_PATTERN } from './constants';

/**
 * 替换值中的环境变量引用（Core实现）
 */
export function replaceEnvVars<T>(value: T): T {
  // 处理null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // 处理字符串
  if (typeof value === 'string') {
    return replaceInString(value) as unknown as T;
  }

  // 处理数组
  if (Array.isArray(value)) {
    return value.map(item => replaceEnvVars(item)) as unknown as T;
  }

  // 处理对象
  if (typeof value === 'object') {
    const result: Record<string, any> = {};

    for (const key in value as Record<string, any>) {
      result[key] = replaceEnvVars((value as Record<string, any>)[key]);
    }

    return result as T;
  }

  // 其他类型直接返回
  return value;
}

/**
 * 替换字符串中的环境变量引用
 */
function replaceInString(value: string): string {
  return value.replace(ENV_VAR_PATTERN, (_match, envName) => {
    const envValue = process.env[envName];

    if (envValue === undefined) {
      console.warn(`警告: 环境变量 ${envName} 未定义`);

      return _match; // 保留原始表达式
    }

    return envValue;
  });
}
