import { faker } from '@faker-js/faker';

/**
 * HTTP方法类型
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * HTTP请求配置
 */
export interface HttpRequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: any;
  timeout?: number;
}

/**
 * HTTP响应
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestConfig;
}

/**
 * HTTP错误
 */
export interface HttpError {
  message: string;
  code?: string;
  status?: number;
  config?: HttpRequestConfig;
  response?: HttpResponse;
  data?: any;
  statusText?: string;
  headers?: Record<string, string>;
}

/**
 * 模拟HTTP请求匹配器
 */
export interface MockHttpRequestMatcher {
  /**
   * 设置响应
   * @param status 状态码
   * @param data 响应数据
   * @param headers 响应头
   * @returns 模拟HTTP客户端
   */
  reply<T = any>(
    status: number,
    data: T,
    headers?: Record<string, string>
  ): MockHttpClient;

  /**
   * 设置错误响应
   * @param status 状态码
   * @param message 错误消息
   * @param code 错误代码
   * @returns 模拟HTTP客户端
   */
  replyError(status: number, message: string, code?: string): MockHttpClient;

  /**
   * 设置网络错误
   * @param message 错误消息
   * @returns 模拟HTTP客户端
   */
  networkError(message?: string): MockHttpClient;

  /**
   * 设置超时错误
   * @param message 错误消息
   * @returns 模拟HTTP客户端
   */
  timeout(message?: string): MockHttpClient;
}

/**
 * 模拟HTTP客户端
 */
export interface MockHttpClient {
  /**
   * 设置请求的响应
   * @param url 请求URL或URL正则表达式
   * @param method HTTP方法
   * @param response 响应数据或响应生成函数
   */
  setResponse<T = any>(
    url: string | RegExp,
    method: HttpMethod,
    response:
      | T
      | HttpResponse<T>
      | ((config: HttpRequestConfig) => T | HttpResponse<T>)
  ): void;

  /**
   * 设置请求的错误
   * @param url 请求URL或URL正则表达式
   * @param method HTTP方法
   * @param error 错误数据或错误生成函数
   */
  setError(
    url: string | RegExp,
    method: HttpMethod,
    error: HttpError | ((config: HttpRequestConfig) => HttpError)
  ): void;

  /**
   * 设置请求的延迟
   * @param url 请求URL或URL正则表达式
   * @param method HTTP方法
   * @param delay 延迟时间（毫秒）
   */
  setDelay(url: string | RegExp, method: HttpMethod, delay: number): void;

  /**
   * 发送请求
   * @param config 请求配置
   * @returns Promise<HttpResponse>
   */
  request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * GET请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns Promise<HttpResponse>
   */
  get<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>>;

  /**
   * POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse>
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<HttpResponse<T>>;

  /**
   * PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse>
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<HttpResponse<T>>;

  /**
   * DELETE请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns Promise<HttpResponse>
   */
  delete<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>>;

  /**
   * 获取已发送的请求历史
   * @returns HttpRequestConfig[]
   */
  getRequestHistory(): HttpRequestConfig[];

  /**
   * 清除请求历史
   */
  clearRequestHistory(): void;

  /**
   * 重置所有模拟配置
   */
  reset(): void;

  /**
   * 配置GET请求响应
   * @param url URL字符串或正则表达式
   * @returns 请求匹配器
   */
  onGet(url: string | RegExp): MockHttpRequestMatcher;

  /**
   * 配置POST请求响应
   * @param url URL字符串或正则表达式
   * @returns 请求匹配器
   */
  onPost(url: string | RegExp): MockHttpRequestMatcher;

  /**
   * 配置PUT请求响应
   * @param url URL字符串或正则表达式
   * @returns 请求匹配器
   */
  onPut(url: string | RegExp): MockHttpRequestMatcher;

  /**
   * 配置DELETE请求响应
   * @param url URL字符串或正则表达式
   * @returns 请求匹配器
   */
  onDelete(url: string | RegExp): MockHttpRequestMatcher;

  /**
   * 配置PATCH请求响应
   * @param url URL字符串或正则表达式
   * @returns 请求匹配器
   */
  onPatch(url: string | RegExp): MockHttpRequestMatcher;

  /**
   * 配置任意请求方法的响应
   * @param url URL字符串或正则表达式
   * @returns 请求匹配器
   */
  onAny(url: string | RegExp): MockHttpRequestMatcher;

