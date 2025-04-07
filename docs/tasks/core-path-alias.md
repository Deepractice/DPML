# DPML Core包路径别名实施计划

## 背景

当前DPML项目中的导入使用相对路径，随着项目规模扩大，导入语句变得复杂且难以维护。我们计划将`packages/core`包中的导入改为使用`@core`别名，提高代码可读性和可维护性。

## 总体目标

- 将`packages/core`包中的相对路径导入改为使用`@core/*`别名
- 确保TypeScript类型检查、构建工具和测试环境均能正确识别和解析别名
- 保持向后兼容，不破坏现有功能

## 实施计划

### 阶段一：修复现有问题（已完成✅）

- [x] 1.1 修复pathUtils.ts中缺少的fs导入
- [x] 1.2 解决ProcessingError类的导出问题
- [x] 1.3 修复src/transformer/interfaces/index.ts的重复导出问题
- [x] 1.4 确保当前相对路径导入下项目能正常构建和通过测试

### 阶段二：配置路径别名（已完成✅）

- [x] 2.1 在packages/core/tsconfig.json中添加paths配置
- [x] 2.2 在packages/core/tsup.config.ts中添加别名解析配置
- [x] 2.3 在packages/core/vitest.config.ts中添加别名解析配置
- [x] 2.4 验证配置正确性，确保TypeScript能识别别名

### 阶段三：替换导入路径

- [ ] 3.1 选择一个小模块（例如errors或utils）进行试点
  - [ ] 3.1.1 替换该模块内部的导入路径
  - [ ] 3.1.2 构建并测试是否正常
- [ ] 3.2 批量替换其他模块的导入路径
  - [ ] 3.2.1 替换constants模块
  - [ ] 3.2.2 替换types模块
  - [ ] 3.2.3 替换parser模块
  - [ ] 3.2.4 替换processor模块
  - [ ] 3.2.5 替换transformer模块
  - [ ] 3.2.6 替换utils模块
- [ ] 3.3 处理特殊情况
  - [ ] 3.3.1 检查并处理循环依赖问题
  - [ ] 3.3.2 处理测试文件中的导入路径

### 阶段四：验证和优化

- [ ] 4.1 运行完整测试套件，确保所有功能正常
- [ ] 4.2 检查构建输出，确保别名被正确解析
- [ ] 4.3 优化构建配置，提高性能
- [ ] 4.4 更新项目文档，说明导入规范

## 注意事项

1. **保持渐进式修改**：每次修改一个小模块，构建并测试通过后再进行下一步
2. **处理冲突**：注意处理循环依赖和名称冲突
3. **兼容性**：确保代码在不同环境（开发、测试、生产）中均能正常工作
4. **提交规范**：每个阶段完成后提交一次代码，提交信息清晰说明修改内容

## 潜在问题及解决方案

1. **TypeScript识别但构建失败**：确保tsup、esbuild等工具配置了相同的别名
2. **测试环境无法解析别名**：vitest需要单独配置别名解析
3. **循环依赖**：重新组织代码结构，减少模块间的循环依赖
4. **第三方库集成问题**：确保所有依赖库能正确工作

## 完成标准

- 所有相对路径导入被替换为@core/*别名导入
- 所有测试通过
- 构建输出正常
- 文档已更新

## 参考资料

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [tsup配置文档](https://tsup.egoist.dev/#using-custom-configuration)
- [Vitest配置文档](https://vitest.dev/config/#resolve-alias) 