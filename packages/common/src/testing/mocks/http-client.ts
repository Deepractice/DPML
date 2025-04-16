import { EventEmitter } from 'events';

/**
 * HTTP请求方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP请求配置
 */
export interface HttpRequestConfig {
  /**
   * 请求URL
   */
  url: string;
  
  /**
   * 请求方法
   */
  method: HttpMethod;
  
  /**
   * 请求头
   */
  headers?: Record<string, string>;
  
  /**
   * 请求参数
   */
  params?: Record<string, string>;
  
  /**
   * 请求体
   */
  body?: any;
  
  /**
   * 超时时间（毫秒）
   */
  timeout?: number;
}

/**
 * HTTP响应接口
 */
export interface HttpResponse<T = any> {
  /**
   * 响应数据
   */
  data: T;
  
  /**
   * 状态码
   */
  status: number;
  
  /**
   * 状态文本
   */
  statusText: string;
  
  /**
   * 响应头
   */
  headers: Record<string, string>;
  
  /**
   * 请求配置
   */
  config: HttpRequestConfig;
}

/**
 * HTTP错误接口
 */
export interface HttpError {
  /**
   * 错误消息
   */
  message: string;
  
  /**
   * 错误代码
   */
  code?: string;
  
  /**
   * 响应（如果有）
   */
  response?: HttpResponse;
  
  /**
   * 请求配置
   */
  config: HttpRequestConfig;
  
  /**
   * 是否为超时错误
   */
  isTimeout?: boolean;
  
  /**
   * 是否为网络错误
   */
  isNetworkError?: boolean;
}

/**
 * 模拟HTTP处理器
 */
export type MockHttpHandler = (
  config: HttpRequestConfig
) => Promise<HttpResponse> | HttpResponse | Promise<never> | never;

/**
 * 模拟HTTP路由配置
 */
export interface MockHttpRoute {
  /**
   * 匹配URL的正则表达式
   */
  urlPattern: RegExp;
  
  /**
   * 匹配的请求方法
   */
  method: HttpMethod | HttpMethod[];
  
  /**
   * 响应处理器
   */
  handler: MockHttpHandler;
}

/**
 * 模拟HTTP请求记录
 */
export interface MockHttpRequestRecord {
  /**
   * 请求时间
   */
  timestamp: Date;
  
  /**
   * 请求配置
   */
  config: HttpRequestConfig;
  
  /**
   * 响应（如果成功）
   */
  response?: HttpResponse;
  
  /**
   * 错误（如果失败）
   */
  error?: HttpError;
}

/**
 * 模拟HTTP客户端配置
 */
export interface MockHttpClientConfig {
  /**
   * 基础URL
   */
  baseUrl?: string;
  
  /**
   * 默认请求头
   */
  defaultHeaders?: Record<string, string>;
  
  /**
   * 默认超时时间（毫秒）
   */
  timeout?: number;
  
  /**
   * 是否启用请求延迟
   */
  enableDelay?: boolean;
  
  /**
   * 最小延迟时间（毫秒）
   */
  minDelay?: number;
  
  /**
   * 最大延迟时间（毫秒）
   */
  maxDelay?: number;
}

/**
 * 模拟HTTP客户端实现
 */
export class MockHttpClient extends EventEmitter {
  private routes: MockHttpRoute[] = [];
  private requests: MockHttpRequestRecord[] = [];
  private config: Required<MockHttpClientConfig>;
  
  /**
   * 创建模拟HTTP客户端
   * 
   * @param config 配置选项
   */
  constructor(config: MockHttpClientConfig = {}) {
    super();
    
    this.config = {
      baseUrl: config.baseUrl || '',
      defaultHeaders: config.defaultHeaders || {},
      timeout: config.timeout || 30000,
      enableDelay: config.enableDelay !== undefined ? config.enableDelay : true,
      minDelay: config.minDelay || 10,
      maxDelay: config.maxDelay || 100
    };
  }
  
  /**
   * 添加请求路由
   * 
   * @param route 路由配置
   * @returns 当前实例，支持链式调用
   */
  addRoute(route: MockHttpRoute): this {
    this.routes.push(route);
    return this;
  }
  
  /**
   * 添加多个请求路由
   * 
   * @param routes 路由配置数组
   * @returns 当前实例，支持链式调用
   */
  addRoutes(routes: MockHttpRoute[]): this {
    this.routes.push(...routes);
    return this;
  }
  
  /**
   * 清除所有路由
   * 
   * @returns 当前实例，支持链式调用
   */
  clearRoutes(): this {
    this.routes = [];
    return this;
  }
  
  /**
   * 配置响应
   * 
   * @param urlPattern URL匹配模式
   * @param method 请求方法
   * @param handler 响应处理器
   * @returns 当前实例，支持链式调用
   */
  onRequest(
    urlPattern: RegExp,
    method: HttpMethod | HttpMethod[],
    handler: MockHttpHandler
  ): this {
    return this.addRoute({ urlPattern, method, handler });
  }
  
  /**
   * 配置GET请求响应
   * 
   * @param urlPattern URL匹配模式
   * @param handler 响应处理器
   * @returns 当前实例，支持链式调用
   */
  onGet(urlPattern: RegExp, handler: MockHttpHandler): this {
    return this.onRequest(urlPattern, 'GET', handler);
  }
  
  /**
   * 配置POST请求响应
   * 
   * @param urlPattern URL匹配模式
   * @param handler 响应处理器
   * @returns 当前实例，支持链式调用
   */
  onPost(urlPattern: RegExp, handler: MockHttpHandler): this {
    return this.onRequest(urlPattern, 'POST', handler);
  }
  
  /**
   * 配置PUT请求响应
   * 
   * @param urlPattern URL匹配模式
   * @param handler 响应处理器
   * @returns 当前实例，支持链式调用
   */
  onPut(urlPattern: RegExp, handler: MockHttpHandler): this {
    return this.onRequest(urlPattern, 'PUT', handler);
  }
  
  /**
   * 配置DELETE请求响应
   * 
   * @param urlPattern URL匹配模式
   * @param handler 响应处理器
   * @returns 当前实例，支持链式调用
   */
  onDelete(urlPattern: RegExp, handler: MockHttpHandler): this {
    return this.onRequest(urlPattern, 'DELETE', handler);
  }
  
  /**
   * 配置PATCH请求响应
   * 
   * @param urlPattern URL匹配模式
   * @param handler 响应处理器
   * @returns 当前实例，支持链式调用
   */
  onPatch(urlPattern: RegExp, handler: MockHttpHandler): this {
    return this.onRequest(urlPattern, 'PATCH', handler);
  }
  
  /**
   * 创建响应
   * 
   * @param data 响应数据
   * @param status 状态码
   * @param config 请求配置
   * @param statusText 状态文本
   * @param headers 响应头
   * @returns HTTP响应对象
   */
  createResponse<T = any>(
    data: T,
    status: number = 200,
    config: HttpRequestConfig,
    statusText: string = 'OK',
    headers: Record<string, string> = {}
  ): HttpResponse<T> {
    return {
      data,
      status,
      statusText,
      headers,
      config
    };
  }
  
  /**
   * 创建错误
   * 
   * @param message 错误消息
   * @param config 请求配置
   * @param code 错误代码
   * @param response 错误响应
   * @returns HTTP错误对象
   */
  createError(
    message: string,
    config: HttpRequestConfig,
    code?: string,
    response?: HttpResponse
  ): HttpError {
    return {
      message,
      code,
      config,
      response
    };
  }
  
  /**
   * 发送请求
   * 
   * @param config 请求配置
   * @returns Promise，解析为响应
   */
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const finalConfig: HttpRequestConfig = {
      ...config,
      headers: {
        ...this.config.defaultHeaders,
        ...config.headers
      },
      timeout: config.timeout || this.config.timeout,
      url: this.resolveUrl(config.url)
    };
    
    const requestRecord: MockHttpRequestRecord = {
      timestamp: new Date(),
      config: finalConfig
    };
    
    this.requests.push(requestRecord);
    this.emit('request', finalConfig);
    
    try {
      // 添加模拟延迟
      if (this.config.enableDelay) {
        const delayTime = this.getRandomDelay();
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
      
      // 查找匹配的路由
      const matchedRoute = this.findMatchingRoute(finalConfig);
      
      if (!matchedRoute) {
        throw this.createError(
          `No mock defined for ${finalConfig.method} ${finalConfig.url}`,
          finalConfig,
          'ROUTE_NOT_FOUND'
        );
      }
      
      // 执行路由处理器
      const response = await matchedRoute.handler(finalConfig);
      
      // 更新请求记录
      requestRecord.response = response;
      this.emit('response', response);
      
      return response as HttpResponse<T>;
    } catch (error) {
      // 处理错误
      let httpError: HttpError;
      
      if ((error as HttpError).config) {
        httpError = error as HttpError;
      } else {
        httpError = this.createError(
          (error as Error).message || String(error),
          finalConfig,
          'UNKNOWN_ERROR'
        );
      }
      
      // 更新请求记录
      requestRecord.error = httpError;
      this.emit('error', httpError);
      
      throw httpError;
    }
  }
  
  /**
   * 发送GET请求
   * 
   * @param url 请求URL
   * @param params 请求参数
   * @param config 额外配置
   * @returns Promise，解析为响应
   */
  async get<T = any>(
    url: string,
    params?: Record<string, string>,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'params'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'GET',
      params
    });
  }
  
  /**
   * 发送POST请求
   * 
   * @param url 请求URL
   * @param body 请求体
   * @param config 额外配置
   * @returns Promise，解析为响应
   */
  async post<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      body
    });
  }
  
  /**
   * 发送PUT请求
   * 
   * @param url 请求URL
   * @param body 请求体
   * @param config 额外配置
   * @returns Promise，解析为响应
   */
  async put<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      body
    });
  }
  
  /**
   * 发送DELETE请求
   * 
   * @param url 请求URL
   * @param config 额外配置
   * @returns Promise，解析为响应
   */
  async delete<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE'
    });
  }
  
  /**
   * 发送PATCH请求
   * 
   * @param url 请求URL
   * @param body 请求体
   * @param config 额外配置
   * @returns Promise，解析为响应
   */
  async patch<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      body
    });
  }
  
  /**
   * 获取请求历史
   * 
   * @returns 请求记录数组
   */
  getRequestHistory(): MockHttpRequestRecord[] {
    return [...this.requests];
  }
  
  /**
   * 清除请求历史
   * 
   * @returns 当前实例，支持链式调用
   */
  clearRequestHistory(): this {
    this.requests = [];
    return this;
  }
  
  /**
   * 重置客户端状态
   * 
   * @returns 当前实例，支持链式调用
   */
  reset(): this {
    this.clearRoutes();
    this.clearRequestHistory();
    return this;
  }
  
  /**
   * 验证请求是否已发送
   * 
   * @param urlPattern URL匹配模式
   * @param method 请求方法
   * @returns 是否匹配
   */
  hasRequest(urlPattern: RegExp, method?: HttpMethod): boolean {
    return this.requests.some(record => {
      const urlMatches = urlPattern.test(record.config.url);
      const methodMatches = !method || record.config.method === method;
      return urlMatches && methodMatches;
    });
  }
  
  /**
   * 获取指定URL和方法的请求次数
   * 
   * @param urlPattern URL匹配模式
   * @param method 请求方法
   * @returns 请求次数
   */
  getRequestCount(urlPattern: RegExp, method?: HttpMethod): number {
    return this.requests.filter(record => {
      const urlMatches = urlPattern.test(record.config.url);
      const methodMatches = !method || record.config.method === method;
      return urlMatches && methodMatches;
    }).length;
  }
  
  /**
   * 获取指定URL和方法的最后一个请求
   * 
   * @param urlPattern URL匹配模式
   * @param method 请求方法
   * @returns 请求记录或undefined
   */
  getLastRequest(urlPattern: RegExp, method?: HttpMethod): MockHttpRequestRecord | undefined {
    const matchingRequests = this.requests.filter(record => {
      const urlMatches = urlPattern.test(record.config.url);
      const methodMatches = !method || record.config.method === method;
      return urlMatches && methodMatches;
    });
    
    return matchingRequests[matchingRequests.length - 1];
  }
  
  /**
   * 查找匹配的路由
   * 
   * @param config 请求配置
   * @returns 匹配的路由或undefined
   */
  private findMatchingRoute(config: HttpRequestConfig): MockHttpRoute | undefined {
    return this.routes.find(route => {
      // 检查URL是否匹配
      const urlMatches = route.urlPattern.test(config.url);
      
      // 检查方法是否匹配
      const methodMatches = Array.isArray(route.method)
        ? route.method.includes(config.method)
        : route.method === config.method;
      
      return urlMatches && methodMatches;
    });
  }
  
  /**
   * 解析URL（添加baseUrl前缀）
   * 
   * @param url 原始URL
   * @returns 解析后的URL
   */
  private resolveUrl(url: string): string {
    // 如果是绝对URL，直接返回
    if (/^https?:\/\//.test(url)) {
      return url;
    }
    
    // 拼接baseUrl和相对路径
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
      
    const relativeUrl = url.startsWith('/')
      ? url
      : `/${url}`;
    
    return `${baseUrl}${relativeUrl}`;
  }
  
  /**
   * 获取随机延迟时间
   * 
   * @returns 延迟时间（毫秒）
   */
  private getRandomDelay(): number {
    const { minDelay, maxDelay } = this.config;
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }
} 