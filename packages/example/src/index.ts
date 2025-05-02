/**
 * @dpml/example 包主入口
 */
import { createDomainDPML } from '@dpml/core';

import { commandsConfig } from './config/cli';
import { workflowSchema } from './config/schema';
import { transformers } from './config/transformers';
import type { Workflow } from './types/workflow';

/**
 * 创建工作流领域DPML实例
 */
export const exampleDPML = createDomainDPML<Workflow>({
  domain: 'example',
  description: '示例工作流描述语言',
  schema: workflowSchema,
  transformers,
  commands: commandsConfig,
  options: {
    strictMode: true,
    errorHandling: 'throw'
  }
});

/**
 * 导出工作流编译器以便于直接使用
 */
export const workflowCompiler = exampleDPML.compiler;

/**
 * 导出类型定义
 */
export * from './types/workflow';
