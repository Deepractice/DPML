/**
 * 输入净化工具类
 *
 * 提供用于净化和验证用户输入的方法，防止XSS、命令注入等安全问题
 */

import { ErrorFactory } from '../errors/factory';
import { AgentErrorCode } from '../errors/types';

/**
 * 净化策略类型
 */
export type SanitizeStrategy = 'strict' | 'moderate' | 'permissive';

/**
 * 输入净化选项
 */
export interface SanitizeOptions {
  /**
   * 净化策略
   */
  strategy?: SanitizeStrategy;

  /**
   * 自定义正则表达式
   */
  pattern?: RegExp;

  /**
   * 允许的最大长度
   */
  maxLength?: number;

  /**
   * 是否允许空值
   */
  allowEmpty?: boolean;
}

/**
 * 输入净化器类
 */
export class InputSanitizer {
  /**
   * 默认选项
   */
  private static readonly DEFAULT_OPTIONS: SanitizeOptions = {
    strategy: 'moderate',
    maxLength: 1024 * 10, // 10KB
    allowEmpty: false,
  };

  /**
   * 预定义的安全模式正则表达式
   */
  private static readonly PATTERNS = {
    // 严格模式：只允许字母、数字和基本标点
    strict: /[^\w\s.,?!;:'"()[\]{}]/g,

    // 中等模式：允许大多数可打印字符，但过滤潜在危险字符
    moderate: /[<>|&;$`\\]/g,

    // 宽松模式：只过滤最危险的字符
    permissive: /[<>]/g,
  };

  /**
   * 净化字符串输入
   *
   * @param input 要净化的输入
   * @param options 净化选项
   * @returns 净化后的字符串
   * @throws SecurityError 如果输入无效
   */
  static sanitizeString(input: string, options: SanitizeOptions = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // 检查是否为空
    if (!input) {
      if (!opts.allowEmpty) {
        throw ErrorFactory.createSecurityError(
          '输入不能为空',
          AgentErrorCode.SENSITIVE_DATA_EXPOSURE,
          { securityContext: 'input-validation' }
        );
      }

      return '';
    }

    // 检查长度
    if (opts.maxLength && input.length > opts.maxLength) {
      throw ErrorFactory.createSecurityError(
        `输入超过最大允许长度${opts.maxLength}`,
        AgentErrorCode.SENSITIVE_DATA_EXPOSURE,
        { securityContext: 'input-validation' }
      );
    }

    // 应用净化策略
    let pattern: RegExp;

    if (opts.pattern) {
      pattern = opts.pattern;
    } else if (opts.strategy && opts.strategy in this.PATTERNS) {
      pattern = this.PATTERNS[opts.strategy];
    } else {
      pattern = this.PATTERNS.moderate;
    }

    // 执行替换
    return input.replace(pattern, '');
  }

  /**
   * 净化文件路径
   *
   * @param path 文件路径
   * @returns 净化后的文件路径
   */
  static sanitizeFilePath(path: string): string {
    if (!path) {
      return '';
    }

    // 移除所有危险字符和路径遍历尝试
    return (
      path
        // 规范化分隔符
        .replace(/\\/g, '/')
        // 移除多余的斜杠
        .replace(/\/+/g, '/')
        // 移除路径遍历尝试
        .replace(/\.\.\//g, '')
        // 移除绝对路径前缀
        .replace(/^\/+/, '')
        // 移除特殊字符
        .replace(/[<>:"|?*]/g, '_')
    );
  }

  /**
   * 净化标识符
   *
   * @param id 标识符
   * @returns 净化后的标识符
   */
  static sanitizeIdentifier(id: string): string {
    if (!id) {
      return '';
    }

    // 只允许字母、数字、下划线和连字符
    return id.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * 检查字符串是否包含敏感信息
   *
   * @param text 要检查的文本
   * @returns 是否包含敏感信息
   */
  static containsSensitiveData(text: string): boolean {
    if (!text) {
      return false;
    }

    // 检查常见的敏感信息模式
    const patterns = [
      // API密钥模式
      /\b(sk-[a-zA-Z0-9]{1,})\b/i,
      /\b(sk-ant-[a-zA-Z0-9]{1,})\b/i,

      // 访问令牌模式
      /\baccess[._-]?token\s*[:=]\s*['"]?([^'"\s]+)/i,

      // 密码模式
      /\bpassword\s*[:=]\s*['"]?([^'"\s]{3,})/i,

      // 连接字符串模式
      /\bconnection[._-]?string\s*[:=]\s*['"]?([^'"\s]+)/i,
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * 移除敏感信息
   *
   * @param text 包含敏感信息的文本
   * @returns 移除敏感信息后的文本
   */
  static removeSensitiveData(text: string): string {
    if (!text) {
      return '';
    }

    // 替换常见的敏感信息模式
    return (
      text
        // API密钥
        .replace(/\b(sk-[a-zA-Z0-9]{5,})[a-zA-Z0-9]+\b/gi, '$1********')
        .replace(/\b(sk-ant-[a-zA-Z0-9]{5,})[a-zA-Z0-9]+\b/gi, '$1********')

        // 访问令牌
        .replace(
          /\b(access[._-]?token\s*[:=]\s*['"]?)[^'"\s]{5,}/gi,
          '$1********'
        )

        // 密码
        .replace(/\b(password\s*[:=]\s*['"]?)[^'"\s]{3,}/gi, '$1********')

        // 连接字符串
        .replace(
          /\b(connection[._-]?string\s*[:=]\s*['"]?)[^'"\s]{10,}/gi,
          '$1********'
        )
    );
  }
}
