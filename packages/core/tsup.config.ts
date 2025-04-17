import * as path from 'path';

import { defineConfig } from 'tsup';

import { baseConfig } from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  noExternal: ['fast-xml-parser'],
  esbuildOptions(options) {
    options.alias = {
      '@core': path.resolve(__dirname, './src')
    };
  },
});
