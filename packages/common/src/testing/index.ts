/**
 * 测试工具模块
 * 
 * 提供测试辅助工具、模拟对象和测试数据工厂。
 */

// 导出环境管理工具
export * from './environment';

// 导出夹具管理工具
export * from './fixtures';

// 导出核心功能 (原core.ts中的函数)
export {
  createMockFunction,
  createMockWithOptions,
  createResolvedPromiseMock,
  createRejectedPromiseMock,
  deepClone,
  deepEqual
} from './core';

// 从core.ts导出wait，但重命名为coreWait以避免冲突
export { wait as coreWait } from './core';

// 导出异步测试工具
export {
  sleep,
  withTimeout,
  parallel,
  waitForEvent,
  serial,
  createCancellablePromise,
  CancellablePromise
} from './async';

// 重命名有冲突的异步函数
export { 
  waitForCondition as waitUntil,
  retry as retryOperation
} from './async';

// 导出工厂
export * from './factories';

// 导出模拟对象
export * from './mocks/file-system';
export * from './mocks/http-client';

// 导出测试工具
export * from './utils';

// 以下是接口定义
// 模拟文件系统接口
export interface MockFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
}

// 模拟HTTP客户端接口
export interface MockHttpClient {
  get(url: string, headers?: Record<string, string>): Promise<any>;
  post(url: string, data: any, headers?: Record<string, string>): Promise<any>;
  put(url: string, data: any, headers?: Record<string, string>): Promise<any>;
  delete(url: string, headers?: Record<string, string>): Promise<any>;
}

// 测试数据工厂接口
export interface TestDataFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
} 