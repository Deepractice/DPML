import { EventEmitter } from 'events';
import * as path from 'path';

/**
 * 文件系统条目类型
 */
export type FileSystemEntryType = 'file' | 'directory';

/**
 * 文件系统条目接口
 */
export interface FileSystemEntry {
  /**
   * 条目名称
   */
  name: string;

  /**
   * 条目类型
   */
  type: FileSystemEntryType;

  /**
   * 创建时间
   */
  createdAt: Date;

  /**
   * 修改时间
   */
  modifiedAt: Date;

  /**
   * 大小（仅文件）
   */
  size?: number;

  /**
   * 内容（仅文件）
   */
  content?: string | Buffer;

  /**
   * 子条目（仅目录）
   */
  children?: Record<string, FileSystemEntry>;
}

/**
 * 文件系统事件类型
 */
export type FileSystemEventType = 'create' | 'update' | 'delete' | 'rename';

/**
 * 文件系统事件接口
 */
export interface FileSystemEvent {
  /**
   * 事件类型
   */
  type: FileSystemEventType;

  /**
   * 事件路径
   */
  path: string;

  /**
   * 新路径（仅重命名事件）
   */
  newPath?: string;

  /**
   * 相关条目
   */
  entry: FileSystemEntry;
}

/**
 * 模拟文件系统选项
 */
export interface MockFileSystemOptions {
  /**
   * 初始文件结构
   */
  initialFiles?: Record<string, string | Buffer>;

  /**
   * 是否区分大小写
   */
  caseSensitive?: boolean;

  /**
   * 根目录名称
   */
  rootName?: string;
}

/**
 * 模拟文件系统实现
 */
export class MockFileSystem extends EventEmitter {
  private root: FileSystemEntry;
  private caseSensitive: boolean;

  /**
   * 创建模拟文件系统
   *
   * @param options 配置选项
   */
  constructor(options: MockFileSystemOptions = {}) {
    super();

    this.caseSensitive = options.caseSensitive ?? true;

    this.root = {
      name: options.rootName ?? '/',
      type: 'directory',
      createdAt: new Date(),
      modifiedAt: new Date(),
      children: {}
    };

    if (options.initialFiles) {
      Object.entries(options.initialFiles).forEach(([filePath, content]) => {
        this.writeFile(filePath, content);
      });
    }
  }

  /**
   * 标准化路径
   *
   * @param filePath 文件路径
   * @returns 标准化后的路径
   */
  private normalizePath(filePath: string): string {
    let normalized = path.normalize(filePath).replace(/\\/g, '/');

    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }

