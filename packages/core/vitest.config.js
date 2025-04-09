import { defineConfig } from 'vitest/config';
import * as path from 'path';
export default defineConfig({
    resolve: {
        alias: {
            '@core': path.resolve(__dirname, './src')
        }
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
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
//# sourceMappingURL=vitest.config.js.map