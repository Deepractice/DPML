/**
 * API层 - 对外接口
 *
 * 是用户与系统交互的唯一入口
 */
import { exampleDPML, workflowCompiler } from '../index';
import type { Workflow } from '../types/workflow';

/**
 * 编译DPML为工作流对象
 *
 * @param content DPML内容
 * @returns 工作流对象
 */
export async function compileWorkflow(content: string): Promise<Workflow> {
  return await workflowCompiler.compile(content);
}

/**
 * 导出领域DPML实例
 */
export { exampleDPML };

/**
 * 重新导出类型定义
 */
export * from '../types/workflow';
