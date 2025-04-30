import type { CommandDefinition } from '../../../types/CLI';
import type { DomainAction } from '../../../types/DomainAction';
import type { DomainContext } from '../types';

/**
 * 将领域命令转换为CLI命令定义
 * @param action 领域命令
 * @param domain 领域标识符
 * @param context 领域上下文
 * @returns CLI命令定义
 */
export function adaptDomainAction(
  action: DomainAction,
  domain: string,
  context: DomainContext
): CommandDefinition {
  return {
    name: `${domain}:${action.name}`,
    description: action.description,
    arguments: action.args,
    options: action.options,
    action: async (...args) => {
      // 执行器调用时注入领域上下文
      return action.executor(context, ...args);
    },
    domain: domain
  };
}

/**
 * 批量转换领域命令
 * @param actions 领域命令数组
 * @param domain 领域标识符
 * @param context 领域上下文
 * @returns CLI命令定义数组
 */
export function adaptDomainActions(
  actions: DomainAction[],
  domain: string,
  context: DomainContext
): CommandDefinition[] {
  return actions.map(action => adaptDomainAction(action, domain, context));
}
