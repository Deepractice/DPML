import * as path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec,bench}.{ts,tsx}',
      'src/__tests__/**/*.{test,spec,bench,contract,schema,e2e}.{ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/interfaces.ts',
        'src/**/index.ts',
        'src/__tests__/**/*.ts',
        'src/**/*.bench.ts',
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
    benchmark: {
      include: ['**/*.bench.{ts,tsx}'],
      outputFile: './benchmark-results.json',
    },
  },
});
