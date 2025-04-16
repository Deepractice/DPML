#!/bin/bash

# 修复导入路径问题
echo "开始修复测试文件导入路径..."

# 替换模块导入路径
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src\//from "\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\/\.\.\//g' {} \;

# 修复 @core 路径别名
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "@core\//from "@core\//g' {} \;

# 修复相对路径引用测试辅助工具
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/tests\//from "\.\.\/\.\.\//g' {} \;

# 修复深层路径问题
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/require("\.\.\/\.\.\/src/require("\.\.\/\.\.\//g' {} \;

echo "导入路径修复完成！" 