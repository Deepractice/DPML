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