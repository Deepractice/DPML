import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.base.config';
import * as path from 'path';

export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/logger/index.ts',
    'src/testing/index.ts',
    'src/utils/index.ts',
    'src/types/index.ts',
  ],
  esbuildOptions(options) {
    options.external = [...(options.external || []), './factories'];
    options.alias = {
      '@common': path.resolve(__dirname, './src')
    };
  },
});