import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ChatModeToggle = () => {
  const [isChatMode, setIsChatMode] = useState(false);
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-start justify-center">
      <div className="w-full transition-all duration-300 ease-in-out">
        <div className="w-full max-w-sm relative mb-5 mx-auto block">
          <button
            onClick={() => setIsChatMode(!isChatMode)}
            className={`w-full bg-gray-900 p-4 rounded-full text-sm flex items-center justify-between transition-all duration-300 
              ${isChatMode 
                ? 'text-gray-300 scale-90 bg-gradient-to-r from-purple-600 to-purple-800' 
                : 'text-gray-400'}`}
          >
            <span className={`transition-transform duration-300 
              ${isChatMode ? 'scale-110 font-semibold' : ''}`}>
              Chat Mode
            </span>
            
            {/* Toggle Switch */}
            <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 
              ${isChatMode ? 'bg-white bg-opacity-10 scale-110' : 'bg-gray-600 bg-opacity-30'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 sm:w-4 h-3 sm:h-4 rounded-full transition-all duration-300 shadow-md ${isChatMode
                    ? 'translate-x-4 sm:translate-x-5 bg-white'
                    : 'translate-x-0 bg-gray-400'
                  }`} />
            </div>
          </button>
        </div>

        {/* Content Section */}
        <div className={`w-full transition-all duration-500 ease-out 
          ${isChatMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative mb-16 max-w-2xl mx-auto">
            <div className="rounded-full w-full bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModeToggle;