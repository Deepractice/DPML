/**
 * HTTP客户端接口类型定义
 *
 * 提供统一的HTTP请求抽象，支持不同环境。
 */

/**
 * HTTP请求方法
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
 * HTTP响应
 */
export interface HttpResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** 状态码 */
  status: number;
  /** 状态文本 */
  statusText: string;
  /** 响应头 */
  headers: Record<string, string>;
  /** 请求配置 */
  config: HttpRequestConfig;
}

/**
 * HTTP请求配置
 */
export interface HttpRequestConfig {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method?: HttpMethod;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求参数（URL参数） */
  params?: Record<string, string | number | boolean | null | undefined>;
  /** 请求数据（Body） */
  data?: any;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否启用凭证（跨域请求） */
  withCredentials?: boolean;
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';
  /** 取消令牌 */
  cancelToken?: CancelToken;
  /** 是否验证SSL */
  validateStatus?: boolean | ((status: number) => boolean);
  /** 最大内容长度 */
  maxContentLength?: number;
  /** 最大重定向次数 */
  maxRedirects?: number;
  /** 代理配置 */
  proxy?: {
    /** 代理主机 */
    host: string;
    /** 代理端口 */
    port: number;
    /** 代理协议 */
    protocol?: string;
    /** 代理认证 */
    auth?: {
      /** 用户名 */
      username: string;
      /** 密码 */
      password: string;
    };
  };
  /** 自定义选项 */
  [key: string]: any;
}

/**
 * HTTP客户端实例配置
 */
export interface HttpClientConfig
  extends Omit<HttpRequestConfig, 'url' | 'method' | 'data'> {
  /** 基础URL */
  baseURL?: string;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /** 请求拦截器 */
  requestInterceptors?: HttpInterceptor[];
  /** 响应拦截器 */
  responseInterceptors?: HttpInterceptor[];
  /** 自动重试配置 */
  retry?: {
    /** 最大重试次数 */
    maxRetries: number;
    /** 重试延迟（毫秒） */
    retryDelay: number;
    /** 重试条件 */
    retryCondition?: (error: any) => boolean;
  };
}

/**
 * HTTP拦截器
 */
export interface HttpInterceptor {
  /**
   * 拦截请求配置
   * @param config 请求配置
   * @returns 修改后的配置或Promise
   */
  onRequest?: (
    config: HttpRequestConfig
  ) => HttpRequestConfig | Promise<HttpRequestConfig>;

  /**
   * 拦截响应
   * @param response 响应对象
   * @returns 修改后的响应或Promise
   */
  onResponse?: <T>(
    response: HttpResponse<T>
  ) => HttpResponse<T> | Promise<HttpResponse<T>>;

  /**
   * 拦截错误
   * @param error 错误对象
   * @returns 错误对象或Promise
   */
  onError?: (error: any) => any | Promise<any>;
}

/**
 * 取消令牌
 */
export interface CancelToken {
  /**
   * 是否已取消
   */
  readonly isCancelled: boolean;

  /**
   * 注册取消回调
   * @param callback 取消时执行的回调
   */
  onCancel(callback: () => void): void;
}

/**
 * 取消令牌源
 */
export interface CancelTokenSource {
  /** 取消令牌 */
  token: CancelToken;
  /** 取消函数 */
  cancel: (reason?: string) => void;
}

/**
 * HTTP客户端接口
 */
export interface HttpClient {
  /**
   * 发送HTTP请求
   * @param config 请求配置
   */
  request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * 发送GET请求
   * @param url 请求URL
   * @param config 请求配置
   */
  get<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>>;

  /**
   * 发送POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<HttpResponse<T>>;

  /**
   * 发送PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<HttpResponse<T>>;

  /**
   * 发送DELETE请求
   * @param url 请求URL
   * @param config 请求配置
   */
  delete<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>>;

  /**
   * 发送PATCH请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<HttpResponse<T>>;

  /**
   * 发送HEAD请求
   * @param url 请求URL
   * @param config 请求配置
   */
  head<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>>;

  /**
   * 发送OPTIONS请求
   * @param url 请求URL
   * @param config 请求配置
   */
  options<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<HttpResponse<T>>;

  /**
   * 创建取消令牌
   */
  createCancelToken(): CancelTokenSource;

  /**
   * 判断是否为取消错误
   * @param error 错误对象
   */
  isCancel(error: any): boolean;

  /**
   * 添加请求拦截器
   * @param interceptor 拦截器对象
   * @returns 拦截器ID
   */
  addRequestInterceptor(
    interceptor: Pick<HttpInterceptor, 'onRequest'>
  ): number;

  /**
   * 添加响应拦截器
   * @param interceptor 拦截器对象
   * @returns 拦截器ID
   */
  addResponseInterceptor(
    interceptor: Pick<HttpInterceptor, 'onResponse' | 'onError'>
  ): number;

  /**
   * 移除拦截器
   * @param id 拦截器ID
   * @param type 拦截器类型
   */
  removeInterceptor(id: number, type: 'request' | 'response'): void;

  /**
   * 配置客户端实例
   * @param config 客户端配置
   */
  configure(config: Partial<HttpClientConfig>): void;
}

/**
 * HTTP客户端工厂
 */
export interface HttpClientFactory {
  /**
   * 创建HTTP客户端实例
   * @param config 客户端配置
   */
  create(config?: HttpClientConfig): HttpClient;
}

/**
 * HTTP传输层适配器
 *
 * 底层HTTP实现适配器（如基于fetch、XMLHttpRequest、node-fetch等）
 */
export interface HttpTransport {
  /**
   * 发送请求
   * @param config 请求配置
   */
  request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;

  /**
   * 取消请求
   * @param token 取消令牌
   * @param reason 取消原因
   */
  cancel(token: CancelToken, reason?: string): void;
}

/**
 * HTTP请求池
 *
 * 管理并发请求
 */
export interface HttpRequestPool {
  /**
   * 添加请求到池
   * @param request 请求函数
   * @param priority 优先级
   */
  add<T>(request: () => Promise<T>, priority?: number): Promise<T>;

  /**
   * 取消所有请求
   * @param reason 取消原因
   */
  cancelAll(reason?: string): void;

  /**
   * 获取活跃请求数量
   */
  getActiveCount(): number;

  /**
   * 获取等待请求数量
   */
  getPendingCount(): number;

  /**
   * 设置最大并发数
   * @param limit 并发限制
   */
  setLimit(limit: number): void;
}
