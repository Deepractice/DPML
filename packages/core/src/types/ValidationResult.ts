import type { DPMLNode } from './DPMLNode';
import type { SourceLocation } from './SourceLocation';

/**
 * 验证错误类型枚举
 */
export enum ValidationErrorType {
  INVALID_TAG = 'INVALID_TAG',
  MISSING_REQUIRED_ATTRIBUTE = 'MISSING_REQUIRED_ATTRIBUTE',
  INVALID_ATTRIBUTE = 'INVALID_ATTRIBUTE',
  INVALID_CHILD_TAG = 'INVALID_CHILD_TAG',
  INVALID_CONTENT = 'INVALID_CONTENT',
  DUPLICATE_ID = 'DUPLICATE_ID',
  CUSTOM = 'CUSTOM'
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  /**
   * 错误类型
   */
  type: ValidationErrorType;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 错误相关的节点
   */
  node: DPMLNode;

  /**
   * 错误位置
   */
  location: SourceLocation;

  /**
   * 相关属性名（针对属性错误）
   */
  attributeName?: string;

  /**
   * 修复建议
   */
  suggestion?: string;
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  /**
   * 警告消息
   */
  message: string;

  /**
   * 警告相关的节点
   */
  node: DPMLNode;

  /**
   * 警告位置
   */
  location: SourceLocation;

  /**
   * 修复建议
   */
  suggestion?: string;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /**
   * 验证是否通过
   */
  valid: boolean;

  /**
   * 验证错误数组
   */
  errors: ValidationError[];

  /**
   * 验证警告数组
   */
  warnings: ValidationWarning[];
}
