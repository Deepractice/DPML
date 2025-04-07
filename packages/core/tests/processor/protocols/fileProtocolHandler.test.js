/**
 * FileProtocolHandler测试
 */
// 在顶部使用 vi.hoisted 声明mock变量
const mockFns = vi.hoisted(() => ({
    readFile: vi.fn(),
    cwd: vi.fn().mockReturnValue('/default/cwd'),
    resolve: vi.fn((...args) => args.join('/')),
    isAbsolute: vi.fn((p) => p.startsWith('/')),
    dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
    extname: vi.fn((p) => {
        const parts = p.split('.');
        return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
    })
}));
// 必须先导入 vi 和其他测试工具
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeType } from '../../../src/types/node';
// 模拟fs/promises模块
vi.mock('fs/promises', () => {
    return {
        readFile: mockFns.readFile,
        default: {
            readFile: mockFns.readFile
        }
    };
});
// 模拟path模块
vi.mock('path', () => {
    // 创建一个对象，包含所有需要模拟的方法
    const pathMock = {
        resolve: mockFns.resolve,
        dirname: mockFns.dirname,
        isAbsolute: mockFns.isAbsolute,
        extname: mockFns.extname
    };
    // 同时作为命名导出和默认导出
    return {
        ...pathMock,
        default: pathMock
    };
});
// 模拟全局process对象
const originalProcess = global.process;
global.process = {
    ...originalProcess,
    cwd: mockFns.cwd
};
// 由于ESM和CommonJS的导入方式不同，直接导入并使用模拟后的类型
import { FileProtocolHandler } from '../../../src/processor/protocols/fileProtocolHandler';
import * as path from 'path';
describe('FileProtocolHandler', () => {
    let handler;
    // 创建测试引用对象的辅助函数
    const createReference = (filePath) => ({
        type: NodeType.REFERENCE,
        protocol: 'file',
        path: filePath,
        position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 1, offset: 0 }
        }
    });
    beforeEach(() => {
        // 重置所有模拟
        vi.clearAllMocks();
        // 实例化处理器
        handler = new FileProtocolHandler({
            baseDir: '/base/dir'
        });
    });
    it('应该正确识别支持的协议', () => {
        expect(handler.canHandle('file')).toBe(true);
        expect(handler.canHandle('http')).toBe(false);
        expect(handler.canHandle('https')).toBe(false);
        expect(handler.canHandle('id')).toBe(false);
        expect(handler.canHandle('')).toBe(false);
    });
    it('应该使用正确的默认选项', () => {
        // 确保cwd模拟返回正确的值
        mockFns.cwd.mockReturnValue('/default/cwd');
        // 重置处理器使用默认选项
        const defaultHandler = new FileProtocolHandler();
        // 验证默认工作目录是当前目录
        expect(defaultHandler.baseDir).toBe('/default/cwd');
        // 自定义基础目录
        const customHandler = new FileProtocolHandler({
            baseDir: '/custom/dir'
        });
        expect(customHandler.baseDir).toBe('/custom/dir');
    });
    it('应该正确处理绝对路径文件', async () => {
        const reference = createReference('/absolute/path/file.txt');
        const mockContent = '文件内容';
        mockFns.readFile.mockResolvedValue(mockContent);
        const result = await handler.handle(reference);
        expect(path.resolve).toHaveBeenCalledWith('/absolute/path/file.txt');
        expect(mockFns.readFile).toHaveBeenCalled();
        expect(result).toBe(mockContent);
    });
    it('应该正确处理相对路径文件', async () => {
        const reference = createReference('relative/path/file.txt');
        const mockContent = '相对路径文件内容';
        mockFns.readFile.mockResolvedValue(mockContent);
        const result = await handler.handle(reference);
        // 相对路径应该相对于baseDir解析
        expect(path.resolve).toHaveBeenCalledWith('/base/dir', 'relative/path/file.txt');
        expect(mockFns.readFile).toHaveBeenCalled();
        expect(result).toBe(mockContent);
    });
    it('应该正确检测和处理JSON文件', async () => {
        const reference = createReference('data.json');
        const mockJsonContent = '{"key": "值", "items": [1, 2, 3]}';
        const expectedObject = { key: '值', items: [1, 2, 3] };
        mockFns.readFile.mockResolvedValue(mockJsonContent);
        path.extname.mockReturnValue('.json');
        const result = await handler.handle(reference);
        expect(result).toEqual(expectedObject);
    });
    it('应该处理无效JSON文件', async () => {
        const reference = createReference('invalid.json');
        const invalidJson = '{ "key": "value", invalid json }';
        mockFns.readFile.mockResolvedValue(invalidJson);
        path.extname.mockReturnValue('.json');
        await expect(handler.handle(reference)).rejects.toThrow(/无效的JSON文件/);
    });
    it('应该处理文件不存在的错误', async () => {
        const reference = createReference('not-exist.txt');
        const error = new Error('文件不存在');
        error.code = 'ENOENT';
        mockFns.readFile.mockRejectedValue(error);
        await expect(handler.handle(reference)).rejects.toThrow(/找不到文件/);
    });
    it('应该处理权限错误', async () => {
        const reference = createReference('no-permission.txt');
        const error = new Error('权限被拒绝');
        error.code = 'EACCES';
        mockFns.readFile.mockRejectedValue(error);
        await expect(handler.handle(reference)).rejects.toThrow(/无权限访问文件/);
    });
    it('应该处理其他文件系统错误', async () => {
        const reference = createReference('error.txt');
        const error = new Error('未知错误');
        mockFns.readFile.mockRejectedValue(error);
        await expect(handler.handle(reference)).rejects.toThrow(/未知错误/);
    });
    it('应该处理设置了contextPath的情况', async () => {
        // 创建带有contextPath的处理器
        const contextHandler = new FileProtocolHandler({
            baseDir: '/base/dir'
        });
        contextHandler.contextPath = '/context/path';
        const reference = createReference('relative/file.txt');
        const mockContent = '上下文路径文件内容';
        // 确保这里不返回 .json 扩展名
        mockFns.extname.mockReturnValue('.txt');
        mockFns.readFile.mockResolvedValue(mockContent);
        await contextHandler.handle(reference);
        // 相对路径应该相对于contextPath解析
        expect(path.resolve).toHaveBeenCalledWith('/context/path', 'relative/file.txt');
    });
    it('应该可以设置上下文路径', () => {
        const contextHandler = new FileProtocolHandler();
        contextHandler.setContextPath('/new/context/path');
        expect(contextHandler.contextPath).toBe('/new/context/path');
    });
});
//# sourceMappingURL=fileProtocolHandler.test.js.map