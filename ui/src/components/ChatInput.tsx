import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false, className = '' }) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const messageText = message.trim();
    if (!messageText || isLoading) return;
    
    onSendMessage(messageText);
    setMessage('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} /> */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message ChitsGPT..."
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full p-4 pl-12 pr-12 bg-[#12141c] placeholder-gray-700 rounded-full border border-[#302c59] focus:outline-none focus:ring-0 focus:ring-[#302c59] focus:border-transparent text-md"
      /> 
    </div>
  );
};

export default ChatInput;
