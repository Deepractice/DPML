# DPML Parser 用户故事与产品用例

本文档描述了 DPML Parser 的用户故事和产品用例场景，旨在从用户视角展示 Parser 的实际应用价值和使用场景。

## 1. 目标用户群体

DPML Parser 设计用于服务以下主要用户群体：

1. **应用开发者** - 将 DPML 用于应用开发的工程师
2. **内容创建者** - 编写 DPML 文档的作者或编辑
3. **框架扩展者** - 需要扩展 DPML 功能的高级开发者
4. **IDE 插件开发者** - 为编辑工具构建 DPML 支持的开发者

## 2. 用户故事

### 2.1 应用开发者

> **作为** 一名使用 DPML 的应用开发者  
> **我希望** 能够解析 DPML 文档并获取结构化数据  
> **以便于** 在我的应用中使用这些数据构建用户界面或处理业务逻辑

> **作为** 应用开发者  
> **我希望** 能够快速检测 DPML 文档中的错误并获得准确的错误位置  
> **以便于** 提供有用的错误信息给内容创建者

> **作为** 应用开发者  
> **我希望** 能够通过简单的 API 查询文档中的特定节点  
> **以便于** 高效地处理文档中的特定部分

### 2.2 内容创建者

> **作为** DPML 内容创建者  
> **我希望** 在编写错误的 DPML 时得到明确的错误提示  
> **以便于** 快速修复问题并提高工作效率

> **作为** 内容创建者  
> **我希望** 错误信息包含具体的位置和修复建议  
> **以便于** 我能更快速地定位和解决问题

### 2.3 框架扩展者

> **作为** 框架扩展者  
> **我希望** 能够注册自定义标签并定义它们的行为  
> **以便于** 扩展 DPML 的功能以满足特定领域需求

> **作为** 框架扩展者  
> **我希望** 能够使用自定义标签注册表  
> **以便于** 管理特定应用场景的标签集合

### 2.4 IDE 插件开发者

> **作为** IDE 插件开发者  
> **我希望** 能够使用 Parser 提供的位置信息和错误诊断  
> **以便于** 为用户提供实时语法检查和代码完成功能

> **作为** IDE 插件开发者  
> **我希望** 能够高效解析部分内容的变更  
> **以便于** 提供实时的编辑反馈

## 3. 产品用例场景

### 用例 1：基本解析

**标题**: 解析简单 DPML 文档  
**主要参与者**: 应用开发者  
**前置条件**: 开发者已安装 DPML Parser 库  

**主要流程**:
1. 开发者从文件或字符串获取 DPML 内容
2. 开发者调用 `parse` 函数解析内容
3. Parser 返回结构化的 DPMLDocument 对象
4. 开发者使用 document.rootNode 访问文档结构
5. 开发者通过节点的属性和内容构建应用逻辑

**成功标准**: 开发者能够访问结构化的文档对象并使用其中的数据

**代码示例**:
```typescript
import { parse } from '@dpml/parser';

// 解析 DPML 字符串
const dpmlContent = `
<prompt>
  <message role="system">
    你是一个 AI 助手，专注于回答编程问题。
  </message>
  <message role="user">
    请解释 JavaScript 中的闭包概念。
  </message>
</prompt>
`;

try {
  const document = parse(dpmlContent);
  
  // 访问根节点
  console.log(document.rootNode.tagName); // 输出: prompt
  
  // 访问子节点
  const messages = document.rootNode.children;
  messages.forEach(msg => {
    const role = msg.getAttributeValue('role');
    const content = msg.content.trim();
    console.log(`${role}: ${content}`);
  });
} catch (error) {
  console.error('解析失败:', error.message);
}
```

### 用例 2：错误处理

**标题**: 处理格式错误的 DPML 文档  
**主要参与者**: 应用开发者  
**前置条件**: 应用接收到含有语法错误的 DPML 内容  

