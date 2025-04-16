import { Options } from 'tsup';

/**
 * DPML包的基础tsup配置
 * 统一构建输出格式与规范
 */
export const baseConfig: Options = {
  format: ['esm', 'cjs'],  // ESM优先
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: true,
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs'  // ESM=>.js, CJS=>.cjs
    };
  },
  skipNodeModulesBundle: true,
  minify: false
}; 