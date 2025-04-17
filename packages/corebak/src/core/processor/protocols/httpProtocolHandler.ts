/**
 * HttpProtocolHandler
 *
 * 处理HTTP/HTTPS协议的引用
 */

import type { Reference } from 'packages/corebak/src/types/node';
import type { ProtocolHandler } from 'packages/corebak/src/types/processor';

/**
 * HTTP协议处理器选项
 */
export interface HttpProtocolHandlerOptions {
  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 是否允许不安全的HTTPS连接
   */
  allowInsecure?: boolean;
}

/**
 * HTTP协议处理器
 * 处理HTTP和HTTPS协议的引用
 */
export class HttpProtocolHandler implements ProtocolHandler {
  /**
   * 请求超时时间（毫秒）
   */
  private timeout: number;

  /**
   * 是否允许不安全的HTTPS连接
   */
  private allowInsecure: boolean;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options?: HttpProtocolHandlerOptions) {
    this.timeout = options?.timeout ?? 30000; // 默认30秒
    this.allowInsecure = options?.allowInsecure ?? false;
  }

  /**
   * 检查是否可以处理指定协议
   * @param protocol 协议名称
   * @returns 是否可以处理
   */
  canHandle(protocol: string): boolean {
    return protocol === 'http' || protocol === 'https';
  }

  /**
   * 处理引用
   * @param reference 引用节点
   * @returns 解析后的结果
   */
  async handle(reference: Reference): Promise<any> {
    // 构建完整URL
    const url = `${reference.protocol}://${reference.path}`;

    try {
      // 使用fetch API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        rejectUnauthorized: !this.allowInsecure,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
      }

      // 根据Content-Type处理响应
      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`请求超时: ${url}`);
        }
      }

      throw error;
    }
  }
}
