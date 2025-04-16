import fs from 'fs';
import path from 'path';
import os from 'os';
import { ConfigOptions, ConfigData } from '../types/config';

/**
 * 配置管理器类
 * 负责CLI配置的加载和保存
 */
export class ConfigManager {
  /** 配置目录路径 */
  private configDir: string;
  /** 配置文件路径 */
  private configPath: string;
  /** 映射文件路径 */
  private mappingPath: string;
  /** 配置数据 */
  private config: ConfigData;

  /**
   * 创建配置管理器实例
   * @param options 配置选项
   */
  constructor(options?: ConfigOptions) {
    // TODO: 初始化配置路径
    this.configDir = options?.configDir || path.join(os.homedir(), '.dpml');
    this.configPath = path.join(this.configDir, options?.configFileName || 'config.json');
    this.mappingPath = path.join(this.configDir, options?.mappingFileName || 'domain-mapping.json');
    this.config = {};
  }

  /**
   * 加载配置
   * @returns 是否成功加载
   */
  public load(): boolean {
    try {
      // 检查配置文件是否存在
      if (!fs.existsSync(this.configPath)) {
        return false;
      }

      // 读取配置文件
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      return true;
    } catch (error) {
      console.error(`加载配置失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 保存配置
   * @returns 是否成功保存
   */
  public save(): boolean {
    try {
      // 确保配置目录存在
      this.ensureConfigDir();

      // 将配置对象序列化为JSON字符串
      const configContent = JSON.stringify(this.config, null, 2);

      // 写入配置文件
      fs.writeFileSync(this.configPath, configContent, 'utf-8');
      return true;
    } catch (error) {
      console.error(`保存配置失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 获取配置项
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值
   */
  public get<T>(key: string, defaultValue?: T): T {
    // 如果配置中存在该键，返回对应值
    if (key in this.config) {
      return this.config[key] as T;
    }

    // 否则返回默认值
    return (defaultValue !== undefined ? defaultValue : null) as T;
  }

  /**
   * 设置配置项
   * @param key 配置键
   * @param value 配置值
   */
  public set<T>(key: string, value: T): void {
    // 设置配置项
    this.config[key] = value;
  }

  /**
   * 确保配置目录存在
   * @returns 是否成功创建或确认目录
   */
  public ensureConfigDir(): boolean {
    try {
      // 检查目录是否存在
      if (!fs.existsSync(this.configDir)) {
        // 创建目录，包括中间目录
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      return true;
    } catch (error) {
      console.error(`创建配置目录失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 获取映射文件路径
   * @returns 映射文件路径
   */
  public getMappingFilePath(): string {
    return this.mappingPath;
  }

  /**
   * 获取配置文件路径
   * @returns 配置文件路径
   */
  public getConfigFilePath(): string {
    return this.configPath;
  }
}