  /**
   * 请求历史记录
   * 按HTTP方法分类的请求历史
   */
  history: {
    get: HttpRequestConfig[];
    post: HttpRequestConfig[];
    put: HttpRequestConfig[];
    delete: HttpRequestConfig[];
    patch: HttpRequestConfig[];
    head: HttpRequestConfig[];
    options: HttpRequestConfig[];
  };
}

/**
 * 模拟HTTP请求匹配器实现
 */
class MockHttpRequestMatcherImpl implements MockHttpRequestMatcher {
  private client: MockHttpClient;
  private urlPattern: string | RegExp;
  private method: HttpMethod | HttpMethod[];

  /**
   * 创建请求匹配器
   *
   * @param client 模拟HTTP客户端
   * @param urlPattern URL匹配模式
   * @param method 请求方法
   */
  constructor(
    client: MockHttpClient,
    urlPattern: string | RegExp,
    method: HttpMethod | HttpMethod[]
  ) {
    this.client = client;
    this.urlPattern = urlPattern;
    this.method = method;
  }

  /**
   * 设置响应
   *
   * @param status 状态码
   * @param data 响应数据
   * @param headers 响应头
   * @returns 模拟HTTP客户端
   */
  reply<T = any>(
    status: number,
    data: T,
    headers?: Record<string, string>
  ): MockHttpClient {
    if (Array.isArray(this.method)) {
      for (const method of this.method) {
        this.client.setResponse(this.urlPattern, method, config => {
          return createHttpResponse(data, status, config);
        });
      }
    } else {
      this.client.setResponse(this.urlPattern, this.method, config => {
        return createHttpResponse(data, status, config);
      });
    }

    return this.client;
  }

  /**
   * 设置错误响应
   *
   * @param status 状态码
   * @param message 错误消息
   * @param code 错误代码
   * @returns 模拟HTTP客户端
   */
  replyError(status: number, message: string, code?: string): MockHttpClient {
    if (Array.isArray(this.method)) {
      for (const method of this.method) {
        this.client.setError(this.urlPattern, method, {
          message,
          code: code || `HTTP_ERROR_${status}`,
          status,
          response: {
            status,
            statusText: 'Error',
            data: { message },
            headers: {},
            config: { url: this.urlPattern.toString(), method },
          },
        });
      }
    } else {
      this.client.setError(this.urlPattern, this.method, {
        message,
        code: code || `HTTP_ERROR_${status}`,
        status,
        response: {
          status,
          statusText: 'Error',
          data: { message },
          headers: {},
          config: { url: this.urlPattern.toString(), method: this.method },
        },
      });
    }

    return this.client;
  }

  /**
   * 设置网络错误
   *
   * @param message 错误消息
   * @returns 模拟HTTP客户端
   */
  networkError(message: string = 'Network Error'): MockHttpClient {
    if (Array.isArray(this.method)) {
      for (const method of this.method) {
        this.client.setError(this.urlPattern, method, config => {
          const error = createHttpError(message, 0, config);

          error.code = 'NETWORK_ERROR';

          return error;
        });
      }
    } else {
      this.client.setError(this.urlPattern, this.method, config => {
        const error = createHttpError(message, 0, config);

        error.code = 'NETWORK_ERROR';

        return error;
      });
    }

    return this.client;
  }

  /**
   * 设置超时错误
   *
   * @param message 错误消息
   * @returns 模拟HTTP客户端
   */
  timeout(message: string = 'Timeout Error'): MockHttpClient {
    if (Array.isArray(this.method)) {
      for (const method of this.method) {
        this.client.setError(this.urlPattern, method, config => {
          const error = createHttpError(message, 0, config);

          error.code = 'TIMEOUT_ERROR';

          return error;
        });
      }
    } else {
      this.client.setError(this.urlPattern, this.method, config => {
        const error = createHttpError(message, 0, config);

        error.code = 'TIMEOUT_ERROR';

        return error;
      });
    }

    return this.client;
  }
}

/**
 * 创建响应数据
 * @param data 响应数据
 * @param status HTTP状态码
 * @param config 请求配置
 * @returns HttpResponse
 */
