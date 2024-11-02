import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Chat, Message, MessageRole } from './types';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now(),
      title: initialMessage || 'New Chat',
      messages: []
    };
    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChat(newChat);
  };

  const handleSendMessage = (message: string) => {
    if (!currentChat) {
      createNewChat();
      return;
    }

    const newUserMessage: Message = {
      content: message,
      role: 'user' as MessageRole,
      timestamp: new Date().toISOString()
    };

    const updatedChat: Chat = {
      ...currentChat,
      title: currentChat.messages.length === 0 ? message : currentChat.title,
      messages: [...currentChat.messages, newUserMessage]
    };

    setChats(prevChats => 
      prevChats.map(chat =>
        chat.id === currentChat.id ? updatedChat : chat
      )
    );
    setCurrentChat(updatedChat);

    // Immediate response
    setTimeout(() => {
      const newAssistantMessage: Message = {
        content: message, // Echo back the same message for demo
        role: 'assistant' as MessageRole,
        timestamp: new Date().toISOString()
      };

      const aiResponse: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, newAssistantMessage]
      };

      setChats(prevChats => 
        prevChats.map(chat =>
          chat.id === currentChat.id ? aiResponse : chat
        )
      );
      setCurrentChat(aiResponse);
    }, 100);
  };

  return (
    <div className="h-screen flex bg-[#1E1E1E] text-gray-100 relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          onNewChat={() => {
            setCurrentChat(null);
            createNewChat();
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-0">
        <div className="relative h-full">
          <div className="absolute top-4 right-4 z-40">
            <ProfileDropdown />
          </div>
          <ChatArea
            currentChat={currentChat}
            onSendMessage={handleSendMessage}
            createNewChat={createNewChat}
          />
        </div>
      </div>
    </div>
  );
}

export default App;