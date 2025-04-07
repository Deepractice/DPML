import { TransformContext } from '../interfaces/transformContext';
import { ProcessedDocument } from '../../processor/interfaces/processor';
import { TransformOptions } from '../interfaces/transformOptions';

/**
 * 上下文管理器，负责创建和管理转换上下文
 */
export class ContextManager {
  /**
   * 创建根上下文
   * @param document 处理后的文档
   * @param options 转换选项
   * @returns 根上下文
   */
  createRootContext(document: ProcessedDocument, options: TransformOptions): TransformContext {
    return {
      document,
      options,
      output: {},
      variables: { ...options.variables },
      path: [],
      parentResults: [],
      nested: new Map()
    };
  }
  
  /**
   * 创建子上下文
   * @param parentContext 父上下文
   * @param pathElement 路径元素
   * @param variables 变量覆盖
   * @returns 子上下文
   */
  createChildContext(
    parentContext: TransformContext,
    pathElement: string,
    variables?: Record<string, any>
  ): TransformContext {
    return {
      ...parentContext,
      path: [...parentContext.path, pathElement],
      variables: {
        ...parentContext.variables,
        ...(variables || {})
      },
      parentResults: [...parentContext.parentResults]
    };
  }
  
  /**
   * 添加结果到上下文
   * @param context 上下文
   * @param result 结果
   * @returns 更新后的上下文
   */
  addResult(context: TransformContext, result: any): TransformContext {
    return {
      ...context,
      parentResults: [...context.parentResults, result]
    };
  }
  
  /**
   * 获取当前路径位置
   * @param context 上下文
   * @returns 当前路径位置名称
   */
  getCurrentPathElement(context: TransformContext): string | undefined {
    if (context.path.length === 0) {
      return undefined;
    }
    
    return context.path[context.path.length - 1];
  }
  
  /**
   * 获取父路径位置
   * @param context 上下文
   * @returns 父路径位置名称
   */
  getParentPathElement(context: TransformContext): string | undefined {
    if (context.path.length < 2) {
      return undefined;
    }
    
    return context.path[context.path.length - 2];
  }
  
  /**
   * 获取路径标识符
   * @param context 上下文
   * @param separator 分隔符
   * @returns 路径标识符
   */
  getPathIdentifier(context: TransformContext, separator: string = '/'): string {
    return context.path.join(separator);
  }
  
  /**
   * 检查上下文路径是否包含指定元素
   * @param context 上下文
   * @param element 路径元素
   * @returns 是否包含
   */
  pathContains(context: TransformContext, element: string): boolean {
    return context.path.includes(element);
  }
  
  /**
   * 获取路径元素的索引
   * @param pathElement 路径元素
   * @returns 索引或undefined
   */
  getElementIndex(pathElement: string): number | undefined {
    const matches = pathElement.match(/\[(\d+)\]/);
    if (matches && matches.length > 1) {
      return parseInt(matches[1], 10);
    }
    return undefined;
  }
  
