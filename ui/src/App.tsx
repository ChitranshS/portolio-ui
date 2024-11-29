import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Chat, Message, MessageRole, StreamMessage, DBQueryResult, convertDBMessagesToChat } from './types';
// import ProfileModal from './components/ProfileModal';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv'
// import { BackgroundBeams } from "@/components/ui/background-beams";
import { threadStorage } from './lib/threadStorage';
import GlobalChats from './pages/GlobalChats';
import AnimatedBackground from './components/AnimatedBackground';

function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobalView, setIsGlobalView] = useState(false);

  const fetchMessagesFromDB = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      let requestBody = {};
      const threadId = currentChat?.threadId;
      
      if (threadId) {
        // If we have a current chat, get its messages
        requestBody = {
          thread_ids: [threadId],
          is_global: false
        };
      } else {
        // For global view or when no stored thread IDs
        if (isGlobalView) {
          requestBody = {
            is_global: true
          };
        } else {
          // For personal view with stored thread IDs
          const storedThreadIds = threadStorage.getThreadIds();
          if (storedThreadIds.length === 0) {
            setChats([]);
            setIsLoading(false);
            return;
          }
          requestBody = {
            thread_ids: storedThreadIds,
            is_global: false
          };
        }
      }

      const response = await fetch(`${apiUrl}/get_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const posts = data.messages;
  
      const seenMessages = new Set();
      const uniqueChats: Chat[] = [];
  
      posts.forEach((post: any) => {
        if (post?.query?.model?.messages) {
          const dbMessages = post.query.model.messages;
          const threadId = post.thread_id;

          const chatHash = JSON.stringify(dbMessages.map((msg: any) => ({
            content: msg.kwargs.content.trim(),
            type: msg.kwargs.type
          })));
  
          if (!seenMessages.has(chatHash)) {
            seenMessages.add(chatHash);
            const newChat = convertDBMessagesToChat(dbMessages, uniqueChats.length, threadId);
            uniqueChats.push(newChat);
          }
        }
      });
  
      setChats(uniqueChats);
  
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromDB = async (threadId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thread_id: threadId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from local storage
      threadStorage.removeThreadId(threadId);
      
      // Refresh messages
      await fetchMessagesFromDB();
    } catch (error) {
      console.error('Error deleting from database:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessagesFromDB();
  }, []);

  const handleSendMessage = async (message: string, chatToUse?: Chat) => {
    if (isLoading) return;
    
    try {
      // Update lastMessageTime in localStorage
      localStorage.setItem('lastMessageTime', Date.now().toString());
      
      const activeChat = chatToUse || currentChat || {
        id: Date.now(),
        threadId: uuidv4(),
        title: message,
        messages: [],
      };
      const userMessage: Message = {
        content: message.trim(),
        role: 'user',
        timestamp: new Date().toISOString()
      };
  
      const updatedChat: Chat = {
        ...activeChat,
        title: activeChat.messages.length === 0 ? message : activeChat.title,
        messages: [...(activeChat.messages || []), userMessage]
      };

      // Add initial assistant message right away
      const initialAssistantMessage: StreamMessage = {
        content: "",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      const chatWithAssistant = {
        ...updatedChat,
        messages: [...updatedChat.messages, initialAssistantMessage]
      };

      // Single state update for both chats and currentChat
      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === chatWithAssistant.id);
        const filteredChats = chatExists 
          ? prevChats.filter(c => c.id !== chatWithAssistant.id) 
          : prevChats;
        return [chatWithAssistant, ...filteredChats];
      });
      setCurrentChat(chatWithAssistant);
  
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('TIMEOUT'));
          }, 35000); // 35 seconds timeout
        });
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // Create the fetch promise
        const fetchPromise = fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            query: message.trim(),
            id: activeChat.id,
            threadId: activeChat.threadId
          }),
        });

        // Race between timeout and fetch
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fullResponse = data.response || 'No response from assistant';
  
        let streamedContent = '';
        const words = fullResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          streamedContent += (i === 0 ? '' : ' ') + words[i];
          
          const updatedAssistantMessage: StreamMessage = {
            ...initialAssistantMessage,
            content: streamedContent,
            fullContent: fullResponse,
            isStreaming: i < words.length - 1
          };
  
          const updatedChatWithStream = {
            ...chatWithAssistant,
            messages: [
              ...chatWithAssistant.messages.slice(0, -1),
              updatedAssistantMessage
            ]
          };
  
          setCurrentChat(updatedChatWithStream);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
  
        const finalChat = {
          ...chatWithAssistant,
          messages: [
            ...chatWithAssistant.messages.slice(0, -1),
            {
              content: fullResponse,
              role: 'assistant',
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        setChats(prevChats => {
          const filteredChats = prevChats.filter(c => c.id !== finalChat.id);
          return [finalChat, ...filteredChats];
        });
  
      } catch (error: any) {
        console.error('Error in chat request:', error);
        
        // Handle errors
        const errorResponse: StreamMessage = {
          content: error.message === 'TIMEOUT' 
            ? "I apologize for the delay. I'm taking longer than usual to process your request. Please feel free to try again or rephrase your question."
            : "Sorry, there was an error processing your request. Please try again.",
          role: 'assistant',
          timestamp: new Date().toISOString(),
          isStreaming: false
        };
        
        const chatWithError = {
          ...chatWithAssistant,
          messages: [...chatWithAssistant.messages.slice(0, -1), errorResponse]
        };
        setCurrentChat(chatWithError);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      const chatToDelete = chats.find(chat => chat.id === chatId);
      
      if (chatToDelete?.threadId) {
        // Delete all messages with this thread ID
        await deleteFromDB(chatToDelete.threadId);
        
        // Update local state
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        // If the deleted chat was the current chat, select a new current chat
        if (currentChat?.id === chatId) {
          setCurrentChat(null); // Changed to set null instead of first chat
        }
  
        // Refresh the chat list from database
        // await fetchMessagesFromDB();
      } else {
        console.error('No thread ID found for chat to delete');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (initialMessage?: string) => {
    // Check if there's already an empty chat
    const existingEmptyChat = chats.find(chat => 
      chat.messages.length === 0 && chat.title === 'New Chat'
    );

    if (existingEmptyChat && !initialMessage) {
      // If there's an empty chat and no initial message, just switch to it
      setCurrentChat(existingEmptyChat);
      return;
    }

    const threadId = uuidv4();
    const newChat: Chat = {
      id: Date.now(),
      threadId,
      title: initialMessage || 'New Chat',
      messages: [], // Always start with empty messages
    };

    setCurrentChat(newChat);
    setChats(prevChats => [newChat, ...prevChats]);
    threadStorage.addThreadId(threadId);

    if (initialMessage) {
      await handleSendMessage(initialMessage, newChat);
    }
  };


  return (
    <div className="relative min-h-screen bg-transparent">
      {!currentChat?.messages?.length && <AnimatedBackground />}
      <div className="relative z-10 h-screen flex text-gray-100 overflow-hidden bg-transparent">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 left-4 z-50 p-2 rounded-lg transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'bg-[#0a0b0f] hover:bg-[#3A3A3A]' 
              : 'bg-[#12141c] hover:bg-[#282c3a]'
            }`}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
        </button>

        {isSidebarOpen && (
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-20 
              ${isSidebarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full w-[280px] z-30 transition-all duration-300 ease-in-out transform 
            ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1">
              {isSidebarOpen && (
                <Sidebar
                  chats={chats}
                  currentChat={currentChat}
                  setCurrentChat={setCurrentChat}
                  onNewChat={createNewChat}
                  onDeleteChat={handleDeleteChat}
                  isLoading={isLoading}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative w-full max-w-full">
          <div className="relative h-full">
            <div className="absolute top-4 right-4 z-40">
              <ProfileDropdown />
            </div>
            {isGlobalView && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-[#6c5dd3] rounded-full text-xs text-white opacity-50">
                Global View
              </div>
            )}
            <ChatArea
              currentChat={currentChat}
              onSendMessage={handleSendMessage}
              createNewChat={createNewChat}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/global" element={<GlobalChats />} />
      </Routes>
    </Router>
  );
}

export default App;