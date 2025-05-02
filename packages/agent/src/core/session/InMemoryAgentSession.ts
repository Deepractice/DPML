import type { Message } from '../types';

import type { AgentSession } from './AgentSession';

/**
 * 内存会话实现
 */
export class InMemoryAgentSession implements AgentSession {
  private messages: Message[] = [];
  private capacity: number;

  constructor(capacity: number = 100) {
    this.capacity = capacity;
  }

  public addMessage(message: Message): void {
    this.messages.push(message);

    // 如果超出容量，删除最早的消息
    if (this.messages.length > this.capacity) {
      this.messages.shift();
    }
  }

  public getMessages(): ReadonlyArray<Message> {
    return [...this.messages];
  }
}