**主要流程**:
1. 开发者调用 `parse` 函数处理错误内容
2. Parser 检测到语法错误
3. Parser 抛出包含详细错误信息的 ParseError
4. 开发者捕获异常并从中提取错误位置和消息
5. 开发者向用户显示友好的错误提示

**成功标准**: 开发者能够获取到准确的错误位置和有用的错误消息

**代码示例**:
```typescript
import { parse } from '@dpml/parser';

// 包含错误的 DPML 字符串（缺少闭合标签）
const invalidDpml = `
<prompt>
  <message role="user">
    Hello world!
  </message>
  <message role="assistant"
    I'm happy to help you today.
</prompt>
`;

try {
  const document = parse(invalidDpml);
  // 处理解析成功的情况...
} catch (error) {
  // 精确的错误处理
  console.error(`解析错误: ${error.message}`);
  console.error(`位置: 第 ${error.line} 行, 第 ${error.column} 列`);
  console.error(`问题片段: ${error.sourceSnippet}`);
  
  // 在 UI 中向用户显示错误
  showErrorToUser({
    message: error.message,
    line: error.line,
    column: error.column,
    snippet: error.sourceSnippet
  });
}
```

### 用例 3：标签自定义

**标题**: 注册和使用自定义标签  
**主要参与者**: 框架扩展者  
**前置条件**: 扩展者需要添加特定领域的标签  

**主要流程**:
1. 扩展者定义新标签的 TagDefinition
2. 扩展者调用 `registerTag` 函数注册标签
3. 扩展者或其他开发者创建包含新标签的 DPML
4. 调用 `parse` 解析包含新标签的文档
5. Parser 成功解析并验证自定义标签

**成功标准**: 自定义标签能被正确解析和验证

**代码示例**:
```typescript
import { registerTag, parse, ContentModel } from '@dpml/parser';

// 注册自定义数据可视化标签
registerTag({
  name: 'chart',
  contentModel: ContentModel.EMPTY,
  allowedAttributes: ['type', 'data-source', 'height', 'width', 'title'],
  requiredAttributes: ['type', 'data-source']
});

// 使用注册的自定义标签
const dashboardDpml = `
<dashboard>
  <header>
    <title>销售数据分析</title>
  </header>
  <section>
    <chart type="bar" data-source="sales_q1_2023" width="600" height="400" title="季度销售" />
    <chart type="pie" data-source="product_categories" title="产品类别分布" />
  </section>
</dashboard>
`;

try {
  const document = parse(dashboardDpml);
  
  // 查找所有图表标签
  const charts = document.querySelectorAll('chart');
  
  // 处理每个图表
  charts.forEach(chart => {
    const chartType = chart.getAttributeValue('type');
    const dataSource = chart.getAttributeValue('data-source');
    const title = chart.getAttributeValue('title') || 'Untitled Chart';
    
    // 渲染图表
    renderChart({
      type: chartType,
      dataSource: dataSource,
      title: title,
      width: parseInt(chart.getAttributeValue('width') || '500'),
      height: parseInt(chart.getAttributeValue('height') || '300')
    });
  });
} catch (error) {
  console.error('解析或处理错误:', error);
}
```

### 用例 4：文档查询

**标题**: 使用选择器查询文档节点  
**主要参与者**: 应用开发者  
**前置条件**: 开发者已解析 DPML 文档  

**主要流程**:
1. 开发者使用 `querySelector` 或 `querySelectorAll` 方法
2. 开发者提供 CSS 风格的选择器表达式
3. Parser 在文档树中查找匹配的节点
4. 返回匹配的单个节点或节点列表

**成功标准**: 开发者能够方便地查询和获取文档中的特定节点

