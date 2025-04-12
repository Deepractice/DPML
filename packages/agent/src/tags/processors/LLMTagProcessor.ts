/**
 * LLMTagProcessor
 * 
 * 处理<llm>标签，提取LLM配置和API设置
 * 实现API密钥环境变量安全处理机制
 * 支持模型验证和API类型验证
 */

import { Element, ProcessingContext, ValidationError, ValidationWarning, AbstractTagProcessor } from '@dpml/core';
import { LLMTagAttributes } from '../../types';
import { ApiKeyManager, ApiKeyError, ApiKeyErrorCode } from '../../apiKey';

/**
 * 支持的API类型列表
 */
const SUPPORTED_API_TYPES = ['openai', 'anthropic', 'azure', 'mistral', 'custom'];

/**
 * 检查URL是否有效
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * LLM标签处理器
 * 
 * 处理llm标签，提取其LLM配置和API设置属性
 */
export class LLMTagProcessor extends AbstractTagProcessor {
  /**
   * 处理器名称
   */
  readonly processorName = 'LLMTagProcessor';
  
  /**
   * 标签名称
   */
  readonly tagName = 'llm';
  
  /**
   * 处理器优先级
   */
  priority = 5;
  
  /**
   * 处理特定属性
   * @param attributes 除id和extends外的属性
   * @param element 原始元素
   * @param context 处理上下文
   * @returns 特定的元数据对象
   */
  protected processSpecificAttributes(
    attributes: Record<string, any>,
    element: Element,
    context: ProcessingContext
  ): Record<string, any> {
    // 提取LLM特定属性
    const apiType = attributes['api-type'] || 'openai';
    const apiUrl = attributes['api-url'];
    const model = attributes['model'];
    const keyEnv = attributes['key-env'];
    
    // 获取备用密钥环境变量
    const backupKeyEnvs: string[] = [];
    for (const key in attributes) {
      if (key.startsWith('backup-key-env-') && attributes[key]) {
        backupKeyEnvs.push(attributes[key]);
      }
    }
    
    // 返回LLM特定的元数据
    return {
      apiType,
      apiUrl,
      model,
      keyEnv,
      backupKeyEnvs,
      attributes
    };
  }
  
  /**
   * 验证元素
   * @param element 待验证的元素
   * @param context 处理上下文
   * @returns 验证结果
   */
  protected validate(element: Element, context: ProcessingContext): {
    errors?: ValidationError[],
    warnings?: ValidationWarning[]
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // 提取LLM特定属性
    const attributes = element.attributes as unknown as LLMTagAttributes;
    const apiType = attributes['api-type'] || 'openai';
    const apiUrl = attributes['api-url'];
    const model = attributes['model'];
    const keyEnv = attributes['key-env'];
    
    // 验证model属性
    if (!model) {
      errors.push({
        code: 'MISSING_REQUIRED_ATTRIBUTE',
        message: 'LLM标签必须包含model属性'
      });
    }
    
    // 验证api-url是否存在
    if (!apiUrl) {
      errors.push({
        code: 'MISSING_REQUIRED_ATTRIBUTE',
        message: 'LLM标签必须包含api-url属性'
      });
    } else if (!isValidUrl(apiUrl)) {
      // 验证api-url是否为有效URL
      errors.push({
        code: 'INVALID_API_URL',
        message: `API URL无效: ${apiUrl}`
      });
    }
    
    // 验证api-type是否为支持的类型
    if (apiType && !SUPPORTED_API_TYPES.includes(apiType)) {
      warnings.push({
        code: 'UNSUPPORTED_API_TYPE',
        message: `不支持的API类型: ${apiType}。支持的类型: ${SUPPORTED_API_TYPES.join(', ')}`
      });
    }
    
    // 创建API密钥管理器用于验证
    const keyManager = new ApiKeyManager(apiType as any);
    
    // 验证key-env环境变量是否存在
    if (keyEnv) {
      // 检查环境变量是否存在，但不实际获取密钥值
      if (!process.env[keyEnv]) {
        warnings.push({
          code: 'MISSING_ENV_VARIABLE',
          message: `环境变量${keyEnv}不存在或未设置`
        });
      } else {
        // 不进行格式验证，避免同步调用异步方法
        // 实际验证将在运行时由ApiKeyManager执行
      }
    } else if (apiType !== 'custom') {
      // 如果不是自定义API类型且未指定key-env，发出警告
      warnings.push({
        code: 'MISSING_KEY_ENV',
        message: '建议设置key-env属性以指定API密钥的环境变量'
      });
    }
    
    // 验证备用密钥环境变量
    for (const key in attributes) {
      if (key.startsWith('backup-key-env-') && attributes[key]) {
        const backupEnvName = attributes[key];
        if (!process.env[backupEnvName]) {
          warnings.push({
            code: 'MISSING_BACKUP_ENV_VARIABLE',
            message: `备用环境变量${backupEnvName}不存在或未设置`
          });
        }
      }
    }
    
    return { errors, warnings };
  }
} 