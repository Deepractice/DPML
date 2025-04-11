/**
 * DPML Agent
 *
 * 提供Agent相关功能
 */

export const version = '0.1.0';

// 导出标签相关模块
export * from './tags';

// 导出类型定义
export * from './types';

/**
 * Agent模块的初始占位函数
 * 将在后续实现实际功能
 */
export function createAgent() {
  return {
    status: 'created',
    version
  };
}
