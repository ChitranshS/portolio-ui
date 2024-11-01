import React from 'react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, currentChat, setCurrentChat, onNewChat }) => {
  return (
    <div className="h-full bg-[#2A2A2A] p-4">
      <button
        onClick={onNewChat}
        className="w-full bg-[#3A3A3A] text-white p-2 rounded-lg mb-4 hover:bg-[#4A4A4A] transition-colors"
      >
        New Chat
      </button>
      <div className="space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setCurrentChat(chat)}
            className={`w-full text-left p-2 rounded-lg ${
              currentChat?.id === chat.id
                ? 'bg-[#4A4A4A]'
                : 'hover:bg-[#3A3A3A]'
            } transition-colors`}
          >
            {chat.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
