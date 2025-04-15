import { CommandRegistry } from './registry';
import { CommandLoader } from './loader';
import { CommandExecutor } from './executor';
import { ConfigManager } from './config';

/**
 * CLI类
 * CLI的主类，协调各组件工作
 */
export class CLI {
  private commandRegistry: CommandRegistry;
  private commandLoader: CommandLoader;
  private commandExecutor: CommandExecutor;
  private configManager: ConfigManager;

  /**
   * 创建CLI实例
   */
  constructor() {
    // 初始化组件
    this.configManager = new ConfigManager();
    this.commandRegistry = new CommandRegistry();
    this.commandLoader = new CommandLoader(this.commandRegistry, this.configManager);
    this.commandExecutor = new CommandExecutor(this.commandRegistry);
  }

  /**
   * 初始化CLI
   */
  public async initialize(): Promise<void> {
    // TODO: 初始化CLI配置和命令注册表
    this.configManager.ensureConfigDir();
    this.configManager.load();
  }

  /**
   * 运行CLI
   * @param argv 命令行参数
   */
  public async run(argv: string[]): Promise<void> {
    try {
      // TODO: 实现CLI运行逻辑
      await this.initialize();

      // 解析参数
      const needsUpdate = argv.includes('--update');
      
      // 如果需要更新映射或映射不存在
      if (needsUpdate || !this.commandLoader.loadMappingFile()) {
        // 扫描包并更新映射
        await this.commandLoader.refreshMappings();
      }

      // 构建命令结构
      const program = this.commandExecutor.buildCommandStructure();
      
      // 解析参数并执行
      program.parse(argv);
    } catch (error: any) {
      this.commandExecutor.handleErrors(error);
    }
  }
}
