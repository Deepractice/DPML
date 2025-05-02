/**
 * 工作流领域类型定义
 */

/**
 * 变量定义
 */
export interface Variable {
  /** 变量名称 */
  name: string;
  /** 变量类型 */
  type: 'string' | 'number' | 'boolean';
  /** 变量值 */
  value: string;
}

/**
 * 步骤定义
 */
export interface Step {
  /** 步骤ID */
  id: string;
  /** 步骤类型 */
  type: 'start' | 'process' | 'decision' | 'end';
  /** 步骤描述 */
  description: string;
}

/**
 * 转换定义
 */
export interface Transition {
  /** 起点步骤ID */
  from: string;
  /** 终点步骤ID */
  to: string;
  /** 条件表达式 */
  condition?: string;
}

/**
 * 工作流定义
 */
export interface Workflow {
  /** 工作流名称 */
  name: string;
  /** 工作流版本 */
  version?: string;
  /** 变量列表 */
  variables: Variable[];
  /** 步骤列表 */
  steps: Step[];
  /** 转换列表 */
  transitions: Transition[];
}
