/**
 * 用于获取导入类型的辅助类型
 * 注意：由于TS限制，这只是类型声明，实际导入由setupCoreMock处理
 */
export type ImportType<T> = Record<string, any>;

/**
 * 模拟选项接口
 */
export interface MockOptions {
  returnValue?: any;
  implementation?: (...args: any[]) => any;
} 