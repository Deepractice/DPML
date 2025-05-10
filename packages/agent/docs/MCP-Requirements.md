# MCP集成需求规范

## 1. 概述

Model Context Protocol (MCP) 是一种开放协议，用于连接大语言模型与外部数据源和工具。在DPML项目中，我们将通过MCP为Agent添加工具调用能力，使Agent能够访问外部资源和执行特定操作。

## 2. XML配置

### 2.1 配置标签结构

在DPML的XML配置中，我们将使用`<mcp-servers>`标签来定义MCP服务器配置：

```xml
<agent>
  <mcp-servers>
    <mcp-server name="search-tools" type="http" url="http://localhost:3000/mcp" />
    <mcp-server name="file-tools" type="stdio" command="node" args="./file-server.js" />
  </mcp-servers>
  
  <!-- 其他agent配置 -->
</agent>
```

### 2.2 配置项说明

每个`<mcp-server>`标签支持以下属性：

| 属性 | 说明 | 是否必须 | 默认值 |
|------|------|----------|--------|
| name | 服务器名称，唯一标识符 | 是 | - |
| enabled | 是否启用此服务器 | 否 | true |
| type | 传输类型："http"或"stdio" | 否 | 自动推断 |
| url | HTTP服务器URL，type为"http"时使用 | 对HTTP必须 | - |
| command | 执行命令，type为"stdio"时使用 | 对stdio必须 | - |
| args | 命令参数，以空格分隔多个参数 | 否 | - |

对于复杂的命令行参数，可以将多个参数用空格分隔放在`args`属性中：

```xml
<mcp-server name="complex-tool" type="stdio" command="python" args="-m server.main --config config.yaml" />
```

## 3. 传输类型推断

当`type`属性未明确指定时，系统将根据以下规则自动推断传输类型：

1. 如果配置中包含`command`属性，则使用**stdio**传输
2. 如果配置中包含`url`属性，则使用**http**传输
3. 如果同时存在`url`和`command`属性，则优先使用**stdio**传输

当显式指定了`type`属性时，将始终使用指定的类型，并忽略与该类型不相关的参数。

## 4. 功能需求

### 4.1 Agent配置扩展

需要扩展Agent配置以支持MCP功能：

1. 允许用户在XML配置中定义多个MCP服务器
2. 每个MCP服务器应当支持独立的启用/禁用控制
3. Agent应当能够识别和使用已配置的MCP服务器

### 4.2 XML解析支持

解析器应当支持以下功能：

1. 正确解析`<mcp-servers>`标签及其子标签
2. 根据配置属性推断传输类型
3. 处理配置中的错误并提供有意义的错误信息

### 4.3 LLMClient增强

系统应当具备以下能力：

1. 使用MCP增强LLM客户端的功能
2. 在Agent初始化时自动连接相关的MCP服务器
3. 保持对未使用MCP的现有Agent行为的兼容性

## 5. 配置示例

### 5.1 HTTP传输示例

```xml
<agent>
  <mcp-servers>
    <mcp-server name="search-api" url="http://localhost:3000/mcp" />
  </mcp-servers>
  <llm apiType="openai" model="gpt-4" />
  <prompt>你是一个AI助手，可以帮助用户查询信息。</prompt>
</agent>
```

### 5.2 stdio传输示例

```xml
<agent>
  <mcp-servers>
    <mcp-server name="file-tools" command="node" args="./file-server.js" />
  </mcp-servers>
  <llm apiType="anthropic" model="claude-3-opus-20240229" />
  <prompt>你是一个AI助手，可以帮助用户操作文件。</prompt>
</agent>
```

### 5.3 多服务器示例

```xml
<agent>
  <mcp-servers>
    <mcp-server name="search-api" type="http" url="http://localhost:3000/mcp" />
    <mcp-server name="file-tools" type="stdio" command="node" args="./file-server.js" />
    <mcp-server name="db-tools" type="stdio" command="python" args="-m db_server" />
  </mcp-servers>
  <llm apiType="openai" model="gpt-4" />
  <prompt>你是一个功能全面的AI助手。</prompt>
</agent>
``` 