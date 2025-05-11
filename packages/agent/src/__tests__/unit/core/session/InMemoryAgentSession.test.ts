/**
 * InMemoryAgentSession 单元测试
 */
import { describe, test, expect, vi } from 'vitest';

import { InMemoryAgentSession } from '../../../../core/session/InMemoryAgentSession';
import type { Message } from '../../../../types/Message';

// 模拟uuid
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid')
}));

describe('UT-Session', () => {
  test('UT-Session-01: addMessage应将消息添加到历史', () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    };

    // 执行
    session.addMessage(message);

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(1);
    expect(messages[0]).toEqual(message);
  });

  test('UT-Session-02: getMessages应返回历史消息副本', () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    };

    session.addMessage(message);

    // 获取消息并尝试修改
    const messages = session.getMessages() as Message[];
    const newMessage: Message = {
      id: 'msg-2',
      role: 'assistant',
      content: { type: 'text', value: '新消息' },
      timestamp: Date.now()
    };

    messages.push(newMessage);

    // 验证原始消息未被修改
    const originalMessages = session.getMessages();

    expect(originalMessages.length).toBe(1);
  });

  test('UT-Session-03: addMessage当超出容量应移除最早消息', () => {
    // 准备
    const capacity = 3;
    const session = new InMemoryAgentSession(undefined, capacity);

    // 添加超出容量的消息
    const message1: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '消息1' },
      timestamp: Date.now()
    };
    const message2: Message = {
      id: 'msg-2',
      role: 'assistant',
      content: { type: 'text', value: '回复1' },
      timestamp: Date.now()
    };
    const message3: Message = {
      id: 'msg-3',
      role: 'user',
      content: { type: 'text', value: '消息2' },
      timestamp: Date.now()
    };
    const message4: Message = {
      id: 'msg-4',
      role: 'assistant',
      content: { type: 'text', value: '回复2' },
      timestamp: Date.now()
    };

    session.addMessage(message1);
    session.addMessage(message2);
    session.addMessage(message3);
    session.addMessage(message4);

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(capacity);
    expect(messages[0]).toEqual(message2); // 最早的消息被移除
    expect(messages[1]).toEqual(message3);
    expect(messages[2]).toEqual(message4);
  });

  test('UT-Session-04: 构造函数应使用默认容量', () => {
    // 准备
    const session = new InMemoryAgentSession();

    // 添加消息
    for (let i = 0; i < 101; i++) {
      session.addMessage({
        id: `msg-${i}`,
        role: 'user',
        content: { type: 'text', value: `消息${i}` },
        timestamp: Date.now()
      });
    }

    // 验证默认容量为100
    const messages = session.getMessages();

    expect(messages.length).toBe(100);

    // 检查第一条消息的内容（应该是消息1，因为消息0已被移除）
    const firstMessage = messages[0];
    const content = firstMessage.content;

    // 处理content可能是数组的情况
    if (Array.isArray(content)) {
      expect(content[0].value).toBe('消息1');
    } else {
      expect(content.value).toBe('消息1');
    }
  });

  test('UT-Session-05: 构造函数应接受自定义容量', () => {
    // 准备
    const customCapacity = 5;
    const session = new InMemoryAgentSession(undefined, customCapacity);

    // 添加超出自定义容量的消息
    for (let i = 0; i < 7; i++) {
      session.addMessage({
        id: `msg-${i}`,
        role: 'user',
        content: { type: 'text', value: `消息${i}` },
        timestamp: Date.now()
      });
    }

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(customCapacity);

    // 检查第一条消息的内容（应该是消息2，因为消息0和消息1已被移除）
    const firstMessage = messages[0];
    const content = firstMessage.content;

    // 处理content可能是数组的情况
    if (Array.isArray(content)) {
      expect(content[0].value).toBe('消息2');
    } else {
      expect(content.value).toBe('消息2');
    }
  });

  test('UT-Session-06: 应支持多种类型的消息内容', () => {
    // 准备
    const session = new InMemoryAgentSession();

    // 文本消息
    const textMessage: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '文本消息' },
      timestamp: Date.now()
    };

    // 图像消息
    const imageMessage: Message = {
      id: 'msg-2',
      role: 'user',
      content: {
        type: 'image',
        value: new Uint8Array([1, 2, 3]),
        mimeType: 'image/jpeg'
      },
      timestamp: Date.now()
    };

    // 多模态消息
    const multimodalMessage: Message = {
      id: 'msg-3',
      role: 'assistant',
      content: [
        { type: 'text', value: '带图片的回复:' },
        {
          type: 'image',
          value: new Uint8Array([4, 5, 6]),
          mimeType: 'image/png'
        }
      ],
      timestamp: Date.now()
    };

    // 执行
    session.addMessage(textMessage);
    session.addMessage(imageMessage);
    session.addMessage(multimodalMessage);

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(3);
    expect(messages[0]).toEqual(textMessage);
    expect(messages[1]).toEqual(imageMessage);
    expect(messages[2]).toEqual(multimodalMessage);
  });

  test('UT-Session-07: 连续调用getMessages应返回相同的内容', () => {
    // 准备
    const session = new InMemoryAgentSession();

    session.addMessage({
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    });

    // 多次获取消息
    const firstCall = session.getMessages();
    const secondCall = session.getMessages();

    // 验证内容相同但是是不同的数组实例
    expect(firstCall).toEqual(secondCall);
    expect(firstCall).not.toBe(secondCall); // 不是同一个数组实例
  });

  test('UT-Session-08: 容量为0时应不存储任何消息', () => {
    // 准备
    const session = new InMemoryAgentSession(undefined, 0);

    // 添加消息
    session.addMessage({
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    });

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(0);
  });

  test('UT-Session-09: 容量为负数时应视为0', () => {
    // 准备
    const session = new InMemoryAgentSession(undefined, -5);

    // 添加消息
    session.addMessage({
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    });

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(0);
  });

  test('UT-Session-10: addMessage应为没有ID的消息生成ID', () => {
    // 准备
    const session = new InMemoryAgentSession();
    const messageWithoutId: Omit<Message, 'id'> = {
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    };

    // 执行
    session.addMessage(messageWithoutId as Message);

    // 验证
    const messages = session.getMessages();

    expect(messages[0].id).toBe('test-uuid');
  });

  test('UT-Session-11: updateMessage应更新消息内容', () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '原始消息' },
      timestamp: Date.now()
    };

    session.addMessage(message);

    // 执行
    session.updateMessage('msg-1', msg => ({
      ...msg,
      content: { type: 'text', value: '更新后的消息' }
    }));

    // 验证
    const messages = session.getMessages();

    expect(messages[0].content).toEqual({
      type: 'text',
      value: '更新后的消息'
    });
  });

  test('UT-Session-12: updateMessage对不存在的消息ID无操作', () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '原始消息' },
      timestamp: Date.now()
    };

    session.addMessage(message);

    // 执行
    session.updateMessage('不存在的ID', msg => ({
      ...msg,
      content: { type: 'text', value: '更新后的消息' }
    }));

    // 验证 - 原消息保持不变
    const messages = session.getMessages();

    expect(messages[0].content).toEqual({
      type: 'text',
      value: '原始消息'
    });
  });

  test('UT-Session-13: clear应清除所有消息', () => {
    // 准备
    const session = new InMemoryAgentSession();

    session.addMessage({
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '消息1' },
      timestamp: Date.now()
    });
    session.addMessage({
      id: 'msg-2',
      role: 'assistant',
      content: { type: 'text', value: '消息2' },
      timestamp: Date.now()
    });

    // 验证初始状态
    expect(session.getMessages().length).toBe(2);

    // 执行
    session.clear();

    // 验证
    expect(session.getMessages().length).toBe(0);
  });

  test('UT-Session-14: messages$应发出消息数组的更新', async () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    };

    // 创建Promise以存储结果
    let receivedMessages: ReadonlyArray<Message> | undefined;

    // 先订阅messages$
    const subscription = session.messages$.subscribe(messages => {
      receivedMessages = messages;
    });

    // 执行
    session.addMessage(message);

    // 给ReplaySubject时间发射
    await new Promise(resolve => setTimeout(resolve, 10));

    // 取消订阅
    subscription.unsubscribe();

    // 验证
    expect(receivedMessages).toBeDefined();
    expect(receivedMessages!.length).toBe(1);
    expect(receivedMessages![0]).toEqual(message);
  });

  test('UT-Session-15: messages$应发出消息更新', async () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '原始消息' },
      timestamp: Date.now()
    };

    session.addMessage(message);

    // 创建Promise以存储结果
    let receivedMessages: ReadonlyArray<Message> | undefined;

    // 订阅消息更新
    const subscription = session.messages$.subscribe(messages => {
      receivedMessages = messages;
    });

    // 执行更新
    session.updateMessage('msg-1', msg => ({
      ...msg,
      content: { type: 'text', value: '更新后的消息' }
    }));

    // 给ReplaySubject时间发射
    await new Promise(resolve => setTimeout(resolve, 10));

    // 取消订阅
    subscription.unsubscribe();

    // 验证
    expect(receivedMessages).toBeDefined();
    expect(receivedMessages![0].content).toEqual({
      type: 'text',
      value: '更新后的消息'
    });
  });

  test('UT-Session-16: messages$应发出clear事件', async () => {
    // 准备
    const session = new InMemoryAgentSession();

    session.addMessage({
      id: 'msg-1',
      role: 'user',
      content: { type: 'text', value: '测试消息' },
      timestamp: Date.now()
    });

    // 验证初始状态
    expect(session.getMessages().length).toBe(1);

    // 创建Promise以存储结果
    let receivedMessages: ReadonlyArray<Message> | undefined;

    // 订阅消息更新
    const subscription = session.messages$.subscribe(messages => {
      receivedMessages = messages;
    });

    // 执行
    session.clear();

    // 给ReplaySubject时间发射
    await new Promise(resolve => setTimeout(resolve, 10));

    // 取消订阅
    subscription.unsubscribe();

    // 验证
    expect(receivedMessages).toBeDefined();
    expect(receivedMessages!.length).toBe(0);
  });

  test('UT-Session-17: 会话ID应在构造时可指定', () => {
    // 准备
    const customId = 'custom-session-id';

    // 执行
    const session = new InMemoryAgentSession(customId);

    // 验证
    expect(session.id).toBe(customId);
  });

  test('UT-Session-18: 不指定ID时应自动生成ID', () => {
    // 执行
    const session = new InMemoryAgentSession();

    // 验证
    expect(session.id).toBe('test-uuid');
  });
});
