# DPML Parser 测试用例

本文档描述了`@dpml/parser`包的单元测试和集成测试用例，旨在保证Parser模块的功能正确性、稳定性和性能。`@dpml/parser`作为DPML的基础组件，负责将DPML文本解析为结构化的文档对象模型。

## 1. 标签注册测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| UT-Parser-TagReg | 基础标签注册 | 测试基本标签注册功能 | 标签成功注册到TagRegistry |
| UT-Parser-TagDef | 标签定义验证 | 测试标签定义的完整性验证 | 无效标签定义被检测并报错 |
| UT-Parser-TagAttr | 标签属性验证 | 测试标签属性验证 | 属性列表正确验证，必需属性检查有效 |
| UT-Parser-ContentModel | 内容模型验证 | 测试各种内容模型(空、文本、混合等) | 内容模型正确应用于解析验证 |
| UT-Parser-CustValidation | 自定义验证规则 | 测试标签的自定义验证规则 | 自定义验证规则正确执行 |
| UT-Parser-TagExists | 标签存在性检查 | 测试标签存在性检查 | 正确识别已注册和未注册标签 |
| UT-Parser-MultiRegistry | 多注册表实例 | 测试创建和使用多个注册表实例 | 多个注册表实例相互独立运行 |

## 2. 解析基础测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| UT-Parser-BasicParse | 基础解析功能 | 测试基本DPML文本解析 | 成功解析简单DPML为文档对象 |
| UT-Parser-FileIO | 文件解析功能 | 测试从文件解析DPML | 成功从文件读取并解析DPML |
| UT-Parser-Options | 解析选项功能 | 测试各种解析选项参数 | 各选项参数正确影响解析行为 |
| UT-Parser-PreserveWS | 空白字符保留 | 测试空白字符保留选项 | 空白字符根据选项正确处理 |
| UT-Parser-ValidateOnParse | 解析时验证 | 测试解析时验证选项 | 解析时验证选项正确执行 |
| UT-Parser-CustomRegistry | 自定义注册表解析 | 测试使用自定义注册表解析 | 使用指定注册表正确解析 |
| UT-Parser-Encoding | 编码处理 | 测试不同文件编码处理 | 正确处理指定编码的文件 |
| UT-Parser-AsyncParse | 异步解析功能 | 测试异步解析方法 | 异步方法正确返回Promise |

## 3. 文档结构测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| UT-Parser-DocRoot | 文档根节点 | 测试文档根节点访问 | 正确获取文档根节点 |
| UT-Parser-NodeProps | 节点属性访问 | 测试节点基本属性访问 | 正确访问节点属性(标签名、ID等) |
| UT-Parser-NodeAttrs | 节点属性集合 | 测试节点属性集合访问 | 正确访问节点属性Map |
| UT-Parser-NodeNav | 节点导航 | 测试节点层级导航(父子关系) | 节点层级关系正确构建和访问 |
| UT-Parser-NodeContent | 节点内容 | 测试节点内容访问 | 正确访问文本和混合内容 |
| UT-Parser-NodeById | ID节点查找 | 测试通过ID查找节点 | 正确通过ID获取节点 |
| UT-Parser-Selectors | 选择器功能 | 测试文档查询选择器 | 正确通过选择器查询节点 |
| UT-Parser-DocPos | 位置信息 | 测试节点位置信息 | 节点包含正确的源位置信息 |
| UT-Parser-Serialize | 序列化功能 | 测试文档序列化 | 文档能被正确序列化回文本 |

## 4. 错误处理测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| UT-Parser-SyntaxErr | 语法错误处理 | 测试语法错误检测和报告 | 语法错误被检测并提供准确位置信息 |
| UT-Parser-ValidationErr | 验证错误处理 | 测试标签验证错误处理 | 验证错误被检测并提供明确信息 |
| UT-Parser-MissingTag | 未知标签处理 | 测试未注册标签处理 | 未注册标签被检测并报错 |
| UT-Parser-MissingAttr | 缺失属性处理 | 测试缺少必需属性处理 | 缺少必需属性被检测并报错 |
| UT-Parser-InvalidAttr | 无效属性处理 | 测试无效属性值处理 | 无效属性值被检测并报错 |
| UT-Parser-NestingErr | 嵌套错误处理 | 测试无效嵌套关系处理 | 无效嵌套被检测并报错 |
| UT-Parser-FileErr | 文件错误处理 | 测试文件读取错误处理 | 文件错误被正确捕获并提供友好信息 |
| UT-Parser-ErrLocation | 错误位置信息 | 测试错误位置信息 | 错误包含准确的行列信息 |
| UT-Parser-ErrRecovery | 错误恢复功能 | 测试部分错误恢复能力 | 在可恢复情况下继续解析 |

