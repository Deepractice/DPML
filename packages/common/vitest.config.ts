import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['./tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
      all: true
    },
  },
  resolve: {
    alias: {
      '@common': resolve(__dirname, './src'),
    },
  },
}); 