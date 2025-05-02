import { readFile } from 'fs/promises';

import type { DomainCommandsConfig } from '@dpml/core';

/**
 * 工作流领域CLI命令配置
 */
export const commandsConfig: DomainCommandsConfig = {
  // 包含标准命令（如validate和parse）
  includeStandard: true,

  // 自定义领域命令
  actions: [
    {
      // 命令名称
      name: 'execute',

      // 命令描述
      description: '执行工作流',

      // 位置参数定义
      args: [
        {
          name: 'filePath',
          description: '工作流文件路径',
          required: true
        }
      ],

      // 选项参数定义
      options: [
        {
          flags: '-d, --debug',
          description: '启用调试模式'
        },
        {
          flags: '-o, --output <format>',
          description: '输出格式',
          defaultValue: 'json',
          choices: ['json', 'xml', 'yaml']
        }
      ],

      // 命令处理函数
      action: async (actionContext, filePath, options) => {
        try {
          console.log('开始执行...');
          console.log(`文件路径: ${filePath}`);

          // 读取文件
          const content = await readFile(filePath, 'utf-8');

          console.log(`文件内容长度: ${content.length}字符`);

          // 导入日志库
          const { getLogger, LogLevel, createLogger, setDefaultLogLevel } = await import('@dpml/core');

          // 设置全局日志级别为DEBUG
          setDefaultLogLevel(LogLevel.DEBUG);

          // 创建一个带配置的日志器
          const logger = createLogger('example.cli', {
            minLevel: LogLevel.DEBUG
          });

          // 直接使用导入的编译器
          // 在CLI环境中，context可能没有getCompiler方法
          console.log('导入exampleDPML...');
          const { exampleDPML } = await import('../index');

          logger.debug('开始解析DPML文档', { contentLength: content.length });

          console.log('开始编译工作流...');

          // 解析前记录一下
          logger.debug('解析前的文档内容示例', { contentPreview: content.substring(0, 100) });

          try {
            const workflow = await exampleDPML.compiler.compile(content);

            // 添加额外调试日志
            logger.debug('编译结果对象详细信息', {
              constructor: workflow?.constructor?.name,
              prototype: Object.getPrototypeOf(workflow),
              keys: Object.keys(workflow || {}),
              descriptors: Object.getOwnPropertyDescriptors(workflow || {}),
              hasVariables: Array.isArray(workflow?.variables),
              variablesLength: workflow?.variables?.length,
              hasSteps: Array.isArray(workflow?.steps),
              stepsLength: workflow?.steps?.length
            });

            logger.debug('编译完成', {
              workflowName: workflow.name,
              hasSteps: !!workflow.steps,
              stepsLength: workflow.steps?.length,
              hasVariables: !!workflow.variables,
              variablesLength: workflow.variables?.length,
              hasTransitions: !!workflow.transitions,
              transitionsLength: workflow.transitions?.length
            });

            // 添加更多调试信息
            logger.debug('编译详细信息', {
              workflowObject: workflow,
              workflowString: JSON.stringify(workflow),
              workflowType: typeof workflow,
              workflowConstructor: workflow.constructor?.name,
              workflowPrototype: Object.getPrototypeOf(workflow),
              transitions: workflow.transitions,
              transitionsType: typeof workflow.transitions
            });

            console.log('编译结果:');
            console.log(JSON.stringify(workflow, null, 2));

            console.log(`执行工作流: ${workflow.name}`);

            // 详细检查工作流结构
            logger.debug('工作流结构', {
              workflowKeys: Object.keys(workflow),
              workflowType: typeof workflow,
              isArray: Array.isArray(workflow)
            });

            // 检查属性是否存在
            console.log('检查steps属性:', workflow.steps ? '存在' : '不存在');
            console.log('检查variables属性:', workflow.variables ? '存在' : '不存在');
            console.log('检查transitions属性:', workflow.transitions ? '存在' : '不存在');

            console.log(`步骤数量: ${workflow.steps ? workflow.steps.length : 'undefined'}`);
            console.log(`变量数量: ${workflow.variables ? workflow.variables.length : 'undefined'}`);
            console.log(`转换数量: ${workflow.transitions ? workflow.transitions.length : 'undefined'}`);

            if (options.debug) {
              console.log('调试信息:');
              console.log(JSON.stringify(workflow, null, 2));
            }

            console.log(`输出格式: ${options.output}`);
            // TODO: 实际执行逻辑
          } catch (error) {
            logger.error('编译过程中发生错误', {}, error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        } catch (error) {
          console.error('执行失败:', error instanceof Error ? error.message : String(error));
          console.error('错误详情:', error);
          process.exit(1);
        }
      }
    },
    {
      name: 'visualize',
      description: '可视化工作流',
      args: [
        {
          name: 'filePath',
          description: '工作流文件路径',
          required: true
        }
      ],
      action: async (actionContext, filePath) => {
        try {
          // 读取文件
          const content = await readFile(filePath, 'utf-8');

          // 直接使用导入的编译器
          const { exampleDPML } = await import('../index');
          const workflow = await exampleDPML.compiler.compile(content);

          console.log(`可视化工作流: ${workflow.name}`);
          console.log('步骤:');

          // 简单的文本可视化
          workflow.steps.forEach(step => {
            console.log(`  [${step.type}] ${step.id}: ${step.description}`);
          });

          console.log('转换:');
          workflow.transitions.forEach(transition => {
            let arrow = `  ${transition.from} --> ${transition.to}`;

            if (transition.condition) {
              arrow += ` [条件: ${transition.condition}]`;
            }

            console.log(arrow);
          });
        } catch (error) {
          console.error('可视化失败:', error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      }
    }
  ]
};
