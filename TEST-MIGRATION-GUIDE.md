# 测试目录迁移指南

## 背景与动机

我们的项目原先将测试文件存放在各包的 `tests/` 目录下，这种结构会导致以下问题：

1. 导入路径复杂：需要使用 `../../src/...` 这样的复杂相对路径
2. 路径别名配置不生效：无法充分利用已配置的路径别名（如 `@cli/*`）
3. 开发体验差：编辑器往往无法正确地在源文件和测试文件之间导航

为解决以上问题，我们决定将测试文件迁移到 `src/tests/` 目录下，这样可以：

1. 简化导入路径：从 `../../src/...` 变为 `../../...`
2. 使用路径别名：可以利用已配置的路径别名，如 `@cli/*`
3. 改善开发体验：改善代码导航和智能提示

## 迁移步骤概述

1. 更新配置文件（vitest.config.ts 和 tsconfig.json）
2. 创建新的目录结构
3. 复制测试文件到新位置
4. 修复导入路径
5. 运行测试验证
6. 删除旧的测试目录

## 各包迁移指南

### CLI 包迁移

1. 执行迁移脚本：

```bash
cd packages/cli
./scripts/migrate-tests.sh
```

2. 验证测试是否通过：

```bash
npm run test
```

3. 成功后删除旧目录：

```bash
rm -rf tests/
```

### Agent 包迁移

1. 执行迁移脚本：

```bash
cd packages/agent
./scripts/migrate-tests.sh
```

2. 修复导入路径（如有需要）：

```bash
./scripts/fix-imports.sh
```

3. 验证测试是否通过：

```bash
npm run test
```

4. 成功后删除旧目录：

```bash
rm -rf tests/
```

### 其他包迁移

对于其他包，可以参考以下步骤：

1. 复制并适配迁移脚本：

```bash
cp packages/cli/scripts/migrate-tests.sh packages/YOUR_PACKAGE/scripts/
cp packages/cli/scripts/fix-imports.sh packages/YOUR_PACKAGE/scripts/
# 根据需要修改脚本内容
```

2. 执行迁移脚本：

```bash
cd packages/YOUR_PACKAGE
./scripts/migrate-tests.sh
```

3. 验证并清理

## 迁移配置详解

### vitest.config.ts 更新

```typescript
// 修改前
test: {
  include: ['tests/**/*.test.ts'],
  // ...
}

// 修改后
test: {
  include: ['src/tests/**/*.test.ts'],
  // ...
  coverage: {
    // ...
    exclude: [
      // ...
      'src/tests/**/*.ts',
    ],
  }
}
```

### tsconfig.json 更新

```json
// 修改前
{
  "exclude": ["node_modules", "dist", "tests"]
}

// 修改后
{
  "exclude": ["node_modules", "dist", "tests", "src/tests/**/*"]
}
```

## 常见问题及解决方法

1. **导入路径问题**：如果测试运行失败，通常是导入路径问题。执行 `fix-imports.sh` 脚本可以修复大部分导入问题。

2. **特殊导入路径**：对于一些特殊的导入路径，可能需要手动修复：

```bash
# 对于深层嵌套的导入路径
sed -i '' 's/from "..\/..\/..\/..\/tags/from "..\/..\/..\/..\/..\/tags/g' src/tests/some/deep/path/file.test.ts
```

3. **测试逻辑问题**：有些测试失败可能与导入路径无关，而是测试逻辑问题，需要单独处理。

## 新项目结构约定

迁移后，我们采用以下目录结构约定：

```
packages/
  ├── some-package/
  │   ├── src/
  │   │   ├── feature1/
  │   │   ├── feature2/
  │   │   └── tests/  # 新的测试目录
  │   │       ├── unit/
  │   │       ├── integration/
  │   │       └── ...
  │   ├── scripts/
  │   │   ├── migrate-tests.sh
  │   │   └── fix-imports.sh
  │   ├── tsconfig.json
  │   └── vitest.config.ts
```

今后，所有新的测试文件应放在 `src/tests/` 目录下。

## 结论

将测试迁移到 `src/tests/` 目录可以有效解决导入路径问题，提高开发体验。尽管迁移过程可能有些复杂，但长期来看将会带来显著的改进。 