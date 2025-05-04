import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { Command } from 'commander';

import type { CommandAdapter } from '../../types/CommandAdapter';
import type { DomainDiscoverer } from '../../types/DomainDiscoverer';
import { DPMLError, DPMLErrorType } from '../../types/DPMLError';
import type { ExecutorFactory } from '../execution/ExecutorFactory';

/**
 * Commander.js Adapter
 *
 * Command Adapter based on Commander.js.
 */
export class CommanderAdapter implements CommandAdapter {
  /**
   * Commander Program Instance
   */
  private program: Command;

  /**
   * Constructor
   *
   * @param domainDiscoverer Domain Discoverer
   * @param executorFactory Executor Factory
   */
  constructor(
    private readonly domainDiscoverer: DomainDiscoverer,
    private readonly executorFactory: ExecutorFactory
  ) {
    // Create Commander Program Instance
    this.program = new Command();

    // Setup commands and options
    this.setupCommands();
  }

  /**
   * Parse and Execute CLI Command
   *
   * @param args Command line arguments
   */
  public async parseAndExecute(args: string[]): Promise<void> {
    // 检查是否使用了--list选项
    if (args.includes('--list') || args.includes('-l')) {
      await this.handleListOption();

      return;
    }

    // Parse command using Commander.js
    await this.program.parseAsync(args, { from: 'user' });
  }

  /**
   * Get CLI Version
   *
   * @returns Version string
   */
  public getVersion(): string {
    try {
      // 使用fs同步读取package.json
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      // 注意：从当前文件向上三级目录获取package.json
      const packagePath = resolve(__dirname, '../../../package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

      return packageJson.version || '0.1.0';
    } catch (_error) {
      // 读取失败时返回默认版本
      return '0.1.0';
    }
  }

  /**
   * Set CLI Commands
   */
  private setupCommands(): void {
    // Set Basic Information
    this.program
      .name('dpml')
      .description('DPML (Deepractice Prompt Markup Language) Command Line Tool')
      .version(this.getVersion(), '-v, --version', 'Display Version');

    // 注意：--list选项由parseAndExecute方法直接处理，这里只添加标准选项帮助文档
    this.program.option('-h, --help', 'Display help information');

    // Default command handler for domain commands
    this.program
      .argument('[domain]', 'DPML domain name')
      .argument('[args...]', 'Command arguments')
      .option('-l, --list', 'List all available DPML domains') // 只是为了帮助文档显示
      .action(async (domain: string | undefined, args: string[], options: { list?: boolean }) => {
        // 如果指定了list选项，显示域列表(这不会被执行，由parseAndExecute直接处理)
        if (options.list) {
          await this.handleListOption();

          return;
        }

        // If no domain provided, show help
        if (!domain) {
          this.program.help();

          return;
        }

        // Handle domain command
        await this.handleDomainCommand(domain, args);
      });

    // Add Help Text
    this.program.addHelpText('after', `
Example:
  dpml --list     or  dpml -l          List all available domains
  dpml -v         or  dpml --version   Display Version Information
  dpml -h         or  dpml --help      Display Help Information
  dpml core validate file.xml          Validate DPML Document
  dpml agent chat config.xml           Interact with Agent

For more information, please visit: https://github.com/Deepractice/dpml
`);
  }

  /**
   * Handle List Option
   */
  private async handleListOption(): Promise<void> {
    try {
      // Get all available domains
      const domains = await this.domainDiscoverer.listDomains();

      if (domains.length === 0) {
        console.log('No available DPML domain found');

        return;
      }

      console.log('Available DPML domains:');
      console.log('');

      // Display domain list
      domains.forEach(domain => {
        console.log(`  ${domain.name}${domain.version ? ` (${domain.version})` : ''}`);
      });
    } catch (error) {
      throw new DPMLError(
        `Cannot list domains: ${error instanceof Error ? error.message : String(error)}`,
        DPMLErrorType.DISCOVERY,
        'LIST_DOMAINS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Handle Domain Command
   *
   * @param domain Domain name
   * @param args Command arguments
   */
  private async handleDomainCommand(domain: string, args: string[]): Promise<void> {
    try {
      // Find domain
      const domainInfo = await this.domainDiscoverer.tryFindDomain(domain);

      if (!domainInfo) {
        // Get available domains for better error message
        const domains = await this.domainDiscoverer.listDomains();
        const availableDomains = domains.map(d => d.name).join(', ');

        throw new DPMLError(
          `Domain not found: ${domain}. Available domains: ${availableDomains || 'none'}`,
          DPMLErrorType.DISCOVERY,
          'DOMAIN_NOT_FOUND'
        );
      }

      // Create executor
      const executor = this.executorFactory.createExecutor(domainInfo);

      // Execute command
      await executor.execute(args);
    } catch (error) {
      if (error instanceof DPMLError) {
        throw error;
      }

      throw new DPMLError(
        `Domain Command Execution Failed: ${error instanceof Error ? error.message : String(error)}`,
        DPMLErrorType.EXECUTION,
        'DOMAIN_EXECUTION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
