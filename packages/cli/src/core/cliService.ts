import type { CommandAdapter } from '../types/CommandAdapter';
import type { DomainDiscoverer } from '../types/DomainDiscoverer';
import { DPMLError, DPMLErrorType } from '../types/DPMLError';

import { CommanderAdapter } from './adapters/CommanderAdapter';
import { NpxDiscoverer } from './discovery/NpxDiscoverer';
import { ExecutorFactory } from './execution/ExecutorFactory';

/**
 * CLI Service
 *
 * Top-level service module coordinating command parsing and execution.
 */
export const cliService = {
  /**
   * Execute CLI Command
   *
   * @param args Command line arguments
   * @returns Promise to void
   */
  async execute(args: string[]): Promise<void> {
    try {
      // Initialize components
      const components = await this.initialize();

      // Execute command using the command adapter
      await components.commandAdapter.parseAndExecute(args);
    } catch (error) {
      // Handle error
      this.handleError(error);
    }
  },

  /**
   * Initialize CLI Components
   *
   * @returns Initialized component object
   */
  async initialize(): Promise<{
    domainDiscoverer: DomainDiscoverer;
    executorFactory: ExecutorFactory;
    commandAdapter: CommandAdapter;
  }> {
    // Create domain discoverer
    const domainDiscoverer = new NpxDiscoverer();

    // Create executor factory
    const executorFactory = new ExecutorFactory();

    // Create command adapter
    const commandAdapter = new CommanderAdapter(domainDiscoverer, executorFactory);

    return {
      domainDiscoverer,
      executorFactory,
      commandAdapter
    };
  },

  /**
   * Handle Error
   *
   * @param error Error object
   */
  handleError(error: unknown): never {
    // Already DPML error, directly handle
    if (error instanceof DPMLError) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }

    // Convert to DPML error
    const dpmlError = new DPMLError(
      error instanceof Error ? error.message : String(error),
      DPMLErrorType.UNKNOWN,
      'UNKNOWN_ERROR',
      error instanceof Error ? error : undefined
    );

    console.error(`Unknown Error: ${dpmlError.message}`);
    process.exit(1);
  }
};
