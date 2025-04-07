/**
 * 路径处理工具测试
 */
import { describe, it, expect } from 'vitest';
import { normalizePath, convertPathForPlatform, isAbsolutePath, resolveRelativePath, getFileName, getDirName, getExtension, pathToFileUrl, PlatformType } from '../../src/utils/pathUtils';
describe('路径处理工具测试', () => {
    describe('normalizePath', () => {
        it('应该标准化Windows路径', () => {
            const winPath = 'C:\\Users\\test\\Documents\\file.txt';
            const normalized = normalizePath(winPath);
            // 根据当前平台，路径可能有不同的分隔符，但内容应该一致
            expect(normalized.includes('Users')).toBe(true);
            expect(normalized.includes('test')).toBe(true);
            expect(normalized.includes('Documents')).toBe(true);
            expect(normalized.includes('file.txt')).toBe(true);
        });
        it('应该标准化UNIX路径', () => {
            const unixPath = '/home/user/documents/file.txt';
            const normalized = normalizePath(unixPath);
            expect(normalized.includes('home')).toBe(true);
            expect(normalized.includes('user')).toBe(true);
            expect(normalized.includes('documents')).toBe(true);
            expect(normalized.includes('file.txt')).toBe(true);
        });
        it('应该保留HTTP URL不变', () => {
            const url = 'https://example.com/path/to/file.txt';
            expect(normalizePath(url)).toBe(url);
        });
        it('应该处理file协议URL', () => {
            const fileUrl = 'file:///home/user/file.txt';
            const normalized = normalizePath(fileUrl);
            expect(normalized.includes('home')).toBe(true);
            expect(normalized.includes('user')).toBe(true);
            expect(normalized.includes('file.txt')).toBe(true);
            expect(normalized.startsWith('file://')).toBe(false);
        });
    });
    describe('convertPathForPlatform', () => {
        it('应该将路径转换为Windows格式', () => {
            const unixPath = '/home/user/documents/file.txt';
            const winPath = convertPathForPlatform(unixPath, PlatformType.WINDOWS);
            expect(winPath.includes('\\')).toBe(true);
            expect(winPath.includes('/')).toBe(false);
        });
        it('应该将路径转换为UNIX格式', () => {
            const winPath = 'C:\\Users\\test\\Documents\\file.txt';
            const unixPath = convertPathForPlatform(winPath, PlatformType.UNIX);
            expect(unixPath.includes('/')).toBe(true);
            expect(unixPath.includes('\\')).toBe(false);
        });
        it('应该保留HTTP URL不变', () => {
            const url = 'https://example.com/path/to/file.txt';
            expect(convertPathForPlatform(url, PlatformType.WINDOWS)).toBe(url);
            expect(convertPathForPlatform(url, PlatformType.UNIX)).toBe(url);
        });
    });
    describe('isAbsolutePath', () => {
        it('应该识别Windows绝对路径', () => {
            expect(isAbsolutePath('C:\\Users\\test\\file.txt')).toBe(true);
            expect(isAbsolutePath('D:\\Program Files\\app.exe')).toBe(true);
        });
        it('应该识别UNIX绝对路径', () => {
            expect(isAbsolutePath('/home/user/file.txt')).toBe(true);
            expect(isAbsolutePath('/var/www/html/index.html')).toBe(true);
        });
        it('应该识别URL格式的绝对路径', () => {
            expect(isAbsolutePath('https://example.com/file.txt')).toBe(true);
            expect(isAbsolutePath('http://localhost:8080/index.html')).toBe(true);
            expect(isAbsolutePath('file:///home/user/file.txt')).toBe(true);
        });
        it('应该识别相对路径', () => {
            expect(isAbsolutePath('file.txt')).toBe(false);
            expect(isAbsolutePath('./file.txt')).toBe(false);
            expect(isAbsolutePath('../directory/file.txt')).toBe(false);
        });
    });
    describe('resolveRelativePath', () => {
        it('应该解析相对于文件的相对路径', () => {
            const basePath = '/home/user/documents/base.txt';
            const relativePath = '../images/image.jpg';
            const resolved = resolveRelativePath(basePath, relativePath);
            expect(resolved.includes('home')).toBe(true);
            expect(resolved.includes('user')).toBe(true);
            expect(resolved.includes('images')).toBe(true);
            expect(resolved.includes('image.jpg')).toBe(true);
            expect(resolved.includes('documents')).toBe(false);
        });
        it('应该解析相对于目录的相对路径', () => {
            const baseDir = '/home/user/documents/';
            const relativePath = 'subdirectory/file.txt';
            const resolved = resolveRelativePath(baseDir, relativePath);
            expect(resolved.includes('home')).toBe(true);
            expect(resolved.includes('user')).toBe(true);
            expect(resolved.includes('documents')).toBe(true);
            expect(resolved.includes('subdirectory')).toBe(true);
            expect(resolved.includes('file.txt')).toBe(true);
        });
        it('应该解析HTTP URL的相对路径', () => {
            const baseUrl = 'https://example.com/path/to/page.html';
            const relativePath = '../images/image.jpg';
            const resolved = resolveRelativePath(baseUrl, relativePath);
            expect(resolved).toBe('https://example.com/path/images/image.jpg');
        });
        it('应该保留绝对路径不变', () => {
            const basePath = '/home/user/documents/';
            const absolutePath = '/var/www/html/index.html';
            const resolved = resolveRelativePath(basePath, absolutePath);
            expect(resolved).toBe(absolutePath);
        });
    });
    describe('getFileName', () => {
        it('应该获取本地文件的文件名', () => {
            expect(getFileName('/home/user/file.txt')).toBe('file.txt');
            expect(getFileName('C:\\Users\\test\\file.txt')).toBe('file.txt');
        });
        it('应该获取URL的文件名', () => {
            expect(getFileName('https://example.com/path/to/file.txt')).toBe('file.txt');
            expect(getFileName('https://example.com/path/to/file.txt?query=value')).toBe('file.txt');
        });
    });
    describe('getDirName', () => {
        it('应该获取本地文件的目录名', () => {
            const unixPath = '/home/user/documents/file.txt';
            expect(getDirName(unixPath)).toBe('/home/user/documents');
            const winPath = 'C:\\Users\\test\\Documents\\file.txt';
            const dirName = getDirName(winPath);
            expect(dirName.includes('Users')).toBe(true);
            expect(dirName.includes('test')).toBe(true);
            expect(dirName.includes('Documents')).toBe(true);
            expect(dirName.includes('file.txt')).toBe(false);
        });
        it('应该获取URL的目录名', () => {
            expect(getDirName('https://example.com/path/to/file.txt')).toBe('https://example.com/path/to');
        });
    });
    describe('getExtension', () => {
        it('应该获取文件的扩展名', () => {
            expect(getExtension('/home/user/file.txt')).toBe('.txt');
            expect(getExtension('C:\\Users\\test\\file.jpg')).toBe('.jpg');
            expect(getExtension('https://example.com/file.html')).toBe('.html');
        });
        it('应该处理没有扩展名的文件', () => {
            expect(getExtension('/home/user/README')).toBe('');
            expect(getExtension('C:\\Users\\test\\LICENSE')).toBe('');
        });
    });
    describe('pathToFileUrl', () => {
        it('应该将本地路径转换为file URL', () => {
            const unixPath = '/home/user/file.txt';
            const fileUrl = pathToFileUrl(unixPath);
            expect(fileUrl.startsWith('file://')).toBe(true);
            expect(fileUrl.includes('home')).toBe(true);
            expect(fileUrl.includes('user')).toBe(true);
            expect(fileUrl.includes('file.txt')).toBe(true);
        });
        it('应该保留现有URL不变', () => {
            const url = 'https://example.com/file.txt';
            expect(pathToFileUrl(url)).toBe(url);
            const existingFileUrl = 'file:///home/user/file.txt';
            expect(pathToFileUrl(existingFileUrl)).toBe(existingFileUrl);
        });
    });
});
//# sourceMappingURL=pathUtils.test.js.map