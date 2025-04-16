import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.base.config';
import * as path from 'path';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  external: ['@dpml/core', '@dpml/prompt'],
  esbuildOptions(options) {
    options.alias = {
      '@agent': path.resolve(__dirname, './src')
    };
  }
}); 