import { vi } from 'vitest';
import type { DomainActionContext } from '@dpml/core';
import type { AgentConfig } from '../../types';

/**
 * 创建模拟的DomainActionContext
 */
export function createMockActionContext(compilerResult: AgentConfig): DomainActionContext {
  return {
    getDomain: vi.fn().mockReturnValue('agent'),
    getDescription: vi.fn().mockReturnValue('Agent configuration domain'),
    getOptions: vi.fn().mockReturnValue({ strictMode: true, errorHandling: 'throw' }),
    getCompiler: vi.fn().mockReturnValue({
      compile: vi.fn().mockResolvedValue(compilerResult)
    })
  } as DomainActionContext;
}

/**
 * 创建模拟的readline接口
 */
export function createMockReadline() {
  const mockQuestion = vi.fn();
  const mockClose = vi.fn();
  
  // 模拟用户输入序列
  const userInputs = [
    'Hello, AI assistant',
    'What can you do?',
    'exit'
  ];
  
  // 为每次调用提供不同的输入
  mockQuestion.mockImplementation((prompt, callback) => {
    const input = userInputs.shift() || 'exit';
    callback(input);
  });
  
  // 返回模拟对象
  return {
    createInterface: vi.fn().mockReturnValue({
      question: mockQuestion,
      close: mockClose
    }),
    mockQuestion,
    mockClose
  };
} 