## 5. 集成测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| IT-Parser-CoreIntegration | Core集成 | 测试与Core包其他组件集成 | 成功与Core包其他组件一起工作 |
| IT-Parser-FullFlow | 端到端流程 | 测试完整的解析处理流程 | 完整流程正常运行 |
| IT-Parser-Processor | 处理器集成 | 测试与后续处理器的集成 | 解析结果正确传递给后续处理器 |
| IT-Parser-MultiFile | 多文件处理 | 测试处理多个相关文件 | 成功处理多个相关文件 |
| IT-Parser-ExtImpl | 实际使用场景 | 测试在实际应用中使用 | 在实际应用场景中正常工作 |
| IT-Parser-ModuleUsage | 模块导入使用 | 测试作为模块被导入和使用 | 作为模块被正确导入和使用 |

## 6. 性能测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| PT-Parser-Basic | 基本性能 | 测试基本解析性能 | 解析时间在可接受范围内 |
| PT-Parser-LargeDoc | 大文档性能 | 测试大型文档解析性能 | 大型文档解析性能在可接受范围内 |
| PT-Parser-Memory | 内存占用 | 测试内存占用情况 | 内存占用在合理范围内 |
| PT-Parser-Repeated | 重复解析 | 测试重复解析同一内容 | 重复解析性能稳定 |
| PT-Parser-Concurrent | 并发解析 | 测试并发解析多个文档 | 并发解析正常运行 |
| PT-Parser-LongRun | 长时间运行 | 测试长时间运行稳定性 | 长时间运行无内存泄漏和性能下降 |

## 7. 基础用例测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| UC-Parser-SimpleTag | 简单标签测试 | 测试解析基本标签结构 | 成功解析基本标签结构 |
| UC-Parser-NestedStructure | 嵌套结构测试 | 测试解析基本嵌套结构 | 成功解析嵌套结构 |
| UC-Parser-BasicAttributes | 基本属性测试 | 测试解析带属性的标签 | 成功解析带属性的标签 |
| UC-Parser-TextContent | 文本内容测试 | 测试解析带文本内容的标签 | 成功解析带文本内容的标签 |

## 8. 标签功能测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| UT-Parser-EmptyTag | 空标签解析 | 测试空标签解析 | 正确解析自闭合空标签 |
| UT-Parser-TextTag | 文本标签解析 | 测试文本内容标签解析 | 正确解析仅含文本的标签 |
| UT-Parser-MixedTag | 混合内容标签解析 | 测试混合内容标签解析 | 正确解析含文本和子标签的标签 |
| UT-Parser-NestedTags | 嵌套标签解析 | 测试多级嵌套标签解析 | 正确解析复杂嵌套结构 |
| UT-Parser-Attributes | 属性解析 | 测试各种属性格式解析 | 正确解析不同格式的属性 |
| UT-Parser-QuotedAttrs | 引号属性解析 | 测试带引号属性解析 | 正确处理单引号和双引号属性 |
| UT-Parser-SpecialChars | 特殊字符处理 | 测试特殊字符和转义序列 | 正确处理特殊字符和转义序列 |

## 9. 兼容性测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
| ------ | -------- | -------- | -------- |
| CT-Parser-NodeVersions | Node.js版本兼容性 | 测试不同Node.js版本兼容性 | 在支持的Node.js版本上正常工作 |
| CT-Parser-Browsers | 浏览器兼容性 | 测试浏览器环境兼容性 | 在浏览器环境中正常工作 |
| CT-Parser-ESM | ESM兼容性 | 测试ESM模块格式兼容性 | 在ESM环境中正常工作 |
| CT-Parser-TS | TypeScript兼容性 | 测试TypeScript集成 | TypeScript类型定义正确 |
| CT-Parser-XMLCompat | XML兼容性 | 测试与XML格式的兼容性 | 正确处理XML兼容的DPML | 