import { defineConfig } from 'tsup';
import * as path from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: false,
  outDir: 'dist',
  treeshake: true,
  splitting: true,
  noExternal: [],
  skipNodeModulesBundle: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
  esbuildOptions(options) {
    options.alias = {
      '@prompt': path.resolve(__dirname, './src'),
      '@dpml/core': path.resolve(__dirname, '../core/src')
    };
  }
}); 