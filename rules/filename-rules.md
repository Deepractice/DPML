# 文件命名规则

本文档定义了DPML项目的文件命名规则，主要基于面向对象编程(OOP)的思想，旨在通过文件名清晰地传达文件内容的性质和用途。

## 基本命名规则

1. **类文件**：使用**PascalCase**（首字母大写）
   - 例如：`XmlParser.ts`, `DocumentBuilder.ts`, `ValidationResult.ts`

2. **函数文件**：使用**camelCase**（首字母小写）
   - 例如：`parseXml.ts`, `formatJson.ts`, `validateInput.ts`

3. **一个文件一个主要导出**
   - 每个文件应仅包含并导出一个主要的类、接口或函数集
   - 文件名应反映其主要导出内容

## 目录特定命名规则

### types/目录（对外类型）

1. **接口文件**：使用PascalCase，不加前缀
   - 例如：`Parser.ts`, `Document.ts`, `Processor.ts`
   - 这些是对外暴露的公共接口，应保持简洁清晰

2. **类型定义文件**：使用PascalCase，可加`Types`后缀
   - 例如：`ParserTypes.ts`, `ProcessorTypes.ts`

3. **枚举类型**：使用PascalCase
   - 例如：`ParserMode.ts`, `DocumentType.ts`

### api/目录（公共API）

1. **服务类文件**：使用PascalCase，通常加`Service`后缀
   - 例如：`ParserService.ts`, `DocumentService.ts`

2. **工厂类文件**：使用PascalCase，通常加`Factory`后缀
   - 例如：`ParserFactory.ts`, `DocumentFactory.ts`

3. **管理器类文件**：使用PascalCase，通常加`Manager`后缀
   - 例如：`ConfigManager.ts`, `DocumentManager.ts`

4. **工具函数文件**：使用camelCase，通常加`Utils`后缀
   - 例如：`parserUtils.ts`, `formatUtils.ts`

### core/目录（内部实现）

1. **实现类文件**：使用PascalCase，名称应传达其具体功能
   - 例如：`XmlParser.ts`, `JsonParser.ts`, `HtmlDocument.ts`

2. **内部接口文件**：使用PascalCase，添加`I`前缀
   - 例如：`IContentHandler.ts`, `INodeVisitor.ts`
   - 这些接口用于内部实现、多态或依赖注入

3. **抽象类文件**：使用PascalCase，通常加`Abstract`前缀或`Base`前缀
   - 例如：`AbstractParser.ts`, `BaseDocument.ts`

4. **内部工具函数**：使用camelCase
   - 例如：`nodeTraversal.ts`, `attributeNormalization.ts`

## 命名原则和规范

1. **描述性命名**
   - 文件名应清晰表达内容的用途和职责
   - 避免过于笼统的名称，如仅用`Util.ts`或`Helper.ts`

2. **无前缀域分割**
   - 不使用领域前缀（如`parser-Document.ts`）
   - 通过合理设计和命名避免名称冲突

3. **处理名称冲突**
   - 如果不同子系统需要相似名称，使用更具体的描述性名称
   - 例如：不是`Writer.ts`，而是`XmlWriter.ts`和`JsonWriter.ts`

4. **复合词命名**
   - 复合词应该保持一致的大小写风格
   - 例如：`XmlFileReader.ts`而非`XMLFileReader.ts`

5. **测试文件命名**
   - 单元测试：`[原文件名].test.ts`或`[原文件名].spec.ts`
   - 例如：`XmlParser.test.ts`

## 特殊情况处理

1. **混合内容文件**
   - 如果文件包含多种类型的导出，以主要导出类型决定命名规则
   - 例如：主要导出类但含辅助函数 → 使用PascalCase

2. **索引文件**
   - 使用`index.ts`作为目录入口文件
   - 不应包含复杂逻辑，仅用于重新导出

3. **常量文件**
   - 如果主要包含常量，使用camelCase
   - 例如：`parserConstants.ts`, `errorCodes.ts`

## 命名规则的好处

1. **提高可读性** - 通过文件名就能识别内容类型（类/函数）
2. **简化导航** - 一致的命名模式使代码库更易于浏览
3. **强调设计** - 命名反映了系统的结构和组件关系
4. **减少歧义** - 明确区分了不同类型的组件

通过遵循这些规则，我们能确保代码库的一致性和可维护性，同时支持面向对象的开发风格。 