**代码示例**:
```typescript
import { parse } from '@dpml/parser';

const chatDpml = `
<conversation>
  <message role="user" id="msg1" timestamp="2023-07-01T10:15:00Z">
    你能推荐一些科幻小说吗？
  </message>
  <message role="assistant" id="msg2" timestamp="2023-07-01T10:15:05Z">
    当然可以！以下是几本经典科幻小说的推荐：
    <list>
      <item importance="high">《三体》 - 刘慈欣</item>
      <item importance="medium">《银河系漫游指南》 - 道格拉斯·亚当斯</item>
      <item importance="high">《神经漫游者》 - 威廉·吉布森</item>
    </list>
    你对哪种类型的科幻小说更感兴趣？
  </message>
</conversation>
`;

const document = parse(chatDpml);

// 1. 使用 ID 选择器查找特定消息
const firstMessage = document.querySelector('#msg1');
console.log(firstMessage.content.trim()); // "你能推荐一些科幻小说吗？"

// 2. 使用标签名查找所有消息
const allMessages = document.querySelectorAll('message');
console.log(`总共有 ${allMessages.length} 条消息`); // "总共有 2 条消息"

// 3. 使用属性选择器查找特定角色的消息
const assistantMessages = document.querySelectorAll('message[role="assistant"]');
assistantMessages.forEach(msg => {
  console.log(`助手回复时间: ${msg.getAttributeValue('timestamp')}`);
});

// 4. 使用后代选择器查找列表中的项目
const listItems = document.querySelectorAll('list item');
console.log(`推荐了 ${listItems.length} 本书`); // "推荐了 3 本书"

// 5. 使用属性值选择器查找重要项目
const importantItems = document.querySelectorAll('item[importance="high"]');
importantItems.forEach(item => {
  console.log(`重点推荐: ${item.content.trim()}`);
});
```

### 用例 5：IDE 集成

**标题**: 为 IDE 提供实时语法检查  
**主要参与者**: IDE 插件开发者  
**前置条件**: 插件开发者在开发 DPML 编辑插件  

**主要流程**:
1. 用户在 IDE 中编辑 DPML 文档
2. 插件实时调用 `parse` 函数检查语法
3. 如有错误，Parser 返回带位置的错误信息
4. 插件在 IDE 中标记错误位置并显示提示

**成功标准**: IDE 能够显示实时的语法错误提示

**代码示例**:
```typescript
import { parse, ParseError } from '@dpml/parser';

// IDE 插件中的实时验证函数
function validateDpmlDocument(content: string): ValidationResult {
  try {
    // 尝试解析文档
    parse(content);
    
    // 解析成功，无错误
    return {
      valid: true,
      errors: []
    };
  } catch (error) {
    if (error instanceof ParseError) {
      // 收集解析错误信息
      return {
        valid: false,
        errors: [{
          message: error.message,
          line: error.line,
          column: error.column,
          length: error.length || 1,
          severity: 'error',
          source: 'dpml-parser'
        }]
      };
    }
    
    // 未知错误
    return {
      valid: false,
      errors: [{
        message: `未知错误: ${error.message}`,
        line: 1,
        column: 1,
        severity: 'error',
        source: 'dpml-parser'
      }]
    };
  }
}

// IDE 编辑器改变时调用
function onEditorChange(newContent: string) {
  const validationResult = validateDpmlDocument(newContent);
  
  if (!validationResult.valid) {
    // 向编辑器添加错误标记
    validationResult.errors.forEach(error => {
      addErrorMarker(error.line, error.column, error.length, error.message);
    });
  } else {
    // 清除所有错误标记
    clearErrorMarkers();
  }
}
```

### 用例 6：文档验证

**标题**: 自定义验证规则检查  
**主要参与者**: 框架扩展者  
**前置条件**: 扩展者需要添加特定的验证规则  

**主要流程**:
1. 扩展者解析 DPML 文档获取 DPMLDocument
2. 扩展者使用 validate 函数进行验证
3. Parser 返回详细的验证结果
4. 扩展者处理验证错误和警告

**成功标准**: 扩展者能够获取完整的验证信息并采取相应措施

