/**
 * API密钥管理器
 *
 * 负责安全地从环境变量获取API密钥、验证密钥格式、处理密钥轮换等
 */

import * as fs from 'fs/promises';

import { ApiKeyError, ApiKeyErrorCode } from './ApiKeyError';

/**
 * API密钥来源配置
 */
export interface ApiKeySourceConfig {
  /**
   * 按优先级排序的环境变量名列表
   */
  envVariables?: string[];

  /**
   * 配置文件路径
   */
  configFile?: string;

  /**
   * 配置文件中的键名
   */
  configKey?: string;

  /**
   * 默认值
   */
  defaultValue?: string;
}

/**
 * API提供商类型
 */
export type ApiProvider =
  | 'openai'
  | 'anthropic'
  | 'azure'
  | 'mistral'
  | 'custom';

/**
 * API密钥管理器类
 */
export class ApiKeyManager {
  /**
   * API提供商类型
   */
  private readonly provider: ApiProvider;

  /**
   * 密钥缓存，用于减少环境变量访问
   */
  private readonly keyCache: Map<string, string> = new Map();

  /**
   * 构造函数
   * @param provider API提供商类型
   */
  constructor(provider: ApiProvider) {
    this.provider = provider;
  }

  /**
   * 获取API密钥
   *
   * @param envName 环境变量名
   * @param validate 是否验证密钥格式
   * @returns API密钥
   * @throws ApiKeyError 如果环境变量不存在或密钥格式无效
   */
  async getApiKey(envName: string, validate: boolean = false): Promise<string> {
    // 检查缓存
    if (this.keyCache.has(envName)) {
      const cachedKey = this.keyCache.get(envName)!;

      // 如果需要验证，确保缓存的密钥是有效的
      if (validate && !(await this.validateApiKey(cachedKey))) {
        throw new ApiKeyError(
          ApiKeyErrorCode.INVALID_KEY_FORMAT,
          `环境变量${envName}中的密钥格式无效`
        );
      }

      return cachedKey;
    }

    // 从环境变量获取密钥
    const apiKey = process.env[envName];

    // 检查环境变量是否存在
    if (!apiKey) {
      throw new ApiKeyError(
        ApiKeyErrorCode.MISSING_ENV_VARIABLE,
        `环境变量${envName}不存在或未设置`
      );
    }

    // 验证密钥格式（如果需要）
    if (validate && !(await this.validateApiKey(apiKey))) {
      throw new ApiKeyError(
        ApiKeyErrorCode.INVALID_KEY_FORMAT,
        `环境变量${envName}中的密钥格式无效`
      );
    }

    // 缓存密钥
    this.keyCache.set(envName, apiKey);

    return apiKey;
  }

  /**
   * 刷新API密钥缓存
   *
   * @param envName 环境变量名
   * @param validate 是否验证密钥格式
   * @returns 刷新后的API密钥
   */
  async refreshApiKey(
    envName: string,
    validate: boolean = false
  ): Promise<string> {
    // 清除缓存
    this.keyCache.delete(envName);

    // 重新获取密钥
    return this.getApiKey(envName, validate);
  }

  /**
   * 使用备用密钥机制获取API密钥
   *
   * @param envNames 按优先级排序的环境变量名列表
   * @param validate 是否验证密钥格式
   * @returns API密钥
   * @throws ApiKeyError 如果所有环境变量都不存在或所有密钥格式都无效
   */
  async getApiKeyWithFallback(
    envNames: string[],
    validate: boolean = false
  ): Promise<string> {
    const errors: Error[] = [];

    // 尝试每个环境变量
    for (const envName of envNames) {
      try {
        return await this.getApiKey(envName, validate);
      } catch (error) {
        errors.push(error as Error);
      }
    }

    // 所有尝试都失败
    throw new ApiKeyError(
      ApiKeyErrorCode.NO_VALID_KEY_FOUND,
      `无法从以下环境变量获取有效的API密钥: ${envNames.join(', ')}`
    );
  }

  /**
   * 从多个来源获取API密钥
   *
   * @param config 源配置
   * @param validate 是否验证密钥格式
   * @returns API密钥
   * @throws ApiKeyError 如果无法从任何来源获取有效的密钥
   */
  async getApiKeyFromSources(
    config: ApiKeySourceConfig,
    validate: boolean = false
  ): Promise<string> {
    // 尝试从环境变量获取
    if (config.envVariables && config.envVariables.length > 0) {
      try {
        return await this.getApiKeyWithFallback(config.envVariables, validate);
      } catch (error) {
        // 继续尝试其他来源
      }
    }

    // 尝试从配置文件获取
    if (config.configFile) {
      try {
        const configKey = config.configKey || 'apiKey';
        const fileContent = await fs.readFile(config.configFile, 'utf-8');
        const configData = JSON.parse(fileContent);

        if (configData[configKey]) {
          const apiKey = configData[configKey];

          // 验证密钥格式（如果需要）
          if (validate && !(await this.validateApiKey(apiKey))) {
            throw new ApiKeyError(
              ApiKeyErrorCode.INVALID_KEY_FORMAT,
              `配置文件中的密钥格式无效`
            );
          }

          return apiKey;
        }
      } catch (error) {
        // 忽略文件读取或解析错误，继续尝试其他来源
      }
    }

    // 使用默认值
    if (config.defaultValue) {
      // 验证默认密钥格式（如果需要）
      if (validate && !(await this.validateApiKey(config.defaultValue))) {
        throw new ApiKeyError(
          ApiKeyErrorCode.INVALID_KEY_FORMAT,
          `默认密钥格式无效`
        );
      }

      return config.defaultValue;
    }

    // 所有来源都失败
    throw new ApiKeyError(
      ApiKeyErrorCode.NO_VALID_KEY_FOUND,
      '无法从任何来源获取有效的API密钥'
    );
  }

  /**
   * 验证API密钥格式
   *
   * @param apiKey API密钥
   * @returns 是否是有效的API密钥格式
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    // 不同API提供商的密钥格式验证规则
    switch (this.provider) {
      case 'openai':
        // OpenAI密钥格式: sk-开头，允许测试用例中的格式
        return /^sk-[a-zA-Z0-9]+$/.test(apiKey);

      case 'anthropic':
        // Anthropic密钥格式: sk-ant-开头
        return /^sk-ant-[a-zA-Z0-9]+$/.test(apiKey);

      case 'azure':
        // Azure密钥格式较为通用
        return /^[a-zA-Z0-9]{32,}$/.test(apiKey);

      case 'mistral':
        // Mistral密钥格式
        return /^[a-zA-Z0-9]{16,}$/.test(apiKey);

      case 'custom':
      default:
        // 自定义提供商使用宽松的验证规则
        return apiKey.length > 0;
    }
  }
}
