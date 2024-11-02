import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Chat, Message, MessageRole } from './types';
import ProfileModal from './components/ProfileModal';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now(),
      title: initialMessage || 'New Chat',
      messages: []
    };
    
    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChat(newChat);

    if (initialMessage) {
      handleSendMessage(initialMessage, newChat);
    }
  };

  const handleSendMessage = async (message: string, chatToUse?: Chat) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Use provided chat or current chat or create new one
      const activeChat = chatToUse || currentChat || {
        id: Date.now(),
        title: message,
        messages: [],
      };

      // Create user message
      const userMessage: Message = {
        content: message,
        role: 'user' as MessageRole,
        timestamp: new Date().toISOString()
      };

      // Create updated chat with user message
      const updatedChat: Chat = {
        ...activeChat,
        title: activeChat.messages.length === 0 ? message : activeChat.title,
        messages: [...(activeChat.messages || []), userMessage]
      };

      // Update state immediately with user message
      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === updatedChat.id);
        if (chatExists) {
          return prevChats.map(c => c.id === updatedChat.id ? updatedChat : c);
        } else {
          return [updatedChat, ...prevChats];
        }
      });
      setCurrentChat(updatedChat);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create assistant message
      const assistantMessage: Message = {
        content: message, // Echo for demo
        role: 'assistant' as MessageRole,
        timestamp: new Date().toISOString()
      };

      // Create final chat with both messages
      const finalChat: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage]
      };

      // Update state with assistant response
      setChats(prevChats =>
        prevChats.map(c => c.id === finalChat.id ? finalChat : c)
      );
      setCurrentChat(finalChat);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
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