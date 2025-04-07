/**
 * 变量配置工具
 * 
 * 用于处理转换过程中的自定义变量配置，包括变量解析、合并、继承等功能
 */
import { TransformOptions } from '../interfaces/transformOptions';
import { TransformContext } from '../interfaces/transformContext';

/**
 * 变量解析器接口
 */
export interface VariableResolver {
  /**
   * 解析变量引用
   * 
   * @param value 包含变量引用的字符串
   * @param variables 变量集合
   * @returns 解析后的字符串
   */
  resolve(value: string, variables: Record<string, any>): string;
}

/**
 * 默认变量解析器
 * 
 * 支持${变量名}形式的变量引用
 */
export class DefaultVariableResolver implements VariableResolver {
  /**
   * 解析变量引用
   * 
   * @param value 包含变量引用的字符串
   * @param variables 变量集合
   * @returns 解析后的字符串
   */
  resolve(value: string, variables: Record<string, any>): string {
    if (typeof value !== 'string') {
      return value;
    }
    
    // 匹配${变量名}形式的引用
    return value.replace(/\${([^}]+)}/g, (match, varName) => {
      // 支持嵌套属性路径，如 ${user.name}
      const path = varName.trim().split('.');
      let current = variables;
      
      // 遍历路径查找变量值
      for (const key of path) {
        if (current === undefined || current === null) {
          return match; // 变量不存在，保留原始引用
        }
        current = current[key];
      }
      
      // 如果找到值，转换为字符串
      return current !== undefined && current !== null 
        ? String(current) 
        : match;
    });
  }
}

/**
 * 解析包含变量引用的对象
 * 
 * @param obj 包含变量引用的对象
 * @param variables 变量集合
 * @param resolver 变量解析器
 * @returns 解析后的对象
 */
export function resolveVariables(
  obj: any, 
  variables: Record<string, any>,
  resolver: VariableResolver = new DefaultVariableResolver()
): any {
  // 处理字符串类型
  if (typeof obj === 'string') {
    return resolver.resolve(obj, variables);
  }
  
  // 处理数组类型
  if (Array.isArray(obj)) {
    return obj.map(item => resolveVariables(item, variables, resolver));
  }
  
  // 处理对象类型
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveVariables(value, variables, resolver);
    }
    
    return result;
  }
  
  // 其他基本类型直接返回
  return obj;
}

/**
 * 从TransformOptions中提取变量
 * 
 * @param options 转换选项
 * @returns 变量集合
 */
export function getVariables(options?: TransformOptions): Record<string, any> {
  return options?.variables || {};
}

/**
 * 合并多个变量集合
 * 
 * @param targetVariables 目标变量集合
 * @param sourceVariables 源变量集合
 * @param deep 是否深度合并
 * @returns 合并后的变量集合
 */
export function mergeVariables(
  targetVariables: Record<string, any>,
  sourceVariables: Record<string, any>,
  deep: boolean = true
): Record<string, any> {
  const result = { ...targetVariables };
  
  for (const [key, value] of Object.entries(sourceVariables)) {
    // 如果启用深度合并且两边都是对象，递归合并
    if (deep && 
        typeof value === 'object' && value !== null && !Array.isArray(value) &&
        typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
      result[key] = mergeVariables(result[key], value, deep);
    } else {
      // 否则直接覆盖
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * 在转换上下文中应用变量
 * 
 * @param context 转换上下文
 * @param variables 要应用的变量
 * @param deep 是否深度合并
 * @returns 更新后的上下文
 */
export function applyVariablesToContext(
  context: TransformContext,
  variables: Record<string, any>,
  deep: boolean = true
): TransformContext {
  return {
    ...context,
    variables: mergeVariables(context.variables, variables, deep)
  };
} 