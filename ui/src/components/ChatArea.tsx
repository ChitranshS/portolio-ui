import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image, 
  Code, 
  Eye, 
  Lightbulb, 
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat } from '../types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  currentChat: Chat | null;
  onSendMessage: (message: string) => void;
  createNewChat: (initialMessage?: string) => void;
  isLoading?: boolean;
}
interface ExpandedMessages {
  [key: number]: boolean;
}
const MESSAGE_THRESHOLD = 300;
const QuickPrompts = [
  { 
    icon: <Image size={20} />, 
    text: "Work Experience", 
    description: "Professional background and roles" 
  },
  { 
    icon: <Code size={20} />, 
    text: "Skills & Expertise", 
    description: "Technical and soft skills" 
  },
  { 
    icon: <Eye size={20} />, 
    text: "Technical Projects", 
    description: "View my coding projects and implementations" 
  },
  { 
    icon: <Lightbulb size={20} />, 
    text: "GitHub Portfolio", 
    description: "Browse my code repositories" 
  },
  { 
    icon: <Lightbulb size={20} />, 
    text: "Education", 
    description: "Academic background and skills" 
  },
];

const ChatMessage: React.FC<{ 
  msg: any; 
  index: number;
  expanded: boolean;
  onToggle: () => void;
}> = ({ msg, index, expanded, onToggle }) => {
  const content = msg.content || '';
  const isLongMessage = content.length > MESSAGE_THRESHOLD;
  const displayContent = expanded ? content : content.slice(0, MESSAGE_THRESHOLD);

  return (
    <div className={cn(
      "p-6 rounded-lg group",
      msg.role === 'assistant' && "bg-[#2A2A2A]"
    )}>
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          msg.role === 'assistant' ? "bg-blue-500 text-white" : "bg-[#3A3A3A] text-white"
        )}>
          {msg.role === 'user' ? 'H' : 'A'}  {/* Changed to H for Human */}
        </div>
        <div className="flex-1">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
            {(msg as StreamMessage).isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
            )}
          </div>
          {isLongMessage && (
            <button
              onClick={onToggle}
              className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-gray-300"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show More
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
const ChatArea: React.FC<ChatAreaProps> = ({
  currentChat,
  onSendMessage,
  createNewChat,
  isLoading = false
}) => {
  const [message, setMessage] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<ExpandedMessages>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const messageText = message.trim();
    if (!messageText || isLoading) return;
    
    setMessage('');
    
    try {
      if (!currentChat) {
        createNewChat(messageText);
      } else {
        onSendMessage(messageText);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e as any);
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    try {
      if (!currentChat) {
        createNewChat(promptText);
      } else {
        onSendMessage(promptText);
      }
    } catch (error) {
      console.error('Error in handleQuickPrompt:', error);
    }
  };

  const Logo = () => (
    <div className="mb-4 flex flex-col items-center">
      <Avatar className="w-16 h-16 mb-4 flex items-center justify-center">
        <AvatarImage src="/logo.jpg" className="w-full h-full animate-rotate" />
        <AvatarFallback>CG</AvatarFallback>
      </Avatar>
      <span className="text-3xl font-bold">ChitsGPT</span>
    </div>
  );

  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <Logo />
      <h1 className="text-2xl font-semibold text-gray-300 mb-2">
        How can I help you today?
      </h1>
      <h3 className="text-md text-gray-500 mb-8">
        Ask me anything about <span className="font-semibold text-gray-400">Chitransh's </span> professional background and projects
      </h3>
      <div className="w-full max-w-2xl">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message ChitsGPT..."
            className="w-full p-4 pl-12 pr-12 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-md"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QuickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt.text)}
              className="flex flex-col items-center gap-2 p-4 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition-all border border-[#3A3A3A] group"
            >
              <div className="p-2 rounded-lg bg-[#3A3A3A] group-hover:bg-[#4A4A4A] transition-colors">
                {prompt.icon}
              </div>
              <span className="font-medium text-center">{prompt.text}</span>
              <span className="text-xs text-gray-400 text-center">{prompt.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const toggleMessage = (index: number) => {
    setExpandedMessages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="flex flex-col h-screen pt-16 pl-64 mr-64 bg-[#1E1E1E] animate-fade-in animation-delay-500">
      <ScrollArea className="flex-1 px-4 lg:px-8 [&_.scrollbar-thumb]:bg-transparent [&_.scrollbar-track]:bg-transparent">
        {currentChat?.messages?.length ? (
          <div className="mx-auto">
            {currentChat?.messages?.map((msg, idx) => (
              <ChatMessage
                key={idx}
                msg={msg}
                index={idx}
                expanded={!!expandedMessages[idx]}
                onToggle={() => toggleMessage(idx)}
              />
            ))}
            {isLoading && (
              <div className="py-6">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="h-5 w-5 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyState />
        )}
      </ScrollArea>

      {currentChat?.messages?.length > 0 && (
        <div className="border-t border-[#2A2A2A] p-4 bg-[#1E1E1E]">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message ChitsGPT..."
                className="w-full p-4 pr-12 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#3A3A3A] rounded-lg disabled:opacity-50"
                disabled={!message.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatArea;