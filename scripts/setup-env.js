#!/usr/bin/env node

/**
 * Environment Check Script
 * Validates Node.js and pnpm versions, and provides guidance
 */

import semver from 'semver';
import { execSync } from 'child_process';
import chalk from 'chalk';

const requiredNodeVersion = '22.14.0';
const requiredPnpmVersion = '10.7.0';

// Check Node.js version
try {
  const nodeVersion = process.version;
  console.log(`Current Node.js version: ${nodeVersion}`);
  
  if (!semver.satisfies(nodeVersion, requiredNodeVersion)) {
    console.log(chalk.yellow(`Recommended Node.js version: ${requiredNodeVersion}`));
    console.log(chalk.blue('Installation options:'));
    console.log('1. Using nvm: nvm install 22.14.0 && nvm use 22.14.0');
    console.log('2. Download from Node.js website: https://nodejs.org/');
    console.log('3. Recommended: Install Volta for automatic version management: https://volta.sh/');
  } else {
    console.log(chalk.green('✓ Node.js version meets requirements'));
  }
} catch (error) {
  console.error(chalk.red('Unable to check Node.js version'));
}

// Check pnpm version
try {
  let pnpmVersion;
  try {
    pnpmVersion = execSync('pnpm --version').toString().trim();
    console.log(`Current pnpm version: ${pnpmVersion}`);
  } catch (error) {
    console.log(chalk.yellow('pnpm not installed'));
    console.log('Installation: npm install -g pnpm@10.7.0');
    process.exit(0);
  }
  
  if (!semver.satisfies(pnpmVersion, requiredPnpmVersion)) {
    console.log(chalk.yellow(`Recommended pnpm version: ${requiredPnpmVersion}`));
    console.log('Upgrade: npm install -g pnpm@10.7.0');
  } else {
    console.log(chalk.green('✓ pnpm version meets requirements'));
  }
} catch (error) {
  console.error(chalk.red('Unable to check pnpm version'));
}

console.log('\nTip: Using Volta is the easiest way to manage Node.js and pnpm versions');
console.log('Install Volta: curl https://get.volta.sh | bash (macOS/Linux) or https://volta.sh/ (Windows)'); 