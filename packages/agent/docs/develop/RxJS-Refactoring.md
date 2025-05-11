# DPML Agent RxJS接口重构方案

本文档记录DPML Agent模块从基于Promise/AsyncIterable接口到基于RxJS Observable接口的重构计划。由于模块尚未正式发布，我们可以直接进行彻底重构，无需考虑向后兼容问题。

## 1. 重构目标

- 使用Observable统一同步和流式API
- 简化接口设计，移除不必要的方法重复
- 提供更强大的组合和控制能力
- 保持多模态支持
- 支持Agent管理多会话
- 允许更新已发送的消息（如工具调用场景）

## 2. 核心接口变更对比

### 2.1 Agent接口

**原始代码:**
```typescript
// packages/agent/src/types/Agent.ts
import type { ChatInput } from './Chat';

/**
 * Agent接口
 *
 * 定义AI对话代理的标准交互方法。
 */
export interface Agent {
  /**
   * 发送消息并获取文本响应
   * @param input 文本消息或ChatInput对象
   * @returns 文本响应
   */
  chat(input: string | ChatInput): Promise<string>;

  /**
   * 发送消息并获取流式响应
   * @param input 文本消息或ChatInput对象
   * @returns 文本块的异步迭代器
   */
  chatStream(input: string | ChatInput): AsyncIterable<string>;
}
```

**重构代码:**
```typescript
// packages/agent/src/types/Agent.ts
import type { Observable } from 'rxjs';
import type { ChatInput, ChatOutput } from './Chat';
import type { AgentSession } from './AgentSession';

/**
 * Agent接口
 *
 * 定义AI对话代理的标准交互方法。
 */
export interface Agent {
  /**
   * 使用指定会话发送消息并获取响应
   * @param sessionId 会话ID
   * @param input 文本消息或ChatInput对象
   * @returns 响应内容的Observable流
   */
  chat(sessionId: string, input: string | ChatInput): Observable<ChatOutput>;
  
  /**
   * 取消指定会话的进行中请求
   */
  cancel(sessionId: string): void;
  
  /**
   * 创建新会话
   * @returns 新会话的ID
   */
  createSession(): string;
  
  /**
   * 获取指定会话
   */
  getSession(sessionId: string): AgentSession | undefined;
  
  /**
   * 删除指定会话
   */
  removeSession(sessionId: string): boolean;
}
```

**主要变更:**
- 支持多会话管理，每个会话有唯一ID
- 合并`chat`和`chatStream`为单一的`chat`方法
- 返回类型从`Promise<string>`和`AsyncIterable<string>`统一为`Observable<ChatOutput>`
- 添加会话管理方法：createSession、getSession和removeSession
- 取消方法现在需要指定会话ID

### 2.2 Message接口

**原始代码:**
```typescript
// packages/agent/src/core/types.ts
export interface Message {
  /**
   * 消息角色
   */
  readonly role: Role;

  /**
   * 消息内容，支持多模态
   */
  readonly content: Content;
}
```

**重构代码:**
```typescript
// packages/agent/src/types/Message.ts
import type { Content } from './Content';

/**
 * 消息角色
 */
export type Role = 'system' | 'user' | 'assistant';

/**
 * 消息接口
 * 
 * 定义对话中的一条消息
 */
export interface Message {
  /**
   * 消息唯一标识符
   * 用于更新和追踪消息
   */
  id: string;
  
  /**
   * 消息角色
   */
  readonly role: Role;

  /**
   * 消息内容，支持多模态
   */
  readonly content: Content;
  
  /**
   * 消息创建时间
   */
  timestamp?: number;
  
  /**
   * 元数据
   * 可用于存储任何与消息相关的额外信息
   */
  metadata?: Record<string, any>;
}
```

**主要变更:**
- 从core/types移动到types/Message.ts，成为公共类型
- 添加id字段，支持消息的唯一标识和更新
- 添加timestamp支持消息时间记录
- 添加metadata支持存储额外信息
- 明确定义Role类型

### 2.3 LLMRequest接口

