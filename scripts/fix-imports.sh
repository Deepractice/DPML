#!/bin/bash

# 修复导入路径问题，将相对路径导入替换为别名导入
echo "开始修复相对路径导入问题..."

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 处理core包
echo "${GREEN}处理 core 包...${NC}"
cd packages/core || exit 1

# 示例：将 ../../types/node 替换为 @core/types/node
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/types\/node"|from "@core/types/node"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/types"|from "@core/types"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/errors\/types"|from "@core/errors/types"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/errors"|from "@core/errors"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/core\/parser"|from "@core/core/parser"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/core\/processor"|from "@core/core/processor"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/utils\/pathUtils"|from "@core/utils/pathUtils"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/parser\/tag-registry"|from "@core/parser/tag-registry"|g' {} \;

# 处理三层相对路径
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/types\/node"|from "@core/types/node"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/types"|from "@core/types"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/core\/processor"|from "@core/core/processor"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/core\/parser"|from "@core/core/parser"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/transformer"|from "@core/transformer"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/processor"|from "@core/processor"|g' {} \;

# 处理四层相对路径 
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/\.\.\/types\/node"|from "@core/types/node"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/\.\.\/core\/processor"|from "@core/core/processor"|g' {} \;

# 处理测试文件
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/src\/|from "@core\/|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/src\/|from "@core\/|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/\.\.\/\.\.\/src\/|from "@core\/|g' {} \;

echo "${GREEN}core包导入路径处理完成${NC}"
cd ../.. || exit 1

# 处理prompt包
echo "${GREEN}处理 prompt 包...${NC}"
cd packages/prompt || exit 1

# 将相对路径替换为别名导入
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/errors"|from "@prompt/errors"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/types"|from "@prompt/types"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/tags"|from "@prompt/tags"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/api"|from "@prompt/api"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/transformers\/promptTransformer"|from "@prompt/transformers/promptTransformer"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/transformers\/formatConfig"|from "@prompt/transformers/formatConfig"|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/processors"|from "@prompt/processors"|g' {} \;

# 处理测试文件
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\."|from "@prompt"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/api"|from "@prompt/api"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/transformers"|from "@prompt/transformers"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/tags"|from "@prompt/tags"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/errors"|from "@prompt/errors"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/transformers\/promptTransformer"|from "@prompt/transformers/promptTransformer"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/transformers\/formatConfig"|from "@prompt/transformers/formatConfig"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/types"|from "@prompt/types"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/api\/processPrompt"|from "@prompt/api/processPrompt"|g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/api\/transformPrompt"|from "@prompt/api/transformPrompt"|g' {} \;

# 处理processors目录下的导入
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/contextTagProcessor"|from "@prompt/processors/contextTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/customTagProcessor"|from "@prompt/processors/customTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/executingTagProcessor"|from "@prompt/processors/executingTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/promptTagProcessor"|from "@prompt/processors/promptTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/protocolTagProcessor"|from "@prompt/processors/protocolTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/roleTagProcessor"|from "@prompt/processors/roleTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/testingTagProcessor"|from "@prompt/processors/testingTagProcessor"|g' {} \;
find src/processors -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/processors\/thinkingTagProcessor"|from "@prompt/processors/thinkingTagProcessor"|g' {} \;

echo "${GREEN}prompt包导入路径处理完成${NC}"
cd ../.. || exit 1

# 处理agent包
echo "${GREEN}处理 agent 包...${NC}"
cd packages/agent || exit 1

# 将相对路径替换为别名导入
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/|from "@agent\/|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/|from "@agent\/|g' {} \;

echo "${GREEN}agent包导入路径处理完成${NC}"
cd ../.. || exit 1

# 处理workflow包
echo "${GREEN}处理 workflow 包...${NC}"
cd packages/workflow || exit 1

# 将相对路径替换为别名导入
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/|from "@workflow\/|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/|from "@workflow\/|g' {} \;

echo "${GREEN}workflow包导入路径处理完成${NC}"
cd ../.. || exit 1

# 处理common包
echo "${GREEN}处理 common 包...${NC}"
cd packages/common || exit 1

# 将相对路径替换为别名导入
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/|from "@common\/|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/|from "@common\/|g' {} \;

echo "${GREEN}common包导入路径处理完成${NC}"
cd ../.. || exit 1

# 处理cli包
echo "${GREEN}处理 cli 包...${NC}"
cd packages/cli || exit 1

# 将相对路径替换为别名导入
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/|from "@cli\/|g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's|from "\.\.\/\.\.\/|from "@cli\/|g' {} \;

echo "${GREEN}cli包导入路径处理完成${NC}"
cd ../.. || exit 1

echo "${GREEN}所有包的导入路径已更新完成！${NC}"
echo "${YELLOW}注意：可能需要手动修复一些特殊情况，尤其是测试文件中的导入。${NC}"
echo "${YELLOW}建议运行 'pnpm tsc --noEmit' 检查是否存在任何导入路径相关的错误。${NC}" 