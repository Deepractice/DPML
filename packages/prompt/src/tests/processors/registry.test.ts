import {
  PromptTagProcessorRegistry,
  promptProcessorRegistry,
  PromptTagProcessor,
} from '@prompt/processors';
import { describe, it, expect } from 'vitest';

import type { TagProcessor } from '@dpml/core';

describe('PromptTagProcessorRegistry', () => {
  it('应该能正确注册和获取处理器', () => {
    const registry = new PromptTagProcessorRegistry();
    const processor: TagProcessor = new PromptTagProcessor();

    registry.registerProcessor('prompt', processor);

    const processors = registry.getProcessors('prompt');

    expect(processors).toHaveLength(1);
    expect(processors[0]).toBe(processor);

    // 测试不存在的处理器
    expect(registry.getProcessors('unknown')).toHaveLength(0);
  });

  it('应该根据优先级排序处理器', () => {
    const registry = new PromptTagProcessorRegistry();

    const lowPriorityProcessor: TagProcessor = {
      priority: 5,
      canProcess: () => true,
      process: async () => ({ type: 'element' }) as any,
    };

    const highPriorityProcessor: TagProcessor = {
      priority: 10,
      canProcess: () => true,
      process: async () => ({ type: 'element' }) as any,
    };

    registry.registerProcessor('test', lowPriorityProcessor);
    registry.registerProcessor('test', highPriorityProcessor);

    const processors = registry.getProcessors('test');

    expect(processors).toHaveLength(2);
    expect(processors[0]).toBe(highPriorityProcessor); // 高优先级的应该排在前面
    expect(processors[1]).toBe(lowPriorityProcessor);
  });
});

describe('promptProcessorRegistry', () => {
  it('应该包含预设的处理器', () => {
    // 检查 prompt 标签处理器是否已注册
    const promptProcessors = promptProcessorRegistry.getProcessors('prompt');

    expect(promptProcessors).toHaveLength(1);
    expect(promptProcessors[0]).toBeInstanceOf(PromptTagProcessor);
  });
});