**新增接口:**
```typescript
// packages/agent/src/core/llm/LLMRequest.ts
import type { Message } from '../../types/Message';

/**
 * LLM请求接口
 * 用于向LLM服务发送统一格式的请求
 */
export interface LLMRequest {
  /**
   * 会话ID，用于跟踪请求
   */
  sessionId: string;

  /**
   * 消息历史
   */
  messages: ReadonlyArray<Message>;

  /**
   * 模型标识符，可选
   * 允许覆盖客户端默认模型
   */
  model?: string;

  /**
   * 提供商特定参数，可选
   * 用于传递特定LLM提供商的独特参数
   */
  providerParams?: Record<string, any>;
}
```

**引入原因:**
- 提供更灵活的请求格式，便于未来扩展
- 支持会话上下文传递，方便追踪相关请求
- 允许传递特定提供商参数，增强兼容性
- 为后续添加工具调用等功能预留接口

### 2.4 LLMClient接口

**原始代码:**
```typescript
// packages/agent/src/core/llm/LLMClient.ts
import type { ChatOutput } from '../../types';
import type { Message } from '../types';

/**
 * LLM客户端接口
 */
export interface LLMClient {
  /**
   * 发送消息并获取响应
   *
   * @param messages 消息列表
   * @param stream 是否使用流式响应
   * @returns 响应内容或流式响应迭代器
   */
  sendMessages(messages: Message[], stream: boolean): Promise<ChatOutput | AsyncIterable<ChatOutput>>;
}
```

**重构代码:**
```typescript
// packages/agent/src/core/llm/LLMClient.ts
import type { Observable } from 'rxjs';
import type { ChatOutput } from '../../types';
import type { LLMRequest } from './LLMRequest';

/**
 * LLM客户端接口
 */
export interface LLMClient {
  /**
   * 发送请求并获取响应
   * @param request LLM请求信息
   * @returns 响应内容的Observable流
   */
  sendRequest(request: LLMRequest): Observable<ChatOutput>;
}
```

**主要变更:**
- 使用`LLMRequest`接口替代直接传递消息数组和stream参数
- 方法名从`sendMessages`改为`sendRequest`，更准确地反映其功能
- 返回类型统一为`Observable<ChatOutput>`
- 增强接口灵活性，方便适配不同LLM提供商的API差异

### 2.5 AgentSession接口

**原始代码:**
```typescript
// packages/agent/src/core/session/AgentSession.ts
import type { Message } from '../types';

/**
 * 会话管理接口
 * 
 * 内部接口，用于管理对话历史。
 */
export interface AgentSession {
  /**
   * 添加消息到历史
   */
  addMessage(message: Message): void;
  
  /**
   * 获取所有历史消息
   */
  getMessages(): ReadonlyArray<Message>;
}
```

**重构代码:**
```typescript
// packages/agent/src/types/AgentSession.ts
import type { Observable } from 'rxjs';
import type { Message } from './Message';

/**
 * 会话管理接口
 * 
 * 用于管理对话历史。
 */
export interface AgentSession {
  /**
   * 会话ID
   */
  readonly id: string;
  
  /**
   * 添加消息到历史
   */
  addMessage(message: Message): void;
  
  /**
   * 更新已有消息
   * @param messageId 消息ID
   * @param updater 更新函数，接收当前消息并返回更新后的消息
   */
  updateMessage(messageId: string, updater: (message: Message) => Message): void;
  
  /**
   * 获取所有历史消息
   */
  getMessages(): ReadonlyArray<Message>;
  
  /**
   * 会话消息流
   */
  readonly messages$: Observable<ReadonlyArray<Message>>;
  
  /**
   * 清除会话历史
   */
  clear(): void;
}
```

**主要变更:**
- 移动到公共类型层（从core/session到types目录）
- 添加会话ID标识
- 添加`updateMessage`方法用于支持更新已有消息（如工具调用场景）
- 添加`messages$`属性暴露响应式消息流
- 添加`clear`方法用于清除会话历史

## 3. 使用示例对比

### 3.1 同步响应获取

**原始代码:**
```typescript
// 使用Promise获取单一响应
const response = await agent.chat('请解释JavaScript中的闭包概念');
console.log(response); // 字符串响应
```

**重构代码:**
```typescript
import { firstValueFrom } from 'rxjs';

// 创建会话
const sessionId = agent.createSession();

// 使用firstValueFrom获取单一响应
const response = await firstValueFrom(agent.chat(sessionId, '请解释JavaScript中的闭包概念'));
console.log(extractTextContent(response.content)); // 从ChatOutput提取文本
```

