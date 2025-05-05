#!/usr/bin/env node

/**
 * DPML CLI Entry Point
 * Redirects to @dpml/cli package
 */
(async () => {
  try {
    // Try to load through package name - for production environment
    const cliPath = require.resolve('@dpml/cli');
    const binPath = cliPath.replace(/[\\/]dist[\\/]index\.cjs$|[\\/]dist[\\/]index\.js$/, '/dist/bin.js');
    await import(binPath);
  } catch (error) {
    try {
      // If not found, try to load from workspace path - for development environment
      await import('../cli/dist/bin.js');
    } catch (fallbackError) {
      console.error('DPML CLI loading failed:', error.message);
      console.error('Please make sure @dpml/cli package is installed and built');
      process.exit(1);
    }
  }
})(); 