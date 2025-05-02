import { createTransformerDefiner } from '@dpml/core';

import type { Workflow, Step, Variable, Transition } from '../types/workflow';

// 创建转换器定义器
const definer = createTransformerDefiner();

// 定义工作流转换器
export const workflowTransformer = definer.defineStructuralMapper<unknown, Workflow>([
  {
    selector: "workflow",
    targetPath: "",
    transform: (node) => ({
      name: node.attributes.get("name") || "",
      version: node.attributes.get("version"),
      variables: [],
      steps: [],
      transitions: []
    })
  }
]);

// 定义变量转换器
export const variablesTransformer = definer.defineStructuralMapper<unknown, { variables: Variable[] }>([
  {
    selector: "workflow > variables > variable",
    targetPath: "variables[]",
    transform: (node) => ({
      name: node.attributes.get("name") || "",
      type: (node.attributes.get("type") || "string") as 'string' | 'number' | 'boolean',
      value: node.content || ""
    })
  }
]);

// 定义步骤转换器
export const stepsTransformer = definer.defineStructuralMapper<unknown, { steps: Step[] }>([
  {
    selector: "workflow > step",
    targetPath: "steps[]",
    transform: (node) => ({
      id: node.attributes.get("id") || "",
      type: (node.attributes.get("type") || "process") as 'start' | 'process' | 'decision' | 'end',
      description: node.content || ""
    })
  }
]);

// 定义转换转换器
export const transitionsTransformer = definer.defineStructuralMapper<unknown, { transitions: Transition[] }>([
  {
    selector: "workflow > transition",
    targetPath: "transitions[]",
    transform: (node) => ({
      from: node.attributes.get("from") || "",
      to: node.attributes.get("to") || "",
      condition: node.attributes.get("condition")
    })
  }
]);

// 导出所有转换器
export const transformers = [
  workflowTransformer,
  variablesTransformer,
  stepsTransformer,
  transitionsTransformer
];
