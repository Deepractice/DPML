import { Command } from 'commander';
import { readPackageUp } from 'read-package-up';

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
    // Parse command using Commander.js
    await this.program.parseAsync(args, { from: 'user' });
  }

  /**
   * Get CLI Version
   *
   * @returns Version string
   */
  public async getVersion(): Promise<string> {
    try {
      // Use read-package-up to find and read package.json
      const result = await readPackageUp();

      return result?.packageJson?.version || '0.1.0';
    } catch (error) {
      // Fallback to default version on error
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
      .version(this.getVersion().toString(), '-v, --version', 'Display Version')
      .option('-l, --list', 'List all available DPML domains', () => this.handleListOption());

    // Domain command processor
    this.program
      .arguments('<domain> [args...]')
      .allowUnknownOption()
      .action((domain: string, args: string[]) => {
        this.handleDomainCommand(domain, args);
      });

    // Add Help Text
    this.program.addHelpText('after', `
Example:
  dpml --list     or  dpml -l         List all available domains
  dpml -v         or  dpml --version  Display Version Information
  dpml -h         or  dpml --help     Display Help Information
  dpml core validate file.xml         Validate DPML Document
  dpml agent chat config.xml          Interact with Agent

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
        throw new DPMLError(
          `Domain not found: ${domain}`,
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
