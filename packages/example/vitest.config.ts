import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 不使用setup文件
    setupFiles: [],
    // 包含测试文件
    include: ['src/tests/**/*.test.ts'],
    // 环境
    environment: 'node'
  }
});
