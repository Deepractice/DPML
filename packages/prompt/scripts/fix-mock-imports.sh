#!/bin/bash

# 修复测试文件中的模拟导入路径
echo "开始修复测试文件中的模拟导入..."

# 修复 vi.importActual 调用中的路径问题
find src/tests -type f -name "*.test.ts" -exec sed -i '' "s/await vi.importActual('../...');/await vi.importActual('../..');/g" {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' "s/await vi.importActual('../../src');/await vi.importActual('../..');/g" {} \;

# 在集成测试中修复特定路径
sed -i '' "s/actual = await vi.importActual('../...');/actual = await vi.importActual('../..');/g" src/tests/integration/basic.integration.test.ts
sed -i '' "s/actual = await vi.importActual('../...');/actual = await vi.importActual('../..');/g" src/tests/integration/advanced.integration.test.ts

# 直接编辑文件修复常见问题
sed -i '' "s/'..\/..\/src'/'..\/..'/g" $(find src/tests -type f -name "*.test.ts")
sed -i '' 's/"..\/..\/src"/"..\/.."/g' $(find src/tests -type f -name "*.test.ts")
sed -i '' "s/from '..\/..\/src'/from '..\/..'/g" $(find src/tests -type f -name "*.test.ts")
sed -i '' 's/from "..\/..\/src"/from "..\/.."/g' $(find src/tests -type f -name "*.test.ts")

# 修复从../..../src这样的导入
sed -i '' "s/'..\/..\/..\/src'/'..\/..\/..'/g" $(find src/tests -type f -name "*.test.ts")
sed -i '' 's/"..\/..\/..\/src"/"..\/..\/.."/g' $(find src/tests -type f -name "*.test.ts")

# 修复用例测试中的导入
find src/tests/usecases -type f -name "*.test.ts" -exec sed -i '' "s/vi.mock('../../src',/vi.mock('../..',/g" {} \;
find src/tests/usecases -type f -name "*.test.ts" -exec sed -i '' "s/await vi.importActual('../../src')/await vi.importActual('../..')/g" {} \;

# 修复兼容性测试中的导入
find src/tests/compatibility -type f -name "*.test.ts" -exec sed -i '' "s/vi.mock('../../src',/vi.mock('../..',/g" {} \;
find src/tests/compatibility -type f -name "*.test.ts" -exec sed -i '' "s/await vi.importActual('../../src')/await vi.importActual('../..')/g" {} \;

# 修复 types 导入
find src/tests -type f -name "*.test.ts" -exec sed -i '' "s/from '..\/..\/types'/from '..\/..\/..\/types'/g" {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "..\/..\/types"/from "..\/..\/..\/types"/g' {} \;

# 修复 package.json 导入
find src/tests/compatibility -type f -name "*.test.ts" -exec sed -i '' "s/from '..\/..\/package.json'/from '..\/..\/..\/package.json'/g" {} \;
find src/tests/compatibility -type f -name "*.test.ts" -exec sed -i '' 's/from "..\/..\/package.json"/from "..\/..\/..\/package.json"/g' {} \;

echo "模拟导入路径修复完成！" 