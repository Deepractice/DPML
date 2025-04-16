import { LLMErrorType, LLMConnectorError } from './LLMConnector';
import { AnthropicConnector } from './providers/AnthropicConnector';
import { OpenAIConnector } from './providers/OpenAIConnector';

import type { LLMConnector } from './LLMConnector';

/**
 * LLM配置接口
 */
export interface LLMConfig {
  /**
   * API类型，如'openai'、'anthropic'等
   */
  apiType: string;

  /**
   * API URL端点
   */
  apiUrl: string;

  /**
   * 存储API密钥的环境变量名
   */
  keyEnv?: string;

  /**
   * 其他配置项
   */
  [key: string]: any;
}

/**
 * LLM连接器工厂
 * 负责根据配置创建适当的LLM连接器实例
 */
export class LLMConnectorFactory {
  /**
   * 缓存的连接器实例
   * 用于避免重复创建相同配置的连接器
   */
  private static connectorCache: Map<string, LLMConnector> = new Map();

  /**
   * 创建LLM连接器
   * @param config LLM配置
   * @returns LLM连接器实例
   */
  static createConnector(config: LLMConfig): LLMConnector {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(config);

    // 检查缓存
    if (this.connectorCache.has(cacheKey)) {
      return this.connectorCache.get(cacheKey)!;
    }

    // 先验证API类型
    switch (config.apiType.toLowerCase()) {
      case 'openai':
      case 'anthropic':
        // 支持的类型，继续处理
        break;
      default:
        throw new LLMConnectorError(
          `不支持的API类型: ${config.apiType}`,
          LLMErrorType.BAD_REQUEST
        );
    }

    // 解析API密钥
    const apiKey = this.resolveApiKey(config);

    // 根据API类型创建适当的连接器
    let connector: LLMConnector;

    // 创建相应的连接器
    if (config.apiType.toLowerCase() === 'openai') {
      connector = new OpenAIConnector(apiKey, config.apiUrl);
    } else {
      // 此时只可能是anthropic
      connector = new AnthropicConnector(
        apiKey,
        config.apiUrl,
        config.apiVersion || '2023-06-01'
      );
    }

    // 缓存连接器实例
    this.connectorCache.set(cacheKey, connector);

    return connector;
  }

  /**
   * 清除连接器缓存
   * 用于在API密钥更新时强制重新创建连接器
   * @param apiType 可选的API类型，如果提供则只清除该类型的缓存
   */
  static clearCache(apiType?: string): void {
    if (apiType) {
      // 筛选并清除特定类型的连接器
      const keysToDelete: string[] = [];

      this.connectorCache.forEach((connector, key) => {
        if (connector.getType() === apiType.toLowerCase()) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.connectorCache.delete(key));
    } else {
      // 清除所有缓存
      this.connectorCache.clear();
    }
  }

  /**
   * 生成缓存键
   * @param config LLM配置
   * @returns 缓存键字符串
   */
  private static generateCacheKey(config: LLMConfig): string {
    // 使用API类型、URL和密钥环境变量名作为缓存键
    return `${config.apiType}:${config.apiUrl}:${config.keyEnv || 'none'}`;
  }

  /**
   * 解析API密钥
   * @param config LLM配置
   * @returns API密钥
   */
  private static resolveApiKey(config: LLMConfig): string {
    if (!config.keyEnv) {
      // 如果没有指定环境变量，可能是无需认证的本地模型
      return '';
    }

    // 从环境变量获取密钥
    const apiKey = process.env[config.keyEnv];

    if (!apiKey) {
      throw new LLMConnectorError(
        `环境变量 ${config.keyEnv} 未设置或为空`,
        LLMErrorType.AUTHENTICATION
      );
    }

    return apiKey;
  }
}