    return normalized;
  }

  /**
   * 获取路径组件
   *
   * @param filePath 文件路径
   * @returns 路径组件数组
   */
  private getPathComponents(filePath: string): string[] {
    const normalized = this.normalizePath(filePath);
    return normalized.split('/').filter(Boolean);
  }

  /**
   * 查找条目
   *
   * @param filePath 文件路径
   * @param create 是否创建不存在的目录
   * @returns 条目信息
   */
  private findEntry(filePath: string, create: boolean = false): {
    entry: FileSystemEntry | null;
    parent: FileSystemEntry | null;
    name: string;
  } {
    const components = this.getPathComponents(filePath);

    if (components.length === 0) {
      return { entry: this.root, parent: null, name: this.root.name };
    }

    let current = this.root;
    let parent: FileSystemEntry | null = null;

    for (let i = 0; i < components.length - 1; i++) {
      const component = this.caseSensitive ? components[i] : components[i].toLowerCase();

      if (!current.children) {
        return { entry: null, parent: null, name: component };
      }

      let child: FileSystemEntry | undefined;

      if (this.caseSensitive) {
        child = current.children[component];
      } else {
        child = Object.values(current.children).find(
          entry => entry.name.toLowerCase() === component
        );
      }

      if (!child) {
        if (!create) {
          return { entry: null, parent: null, name: component };
        }

        // 创建目录
        child = {
          name: components[i],
          type: 'directory',
          createdAt: new Date(),
          modifiedAt: new Date(),
          children: {}
        };

        current.children[components[i]] = child;
        current.modifiedAt = new Date();

        this.emit('create', {
          type: 'create',
          path: '/' + components.slice(0, i + 1).join('/'),
          entry: child
        });
      }

      if (child.type !== 'directory') {
        return { entry: null, parent: null, name: component };
      }

      parent = current;
      current = child;
    }

    const lastName = components[components.length - 1];
    const lastComponent = this.caseSensitive ? lastName : lastName.toLowerCase();

    if (current.children) {
      let entry: FileSystemEntry | undefined;

      if (this.caseSensitive) {
        entry = current.children[lastComponent];
      } else {
        entry = Object.values(current.children).find(
          e => e.name.toLowerCase() === lastComponent
        );
      }

      if (entry) {
        return { entry, parent: current, name: entry.name };
      }
    }

    return { entry: null, parent: current, name: lastName };
  }

  /**
   * 读取文件
   *
   * @param filePath 文件路径
   * @returns 文件内容
   */
  readFile(filePath: string): string | Buffer {
    const { entry } = this.findEntry(filePath);

    if (!entry) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    if (entry.type !== 'file') {
      throw new Error(`路径不是文件: ${filePath}`);
    }

    return entry.content!;
  }

  /**
   * 写入文件
   *
   * @param filePath 文件路径
   * @param content 文件内容
   */
  writeFile(filePath: string, content: string | Buffer): void {
    const { entry, parent, name } = this.findEntry(filePath, true);

    if (!parent) {
      throw new Error(`父目录不存在: ${filePath}`);
    }

    if (entry && entry.type === 'directory') {
      throw new Error(`路径是目录: ${filePath}`);
    }

    const now = new Date();

    if (entry) {
      // 更新现有文件
      entry.content = content;
      entry.modifiedAt = now;
      entry.size = typeof content === 'string' ? content.length : content.length;

      this.emit('update', {
        type: 'update',
        path: filePath,
        entry
      });
    } else {
      // 处理null或undefined内容
      if (content === null || content === undefined) {
        content = '';
      }

      // 创建新文件
      const newFile: FileSystemEntry = {
        name,
        type: 'file',
        createdAt: now,
        modifiedAt: now,
        content,
        size: typeof content === 'string' ? content.length : content.length
      };

      if (!parent.children) {
        parent.children = {};
      }

      parent.children[name] = newFile;
      parent.modifiedAt = now;

      this.emit('create', {
        type: 'create',
        path: filePath,
        entry: newFile
      });
    }
  }

  /**
   * 删除文件或目录
   *
   * @param filePath 文件路径
   * @param recursive 是否递归删除目录
   */
  delete(filePath: string, recursive: boolean = false): void {
    const { entry, parent, name } = this.findEntry(filePath);

    if (!entry || !parent) {
      throw new Error(`文件或目录不存在: ${filePath}`);
    }

    if (entry.type === 'directory' && entry.children && Object.keys(entry.children).length > 0 && !recursive) {
      throw new Error(`目录不为空: ${filePath}`);
    }

    delete parent.children![name];
    parent.modifiedAt = new Date();

    this.emit('delete', {
      type: 'delete',
      path: filePath,
      entry
    });
  }

  /**
   * 创建目录
   *
   * @param dirPath 目录路径
   */
  mkdir(dirPath: string): void {
    const { entry, parent, name } = this.findEntry(dirPath, true);

    if (entry) {
      if (entry.type === 'directory') {
        return; // 目录已存在
      }

      throw new Error(`路径已存在且为文件: ${dirPath}`);
    }

    if (!parent) {
      throw new Error(`父目录不存在: ${dirPath}`);
    }

    const now = new Date();
    const newDir: FileSystemEntry = {
      name,
      type: 'directory',
      createdAt: now,
      modifiedAt: now,
      children: {}
    };

    parent.children![name] = newDir;
    parent.modifiedAt = now;

    this.emit('create', {
      type: 'create',
      path: dirPath,
      entry: newDir
    });
  }

  /**
   * 列出目录内容
   *
   * @param dirPath 目录路径
   * @returns 子条目列表
   */
  readdir(dirPath: string): string[] {
    const { entry } = this.findEntry(dirPath);

    if (!entry) {
      throw new Error(`目录不存在: ${dirPath}`);
    }

    if (entry.type !== 'directory') {
      throw new Error(`路径不是目录: ${dirPath}`);
    }

    return Object.keys(entry.children || {});
  }

  /**
   * 检查路径是否存在
   *
   * @param filePath 文件路径
   * @returns 是否存在
   */
  exists(filePath: string): boolean {
    const { entry } = this.findEntry(filePath);
    return !!entry;
  }

  /**
   * 检查路径是否是目录
   *
   * @param dirPath 目录路径
   * @returns 是否是目录
   */
  isDirectory(dirPath: string): boolean {
    const { entry } = this.findEntry(dirPath);
    return !!entry && entry.type === 'directory';
  }

  /**
   * 检查路径是否是文件
   *
   * @param filePath 文件路径
   * @returns 是否是文件
   */
  isFile(filePath: string): boolean {
    const { entry } = this.findEntry(filePath);
    return !!entry && entry.type === 'file';
  }

  /**
   * 获取条目信息
   *
   * @param filePath 文件路径
   * @returns 条目信息
   */
  stat(filePath: string): Omit<FileSystemEntry, 'content' | 'children'> {
    const { entry } = this.findEntry(filePath);

    if (!entry) {
      throw new Error(`文件或目录不存在: ${filePath}`);
    }

    const { content, children, ...stat } = entry;
    return stat;
  }

  /**
   * 重命名文件或目录
   *
   * @param oldPath 旧路径
   * @param newPath 新路径
   */
  rename(oldPath: string, newPath: string): void {
    const { entry: oldEntry, parent: oldParent, name: oldName } = this.findEntry(oldPath);

    if (!oldEntry || !oldParent) {
      throw new Error(`源路径不存在: ${oldPath}`);
    }

    const { entry: newEntry, parent: newParent, name: newName } = this.findEntry(newPath, true);

    if (newEntry) {
      throw new Error(`目标路径已存在: ${newPath}`);
    }

    if (!newParent) {
      throw new Error(`目标父目录不存在: ${newPath}`);
    }

    // 从旧位置移除
    delete oldParent.children![oldName];
    oldParent.modifiedAt = new Date();

    // 添加到新位置
    const now = new Date();
    oldEntry.name = newName;
    oldEntry.modifiedAt = now;

    newParent.children![newName] = oldEntry;
    newParent.modifiedAt = now;

    this.emit('rename', {
      type: 'rename',
      path: oldPath,
      newPath,
      entry: oldEntry
    });
  }

  /**
   * 复制文件或目录
   *
   * @param sourcePath 源路径
   * @param destPath 目标路径
   * @param recursive 是否递归复制目录
   */
  copy(sourcePath: string, destPath: string, recursive: boolean = true): void {
    const { entry: sourceEntry } = this.findEntry(sourcePath);

    if (!sourceEntry) {
      throw new Error(`源路径不存在: ${sourcePath}`);
    }

    const { entry: destEntry, parent: destParent, name: destName } = this.findEntry(destPath, true);

    if (destEntry) {
      throw new Error(`目标路径已存在: ${destPath}`);
    }

    if (!destParent) {
      throw new Error(`目标父目录不存在: ${destPath}`);
    }

    if (sourceEntry.type === 'file') {
      // 复制文件
      this.writeFile(destPath, sourceEntry.content!);
    } else if (sourceEntry.type === 'directory') {
      // 复制目录
      this.mkdir(destPath);

      if (recursive && sourceEntry.children) {
        Object.entries(sourceEntry.children).forEach(([childName, childEntry]) => {
          const childSourcePath = `${sourcePath}/${childName}`;
          const childDestPath = `${destPath}/${childName}`;
          this.copy(childSourcePath, childDestPath, recursive);
        });
      }
    }
  }

  /**
   * 获取文件系统快照
   *
   * @returns 快照对象
   */
  snapshot(): Record<string, string | Buffer> {
    const result: Record<string, string | Buffer> = {};

    const processEntry = (entry: FileSystemEntry, currentPath: string) => {
      if (entry.type === 'file' && entry.content !== undefined) {
        result[currentPath] = entry.content;
      } else if (entry.type === 'directory' && entry.children) {
        Object.entries(entry.children).forEach(([childName, childEntry]) => {
          const childPath = currentPath ? `${currentPath}/${childName}` : childName;
          processEntry(childEntry, childPath);
        });
      }
    };

    processEntry(this.root, '');

    return result;
  }

  /**
   * 清空文件系统
   */
  clear(): void {
    this.root.children = {};
    this.root.modifiedAt = new Date();
  }
}