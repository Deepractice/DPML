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
      action: async (context, filePath, options) => {
        try {
          // 读取文件
          const content = await readFile(filePath, 'utf-8');

          // 直接使用导入的编译器
          // 在CLI环境中，context可能没有getCompiler方法
          const { exampleDPML } = await import('../index');
          const workflow = await exampleDPML.compiler.compile(content);

          console.log(`执行工作流: ${workflow.name}`);
          console.log(`步骤数量: ${workflow.steps.length}`);
          console.log(`变量数量: ${workflow.variables.length}`);
          console.log(`转换数量: ${workflow.transitions.length}`);

          if (options.debug) {
            console.log('调试信息:');
            console.log(JSON.stringify(workflow, null, 2));
          }

          console.log(`输出格式: ${options.output}`);
          // TODO: 实际执行逻辑
        } catch (error) {
          console.error('执行失败:', error instanceof Error ? error.message : String(error));
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
      action: async (context, filePath) => {
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
