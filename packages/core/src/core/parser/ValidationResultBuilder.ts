/**
 * 验证结果构建器
 * 用于构建和合并验证结果
 */

import type { DPMLNode, SourceLocation, ValidationError, ValidationResult, ValidationWarning, ValidationErrorType } from '../../types';

/**
 * 验证结果构建器类
 */
export class ValidationResultBuilder {
  /**
   * 验证错误数组
   */
  private errors: ValidationError[] = [];

  /**
   * 验证警告数组
   */
  private warnings: ValidationWarning[] = [];

  /**
   * 添加错误
   * @param type 错误类型
   * @param message 错误消息
   * @param node 相关节点
   * @param location 错误位置
   * @param attributeName 相关属性名（可选）
   * @param suggestion 修复建议（可选）
   */
  addError(
    type: ValidationErrorType,
    message: string,
    node: DPMLNode,
    location: SourceLocation,
    attributeName?: string,
    suggestion?: string
  ): void {
    this.errors.push({
      type,
      message,
      node,
      location,
      attributeName,
      suggestion
    });
  }

  /**
   * 添加警告
   * @param message 警告消息
   * @param node 相关节点
   * @param location 警告位置
   * @param suggestion 修复建议（可选）
   */
  addWarning(
    message: string,
    node: DPMLNode,
    location: SourceLocation,
    suggestion?: string
  ): void {
    this.warnings.push({
      message,
      node,
      location,
      suggestion
    });
  }

  /**
   * 合并另一个验证结果
   * @param result 要合并的验证结果
   */
  merge(result: ValidationResult): void {
    if (result.errors && result.errors.length > 0) {
      this.errors.push(...result.errors);
    }

    if (result.warnings && result.warnings.length > 0) {
      this.warnings.push(...result.warnings);
    }
  }

  /**
   * 构建验证结果
   * @returns 验证结果
   */
  build(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * 检查是否有错误
   * @returns 是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * 检查是否有警告
   * @returns 是否有警告
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * 获取错误数量
   * @returns 错误数量
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * 获取警告数量
   * @returns 警告数量
   */
  getWarningCount(): number {
    return this.warnings.length;
  }

  /**
   * 清空所有错误和警告
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
  }
}
