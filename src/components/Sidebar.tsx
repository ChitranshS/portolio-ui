import React from 'react';
import { Chat } from '../types';
import { PlusCircle, MessageCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChat,
  setCurrentChat,
  onNewChat
}) => {
  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] border-r border-[#2A2A2A]">
      <div className="p-4 border-b border-[#2A2A2A]">
        <Button
          variant="ghost"
          className="w-full gap-2 hover:bg-[#2A2A2A] text-gray-300 hover:text-white transition-colors"
          onClick={onNewChat}  
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                "text-gray-400 hover:text-gray-200",
                "hover:bg-[#2A2A2A]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4A4A4A]",
                currentChat?.id === chat.id && "bg-[#2A2A2A] text-white"
              )}
            >
              <MessageCircle className="h-4 w-4 shrink-0 opacity-70" />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;