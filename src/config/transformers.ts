import { createTransformerDefiner, createLogger, LogLevel, setDefaultLogLevel } from '@dpml/core';

import type { Workflow } from '../types/workflow';

// 设置日志级别
setDefaultLogLevel(LogLevel.DEBUG);

// 创建日志器
const logger = createLogger('example.transformers', {
  minLevel: LogLevel.DEBUG
});

// 输出额外的调试信息
logger.debug('初始化转换器', { version: '1.0.0' });

// 创建转换器定义器
const definer = createTransformerDefiner();

// 定义工作流根转换器 - 创建基础结构
export const workflowTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'workflowTransformer',
  [
    {
      selector: "workflow",
      targetPath: "",
      transform: (node) => {
        // 安全地访问 node 属性
        const nodeObj = node as any;

        logger.debug('执行工作流转换器', {
          selector: 'workflow',
          attributes: {
            name: nodeObj.attributes?.get("name"),
            version: nodeObj.attributes?.get("version")
          },
          nodeType: typeof nodeObj,
          nodeKeys: Object.keys(nodeObj || {})
        });

        // 创建工作流基础结构 - 这里会在其他转换器中填充属性
        const result = {
          name: nodeObj.attributes?.get("name") || "",
          version: nodeObj.attributes?.get("version"),
          variables: [],    // 初始化为空数组
          steps: [],        // 初始化为空数组
          transitions: []   // 初始化为空数组
        };

        logger.debug('工作流转换器结果', { result: JSON.stringify(result) });

        return result;
      }
    }
  ]
);

// 变量转换器 - 添加到variables数组
export const variablesTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'variablesTransformer',
  [
    {
      selector: "workflow > variables > variable",
      targetPath: "variables[]", // 使用数组添加语法
      transform: (node) => {
        // 安全地访问 node 属性
        const nodeObj = node as any;

        logger.debug('执行变量转换器', {
          selector: 'variable',
          name: nodeObj.attributes?.get("name"),
          type: nodeObj.attributes?.get("type"),
          content: nodeObj.content,
          attributeKeys: Object.keys(nodeObj.attributes || {})
        });

        // 创建变量对象
        const variable = {
          name: nodeObj.attributes?.get("name") || "",
          type: (nodeObj.attributes?.get("type") || "string") as 'string' | 'number' | 'boolean',
          value: nodeObj.content || ""
        };

        logger.debug('创建变量对象', { variable: JSON.stringify(variable) });

        return variable;
      }
    }
  ]
);

// 步骤转换器 - 添加到steps数组
export const stepsTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'stepsTransformer',
  [
    {
      selector: "workflow > step",
      targetPath: "steps[]", // 使用数组添加语法
      transform: (node) => {
        // 安全地访问 node 属性
        const nodeObj = node as any;

        logger.debug('执行步骤转换器', {
          selector: 'step',
          id: nodeObj.attributes?.get("id"),
          type: nodeObj.attributes?.get("type"),
          content: nodeObj.content,
          attributeKeys: Object.keys(nodeObj.attributes || {})
        });

        // 创建步骤对象
        const step = {
          id: nodeObj.attributes?.get("id") || "",
          type: (nodeObj.attributes?.get("type") || "process") as 'start' | 'process' | 'decision' | 'end',
          description: nodeObj.content || ""
        };

        logger.debug('创建步骤对象', { step: JSON.stringify(step) });

        return step;
      }
    }
  ]
);

// 转换转换器 - 添加到transitions数组
export const transitionsTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'transitionsTransformer',
  [
    {
      selector: "workflow > transition",
      targetPath: "transitions[]", // 使用数组添加语法
      transform: (node) => {
        try {
          // 安全地访问 node 属性
          const nodeObj = node as any;

          logger.debug('执行转换转换器', {
            selector: 'transition',
            from: nodeObj.attributes?.get("from"),
            to: nodeObj.attributes?.get("to"),
            condition: nodeObj.attributes?.get("condition"),
            attributeKeys: Object.keys(nodeObj.attributes || {})
          });

          // 创建转换对象
          const transition = {
            from: nodeObj.attributes?.get("from") || "",
            to: nodeObj.attributes?.get("to") || "",
            condition: nodeObj.attributes?.get("condition")
          };

          logger.debug('创建转换对象', { transition: JSON.stringify(transition) });

          return transition;
        } catch (error) {
          logger.error('转换器错误', { error });
          throw error;
        }
      }
    }
  ]
);

// 记录转换器配置情况
logger.debug('转换器配置', {
  transformers: [
    { name: 'workflowTransformer', selector: 'workflow', targetPath: '' },
    { name: 'variablesTransformer', selector: 'workflow > variables > variable', targetPath: 'variables[]' },
    { name: 'stepsTransformer', selector: 'workflow > step', targetPath: 'steps[]' },
    { name: 'transitionsTransformer', selector: 'workflow > transition', targetPath: 'transitions[]' }
  ]
});

// 导出所有转换器 - 确保顺序正确
export const transformers = [
  workflowTransformer,  // 首先创建根对象
  variablesTransformer, // 然后添加变量
  stepsTransformer,     // 然后添加步骤
  transitionsTransformer // 最后添加转换
];
