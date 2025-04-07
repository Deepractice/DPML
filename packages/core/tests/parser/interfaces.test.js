import { describe, it, expect } from 'vitest';
import { NodeType } from '../../src/types';
describe('解析器接口', () => {
    describe('ParseOptions 接口', () => {
        it('应该具有正确的可选属性', () => {
            const options = {
                allowUnknownTags: true,
                tolerant: false,
                preserveComments: true,
                mode: 'strict',
                processInheritance: false
            };
            expect(options.allowUnknownTags).toBe(true);
            expect(options.tolerant).toBe(false);
            expect(options.preserveComments).toBe(true);
            expect(options.mode).toBe('strict');
            expect(options.processInheritance).toBe(false);
        });
    });
    describe('ParseResult 接口', () => {
        it('应该具有正确的属性', () => {
            const mockDocument = {
                type: NodeType.DOCUMENT,
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 10, column: 1, offset: 100 }
                },
                children: []
            };
            const result = {
                ast: mockDocument,
                errors: [],
                warnings: []
            };
            expect(result.ast).toBe(mockDocument);
            expect(Array.isArray(result.errors)).toBe(true);
            expect(Array.isArray(result.warnings)).toBe(true);
        });
    });
    describe('ValidationResult 接口', () => {
        it('应该具有正确的属性', () => {
            const result = {
                valid: true,
                errors: [],
                warnings: []
            };
            expect(result.valid).toBe(true);
            expect(Array.isArray(result.errors)).toBe(true);
            expect(Array.isArray(result.warnings)).toBe(true);
        });
    });
    describe('DPMLParser 接口', () => {
        it('应该有解析和验证方法', async () => {
            // 创建一个模拟解析器，只检查接口定义
            const mockParser = {
                parse: async (input, options) => {
                    return {
                        ast: {
                            type: NodeType.DOCUMENT,
                            position: {
                                start: { line: 1, column: 1, offset: 0 },
                                end: { line: 10, column: 1, offset: 100 }
                            },
                            children: []
                        },
                        errors: [],
                        warnings: []
                    };
                },
                validate: (ast) => {
                    return {
                        valid: true,
                        errors: [],
                        warnings: []
                    };
                }
            };
            // 检验解析器接口实现
            const result = await mockParser.parse('<root></root>');
            expect(result.ast).toBeDefined();
            expect(result.ast.type).toBe(NodeType.DOCUMENT);
            const validationResult = mockParser.validate(result.ast);
            expect(validationResult.valid).toBe(true);
        });
    });
});
//# sourceMappingURL=interfaces.test.js.map