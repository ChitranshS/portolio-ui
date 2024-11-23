import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Chat, Message, MessageRole, StreamMessage, DBQueryResult, convertDBMessagesToChat } from './types';
import ProfileModal from './components/ProfileModal';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv'
import { BackgroundBeams } from "@/components/ui/background-beams";
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
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      const threadId = currentChat?.threadId;
      let posts;
  
      if (threadId) {
        // If we have a current chat, get its latest state
        posts = await sql`
          WITH LastSteps AS (
            SELECT 
              metadata->>'thread_id' as thread_id, 
              MAX((metadata->>'step')::integer) as max_step
            FROM checkpoints
            WHERE metadata->>'thread_id' = ${threadId}
            GROUP BY metadata->>'thread_id'
          )
          SELECT 
            metadata -> 'writes' as query,
            metadata->>'thread_id' as thread_id
          FROM checkpoints c
          INNER JOIN LastSteps ls 
            ON c.metadata->>'thread_id' = ls.thread_id 
            AND (c.metadata->>'step')::integer = ls.max_step
        `;
      } else {
        // For global view or when no stored thread IDs
        if (isGlobalView) {
          posts = await sql`
            WITH LastSteps AS (
              SELECT 
                metadata->>'thread_id' as thread_id, 
                MAX((metadata->>'step')::integer) as max_step
              FROM checkpoints
              GROUP BY metadata->>'thread_id'
            )
            SELECT 
              metadata -> 'writes' as query,
              metadata->>'thread_id' as thread_id
            FROM checkpoints c
            INNER JOIN LastSteps ls 
              ON c.metadata->>'thread_id' = ls.thread_id 
              AND (c.metadata->>'step')::integer = ls.max_step
            ORDER BY ls.max_step DESC
            LIMIT 100
          `;
        } else {
          // For personal view with stored thread IDs
          const storedThreadIds = threadStorage.getThreadIds();
          if (storedThreadIds.length === 0) {
            posts = [];
          } else {
            posts = await sql`
              WITH LastSteps AS (
                SELECT 
                  metadata->>'thread_id' as thread_id, 
                  MAX((metadata->>'step')::integer) as max_step
                FROM checkpoints
                WHERE metadata->>'thread_id' = ANY(${storedThreadIds}::text[])
                GROUP BY metadata->>'thread_id'
              )
              SELECT 
                metadata -> 'writes' as query,
                metadata->>'thread_id' as thread_id
              FROM checkpoints c
              INNER JOIN LastSteps ls 
                ON c.metadata->>'thread_id' = ls.thread_id 
                AND (c.metadata->>'step')::integer = ls.max_step
              ORDER BY ls.max_step DESC
            `;
          }
        }
      }
  
      const seenMessages = new Set();
      const uniqueChats: Chat[] = [];
  
      posts.forEach((post, index) => {
        if (post?.query?.model?.messages) {
          const dbMessages = post.query.model.messages;
          const threadId = post.thread_id;

          // Skip messages that are ping requests
          const isPingRequest = dbMessages.some(msg => 
            msg.kwargs.content.trim() === "Respond with OKAY only" || 
            threadId === "pinging_123"
          );
          
          if (!isPingRequest) {
            const chatHash = JSON.stringify(dbMessages.map(msg => ({
              content: msg.kwargs.content.trim(),
              type: msg.kwargs.type
            })));
    
            if (!seenMessages.has(chatHash)) {
              seenMessages.add(chatHash);
              // Pass threadId to the conversion function
              const newChat = convertDBMessagesToChat(dbMessages, index, threadId);
              uniqueChats.push(newChat);
            }
          }
        }
      });
  
      setChats(uniqueChats);
      // if (uniqueChats.length > 0 && !currentChat) {
      //   setCurrentChat(uniqueChats[0]);
      // }
  
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromDB = async (threadId: string) => {
    try {
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      // Delete from multiple tables
      await sql`
        DELETE FROM checkpoints 
        WHERE metadata->>'thread_id' = ${threadId};
      `;
  
      await sql`
        DELETE FROM checkpoint_blobs 
        WHERE thread_id = ${threadId};
      `;
  
      await sql`
        DELETE FROM checkpoint_writes 
        WHERE thread_id = ${threadId};
      `;
  
    } catch (error) {
      console.error('Error deleting from database:', error);
      throw error;
    }
  };

  // Function to check if enough time has passed since last reload
  const shouldSendRandomRequests = (): boolean => {
    const isFirstVisit = localStorage.getItem('hasVisited') === null;
  
    // First time website visit - send 5 requests
    if (isFirstVisit) {
      localStorage.setItem('hasVisited', 'true');
      return true;
    }

    const lastMessageTime = localStorage.getItem('lastMessageTime');
    // If no messages yet, don't send requests
    if (!lastMessageTime) {
      console.log('⏳ Waiting for first message before sending random requests');
      return false;
    }

    // Check if 4 minutes have passed since last message
    const currentTime = Date.now();
    const fourMinutesInMs = 4 * 60 * 1000; // 4 minutes in milliseconds
    const timeSinceLastMessage = currentTime - parseInt(lastMessageTime);

    if (timeSinceLastMessage >= fourMinutesInMs) {
      return true;
    }

    console.log('⏳ Skipping random requests', {
      lastMessage: new Date(parseInt(lastMessageTime)).toLocaleString(),
      timeUntilNextEligible: `${((fourMinutesInMs - timeSinceLastMessage) / 1000 / 60).toFixed(2)} minutes`
    });
    return false;
  };

  // Function to send random requests
  const sendRandomRequests = async () => {
    const sharedThreadId = 'pinging_123';
    console.log('%c📡 Starting Random Requests Sequence', 'color: #4b0082; font-size: 14px; border-radius: 5px;');
    console.log({
      threadId: sharedThreadId,
      totalRequests: 3,
      startTime: new Date().toLocaleString()
    });
    
    for (let i = 0; i < 3; i++) {
      const requestId = uuidv4();
      console.log('%c🔄 Request ' + (i + 1) + '/3', 'color: #ffa500; font-weight: bold;', {
        requestId,
        threadId: sharedThreadId,
        timestamp: new Date().toLocaleString()
      });
      
      try {
        // const response = await fetch('http://localhost:8000/chat', {
        const response = await fetch('https://resume-api-242842293866.asia-south1.run.app/chat', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            query: "Respond with OKAY only",
            id: requestId,
            threadId: sharedThreadId
          }),
        });
        
        const data = await response.json();
        console.log('%c✅ Request ' + (i + 1) + ' Successful', 'color: #00ff00; font-weight: bold;', { 
          status: response.status,
          response: data,
          requestId,
          threadId: sharedThreadId,
          timestamp: new Date().toLocaleString()
        });
      } catch (error) {
        console.log('%c❌ Request ' + (i + 1) + ' Failed', 'color: #ff0000; font-weight: bold;', {
          error,
          requestId,
          threadId: sharedThreadId,
          timestamp: new Date().toLocaleString()
        });
      }
      
      // Add a small delay between requests
      if (i < 4) { // Don't wait after the last request
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('%c🎉 Random Requests Sequence Completed', 'color: #4b0082; font-size: 14px;border-radius: 5px;',);
    console.log({
      threadId: sharedThreadId,
      completionTime: new Date().toLocaleString(),
      status: 'All requests completed'
    });
  };

  useEffect(() => {
    fetchMessagesFromDB();
    if (shouldSendRandomRequests()) {
      console.log('%c⚡ Sending 3 Random Requests ⚡', 'color: #ffa500; font-size: 14px; border-radius: 5px;');
      sendRandomRequests();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl + Shift + G
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setIsGlobalView(prev => !prev);
        setCurrentChat(null);
        fetchMessagesFromDB();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        // const response = await fetch('http://localhost:8000/chat', {
        const response = await fetch('https://resume-api-242842293866.asia-south1.run.app/chat', {
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
          content: "Sorry, there was an error processing your request. Please try again.",
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

  const deleteChat = (chatId: number) => {
    const chatToDelete = chats.find(chat => chat.id === chatId);
    if (chatToDelete?.threadId) {
      threadStorage.removeThreadId(chatToDelete.threadId);
    }
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* <AnimatedBackground /> */}
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