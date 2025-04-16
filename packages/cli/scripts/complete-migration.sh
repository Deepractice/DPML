#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始完成测试迁移工作...${NC}"

# 检查剩余需要迁移的文件
remaining_files=$(find tests -type f -name "*.test.ts")

if [ -z "$remaining_files" ]; then
  echo -e "${GREEN}所有测试文件已经迁移完成!${NC}"
else
  echo -e "${YELLOW}发现以下测试文件需要迁移:${NC}"
  echo "$remaining_files"
  
  # 确保目标目录存在
  mkdir -p src/tests/utils
  mkdir -p src/tests/core
  
  # 复制剩余测试文件
  for file in $remaining_files; do
    target_dir=$(echo $file | sed 's/tests/src\/tests/')
    target_dir=$(dirname "$target_dir")
    
    mkdir -p "$target_dir"
    
    echo -e "${YELLOW}复制 $file 到 $target_dir/$(basename $file)${NC}"
    cp "$file" "$target_dir/"
  done
  
  echo -e "${GREEN}所有测试文件已复制到新位置${NC}"
fi

# 运行修复导入脚本
echo -e "${YELLOW}修复导入路径...${NC}"
./scripts/fix-imports.sh

# 运行测试
echo -e "${YELLOW}运行测试验证迁移结果...${NC}"
npm run test

# 检查测试结果
if [ $? -eq 0 ]; then
  echo -e "${GREEN}测试通过，迁移成功！${NC}"
  echo -e "${YELLOW}你现在可以安全地删除旧的测试目录:${NC}"
  echo -e "${RED}rm -rf tests/${NC}"
else
  echo -e "${RED}测试失败，可能需要手动修复一些问题${NC}"
  echo -e "${YELLOW}请查看测试输出并修复问题后重新运行${NC}"
fi 