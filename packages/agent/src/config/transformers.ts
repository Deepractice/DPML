import { createTransformerDefiner } from '@dpml/core';
import type { DPMLNode } from '@dpml/core';

import type { AgentConfig, LLMConfig } from '../types';

// 创建转换器定义器
const definer = createTransformerDefiner();

/**
 * Agent转换器
 *
 * 将DPML文档转换为AgentConfig对象
 */
export const agentTransformer = definer.defineStructuralMapper<unknown, AgentConfig>(
  'agentTransformer',
  [
    {
      // 将LLM元素转换为LLM配置
      selector: "agent > llm",
      targetPath: "llm",
      transform: (value: unknown) => {
        const node = value as DPMLNode;
        const llmConfig: LLMConfig = {
          apiType: node.attributes.get('api-type') || '',
          apiUrl: node.attributes.get('api-url'),
          apiKey: node.attributes.get('api-key'),
          model: node.attributes.get('model') || ''
        };

        return llmConfig;
      }
    },
    {
      // 将prompt元素转换为提示词
      selector: "agent > prompt",
      targetPath: "prompt",
      transform: (value: unknown) => {
        const node = value as DPMLNode;

        return node.content || '';
      }
    }
  ]
);

// 导出所有转换器
export const transformers = [
  agentTransformer
];
