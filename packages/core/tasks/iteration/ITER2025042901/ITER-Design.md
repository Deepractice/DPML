# 需求规格：迁移Transformer实现到Framework模块（ITER20250429）

## 1. 总体目标

将转换器实现从core包的transformer模块迁移到core包内的framework模块，保持transformer模块的纯净（只包含接口定义和运行逻辑），同时将具体实现整合到framework模块中。确保API向后兼容，维持现有代码和测试的正常运行。

## 2. 架构设计

### 2.1 目标架构
```
core包
├─────────────────────────────────────────────────────────────────┐
│ API层                                                          │
│ - transform (api/transformer.ts)                               │
│ - registerTransformer                                          │
├─────────────────────────────────────────────────────────────────┤
│ Types层                                                         │
│ - Transformer接口 (types/Transformer.ts)                        │
│ - TransformContext (types/TransformContext.ts)                  │
├─────────────────────────────────────────────────────────────────┤
│ Core层                                                          │
│ ┌─────────────────────────────┐    ┌─────────────────────────────┐
│ │ transformer模块             │    │ framework模块               │
│ │ - Pipeline                  │    │ - StructuralMapperTransformer│
│ │ - TransformerRegistry       │◄───┤ - AggregatorTransformer     │
│ │ - transformerService        │    │ - TemplateTransformer       │
│ │ - 转发的transformerFactory  │    │ - frameworkTransformerFactory│
│ └─────────────────────────────┘    └─────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 交互流程

1. 用户通过API层的`registerTransformer`注册转换器
2. `transformerService`调用`TransformerRegistry`注册转换器
3. 当需要创建转换器时，`transformerService`调用`transformerFactory`
4. `transformerFactory`转发调用到framework模块的`frameworkTransformerFactory`
5. 用户使用API层的`transform`函数执行转换

## 3. 详细工作内容

### 3.1 Framework模块开发

1. **扩展framework模块结构**
   - 在`packages/core/src/core/framework/`下创建`transformer`目录
   - 创建框架转换器工厂`frameworkTransformerFactory.ts`

2. **迁移转换器实现**
   - 将以下文件从`core/transformer/transformers/`移动到`core/framework/transformer/`：
     - StructuralMapperTransformer.ts
     - AggregatorTransformer.ts
     - TemplateTransformer.ts
     - RelationProcessorTransformer.ts
     - SemanticExtractorTransformer.ts
     - ResultCollectorTransformer.ts
   - 更新导入路径，确保引用正确

3. **实现framework转换器工厂**
   - 创建`core/framework/transformer/frameworkTransformerFactory.ts`
   - 实现与原`transformerFactory.ts`相同的功能

4. **更新framework模块导出**
   - 在`core/framework/index.ts`中导出转换器实现（如果需要）

### 3.2 Transformer模块修改

1. **调整transformerFactory.ts**
   - 移除对具体转换器实现的导入
   - 修改为转发调用framework模块的`frameworkTransformerFactory`
   - 保持相同的函数签名，确保向后兼容

2. **调整transformerService.ts**
   - 更新导入路径，使用framework模块中的转换器实现
   - 保持API接口不变

### 3.3 测试更新

1. **修改单元测试**
   - 更新模拟导入路径
   - 调整测试代码，确保使用正确的导入

2. **修改集成测试**
   - 更新导入路径
   - 确保测试场景覆盖重组后的结构

3. **确保端到端测试通过**
   - 验证完整流程在重组后仍能正常工作

### 3.4 文档更新

1. **更新架构文档**
   - 修改`Transformer-Design.md`反映新架构
   - 修改`Transformer-Develop-Design.md`说明实现迁移

2. **更新目录结构说明**
   - 说明转换器实现现在位于framework模块

## 4. 兼容性考虑

1. **API向后兼容性**
   - 保持API签名不变
   - 保证相同的行为和结果

2. **类型兼容性**
   - 确保所有类型定义保持一致
   - 注意泛型参数的正确传递

3. **测试兼容性**
   - 确保所有单元测试、集成测试和端到端测试通过
   - 特别关注导入路径变更引起的问题

## 5. 时间规划

1. 框架结构准备（1天）：设置framework模块中的转换器目录结构
2. 代码迁移（1-2天）：迁移转换器实现、更新导入路径
3. 测试修改（1-2天）：更新和调整测试用例
4. 文档和验证（1天）：更新文档、最终验证

## 6. 验收标准

1. 所有转换器实现已从transformer模块迁移到framework模块
2. transformer模块保持纯净，只包含接口和运行逻辑
3. 所有单元测试、集成测试和端到端测试通过
4. 文档已更新反映新架构
5. 现有使用transformer API的代码仍能正常工作

## 7. 风险分析

1. **循环依赖风险**
   - 风险：framework模块和transformer模块之间可能形成循环依赖
   - 缓解：明确模块职责边界，使依赖单向流动（transformer依赖framework）

2. **测试覆盖风险**
   - 风险：某些测试场景可能未被更新，导致测试失败
   - 缓解：全面审查所有测试用例，确保覆盖所有场景

3. **导入路径风险**
   - 风险：大量导入路径需要修改，容易遗漏
   - 缓解：使用自动化工具和全面代码审查

4. **架构一致性风险**
   - 风险：framework模块责任不清晰，与其他功能混杂
   - 缓解：明确分层，在framework内创建专门的transformer子模块

## 8. 灾难恢复计划

1. 保留原始文件的备份
2. 使用版本控制分支，便于回退
3. 逐步迁移和测试，先从单个转换器开始 