import { CommandRegistry } from './registry';
import { ConfigManager } from './config';
import path from 'path';
import fs from 'fs';
import { Command, DomainCommandSet, DomainCommandConfig, DomainMapping } from '../types/command';
import * as pathUtils from '../utils/paths';

/**
 * 命令加载器类
 * 负责发现和加载各领域包的命令
 */
export class CommandLoader {
  private registry: CommandRegistry;
  private configManager: ConfigManager;
  private mappingFilePath: string;

  /**
   * 创建命令加载器实例
   * @param registry 命令注册表
   * @param configManager 配置管理器
   */
  constructor(registry: CommandRegistry, configManager: ConfigManager) {
    this.registry = registry;
    this.configManager = configManager;
    this.mappingFilePath = this.configManager.getMappingFilePath();
  }

  /**
   * 加载领域映射文件
   * @returns 是否成功加载映射文件
   */
  public loadMappingFile(): boolean {
    try {
      // 检查映射文件是否存在
      if (!fs.existsSync(this.mappingFilePath)) {
        return false;
      }

      // 读取映射文件
      const mappingContent = fs.readFileSync(this.mappingFilePath, 'utf-8');
      const mapping = JSON.parse(mappingContent) as DomainMapping;

      // 将映射数据加载到注册表
      this.registry.deserialize(mapping);

      return true;
    } catch (error) {
      throw new Error(`加载映射文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 保存领域映射文件
   */
  public saveMappingFile(): void {
    try {
      // 确保配置目录存在
      this.configManager.ensureConfigDir();

      // 序列化注册表
      const mapping = this.registry.serialize();

      // 写入映射文件
      fs.writeFileSync(this.mappingFilePath, JSON.stringify(mapping, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`保存映射文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 扫描可用的DPML包
   * @returns 扫描到的领域映射信息
   */
  public async scanPackages(): Promise<DomainMapping> {
    try {
      // 查找DPML相关包
      const packages = this.findDpmlPackages();
      const domains: Record<string, any> = {};

      // 遍历包并收集信息
      for (const pkg of packages) {
        // 从包名提取领域名称
        const domainName = pkg.replace('@dpml/', '');

        // 尝试找到包的配置文件路径
        const nodeModules = pathUtils.findNodeModules();
        let packagePath = '';

        for (const modulePath of nodeModules) {
          const possiblePath = path.join(modulePath, pkg);
          if (fs.existsSync(possiblePath)) {
            packagePath = possiblePath;
            break;
          }
        }

        if (!packagePath) {
          continue;
        }

        // 检查是否有配置文件
        const configJsPath = path.join(packagePath, 'dist', 'dpml.config.js');
        const configTsPath = path.join(packagePath, 'dpml.config.ts');

        let commandsPath = '';
        if (fs.existsSync(configJsPath)) {
          commandsPath = configJsPath;
        } else if (fs.existsSync(configTsPath)) {
          commandsPath = configTsPath;
        }

        if (commandsPath) {
          // 获取包版本
          let version = '0.1.0'; // 默认版本
          try {
            const packageJsonPath = path.join(packagePath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
              const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
              version = packageJson.version || version;
            }
          } catch (e) {
            // 忽略包版本获取错误
          }

          // 添加到领域映射
          domains[domainName] = {
            package: pkg,
            commandsPath,
            version
          };
        }
      }

      return {
        lastUpdated: new Date().toISOString(),
        domains
      };
    } catch (error) {
      throw new Error(`扫描包失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 加载特定领域的命令
   * @param domainName 领域名称
   * @returns 是否成功加载
   */
  public async loadDomainCommands(domainName: string): Promise<boolean> {
    try {
      // 获取领域信息
      const domain = this.registry.getDomain(domainName);
      if (!domain) {
        return false;
      }

      // 动态导入命令配置
      const config = await this.importCommandConfig(domain.commandsPath);
      if (!config || !this.validateCommandConfig(config)) {
        return false;
      }

      // 注册命令
      for (const command of config.commands) {
        this.registry.registerCommand(domainName, command, true);
      }

      return true;
    } catch (error) {
      console.error(`加载领域命令失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 刷新命令映射
   * @param specific 指定要刷新的领域，不指定则刷新所有
   */
  public async refreshMappings(specific?: string): Promise<void> {
    try {
      // 扫描包并获取映射
      const mapping = await this.scanPackages();

      // 如果指定了特定领域，只更新该领域
      if (specific) {
        if (mapping.domains[specific]) {
          const domainInfo = mapping.domains[specific];
          const domainSet: DomainCommandSet = {
            domain: specific,
            package: domainInfo.package,
            commandsPath: domainInfo.commandsPath,
            version: domainInfo.version,
            commands: new Map()
          };

          this.registry.registerDomainCommandSet(domainSet);
          await this.loadDomainCommands(specific);
        }
      } else {
        // 更新所有领域
        this.registry.deserialize(mapping);

        // 加载所有领域的命令
        const domains = this.registry.getAllDomains();
        for (const domain of domains) {
          await this.loadDomainCommands(domain);
        }
      }

      // 保存映射文件
      this.saveMappingFile();
    } catch (error) {
      throw new Error(`刷新命令映射失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 验证领域命令配置的有效性
   * @param config 领域命令配置
   * @returns 是否是有效配置
   */
  private validateCommandConfig(config: any): boolean {
    // 检查基本结构
    if (!config || typeof config !== 'object') {
      return false;
    }

    // 检查必要字段
    if (!config.domain || !Array.isArray(config.commands)) {
      return false;
    }

    // 检查命令定义
    for (const command of config.commands) {
      if (!command.name || typeof command.name !== 'string') {
        return false;
      }

      if (!command.description || typeof command.description !== 'string') {
        return false;
      }

      if (!command.execute || typeof command.execute !== 'function') {
        return false;
      }
    }

    return true;
  }

  /**
   * 动态导入命令配置文件
   * @param filePath 文件路径
   * @returns 领域命令配置
   */
  private async importCommandConfig(filePath: string): Promise<DomainCommandConfig | null> {
    try {
      // 动态导入模块
      const module = await import(filePath);

      // 获取配置（可能是默认导出或命名导出）
      const config = module.default || module;

      return config as DomainCommandConfig;
    } catch (error) {
      console.error(`导入命令配置失败: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * 查找DPML相关包
   * @returns 包信息列表
   */
  private findDpmlPackages(): string[] {
    try {
      const packages: string[] = [];
      const nodeModules = pathUtils.findNodeModules();

      for (const modulePath of nodeModules) {
        // 检查@dpml目录是否存在
        const dpmlPath = path.join(modulePath, '@dpml');
        if (!fs.existsSync(dpmlPath)) {
          continue;
        }

        // 读取@dpml目录下的所有包
        const dpmlPackages = fs.readdirSync(dpmlPath);
        for (const pkg of dpmlPackages) {
          packages.push(`@dpml/${pkg}`);
        }
      }

      return packages;
    } catch (error) {
      console.error(`查找DPML包失败: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
}
