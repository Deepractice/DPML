# DPML Core Parsing 测试用例设计

本文档定义了DPML Core Parsing模块的测试用例设计，基于[Parsing-Develop-Design.md](./Parsing-Develop-Design.md)中的架构设计。

## 测试目录结构

```
packages/core/           # 核心包 (包根目录)
  src/                   # 源代码根目录
    api/                 # API层源码
      parser.ts          # 解析API
    core/                # Core层源码
      parsing/           # 解析模块源码
        parsingService.ts# 解析服务
        parserFactory.ts # 解析器工厂
        XMLAdapter.ts    # XML适配器
        DPMLAdapter.ts   # DPML适配器
    types/               # Types层源码
      DPMLDocument.ts    # 文档类型
      DPMLNode.ts        # 节点类型
      ParseOptions.ts    # 解析选项类型
  __tests__/             # 测试根目录
    unit/                # 单元测试
      core/              # Core层单元测试
        parsing/         # 解析模块单元测试
          XMLAdapter.test.ts
          DPMLAdapter.test.ts
          parserFactory.test.ts
          parsingService.test.ts
    integration/         # 集成测试
      parsing/
        parsingFlow.integration.test.ts
    contract/            # 契约测试
      api/
        parser.contract.test.ts
      types/
        DPMLDocument.contract.test.ts
        DPMLNode.contract.test.ts
    e2e/                 # 端到端测试
      parsing/
        parsingWorkflow.e2e.test.ts
    fixtures/            # 测试夹具
      parsing/
        dpmlFixtures.ts
```

## 1. 契约测试用例

### parser.contract.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-API-Parser-01 | parse函数应保持API契约稳定 | 验证API函数签名稳定性 | 类型检查 | 函数类型和签名符合文档 | 无需模拟 |
| CT-API-Parser-02 | parse函数应返回符合DPMLDocument类型的结果 | 验证返回类型符合约定 | 有效DPML内容 | 返回符合DPMLDocument接口的对象 | 模拟parsingService返回标准文档对象 |
| CT-API-Parser-03 | parseAsync函数应返回Promise\<DPMLDocument\> | 验证异步API契约 | 有效DPML内容 | 返回Promise，解析为DPMLDocument | 模拟parsingService返回Promise |
| CT-API-Parser-04 | 错误处理应符合API契约 | 验证错误处理契约 | 无效内容 | 抛出规定类型的异常 | 模拟parsingService抛出错误 |

### DPMLDocument.contract.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| CT-Type-Doc-01 | DPMLDocument类型结构应符合契约 | 验证类型定义稳定性 | 类型检查 | 包含所有规定属性及类型 | 无需模拟 |
| CT-Type-Doc-02 | DPMLDocument属性应为只读 | 验证不可变设计 | 尝试修改属性 | 编译错误或运行时错误 | 无需模拟 |

## 2. 单元测试用例

### XMLAdapter.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-XMLAdapter-01 | parse方法应正确解析基本XML | 验证基本XML解析功能 | 基本XML字符串 | 返回对应的XML节点结构 | 模拟IXMLParser.parse返回预定义节点 |
| UT-XMLAdapter-02 | parse方法应处理空XML | 验证空输入处理 | 空字符串 | 返回表示空文档的节点 | 模拟IXMLParser.parse返回空节点 |
| UT-XMLAdapter-03 | parse方法应传递XML解析错误 | 验证错误处理 | 无效XML字符串 | 抛出原始解析错误 | 模拟IXMLParser.parse抛出错误 |
| UT-XMLAdapter-04 | parseAsync方法应异步解析XML | 验证异步解析功能 | 基本XML字符串 | 返回Promise，解析为XML节点 | 模拟IXMLParser.parseAsync返回Promise |

### DPMLAdapter.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-DPMLAdapter-01 | parse方法应将XML转换为DPML结构 | 验证XML到DPML转换 | 模拟XML节点 | 返回符合DPML结构的文档 | 模拟XMLAdapter.parse返回XML节点 |
| UT-DPMLAdapter-02 | convertToDPML应正确转换属性 | 验证属性转换功能 | 带属性的XML节点 | DPML节点包含正确的属性映射 | 无需模拟，直接测试内部方法 |
| UT-DPMLAdapter-03 | buildNodeMap应创建正确的ID索引 | 验证ID索引构建 | 带ID的DPML节点树 | 返回正确的节点ID映射 | 无需模拟，直接测试内部方法 |
| UT-DPMLAdapter-04 | parse方法应处理嵌套节点 | 验证复杂结构处理 | 嵌套XML结构 | 返回正确嵌套的DPML文档 | 模拟XMLAdapter.parse返回嵌套节点 |

### parserFactory.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-ParserFactory-01 | createDPMLAdapter应创建正确配置的适配器 | 验证适配器创建 | 解析选项 | 返回配置正确的DPMLAdapter实例 | 无需模拟，验证实例类型和配置 |
| UT-ParserFactory-02 | createXMLAdapter应创建XML适配器 | 验证XML适配器创建 | 解析选项 | 返回配置正确的XMLAdapter实例 | 无需模拟，验证实例类型和配置 |

