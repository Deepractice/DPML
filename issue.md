# Issue: @dpml/prompt包导入@dpml/core内部模块路径导致依赖错误

## 问题描述

在实现@dpml/agent包的PromptTagProcessor时，发现@dpml/prompt包存在不当导入问题。该包试图直接导入@dpml/core包的内部模块路径`@dpml/core/src/types/node`，而不是使用公开的API。这种做法违反了包设计的最佳实践，并导致@dpml/agent包在运行某些测试时出现依赖错误。

## 复现步骤

1. 在@dpml/agent包中创建PromptTagProcessor
2. 导入@dpml/prompt包并使用其API
3. 运行@dpml/agent包中的测试

## 错误信息

```
Error: Cannot find module '@dpml/core/src/types/node'
Require stack:
- /Users/sean/WorkSpaces/TypeScriptProjects/dpml/packages/prompt/dist/index.js
```

## 根本原因分析

@dpml/prompt包在其实现中试图直接访问@dpml/core包的内部模块路径`@dpml/core/src/types/node`，而不是使用@dpml/core包的公共API。在monorepo架构中，各包应该通过明确定义的公共API进行交互，而不是依赖其他包的内部实现细节。

## 建议解决方案

1. 修改@dpml/prompt包，使其只依赖@dpml/core包的公共API
2. 确保所有导入使用顶级导出，例如`import { Node } from '@dpml/core'`而不是`import { Node } from '@dpml/core/src/types/node'`
3. 更新@dpml/prompt包的package.json，确保正确声明对@dpml/core的依赖
4. 考虑添加构建时检查，防止包之间的不当导入

## 影响范围

1. @dpml/agent包无法正常运行完整测试
2. 可能影响其他依赖@dpml/prompt包的模块
3. 可能影响整个DPML项目的构建和发布流程

## 优先级

中高 - 这个问题阻碍了@dpml/agent包的开发进度，但有临时规避方案（仅运行特定测试文件） 