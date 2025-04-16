/**
 * 共享类型定义模块
 * 
 * 提供DPML项目中共享的基础类型定义。
 */

// 导出模块
export * from './errors';
export * from './config';
export * from './fs';
export * from './http';
export * from './events';

// 使用具名导出utils模块避免名称冲突
import * as utilsTypes from './utils';
export { utilsTypes };

// 用例示例
/**
 * 以下是类型系统的使用示例：
 * 
 * ```typescript
 * // 错误处理
 * import { createDPMLError, ValidationError } from '@dpml/common/types';
 * 
 * try {
 *   throw createDPMLError('操作失败', 'OPERATION_FAILED', { id: 123 });
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('验证错误:', error.fields);
 *   }
 * }
 * 
 * // 配置类型
 * import { AppConfig } from '@dpml/common/types';
 * 
 * const config: AppConfig = {
 *   logger: {
 *     level: 'info',
 *     formatter: {
 *       type: 'json',
 *       pretty: true
 *     }
 *   }
 * };
 * 
 * // 文件系统接口
 * import { FileSystem } from '@dpml/common/types';
 * 
 * class NodeFileSystem implements FileSystem {
 *   // 实现文件系统接口方法
 *   async readFile(path: string): Promise<string> {
 *     // 实现代码
 *     return '';
 *   }
 *   // ... 其他方法实现
 * }
 * 
 * // HTTP客户端
 * import { HttpClient, HttpRequestConfig } from '@dpml/common/types';
 * 
 * class FetchHttpClient implements HttpClient {
 *   // 实现HTTP客户端接口方法
 *   async request<T>(config: HttpRequestConfig): Promise<any> {
 *     // 实现代码
 *     return { data: {} as T, status: 200, statusText: 'OK', headers: {}, config };
 *   }
 *   // ... 其他方法实现
 * }
 * 
 * // 事件系统
 * import { EventBus, Event } from '@dpml/common/types';
 * 
 * interface UserLoginEvent extends Event {
 *   type: 'user:login';
 *   userId: string;
 * }
 * 
 * // 工具类型
 * import { utilsTypes } from '@dpml/common/types';
 * const { DeepPartial, Result, AsyncResult } = utilsTypes;
 * 
 * type PartialConfig = DeepPartial<AppConfig>;
 * 
 * async function loadConfig(): AsyncResult<AppConfig> {
 *   try {
 *     const config = await fetchConfig();
 *     return { success: true, value: config };
 *   } catch (error) {
 *     return { success: false, error: error as Error };
 *   }
 * }
 * ```
 */ 