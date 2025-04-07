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
  noExternal: ['fast-xml-parser'],
  skipNodeModulesBundle: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
  esbuildOptions(options) {
    options.alias = {
      '@core': path.resolve(process.cwd(), './src')
    };
  }
}); 