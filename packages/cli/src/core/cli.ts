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
    // 初始化配置
    this.configManager.ensureConfigDir();
    this.configManager.load();

    // 设置默认配置项（如果不存在）
    if (!this.configManager.get('initialized')) {
      this.configManager.set('initialized', true);
      this.configManager.set('version', '0.1.0');
      this.configManager.set('lastUpdated', new Date().toISOString());
      this.configManager.save();
    }
  }

  /**
   * 运行CLI
   * @param argv 命令行参数
   */
  public async run(argv: string[]): Promise<void> {
    try {
      // 初始化CLI
      await this.initialize();

      // 检查是否需要更新映射
      const needsUpdate = argv.includes('--update');

      // 如果需要更新映射或映射不存在
      if (needsUpdate || !this.commandLoader.loadMappingFile()) {
        console.log('正在扫描可用包并更新命令映射...');
        // 扫描包并更新映射
        await this.commandLoader.refreshMappings();
        console.log('命令映射已更新');

        // 如果只是更新映射，则退出
        if (argv.length === 3 && argv[2] === '--update') {
          return;
        }
      }

      // 加载领域命令
      const domains = this.commandRegistry.getAllDomains();
      for (const domain of domains) {
        await this.commandLoader.loadDomainCommands(domain);
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
