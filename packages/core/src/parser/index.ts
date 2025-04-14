export * from './dpml-adapter';
export * from './interfaces';
export * from './tag-registry';
// 直接导入并重新导出所需类型
import type { TagDefinition } from './tag-definition';
import { ValidationError, ValidationWarningClass } from '../errors/types';
import type { ValidationWarning } from '../errors/types';

// 重新导出类型
export type { TagDefinition, ValidationWarning };
export { ValidationError, ValidationWarningClass as ValidationWarningImpl };
export * from './validator';