/**
 * 错误处理测试
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProcessingError, ErrorSeverity } from '../../../src/processor/errors/processingError';
import { ErrorHandler } from '../../../src/processor/errors/errorHandler';
import { ProcessingContext } from '../../../src/processor/processingContext';
import { NodeType } from '../../../src/types/node';
describe('ProcessingError', () => {
    it('应该正确初始化处理错误', () => {
        const error = new ProcessingError({
            message: '测试错误',
            code: 'TEST_ERROR',
            severity: ErrorSeverity.ERROR
        });
        expect(error.message).toBe('测试错误');
        expect(error.code).toBe('TEST_ERROR');
        expect(error.severity).toBe(ErrorSeverity.ERROR);
        expect(error.name).toBe('ProcessingError');
    });
    it('应该能够转换错误级别', () => {
        const error = new ProcessingError({
            message: '测试错误',
            severity: ErrorSeverity.WARNING
        });
        expect(error.severity).toBe(ErrorSeverity.WARNING);
        error.asError();
        expect(error.severity).toBe(ErrorSeverity.ERROR);
        error.asFatal();
        expect(error.severity).toBe(ErrorSeverity.FATAL);
        error.asWarning();
        expect(error.severity).toBe(ErrorSeverity.WARNING);
    });
    it('应该能够判断错误是否致命', () => {
        const warning = new ProcessingError({
            message: '警告',
            severity: ErrorSeverity.WARNING
        });
        const error = new ProcessingError({
            message: '错误',
            severity: ErrorSeverity.ERROR
        });
        const fatal = new ProcessingError({
            message: '致命错误',
            severity: ErrorSeverity.FATAL
        });
        expect(warning.isFatal()).toBe(false);
        expect(error.isFatal()).toBe(false);
        expect(fatal.isFatal()).toBe(true);
    });
    it('应该生成格式化的错误消息', () => {
        const error = new ProcessingError({
            message: '测试错误',
            code: 'TEST_ERROR',
            severity: ErrorSeverity.ERROR,
            filePath: 'test.xml',
            position: {
                start: { line: 10, column: 5, offset: 100 },
                end: { line: 10, column: 10, offset: 105 }
            }
        });
        const formatted = error.getFormattedMessage();
        expect(formatted).toContain('ERROR');
        expect(formatted).toContain('TEST_ERROR');
        expect(formatted).toContain('测试错误');
        expect(formatted).toContain('test.xml');
        expect(formatted).toContain('第10行');
        expect(formatted).toContain('第5列');
    });
});
describe('ErrorHandler', () => {
    let onError;
    let onWarning;
    let errorHandler;
    let context;
    let mockDocument;
    beforeEach(() => {
        onError = vi.fn();
        onWarning = vi.fn();
        errorHandler = new ErrorHandler({
            strictMode: false,
            errorRecovery: false,
            onError,
            onWarning
        });
        // 创建一个基本的Document
        mockDocument = {
            type: NodeType.DOCUMENT,
            children: [],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 10, offset: 9 }
            }
        };
        context = new ProcessingContext(mockDocument, 'test.xml');
    });
    it('应该正确设置和获取状态', () => {
        expect(errorHandler.isStrictMode()).toBe(false);
        expect(errorHandler.isErrorRecoveryEnabled()).toBe(false);
        errorHandler.setStrictMode(true);
        expect(errorHandler.isStrictMode()).toBe(true);
        errorHandler.setErrorRecovery(true);
        expect(errorHandler.isErrorRecoveryEnabled()).toBe(true);
    });
    it('严格模式下应该将错误升级为致命错误', () => {
        errorHandler.setStrictMode(true);
        expect(() => {
            errorHandler.handleError('测试错误');
        }).toThrow(ProcessingError);
        expect(onError).toHaveBeenCalled();
        const error = onError.mock.calls[0][0];
        expect(error.severity).toBe(ErrorSeverity.FATAL);
    });
    it('警告应该调用警告回调但不抛出异常', () => {
        errorHandler.handleWarning('测试警告');
        expect(onWarning).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        const warning = onWarning.mock.calls[0][0];
        expect(warning.severity).toBe(ErrorSeverity.WARNING);
    });
    it('启用错误恢复时不应抛出非致命错误', () => {
        errorHandler.setErrorRecovery(true);
        // 不应抛出错误
        errorHandler.handleError('测试错误');
        expect(onError).toHaveBeenCalled();
        const error = onError.mock.calls[0][0];
        expect(error.severity).toBe(ErrorSeverity.ERROR);
    });
    it('致命错误总是抛出，即使启用了错误恢复', () => {
        errorHandler.setErrorRecovery(true);
        expect(() => {
            errorHandler.handleFatalError('致命错误');
        }).toThrow(ProcessingError);
        expect(onError).toHaveBeenCalled();
        const error = onError.mock.calls[0][0];
        expect(error.severity).toBe(ErrorSeverity.FATAL);
    });
    it('应该根据上下文和元素的mode属性决定错误处理方式', () => {
        // 创建测试元素
        const strictElement = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { mode: 'strict' },
            children: [],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 20, offset: 19 }
            }
        };
        const looseElement = {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: { mode: 'loose' },
            children: [],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 20, offset: 19 }
            }
        };
        // 使用元素上的strict模式
        context.documentMode = undefined;
        const isStrictFromElement = errorHandler.getModeFromContext(context, strictElement);
        expect(isStrictFromElement).toBe(true);
        // 使用元素上的loose模式
        const isLooseFromElement = errorHandler.getModeFromContext(context, looseElement);
        expect(isLooseFromElement).toBe(false);
        // 使用上下文的模式
        context.documentMode = 'strict';
        const isStrictFromContext = errorHandler.getModeFromContext(context);
        expect(isStrictFromContext).toBe(true);
        context.documentMode = 'loose';
        const isLooseFromContext = errorHandler.getModeFromContext(context);
        expect(isLooseFromContext).toBe(false);
        // 使用处理器默认模式
        context.documentMode = undefined;
        const usesDefaultMode = errorHandler.getModeFromContext(context);
        expect(usesDefaultMode).toBe(false);
    });
    it('处理带上下文的错误，根据模式决定行为', () => {
        // 在宽松模式下，错误应该被当作警告处理
        context.documentMode = 'loose';
        errorHandler.handleErrorWithContext('测试错误', {
            type: NodeType.ELEMENT,
            tagName: 'test',
            attributes: {},
            children: [],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 1, column: 10, offset: 9 }
            }
        }, context);
        expect(onWarning).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        // 重置mock
        onWarning.mockReset();
        onError.mockReset();
        // 在严格模式下，错误应该被正常处理
        context.documentMode = 'strict';
        expect(() => {
            errorHandler.handleErrorWithContext('测试错误', {
                type: NodeType.ELEMENT,
                tagName: 'test',
                attributes: {},
                children: [],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 10, offset: 9 }
                }
            }, context);
        }).toThrow(ProcessingError);
        expect(onWarning).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
    });
});
//# sourceMappingURL=error-handling.test.js.map