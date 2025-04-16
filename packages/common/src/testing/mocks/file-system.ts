import { EventEmitter } from 'events';
import * as path from 'path';
import { DpmlError } from '../../utils/error';

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
  initialFiles?: Record<string, string | Buffer | null>;

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
        if (content === null) {
          // 如果内容为null，创建目录
          this.mkdirSync(filePath);
        } else {
          // 否则创建文件
          this.writeFileSync(filePath, content);
        }
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
   * 同步读取文件内容
   *
   * @param filePath 文件路径
   * @returns 文件内容
   * @throws {DpmlError} 当文件不存在或是目录时
   */
  readFileSync(filePath: string): string | Buffer {
    const { entry } = this.findEntry(filePath);

    if (!entry) {
      throw new DpmlError(`文件不存在: ${filePath}`, 'ENOENT');
    }

    if (entry.type !== 'file') {
      throw new DpmlError(`路径是目录: ${filePath}`, 'EISDIR');
    }

    return entry.content || '';
  }

  /**
   * 异步读取文件内容
   * 
   * @param filePath 文件路径
   * @returns 文件内容的Promise
   */
  async readFile(filePath: string): Promise<string | Buffer> {
    try {
      return this.readFileSync(filePath);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步写入文件
   *
   * @param filePath 文件路径
   * @param content 文件内容
   * @throws {DpmlError} 当父目录不存在或路径是目录时
   */
  writeFileSync(filePath: string, content: string | Buffer): void {
    const { entry, parent, name } = this.findEntry(filePath, true);

    if (!parent) {
      throw new DpmlError(`父目录不存在: ${filePath}`, 'ENOENT');
    }

    if (entry && entry.type === 'directory') {
      throw new DpmlError(`路径是目录: ${filePath}`, 'EISDIR');
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
   * 异步写入文件
   * 
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 完成写入的Promise
   */
  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    try {
      this.writeFileSync(filePath, content);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步删除文件或目录
   *
   * @param filePath 文件路径
   * @param recursive 是否递归删除目录
   * @throws {DpmlError} 当文件不存在或目录不为空时
   */
  deleteSync(filePath: string, recursive: boolean = false): void {
    const { entry, parent, name } = this.findEntry(filePath);

    if (!entry || !parent) {
      throw new DpmlError(`文件或目录不存在: ${filePath}`, 'ENOENT');
    }

    if (entry.type === 'directory' && entry.children && Object.keys(entry.children).length > 0 && !recursive) {
      throw new DpmlError(`目录不为空: ${filePath}`, 'ENOTEMPTY');
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
   * 异步删除文件或目录
   * 
   * @param filePath 文件路径
   * @param recursive 是否递归删除目录
   * @returns 完成删除的Promise
   */
  async delete(filePath: string, recursive: boolean = false): Promise<void> {
    try {
      this.deleteSync(filePath, recursive);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步创建目录
   *
   * @param dirPath 目录路径
   * @throws {DpmlError} 当路径已存在且为文件或父目录不存在时
   */
  mkdirSync(dirPath: string): void {
    const { entry, parent, name } = this.findEntry(dirPath, true);

    if (entry) {
      if (entry.type === 'directory') {
        return; // 目录已存在
      }

      throw new DpmlError(`路径已存在且为文件: ${dirPath}`, 'EEXIST');
    }

    if (!parent) {
      throw new DpmlError(`父目录不存在: ${dirPath}`, 'ENOENT');
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
   * 异步创建目录
   * 
   * @param dirPath 目录路径
   * @param recursive 是否递归创建
   * @returns 完成创建的Promise
   */
  async mkdir(dirPath: string, recursive: boolean = true): Promise<void> {
    try {
      if (recursive) {
        const parts = dirPath.split('/').filter(Boolean);
        let currentPath = '';
        
        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          try {
            this.mkdirSync(currentPath);
          } catch (err) {
            // 如果目录已存在则继续
            if (err instanceof DpmlError && err.message.includes('目录已存在')) {
              continue;
            }
            throw err;
          }
        }
      } else {
        this.mkdirSync(dirPath);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步列出目录内容
   *
   * @param dirPath 目录路径
   * @returns 子条目列表
   * @throws {DpmlError} 当目录不存在或路径不是目录时
   */
  readdirSync(dirPath: string): string[] {
    const { entry } = this.findEntry(dirPath);

    if (!entry) {
      throw new DpmlError(`目录不存在: ${dirPath}`, 'ENOENT');
    }

    if (entry.type !== 'directory') {
      throw new DpmlError(`路径不是目录: ${dirPath}`, 'ENOTDIR');
    }

    return Object.keys(entry.children || {});
  }

  /**
   * 异步列出目录内容
   * 
   * @param dirPath 目录路径
   * @returns 子条目列表的Promise
   */
  async readdir(dirPath: string): Promise<string[]> {
    try {
      return this.readdirSync(dirPath);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步检查路径是否存在
   *
   * @param filePath 文件路径
   * @returns 是否存在
   */
  existsSync(filePath: string): boolean {
    const { entry } = this.findEntry(filePath);
    return !!entry;
  }

  /**
   * 异步检查路径是否存在
   * 
   * @param filePath 文件路径
   * @returns 是否存在的Promise
   */
  async exists(filePath: string): Promise<boolean> {
    return Promise.resolve(this.existsSync(filePath));
  }

  /**
   * 同步检查路径是否是目录
   *
   * @param dirPath 目录路径
   * @returns 是否是目录
   */
  isDirectorySync(dirPath: string): boolean {
    const { entry } = this.findEntry(dirPath);
    return !!entry && entry.type === 'directory';
  }

  /**
   * 异步检查路径是否是目录
   * 
   * @param dirPath 目录路径
   * @returns 是否是目录的Promise
   */
  async isDirectory(dirPath: string): Promise<boolean> {
    return Promise.resolve(this.isDirectorySync(dirPath));
  }

  /**
   * 同步检查路径是否是文件
   *
   * @param filePath 文件路径
   * @returns 是否是文件
   */
  isFileSync(filePath: string): boolean {
    const { entry } = this.findEntry(filePath);
    return !!entry && entry.type === 'file';
  }

  /**
   * 异步检查路径是否是文件
   * 
   * @param filePath 文件路径
   * @returns 是否是文件的Promise
   */
  async isFile(filePath: string): Promise<boolean> {
    return Promise.resolve(this.isFileSync(filePath));
  }

  /**
   * 同步获取条目信息
   *
   * @param filePath 文件路径
   * @returns 条目信息
   * @throws {DpmlError} 当文件或目录不存在时
   */
  statSync(filePath: string): Omit<FileSystemEntry, 'content' | 'children'> {
    const { entry } = this.findEntry(filePath);

    if (!entry) {
      throw new DpmlError(`文件或目录不存在: ${filePath}`, 'ENOENT');
    }

    const { content, children, ...stat } = entry;
    return stat;
  }

  /**
   * 异步获取条目信息
   * 
   * @param filePath 文件路径
   * @returns 条目信息的Promise
   */
  async stat(filePath: string): Promise<Omit<FileSystemEntry, 'content' | 'children'>> {
    try {
      return this.statSync(filePath);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步重命名文件或目录
   *
   * @param oldPath 旧路径
   * @param newPath 新路径
   * @throws {DpmlError} 当源路径不存在或目标路径已存在时
   */
  renameSync(oldPath: string, newPath: string): void {
    const { entry: oldEntry, parent: oldParent, name: oldName } = this.findEntry(oldPath);

    if (!oldEntry || !oldParent) {
      throw new DpmlError(`源路径不存在: ${oldPath}`, 'ENOENT');
    }

    const { entry: newEntry, parent: newParent, name: newName } = this.findEntry(newPath, true);

    if (newEntry) {
      throw new DpmlError(`目标路径已存在: ${newPath}`, 'EEXIST');
    }

    if (!newParent) {
      throw new DpmlError(`目标父目录不存在: ${newPath}`, 'ENOENT');
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
   * 异步重命名文件或目录
   * 
   * @param oldPath 旧路径
   * @param newPath 新路径
   * @returns 完成重命名的Promise
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      this.renameSync(oldPath, newPath);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 同步复制文件或目录
   *
   * @param sourcePath 源路径
   * @param destPath 目标路径
   * @param recursive 是否递归复制目录
   * @throws {DpmlError} 当源路径不存在或目标路径已存在时
   */
  copySync(sourcePath: string, destPath: string, recursive: boolean = true): void {
    const { entry: sourceEntry } = this.findEntry(sourcePath);

    if (!sourceEntry) {
      throw new DpmlError(`源路径不存在: ${sourcePath}`, 'ENOENT');
    }

    const { entry: destEntry, parent: destParent, name: destName } = this.findEntry(destPath, true);

    if (destEntry) {
      throw new DpmlError(`目标路径已存在: ${destPath}`, 'EEXIST');
    }

    if (!destParent) {
      throw new DpmlError(`目标父目录不存在: ${destPath}`, 'ENOENT');
    }

    if (sourceEntry.type === 'file') {
      // 复制文件
      this.writeFileSync(destPath, sourceEntry.content!);
    } else if (sourceEntry.type === 'directory') {
      // 复制目录
      this.mkdirSync(destPath);

      if (recursive && sourceEntry.children) {
        Object.entries(sourceEntry.children).forEach(([childName, childEntry]) => {
          const childSourcePath = `${sourcePath}/${childName}`;
          const childDestPath = `${destPath}/${childName}`;
          this.copySync(childSourcePath, childDestPath, recursive);
        });
      }
    }
  }

  /**
   * 异步复制文件或目录
   * 
   * @param sourcePath 源路径
   * @param destPath 目标路径
   * @param recursive 是否递归复制目录
   * @returns 完成复制的Promise
   */
  async copy(sourcePath: string, destPath: string, recursive: boolean = true): Promise<void> {
    try {
      this.copySync(sourcePath, destPath, recursive);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
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