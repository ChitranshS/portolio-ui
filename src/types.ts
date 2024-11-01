export type MessageRole = 'user' | 'assistant';

export interface Message {
  content: string;
  role: MessageRole;
  timestamp: string;
}

export interface Chat {
  id: number;
  title: string;
  messages: Message[];
}