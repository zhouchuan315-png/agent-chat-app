export type Message = {
  id: string;
  sessionId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  loading?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};
