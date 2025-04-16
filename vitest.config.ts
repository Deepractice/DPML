import * as path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@agent': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    typecheck: {
      enabled: false,
    },
    setupFiles: ['./vitest.setup.ts'],
    deps: {
      inline: [/@dpml\/.*/],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/interfaces.ts',
        'src/**/index.ts',
        'src/tests/**/*.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      all: true,
      reportsDirectory: './coverage',
    },
  },
});
