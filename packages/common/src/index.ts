/**
 * @dpml/common - 共享工具和功能库
 * 
 * 这个包提供了DPML项目中所有包共用的功能：
 * - 日志系统
 * - 测试工具
 * - 通用工具函数
 * - 共享类型定义
 */

// 导出子模块，使用命名空间导出避免冲突
import * as loggerExports from './logger';
import * as testingExports from './testing';
import * as utilsExports from './utils';
import * as typesExports from './types';

export const logger = loggerExports;
export const testing = testingExports;
export const utils = utilsExports;
export const types = typesExports; 