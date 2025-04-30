/**
 * 领域命令接口
 * 定义领域特定的CLI命令结构
 */
export interface DomainAction {
  /**
   * 命令名称
   * 应遵循kebab-case格式，如"validate-schema"
   */
  name: string;

  /**
   * 命令描述
   * 用于CLI帮助信息
   */
  description: string;

  /**
   * 位置参数定义
   * 定义命令的位置参数
   */
  args?: Array<DomainArgumentDefinition>;

  /**
   * 选项参数定义
   * 定义命令的选项参数
   */
  options?: Array<DomainOptionDefinition>;

  /**
   * 命令执行函数
   * 第一个参数为领域上下文，后续参数为命令参数
   * @param context 领域上下文
   * @param args 命令参数
   */
  executor: (context: DomainContext, ...args: any[]) => Promise<void> | void;
}

/**
 * 领域命令参数定义
 */
export interface DomainArgumentDefinition {
  /**
   * 参数名称
   */
  name: string;

  /**
   * 参数描述
   */
  description: string;

  /**
   * 是否必需
   * 默认为false
   */
  required?: boolean;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 可选项列表
   */
  choices?: string[];
}

/**
 * 领域命令选项定义
 */
export interface DomainOptionDefinition {
  /**
   * 选项标识，如 '-v, --verbose'
   */
  flags: string;

  /**
   * 选项描述
   */
  description: string;

  /**
   * 默认值
   */
  defaultValue?: string | boolean | number;

  /**
   * 是否必需
   * 默认为false
   */
  required?: boolean;

  /**
   * 可选项列表
   */
  choices?: string[];
}

// 导入相关类型
import type { DomainContext } from '../core/framework/types';