**代码示例**:
```typescript
import { parse, validate, createTagRegistry, registerTag, ContentModel } from '@dpml/parser';

// 创建自定义标签注册表
const customRegistry = createTagRegistry();

// 注册标签
customRegistry.register({
  name: 'api-endpoint',
  contentModel: ContentModel.CHILDREN_ONLY,
  allowedAttributes: ['method', 'path', 'auth-required'],
  requiredAttributes: ['method', 'path'],
  allowedChildTags: ['request', 'response', 'description']
});

customRegistry.register({
  name: 'request',
  contentModel: ContentModel.CONTENT_ONLY,
  allowedAttributes: ['content-type'],
  requiredAttributes: ['content-type']
});

customRegistry.register({
  name: 'response',
  contentModel: ContentModel.CONTENT_ONLY,
  allowedAttributes: ['status', 'content-type'],
  requiredAttributes: ['status']
});

// API 文档 DPML
const apiDocDpml = `
<api-spec>
  <api-endpoint method="GET" path="/users">
    <description>获取用户列表</description>
    <response status="200" content-type="application/json">
      返回用户列表的 JSON 数组
    </response>
  </api-endpoint>
  
  <api-endpoint method="POST" path="/users">
    <description>创建新用户</description>
    <request>
      用户数据 JSON 对象
    </request>
    <response status="201">
      返回新创建的用户 ID
    </response>
  </api-endpoint>
</api-spec>
`;

try {
  // 解析文档
  const document = parse(apiDocDpml, { validateOnParse: false });
  
  // 使用自定义标签注册表进行验证
  const validationResult = validate(document, customRegistry);
  
  if (validationResult.hasErrors()) {
    console.error('验证错误:');
    validationResult.errors.forEach(error => {
      const location = error.node ? 
        `第 ${error.node.sourceLocation.startLine} 行` : '未知位置';
      console.error(`- ${error.message} (${location})`);
    });
  }
  
  if (validationResult.hasWarnings()) {
    console.warn('验证警告:');
    validationResult.warnings.forEach(warning => {
      console.warn(`- ${warning.message}`);
    });
  }
  
  if (!validationResult.hasErrors() && !validationResult.hasWarnings()) {
    console.log('文档验证通过，没有错误或警告');
  }
} catch (error) {
  console.error('解析错误:', error.message);
}
```

## 4. 产品价值与用户收益

### 4.1 应用开发者收益

1. **更快的开发速度** - 通过简单的 API 快速解析和处理 DPML 内容
2. **减少错误处理代码** - 精确的错误信息减少处理错误的代码量
3. **灵活的查询能力** - 通过选择器语法高效查询文档节点

### 4.2 内容创建者收益

1. **更快的反馈循环** - 快速准确的错误信息帮助内容创建者修复问题
2. **减少调试时间** - 精确的错误位置减少定位问题的时间
3. **提高内容质量** - 及时发现格式和结构问题

### 4.3 框架扩展者收益

1. **灵活的扩展性** - 轻松添加自定义标签和验证规则
2. **可控的验证流程** - 根据需要定制验证行为
3. **与现有系统集成** - 简单集成到现有工作流程

### 4.4 IDE 插件开发者收益

1. **轻松实现语法高亮** - 基于 Parser 提供的标签信息
2. **实时错误检查** - 使用 Parser 实现实时语法验证
3. **智能代码补全** - 基于标签定义提供智能提示

## 5. 未来场景展望

随着 DPML Parser 的发展，以下场景将在未来版本中变得可能：

1. **增量解析** - 只解析更改的部分，提高大型文档的性能
2. **Schema 验证** - 基于 Schema 进行更复杂的文档验证
3. **性能优化** - 处理超大型文档的专门优化
4. **转换能力** - 与其他标记语言的互操作和转换
5. **可视化编辑** - 支持所见即所得的 DPML 编辑工具

---

本文档基于当前设计的 DPML Parser，从用户视角描述了主要的使用场景和价值。随着产品的发展，这些场景和用例将继续丰富和完善。 