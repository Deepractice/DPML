import * as path from 'path';

import { defineConfig } from 'tsup';

import { baseConfig } from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  esbuildOptions(options) {
    options.alias = {
      '@prompt': path.resolve(__dirname, './src'),
      '@dpml/core': path.resolve(__dirname, '../core/src'),
    };
  },
});
