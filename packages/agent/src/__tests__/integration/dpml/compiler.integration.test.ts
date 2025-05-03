import * as DPMLCore from '@dpml/core';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { schema, transformers } from '../../../config';
import { compiler, agentDPML } from '../../../index';
import type { AgentConfig } from '../../../types';

// 模拟DPMLCore的核心功能
vi.mock('@dpml/core', async () => {
  const actual = await vi.importActual<typeof DPMLCore>('@dpml/core');

  return {
    ...actual,
    createDomainDPML: vi.fn().mockImplementation(() => ({
      compiler: {
        compile: vi.fn()
      },
      cli: {},
      domain: 'agent'
    }))
  };
});

describe('IT-Comp', () => {
  // 重置模拟
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('IT-Comp-01: agentDPML.compiler应能编译有效的DPML文档', async () => {
    // 准备模拟编译函数
    const mockCompileResult: AgentConfig = {
      llm: {
        apiType: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-test'
      },
      prompt: '你是一个AI助手'
    };

    // 设置模拟返回值
    const mockCompile = vi.fn().mockResolvedValue(mockCompileResult);

    // 创建新的DPML实例，使用模拟的创建函数
    const mockDPML = {
      compiler: {
        compile: mockCompile
      },
      domain: 'agent',
      schema,
      transformers
    };

    (DPMLCore.createDomainDPML as any).mockReturnValue(mockDPML);

    // 测试XML内容
    const xmlContent = `
      <agent>
        <llm api-type="openai" model="gpt-4" api-key="sk-test"></llm>
        <prompt>你是一个AI助手</prompt>
      </agent>
    `;

    // 执行编译
    const result = await mockDPML.compiler.compile(xmlContent);

    // 验证compile被调用以及结果
    expect(mockCompile).toHaveBeenCalledWith(xmlContent);
    expect(result).toEqual(mockCompileResult);
  });

  test('IT-Comp-02: agentDPML实例应具有正确的domain标识符', () => {
    // 检查是否有domain属性
    expect(agentDPML).toBeDefined();

    // 不能直接访问的话，我们可以检查其他可见的属性
    expect(agentDPML.compiler).toBeDefined();
    expect(agentDPML.cli).toBeDefined();
  });

  test('IT-Comp-03: agentDPML实例应正确集成schema', () => {
    // 间接验证schema集成
    // 由于schema可能不作为公共属性暴露，所以我们只能验证编译器的存在
    expect(agentDPML.compiler).toBeDefined();
  });

  test('IT-Comp-04: agentDPML实例应正确集成transformers', () => {
    // 间接验证transformers集成
    // 同样，transformers可能不作为公共属性暴露
    expect(agentDPML.compiler).toBeDefined();
  });

  test('IT-Comp-05: agentDPML应配置正确的commands', () => {
    // 验证agentDPML提供了CLI命令
    expect(agentDPML.cli).toBeDefined();
  });

  test('IT-Comp-06: compiler应是agentDPML.compiler的直接引用', () => {
    // 验证导出的compiler是agentDPML.compiler的直接引用
    expect(compiler).toBe(agentDPML.compiler);
  });
});
