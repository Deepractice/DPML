import { MockFileSystem, MockFileSystemOptions } from '../mocks/file-system';

/**
 * 创建模拟文件系统
 * 
 * @param initialFiles 初始文件结构
 * @param options 其他选项
 * @returns 模拟文件系统实例
 */
export function createMockFileSystem(
  initialFiles?: Record<string, string | Buffer | null>,
  options: Omit<MockFileSystemOptions, 'initialFiles'> = {}
): MockFileSystem {
  return new MockFileSystem({
    initialFiles,
    ...options
  });
}
