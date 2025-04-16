# DPML项目命令指南

本文档提供DPML项目中可用的命令行快捷方式，以便在monorepo中轻松执行各种任务。

## 基础命令

在项目根目录中可执行以下基础命令：

```bash
# 构建所有包
pnpm build

# 以开发模式运行所有包
pnpm dev

# 对所有包执行lint
pnpm lint

# 运行所有包的测试
pnpm test

# 清理所有构建和依赖
pnpm clean
```

## 特定包操作

针对特定包执行预定义命令：

```bash
# 运行prompt包的测试
pnpm prompt:test

# 运行core包的测试
pnpm core:test

# 以开发模式运行prompt包
pnpm prompt:dev

# 以开发模式运行core包
pnpm core:dev
```

## 自定义命令执行

可以在不同目录环境中执行自定义命令：

### 根目录命令

在项目根目录执行命令：

```bash
# 查看git状态
pnpm r git status

# 列出目录内容
pnpm r ls -la

# 添加并提交文件
pnpm r git add . && pnpm r git commit -m "message"
```

### 特定包命令

在特定包的目录中执行命令：

```bash
# 在prompt包目录中查看文件
pnpm prompt ls -la

# 在core包目录中查看git状态
pnpm core git status

# 运行prompt包中的自定义脚本
pnpm prompt node scripts/custom-script.js
```

## 使用提示

1. **路径处理**：所有命令都在各自的目录上下文中执行，因此使用相对路径时要小心

2. **组合命令**：如需执行多条相关命令，可以使用：

   ```bash
   # 串联多个命令（不同目录）
   pnpm prompt test && pnpm core test

   # 同一包内串联多个命令
   pnpm prompt "npm run lint && npm run test"
   ```

3. **文件引用**：引用当前包外的文件时，使用绝对路径或相对于包目录的路径

4. **实时反馈**：这些命令支持交互式输出，适合需要实时反馈的工具

这种项目级的命令设置避免了修改系统配置，同时提供了方便的目录导航和命令执行功能。
