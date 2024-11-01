import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Code, Eye, Lightbulb, Search, Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Chat } from '../types';

interface ChatAreaProps {
  currentChat: Chat | null;
  onSendMessage: (message: string) => void;
  createNewChat: (initialMessage?: string) => void;
}

const QuickPrompts = [
  { icon: <Image size={20} />, text: "Create image" },
  { icon: <Code size={20} />, text: "Write code" },
  { icon: <Eye size={20} />, text: "Analyze images" },
  { icon: <Lightbulb size={20} />, text: "Brainstorm" },
];

const MessageActions = () => (
  <div className="flex items-center gap-2 mt-2">
    <button className="p-1 hover:bg-[#2A2A2A] rounded"><Volume2 size={16} /></button>
    <button className="p-1 hover:bg-[#2A2A2A] rounded"><Copy size={16} /></button>
    <button className="p-1 hover:bg-[#2A2A2A] rounded"><ThumbsUp size={16} /></button>
    <button className="p-1 hover:bg-[#2A2A2A] rounded"><ThumbsDown size={16} /></button>
    <button className="p-1 hover:bg-[#2A2A2A] rounded"><RotateCcw size={16} /></button>
  </div>
);

const ChatArea: React.FC<ChatAreaProps> = ({
  currentChat,
  onSendMessage,
  createNewChat
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-400 mb-8">
        How can I help you today?
      </h1>
      <div className="w-full max-w-2xl">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className="w-full p-4 pl-12 pr-12 bg-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QuickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt.text)}
              className="flex items-center gap-2 p-4 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition-colors"
            >
              {prompt.icon}
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen pt-16">
      <div className="flex-1 overflow-y-auto px-4 lg:px-8">
        {currentChat?.messages.length ? (
          <div className="max-w-3xl mx-auto">
            {currentChat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`py-6 ${
                  msg.role === 'assistant' ? 'bg-[#2A2A2A]' : ''
                }`}
              >
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#3A3A3A] flex items-center justify-center">
                    {msg.role === 'user' ? 'U' : 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="prose prose-invert">{msg.content}</div>
                    <MessageActions />
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {currentChat?.messages.length > 0 && (
        <div className="border-t border-[#2A2A2A] p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message ChatGPT..."
                className="w-full p-4 pr-12 bg-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#3A3A3A] rounded-lg"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatArea;