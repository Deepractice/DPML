#!/bin/bash

# 修复集成测试中的导入路径
echo "开始修复集成测试文件导入路径..."

# 修复 advanced.integration.test.ts 和 basic.integration.test.ts 文件中的模块导入
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src"/from "\.\.\/\.\."/g' {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/types"/from "\.\.\/\.\.\/\.\.\/types"/g' {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/api"/from "\.\.\/\.\.\/\.\.\/api"/g' {} \;

# 修复模拟导入 - 使用更安全的格式
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' "s/vi.mock('..\/..\/src', async/vi.mock('..\/..', async/g" {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/vi\.mock("\.\.\/\.\.\/src", async/vi.mock("../..", async/g' {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' "s/await vi.importActual('..\/..\/src')/await vi.importActual('..\/...')/g" {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/await vi\.importActual("\.\.\/\.\.\/src")/await vi.importActual("../..")/g' {} \;

# 修复 usecases 测试
find src/tests/usecases -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src"/from "\.\.\/\.\."/g' {} \;
find src/tests/usecases -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/types"/from "\.\.\/\.\.\/\.\.\/types"/g' {} \;

# 修复 compatibility 测试
find src/tests/compatibility -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src"/from "\.\.\/\.\."/g' {} \;
find src/tests/compatibility -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/package.json"/from "\.\.\/\.\.\/\.\.\/package.json"/g' {} \;

echo "集成测试导入路径修复完成！" 