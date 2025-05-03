/**
 * InMemoryAgentSession 单元测试
 */
import { describe, test, expect } from 'vitest';

import { InMemoryAgentSession } from '../../../../core/session/InMemoryAgentSession';
import type { Message } from '../../../../core/types';

describe('UT-Session', () => {
  test('UT-Session-01: addMessage应将消息添加到历史', () => {
    // 准备
    const session = new InMemoryAgentSession();
    const message: Message = {
      role: 'user',
      content: { type: 'text', value: '测试消息' }
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
      role: 'user',
      content: { type: 'text', value: '测试消息' }
    };

    session.addMessage(message);

    // 获取消息并尝试修改
    const messages = session.getMessages() as Message[];

    messages.push({
      role: 'assistant',
      content: { type: 'text', value: '新消息' }
    });

    // 验证原始消息未被修改
    const originalMessages = session.getMessages();

    expect(originalMessages.length).toBe(1);
  });

  test('UT-Session-03: addMessage当超出容量应移除最早消息', () => {
    // 准备
    const capacity = 3;
    const session = new InMemoryAgentSession(capacity);

    // 添加超出容量的消息
    const message1: Message = {
      role: 'user',
      content: { type: 'text', value: '消息1' }
    };
    const message2: Message = {
      role: 'assistant',
      content: { type: 'text', value: '回复1' }
    };
    const message3: Message = {
      role: 'user',
      content: { type: 'text', value: '消息2' }
    };
    const message4: Message = {
      role: 'assistant',
      content: { type: 'text', value: '回复2' }
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
        role: 'user',
        content: { type: 'text', value: `消息${i}` }
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
    const session = new InMemoryAgentSession(customCapacity);

    // 添加超出自定义容量的消息
    for (let i = 0; i < 7; i++) {
      session.addMessage({
        role: 'user',
        content: { type: 'text', value: `消息${i}` }
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
      role: 'user',
      content: { type: 'text', value: '文本消息' }
    };

    // 图像消息
    const imageMessage: Message = {
      role: 'user',
      content: {
        type: 'image',
        value: new Uint8Array([1, 2, 3]),
        mimeType: 'image/jpeg'
      }
    };

    // 多模态消息
    const multimodalMessage: Message = {
      role: 'assistant',
      content: [
        { type: 'text', value: '带图片的回复:' },
        {
          type: 'image',
          value: new Uint8Array([4, 5, 6]),
          mimeType: 'image/png'
        }
      ]
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
      role: 'user',
      content: { type: 'text', value: '测试消息' }
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
    const session = new InMemoryAgentSession(0);

    // 添加消息
    session.addMessage({
      role: 'user',
      content: { type: 'text', value: '测试消息' }
    });

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(0);
  });

  test('UT-Session-09: 容量为负数时应视为0', () => {
    // 准备
    const session = new InMemoryAgentSession(-5);

    // 添加消息
    session.addMessage({
      role: 'user',
      content: { type: 'text', value: '测试消息' }
    });

    // 验证
    const messages = session.getMessages();

    expect(messages.length).toBe(0);
  });
});
