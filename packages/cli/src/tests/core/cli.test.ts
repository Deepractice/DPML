import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CLI } from '../../core/cli';
import { CommandRegistry } from '../../core/registry';
import { CommandLoader } from '../../core/loader';
import { CommandExecutor } from '../../core/executor';
import { ConfigManager } from '../../core/config';

// 模拟依赖模块
vi.mock('../../src/core/registry');
vi.mock('../../src/core/loader');
vi.mock('../../src/core/executor');
vi.mock('../../src/core/config');

describe('CLI', () => {
  let cli: CLI;
  let mockRegistry: CommandRegistry;
  let mockLoader: CommandLoader;
  let mockExecutor: CommandExecutor;
  let mockConfig: ConfigManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // 重置模拟实现
    vi.mocked(CommandRegistry).mockClear();
    vi.mocked(CommandLoader).mockClear();
    vi.mocked(CommandExecutor).mockClear();
    vi.mocked(ConfigManager).mockClear();

    // 创建模拟实例
    mockRegistry = new CommandRegistry();
    mockLoader = new CommandLoader(mockRegistry, mockConfig);
    mockExecutor = new CommandExecutor(mockRegistry);
    mockConfig = new ConfigManager();

    // 设置模拟方法
    mockConfig.ensureConfigDir = vi.fn().mockReturnValue(true);
    mockConfig.load = vi.fn().mockReturnValue(true);
    mockConfig.get = vi.fn().mockImplementation((key) => {
      if (key === 'initialized') return true;
      return null;
    });
    mockConfig.set = vi.fn();
    mockConfig.save = vi.fn();

    mockLoader.loadMappingFile = vi.fn().mockReturnValue(true);
    mockLoader.refreshMappings = vi.fn().mockResolvedValue(undefined);
    mockLoader.loadDomainCommands = vi.fn().mockResolvedValue(true);

    mockRegistry.getAllDomains = vi.fn().mockReturnValue(['test-domain']);

    mockExecutor.buildCommandStructure = vi.fn().mockReturnValue({
      parse: vi.fn()
    });
    mockExecutor.handleErrors = vi.fn();

    // 创建CLI实例
    cli = new CLI();
    
    // 替换CLI内部组件为模拟对象
    (cli as any).commandRegistry = mockRegistry;
    (cli as any).commandLoader = mockLoader;
    (cli as any).commandExecutor = mockExecutor;
    (cli as any).configManager = mockConfig;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // UT-CLI-001: CLI初始化
  describe('初始化', () => {
    it('应该正确初始化配置和组件', async () => {
      await cli.initialize();

      expect(mockConfig.ensureConfigDir).toHaveBeenCalled();
      expect(mockConfig.load).toHaveBeenCalled();
    });

    it('当配置未初始化时应设置默认值', async () => {
      // 模拟配置未初始化
      mockConfig.get = vi.fn().mockReturnValue(false);

      await cli.initialize();

      expect(mockConfig.set).toHaveBeenCalledWith('initialized', true);
      expect(mockConfig.set).toHaveBeenCalledWith('version', expect.any(String));
      expect(mockConfig.set).toHaveBeenCalledWith('lastUpdated', expect.any(String));
      expect(mockConfig.save).toHaveBeenCalled();
    });
  });

  // UT-CLI-002: 运行流程
  describe('运行流程', () => {
    it('应该正确执行CLI运行流程', async () => {
      const argv = ['node', 'dpml', 'test-domain', 'test-command'];

      await cli.run(argv);

      expect(mockLoader.loadMappingFile).toHaveBeenCalled();
      expect(mockLoader.loadDomainCommands).toHaveBeenCalledWith('test-domain');
      expect(mockExecutor.buildCommandStructure).toHaveBeenCalled();
      expect(mockExecutor.buildCommandStructure().parse).toHaveBeenCalledWith(argv);
    });

    it('当映射文件不存在时应刷新映射', async () => {
      // 模拟映射文件不存在
      mockLoader.loadMappingFile = vi.fn().mockReturnValue(false);

      const argv = ['node', 'dpml', 'test-domain', 'test-command'];

      await cli.run(argv);

      expect(mockLoader.refreshMappings).toHaveBeenCalled();
    });

    it('当指定--update选项时应刷新映射', async () => {
      const argv = ['node', 'dpml', '--update'];

      await cli.run(argv);

      expect(mockLoader.refreshMappings).toHaveBeenCalled();
    });
  });

  // UT-CLI-003: 更新检测
  describe('更新检测', () => {
    it('当只有--update选项时应只更新映射并退出', async () => {
      const argv = ['node', 'dpml', '--update'];

      await cli.run(argv);

      expect(mockLoader.refreshMappings).toHaveBeenCalled();
      expect(mockExecutor.buildCommandStructure).not.toHaveBeenCalled();
    });

    it('当--update与其他命令一起使用时应更新映射并执行命令', async () => {
      const argv = ['node', 'dpml', 'test-domain', '--update', 'test-command'];

      await cli.run(argv);

      expect(mockLoader.refreshMappings).toHaveBeenCalled();
      expect(mockExecutor.buildCommandStructure).toHaveBeenCalled();
    });
  });

  // UT-CLI-004: 错误捕获
  describe('错误捕获', () => {
    it('应该捕获并处理运行时错误', async () => {
      // 模拟初始化抛出错误
      const error = new Error('测试错误');
      mockConfig.ensureConfigDir = vi.fn().mockImplementation(() => {
        throw error;
      });

      const argv = ['node', 'dpml', 'test-domain', 'test-command'];

      await cli.run(argv);

      expect(mockExecutor.handleErrors).toHaveBeenCalledWith(error);
    });
  });

  // UT-CLI-005: 组件协作
  describe('组件协作', () => {
    it('应该正确协调各组件工作', async () => {
      const argv = ['node', 'dpml', 'test-domain', 'test-command'];

      await cli.run(argv);

      // 验证组件之间的协作
      expect(mockConfig.load).toHaveBeenCalled();
      expect(mockLoader.loadMappingFile).toHaveBeenCalled();
      expect(mockRegistry.getAllDomains).toHaveBeenCalled();
      expect(mockLoader.loadDomainCommands).toHaveBeenCalled();
      expect(mockExecutor.buildCommandStructure).toHaveBeenCalled();
    });
  });
});
