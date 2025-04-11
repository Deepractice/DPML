/**
 * @dpml/prompt TypeScript类型兼容性测试
 * 
 * 测试ID: CT-P-005
 * 测试目标: 验证类型定义在支持的TypeScript版本中正确工作
 */

import { describe, it, expect } from 'vitest';
import { getTypeScriptVersion } from './utils/environmentHelpers';
import { 
  generatePrompt, 
  processPrompt, 
  transformPrompt, 
  GeneratePromptOptions
} from '../../src';
import { ProcessedPrompt, TransformOptions } from '../../src/types';

describe('TypeScript类型兼容性测试 (CT-P-005)', () => {
  it('应该检测当前TypeScript版本', () => {
    const tsVersion = getTypeScriptVersion();
    if (tsVersion) {
      console.log(`当前TypeScript版本: ${tsVersion}`);
      // 验证版本号格式
      expect(tsVersion).toMatch(/^\d+\.\d+\.\d+$/);
    } else {
      console.log('未检测到TypeScript版本或未安装TypeScript');
      // 跳过此测试
      expect(true).toBeTruthy();
    }
  });

  it('TypeScript类型定义应该可用且正确', () => {
    // 此测试的目的是验证类型定义在编译时是否有效
    // 如果以下代码能通过编译，说明类型定义正确
    
    // 测试生成选项类型
    const genOptions: GeneratePromptOptions = {
      validateOnly: false,
      strictMode: true,
      basePath: './templates',
      formatTemplates: {
        role: {
          title: '自定义角色标题'
        }
      }
    };
    expect(genOptions).toBeDefined();
    
    // 测试处理选项类型
    const processOptions = {
      mode: 'strict' as 'strict' | 'loose',
      basePath: './templates'
    };
    expect(processOptions).toBeDefined();
    
    // 测试转换选项类型
    const transformOptions: TransformOptions = {
      format: {
        role: {
          title: '自定义角色标题'
        }
      }
    };
    expect(transformOptions).toBeDefined();
    
    // 测试ProcessedPrompt类型
    const mockProcessedPrompt: ProcessedPrompt = {
      rawDocument: { 
        children: [],
        type: 'document'
      },
      tags: {
        role: {
          content: '测试',
          attributes: {},
          metadata: {}
        }
      },
      metadata: {
        processed: true,
        language: 'zh-CN'
      }
    };
    expect(mockProcessedPrompt).toBeDefined();
  });

  it('API函数应该具有正确的TypeScript类型签名', async () => {
    // 此测试检查API函数的类型签名是否正确
    // 这通过编译时检查和运行时类型断言来验证
    
    const simpleDpml = `
      <prompt>
        <role>类型测试助手</role>
      </prompt>
    `;
    
    // 确保generatePrompt返回类型为Promise<string>
    const genPromise = generatePrompt(simpleDpml);
    expect(genPromise).toBeInstanceOf(Promise);
    const genResult = await genPromise;
    expect(typeof genResult).toBe('string');
    
    // 确保processPrompt返回类型为Promise<ProcessedPrompt>
    const processPromise = processPrompt(simpleDpml);
    expect(processPromise).toBeInstanceOf(Promise);
    const processResult = await processPromise;
    expect(processResult).toHaveProperty('tags');
    expect(processResult).toHaveProperty('rawDocument');
    
    // 确保transformPrompt接受ProcessedPrompt并返回string
    const transformResult = transformPrompt(processResult);
    expect(typeof transformResult).toBe('string');
  });
}); 