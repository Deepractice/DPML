#!/usr/bin/env node

/**
 * Script to automatically create an empty changeset for CI
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get all workspace packages
const getPackages = () => {
  const output = execSync('pnpm ls --json', { encoding: 'utf-8' });
  const packages = JSON.parse(output).filter(pkg => !pkg.private);
  return packages.map(pkg => pkg.name);
};

// Create empty changeset
const createChangeset = (packages) => {
  // Generate a unique ID
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const changesetId = `ci-auto-${timestamp}`;
  const changesetDir = '.changeset';
  
  // Ensure directory exists
  if (!fs.existsSync(changesetDir)) {
    fs.mkdirSync(changesetDir, { recursive: true });
  }
  
  // Create changeset file
  const content = {
    summary: 'CI auto-generated snapshot release',
    packages: packages.reduce((acc, name) => {
      acc[name] = { type: 'patch' };
      return acc;
    }, {})
  };
  
  const filePath = path.join(changesetDir, `${changesetId}.md`);
  
  const mdContent = `---
${JSON.stringify(content, null, 2)}
---

CI auto-generated snapshot release
`;
  
  fs.writeFileSync(filePath, mdContent, 'utf-8');
  console.log(`Created changeset: ${filePath}`);
};

// Main function
const main = () => {
  try {
    const packages = getPackages();
    if (packages.length === 0) {
      console.log('No packages found in workspace');
      return;
    }
    
    createChangeset(packages);
  } catch (error) {
    console.error('Error creating changeset:', error);
    process.exit(1);
  }
};

main(); 