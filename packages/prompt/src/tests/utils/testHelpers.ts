/**
 * 测试辅助函数
 */
import { expect } from 'vitest';

/**
 * 创建简单的有效 DPML 提示文本
 */
export function createSimplePrompt(): string {
  return `
<prompt id="test-prompt" version="1.0" lang="zh-CN">
  <role>
    你是一个专业的数据分析师
  </role>
  <context>
    用户需要分析销售数据
  </context>
  <thinking>
    分析数据时需要考虑多种因素
  </thinking>
  <executing>
    1. 了解数据结构
    2. 进行探索性分析
    3. 得出结论
  </executing>
  <testing>
    确保分析结果准确可靠
  </testing>
  <protocol>
    使用清晰的语言和适当的图表
  </protocol>
  <custom>
    自定义内容
  </custom>
</prompt>
  `;
}

/**
 * 创建带有特定标签的 DPML 提示
 */
export function createPromptWithTag(tagName: string, content: string): string {
  return `
<prompt id="test-prompt" version="1.0">
  <${tagName}>
    ${content}
  </${tagName}>
</prompt>
  `;
}

/**
 * 创建带有继承的 DPML 提示
 */
export function createPromptWithExtends(sourceId: string): string {
  return `
<prompt id="extended-prompt" extends="${sourceId}">
  <role>
    扩展的角色定义
  </role>
</prompt>
  `;
}

/**
 * 断言两个对象具有相同的属性值
 */
export function expectObjectsToHaveSameProps(
  actual: Record<string, any>,
  expected: Record<string, any>
): void {
  Object.keys(expected).forEach(key => {
    expect(actual[key]).toEqual(expected[key]);
  });
}
