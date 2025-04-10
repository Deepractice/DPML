import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@prompt': path.resolve(__dirname, './src'),
      '@dpml/core': path.resolve(__dirname, '../core/src'),
      '@core': path.resolve(__dirname, '../core/src'),
      '@dpml/core/types/node': path.resolve(__dirname, '../core/src/types/node'),
      '@dpml/core/errors/types': path.resolve(__dirname, '../core/src/errors/types')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['../core/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/interfaces.ts',
        'src/**/index.ts',
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