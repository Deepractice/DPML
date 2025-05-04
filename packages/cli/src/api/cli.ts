import { cliService } from '../core/cliService';

/**
 * Execute CLI Command
 *
 * Process command line arguments and route to the corresponding domain package.
 *
 * @param args Command line arguments, default is process.argv.slice(2)
 * @returns Promise to void
 */
export async function execute(args: string[] = process.argv.slice(2)): Promise<void> {
  // 委托给cliService执行命令
  return cliService.execute(args);
}
