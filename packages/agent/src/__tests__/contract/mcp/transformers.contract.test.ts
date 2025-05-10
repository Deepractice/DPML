import { describe, test, expect } from 'vitest';
import { transformers, mcpTransformer } from '../../../config/transformers';
import type { Transformer } from '@dpml/core';
import type { AgentConfig } from '../../../types/AgentConfig';

/**
 * MCP转换器契约测试
 */
describe('CT-MCP-Transformer', () => {
  test('CT-MCP-Trans-01: mcpTransformer应实现Transformer接口', () => {
    // 验证mcpTransformer是否符合Transformer接口
    expect(typeof mcpTransformer).toBe('object');
    expect(typeof mcpTransformer.name).toBe('string');
    expect(typeof mcpTransformer.transform).toBe('function');
  });

  test('CT-MCP-Trans-02: mcpTransformer应定义正确的名称', () => {
    // 验证转换器名称
    expect(mcpTransformer.name).toBe('mcpTransformer');
  });

  test('CT-MCP-Trans-03: mcpTransformer应定义正确的选择器', () => {
    // 通过转换器对象获取选择器信息
    const transformer = mcpTransformer as any;
    const rules = transformer.rules || [];
    
    // 查找包含mcp-servers选择器的规则
    const mcpRule = rules.find((rule: any) => 
      rule.selector && rule.selector.includes('mcp-servers')
    );
    
    expect(mcpRule).toBeDefined();
    expect(mcpRule.selector).toContain('agent > mcp-servers');
    expect(mcpRule.targetPath).toBe('mcpServers');
  });

  test('CT-MCP-Trans-04: transformers导出应包含MCP转换器', () => {
    // 验证transformers数组是否包含mcpTransformer
    const included = transformers.some(t => t === mcpTransformer);
    expect(included).toBe(true);
  });
}); 