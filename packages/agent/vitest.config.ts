import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./vitest.setup.ts'],
    typecheck: {
      checker: 'typescript',
      tsconfig: './tsconfig.json'
    },
    deps: {
      inline: [/ts-auto-mock/]
    }
  },
  resolve: {
    alias: {
      '@agent': resolve(__dirname, './src'),
    },
  },
}); 