# Core 包测试迁移指南

本指南用于将 Core 包的测试从 `tests/` 目录迁移到 `src/tests/` 目录。

## 迁移步骤

1. 赋予脚本执行权限：

```bash
chmod +x scripts/migrate-tests.sh scripts/fix-imports.sh
```

2. 运行迁移脚本：

```bash
./scripts/migrate-tests.sh
```

3. 修复导入路径：

```bash
./scripts/fix-imports.sh
```

4. 手动检查并调整测试文件：
   - 确保所有 import 路径正确
   - 修复任何特殊的导入或引用

5. 运行测试确认所有测试通过：

```bash
pnpm test
```

6. 如果所有测试通过，删除旧的测试目录：

```bash
rm -rf tests/
```

## 已完成的修改

以下文件已经更新以支持新的测试结构：

1. `vitest.config.ts` - 更新测试文件路径和覆盖率配置
2. `tsconfig.json` - 更新排除规则，不再排除测试文件

## 注意事项

- 如果测试中使用了 `@core` 别名，应该继续使用该别名
- 所有从旧的 `tests/` 目录引用的辅助函数现在应该从 `src/tests/` 目录引用
- 请确保所有测试引用的模块路径都已正确更新 