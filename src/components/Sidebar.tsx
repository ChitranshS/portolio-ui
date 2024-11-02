// src/components/Sidebar.tsx

import React from 'react';
import { Chat } from '../types';
import { PlusCircle, MessageCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChat,
  setCurrentChat,
  onNewChat,
  onDeleteChat
}) => {
  return (
    <div className="flex flex-col h-full bg-[#2A2A2A] border-r-2 border-[#2A2A2A]">
      <div className="p-4 border-b-2 border-[#2A2A2A]">
        <Button
          variant="ghost"
          className="w-full gap-2 bg-[#1e1e1e] hover:bg-[#1e1e1e] text-gray-300 hover:text-white transition-colors"
          onClick={onNewChat}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 bg-[#1e1e1e] rounded-lg">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                "text-gray-400 hover:text-gray-200",
                "hover:bg-[#1e1e1e]",
                currentChat?.id === chat.id && "bg-[#1d2021] text-white"
              )}
            >
              <button
                onClick={() => setCurrentChat(chat)}
                className="flex-1 flex items-center gap-2 text-left"
              >
                <MessageCircle className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{chat.title}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;