import * as path from 'path';

import { defineConfig } from 'tsup';

import { baseConfig } from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  esbuildOptions(options) {
    options.alias = {
      '@workflow': path.resolve(__dirname, './src'),
    };
  },
});
