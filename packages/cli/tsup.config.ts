import { defineConfig } from 'tsup';
import * as path from 'path';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  outDir: 'dist',
  treeshake: true,
  splitting: true,
  skipNodeModulesBundle: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
  esbuildOptions(options) {
    options.alias = {
      '@cli': path.resolve(__dirname, './src')
    };
  }
});