### 3.2 流式响应处理

**原始代码:**
```typescript
// 使用for-await-of迭代AsyncIterable
for await (const chunk of agent.chatStream('写一个TypeScript中的单例模式实现')) {
  process.stdout.write(chunk); // 直接是字符串
}
```

**重构代码:**
```typescript
// 创建会话
const sessionId = agent.createSession();

// 使用Observable订阅
agent.chat(sessionId, '写一个TypeScript中的单例模式实现').subscribe({
  next: (output) => {
    const text = extractTextContent(output.content);
    process.stdout.write(text);
  },
  error: (err) => console.error('错误:', err),
  complete: () => console.log('\n完成')
});
```

### 3.3 多轮对话

**原始代码:**
```typescript
// 第一轮
const response1 = await agent.chat('什么是TypeScript？');
console.log(response1);

// 第二轮 - 没有会话上下文管理
const response2 = await agent.chat('它与JavaScript有什么区别？');
console.log(response2);
```

**重构代码:**
```typescript
// 创建会话
const sessionId = agent.createSession();

// 第一轮
const response1 = await firstValueFrom(agent.chat(sessionId, '什么是TypeScript？'));
console.log(extractTextContent(response1.content));

// 第二轮 - 自动维护会话上下文
const response2 = await firstValueFrom(agent.chat(sessionId, '它与JavaScript有什么区别？'));
console.log(extractTextContent(response2.content));

// 可以查看会话历史
const session = agent.getSession(sessionId);
console.log(`会话包含 ${session?.getMessages().length} 条消息`);
```

### 3.4 工具调用场景

**原始代码:**
没有直接支持工具调用消息更新的能力。

**重构代码:**
```typescript
// 创建会话
const sessionId = agent.createSession();
const session = agent.getSession(sessionId)!;

// 发送消息
agent.chat(sessionId, '请编写一个JavaScript函数').subscribe({
  next: (output) => {
    console.log(extractTextContent(output.content));
  }
});

// 订阅会话变化
session.messages$.subscribe(messages => {
  console.log('会话状态更新:', 
    messages.map(m => `${m.role}: ${m.content.slice(0, 20)}...`)
  );
});
```

### 3.5 LLMClient使用示例

**原始代码:**
```typescript
const llmClient = createLLMClient(config.llm);
const response = await llmClient.sendMessages(messages, false);
// 或者流式请求
const streamResponse = await llmClient.sendMessages(messages, true);
for await (const chunk of streamResponse) {
  // 处理流式响应
}
```

**重构代码:**
```typescript
const llmClient = createLLMClient(config.llm);

// 创建请求
const request: LLMRequest = {
  sessionId: sessionId,
  messages: session.getMessages(),
  // 可选择性地覆盖默认模型
  model: 'gpt-4-turbo',
  // 可以传递特定提供商参数
  providerParams: {
    temperature: 0.7,
    max_tokens: 1000
  }
};

// 发送请求并处理响应流
llmClient.sendRequest(request).subscribe({
  next: (output) => {
    console.log('收到响应:', extractTextContent(output.content));
  },
  error: (err) => console.error('出错:', err),
  complete: () => console.log('完成')
});
```

### 3.6 取消操作

**原始代码:**
```typescript
// 原接口没有提供取消能力
const promptTask = agent.chat('生成一篇长文章');
// 无法中途取消...
```

**重构代码:**
```typescript
// 创建会话
const sessionId = agent.createSession();

// 使用subscription取消
const subscription = agent.chat(sessionId, '生成一篇长文章').subscribe({
  next: (output) => console.log(extractTextContent(output.content)),
  // ...
});

// 5秒后取消
setTimeout(() => {
  subscription.unsubscribe();
  // 或使用agent.cancel(sessionId);
}, 5000);
```

### 3.7 多会话管理

**原始代码:**
没有直接支持多会话管理。

