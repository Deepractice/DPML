import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.base.config';
import * as path from 'path';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['esm', 'cjs'],
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
      js: format === 'esm' ? '.js' : '.cjs',
    };
  },
  esbuildOptions(options) {
    options.alias = {
      '@cli': path.resolve(__dirname, './src')
    };
  }
});
