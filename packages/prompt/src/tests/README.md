# 测试迁移说明

## 迁移概述

根据项目测试目录迁移指南，我们已成功将 `packages/prompt` 包中的测试文件从 `tests/` 目录迁移到 `src/tests/` 目录。

## 完成的工作

1. 创建了迁移脚本 `scripts/migrate-tests.sh`
2. 创建了导入路径修复脚本 `scripts/fix-imports.sh` 和 `scripts/fix-integration-tests.sh`
3. 更新了 `vitest.config.ts` 配置，将测试路径从 `tests/**/*.test.ts` 改为 `src/tests/**/*.test.ts`
4. 更新了 `tsconfig.json`，排除 `src/tests/**/*`
5. 手动修复了集成测试文件中的导入路径问题
6. 删除了旧的 `tests/` 目录

## 迁移后的测试状态

- 测试文件总数：32 个
- 测试用例总数：119 个
- 测试通过率：100%

## 注意事项

1. 在迁移过程中，主要遇到的问题是导入路径的修复，特别是在集成测试和用例测试中。
2. 对于模拟导入（如 `vi.mock` 和 `vi.importActual`）的路径需要特别注意。
3. 如果将来添加新的测试，请遵循新的目录结构规范，将测试文件放在 `src/tests/` 目录下。

## 目录结构

```
packages/prompt/
├── src/
│   ├── ...
│   └── tests/
│       ├── api/
│       ├── compatibility/
│       ├── errors/
│       ├── formatConfig/
│       ├── integration/
│       ├── multilang/
│       ├── performance/
│       ├── processors/
│       ├── tags/
│       ├── transformers/
│       └── usecases/
└── scripts/
    ├── migrate-tests.sh
    ├── fix-imports.sh
    └── fix-integration-tests.sh
``` 