import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false, className = '' }) => {
  const [message, setMessage] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const updateWordCount = (text: string) => {
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
    return count;
  };

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
    
    const count = updateWordCount(messageText);
    if (count > 100) {
      alert('Please keep your message under 100 words for better responses.');
      return;
    }
    
    onSendMessage(messageText);
    setMessage('');
    setWordCount(0);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} /> */}
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          updateWordCount(e.target.value);
        }}
        placeholder="Message ChitsGPT..."
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full p-4 pl-12 pr-24 bg-[#12141c] placeholder-gray-700 rounded-full border border-[#302c59] focus:outline-none focus:ring-0 focus:ring-[#302c59] focus:border-transparent text-md"
      />
      {message.trim() && (
        <span className={`absolute right-24 top-1/2 -translate-y-1/2 text-xs ${wordCount > 100 ? 'text-red-400' : 'text-gray-400'}`}>
          {wordCount}/100 words
        </span>
      )}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !message.trim() || wordCount > 100}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#302c59] hover:bg-[#403869] text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
      >
        Send
        <Send size={16} />
      </button>
    </div>
  );
};

export default ChatInput;
