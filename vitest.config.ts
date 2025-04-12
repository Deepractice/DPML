import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    typecheck: {
      tscompiler: 'ttypescript',
      include: ['**/*.{test,spec}.{ts,tsx}']
    },
    deps: {
      inline: [/ts-auto-mock/]
    }
  }
}); 