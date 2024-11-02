// src/App.tsx

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Chat, Message, MessageRole } from './types';
import ProfileModal from './components/ProfileModal';
import { chatStorage } from './lib/chatStorage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved chats on initial render
  useEffect(() => {
    const savedChats = chatStorage.getChats();
    if (savedChats.length > 0) {
      setChats(savedChats);
      setCurrentChat(savedChats[0]); // Set most recent chat as current
    }
  }, []);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now(),
      title: initialMessage || 'New Chat',
      messages: []
    };
    
    setChats(prevChats => {
      const updatedChats = [newChat, ...prevChats];
      chatStorage.saveChat(newChat);
      return updatedChats;
    });
    setCurrentChat(newChat);

    if (initialMessage) {
      handleSendMessage(initialMessage, newChat);
    }
  };

  const handleSendMessage = async (message: string, chatToUse?: Chat) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const activeChat = chatToUse || currentChat || {
        id: Date.now(),
        title: message,
        messages: [],
      };

      const userMessage: Message = {
        content: message,
        role: 'user' as MessageRole,
        timestamp: new Date().toISOString()
      };

      const updatedChat: Chat = {
        ...activeChat,
        title: activeChat.messages.length === 0 ? message : activeChat.title,
        messages: [...(activeChat.messages || []), userMessage]
      };

      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === updatedChat.id);
        if (chatExists) {
          const filteredChats = prevChats.filter(c => c.id !== updatedChat.id);
          const newChats = [updatedChat, ...filteredChats];
          chatStorage.saveChat(updatedChat);
          return newChats;
        } else {
          const newChats = [updatedChat, ...prevChats];
          chatStorage.saveChat(updatedChat);
          return newChats;
        }
      });
      setCurrentChat(updatedChat);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const assistantMessage: Message = {
        content: message, // Echo for demo
        role: 'assistant' as MessageRole,
        timestamp: new Date().toISOString()
      };

      const finalChat: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage]
      };

      setChats(prevChats => {
        const filteredChats = prevChats.filter(c => c.id !== finalChat.id);
        const newChats = [finalChat, ...filteredChats];
        chatStorage.saveChat(finalChat);
        return newChats;
      });
      setCurrentChat(finalChat);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = (chatId: number) => {
    chatStorage.deleteChat(chatId);
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChat(remainingChats[0] || null);
    }
  };

  return (
    <div className="h-screen flex bg-[#1E1E1E] text-gray-100 relative">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-64 z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          onNewChat={() => createNewChat()}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      <div className="flex-1 pl-0">
        <div className="relative h-full">
          <div className="absolute top-4 right-4 z-40">
            <ProfileDropdown />
          </div>
          <ChatArea
            currentChat={currentChat}
            onSendMessage={handleSendMessage}
            createNewChat={createNewChat}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;