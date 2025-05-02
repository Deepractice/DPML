import { createTransformerDefiner, createLogger, LogLevel, setDefaultLogLevel } from '@dpml/core';
import type { DPMLNode } from '@dpml/core';

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

// 定义基础工作流转换器 - 设置基本结构
export const workflowBaseTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'workflowBaseTransformer',
  [
    {
      selector: "workflow",
      targetPath: "", // 使用空路径，将属性设置到根级别
      transform: (value: unknown) => {
        // 类型断言
        const node = value as DPMLNode;

        logger.debug('执行基础工作流转换器', {
          selector: 'workflow',
          name: node.attributes?.get("name"),
          version: node.attributes?.get("version")
        });

        return {
          name: node.attributes?.get("name") || "",
          version: node.attributes?.get("version"),
          variables: [],
          steps: [],
          transitions: []
        };
      }
    }
  ]
);

// 定义变量转换器 - 处理工作流变量
export const variablesTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'variablesTransformer',
  [
    {
      selector: "workflow > variables > variable",
      targetPath: "variables[]", // 使用数组路径语法
      transform: (value: unknown) => {
        // 类型断言
        const node = value as DPMLNode;

        const variable = {
          name: node.attributes?.get("name") || "",
          type: (node.attributes?.get("type") || "string") as 'string' | 'number' | 'boolean',
          value: node.content || ""
        };

        logger.debug('处理变量', { variableName: variable.name, variableType: variable.type });

        return variable;
      }
    }
  ]
);

// 定义步骤转换器 - 处理工作流步骤
export const stepsTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'stepsTransformer',
  [
    {
      selector: "workflow > step",
      targetPath: "steps[]", // 使用数组路径语法
      transform: (value: unknown) => {
        // 类型断言
        const node = value as DPMLNode;

        const step = {
          id: node.attributes?.get("id") || "",
          type: (node.attributes?.get("type") || "process") as 'start' | 'process' | 'decision' | 'end',
          description: node.content?.trim() || ""
        };

        logger.debug('处理步骤', { stepId: step.id, stepType: step.type });

        return step;
      }
    }
  ]
);

// 定义转换转换器 - 处理工作流转换
export const transitionsTransformer = definer.defineStructuralMapper<unknown, Workflow>(
  'transitionsTransformer',
  [
    {
      selector: "workflow > transition",
      targetPath: "transitions[]", // 使用数组路径语法
      transform: (value: unknown) => {
        // 类型断言
        const node = value as DPMLNode;

        const transition = {
          from: node.attributes?.get("from") || "",
          to: node.attributes?.get("to") || "",
          condition: node.attributes?.get("condition")
        };

        logger.debug('处理转换', { from: transition.from, to: transition.to });

        return transition;
      }
    }
  ]
);

// 导出所有转换器，顺序很重要：基础结构必须首先创建
export const transformers = [
  workflowBaseTransformer,
  variablesTransformer,
  stepsTransformer,
  transitionsTransformer
];
