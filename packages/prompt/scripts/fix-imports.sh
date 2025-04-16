#!/bin/bash

# 修复导入路径问题
echo "开始修复测试文件导入路径..."

# 替换模块导入路径 - 处理各种嵌套层级
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/src\//from "\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/\.\.\/\.\.\/src\//from "\.\.\/\.\.\/\.\.\/\.\.\//g' {} \;

# 替换 require 路径
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/require("\.\.\/\.\.\/src\//require("\.\.\/\.\.\//g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/require("\.\.\/\.\.\/\.\.\/src\//require("\.\.\/\.\.\/\.\.\//g' {} \;

# 替换 @prompt 别名 (如果使用了别名但路径不正确)
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "@prompt\/src\//from "@prompt\//g' {} \;

echo "导入路径修复完成！" 