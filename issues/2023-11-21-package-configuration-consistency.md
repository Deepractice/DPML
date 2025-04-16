# DPML包配置一致性问题

## 问题概述

在集成`@dpml/common`和`@dpml/cli`等包时发现，各包之间的配置存在不一致，导致模块导入异常、类型解析失败等问题。这些问题不仅影响开发体验，还可能导致构建产物不一致和运行时错误。

## 详细分析

通过对多个包的配置文件分析，发现以下几类不一致问题：

### 1. 模块系统与格式不一致

| 包名 | package.json type | 主要输出格式 | 输出扩展名 | tsup构建优先级 |
|------|------------------|------------|-----------|--------------|
| @dpml/common | "module" | ESM+CJS | .js/.cjs | esm, cjs |
| @dpml/cli | 未指定(默认CJS) | ESM+CJS | .mjs/.js | cjs, esm |

这种不一致导致:
- 导入解析策略不同
- 不同包可能选择不同默认格式
- 类型定义文件可能与实际格式不匹配

### 2. TypeScript配置不一致

根项目的`tsconfig.json`使用`"moduleResolution": "node"`(旧版)，而现代包管理和ESM支持需要`node16`、`nodenext`或`bundler`解析策略。

子包tsconfig配置也存在差异:
- 部分包指定了`rootDir`
- 部分包使用不同的`paths`映射
- 类型生成选项不一致

### 3. 导出配置与使用方式不匹配

`@dpml/common`包通过package.json配置了子路径导出:
```json
"exports": {
  "./logger": {
    "types": "./dist/logger/index.d.ts",
    "import": "./dist/logger/index.js",
    "require": "./dist/logger/index.cjs"
  },
  // ...
}
```

但实际代码中可能使用了不规范的导入路径:
```typescript
// 错误用法
import { ... } from '@dpml/common/dist/logger';

// 应该使用的标准路径
import { ... } from '@dpml/common/logger';
```

### 4. 构建工具配置差异

尽管都使用tsup，不同包的构建配置存在明显差异:
- 入口文件定义方式不同
- 输出格式优先级不同
- 扩展名规则不一致
- 部分特殊选项未统一

## 影响范围

这些不一致性问题影响:
1. 所有DPML子包之间的互操作性
2. 开发者导入和使用各包的体验
3. 包构建产物的一致性和可靠性
4. 项目维护和重构的难度

## 解决方案

建议采取以下统一方案:

### 1. 模块系统统一

选择一种主要开发模式并在所有包中统一:

**ESM优先方案**(推荐):
```json
// 所有包的package.json
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

**CJS优先方案**(备选):
```json
// 所有包的package.json
{
  // 不指定type或使用"type": "commonjs"
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
    // 子路径导出...
  }
}
```

### 2. TypeScript配置统一

更新根目录tsconfig.json:
```json
{
  "compilerOptions": {
    // 现代模块解析
    "moduleResolution": "bundler", // 或 "node16"/"nodenext" 
    "target": "ES2020",
    "module": "ESNext",
    // 其他设置保持不变...
  }
}
```

确保所有子包tsconfig.json保持一致的扩展基础配置:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
    // 特定包需要的其他选项...
  }
}
```

### 3. 构建工具配置统一

为所有包创建统一的tsup基础配置:

```typescript
// 基础配置
export const baseConfig = {
  format: ['esm', 'cjs'],  // ESM优先
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.js' : '.cjs'  // ESM=>.js, CJS=>.cjs
  })
};

// 每个包配置
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', /* 包特定入口 */],
  // 包特定设置...
});
```

### 4. 导入规范统一

确保在所有包的代码中使用标准导入路径:

```typescript
// 导入命名空间
import { logger } from '@dpml/common';
// 使用命名空间
logger.createLogger('app');

// 或直接导入子模块
import { createLogger } from '@dpml/common/logger';
// 直接使用
createLogger('app');
```

废弃以下导入方式:
```typescript
// ❌ 避免使用内部路径
import { ... } from '@dpml/common/dist/logger';
```

## 优先级

高 - 此问题直接影响开发效率和包的稳定性，应优先解决。

## 实施计划

1. 选择并确定统一的模块策略(ESM或CJS优先)
2. 更新根目录和所有包的tsconfig.json
3. 统一package.json的导出字段
4. 创建并应用统一的tsup配置
5. 更新所有导入语句为规范路径
6. 测试所有包之间的集成

---

提交人: [Your Name]  
日期: 2023-11-21 