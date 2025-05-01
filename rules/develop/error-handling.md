# DPML 错误处理规范

## 1. 错误分类

DPML项目中的错误分为以下几类：

### 1.1 预期错误
- **用户输入错误**: 无效参数、格式错误等可预见的用户错误
- **业务约束错误**: 违反业务规则的操作请求
- **资源错误**: 资源不存在、资源访问受限等

### 1.2 非预期错误
- **编程错误**: 代码中的bug，如空引用、类型错误等
- **系统错误**: 内存不足、网络中断等系统级别故障
- **第三方依赖错误**: 外部服务或库抛出的未知错误

## 2. 错误处理策略

### 2.1 预期错误处理
- 使用返回值或特定的Result类型表示操作结果
- 提供详细的错误信息，帮助用户理解和修正问题
- 记录适当的日志，但不需要过度记录预期错误

### 2.2 非预期错误处理
- 捕获并记录详细的错误信息，包括堆栈跟踪
- 将技术细节错误转换为用户友好的消息
- 确保系统状态一致性，必要时进行资源清理

## 3. 错误设计模式

### 3.1 Result模式
- 使用Result类型封装操作结果和错误信息
- 可用TypeScript的联合类型实现
```typescript
type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

// 使用示例
function processData(data: string): Result<ProcessedData, ValidationError> {
  if (!isValid(data)) {
    return { success: false, error: new ValidationError('Invalid data format') };
  }
  return { success: true, value: process(data) };
}

// 调用方式
const result = processData(input);
if (result.success) {
  // 使用result.value
} else {
  // 处理result.error
}
```

### 3.2 错误层次结构
- 设计清晰的错误类型层次结构
- 所有自定义错误继承自基础错误类
```typescript
// 基础错误类
export class DPMLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DPMLError';
  }
}

// 特定模块错误
export class ParsingError extends DPMLError {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}

// 特定错误类型
export class XMLSyntaxError extends ParsingError {
  constructor(message: string, public position: number) {
    super(`XML syntax error at position ${position}: ${message}`);
    this.name = 'XMLSyntaxError';
  }
}
```

### 3.3 错误边界
- 在模块边界处统一处理错误
- API层负责将内部错误转换为适当的外部错误表示
- 使用错误映射将内部错误转换为API错误

## 4. 异步错误处理

### 4.1 Promise错误处理
- 总是使用catch处理Promise错误
- 避免吞没错误，确保错误得到适当处理或传播
```typescript
async function fetchData() {
  try {
    const response = await api.getData();
    return processResponse(response);
  } catch (error) {
    logger.error('Failed to fetch data', { error });
    throw new DataFetchError('Could not retrieve data', { cause: error });
  }
}
```

### 4.2 异步错误传播
- 使用async/await简化异步错误处理
- 确保异步函数的错误在调用链中得到处理
- 考虑使用统一的异步错误处理中间件

## 5. 日志与错误处理

### 5.1 错误日志级别
- **INFO**: 用户操作失败但属于预期情况
- **WARN**: 可能表明问题但系统可以继续运行
- **ERROR**: 意外错误，需要关注
- **FATAL**: 严重错误，导致系统部分或全部不可用

### 5.2 错误日志内容
- 记录错误消息、错误类型和堆栈跟踪
- 包含上下文信息，帮助理解错误发生的情境
- 包含唯一标识符，方便跟踪和关联问题

## 6. 测试中的错误处理

### 6.1 错误测试原则
- 测试正常路径和错误路径
- 对每种预期错误类型编写测试
- 验证错误信息的准确性和有用性

### 6.2 错误模拟
- 使用测试框架模拟错误条件
- 验证错误处理和恢复机制
- 测试错误边界和转换逻辑

## 7. 最佳实践

### 7.1 原则
- **提前失败**: 尽早检测和报告错误
- **详细信息**: 提供有助于诊断的详细错误信息
- **错误本地化**: 在最合适的位置处理错误
- **优雅降级**: 在可能的情况下提供降级功能

### 7.2 禁止行为
- 禁止吞没错误(catch块中不处理错误)
- 禁止使用通用错误消息
- 禁止在不同层之间泄漏错误细节
- 禁止过度使用try-catch阻止错误传播 