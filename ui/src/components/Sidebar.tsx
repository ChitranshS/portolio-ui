import React, { useState } from 'react';
import { Chat } from '../types';
import { PlusCircle, MessageCircle, Trash2, AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: number) => void;
  isLoading?: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChat,
  setCurrentChat,
  onNewChat,
  onDeleteChat,
  isLoading = false,
  setIsSidebarOpen
}) => {
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#12141c] border-r-2 border-[#12141c]">
      <div className="p-4 border-b-2 border-[#12141c]">
        <Button
          variant="ghost"
          className="w-full gap-2 bg-[#12141c] hover:bg-[#282c3a] text-gray-300 hover:text-white transition-colors"
          onClick={() => {
            onNewChat();
            setIsSidebarOpen(false);
          }}
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
                onClick={() => {
                  setCurrentChat(chat);
                  setIsSidebarOpen(false);
                }}
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[#6c5dd3]" />
                <span className="truncate pr-6 text-gray-300">{chat.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChatToDelete(chat);
                }}
                disabled={isLoading}
                className={cn(
                  "absolute right-2 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 transition-opacity",
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

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1b23] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h2 className="text-xl font-semibold">Delete Chat</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setChatToDelete(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteChat(chatToDelete.id);
                  setChatToDelete(null);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;