/**
 * 解析错误类型测试
 */
import { describe, test, expect } from 'vitest';

import { createSuccessResult, createErrorResult } from '../../../../core/parsing/errors';
import { ParseError, XMLParseError, DPMLParseError, ParseErrorCode } from '../../../../types';
import type { SourceLocation } from '../../../../types';

describe('解析错误类型', () => {
  test('基础ParseError应正确创建和格式化', () => {
    // 准备
    const message = '测试错误消息';
    const code = ParseErrorCode.INVALID_CONTENT;
    const position: SourceLocation = {
      startLine: 10,
      startColumn: 5,
      endLine: 10,
      endColumn: 15,
      fileName: 'test.dpml'
    };
    const source = '<root><invalid>';

    // 执行
    const error = new ParseError(message, code, position, source);

    // 断言
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ParseError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.position).toBe(position);
    expect(error.source).toBe(source);

    // 验证格式化消息
    const formattedMessage = error.formatMessage();

    expect(formattedMessage).toContain(message);
    expect(formattedMessage).toContain(code);
    expect(formattedMessage).toContain('test.dpml:10:5');
    expect(formattedMessage).toContain(source);
  });

  test('XMLParseError应正确从原始错误创建', () => {
    // 准备
    const originalError = new Error('XML语法错误: 未闭合的标签');
    const content = '<root><child></root>';

    // 执行
    const error = XMLParseError.fromError(originalError, content, 'test.xml');

    // 断言
    expect(error).toBeInstanceOf(XMLParseError);
    expect(error.message).toBe(originalError.message);
    expect(error.cause).toBe(originalError);
    expect(error.source).toBeDefined();
  });

  test('DPMLParseError应正确创建特定错误类型', () => {
    // 准备
    const position: SourceLocation = {
      startLine: 5,
      startColumn: 10,
      endLine: 5,
      endColumn: 20,
      fileName: 'test.dpml'
    };

    // 执行 - 测试缺少必需标签错误
    const missingTagError = DPMLParseError.createMissingRequiredTagError('role', position);

    // 断言
    expect(missingTagError).toBeInstanceOf(DPMLParseError);
    expect(missingTagError.code).toBe(ParseErrorCode.DPML_MISSING_REQUIRED_TAG);
    expect(missingTagError.message).toContain('role');
    expect(missingTagError.position).toBe(position);

    // 执行 - 测试缺少必需属性错误
    const missingAttrError = DPMLParseError.createMissingRequiredAttributeError('id', 'prompt', position);

    // 断言
    expect(missingAttrError).toBeInstanceOf(DPMLParseError);
    expect(missingAttrError.code).toBe(ParseErrorCode.DPML_MISSING_REQUIRED_ATTRIBUTE);
    expect(missingAttrError.message).toContain('id');
    expect(missingAttrError.message).toContain('prompt');
    expect(missingAttrError.position).toBe(position);

    // 执行 - 测试无效标签错误
    const invalidTagError = DPMLParseError.createInvalidTagError('unknown-tag', position);

    // 断言
    expect(invalidTagError).toBeInstanceOf(DPMLParseError);
    expect(invalidTagError.code).toBe(ParseErrorCode.DPML_INVALID_TAG);
    expect(invalidTagError.message).toContain('unknown-tag');
    expect(invalidTagError.position).toBe(position);

    // 执行 - 测试无效属性错误
    const invalidAttrError = DPMLParseError.createInvalidAttributeError('invalid-attr', 'prompt', position);

    // 断言
    expect(invalidAttrError).toBeInstanceOf(DPMLParseError);
    expect(invalidAttrError.code).toBe(ParseErrorCode.DPML_INVALID_ATTRIBUTE);
    expect(invalidAttrError.message).toContain('invalid-attr');
    expect(invalidAttrError.message).toContain('prompt');
    expect(invalidAttrError.position).toBe(position);
  });

  test('ParseResult应正确创建成功和错误结果', () => {
    // 准备
    const data = { result: 'success' };
    const error = new ParseError('测试错误');
    const warnings = [
      new ParseError('警告1'),
      new ParseError('警告2')
    ];

    // 执行 - 测试成功结果
    const successResult = createSuccessResult(data, warnings);

    // 断言
    expect(successResult.success).toBe(true);
    expect(successResult.data).toBe(data);
    expect(successResult.warnings).toEqual(warnings);
    expect(successResult.error).toBeUndefined();

    // 执行 - 测试成功结果（无警告）
    const successNoWarnings = createSuccessResult(data);

    // 断言
    expect(successNoWarnings.success).toBe(true);
    expect(successNoWarnings.data).toBe(data);
    expect(successNoWarnings.warnings).toBeUndefined();

    // 执行 - 测试错误结果
    const errorResult = createErrorResult(error);

    // 断言
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBe(error);
    expect(errorResult.data).toBeUndefined();
    expect(errorResult.warnings).toBeUndefined();
  });
});
