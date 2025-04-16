import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    exclude: ['node_modules'],
    testTimeout: 10000,
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', 'src/tests/**/*.ts'],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@dpml/common': resolve(__dirname, './src'),
      '@dpml/common/logger': resolve(__dirname, './src/logger'),
      '@dpml/common/testing': resolve(__dirname, './src/testing'),
      '@dpml/common/utils': resolve(__dirname, './src/utils'),
      '@dpml/common/types': resolve(__dirname, './src/types'),
    },
  },
});
