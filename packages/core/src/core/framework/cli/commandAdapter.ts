import type { CommandDefinition } from '../../../types/CLI';
import type { DomainAction, DomainActionContext } from '../../../types/DomainAction';
import type { DomainContext } from '../types';

/**
 * 创建领域命令上下文
 * 将内部DomainContext转换为命令专用的DomainActionContext
 * @param context 内部领域上下文
 * @returns 领域命令上下文
 */
function createDomainActionContext(context: DomainContext): DomainActionContext {
  return {
    getCompiler<T>(): DomainCompiler<T> {
      if (!context.compiler) {
        throw new Error('领域编译器尚未初始化');
      }

      return context.compiler as DomainCompiler<T>;
    },

    getDomain(): string {
      return context.domain;
    },

    getDescription(): string {
      return context.description || '';
    },

    getOptions(): Required<CompileOptions> {
      return context.options;
    }
  };
}

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
  // 创建命令上下文
  const actionContext = createDomainActionContext(context);

  return {
    name: `${domain}:${action.name}`,
    description: action.description,
    arguments: action.args,
    options: action.options,
    action: async (...args) => {
      // 检查第一个参数是否已经是DomainActionContext
      // 这种情况发生在测试时直接调用command.action(actionContext, ...)
      if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null &&
          'getCompiler' in args[0] && 'getDomain' in args[0] &&
          'getDescription' in args[0] && 'getOptions' in args[0]) {
        // 如果第一个参数已经是ActionContext，直接传递所有参数
        return action.action(...(args as [DomainActionContext, ...any[]]));
      }

      // 否则，执行器调用时注入领域命令上下文
      return action.action(actionContext, ...args);
    },
    category: domain
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

// 导入相关类型
import type { DomainCompiler } from '../../../types/DomainCompiler';
import type { CompileOptions } from '../../../types/CompileOptions';
