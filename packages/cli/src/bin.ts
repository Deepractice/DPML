/**
 * DPML CLI Binary Entry
 *
 * This file serves as the entry point for the command-line interface.
 * It directly passes command-line arguments to the execute function.
 */
import { execute } from './api/cli';

// Execute the CLI with process arguments
execute(process.argv.slice(2)).catch((error) => {
  // Handle any unexpected errors
  console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
