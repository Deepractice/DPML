import type { DomainInfo } from './DomainInfo';

/**
 * Domain Executor interface
 *
 * Define standard interfaces for executing domain commands.
 */
export interface DomainExecutor {
  /**
   * Get Domain Information
   * @returns Domain Information
   */
  getDomainInfo(): DomainInfo;

  /**
   * Execute Domain Command
   * @param args Command line arguments
   * @returns Promise to void
   */
  execute(args: string[]): Promise<void>;
}
