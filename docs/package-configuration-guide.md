# DPML包配置指南

本文档提供了DPML项目中所有包应遵循的配置标准，以确保一致性和互操作性。

## 模块系统

DPML项目采用**ESM优先**的模块系统策略：

```json
// package.json
{
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
    // 子路径导出...
  }
}
```

## TypeScript配置

根目录的`tsconfig.json`包含了共享的TypeScript配置，包括公共的模块解析策略、路径映射和排除项。各包的`tsconfig.json`应该保持简洁：

```json
// 包的tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

## 构建配置

所有包使用统一的tsup基础配置（在项目根目录的`tsup.base.config.ts`中定义）：

```typescript
// 包的tsup.config.ts
import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.base.config';
import * as path from 'path';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', /* 包特定入口 */],
  esbuildOptions(options) {
    options.alias = {
      '@包名称': path.resolve(__dirname, './src')
    };
    // 其他包特定设置...
  }
});
```

## 导入规范

在代码中使用以下标准导入方式：

```typescript
// 推荐：使用命名空间导入
import { something } from '@dpml/包名称';

// 推荐：使用子路径导入
import { somethingElse } from '@dpml/包名称/子路径';

// 禁止：不要使用内部路径
// ❌ import { ... } from '@dpml/包名称/dist/...';
```

## 新增包检查清单

创建新包时，请确保：

1. 包的`package.json`设置了正确的`type`和输出格式
2. `tsconfig.json`正确扩展了根配置，只包含必需的设置
3. `tsup.config.ts`使用了基础配置
4. 遵循了标准的目录结构和导入规范

## 维护现有包

更新现有包时，确保：

1. 不破坏现有的导入路径和API
2. 遵循统一的配置标准
3. 如需偏离标准配置，请在代码注释中说明原因

遵循这些指南将帮助我们保持整个DPML项目的一致性和稳定性。 