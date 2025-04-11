# DPML 项目问题跟踪

本文档用于跟踪DPML项目中的已知问题，包括bug、架构问题和待改进项目。

## 待解决问题

### 1. @dpml/prompt包入口点解析失败

**优先级**: 中高

**类型**: 构建/依赖问题

**状态**: 待解决

**问题描述**:  
在运行测试时，系统无法解析@dpml/prompt包的入口点，导致依赖该包的测试失败。错误信息如下：

```
Error: Failed to resolve entry for package "@dpml/prompt". The package may have incorrect main/module/exports specified in its package.json.
```

**影响范围**:
- 导致所有依赖@dpml/prompt包的测试失败，如PromptTagProcessor相关测试
- 阻碍了完整的测试套件运行

**复现步骤**:
1. 运行任何引用了@dpml/prompt包的测试
```bash
cd /Users/sean/WorkSpaces/TypeScriptProjects/dpml/packages/agent
pnpm test
```
2. 观察到与@dpml/prompt相关的测试失败，如tests/tags/processors/PromptTagProcessor.test.ts

**可能原因**:
1. package.json文件中的main/module/exports字段配置不正确
2. @dpml/prompt包未完全构建或构建结果不符合预期
3. 工作区(workspace)依赖配置问题
4. 可能存在循环依赖

**建议解决方案**:
1. 检查@dpml/prompt包的package.json文件，确保入口点字段正确配置：
   ```json
   {
     "main": "dist/index.js",
     "module": "dist/index.mjs",
     "types": "dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.mjs",
         "require": "./dist/index.js",
         "types": "./dist/index.d.ts"
       }
     }
   }
   ```
2. 重新构建@dpml/prompt包：
   ```bash
   cd /Users/sean/WorkSpaces/TypeScriptProjects/dpml/packages/prompt
   pnpm build
   ```
3. 检查pnpm-workspace.yaml配置，确保依赖关系正确
4. 检查是否存在循环依赖问题

**相关文件**:
- packages/prompt/package.json
- packages/agent/tests/tags/processors/PromptTagProcessor.test.ts
- packages/agent/src/tags/processors/PromptTagProcessor.ts

**发现日期**: 2023-11-07 