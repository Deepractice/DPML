/**
 * 测试跨平台文件引用处理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultProcessor } from '../../src/processor/defaultProcessor';
import { DefaultReferenceResolver } from '../../src/processor/defaultReferenceResolver';
import { FileProtocolHandler } from '../../src/processor/protocols/fileProtocolHandler';
import { NodeType } from '../../src/types/node';
import { PlatformType } from '../../src/utils/pathUtils';
import * as pathUtils from '../../src/utils/pathUtils';
// 模拟文件系统
vi.mock('fs', async () => {
    return {
        promises: {
            readFile: vi.fn(async (path) => {
                // 模拟文件内容
                if (path.includes('windows-file.xml') || path.includes('windows-file')) {
                    return `<root>
  <element id="windows-content">Windows格式文件内容</element>
</root>`;
                }
                if (path.includes('unix-file.xml') || path.includes('unix-file')) {
                    return `<root>
  <element id="unix-content">Unix格式文件内容</element>
</root>`;
                }
                throw new Error(`文件不存在: ${path}`);
            }),
            access: vi.fn(async () => true) // 假设所有文件都存在
        }
    };
});
describe('跨平台文件引用处理', () => {
    let processor;
    let originalConvertPathForPlatform;
    beforeEach(() => {
        // 保存原始函数
        originalConvertPathForPlatform = pathUtils.convertPathForPlatform;
        // 创建处理器和引用解析器
        const referenceResolver = new DefaultReferenceResolver();
        referenceResolver.registerProtocolHandler('file', new FileProtocolHandler());
        processor = new DefaultProcessor({
            visitors: [],
            options: {
                referenceResolver
            }
        });
    });
    afterEach(() => {
        // 恢复原始函数
        vi.mocked(pathUtils.convertPathForPlatform).mockRestore();
        vi.restoreAllMocks();
    });
    it('应该处理Windows格式的文件路径引用', async () => {
        // 模拟convertPathForPlatform函数来模拟Windows环境
        vi.spyOn(pathUtils, 'convertPathForPlatform').mockImplementation((path, platform) => {
            if (platform === PlatformType.WINDOWS) {
                return path.replace(/\//g, '\\');
            }
            return path;
        });
        // 创建测试文档，包含Windows格式的文件引用
        const document = {
            type: NodeType.DOCUMENT,
            children: [
                {
                    type: NodeType.ELEMENT,
                    attributes: {},
                    children: [
                        {
                            type: NodeType.ELEMENT,
                            attributes: {
                                src: 'file:C:\\Path\\To\\windows-file.xml'
                            },
                            children: [],
                            position: {
                                start: { line: 2, column: 1, offset: 20 },
                                end: { line: 2, column: 60, offset: 79 }
                            }
                        }
                    ],
                    position: {
                        start: { line: 1, column: 1, offset: 0 },
                        end: { line: 3, column: 1, offset: 80 }
                    }
                }
            ],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 80 }
            }
        };
        // 处理文档
        const result = await processor.process(document, 'test-document.xml');
        // 验证结果，应该成功解析Windows格式路径的文件内容
        const rootElement = result.children[0];
        expect(rootElement.children.length).toBeGreaterThan(0);
        // 查找是否包含Windows文件的内容
        let hasWindowsContent = false;
        const findWindowsContent = (element) => {
            if (element.attributes && element.attributes.id === 'windows-content') {
                hasWindowsContent = true;
                return;
            }
            if (element.children) {
                for (const child of element.children) {
                    if (child.type === NodeType.ELEMENT) {
                        findWindowsContent(child);
                    }
                }
            }
        };
        findWindowsContent(rootElement);
        expect(hasWindowsContent).toBe(true);
    });
    it('应该处理Unix格式的文件路径引用', async () => {
        // 创建测试文档，包含Unix格式的文件引用
        const document = {
            type: NodeType.DOCUMENT,
            children: [
                {
                    type: NodeType.ELEMENT,
                    attributes: {},
                    children: [
                        {
                            type: NodeType.ELEMENT,
                            attributes: {
                                src: 'file:/path/to/unix-file.xml'
                            },
                            children: [],
                            position: {
                                start: { line: 2, column: 1, offset: 20 },
                                end: { line: 2, column: 50, offset: 69 }
                            }
                        }
                    ],
                    position: {
                        start: { line: 1, column: 1, offset: 0 },
                        end: { line: 3, column: 1, offset: 70 }
                    }
                }
            ],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 70 }
            }
        };
        // 处理文档
        const result = await processor.process(document, 'test-document.xml');
        // 验证结果，应该成功解析Unix格式路径的文件内容
        const rootElement = result.children[0];
        expect(rootElement.children.length).toBeGreaterThan(0);
        // 查找是否包含Unix文件的内容
        let hasUnixContent = false;
        const findUnixContent = (element) => {
            if (element.attributes && element.attributes.id === 'unix-content') {
                hasUnixContent = true;
                return;
            }
            if (element.children) {
                for (const child of element.children) {
                    if (child.type === NodeType.ELEMENT) {
                        findUnixContent(child);
                    }
                }
            }
        };
        findUnixContent(rootElement);
        expect(hasUnixContent).toBe(true);
    });
    it('应该在跨平台环境中正确处理相对路径引用', async () => {
        // 创建测试文档，包含相对路径引用
        const document = {
            type: NodeType.DOCUMENT,
            children: [
                {
                    type: NodeType.ELEMENT,
                    attributes: {},
                    children: [
                        {
                            type: NodeType.ELEMENT,
                            attributes: {
                                src: 'file:./relative/path/to/unix-file'
                            },
                            children: [],
                            position: {
                                start: { line: 2, column: 1, offset: 20 },
                                end: { line: 2, column: 60, offset: 79 }
                            }
                        }
                    ],
                    position: {
                        start: { line: 1, column: 1, offset: 0 },
                        end: { line: 3, column: 1, offset: 80 }
                    }
                }
            ],
            position: {
                start: { line: 1, column: 1, offset: 0 },
                end: { line: 3, column: 1, offset: 80 }
            }
        };
        // 处理文档
        const result = await processor.process(document, 'test-document.xml');
        // 验证结果，应该成功解析相对路径的文件内容
        const rootElement = result.children[0];
        expect(rootElement.children.length).toBeGreaterThan(0);
        // 查找是否包含Unix文件的内容
        let hasUnixContent = false;
        const findUnixContent = (element) => {
            if (element.attributes && element.attributes.id === 'unix-content') {
                hasUnixContent = true;
                return;
            }
            if (element.children) {
                for (const child of element.children) {
                    if (child.type === NodeType.ELEMENT) {
                        findUnixContent(child);
                    }
                }
            }
        };
        findUnixContent(rootElement);
        expect(hasUnixContent).toBe(true);
    });
});
//# sourceMappingURL=crossPlatformReference.test.js.map