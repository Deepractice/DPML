/**
 * 文件系统接口类型定义
 * 
 * 提供跨平台的文件系统操作抽象。
 */

/**
 * 文件状态信息
 */
export interface FileStat {
  /** 检查是否为文件 */
  isFile(): boolean;
  /** 检查是否为目录 */
  isDirectory(): boolean;
  /** 检查是否为符号链接 */
  isSymbolicLink(): boolean;
  /** 文件大小（字节） */
  size: number;
  /** 最后修改时间（毫秒时间戳） */
  mtimeMs: number;
  /** 创建时间（毫秒时间戳） */
  ctimeMs: number;
  /** 最后访问时间（毫秒时间戳） */
  atimeMs: number;
}

/**
 * 文件写入选项
 */
export interface WriteFileOptions {
  /** 编码 */
  encoding?: string;
  /** 文件模式 */
  mode?: number;
  /** 文件标志 */
  flag?: string;
  /** 自动创建父目录 */
  createDirs?: boolean;
}

/**
 * 目录读取选项
 */
export interface ReadDirOptions {
  /** 是否递归读取子目录 */
  recursive?: boolean;
  /** 是否包含隐藏文件 */
  includeHidden?: boolean;
  /** 文件过滤模式 */
  pattern?: string | RegExp;
}

/**
 * 文件复制选项
 */
export interface CopyFileOptions {
  /** 是否覆盖目标文件 */
  overwrite?: boolean;
  /** 是否创建父目录 */
  createDirs?: boolean;
  /** 是否保留文件元数据 */
  preserveTimestamps?: boolean;
}

/**
 * 文件系统监视选项
 */
export interface WatchOptions {
  /** 是否递归监视 */
  recursive?: boolean;
  /** 防抖时间（毫秒） */
  debounce?: number;
}

/**
 * 文件系统监视事件
 */
export type WatchEvent = 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';

/**
 * 文件系统监视回调
 */
export type WatchCallback = (event: WatchEvent, path: string, stats?: FileStat) => void;

/**
 * 文件系统监视器
 */
export interface FSWatcher {
  /** 关闭监视器 */
  close(): void;
}

/**
 * 文件系统锁选项
 */
export interface FileLockOptions {
  /** 锁定等待超时（毫秒） */
  wait?: number;
  /** 锁定持续时间（毫秒，0表示无限） */
  duration?: number;
  /** 是否为共享锁 */
  shared?: boolean;
}

/**
 * 文件系统锁
 */
export interface FileLock {
  /** 释放锁 */
  release(): Promise<void>;
  /** 锁是否被释放 */
  isReleased(): boolean;
}

/**
 * 文件系统接口
 * 
 * 提供统一的文件操作接口，适用于Node.js和浏览器环境
 */
export interface FileSystem {
  /**
   * 读取文件内容
   * @param path 文件路径
   * @param encoding 编码（默认utf-8）
   */
  readFile(path: string, encoding?: string): Promise<string>;
  
  /**
   * 读取文件为二进制数据
   * @param path 文件路径
   */
  readFileBuffer(path: string): Promise<Uint8Array>;
  
  /**
   * 写入文件
   * @param path 文件路径
   * @param content 文件内容
   * @param options 写入选项
   */
  writeFile(path: string, content: string | Uint8Array, options?: WriteFileOptions): Promise<void>;
  
  /**
   * 追加内容到文件
   * @param path 文件路径
   * @param content 追加内容
   * @param options 写入选项
   */
  appendFile(path: string, content: string | Uint8Array, options?: WriteFileOptions): Promise<void>;
  
  /**
   * 检查文件或目录是否存在
   * @param path 路径
   */
  exists(path: string): Promise<boolean>;
  
  /**
   * 获取文件或目录状态
   * @param path 路径
   */
  stat(path: string): Promise<FileStat>;
  
  /**
   * 创建目录
   * @param path 目录路径
   * @param recursive 是否递归创建
   */
  mkdir(path: string, recursive?: boolean): Promise<void>;
  
  /**
   * 读取目录内容
   * @param path 目录路径
   * @param options 读取选项
   */
  readdir(path: string, options?: ReadDirOptions): Promise<string[]>;
  
  /**
   * 删除文件
   * @param path 文件路径
   */
  unlink(path: string): Promise<void>;
  
  /**
   * 删除目录
   * @param path 目录路径
   * @param recursive 是否递归删除内容
   */
  rmdir(path: string, recursive?: boolean): Promise<void>;
  
  /**
   * 复制文件
   * @param src 源文件路径
   * @param dest 目标文件路径
   * @param options 复制选项
   */
  copyFile(src: string, dest: string, options?: CopyFileOptions): Promise<void>;
  
  /**
   * 移动文件
   * @param src 源文件路径
   * @param dest 目标文件路径
   * @param overwrite 是否覆盖目标文件
   */
  moveFile(src: string, dest: string, overwrite?: boolean): Promise<void>;
  
  /**
   * 监视文件或目录变化
   * @param path 监视路径
   * @param callback 变化回调
   * @param options 监视选项
   */
  watch(path: string, callback: WatchCallback, options?: WatchOptions): FSWatcher;
  
  /**
   * 尝试获取文件锁
   * @param path 文件路径
   * @param options 锁定选项
   */
  lock?(path: string, options?: FileLockOptions): Promise<FileLock>;
  
  /**
   * 获取临时文件路径
   * @param prefix 文件名前缀
   * @param suffix 文件名后缀
   */
  tmpFile?(prefix?: string, suffix?: string): Promise<string>;
  
  /**
   * 获取临时目录路径
   * @param prefix 目录名前缀
   */
  tmpDir?(prefix?: string): Promise<string>;
}

/**
 * 本地文件系统能力
 * 
 * 标识文件系统提供的高级能力
 */
export interface FileSystemCapabilities {
  /** 是否支持监视 */
  watch: boolean;
  /** 是否支持锁定 */
  lock: boolean;
  /** 是否支持临时文件 */
  tempFiles: boolean;
  /** 是否支持二进制数据 */
  binary: boolean;
  /** 是否支持权限控制 */
  permissions: boolean;
  /** 是否支持符号链接 */
  symlinks: boolean;
}

/**
 * 文件系统元数据
 */
export interface FileSystemInfo {
  /** 文件系统类型 */
  type: 'node' | 'browser' | 'memory' | 'remote' | 'mock';
  /** 文件系统能力 */
  capabilities: FileSystemCapabilities;
  /** 根目录 */
  rootDir?: string;
  /** 分隔符 */
  separator: string;
  /** 临时目录 */
  tempDir?: string;
}

/**
 * 文件系统工厂
 * 
 * 用于创建文件系统实例
 */
export interface FileSystemFactory {
  /**
   * 创建文件系统实例
   * @param options 文件系统选项
   */
  create(options?: Record<string, unknown>): FileSystem;
  
  /**
   * 获取文件系统信息
   */
  getInfo(): FileSystemInfo;
} 