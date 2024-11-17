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
  isLoading?: boolean; // Add this prop
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChat,
  setCurrentChat,
  onNewChat,
  onDeleteChat,
  isLoading = false  // Destructure and provide default value
}) => {
  return (
    <div className="flex flex-col h-full bg-[#12141c] border-r-2 border-[#12141c]">
      <div className="p-4 border-b-2 border-[#12141c]">
        <Button
          variant="ghost"
          className="w-full gap-2 bg-[#12141c] hover:bg-[#282c3a] text-gray-300 hover:text-white transition-colors"
          onClick={onNewChat}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
          
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="flex items-center justify-center h-full z-0 absolute inset-0 bg-[#12141c] opacity-30">
          <div className='text-gray-300 text-xs '><strong>Global Chat History</strong></div>
        </div>
        <div className="space-y-1 bg-[#12141c] rounded-lg opacity-90">
          {chats.map((chat) => (
            <div
              key={`chat-${chat.id}`}
              className={cn(
                "group flex items-center px-3 py-2 text-sm transition-colors",
                "text-gray-400 hover:text-gray-200",
                "hover:bg-[#282c3a]",
                "relative",
                currentChat?.id === chat.id && "bg-[#282c3a] text-white"
              )}
            >
              <div 
                className="flex-1 min-w-0 flex items-center gap-2" 
                onClick={() => setCurrentChat(chat)}
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[#6c5dd3]" />
                <span className="truncate pr-6 text-gray-300">{chat.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this chat?')) {
                    onDeleteChat(chat.id);
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity",
                  isLoading && "cursor-not-allowed opacity-50"
                )}
                aria-label="Delete chat"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;