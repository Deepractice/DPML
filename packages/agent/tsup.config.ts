import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  tsconfig: 'tsconfig.build.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.banner = {
      js: options.entryNames?.includes('bin') ? "#!/usr/bin/env node" : "",
    };
  },
  shims: true
});
