# DPML 测试迁移指南

DPML项目最近完成了测试目录结构的迁移，将测试文件从独立的`tests/`目录移动到`src/tests/`目录。本文档解释了此次迁移的背景、好处以及为各个包完成迁移的步骤。

## 迁移背景

之前，DPML项目遵循传统的目录结构，将测试文件与源代码分开放置：

```
package-root/
  src/
    core/
    utils/
  tests/
    core/
    utils/
```

新的结构将测试文件放置在源代码目录内的专用子目录中：

```
package-root/
  src/
    core/
    utils/
    tests/
      core/
      utils/
```

## 迁移好处

1. **简化导入路径**：测试文件可以使用更简短的相对路径导入被测试代码
2. **统一路径别名**：测试可以使用与源代码相同的`@packageName`路径别名
3. **更好的测试共享**：测试辅助工具和共享代码更容易在测试之间重用
4. **更密切的代码关系**：测试与被测试代码在同一目录树中，强化了它们的关系
5. **简化配置**：不再需要为测试配置单独的路径别名或解析规则
6. **更容易的重构**：移动源代码时，相关测试代码的导入路径更容易维护

## 迁移步骤

所有包都应遵循以下步骤完成测试迁移。截至目前，已完成迁移的包括：

- `@dpml/core`
- `@dpml/agent`
- `@dpml/prompt`
- `@dpml/cli`

### 迁移脚本

每个包的迁移过程基本相同，我们为每个包准备了迁移脚本：

1. `migrate-tests.sh` - 将测试文件从`tests/`移动到`src/tests/`
2. `fix-imports.sh` - 修复测试文件中的导入路径

### 迁移步骤

1. **创建迁移脚本**：

```bash
# migrate-tests.sh
#!/bin/bash

# 创建目标目录
mkdir -p src/tests/[目录列表]

# 复制测试文件
cp -r tests/[源目录]/* src/tests/[目标目录]/ 2>/dev/null || true

# 修改导入路径 - 将 ../../src/ 替换为 ../../
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/src\//\.\.\/\.\.\//g' {} \;

# 通知用户
echo "测试文件已迁移到 src/tests/ 目录"
echo "请确保在 tsconfig.json 和 vitest.config.ts 中更新配置"
echo "运行 ./scripts/fix-imports.sh 修复导入路径问题"
echo "完成后删除旧测试目录: rm -rf tests/"
```

```bash
# fix-imports.sh
#!/bin/bash

# 修复导入路径问题
echo "开始修复测试文件导入路径..."

# 替换模块导入路径
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src\//from "\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\/\.\.\//g' {} \;

# 修复路径别名
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "@packageName\//from "@packageName\//g' {} \;

# 修复相对路径引用测试辅助工具
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/tests\//from "\.\.\/\.\.\//g' {} \;

# 修复深层路径问题
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/require("\.\.\/\.\.\/src/require("\.\.\/\.\.\//g' {} \;

echo "导入路径修复完成！"
```

2. **更新配置文件**：

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@packageName': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    // 其他配置...
    coverage: {
      // 更新排除规则
      exclude: [
        // 原有排除规则...
        'src/tests/**/*.ts',
      ],
    },
  },
});
```

`tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true,
    "declarationDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

3. **执行迁移**：

```bash
# 赋予脚本执行权限
chmod +x scripts/migrate-tests.sh scripts/fix-imports.sh

# 运行迁移脚本
./scripts/migrate-tests.sh

# 修复导入路径
./scripts/fix-imports.sh

# 运行测试确认
pnpm test

# 如果测试通过，删除旧的测试目录
rm -rf tests/
```

## 维护测试代码

迁移后，所有新的测试文件应放置在`src/tests/`目录下，并遵循与源代码相同的目录结构。例如，如果有一个`src/utils/formatter.ts`文件，对应的测试应该是`src/tests/utils/formatter.test.ts`。

导入路径应使用相对路径或包内路径别名：

```typescript
// 使用相对路径
import { formatter } from '../../utils/formatter';

// 或使用包内路径别名
import { formatter } from '@packageName/utils/formatter';
```

## 测试结构建议

- `src/tests/unit/` - 单元测试
- `src/tests/integration/` - 集成测试
- `src/tests/utils/` - 测试辅助工具
- `src/tests/fixtures/` - 测试数据和夹具

## 常见问题

### 导入路径问题

如果测试运行失败，最常见的原因是导入路径问题。检查以下几点：

1. 确保相对路径正确（从测试文件到被测文件）
2. 确保路径别名在vitest.config.ts中正确配置
3. 使用`../`而非`../../src`导入上级目录的文件

### 测试夹具问题

如果测试使用了独立的测试夹具目录，可能需要手动移动或更新相关引用。确保夹具文件也移动到`src/tests/fixtures/`目录。

### CI/CD配置

如果有CI/CD配置使用了测试目录路径，确保更新相关配置文件。

## 结论

测试文件迁移到`src/tests/`目录是DPML项目测试实践的重要改进。它简化了导入路径，改善了开发体验，并使测试与源代码的关系更加紧密。

所有包应该按照本指南完成测试迁移，确保项目中测试结构的一致性。
