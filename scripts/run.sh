#!/bin/bash

# DPML项目命令执行助手
# 用法：./scripts/run.sh [包名] [命令]
# 示例：./scripts/run.sh prompt test  # 在prompt包中执行测试
#       ./scripts/run.sh . git status  # 在根目录执行git status

# 项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 检查参数
if [ $# -lt 2 ]; then
  echo "用法: $0 <包名|.> <命令>"
  echo "  - 使用 '.' 表示项目根目录"
  echo "  - 包名为packages目录下的子目录名，如'core'、'prompt'"
  exit 1
fi

PACKAGE=$1
shift

# 切换到正确的目录
if [ "$PACKAGE" = "." ]; then
  cd "$ROOT_DIR"
else
  PACKAGE_DIR="$ROOT_DIR/packages/$PACKAGE"
  if [ ! -d "$PACKAGE_DIR" ]; then
    echo "错误: 包 '$PACKAGE' 不存在于 packages/ 目录"
    exit 1
  fi
  cd "$PACKAGE_DIR"
fi

# 显示当前工作目录
echo "==> 在 $(pwd) 中执行: $@"

# 执行命令
"$@" 