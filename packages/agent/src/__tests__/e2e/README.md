# DPML Agent 端到端测试指南

本文档提供了在DPML Agent项目中编写有效端到端测试的指南。

## 测试类型

我们有两种类型的端到端测试：

1. **模拟环境测试**：使用模拟对象和依赖注入进行的测试。这些测试速度快，但可能无法发现实际集成环境中的问题。

2. **真实环境测试**：使用真实的CLI执行路径进行的测试。这些测试更完整，能够发现真实环境中的集成问题。

## 真实环境测试方法

### 1. 使用辅助函数

我们提供了一系列辅助函数，位于 `helpers/real-cli-helper.ts` 中：

- `executeRealCliCommand(command, args)`: 在真实环境中执行CLI命令
- `createTestDPMLFile(content, fileName)`: 创建测试用的DPML配置文件
- `mockReadlineForAutoExit()`: 模拟readline的交互界面，自动响应退出命令

### 2. 测试完整执行路径

真实环境测试应该测试完整的执行路径：

```
bin.ts -> agentDPML.cli.execute() -> CommandAdapter -> createDomainActionContext -> getCompiler
```

不要跳过任何步骤或使用模拟对象替代关键组件。

### 3. 测试示例

```typescript
import { executeRealCliCommand } from './helpers/real-cli-helper';

test('CLI命令应该正确执行', async () => {
  const { output, exitCode } = await executeRealCliCommand('agent chat', ['config.dpml']);
  
  // 验证输出和退出码
  expect(output).toContain('预期内容');
  expect(exitCode).toBe(0);
});
```

## 最佳实践

1. **测试真实的CLI初始化**：确保测试包含从bin.ts入口点开始的完整执行路径。

2. **捕获和验证输出**：使用`executeRealCliCommand`函数捕获输出和退出码，并验证其内容。

3. **测试错误处理**：验证错误情况下的行为，如提供无效配置或参数。

4. **减少模拟依赖**：尽量减少对模拟对象的依赖，使用真实组件。

5. **清理资源**：确保测试后清理所有资源和状态。

## 常见问题

### 我应该什么时候使用模拟环境测试？

- 当测试需要模拟外部服务（如OpenAI API）时
- 当测试复杂交互场景需要控制响应时
- 当测试重点是逻辑而非集成时

### 我应该什么时候使用真实环境测试？

- 当测试CLI执行流程时
- 当测试组件之间的集成时
- 当发现模拟环境测试未能发现的问题时

## 特殊测试场景

### 测试交互式命令

对于交互式命令（如chat），使用`mockReadlineForAutoExit`来模拟用户输入：

```typescript
const cleanup = mockReadlineForAutoExit();
try {
  // 执行测试
} finally {
  cleanup();
}
```

### 测试文件操作

在测试中使用`createTestDPMLFile`创建临时测试文件，这样测试不会污染真实配置文件。

## 故障排除

如果测试失败并显示"领域编译器尚未初始化"错误，检查：

1. 执行路径是否跳过了初始化步骤
2. CLI配置是否正确导出和初始化
3. 领域上下文是否在使用前正确设置

# 端到端测试环境变量支持

DPML Agent端到端测试支持通过环境变量配置来切换使用真实API或模拟API进行测试。

## 配置方法

### 1. 创建.env文件

在`packages/agent`目录下创建一个`.env`文件，可以从`.env.example`复制后修改：

```bash
# OpenAI API配置
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1  # 可自定义API地址
OPENAI_MODEL=gpt-4                         # 使用的模型名称

# Anthropic API配置
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3

# 日志配置
LOG_LEVEL=info

# 测试配置
TEST_TIMEOUT=15000                        # 测试超时时间(ms)
TEST_USE_REAL_API=true                    # 设置为true使用真实API，false使用模拟
```

### 2. 配置说明

- `TEST_USE_REAL_API`: 
  - 设置为`true`时，使用真实API进行测试
  - 设置为`false`时，使用模拟API进行测试
  - 在CI环境中默认为`false`

- 其他API配置:
  - `OPENAI_API_KEY`, `OPENAI_MODEL`: OpenAI API必需参数
  - `OPENAI_API_URL`: 可选，自定义API地址（如使用代理或兼容服务）
  - `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`: Anthropic API必需参数

### 3. 临时覆盖环境变量

可以在运行测试时临时覆盖环境变量：

```bash
# 临时使用模拟模式
TEST_USE_REAL_API=false npx vitest run

# 临时使用真实API
TEST_USE_REAL_API=true npx vitest run
```

## 开发说明

### 测试结构

- `env-helper.ts`: 环境变量加载和检测模块
- `agent-conversation.e2e.test.ts`: 对话功能测试
- `agent-configuration.e2e.test.ts`: 配置功能测试

### 添加新测试

添加新测试时，可以使用以下辅助函数：

- `isLLMConfigValid(apiType)`: 检查指定API类型配置是否有效
- `getLLMConfig(apiType)`: 获取指定API类型的配置
- `showMockWarning(apiType)`: 显示使用模拟测试的警告

### 最佳实践

1. 使用模式检测函数决定测试行为：
```typescript
const useRealAPI = isLLMConfigValid('openai');

if (useRealAPI) {
  // 真实API测试
} else {
  // 模拟API测试
}
```

2. 对于无法详细验证的真实API测试，可以使用宽松断言：
```typescript
if (useRealAPI) {
  // 真实API只验证响应存在
  expect(response).toBeTruthy();
} else {
  // 模拟模式进行详细验证
  expect(response).toContain('预期内容');
}
```

3. 某些测试可以在使用真实API时跳过：
```typescript
if (useRealAPI) {
  console.info('使用真实API时跳过复杂测试');
  return;
}
```

## 注意事项

1. 确保`.env`文件已加入`.gitignore`，不要提交包含真实API密钥的文件
2. CI环境中建议使用模拟模式，避免消耗API额度
3. 本地开发时可以使用真实API进行更全面的测试
4. 测试超时时间可通过`TEST_TIMEOUT`调整，默认为15000ms 