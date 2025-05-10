import type { DocumentSchema } from '@dpml/core';
import { describe, test, expect } from 'vitest';

import { schema } from '../../../config/schema';

/**
 * MCP Schema契约测试
 */
describe('CT-MCP-Schema', () => {
  // 将schema转换为DocumentSchema类型
  const documentSchema = schema as DocumentSchema;

  test('CT-MCP-Schema-01: Schema应包含mcp-servers元素定义', () => {
    // 在agent根元素子元素中查找mcp-servers引用
    const rootElement = documentSchema.root;

    // 确保root是ElementSchema而非字符串或TypeReference
    if (typeof rootElement !== 'string' && 'children' in rootElement) {
      const childrenElements = rootElement.children?.elements || [];

      // 查找mcp-servers引用
      const mcpServersRef = childrenElements.find(e => '$ref' in e && e.$ref === 'mcp-servers');

      expect(mcpServersRef).toBeDefined();
    }
  });

  test('CT-MCP-Schema-02: Schema应定义mcp-servers类型', () => {
    // 在types中查找mcp-servers元素定义
    const types = documentSchema.types || [];
    const mcpServersType = types.find(t => t.element === 'mcp-servers');

    expect(mcpServersType).toBeDefined();
    expect(mcpServersType?.children?.elements).toBeDefined();

    // 验证mcp-servers包含mcp-server子元素引用
    const childElements = mcpServersType?.children?.elements || [];
    const mcpServerRef = childElements.find(e => '$ref' in e && e.$ref === 'mcp-server');

    expect(mcpServerRef).toBeDefined();
  });

  test('CT-MCP-Schema-03: Schema应定义mcp-server类型及其属性', () => {
    // 在types中查找mcp-server元素定义
    const types = documentSchema.types || [];
    const mcpServerType = types.find(t => t.element === 'mcp-server');

    expect(mcpServerType).toBeDefined();

    // 获取属性列表
    const attributes = mcpServerType?.attributes || [];

    // 验证必要属性
    const nameAttr = attributes.find(a => a.name === 'name');

    expect(nameAttr).toBeDefined();
    expect(nameAttr?.required).toBe(true);

    // 验证可选属性
    const typeAttr = attributes.find(a => a.name === 'type');

    expect(typeAttr).toBeDefined();
    expect(typeAttr?.enum).toContain('http');
    expect(typeAttr?.enum).toContain('stdio');

    const enabledAttr = attributes.find(a => a.name === 'enabled');

    expect(enabledAttr).toBeDefined();
    expect(enabledAttr?.type).toBe('boolean');
    expect(enabledAttr?.default).toBe('true');

    // 验证传输相关属性
    expect(attributes.find(a => a.name === 'url')).toBeDefined();
    expect(attributes.find(a => a.name === 'command')).toBeDefined();
    expect(attributes.find(a => a.name === 'args')).toBeDefined();
  });
});
