/**
 * 测试工具模块
 *
 * 提供测试辅助工具、模拟对象和测试环境管理功能。
 */

// 使用具名导出避免命名冲突
import * as asyncUtils from './async';
import * as environmentUtils from './environment';
import * as fixturesUtils from './fixtures';
import * as fileSystemMock from './mocks/file-system';
import * as httpClientMock from './mocks/http-client';
import * as testingUtils from './utils';

// 导出所有模块，使用命名空间避免冲突
export {
  asyncUtils,
  environmentUtils,
  fixturesUtils,
  fileSystemMock,
  httpClientMock,
  testingUtils
};

// 直接导出常用测试环境函数
export {
  withTestEnvironment,
  createTestEnvironment,
  createTestEnvWithSpies
} from './environment';

// 导出工厂
export * from './factories';

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

// 提供接口定义
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