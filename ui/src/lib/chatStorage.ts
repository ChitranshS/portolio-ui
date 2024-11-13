// src/lib/chatStorage.ts
import { v4 as uuidv4 } from 'uuid';
import { Chat, Message, MessageRole } from '../types';

class ChatStorageService {
  private readonly STORAGE_KEY = 'chat_history';
  private readonly MAX_CHATS = 50;

  getChats(): Chat[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      const chats = JSON.parse(stored);
      
      // Ensure all chats have threadId (migration)
      const migratedChats = chats.map((chat: Chat) => {
        if (!chat.threadId) {
          return { ...chat, threadId: uuidv4() };
        }
        return chat;
      });

      // If migration occurred, save the migrated chats
      if (JSON.stringify(chats) !== JSON.stringify(migratedChats)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(migratedChats));
      }

      // Sort by id (timestamp) in descending order
      return migratedChats.sort((a: Chat, b: Chat) => b.id - a.id);
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      return [];
    }
  }

  saveChat(chat: Chat): void {
    try {
      const chats = this.getChats();
      
      // Ensure chat has a threadId
      const chatToSave = chat.threadId ? chat : { ...chat, threadId: uuidv4() };
      
      const existingChatIndex = chats.findIndex(c => c.id === chatToSave.id);
      if (existingChatIndex !== -1) {
        // Remove existing chat
        chats.splice(existingChatIndex, 1);
      }

      // Add chat to the beginning of the array
      chats.unshift(chatToSave);

      // Maintain max chats limit
      if (chats.length > this.MAX_CHATS) {
        chats.pop(); // Remove oldest chat
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }

  getChatByThreadId(threadId: string): Chat | null {
    try {
      const chats = this.getChats();
      return chats.find(chat => chat.threadId === threadId) || null;
    } catch (error) {
      console.error('Error retrieving chat by threadId:', error);
      return null;
    }
  }

  deleteChat(chatId: number): void {
    try {
      const chats = this.getChats();
      const filteredChats = chats.filter(chat => chat.id !== chatId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredChats));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }

  clearAllChats(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }
}

export const chatStorage = new ChatStorageService();