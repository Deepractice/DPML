# DPML 项目问题跟踪

本文档用于跟踪DPML项目中的已知问题，包括bug、架构问题和待改进项目。

## 待解决问题

### 1. @dpml/prompt包入口点解析失败

**优先级**: 中高

**类型**: 构建/依赖问题

**状态**: 已解决 ✓

**问题描述**:  
在运行测试时，系统无法解析@dpml/prompt包的入口点，导致依赖该包的测试失败。错误信息如下：

```
Error: Failed to resolve entry for package "@dpml/prompt". The package may have incorrect main/module/exports specified in its package.json.
```

**影响范围**:
- 导致所有依赖@dpml/prompt包的测试失败，如PromptTagProcessor相关测试
- 阻碍了完整的测试套件运行

**解决方案**:
1. 在@dpml/prompt的package.json中添加了exports字段，确保正确导出入口
2. 在@dpml/prompt的tsup.config.ts中启用了dts生成，确保生成类型文件
3. 在@dpml/core的package.json中也添加了exports字段
4. 重新构建两个包

**相关文件**:
- packages/prompt/package.json
- packages/prompt/tsup.config.ts
- packages/core/package.json
- packages/agent/tests/tags/processors/PromptTagProcessor.test.ts

**发现日期**: 2023-11-07

**解决日期**: 2023-11-08 