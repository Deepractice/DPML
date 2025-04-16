import { DomainCommandConfig } from '../types/command';

import type {
  Command,
  DomainCommandSet,
  DomainMapping,
} from '../types/command';

/**
 * 命令注册表类
 * 负责存储和管理所有已注册的命令
 */
export class CommandRegistry {
  /** 领域映射 */
  private domains: Map<string, DomainCommandSet>;

  /**
   * 创建命令注册表实例
   */
  constructor() {
    this.domains = new Map();
  }

  /**
   * 注册领域命令集
   * @param commandSet 命令集合
   */
  public registerDomainCommandSet(commandSet: DomainCommandSet): void {
    this.domains.set(commandSet.domain, commandSet);
  }

  /**
   * 注册单个命令到指定领域
   * @param domainName 领域名称
   * @param command 命令对象
   * @param force 是否强制覆盖已存在的命令
   * @throws 当领域不存在或命令已存在且未指定强制覆盖时抛出错误
   */
  public registerCommand(
    domainName: string,
    command: Command,
    force: boolean = false
  ): void {
    const domain = this.domains.get(domainName);

    if (!domain) {
      throw new Error(
        `Domain '${domainName}' does not exist. Cannot register command.`
      );
    }

    if (domain.commands.has(command.name) && !force) {
      throw new Error(
        `Command '${command.name}' already exists in domain '${domainName}'. Use force option to override.`
      );
    }

    domain.commands.set(command.name, command);
  }

  /**
   * 获取特定领域的命令集
   * @param domainName 领域名称
   * @returns 领域命令集，不存在则返回undefined
   */
  public getDomain(domainName: string): DomainCommandSet | undefined {
    return this.domains.get(domainName);
  }

  /**
   * 获取特定领域下的特定命令
   * @param domainName 领域名称
   * @param commandName 命令名称
   * @returns 命令对象，不存在则返回undefined
   */
  public getCommand(
    domainName: string,
    commandName: string
  ): Command | undefined {
    const domain = this.domains.get(domainName);

    if (!domain) {
      return undefined;
    }

    return domain.commands.get(commandName);
  }

  /**
   * 检查特定命令是否存在
   * @param domainName 领域名称
   * @param commandName 命令名称
   * @returns 命令是否存在
   */
  public hasCommand(domainName: string, commandName: string): boolean {
    const domain = this.domains.get(domainName);

    if (!domain) {
      return false;
    }

    return domain.commands.has(commandName);
  }

  /**
   * 获取特定领域下的所有命令
   * @param domainName 领域名称
   * @returns 命令对象数组，领域不存在则返回空数组
   */
  public getDomainCommands(domainName: string): Command[] {
    const domain = this.domains.get(domainName);

    if (!domain) {
      return [];
    }

    return Array.from(domain.commands.values());
  }

  /**
   * 移除特定命令
   * @param domainName 领域名称
   * @param commandName 命令名称
   * @returns 是否成功移除
   */
  public removeCommand(domainName: string, commandName: string): boolean {
    const domain = this.domains.get(domainName);

    if (!domain) {
      return false;
    }

    return domain.commands.delete(commandName);
  }

  /**
   * 获取所有已注册的领域名称
   * @returns 领域名称列表
   */
  public getAllDomains(): string[] {
    return Array.from(this.domains.keys());
  }

  /**
   * 序列化注册表
   * @returns 序列化后的对象
   */
  public serialize(): DomainMapping {
    const serializedDomains: Record<string, any> = {};

    this.domains.forEach((domainSet, domainName) => {
      serializedDomains[domainName] = {
        package: domainSet.package,
        commandsPath: domainSet.commandsPath,
        version: domainSet.version,
      };
    });

    return {
      lastUpdated: new Date().toISOString(),
      domains: serializedDomains,
    };
  }

  /**
   * 从序列化数据中恢复注册表
   * @param data 序列化数据
   */
  public deserialize(data: DomainMapping): void {
    this.domains.clear();

    Object.entries(data.domains).forEach(([domainName, domainInfo]) => {
      const domainSet: DomainCommandSet = {
        domain: domainName,
        package: domainInfo.package,
        commandsPath: domainInfo.commandsPath,
        version: domainInfo.version,
        commands: new Map(),
      };

      this.domains.set(domainName, domainSet);
    });
  }
}
