import { execa } from 'execa';

import type { DomainExecutor } from '../../types/DomainExecutor';
import type { DomainInfo } from '../../types/DomainInfo';
import { DPMLError, DPMLErrorType } from '../../types/DPMLError';

/**
 * NPX Executor
 *
 * Use NPX to execute domain commands.
 */
export class NpxExecutor implements DomainExecutor {
  /**
   * Constructor
   *
   * @param domainInfo Domain Information
   */
  constructor(private readonly domainInfo: DomainInfo) {}

  /**
   * Get Domain Information
   *
   * @returns Domain Information
   */
  public getDomainInfo(): DomainInfo {
    return this.domainInfo;
  }

  /**
   * Execute Domain Command
   *
   * @param args Command arguments
   */
  public async execute(args: string[]): Promise<void> {
    try {
      // 添加域名作为第一个参数，解决命令冗余问题
      const execArgs = [this.domainInfo.name, ...args];

      // Use execa to execute npx command with the domain package
      const result = await execa('npx', [this.domainInfo.packageName, ...execArgs], {
        stdio: 'inherit', // Pass stdio stream directly
        reject: false // Don't throw on non-zero exit codes, handle manually
      });

      // Check exit code
      if (result.exitCode !== 0) {
        throw new DPMLError(
          `Command Execution Failed, Exit Code: ${result.exitCode}`,
          DPMLErrorType.EXECUTION,
          'EXECUTION_FAILED'
        );
      }
    } catch (error) {
      // Handle execution errors
      if (error instanceof DPMLError) {
        throw error;
      }

      throw new DPMLError(
        `Command Execution Error: ${error instanceof Error ? error.message : String(error)}`,
        DPMLErrorType.EXECUTION,
        'EXECUTION_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}
