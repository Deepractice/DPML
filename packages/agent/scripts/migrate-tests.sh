#!/bin/bash

# 确保目录存在
mkdir -p src/tests/unit/memory src/tests/unit/agent src/tests/unit/state src/tests/unit/events src/tests/unit/apiKey src/tests/unit/security src/tests/unit/connector
mkdir -p src/tests/integration src/tests/performance src/tests/usecase src/tests/fixtures src/tests/tags

# 复制测试文件
echo "正在复制测试文件..."
cp -r tests/unit/* src/tests/unit/
cp -r tests/integration/* src/tests/integration/
cp -r tests/performance/* src/tests/performance/
cp -r tests/usecase/* src/tests/usecase/
cp -r tests/fixtures/* src/tests/fixtures/
cp -r tests/tags/* src/tests/tags/

# 修改导入路径
echo "正在修改导入路径..."
# find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src\//\.\.\/\.\.\//g' {} \;
# find src/tests -type f -name "*.spec.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src\//\.\.\/\.\.\//g' {} \;

# 正确的修改命令
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src/\.\.\/.\.\.\/\.\.\//g' {} \;
find src/tests/unit -type f -name "*.spec.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src/\.\.\/.\.\.\/\.\.\//g' {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src/\.\.\/.\.\.\/\.\.\//g' {} \;
find src/tests/performance -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src/\.\.\/.\.\.\/\.\.\//g' {} \;
find src/tests/usecase -type f -name "*.test.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/src/\.\.\/.\.\.\/\.\.\//g' {} \;

# 修改配置文件
echo "正在更新 vitest.config.ts..."
sed -i '' 's/tests\/\*\*\/\*\.test\.ts/src\/tests\/\*\*\/\*\.test\.ts/g' vitest.config.ts

echo "正在更新 tsconfig.json..."
sed -i '' 's/"exclude": \["node_modules", "dist", "tests"\]/"exclude": \["node_modules", "dist", "tests", "src\/tests\/\*\*\/\*"\]/g' tsconfig.json

echo "迁移完成！"
echo "测试文件已迁移到 src/tests/ 目录"
echo "请运行测试验证一切正常："
echo "  npm run test"
echo "如果测试通过，可以删除旧的测试目录："
echo "  rm -rf tests/" 