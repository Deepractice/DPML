/**
 * Command Adapter interface
 *
 * Define standard interfaces for command line parsing and execution.
 */
export interface CommandAdapter {
  /**
   * Parse and Execute CLI Command
   * @param args Command line arguments
   * @returns Promise to void
   */
  parseAndExecute(args: string[]): Promise<void>;

  /**
   * Get CLI Version
   * @returns Version string
   */
  getVersion(): string;
}
