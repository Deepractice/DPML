import type { Observable } from 'rxjs';

import type { ChatOutput } from '../../types';

import type { LLMRequest } from './LLMRequest';

/**
 * LLM客户端接口
 */
export interface LLMClient {
  /**
   * 发送请求并获取响应
   * @param request LLM请求信息
   * @returns 响应内容的Observable流
   */
  sendRequest(request: LLMRequest): Observable<ChatOutput>;
}
