#!/bin/bash

echo "开始修复导入路径..."

# 处理 '../../../src/' 模式 (适用于 unit 目录下的文件)
echo "修复 '../../../src/' 模式..."
find src/tests -type f -name "*.test.ts" -exec grep -l "from '..\/..\/..\/src\/" {} \; | xargs -I{} sed -i '' "s/from '..\/..\/..\/src\//from '..\/..\/..\//" {}

# 处理 '../../src/' 模式 (适用于 performance/integration 等目录下的文件)
echo "修复 '../../src/' 模式..."
find src/tests -type f -name "*.test.ts" -exec grep -l "from '..\/..\/src\/" {} \; | xargs -I{} sed -i '' "s/from '..\/..\/src\//from '..\/..\//" {}

# 处理 '../src/' 模式 (可能存在于更深层嵌套的目录)
echo "修复 '../src/' 模式..."
find src/tests -type f -name "*.test.ts" -exec grep -l "from '..\/src\/" {} \; | xargs -I{} sed -i '' "s/from '..\/src\//from '..\//" {}

# 处理 '../../agent/' 模式 (处理已经有相对路径但不正确的情况)
echo "修复 '../../agent/' 模式..."
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/agent/from "\.\.\/\.\.\/\.\.\/agent/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/agent/from '\.\.\/\.\.\/\.\.\/agent/g" {} \;

# 处理 '../../memory/' 模式
echo "修复 '../../memory/' 模式..."
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/memory/from "\.\.\/\.\.\/\.\.\/memory/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/memory/from '\.\.\/\.\.\/\.\.\/memory/g" {} \;

# 处理 '../../state/' 模式
echo "修复 '../../state/' 模式..."
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/state/from "\.\.\/\.\.\/\.\.\/state/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/state/from '\.\.\/\.\.\/\.\.\/state/g" {} \;

# 处理 '../../events/', '../../security/', '../../connector/', '../../apiKey/', '../../tags/'
echo "修复其他模式..."
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/events/from "\.\.\/\.\.\/\.\.\/events/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/events/from '\.\.\/\.\.\/\.\.\/events/g" {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/security/from "\.\.\/\.\.\/\.\.\/security/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/security/from '\.\.\/\.\.\/\.\.\/security/g" {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/connector/from "\.\.\/\.\.\/\.\.\/connector/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/connector/from '\.\.\/\.\.\/\.\.\/connector/g" {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/apiKey/from "\.\.\/\.\.\/\.\.\/apiKey/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/apiKey/from '\.\.\/\.\.\/\.\.\/apiKey/g" {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/tags/from "\.\.\/\.\.\/\.\.\/tags/g' {} \;
find src/tests/unit -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/tags/from '\.\.\/\.\.\/\.\.\/tags/g" {} \;

# 同样处理 performance 目录
echo "修复 performance 目录..."
find src/tests/performance -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/agent/from "\.\.\/\.\.\/\.\.\/agent/g' {} \;
find src/tests/performance -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/agent/from '\.\.\/\.\.\/\.\.\/agent/g" {} \;

# 同样处理 integration 目录
echo "修复 integration 目录..."
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/agent/from "\.\.\/\.\.\/\.\.\/agent/g' {} \;
find src/tests/integration -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/agent/from '\.\.\/\.\.\/\.\.\/agent/g" {} \;

# 处理 tags 目录下的文件
echo "修复 tags 目录..."
find src/tests/tags -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/tags/from "\.\.\/\.\.\/\.\.\/tags/g' {} \;
find src/tests/tags -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/tags/from '\.\.\/\.\.\/\.\.\/tags/g" {} \;
# 特殊处理 tagDefinitions.test.ts 文件中的导入
sed -i '' "s/from '..\/..\/..\/tags/from '..\/..\/..\/..\/tags/g" src/tests/tags/tagDefinitions.test.ts

# 处理 usecase 目录
echo "修复 usecase 目录..."
find src/tests/usecase -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/agent/from "\.\.\/\.\.\/\.\.\/agent/g' {} \;
find src/tests/usecase -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/agent/from '\.\.\/\.\.\/\.\.\/agent/g" {} \;

# 修复 errors/types 导入
echo "修复 errors/types 导入..."
find src/tests -type f -name "*.test.ts" -exec sed -i '' 's/from "\.\.\/\.\.\/errors/from "\.\.\/\.\.\/\.\.\/errors/g' {} \;
find src/tests -type f -name "*.test.ts" -exec sed -i '' "s/from '\.\.\/\.\.\/errors/from '\.\.\/\.\.\/\.\.\/errors/g" {} \;

echo "导入路径修复完成！"
echo "请运行测试验证修复效果："
echo "  npm run test" 