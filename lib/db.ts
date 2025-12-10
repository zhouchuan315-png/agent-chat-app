import Dexie, { Table } from 'dexie';
import { ChatSession, Message } from '@/types/chat';

class ChatDatabase extends Dexie {
  chatSessions!: Table<ChatSession>;
  messages!: Table<Message>;

  constructor() {
    super('ChatDatabase');
    this.version(1).stores({
      chatSessions: 'id, title, createdAt, updatedAt',
      messages: 'id, sessionId, content, isUser, timestamp, loading',
    });
  }
}

export const db = new ChatDatabase();
