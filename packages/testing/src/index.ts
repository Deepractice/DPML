import 'reflect-metadata';
import { createMock } from 'ts-auto-mock';
import { ImportType } from './types';

/**
 * 创建核心模拟对象
 */
export function createCoreMock<T extends object>() {
  const coreMock = createMock<T>();
  
  // 添加NodeType类型（根据实际需要调整）
  if (typeof coreMock === 'object' && coreMock) {
    (coreMock as any).NodeType = {
      ELEMENT: 'element',
      CONTENT: 'content',
      ATTRIBUTE: 'attribute'
    };
    
    // 添加ErrorLevel枚举
    (coreMock as any).ErrorLevel = {
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error',
      CRITICAL: 'critical'
    };
    
    // DPMLError类
    (coreMock as any).DPMLError = class DPMLError extends Error {
      constructor(options: any) {
        super(options.message);
        Object.assign(this, options);
      }
    };
    
    // 添加其他必要的属性
    (coreMock as any).TAG_TYPES = {
      AGENT: 'agent',
      LLM: 'llm',
      PROMPT: 'prompt'
    };
  }
  
  return coreMock;
}

/**
 * 设置核心模拟对象
 */
export function setupCoreMock(vi: any) {
  vi.mock('@dpml/core', () => createCoreMock<ImportType<'@dpml/core'>>());
}

/**
 * 获取已设置的模拟对象
 */
export function getMock(moduleName: string, vi: any) {
  return vi.importMock(moduleName);
}

// 导出其他常用类型
export * from './types'; 