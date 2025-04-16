#!/bin/bash

# 创建目标目录
mkdir -p src/tests/parser src/tests/integration src/tests/transformer src/tests/processor src/tests/utils src/tests/types src/tests/errors

# 复制测试文件
cp -r tests/parser/* src/tests/parser/ 2>/dev/null || true
cp -r tests/integration/* src/tests/integration/ 2>/dev/null || true
cp -r tests/transformer/* src/tests/transformer/ 2>/dev/null || true
cp -r tests/processor/* src/tests/processor/ 2>/dev/null || true
cp -r tests/utils/* src/tests/utils/ 2>/dev/null || true
cp -r tests/types/* src/tests/types/ 2>/dev/null || true
cp -r tests/errors/* src/tests/errors/ 2>/dev/null || true

# 修改导入路径 - 将 ../../src/ 替换为 ../../
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/src\//\.\.\/\.\.\//g' {} \;

# 通知用户
echo "测试文件已迁移到 src/tests/ 目录"
echo "请确保在 tsconfig.json 和 vitest.config.ts 中更新配置"
echo "运行 ./scripts/fix-imports.sh 修复导入路径问题"
echo "完成后删除旧测试目录: rm -rf tests/" 