export function createHttpResponse<T = any>(
  data: T,
  status = 200,
  config: HttpRequestConfig = { url: faker.internet.url(), method: 'GET' }
): HttpResponse<T> {
  return {
    data,
    status,
    statusText:
      status === 200
        ? 'OK'
        : status === 201
          ? 'Created'
          : status === 204
            ? 'No Content'
            : '',
    headers: {
      'content-type': 'application/json',
      'x-request-id': faker.string.uuid(),
    },
    config,
  };
}

/**
 * 创建HTTP错误
 * @param message 错误消息
 * @param status 状态码
 * @param config 请求配置
 * @returns HttpError
 */
export function createHttpError(
  message = '请求失败',
  status = 500,
  config: HttpRequestConfig = { url: faker.internet.url(), method: 'GET' },
  data: any = { message }
): HttpError {
  return {
    message,
    code: `HTTP_ERROR_${status}`,
    status,
    config,
    response: {
      status,
      statusText: 'Error',
      data,
      headers: {},
      config,
    },
  };
}

/**
 * 创建模拟HTTP客户端
 * @returns MockHttpClient
 */
export function createMockHttpClient(): MockHttpClient {
  const responseMap = new Map<
    string,
    (config: HttpRequestConfig) => Promise<HttpResponse>
  >();
  const errorMap = new Map<
    string,
    (config: HttpRequestConfig) => Promise<never>
  >();
  const delayMap = new Map<string, number>();
  const requestHistory: HttpRequestConfig[] = [];

  // 按HTTP方法分类的请求历史
  const methodHistory: Record<HttpMethod, HttpRequestConfig[]> = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: [],
    PATCH: [],
    HEAD: [],
    OPTIONS: [],
  };

  const getKey = (url: string | RegExp, method: HttpMethod): string => {
    return `${url.toString()}:${method}`;
  };

  const findMatchingKey = (
    url: string,
    method: HttpMethod
  ): string | undefined => {
    console.log(`Finding match for ${method} ${url}`);

    // 精确匹配
    const exactKey = getKey(url, method);

    console.log(`Checking exact key: ${exactKey}`);

    if (responseMap.has(exactKey) || errorMap.has(exactKey)) {
      console.log(`Found exact match: ${exactKey}`);

      return exactKey;
    }

    // 遍历所有键寻找正则表达式匹配
    const allKeys = new Set([...responseMap.keys(), ...errorMap.keys()]);

    console.log(`Checking ${allKeys.size} keys for matches`);

    for (const key of allKeys) {
      const [urlPattern, keyMethod] = key.split(':');

      // 方法必须匹配
      if (keyMethod !== method) {
        continue;
      }

      console.log(`Checking pattern: ${urlPattern} for method: ${keyMethod}`);

      // 尝试作为字符串匹配
      if (urlPattern === url) {
        console.log(`Found string match: ${key}`);

        return key;
      }

      // 尝试作为正则表达式匹配
      try {
        const regexMatch = urlPattern.match(/^\/(.*)\/([gimuy]*)$/);

        if (regexMatch) {
          const [, pattern, flags] = regexMatch;
          const regex = new RegExp(pattern, flags);

          if (regex.test(url)) {
            console.log(`Found regex match: ${key}`);

            return key;
          }
        } else {
          // 尝试简单字符串匹配 - 支持通配符等简单匹配
          if (urlPattern.includes('*')) {
            const escapedPattern = urlPattern
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
              .replace(/\\\*/g, '.*'); // 将 \* 替换为 .*
            const wildcardRegex = new RegExp(`^${escapedPattern}$`);

            if (wildcardRegex.test(url)) {
              console.log(`Found wildcard match: ${key}`);

              return key;
            }
          }
        }
      } catch (error) {
        console.error(`Error matching regex for ${urlPattern}:`, error);
      }
    }

    console.log(`No match found for ${method} ${url}`);

    return undefined;
  };

  const mockClient: MockHttpClient = {
    setResponse<T>(
      url: string | RegExp,
      method: HttpMethod,
      response:
        | T
        | HttpResponse<T>
        | ((config: HttpRequestConfig) => T | HttpResponse<T>)
    ): void {
      const key = getKey(url, method);

      responseMap.set(key, async (config: HttpRequestConfig) => {
        let result: T | HttpResponse<T>;

        if (typeof response === 'function') {
          result = (
            response as (config: HttpRequestConfig) => T | HttpResponse<T>
          )(config);
        } else {
          result = response;
        }

        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'status' in result
        ) {
          return result as HttpResponse<T>;
        } else {
          return createHttpResponse(result as T, 200, config);
        }
      });

      // 如果有错误，清除它
      errorMap.delete(key);
    },

    setError(
      url: string | RegExp,
      method: HttpMethod,
      error: HttpError | ((config: HttpRequestConfig) => HttpError)
    ): void {
      const key = getKey(url, method);

      errorMap.set(key, async (config: HttpRequestConfig) => {
        const result = typeof error === 'function' ? error(config) : error;

        // 确保错误对象具有response属性
        if (!result.response) {
          result.response = {
            status: result.status || 500,
            data: result.data || { error: result.message || '未知错误' },
            statusText: result.statusText || 'Error',
            headers: result.headers || {},
            config: config,
          };
        }

        return Promise.reject(result);
      });

      // 如果有响应，清除它
      responseMap.delete(key);
    },

    setDelay(url: string | RegExp, method: HttpMethod, delay: number): void {
      const key = getKey(url, method);

      delayMap.set(key, delay);
    },

    async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
      requestHistory.push(config);

      // 添加到对应方法的历史记录中
      if (config.method) {
        methodHistory[config.method].push(config);
      }

      const { url, method } = config;
      const key = findMatchingKey(url, method);

      const delay = key ? delayMap.get(key) || 0 : 0;

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      if (key) {
        const errorHandler = errorMap.get(key);

        if (errorHandler) {
          return errorHandler(config) as Promise<never>;
        }

        const responseHandler = responseMap.get(key);

        if (responseHandler) {
          return responseHandler(config) as Promise<HttpResponse<T>>;
        }
      }

      // 默认返回404错误
      throw createHttpError('未找到请求处理程序', 404, config);
    },

    async get<T>(
      url: string,
      config?: Omit<HttpRequestConfig, 'url' | 'method'>
    ): Promise<HttpResponse<T>> {
      return this.request<T>({
        url,
        method: 'GET',
        ...config,
      });
    },

    async post<T>(
      url: string,
      data?: any,
      config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<HttpResponse<T>> {
      return this.request<T>({
        url,
        method: 'POST',
        data,
        ...config,
      });
    },

    async put<T>(
      url: string,
      data?: any,
      config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
    ): Promise<HttpResponse<T>> {
      return this.request<T>({
        url,
        method: 'PUT',
        data,
        ...config,
      });
    },

    async delete<T>(
      url: string,
      config?: Omit<HttpRequestConfig, 'url' | 'method'>
    ): Promise<HttpResponse<T>> {
      return this.request<T>({
        url,
        method: 'DELETE',
        ...config,
      });
    },

    getRequestHistory(): HttpRequestConfig[] {
      return [...requestHistory];
    },

    clearRequestHistory(): void {
      requestHistory.length = 0;
    },

    reset(): void {
      responseMap.clear();
      errorMap.clear();
      delayMap.clear();
      this.clearRequestHistory();

      // 清除方法历史记录
      Object.values(methodHistory).forEach(history => (history.length = 0));
    },

    onGet(url: string | RegExp): MockHttpRequestMatcher {
      return new MockHttpRequestMatcherImpl(this, url, 'GET');
    },

    onPost(url: string | RegExp): MockHttpRequestMatcher {
      return new MockHttpRequestMatcherImpl(this, url, 'POST');
    },

    onPut(url: string | RegExp): MockHttpRequestMatcher {
      return new MockHttpRequestMatcherImpl(this, url, 'PUT');
    },

    onDelete(url: string | RegExp): MockHttpRequestMatcher {
      return new MockHttpRequestMatcherImpl(this, url, 'DELETE');
    },

    onPatch(url: string | RegExp): MockHttpRequestMatcher {
      return new MockHttpRequestMatcherImpl(this, url, 'PATCH');
    },

    onAny(url: string | RegExp): MockHttpRequestMatcher {
      return new MockHttpRequestMatcherImpl(this, url, [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'HEAD',
        'OPTIONS',
      ]);
    },

    // 添加历史记录属性
    get history() {
      return {
        get: methodHistory.GET,
        post: methodHistory.POST,
        put: methodHistory.PUT,
        delete: methodHistory.DELETE,
        patch: methodHistory.PATCH,
        head: methodHistory.HEAD,
        options: methodHistory.OPTIONS,
      };
    },
  };

  return mockClient;
}
