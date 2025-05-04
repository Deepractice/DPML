#!/usr/bin/env node

/**
 * DPML CLI Entry Point
 * Redirects to @dpml/cli package
 */
try {
  // Try to load through package name - for production environment
  require('@dpml/cli/dist/bin.js');
} catch (error) {
  try {
    // If not found, try to load from workspace path - for development environment
    require('../cli/dist/bin.js');
  } catch (fallbackError) {
    console.error('DPML CLI loading failed:', error.message);
    console.error('Please make sure @dpml/cli package is installed and built');
    process.exit(1);
  }
} 