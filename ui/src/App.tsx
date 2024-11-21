import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft, RefreshCw } from 'lucide-react';
import { Chat, Message, MessageRole, DBQueryResult, convertDBMessagesToChat } from './types';
import ProfileModal from './components/ProfileModal';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv'
import { BackgroundBeams } from "@/components/ui/background-beams";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
            metadata->>'thread_id' as thread_id  -- Added thread_id to selection
          FROM checkpoints c
          INNER JOIN LastSteps ls 
            ON c.metadata->>'thread_id' = ls.thread_id 
            AND (c.metadata->>'step')::integer = ls.max_step
        `;
      } else {
        // If no current chat, get last states of all threads
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
            metadata->>'thread_id' as thread_id  -- Added thread_id to selection
          FROM checkpoints c
          INNER JOIN LastSteps ls 
            ON c.metadata->>'thread_id' = ls.thread_id 
            AND (c.metadata->>'step')::integer = ls.max_step
          LIMIT 30
        `;
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
    const lastReloadTime = localStorage.getItem('lastReloadTime');
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (!lastReloadTime) {
      localStorage.setItem('lastReloadTime', currentTime.toString());
      return true;
    }

    const timeDifference = currentTime - parseInt(lastReloadTime);
    if (timeDifference >= fiveMinutesInMs) {
      localStorage.setItem('lastReloadTime', currentTime.toString());
      return true;
    }

    console.log('⏳ Skipping random requests - Less than 5 minutes since last reload', {
      lastReload: new Date(parseInt(lastReloadTime)).toLocaleString(),
      timeUntilNextEligible: `${((fiveMinutesInMs - timeDifference) / 1000 / 60).toFixed(2)} minutes`
    });
    return false;
  };

  // Function to send random requests
  const sendRandomRequests = async () => {
    const sharedThreadId = 'pinging_123';
    console.log('%c📡 Starting Random Requests Sequence', 'background: #4b0082; color: white; font-size: 14px; padding: 8px; border-radius: 5px;');
    console.log({
      threadId: sharedThreadId,
      totalRequests: 5,
      startTime: new Date().toLocaleString()
    });
    
    for (let i = 0; i < 5; i++) {
      const requestId = uuidv4();
      console.log('%c🔄 Request ' + (i + 1) + '/5', 'color: #ffa500; font-weight: bold;', {
        requestId,
        threadId: sharedThreadId,
        timestamp: new Date().toLocaleString()
      });
      
      try {
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
    
    console.log('%c🎉 Random Requests Sequence Completed', 'background: #4b0082; color: white; font-size: 14px; padding: 8px; border-radius: 5px;');
    console.log({
      threadId: sharedThreadId,
      completionTime: new Date().toLocaleString(),
      status: 'All requests completed'
    });
  };

  const handleSendMessage = async (message: string, chatToUse?: Chat) => {
    if (isLoading) return;
    
    try {
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
  
      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === updatedChat.id);
        const filteredChats = chatExists 
          ? prevChats.filter(c => c.id !== updatedChat.id) 
          : prevChats;
        return [updatedChat, ...filteredChats];
      });
      setCurrentChat(updatedChat);
  
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
      setCurrentChat(chatWithAssistant);
  
      try {
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
        const errorMessage = error.message || String(error);
        
        // Check for SSL error in both error message and response
        const isSSLError = 
          errorMessage.includes('consuming input failed: SSL SYSCALL error: EOF detected') ||
          (error.response?.data === 'consuming input failed: SSL SYSCALL error: EOF detected');

        if (isSSLError) {
          console.log('%c🚨 SSL EOF ERROR DETECTED 🚨', 'background: #ff0000; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
          console.log('%c⚡ Initiating 5 Random Requests to Stabilize Connection ⚡', 'background: #ffa500; color: black; font-size: 14px; padding: 8px; border-radius: 5px;');
          console.log({
            error: errorMessage,
            timestamp: new Date().toLocaleString(),
            action: 'Starting random requests sequence'
          });
          
          await sendRandomRequests();
          
          console.log('%c✅ Random Requests Completed Successfully', 'background: #00ff00; color: black; font-size: 14px; padding: 8px; border-radius: 5px;');
          console.log('%c🔄 Retrying Original Message...', 'background: #0000ff; color: white; font-size: 14px; padding: 8px; border-radius: 5px;');
          
          // Retry the original request after a short delay
          setTimeout(() => {
            console.log({
              action: 'Retrying original message',
              message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
              timestamp: new Date().toLocaleString()
            });
            handleSendMessage(message, chatToUse);
          }, 1000);
          return;
        } else {
          // Handle other errors
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

  useEffect(() => {
    // sendRandomRequests();
    fetchMessagesFromDB();
  }, []);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now(),
      threadId: uuidv4(), // Generate new thread ID only for new chats
      title: initialMessage || 'New Chat',
      messages: []
    };
    
    setChats(prevChats => {
      const updatedChats = [newChat, ...prevChats];
      return updatedChats;
    });
    setCurrentChat(newChat);
  
    if (initialMessage) {
      handleSendMessage(initialMessage, newChat);
    }
  };
  
  return (
    
    <div className="h-screen flex bg-[#0a0b0f] text-gray-100 relative overflow-hidden">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#0a0b0f] rounded-lg hover:bg-[#3A3A3A] transition-colors"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] z-30 transition-transform duration-300 ease-in-out transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          onNewChat={() => createNewChat()}
          onDeleteChat={handleDeleteChat}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full max-w-full">
        <div className="relative h-full">
          <div className="absolute top-4 right-4 z-40">
            <ProfileDropdown />
          </div>
          <ChatArea
            currentChat={currentChat}
            onSendMessage={handleSendMessage}
            createNewChat={createNewChat}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;