**重构代码:**
```typescript
// 创建并管理多个会话
const session1Id = agent.createSession();
const session2Id = agent.createSession();

// 在不同会话中发送消息
agent.chat(session1Id, '你好，我是用户1').subscribe(/*...*/);
agent.chat(session2Id, '你好，我是用户2').subscribe(/*...*/);

// 获取特定会话
const session1 = agent.getSession(session1Id);
const session2 = agent.getSession(session2Id);

// 移除不再需要的会话
agent.removeSession(session1Id);
```

## 4. 优势总结

1. **接口统一**
   - 一个方法处理同步和流式响应
   - 不再需要根据需求选择不同方法

2. **更强操作能力**
   - 支持取消、重试、超时等高级操作
   - 可以与RxJS生态系统无缝集成

3. **多模态支持**
   - 直接处理ChatOutput而非提取字符串
   - 更容易支持未来的多模态响应

4. **类型安全增强**
   - 使用ReadonlyArray增强不可变性
   - Observable类型提供更精确的异步操作建模

5. **多会话管理**
   - 支持一个Agent实例处理多个独立会话
   - 适合服务端场景和多用户系统

6. **消息更新能力**
   - 支持更新已发送的消息
   - 对工具调用场景至关重要

7. **灵活的LLM请求**
   - 通过LLMRequest接口支持多种参数
   - 更好地适配不同LLM提供商的API

## 5. 错误处理

在RxJS环境中，错误处理变得尤为重要，因为Observable流一旦发生错误就会终止。本章节介绍如何将现有的`AgentError`系统与RxJS流结合，创建健壮的错误处理机制。

### 5.1 错误处理基本原则

1. **错误封装**：所有错误应包装为`AgentError`实例，保留原始错误信息
2. **错误类型分类**：使用`AgentErrorType`明确错误类别，便于区分处理
3. **流内处理**：尽可能在Observable管道内处理错误，避免中断用户体验
4. **选择性重试**：仅对特定类型的错误进行重试，如网络问题
5. **优雅降级**：提供合理的错误恢复机制，如返回错误消息而非中断流

### 5.2 在LLMClient中集成错误处理

```typescript
// packages/agent/src/core/llm/OpenAIClient.ts
import { Observable, throwError, timer } from 'rxjs';
import { catchError, timeout, retryWhen, mergeMap, take, finalize } from 'rxjs/operators';
import { AgentError, AgentErrorType } from '../../types/errors';
import type { ChatOutput } from '../../types';
import type { LLMRequest } from './LLMRequest';

export class OpenAIClient implements LLMClient {
  // ...其他实现...
  
  public sendRequest(request: LLMRequest): Observable<ChatOutput> {
    return new Observable<ChatOutput>(observer => {
      const abortController = new AbortController();
      
      // 处理请求
      this.makeRequest(request, abortController)
        .then(response => {
          // 按需处理成功的响应...
          observer.complete();
        })
        .catch(error => {
          // 将原始错误转换为AgentError
          if (error instanceof AgentError) {
            observer.error(error);
          } else {
            observer.error(new AgentError(
              `LLM服务调用失败: ${error.message}`,
              AgentErrorType.LLM_SERVICE,
              'LLM_API_ERROR',
              error
            ));
          }
        });
      
      // 返回清理函数
      return () => {
        abortController.abort();
      };
    }).pipe(
      // 添加30秒超时
      timeout({
        each: 30000,
        with: () => throwError(() => new AgentError(
          '请求超时',
          AgentErrorType.LLM_SERVICE,
          'REQUEST_TIMEOUT'
        ))
      }),
      
      // 针对特定错误类型进行重试
      retryWhen(errors => errors.pipe(
        // 仅重试网络相关错误
        mergeMap(error => {
          // 判断是否是应该重试的错误
          const shouldRetry = 
            error instanceof AgentError && 
            error.type === AgentErrorType.LLM_SERVICE &&
            ['NETWORK_ERROR', 'RATE_LIMIT_EXCEEDED'].includes(error.code);
          
          if (shouldRetry) {
            return timer(1000); // 1秒后重试
          }
          
          return throwError(() => error); // 其他错误不重试
        }),
        // 最多重试3次
        take(3)
      )),
      
      // 最终错误处理
      catchError(error => {
        console.error(`LLM请求失败: ${error.message}`, error);
        return throwError(() => error);
      }),
      
      // 资源清理
      finalize(() => {
        console.log(`请求完成: ${request.sessionId}`);
      })
    );
  }
}
```

