#!/bin/bash

# 创建目标目录
mkdir -p src/tests/core src/tests/utils

# 复制测试文件
cp -r tests/core/* src/tests/core/
cp -r tests/utils/* src/tests/utils/

# 修改导入路径 - 将 ../../src/ 替换为 ../../
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/src\//\.\.\/\.\.\//g' {} \;

# 通知用户
echo "测试文件已迁移到 src/tests/ 目录"
echo "请确保在 tsconfig.json 和 vitest.config.ts 中更新配置"
echo "删除旧测试目录: rm -rf tests/" 