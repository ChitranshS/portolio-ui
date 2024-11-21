// types.ts

// Existing types
export type MessageRole = 'user' | 'assistant';

export interface Message {
  content: string;
  role: MessageRole;
  timestamp: string;
}

export interface Chat {
  id: number;
  threadId: string;
  title: string;
  messages: Message[];
}

export interface StreamMessage extends Message {
  isStreaming?: boolean;
  fullContent?: string;
}

// New types for database messages
export interface DBMessageKwargs {
  type: 'human' | 'ai';
  content: string;
}

export interface DBMessage {
  kwargs: DBMessageKwargs;
}

export interface DBModelData {
  messages: DBMessage[];
}

export interface DBQuery {
  model: DBModelData;
}

export interface DBQueryResult {
  query: DBQuery;
}

// Helper function to convert DB message to app Message
export const convertDBMessageToMessage = (dbMessage: DBMessage): Message => ({
  content: dbMessage.kwargs.content,
  role: dbMessage.kwargs.type === 'human' ? 'user' : 'assistant',
  timestamp: new Date().toISOString()
});

// Helper function to convert DB messages to Chat
export const convertDBMessagesToChat = (
  dbMessages: DBMessage[], 
  index: number,
  threadId: string
): Chat => {
  return {
    id: Date.now() - (index * 1000), // Add more time difference between IDs
    threadId: threadId,
    title: dbMessages[0]?.kwargs?.content || 'Chat',
    messages: dbMessages.map(msg => ({
      content: msg.kwargs.content,
      role: msg.kwargs.type === 'human' ? 'user' : 'assistant',
      timestamp: new Date().toISOString()
    }))
  };
};