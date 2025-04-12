/**
 * Vitest 全局设置文件
 */
import 'reflect-metadata';
import { vi } from 'vitest';

// 模拟@dpml/prompt模块 - 对于处理PromptTagProcessor测试很重要
vi.mock('@dpml/prompt', () => {
  return {
    processPrompt: vi.fn().mockImplementation((text, options) => {
      return {
        result: text,
        processed: true
      };
    })
  };
});