### parsingService.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| UT-ParsingService-01 | parse方法应协调适配器解析内容 | 验证解析流程协调 | DPML内容字符串 | 返回解析后的DPML文档 | 模拟parserFactory和DPMLAdapter |
| UT-ParsingService-02 | handleParsingErrors应统一处理错误 | 验证错误处理 | 各类错误对象 | 抛出统一格式的错误 | 无需模拟，直接测试内部方法 |
| UT-ParsingService-03 | processParseResult应进行必要的后处理 | 验证结果处理 | 原始解析结果 | 返回处理后的结果 | 无需模拟，直接测试内部方法 |
| UT-ParsingService-04 | parseAsync方法应支持异步解析 | 验证异步解析 | DPML内容字符串 | 返回Promise，解析为DPML文档 | 模拟parserFactory和DPMLAdapter |

## 3. 集成测试用例

### parsingFlow.integration.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| IT-Parsing-01 | 解析服务应完整处理基本DPML | 验证解析流程集成 | 基本DPML内容 | 返回完整解析的文档对象 | 仅模拟最底层XML解析器 |
| IT-Parsing-02 | 解析服务应处理复杂嵌套DPML | 验证复杂结构解析 | 复杂嵌套DPML | 返回正确嵌套结构的文档 | 仅模拟最底层XML解析器 |
| IT-Parsing-03 | 解析服务应正确处理解析错误 | 验证错误处理流程 | 无效DPML内容 | 抛出适当的错误对象 | 仅模拟最底层XML解析器抛出错误 |
| IT-Parsing-04 | 异步解析流程应正确工作 | 验证异步解析流程 | 大型DPML内容 | 返回Promise，解析为正确文档 | 仅模拟最底层XML解析器 |

## 4. 端到端测试用例

### parsingWorkflow.e2e.test.ts

| ID | 测试用例名称 | 测试目的 | 测试输入 | 期望结果 | Mock情况 |
|----|------------|---------|---------|---------|---------|
| E2E-Parsing-01 | 用户应能解析有效DPML内容 | 验证完整解析流程 | 有效DPML内容字符串 | 返回可用的DPML文档 | 无模拟，使用实际组件 |
| E2E-Parsing-02 | 用户应能异步解析大型DPML | 验证完整异步流程 | 大型DPML内容 | 异步返回完整文档 | 无模拟，使用实际组件 |
| E2E-Parsing-03 | 解析错误应提供清晰错误信息 | 验证错误处理体验 | 包含错误的DPML | 抛出包含位置和原因的错误 | 无模拟，使用实际组件 |

## 5. 测试夹具设计

```typescript
// packages/core/__tests__/fixtures/parsing/dpmlFixtures.ts
export function createBasicDPMLFixture() {
  return `<root><child id="child1">内容</child></root>`;
}

export function createComplexDPMLFixture() {
  return `<root>
    <header id="header1">
      <title>测试文档</title>
      <meta name="author" value="测试人员" />
    </header>
    <body>
      <section id="section1">
        <p>第一段落</p>
        <p>第二段落</p>
      </section>
      <section id="section2">
        <list>
          <item>列表项1</item>
          <item>列表项2</item>
        </list>
      </section>
    </body>
  </root>`;
}

export function createInvalidDPMLFixture() {
  return `<root><unclosed>`;
}
```

## 6. 测试实现示例

```typescript
// packages/core/__tests__/unit/core/parsing/XMLAdapter.test.ts
import { describe, test, expect, vi } from 'vitest';
import { XMLAdapter } from '../../../../src/core/parsing/XMLAdapter';
import { createBasicDPMLFixture } from '../../../fixtures/parsing/dpmlFixtures';

describe('UT-XMLAdapter', () => {
  test('应正确解析基本XML', () => {
    // 准备
    const mockXMLParser = {
      parse: vi.fn().mockReturnValue({ 
        tagName: 'root', 
        children: [{ tagName: 'child', attributes: { id: 'child1' }, children: [] }] 
      })
    };
    const adapter = new XMLAdapter({ throwOnError: true }, mockXMLParser);
    
    // 执行
    const result = adapter.parse(createBasicDPMLFixture());
    
    // 断言
    expect(result.tagName).toBe('root');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].attributes.id).toBe('child1');
    expect(mockXMLParser.parse).toHaveBeenCalledWith(createBasicDPMLFixture());
  });
});
```

## 7. 测试覆盖范围

本测试用例设计遵循DPML架构测试策略规则，为解析模块的各个组件提供了全面的测试覆盖：

1. **契约测试**：确保API和类型定义的稳定性
2. **单元测试**：验证各组件的独立功能
3. **集成测试**：验证组件间协作
4. **端到端测试**：验证完整用户流程

测试用例设计注重正面测试和反面测试的平衡，确保既测试正常功能路径，也测试错误处理机制。 