  /**
   * 获取路径元素的名称（不含索引或标识符）
   * @param pathElement 路径元素
   * @returns 名称
   */
  getElementName(pathElement: string): string {
    return pathElement.replace(/\[[^\]]*\]/, '');
  }
  
  /**
   * 获取路径元素的标识符
   * @param pathElement 路径元素
   * @returns 标识符或undefined
   */
  getElementIdentifier(pathElement: string): string | undefined {
    const matches = pathElement.match(/\[([^\d][^\]]*)\]/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return undefined;
  }
  
  /**
   * 设置变量
   * @param context 上下文
   * @param name 变量名
   * @param value 变量值
   * @returns 更新后的上下文
   */
  setVariable(context: TransformContext, name: string, value: any): TransformContext {
    // 创建新的上下文，保留嵌套结构
    const updatedContext: TransformContext = {
      ...context,
      variables: {
        ...context.variables,
        [name]: value
      },
      // 保留现有的嵌套结构和父引用
      parent: context.parent,
      nested: context.nested
    };

    return updatedContext;
  }
  
  /**
   * 获取变量
   * @param context 上下文
   * @param name 变量名
   * @param defaultValue 默认值
   * @param searchParent 是否搜索父上下文
   * @returns 变量值
   */
  getVariable(
    context: TransformContext, 
    name: string, 
    defaultValue?: any, 
    searchParent: boolean = true
  ): any {
    // 首先在当前上下文中查找
    if (name in context.variables) {
      return context.variables[name];
    }
    
    // 如果允许搜索父上下文且存在父上下文，则在父上下文中查找
    if (searchParent && context.parent) {
      return this.getVariable(context.parent, name, defaultValue);
    }
    
    return defaultValue;
  }
  
  /**
   * 批量设置变量
   * @param context 上下文
   * @param variables 变量映射
   * @returns 更新后的上下文
   */
  setVariables(context: TransformContext, variables: Record<string, any>): TransformContext {
    return {
      ...context,
      variables: {
        ...context.variables,
        ...variables
      }
    };
  }
  
  /**
   * 创建新的上下文副本
   * @param context 原上下文
   * @returns 上下文副本
   */
  cloneContext(context: TransformContext): TransformContext {
    return {
      ...context,
      variables: { ...context.variables },
      path: [...context.path],
      parentResults: [...context.parentResults],
      output: { ...context.output }
    };
  }
  
  /**
   * 获取指定类型的父结果
   * @param context 上下文
   * @param type 结果类型
   * @returns 匹配的结果或undefined
   */
  getParentResultByType(context: TransformContext, type: string): any | undefined {
    return context.parentResults.find(result => result.type === type);
  }
  
  /**
   * 获取指定索引的父结果
   * @param context 上下文
   * @param index 索引
   * @returns 结果或undefined
   */
  getParentResultByIndex(context: TransformContext, index: number): any | undefined {
    if (index < 0 || index >= context.parentResults.length) {
      return undefined;
    }
    
    return context.parentResults[index];
  }
  
  /**
   * 获取最近的父结果
   * @param context 上下文
   * @returns 最近的父结果或undefined
   */
  getLatestParentResult(context: TransformContext): any | undefined {
    if (context.parentResults.length === 0) {
      return undefined;
    }
    
    return context.parentResults[context.parentResults.length - 1];
  }
  
  /**
   * 获取所有指定类型的父结果
   * @param context 上下文
   * @param type 结果类型
   * @returns 匹配的结果数组
   */
  getAllParentResultsByType(context: TransformContext, type: string): any[] {
    return context.parentResults.filter(result => result.type === type);
  }
  
  /**
   * 检查是否有指定类型的父结果
   * @param context 上下文
   * @param type 结果类型
   * @returns 是否存在
   */
  hasParentResultOfType(context: TransformContext, type: string): boolean {
    return context.parentResults.some(result => result.type === type);
  }
  
  /**
   * 通过路径获取对应父结果
   * @param context 上下文
   * @param path 路径
   * @returns 父结果链
   */
  getParentResultsByPath(context: TransformContext): Record<string, any> {
    const result: Record<string, any> = {};
    
    // 将路径和父结果组合
    for (let i = 0; i < context.path.length && i < context.parentResults.length; i++) {
      const pathSegment = context.path[i];
      result[pathSegment] = context.parentResults[i];
    }
    
    return result;
  }
  
  /**
   * 合并父结果链
   * @param parentResults1 第一条父结果链
   * @param parentResults2 第二条父结果链
   * @returns 合并后的父结果链
   */
  mergeParentResults(parentResults1: any[], parentResults2: any[]): any[] {
    const merged = [...parentResults1];
    
    // 合并第二条链的结果，避免重复
    for (const result of parentResults2) {
      if (!merged.includes(result)) {
        merged.push(result);
      }
    }
    
    return merged;
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 深度克隆后的对象
   * @private
   */
  private deepCloneObject<T>(obj: T): T {
    // 处理null或undefined
    if (obj === null || obj === undefined) {
      return obj;
    }

    // 处理基本类型
    if (typeof obj !== 'object') {
      return obj;
    }

    // 处理数组
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepCloneObject(item)) as unknown as T;
    }

    // 处理对象
    const result = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.deepCloneObject(obj[key]);
      }
    }
    return result;
  }

  /**
   * 深度克隆上下文
   * @param context 原上下文
   * @returns 深度克隆后的上下文
   */
  deepCloneContext(context: TransformContext): TransformContext {
    return {
      // document和options通常是只读的，不需要深度克隆
      document: context.document,
      options: context.options,
      // 深度克隆其他属性
      variables: this.deepCloneObject(context.variables),
      path: this.deepCloneObject(context.path),
      parentResults: this.deepCloneObject(context.parentResults),
      output: this.deepCloneObject(context.output)
    };
  }

  /**
   * 创建嵌套上下文
   * @param parentContext 父上下文
   * @param pathElement 路径元素
   * @param variables 变量覆盖
   * @returns 嵌套子上下文
   */
  createNestedContext(
    parentContext: TransformContext,
    pathElement: string,
    variables?: Record<string, any>
  ): TransformContext {
    // 初始化父上下文的nested属性（如果不存在）
    if (!parentContext.nested) {
      parentContext.nested = new Map();
    }

    // 创建嵌套子上下文
    const childContext: TransformContext = {
      document: parentContext.document,
      options: parentContext.options,
      output: {},
      variables: {
        ...parentContext.variables,
        ...(variables || {})
      },
      path: [...parentContext.path, pathElement],
      parentResults: [...parentContext.parentResults],
      parent: parentContext,
      nested: new Map()
    };

    // 将子上下文添加到父上下文的嵌套集合中
    parentContext.nested.set(pathElement, childContext);

    return childContext;
  }

  /**
   * 获取指定层级的祖先上下文
   * @param context 当前上下文
   * @param level 祖先层级（0表示当前上下文，1表示父上下文，依此类推）
   * @returns 祖先上下文或undefined
   */
  getAncestorContext(context: TransformContext, level: number): TransformContext | undefined {
    if (level === 0) {
      return context;
    }

    if (!context.parent) {
      return undefined;
    }

    return this.getAncestorContext(context.parent, level - 1);
  }

  /**
   * 通过路径元素获取祖先上下文
   * @param context 当前上下文
   * @param pathElement 路径元素名称
   * @returns 匹配的祖先上下文或undefined
   */
  getAncestorContextByPathElement(context: TransformContext, pathElement: string): TransformContext | undefined {
    if (!context.parent) {
      return undefined;
    }

    // 检查父上下文的路径最后一个元素是否匹配
    const parentPathElement = this.getCurrentPathElement(context.parent);
    if (parentPathElement === pathElement) {
      return context.parent;
    }

    // 递归检查更高层级的祖先
    return this.getAncestorContextByPathElement(context.parent, pathElement);
  }

  /**
   * 将变更传播到所有子上下文
   * @param context 已更新的上下文
   * @returns 更新后的子上下文映射
   */
  propagateChange(context: TransformContext): Map<string, TransformContext> {
    if (!context.nested || context.nested.size === 0) {
      return new Map();
    }

    const updatedChildren = new Map<string, TransformContext>();

    // 对每个子上下文进行更新
    for (const [key, childContext] of context.nested.entries()) {
      // 创建子上下文的深度克隆，保留其原始变量但更新从父上下文继承的状态
      const updatedChild: TransformContext = {
        document: context.document,
        options: context.options,
        // 使子上下文能访问父上下文的变量，确保子上下文特有的变量优先级更高
        variables: { ...context.variables, ...childContext.variables },
        path: [...childContext.path],
        parentResults: [...childContext.parentResults],
        output: { ...childContext.output }, // 保留子上下文的输出
        parent: context, // 更新父引用指向新的父上下文
        nested: childContext.nested ? new Map(childContext.nested) : new Map()
      };

      // 递归更新子上下文的子上下文
      if (updatedChild.nested && updatedChild.nested.size > 0) {
        const nestedUpdated = this.propagateChange(updatedChild);
        updatedChild.nested = nestedUpdated;
      }

      updatedChildren.set(key, updatedChild);
    }

    return updatedChildren;
  }

  /**
   * 获取组合的所有父结果
   * @param context 当前上下文
   * @returns 组合后的父结果数组
   */
  getCombinedResults(context: TransformContext): any[] {
    return [...context.parentResults];
  }

  /**
   * 通过路径获取结果映射
   * @param context 当前上下文
   * @returns 路径到结果的映射
   */
  getResultsByPath(context: TransformContext): Record<string, any> {
    const result: Record<string, any> = {};
    let currentContext: TransformContext | undefined = context;
    
    // 从当前上下文开始逐层向上，收集路径和结果
    while (currentContext) {
      const currentPath = currentContext.path;
      if (currentPath.length > 0) {
        // 获取当前上下文的路径元素
        const pathElement = this.getCurrentPathElement(currentContext);
        if (pathElement) {
          const elementName = this.getElementName(pathElement);
          // 获取当前上下文的最近结果
          const latestResult = this.getLatestParentResult(currentContext);
          if (latestResult) {
            result[elementName] = latestResult;
          }
        }
      }
      
      // 如果是根上下文但有结果，添加document键
      if (currentContext.path.length === 0 && currentContext.parentResults.length > 0) {
        result['document'] = currentContext.parentResults[0];
      }
      
      // 向上移动到父上下文
      currentContext = currentContext.parent;
    }
    
    return result;
  }

  /**
   * 深度克隆嵌套上下文结构
   * @param context 要克隆的上下文
   * @returns 深度克隆后的上下文，包括嵌套结构
   */
  deepCloneNestedContext(context: TransformContext): TransformContext {
    // 基础克隆，保持共享引用
    const cloned: TransformContext = {
      document: context.document,
      options: context.options,
      output: this.deepCloneObject(context.output),
      variables: this.deepCloneObject(context.variables),
      path: [...context.path],
      parentResults: this.deepCloneObject(context.parentResults),
      parent: context.parent, // 保持原始父引用
      nested: new Map() // 确保nested一定存在
    };

    // 递归克隆嵌套上下文
    if (context.nested && context.nested.size > 0) {
      for (const [key, nestedContext] of context.nested.entries()) {
        const clonedNested = this.deepCloneNestedContext(nestedContext);
        clonedNested.parent = cloned; // 更新父引用指向克隆后的上下文
        // 使用类型断言告诉TypeScript，我们确定cloned.nested存在
        (cloned.nested as Map<string, TransformContext>).set(key, clonedNested);
      }
    }

    return cloned;
  }
} 