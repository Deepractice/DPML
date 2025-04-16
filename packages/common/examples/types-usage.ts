/**
 * 类型系统使用示例
 */

// 导入所需类型
import { LoggerConfig, FormatterConfig } from '../src/types/config';
import {
  DPMLError,
  ValidationError,
  FileSystemError,
  NetworkError,
  createDPMLError,
} from '../src/types/errors';
import { Event, EventBus, EventPriority } from '../src/types/events';

import type { AppConfig } from '../src/types/config';
import type { FileSystem, FileStat, ReadDirOptions } from '../src/types/fs';
import type {
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
} from '../src/types/http';
import type {
  DeepPartial,
  Result,
  AsyncResult,
  PaginatedResult,
} from '../src/types/utils';

/**
 * 错误处理示例
 */
function errorHandlingExample() {
  try {
    // 创建基本错误
    throw createDPMLError('操作失败', 'OPERATION_FAILED', { id: 123 });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('验证错误:', error.fields);
    } else if (error instanceof FileSystemError) {
      console.error('文件系统错误:', error.path);
    } else if (error instanceof NetworkError) {
      console.error('网络错误:', error.statusCode);
    } else if (error instanceof DPMLError) {
      console.error('DPML错误:', error.code, error.details);
    }
  }
}

/**
 * 配置处理示例
 */
function configExample() {
  // 创建应用配置
  const config: AppConfig = {
    logger: {
      level: 'info',
      enableColors: true,
      formatter: {
        type: 'json',
        pretty: true,
      },
      transports: [
        { type: 'console' },
        { type: 'file', options: { path: './logs/app.log' } },
      ],
    },
    http: {
      baseUrl: 'https://api.example.com',
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };

  // 使用DeepPartial创建部分配置
  const partialConfig: DeepPartial<AppConfig> = {
    logger: {
      level: 'debug',
    },
  };

  // 合并配置
  const mergedConfig = { ...config, ...partialConfig };
}

/**
 * 文件系统示例
 */
class NodeFileSystem implements FileSystem {
  async readFile(path: string, encoding?: string): Promise<string> {
    // 实现代码
    return '';
  }

  async readFileBuffer(path: string): Promise<Uint8Array> {
    // 实现代码
    return new Uint8Array();
  }

  async writeFile(path: string, content: string | Uint8Array): Promise<void> {
    // 实现代码
  }

  async appendFile(path: string, content: string | Uint8Array): Promise<void> {
    // 实现代码
  }

  async exists(path: string): Promise<boolean> {
    // 实现代码
    return false;
  }

  async stat(path: string): Promise<FileStat> {
    // 实现代码
    return {
      isFile: () => true,
      isDirectory: () => false,
      isSymbolicLink: () => false,
      size: 0,
      mtimeMs: Date.now(),
      ctimeMs: Date.now(),
      atimeMs: Date.now(),
    };
  }

  async mkdir(path: string, recursive?: boolean): Promise<void> {
    // 实现代码
  }

  async readdir(path: string, options?: ReadDirOptions): Promise<string[]> {
    // 实现代码
    return [];
  }

  async unlink(path: string): Promise<void> {
    // 实现代码
  }

  async rmdir(path: string, recursive?: boolean): Promise<void> {
    // 实现代码
  }

  async copyFile(src: string, dest: string): Promise<void> {
    // 实现代码
  }

  async moveFile(
    src: string,
    dest: string,
    overwrite?: boolean
  ): Promise<void> {
    // 实现代码
  }

  watch(): any {
    // 实现代码
    return { close: () => {} };
  }
}

/**
 * HTTP客户端示例
 */
class FetchHttpClient implements HttpClient {
  async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    // 实现代码
    return {
      data: {} as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  async get<T>(url: string, config?: any): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(
    url: string,
    data?: any,
    config?: any
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  async put<T>(
    url: string,
    data?: any,
    config?: any
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  async delete<T>(url: string, config?: any): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: any
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  async head<T>(url: string, config?: any): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  async options<T>(url: string, config?: any): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }

  createCancelToken(): any {
    return { token: {}, cancel: () => {} };
  }

  isCancel(): boolean {
    return false;
  }

  addRequestInterceptor(): number {
    return 0;
  }

  addResponseInterceptor(): number {
    return 0;
  }

  removeInterceptor(): void {}

  configure(): void {}
}

/**
 * 结果类型示例
 */
function resultTypeExample() {
  // 同步结果
  function divide(a: number, b: number): Result<number, Error> {
    if (b === 0) {
      return { success: false, error: new Error('除数不能为零') };
    }

    return { success: true, value: a / b };
  }

  // 异步结果
  async function fetchData(): AsyncResult<any, Error> {
    try {
      const data = { name: '示例数据' };

      return { success: true, value: data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  // 使用结果
  const result = divide(10, 2);

  if (result.success) {
    console.log('结果:', result.value);
  } else {
    console.error('错误:', result.error.message);
  }
}

/**
 * 分页数据示例
 */
function paginationExample() {
  // 分页数据
  const pagedResult: PaginatedResult<any> = {
    items: [{ id: 1 }, { id: 2 }],
    total: 100,
    page: 1,
    pageSize: 10,
    totalPages: 10,
    hasNext: true,
    hasPrev: false,
  };

  // 处理分页数据
  console.log(
    `显示 ${pagedResult.items.length} 条记录，共 ${pagedResult.total} 条`
  );
}

// 事件类型示例
interface UserEvents {
  'user:login': {
    type: 'user:login';
    userId: string;
    timestamp: number;
  };
  'user:logout': {
    type: 'user:logout';
    userId: string;
    timestamp: number;
  };
}
