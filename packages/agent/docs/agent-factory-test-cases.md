# AgentFactory 测试用例

以下是 AgentFactory 的测试用例，用于验证 AgentFactory 的功能正确性、稳定性和性能。

## 单元测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
|-------|---------|---------|---------|
| UT-AF-001 | 从配置对象创建Agent | 测试使用配置对象创建Agent | 成功创建Agent实例，配置正确应用 |
| UT-AF-002 | 从DPML文件创建Agent | 测试使用DPML文件路径创建Agent | 成功解析文件并创建Agent实例 |
| UT-AF-003 | 从DPML字符串创建Agent | 测试使用DPML字符串创建Agent | 成功解析字符串并创建Agent实例 |
| UT-AF-004 | 配置验证 | 测试配置验证逻辑 | 无效配置被检测并报错，提供明确错误信息 |
| UT-AF-005 | 缓存机制 | 测试Agent实例缓存机制 | 相同配置创建的Agent实例被正确缓存和复用 |
| UT-AF-006 | 错误处理 | 测试各种错误情况的处理 | 各类错误被正确捕获并提供友好错误信息 |
| UT-AF-007 | 组件创建 | 测试各组件的创建逻辑 | 所有必要组件被正确创建和配置 |
| UT-AF-008 | 提示词处理 | 测试提示词的提取和处理 | 提示词被正确提取并应用到Agent配置 |
| UT-AF-009 | LLM配置处理 | 测试LLM配置的提取和处理 | LLM配置被正确提取并应用到连接器 |
| UT-AF-010 | 默认值处理 | 测试缺少配置时的默认值处理 | 缺少配置时正确应用默认值 |
| UT-AF-011 | 配置继承 | 测试配置继承处理 | 继承的配置被正确合并和应用 |
| UT-AF-012 | 性能测试 | 测试创建Agent的性能 | Agent创建性能在可接受范围内 |

## 集成测试

| 测试ID | 测试名称 | 测试意图 | 预期结果 |
|-------|---------|---------|---------|
| IT-AF-001 | 与Core包集成 | 测试与Core包的集成 | 成功使用Core包解析和处理DPML |
| IT-AF-002 | 与Prompt包集成 | 测试与Prompt包的集成 | 成功委托Prompt包处理提示词 |
| IT-AF-003 | 端到端测试 | 测试从DPML到执行的完整流程 | 完整流程正常工作，Agent能正确执行 |

## 测试场景示例

### 1. 从配置对象创建Agent

```typescript
// 测试从配置对象创建Agent
test('从配置对象创建Agent', async () => {
  // 准备测试配置
  const config: AgentFactoryConfig = {
    id: 'test-agent',
    version: '1.0',
    executionConfig: {
      defaultModel: 'gpt-4',
      apiType: 'openai',
      systemPrompt: '你是一个测试助手'
    }
  };
  
  // 创建Agent
  const agent = await AgentFactory.createAgent(config);
  
  // 验证Agent属性
  expect(agent.getId()).toBe('test-agent');
  expect(agent.getVersion()).toBe('1.0');
  
  // 验证Agent功能
  const result = await agent.execute({ text: '测试问题', sessionId: 'test-session' });
  expect(result.success).toBe(true);
});
```

### 2. 从DPML文件创建Agent

```typescript
// 测试从DPML文件创建Agent
test('从DPML文件创建Agent', async () => {
  // 准备测试文件路径
  const filePath = path.join(__dirname, 'fixtures', 'test-agent.dpml');
  
  // 创建Agent
  const agent = await AgentFactory.createAgent(filePath);
  
  // 验证Agent属性
  expect(agent.getId()).toBe('test-agent');
  
  // 验证Agent功能
  const result = await agent.execute({ text: '测试问题', sessionId: 'test-session' });
  expect(result.success).toBe(true);
});
```

### 3. 从DPML字符串创建Agent

```typescript
// 测试从DPML字符串创建Agent
test('从DPML字符串创建Agent', async () => {
  // 准备测试DPML字符串
  const dpmlString = `
    <agent id="test-agent" version="1.0">
      <llm model="gpt-4" api-type="openai" />
      <prompt>你是一个测试助手</prompt>
    </agent>
  `;
  
  // 创建Agent
  const agent = await AgentFactory.createAgent(dpmlString);
  
  // 验证Agent属性
  expect(agent.getId()).toBe('test-agent');
  
  // 验证Agent功能
  const result = await agent.execute({ text: '测试问题', sessionId: 'test-session' });
  expect(result.success).toBe(true);
});
```

### 4. 配置验证测试

```typescript
// 测试配置验证
test('配置验证', async () => {
  // 准备无效配置
  const invalidConfig: AgentFactoryConfig = {
    id: 'test-agent',
    version: '1.0',
    executionConfig: {
      defaultModel: '', // 无效的模型名称
      apiType: 'invalid-api', // 无效的API类型
      systemPrompt: '你是一个测试助手'
    }
  };
  
  // 验证创建失败并提供明确错误信息
  await expect(AgentFactory.createAgent(invalidConfig)).rejects.toThrow(/defaultModel/);
  
  // 修复模型名称
  invalidConfig.executionConfig.defaultModel = 'gpt-4';
  
  // 验证API类型错误
  await expect(AgentFactory.createAgent(invalidConfig)).rejects.toThrow(/apiType/);
});
```

### 5. 缓存机制测试

```typescript
// 测试缓存机制
test('缓存机制', async () => {
  // 准备测试配置
  const config: AgentFactoryConfig = {
    id: 'cache-test-agent',
    version: '1.0',
    executionConfig: {
      defaultModel: 'gpt-4',
      apiType: 'openai',
      systemPrompt: '你是一个测试助手'
    }
  };
  
  // 创建第一个Agent
  const agent1 = await AgentFactory.createAgent(config);
  
  // 创建第二个Agent（应该返回缓存的实例）
  const agent2 = await AgentFactory.createAgent(config);
  
  // 验证是同一个实例
  expect(agent1).toBe(agent2);
  
  // 清除缓存
  AgentFactory.clearCache();
  
  // 创建第三个Agent（应该是新实例）
  const agent3 = await AgentFactory.createAgent(config);
  
  // 验证是不同实例
  expect(agent1).not.toBe(agent3);
});
```
