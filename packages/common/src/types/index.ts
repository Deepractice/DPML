/**
 * 共享类型定义模块
 * 
 * 提供DPML项目中共享的基础类型定义。
 */

// 错误类型
export interface DPMLError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

// 创建DPML错误的工厂函数
export function createDPMLError(
  message: string,
  code: string,
  details?: Record<string, unknown>
): DPMLError {
  const error = new Error(message) as DPMLError;
  error.code = code;
  error.details = details;
  return error;
}

// 配置类型
export interface BaseConfig {
  [key: string]: unknown;
}

// 文件系统抽象接口
export interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStat>;
}

export interface FileStat {
  isFile(): boolean;
  isDirectory(): boolean;
  size: number;
  mtimeMs: number;
}

// HTTP客户端抽象接口
export interface HttpClient {
  get<T = any>(url: string, headers?: Record<string, string>): Promise<T>;
  post<T = any>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
  put<T = any>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
  delete<T = any>(url: string, headers?: Record<string, string>): Promise<T>;
}

// 事件相关类型
export interface EventEmitter<T extends Record<string, any[]>> {
  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this;
  off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this;
  once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this;
  emit<K extends keyof T>(event: K, ...args: T[K]): boolean;
}

// 工具类型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
export type RecursiveRequired<T> = {
  [K in keyof T]-?: RecursiveRequired<T[K]>
};

// 结果类型
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  value: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

export function success<T>(value: T): Success<T> {
  return { success: true, value };
}

export function failure<E>(error: E): Failure<E> {
  return { success: false, error };
}

// 异步操作结果类型
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>; 