## 6. AgentSession实现建议

我们可以直接修改现有的`InMemoryAgentSession`类来添加RxJS功能，无需创建新的类型：

```typescript
// packages/agent/src/core/session/InMemoryAgentSession.ts
import { ReplaySubject } from 'rxjs';
import { map, scan } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types';
import type { AgentSession } from './AgentSession';

/**
 * 内存会话实现
 */
export class InMemoryAgentSession implements AgentSession {
  public readonly id: string;
  
  private messages: Message[] = [];
  private capacity: number;
  
  // 消息事件主题
  private _messagesSubject = new ReplaySubject<{
    type: 'add' | 'update' | 'clear';
    message?: Message;
    messageId?: string;
    updater?: (message: Message) => Message;
  }>();
  
  // 消息流，对外暴露为Observable
  public readonly messages$ = this._messagesSubject.pipe(
    scan((messages, action) => {
      // 创建消息数组的副本
      const result = [...messages];
      
      if (action.type === 'add' && action.message) {
        // 添加消息
        result.push(action.message);
        // 确保容量限制
        if (result.length > this.capacity) {
          result.shift();
        }
      } 
      else if (action.type === 'update' && action.messageId && action.updater) {
        // 更新消息
        const index = result.findIndex(m => m.id === action.messageId);
        if (index >= 0) {
          result[index] = action.updater(result[index]);
        }
      }
      else if (action.type === 'clear') {
        // 清除所有消息
        return [];
      }
      
      return result;
    }, [] as Message[]),
    map(messages => messages as ReadonlyArray<Message>)
  );

  constructor(id?: string, capacity: number = 100) {
    this.id = id || uuidv4();
    this.capacity = capacity;
  }

  public addMessage(message: Message): void {
    // 确保消息有ID
    const messageWithId = message.id ? message : { ...message, id: uuidv4() };
    
    // 添加到消息数组
    this.messages.push(messageWithId);
    
    // 如果超出容量，删除最早的消息
    if (this.messages.length > this.capacity) {
      this.messages.shift();
    }
    
    // 通知订阅者
    this._messagesSubject.next({
      type: 'add',
      message: messageWithId
    });
  }
  
  /**
   * 更新已有消息
   */
  public updateMessage(messageId: string, updater: (message: Message) => Message): void {
    // 查找并更新消息
    const index = this.messages.findIndex(m => m.id === messageId);
    if (index >= 0) {
      this.messages[index] = updater(this.messages[index]);
      
      // 通知订阅者
      this._messagesSubject.next({
        type: 'update',
        messageId,
        updater
      });
    }
  }

  public getMessages(): ReadonlyArray<Message> {
    return [...this.messages];
  }
  
  /**
   * 清除会话历史
   */
  public clear(): void {
    this.messages = [];
    this._messagesSubject.next({ type: 'clear' });
  }
}
```

这个实现保持了`InMemoryAgentSession`类的原有结构，同时增加了以下RxJS相关功能：

1. 添加了`ReplaySubject`用于发出消息变更事件
2. 添加了`messages$`响应式流，使用`scan`操作符处理消息变化
3. 实现了`updateMessage`方法用于支持消息更新
4. 添加了`clear`方法用于清除会话历史
5. 为消息自动添加ID，确保可追踪性
6. 保持了原有的容量管理功能

与简单的数组操作相比，这种基于事件的实现提供了更强大的功能：

1. 允许组件订阅消息变化并实时响应
2. 支持更新已发送的消息(如工具调用结果)
3. 保持代码可维护性，每个操作都通过明确的方法进行
4. 利用RxJS的强大流处理能力

## 7. 实施计划

由于模块尚未正式发布，我们可以直接实施所有接口变更:

1. 添加RxJS依赖到项目
2. 将Message和AgentSession接口移至types目录
3. 更新Message接口以支持ID和工具调用
4. 修改Agent接口，支持多会话管理
5. 创建LLMRequest接口，增强LLM请求灵活性
6. 更新LLMClient接口，使用LLMRequest作为参数
7. 实现基于ReplaySubject的AgentSession
8. 更新Agent和LLMClient的实现
9. 更新文档和测试用例

所有改动可以一次性完成，不需要保持向后兼容或提供过渡方案。 