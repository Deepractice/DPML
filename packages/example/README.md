# DPML Example

## 简介

DPML Example 是一个示例领域包，展示如何使用 DPML Core 创建特定领域的 DPML 应用。本包实现了一个简单的工作流描述语言，可以用于定义和执行基本的工作流程。

## 安装

```bash
npm install @dpml/example
```

## 使用方法

### 通过API使用

```typescript
import { exampleDPML } from '@dpml/example';

// DPML工作流文档
const dpmlContent = `
<workflow name="数据处理流程" version="1.0">
  <variables>
    <variable name="inputFile" type="string">data.csv</variable>
    <variable name="outputFormat" type="string">json</variable>
  </variables>
  
  <step id="step1" type="start">
    读取输入文件
  </step>
  
  <step id="step2" type="process">
    数据清洗和转换
  </step>
  
  <step id="step3" type="end">
    保存结果
  </step>
  
  <transition from="step1" to="step2" />
  <transition from="step2" to="step3" />
</workflow>
`;

// 编译DPML为领域对象
async function processWorkflow() {
  try {
    const workflow = await exampleDPML.compiler.compile(dpmlContent);
    console.log(`工作流名称: ${workflow.name}`);
    console.log(`步骤数量: ${workflow.steps.length}`);
    
    // 使用工作流对象...
  } catch (error) {
    console.error('编译失败:', error.message);
  }
}

processWorkflow();
```

### 通过命令行使用

安装后，可以使用 `dpml example` 命令：

```bash
# 验证工作流文件
dpml example validate path/to/workflow.xml

# 执行工作流
dpml example execute path/to/workflow.xml --output json
```

## 开发指南

本包遵循DPML的分层架构设计，包含以下核心组件：

- **Schema**: 定义了工作流文档的结构和约束
- **转换器**: 将DPML文档转换为工作流对象
- **命令**: 提供命令行功能

### 架构

```
packages/example/
  ├── src/
  │   ├── api/                 # API层 - 对外接口
  │   │   └── index.ts         # 公共API导出
  │   │
  │   ├── core/                # Core层 - 核心业务逻辑
  │   │   ├── transformers/    # 转换器实现
  │   │   └── utils/           # 工具函数
  │   │
  │   ├── types/               # Types层 - 类型定义
  │   │   └── workflow.ts      # 工作流类型定义
  │   │
  │   ├── config/              # 配置目录
  │   │   ├── schema.ts        # Schema配置
  │   │   ├── cli.ts           # CLI配置
  │   │   └── transformers.ts  # 转换器配置
  │   │
  │   ├── bin.ts               # CLI入口
  │   └── index.ts             # 包入口
```

## 示例

更多示例请参考 `examples` 目录。 