#!/usr/bin/env node

import { build } from 'tsup';

async function buildTypes() {
  console.log('Building @dpml/common/types...');
  
  await build({
    entry: ['src/types/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    outDir: 'dist/types',
  });
  
  console.log('Types built successfully');
}

buildTypes().catch(err => {
  console.error('Error building types:', err);
  process.exit(1);
}); 