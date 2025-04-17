/**
 * ValidationResultBuilder单元测试
 */
import { describe, test, expect, beforeEach } from 'vitest';

import { ValidationResultBuilder } from '../../../../core/parser/ValidationResultBuilder';
import { ValidationErrorType } from '../../../../types';
import type { DPMLNode, SourceLocation } from '../../../../types';

describe('UT-Parser-ValidationBuilder', () => {
  let builder: ValidationResultBuilder;
  let mockNode: DPMLNode;
  let mockLocation: SourceLocation;

  beforeEach(() => {
    builder = new ValidationResultBuilder();

    // 创建模拟节点
    mockNode = {
      tagName: 'test',
      id: 'test-id',
      attributes: new Map(),
      children: [],
      content: '',
      parent: null,
      sourceLocation: {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 10,
        getLineSnippet: () => 'test line'
      },

      setId(id: string): void {
        this.id = id;
      },

      getId(): string | null {
        return this.id;
      },

      hasId(): boolean {
        return this.id !== null;
      },

      getAttributeValue(name: string): string | null {
        return this.attributes.get(name) || null;
      },

      hasAttribute(name: string): boolean {
        return this.attributes.has(name);
      },

      setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
      },

      appendChild(childNode: DPMLNode): void {
        this.children.push(childNode);
        childNode.parent = this;
      },

      removeChild(childNode: DPMLNode): void {
        const index = this.children.indexOf(childNode);

        if (index !== -1) {
          this.children.splice(index, 1);
          childNode.parent = null;
        }
      },

      hasChildren(): boolean {
        return this.children.length > 0;
      },

      hasContent(): boolean {
        return this.content !== '';
      }
    };

    mockLocation = {
      startLine: 1,
      startColumn: 1,
      endLine: 1,
      endColumn: 10,
      getLineSnippet: () => 'test line'
    };
  });

  test('should build empty result', () => {
    const result = builder.build();

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  test('should add error', () => {
    builder.addError(
      ValidationErrorType.INVALID_TAG,
      'Invalid tag',
      mockNode,
      mockLocation
    );

    const result = builder.build();

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe(ValidationErrorType.INVALID_TAG);
    expect(result.errors[0].message).toBe('Invalid tag');
    expect(result.errors[0].node).toBe(mockNode);
    expect(result.errors[0].location).toBe(mockLocation);
  });

  test('should add warning', () => {
    builder.addWarning(
      'Warning message',
      mockNode,
      mockLocation
    );

    const result = builder.build();

    expect(result.valid).toBe(true); // 警告不影响有效性
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].message).toBe('Warning message');
    expect(result.warnings[0].node).toBe(mockNode);
    expect(result.warnings[0].location).toBe(mockLocation);
  });

  test('should merge results', () => {
    // 创建第一个结果
    builder.addError(
      ValidationErrorType.INVALID_TAG,
      'Invalid tag',
      mockNode,
      mockLocation
    );

    // 创建第二个结果
    const otherBuilder = new ValidationResultBuilder();

    otherBuilder.addError(
      ValidationErrorType.MISSING_REQUIRED_ATTRIBUTE,
      'Missing attribute',
      mockNode,
      mockLocation,
      'required-attr'
    );
    otherBuilder.addWarning(
      'Warning message',
      mockNode,
      mockLocation
    );

    // 合并结果
    builder.merge(otherBuilder.build());

    const result = builder.build();

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.warnings).toHaveLength(1);
    expect(result.errors[0].type).toBe(ValidationErrorType.INVALID_TAG);
    expect(result.errors[1].type).toBe(ValidationErrorType.MISSING_REQUIRED_ATTRIBUTE);
    expect(result.warnings[0].message).toBe('Warning message');
  });

  test('should check for errors and warnings', () => {
    expect(builder.hasErrors()).toBe(false);
    expect(builder.hasWarnings()).toBe(false);
    expect(builder.getErrorCount()).toBe(0);
    expect(builder.getWarningCount()).toBe(0);

    builder.addError(
      ValidationErrorType.INVALID_TAG,
      'Invalid tag',
      mockNode,
      mockLocation
    );

    expect(builder.hasErrors()).toBe(true);
    expect(builder.hasWarnings()).toBe(false);
    expect(builder.getErrorCount()).toBe(1);
    expect(builder.getWarningCount()).toBe(0);

    builder.addWarning(
      'Warning message',
      mockNode,
      mockLocation
    );

    expect(builder.hasErrors()).toBe(true);
    expect(builder.hasWarnings()).toBe(true);
    expect(builder.getErrorCount()).toBe(1);
    expect(builder.getWarningCount()).toBe(1);
  });

  test('should clear errors and warnings', () => {
    builder.addError(
      ValidationErrorType.INVALID_TAG,
      'Invalid tag',
      mockNode,
      mockLocation
    );
    builder.addWarning(
      'Warning message',
      mockNode,
      mockLocation
    );

    expect(builder.hasErrors()).toBe(true);
    expect(builder.hasWarnings()).toBe(true);

    builder.clear();

    expect(builder.hasErrors()).toBe(false);
    expect(builder.hasWarnings()).toBe(false);
    expect(builder.getErrorCount()).toBe(0);
    expect(builder.getWarningCount()).toBe(0);
  });
});
