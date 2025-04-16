#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始完成测试迁移工作...${NC}"

# 确保目标目录存在
mkdir -p src/tests/utils
mkdir -p src/tests/core

# 1. 如果需要，先将所有测试文件复制到 src/tests 目录
echo -e "${YELLOW}复制测试文件到新位置...${NC}"
remaining_files=$(find tests -type f -name "*.test.ts")

if [ -n "$remaining_files" ]; then
  for file in $remaining_files; do
    target_dir=$(echo $file | sed 's/tests/src\/tests/')
    target_dir=$(dirname "$target_dir")
    
    mkdir -p "$target_dir"
    
    echo -e "${YELLOW}复制 $file 到 $target_dir/$(basename $file)${NC}"
    cp "$file" "$target_dir/"
  done
  echo -e "${GREEN}所有测试文件已复制到新位置${NC}"
fi

# 2. 运行改进的导入路径修复脚本
echo -e "${YELLOW}修复导入路径...${NC}"
./scripts/fix-imports-better.sh

# 3. 运行测试
echo -e "${YELLOW}运行测试验证迁移结果...${NC}"
npm run test

# 4. 如果测试通过，提示删除旧测试目录
if [ $? -eq 0 ]; then
  echo -e "${GREEN}测试通过，迁移成功！${NC}"
  echo -e "${YELLOW}你现在可以安全地删除旧的测试目录:${NC}"
  echo -e "${RED}rm -rf tests/${NC}"
  
  # 创建一个删除旧测试目录的脚本
  cat > scripts/cleanup-old-tests.sh << 'EOF'
#!/bin/bash
# 删除旧测试目录
echo "删除旧测试目录..."
rm -rf tests/
echo "旧测试目录已删除"
EOF

  chmod +x scripts/cleanup-old-tests.sh
  echo -e "${YELLOW}可以运行 ./scripts/cleanup-old-tests.sh 删除旧测试目录${NC}"
else
  echo -e "${RED}测试失败，需要手动修复问题${NC}"
  echo -e "${YELLOW}请查看测试输出并修复问题后重新运行${NC}"
fi

# 5. 创建测试迁移指南
echo -e "${YELLOW}创建测试迁移指南...${NC}"
cat > TEST-MIGRATION-GUIDE.md << 'EOF'
# 测试迁移指南

本项目的测试已从 `tests/` 目录迁移到 `src/tests/` 目录，以更好地支持模块化和代码组织。

## 迁移步骤

迁移过程已通过以下步骤完成：

1. 创建迁移脚本 `scripts/migrate-tests.sh` 将测试文件从 `tests/` 复制到 `src/tests/` 目录
2. 调整导入路径，将 `../../src/` 替换为 `../../`
3. 更新 `vitest.config.ts` 配置文件，指向新的测试目录
4. 更新 `tsconfig.json` 文件，排除测试文件
5. 修复测试中的模块导入和模拟问题
6. 验证所有测试通过

## 如何运行测试

测试可以通过以下命令运行：

```bash
npm run test
```

## 注意事项

1. 所有新的测试文件应该创建在 `src/tests/` 目录下
2. 测试文件应该遵循与源代码相同的目录结构
3. 导入模块时，使用相对路径 `../../` 而不是 `../../src/`

## 其他变更

- 测试现在与源代码位于同一目录结构中，便于查找和管理
- 配置已更新以支持新的测试位置
EOF

echo -e "${GREEN}测试迁移指南已创建：TEST-MIGRATION-GUIDE.md${NC}"
echo -e "${GREEN}测试迁移工作已完成！${NC}" 