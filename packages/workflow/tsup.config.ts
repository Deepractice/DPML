import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.base.config';
import * as path from 'path';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  esbuildOptions(options) {
    options.alias = {
      '@workflow': path.resolve(__dirname, './src')
    };
  }
}); 