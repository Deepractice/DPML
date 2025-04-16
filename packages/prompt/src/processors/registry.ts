/**
 * 处理器注册表
 */
import { ContextTagProcessor } from '@prompt/processors/contextTagProcessor';
import { CustomTagProcessor } from '@prompt/processors/customTagProcessor';
import { ExecutingTagProcessor } from '@prompt/processors/executingTagProcessor';
import { PromptTagProcessor } from '@prompt/processors/promptTagProcessor';
import { ProtocolTagProcessor } from '@prompt/processors/protocolTagProcessor';
import { RoleTagProcessor } from '@prompt/processors/roleTagProcessor';
import { TestingTagProcessor } from '@prompt/processors/testingTagProcessor';
import { ThinkingTagProcessor } from '@prompt/processors/thinkingTagProcessor';

import type { TagProcessor, TagProcessorRegistry } from '@dpml/core';

/**
 * 提示包处理器注册表实现
 */
export class PromptTagProcessorRegistry implements TagProcessorRegistry {
  private processorMap = new Map<string, TagProcessor[]>();

  /**
   * 注册处理器
   * @param tagName 标签名
   * @param processor 处理器
   */
  registerProcessor(tagName: string, processor: TagProcessor): void {
    const processors = this.processorMap.get(tagName) || [];

    processors.push(processor);

    // 按优先级排序
    processors.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.processorMap.set(tagName, processors);
  }

  /**
   * 获取处理器
   * @param tagName 标签名
   * @returns 处理器列表
   */
  getProcessors(tagName: string): TagProcessor[] {
    return this.processorMap.get(tagName) || [];
  }
}

/**
 * 创建并初始化提示处理器注册表
 */
export function createPromptProcessorRegistry(): TagProcessorRegistry {
  const registry = new PromptTagProcessorRegistry();

  // 注册 prompt 标签处理器
  registry.registerProcessor('prompt', new PromptTagProcessor());

  // 注册 role 标签处理器
  registry.registerProcessor('role', new RoleTagProcessor());

  // 注册 context 标签处理器
  registry.registerProcessor('context', new ContextTagProcessor());

  // 注册 thinking 标签处理器
  registry.registerProcessor('thinking', new ThinkingTagProcessor());

  // 注册 executing 标签处理器
  registry.registerProcessor('executing', new ExecutingTagProcessor());

  // 注册 testing 标签处理器
  registry.registerProcessor('testing', new TestingTagProcessor());

  // 注册 protocol 标签处理器
  registry.registerProcessor('protocol', new ProtocolTagProcessor());

  // 注册 custom 标签处理器
  registry.registerProcessor('custom', new CustomTagProcessor());

  return registry;
}

/**
 * 默认提示处理器注册表单例
 */
export const promptProcessorRegistry = createPromptProcessorRegistry();
