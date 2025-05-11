import { ReplaySubject } from 'rxjs';
import { map, scan } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import type { AgentSession } from '../../types/AgentSession';
import type { Message } from '../../types/Message';

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
      } else if (action.type === 'update' && action.messageId && action.updater) {
        // 更新消息
        const index = result.findIndex(m => m.id === action.messageId);

        if (index >= 0) {
          result[index] = action.updater(result[index]);
        }
      } else if (action.type === 'clear') {
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
