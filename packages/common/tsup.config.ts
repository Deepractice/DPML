import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/logger/index.ts',
    'src/testing/index.ts',
    'src/utils/index.ts',
    'src/types/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
}); 